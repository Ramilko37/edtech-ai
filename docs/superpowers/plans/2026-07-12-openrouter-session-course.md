# OpenRouter Session Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a real personalised seven-day learning course through OpenRouter’s free-model router and retain that course plus progress for the lifetime of one browser tab.

**Architecture:** A typed domain module owns input/output validation and session payloads. A Next.js `POST /api/generate-course` route uses the server-only `OPENROUTER_API_KEY` to request structured JSON from `openrouter/free`. The existing client prototype displays the returned course, restores it from `sessionStorage`, and treats the local example routes only as topic suggestions.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Use `openrouter/free` for model selection; never hard-code a provider model as the primary path.
- Keep `OPENROUTER_API_KEY` server-only; do not add a `NEXT_PUBLIC_` form, log it, or persist it in the browser.
- Do not add a database, external authentication, registration, or persistent browser storage.
- Store only one versioned course-session object in `sessionStorage`; delete it on explicit reset and disclose that closing the tab removes it.
- Generate Russian-language structured learning material; it must not claim invented learner facts or do the learner’s work for them.
- Preserve the current `/teacher-agent` demo unchanged.
- A production build must succeed without `OPENROUTER_API_KEY`; missing-key feedback appears only after a generation request.

---

## File Structure

- `lib/course.ts` — shared course input/output types and pure validation/normalisation for model responses.
- `lib/course.test.ts` — unit tests for request and model-response validation.
- `lib/course-session.ts` — browser-safe versioned payload helpers, isolated from React and `window`.
- `lib/course-session.test.ts` — unit tests for serialisation, restoring and progress updates.
- `app/api/generate-course/route.ts` — server-only OpenRouter request, timeout and public error mapping.
- `app/api/generate-course/route.test.ts` — request-handler tests with mocked upstream `fetch`.
- `components/prototype/B2CPrototype.tsx` — form signals, request state, restored-session cabinet and generated-course rendering.
- `.env.example` — non-secret environment variable name.
- `package.json` and `package-lock.json` — Vitest test script and development dependency.

### Task 1: Establish the typed course contract and its red-green tests

**Files:**
- Create: `lib/course.ts`
- Create: `lib/course.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces `GenerateCourseInput`, `GeneratedCourse`, `CourseValidationError`, `validateGenerateCourseInput(value)`, and `parseGeneratedCourse(value, model, generatedAt)`.
- Consumed by `app/api/generate-course/route.ts` and `components/prototype/B2CPrototype.tsx`.

- [ ] **Step 1: Add the test runner without changing application code**

Run:

```bash
npm install --save-dev vitest
npm pkg set scripts.test="vitest run"
```

Expected: `package.json` includes `"test": "vitest run"` and `vitest` is in `devDependencies`.

- [ ] **Step 2: Write the failing contract tests**

Create `lib/course.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseGeneratedCourse, validateGenerateCourseInput } from "./course";

const validPayload = {
  title: "AI для редактора: 7 дней практики",
  passport: [{ label: "Цель", value: "научиться проверять тексты" }],
  whyThisRoute: "Маршрут начинает с задач редактора и добавляет проверку фактов.",
  days: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    title: `День ${index + 1}`,
    objective: "Освоить один небольшой навык.",
    practice: "Выполнить короткое упражнение.",
  })),
  firstLesson: {
    title: "Как сформулировать проверяемый запрос",
    explanation: "Начнём с контекста редакторской задачи.",
    task: "Сформулируйте один запрос для своей заметки.",
    feedbackPrompt: "Проверьте, названы ли цель, ограничения и критерий качества.",
  },
};

describe("validateGenerateCourseInput", () => {
  it("normalises optional learner signals and accepts a non-empty topic", () => {
    expect(validateGenerateCourseInput({
      topic: "  AI для редактора ",
      goal: "  проверять тексты ",
      context: "  редакция ",
      level: "basic",
    })).toEqual({
      topic: "AI для редактора",
      goal: "проверять тексты",
      context: "редакция",
      level: "basic",
    });
  });

  it("rejects a missing topic and an unsupported level", () => {
    expect(() => validateGenerateCourseInput({ topic: "", level: "expert" }))
      .toThrow("Укажите тему обучения");
  });
});

describe("parseGeneratedCourse", () => {
  it("accepts exactly seven ordered course days", () => {
    expect(parseGeneratedCourse(validPayload, "openrouter/free", "2026-07-12T12:00:00.000Z"))
      .toMatchObject({ title: validPayload.title, model: "openrouter/free" });
  });

  it("rejects a model payload that does not contain days one through seven", () => {
    expect(() => parseGeneratedCourse({ ...validPayload, days: validPayload.days.slice(0, 6) }, "openrouter/free", "2026-07-12T12:00:00.000Z"))
      .toThrow("ровно 7 дней");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails because the contract does not exist**

Run: `npm test -- lib/course.test.ts`

Expected: FAIL with a module-not-found error for `./course`.

- [ ] **Step 4: Implement the smallest complete contract**

Create `lib/course.ts` with these exported types and rules:

```ts
export type LearnerLevel = "beginner" | "basic" | "intermediate";
export type GenerateCourseInput = { topic: string; goal?: string; context?: string; level?: LearnerLevel };
export type GeneratedCourse = {
  title: string;
  passport: Array<{ label: string; value: string }>;
  whyThisRoute: string;
  days: Array<{ day: number; title: string; objective: string; practice: string }>;
  firstLesson: { title: string; explanation: string; task: string; feedbackPrompt: string };
  model: string;
  generatedAt: string;
};

export class CourseValidationError extends Error {}
export function validateGenerateCourseInput(value: unknown): GenerateCourseInput;
export function parseGeneratedCourse(value: unknown, model: string, generatedAt: string): GeneratedCourse;
```

Implementation rules: accept only object records; trim strings; limit topic to 240 characters and optional values to 160; permit only the three declared levels; require a non-empty title, one to four passport items, unique numeric days `1` through `7`, and non-empty first-lesson strings. Throw `CourseValidationError` with Russian public messages. Copy only validated fields into the returned object.

- [ ] **Step 5: Run the contract tests to verify the implementation is green**

Run: `npm test -- lib/course.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 6: Commit the independently tested contract**

```bash
git add package.json package-lock.json lib/course.ts lib/course.test.ts
git commit -m "feat: add generated course contract"
```

### Task 2: Add ephemeral course-session helpers and test their lifecycle

**Files:**
- Create: `lib/course-session.ts`
- Create: `lib/course-session.test.ts`

**Interfaces:**
- Consumes `GeneratedCourse` from `lib/course.ts`.
- Produces `COURSE_SESSION_KEY`, `CourseSession`, `createCourseSession(course)`, `toggleCourseDay(session, day)`, `parseCourseSession(value)`.
- Consumed by `components/prototype/B2CPrototype.tsx`.

- [ ] **Step 1: Write the failing session tests**

Create `lib/course-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createCourseSession, parseCourseSession, toggleCourseDay } from "./course-session";
import type { GeneratedCourse } from "./course";

const course: GeneratedCourse = {
  title: "Курс",
  passport: [{ label: "Цель", value: "Понять тему" }],
  whyThisRoute: "Маршрут начинается с базы.",
  days: Array.from({ length: 7 }, (_, index) => ({ day: index + 1, title: `День ${index + 1}`, objective: "Цель", practice: "Практика" })),
  firstLesson: { title: "Урок", explanation: "Объяснение", task: "Задание", feedbackPrompt: "Проверьте ответ" },
  model: "openrouter/free",
  generatedAt: "2026-07-12T12:00:00.000Z",
};

describe("course session", () => {
  it("starts a new session with no completed days", () => {
    expect(createCourseSession(course)).toEqual({ version: 1, course, completedDays: [] });
  });

  it("toggles a valid course day without mutating the original session", () => {
    const initial = createCourseSession(course);
    expect(toggleCourseDay(initial, 3).completedDays).toEqual([3]);
    expect(toggleCourseDay(toggleCourseDay(initial, 3), 3).completedDays).toEqual([]);
    expect(initial.completedDays).toEqual([]);
  });

  it("rejects corrupted or obsolete session data", () => {
    expect(parseCourseSession('{"version":2}')).toBeNull();
    expect(parseCourseSession("not json")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/course-session.test.ts`

Expected: FAIL with a module-not-found error for `./course-session`.

- [ ] **Step 3: Implement the pure session helpers**

Create `lib/course-session.ts`:

```ts
import { parseGeneratedCourse, type GeneratedCourse } from "./course";

export const COURSE_SESSION_KEY = "edtech-ai:course-session:v1";
export type CourseSession = { version: 1; course: GeneratedCourse; completedDays: number[] };

export function createCourseSession(course: GeneratedCourse): CourseSession {
  return { version: 1, course, completedDays: [] };
}

export function toggleCourseDay(session: CourseSession, day: number): CourseSession;
export function parseCourseSession(value: string | null): CourseSession | null;
```

`toggleCourseDay` must return the original session for days outside `1..7`, otherwise return a new session with the sorted day set. `parseCourseSession` must use `JSON.parse`, require `version === 1`, revalidate `course` through `parseGeneratedCourse`, accept only unique completed days that exist in `course.days`, and return `null` for all malformed input. It must not read or write browser storage itself.

- [ ] **Step 4: Run the session tests to verify they pass**

Run: `npm test -- lib/course-session.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit the session boundary**

```bash
git add lib/course-session.ts lib/course-session.test.ts
git commit -m "feat: add session-only course storage"
```

### Task 3: Implement and test the protected OpenRouter route

**Files:**
- Create: `app/api/generate-course/route.ts`
- Create: `app/api/generate-course/route.test.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes `validateGenerateCourseInput` and `parseGeneratedCourse` from `lib/course.ts`.
- Produces `POST(request: Request): Promise<Response>` with `{ course: GeneratedCourse }` on success or `{ error: string }` on failure.
- Consumed by `components/prototype/B2CPrototype.tsx` with `fetch("/api/generate-course", { method: "POST" })`.

- [ ] **Step 1: Write failing route-handler tests**

Create `app/api/generate-course/route.test.ts`. Mock `global.fetch` and `process.env.OPENROUTER_API_KEY`; make a request via `new Request("http://localhost/api/generate-course", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic: "AI для редактора", level: "basic" }) })`. Assert:

```ts
expect(response.status).toBe(200);
expect(await response.json()).toMatchObject({ course: { model: "openrouter/free" } });
expect(fetch).toHaveBeenCalledWith(
  "https://openrouter.ai/api/v1/chat/completions",
  expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer test-key" }) }),
);
```

Also test exact public outcomes: missing key returns `503` and `"Генерация пока не настроена"`; an upstream `429` returns `503` and `"Бесплатная модель сейчас занята. Попробуйте ещё раз."`; and a 200 response with fewer than seven days returns `502` and `"Модель вернула неполную карту. Попробуйте ещё раз."`.

- [ ] **Step 2: Run the route test to verify it fails**

Run: `npm test -- app/api/generate-course/route.test.ts`

Expected: FAIL with a module-not-found error for `./route`.

- [ ] **Step 3: Implement the OpenRouter call with an abort timeout**

Create `app/api/generate-course/route.ts`. The handler must:

```ts
export async function POST(request: Request): Promise<Response>;
```

Parse `await request.json()` and validate it with `validateGenerateCourseInput`; respond `400` with the validation message on invalid data. If `process.env.OPENROUTER_API_KEY` is absent, respond `503` with `"Генерация пока не настроена"`. Send one POST to `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer ${key}`, `Content-Type: application/json`, model `openrouter/free`, `response_format: { type: "json_object" }`, `temperature: 0.5`, and an `AbortSignal.timeout(30_000)`.

The system message must request a Russian JSON object that exactly follows the `GeneratedCourse` fields except `model` and `generatedAt`; it must demand seven numbered days, non-sensitive voluntary context only, transparent personalisation reasons, and educational work that the learner completes themselves. Parse `choices[0].message.content` as JSON, pass it to `parseGeneratedCourse`, read the upstream model id from `body.model ?? "openrouter/free"`, and set `generatedAt` with `new Date().toISOString()`.

Map upstream `429`, aborts and all other upstream failures to short public messages without forwarding upstream bodies. Do not log request bodies, headers or the key. Include `.env.example` exactly as:

```dotenv
OPENROUTER_API_KEY=
```

- [ ] **Step 4: Run route tests and the production build**

Run:

```bash
npm test -- app/api/generate-course/route.test.ts
npm run build
```

Expected: route tests PASS; Next.js build completes without an `OPENROUTER_API_KEY` value.

- [ ] **Step 5: Commit the server boundary**

```bash
git add app/api/generate-course/route.ts app/api/generate-course/route.test.ts .env.example
git commit -m "feat: generate courses through OpenRouter"
```

### Task 4: Wire the prototype to generation and the session-only cabinet

**Files:**
- Modify: `components/prototype/B2CPrototype.tsx:1-778`

**Interfaces:**
- Consumes `GeneratedCourse` and `GenerateCourseInput` from `lib/course.ts`, plus `COURSE_SESSION_KEY`, `CourseSession`, `createCourseSession`, `parseCourseSession`, and `toggleCourseDay` from `lib/course-session.ts`.
- Consumes the route in Task 3 via the defined JSON response.
- Produces a working on-page generator and session-only personal cabinet.

- [ ] **Step 1: Add a failing manual acceptance script before modifying the component**

Run `npm run dev`, open `/`, and record these expected failures in the pull-request description: no goal/context/level controls exist; submitting never calls `/api/generate-course`; reloading loses a generated response; and day cards have no completion action. Stop the server after recording the baseline.

- [ ] **Step 2: Replace deterministic course state with generated-session state**

In `B2CPrototype.tsx`, add state for `goal`, `context`, `level`, `session`, `generationError`, and `isGenerating`. On mount, call `parseCourseSession(window.sessionStorage.getItem(COURSE_SESSION_KEY))` and set the restored result. Add an effect that writes `JSON.stringify(session)` when present and removes `COURSE_SESSION_KEY` when session is `null`.

Change `submit` to build `GenerateCourseInput`, set `phase` to `"assembling"`, call the Task 3 route, set `session` to `createCourseSession(body.course)` on `response.ok`, and then set `phase` to `"course"`. On a non-success or JSON failure, set `generationError` from the public `error` field, return to `"idle"`, and never substitute `prototypeCourses` as a result. Retain `routeKey` only to select the visual constellation and retain suggestion chips as form-fill shortcuts.

- [ ] **Step 3: Add the compact learner signals and clear request feedback**

Below the existing topic input, render optional labelled controls: a goal text input, context text input, and a native select with values `beginner`, `basic`, `intermediate`. The submit button is disabled while `isGenerating` or when the trimmed topic is empty. Update the assembling copy to include `"Генерируем на бесплатной модели OpenRouter"`. Render `generationError` as an `aria-live="polite"` alert near the form with a retry button that reruns the current valid input.

- [ ] **Step 4: Render the generated course and cabinet progress**

When `session` exists, map `session.course.passport`, `session.course.whyThisRoute`, `session.course.days`, and `session.course.firstLesson` into the current cards. Add a visible `"Мой курс"` control which opens the current course when a session exists. Each day card gets a button whose label is `"Отметить выполненным"` or `"Снять отметку"`; its handler updates state with `toggleCourseDay(session, day.day)`. Show `N из 7 дней выполнено` and a text notice: `"Карта хранится только в этой вкладке и исчезнет после её закрытия."`.

The explicit reset action must call `setSession(null)`, clear all learner form fields, return visual state to idle and remove the session key through the persistence effect. Render the upstream `course.model` only as `"Создано с OpenRouter: {model}"`; do not expose keys or request metadata.

- [ ] **Step 5: Verify the full UI flow locally**

Run:

```bash
npm test
npm run build
npm run dev
```

With a locally configured `.env.local`, generate a course on `/`; verify seven real generated days, reload the page and verify the course/progress survive, mark day 1 complete and reload, press reset and verify the cabinet clears. Open the same URL in a new tab and verify no course appears there. Stop the server afterwards.

- [ ] **Step 6: Commit the integrated prototype**

```bash
git add components/prototype/B2CPrototype.tsx
git commit -m "feat: show generated session learning courses"
```

## Self-Review

- Spec coverage: Task 1 covers typed and safe model data; Task 2 covers versioned session-only persistence; Task 3 covers the protected free-model generation route, key isolation, timeout, errors and configuration; Task 4 covers personalisation inputs, generation states, cabinet, progress, reset and end-to-end verification.
- Placeholder scan: no tasks defer behaviour; every test, command and public error string is defined above.
- Type consistency: `GeneratedCourse` is created only by `parseGeneratedCourse`, stored in `CourseSession`, returned as `{ course }` by `POST`, and read by the component. Day completion uses the same numeric `day` defined by the course contract.
