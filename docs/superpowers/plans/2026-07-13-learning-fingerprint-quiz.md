# Learning Fingerprint Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the weak learner questionnaire with a five-screen, responsive diagnostic onboarding whose consented signals improve the OpenRouter learning prompt.

**Architecture:** Keep versioned validation and prompt-safe formatting in `lib/learner-snapshot.ts`. Keep all onboarding interaction in the existing prototype component, using typed option metadata and an `onComplete` boundary so `B2CPrototype` remains responsible for session persistence.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React, Vitest, Playwright CLI.

## Global Constraints

- Work only in the existing `codex/openrouter-session-course` worktree.
- Store the learner snapshot only in `sessionStorage`; keep `OPENROUTER_API_KEY` server-only.
- Keep topic familiarity separate from the global learner snapshot.
- Do not infer ability, sensitive attributes, or an innate learning style.
- Preserve `/teacher-agent` and the existing OpenRouter course flow.
- Support desktop, tablet, mobile, keyboard navigation, and reduced-motion preferences.

---

### Task 1: Extend and translate the learner snapshot

**Files:**
- Modify: `lib/learner-snapshot.ts`
- Modify: `lib/learner-snapshot.test.ts`
- Modify: `lib/course.test.ts`
- Modify: `app/api/generate-course/route.test.ts`

**Interfaces:**
- Produces: `LearnerSnapshot` version 2 and `formatLearnerSnapshotForPrompt(snapshot): string[]`.
- Consumes: the existing consent whitelist and validation helpers.

- [x] Add failing tests that require v2 fields (`currentFocus`, `successCriterion`, `studyFrequency`, `learningBarrier`, `supportPreference`), reject invalid values, restore only v2 storage, and translate only enabled signals into Russian prompt lines.
- [x] Run `npm test -- --run lib/learner-snapshot.test.ts app/api/generate-course/route.test.ts` and confirm the new assertions fail against v1.
- [x] Add typed enums and validation for the new fields, add optional `avoidContext`, change the storage key and snapshot version to 2, and implement a label-based consent-filtered prompt formatter.
- [x] Replace route-local raw `key: value` formatting with `formatLearnerSnapshotForPrompt` and update affected fixtures.
- [x] Re-run the focused tests and confirm they pass.

### Task 2: Build the five-screen diagnostic experience

**Files:**
- Replace: `components/prototype/LearnerOnboarding.tsx`
- Modify: `app/globals.css`
- Modify: `components/prototype/B2CPrototype.tsx`

**Interfaces:**
- Consumes: `createLearnerSnapshot()` and all v2 learner enums.
- Produces: `onComplete(snapshot: LearnerSnapshot)` after review and consent.

- [x] Define typed metadata for all answer cards and a form state with meaningful defaults.
- [x] Build the five screens: context, motivation, rhythm, interaction, review.
- [x] Add a desktop live fingerprint rail, mobile progress header, answer cards, optional detail fields, sticky navigation, review editing, and consent group switches.
- [x] Generate a natural-language preview from current choices and pass the corresponding enabled signals to `createLearnerSnapshot`.
- [x] Add focus, hover, reduced-motion, and safe-area styles; ensure 44 px minimum interaction targets.
- [x] Keep the conditional onboarding wrapper inside the prototype theme and font context.
- [x] Run TypeScript/build verification and fix any accessibility or responsive markup problems.

### Task 3: Verify the complete product flow

**Files:**
- Verify: `components/prototype/LearnerOnboarding.tsx`
- Verify: `app/api/generate-course/route.ts`
- Create artifacts only under: `output/playwright/`

**Interfaces:**
- Consumes: the locally running Next.js app and browser session storage.
- Produces: verified desktop and mobile onboarding flows.

- [x] Run `npm test -- --run` and `npm run build` with zero failures.
- [x] Start the app, clear learner session storage, and use Playwright CLI to traverse all five screens.
- [x] Verify editing from review, toggling a consent group, saving, and landing on topic choice.
- [x] Capture desktop and 375 px mobile screenshots under `output/playwright/` and inspect them for overflow, clipped controls, hierarchy, and readable contrast.
- [x] Review the final diff against the design spec, then commit and push `codex/openrouter-session-course`.

## Self-Review

- Spec coverage: all five question blocks, live summary, review editing, consent, session-only persistence, responsive layout, and prompt use are assigned to tasks.
- Placeholder scan: the plan contains no deferred implementation items.
- Type consistency: v2 enum fields flow from validation to form state to consent filtering to the OpenRouter prompt.
