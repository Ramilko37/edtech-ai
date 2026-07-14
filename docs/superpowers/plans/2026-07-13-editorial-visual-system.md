# Editorial Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Recompose the B2C onboarding, topic selection, generation, and course views as a light editorial learning product without changing their data flow or behaviour.

**Architecture:** Keep the existing `B2CPrototype` phase state machine, OpenRouter requests, and session contracts intact. Consolidate visual decisions into the prototype CSS variables and the two prototype components: the onboarding owns its editorial rail and reading column, while the topic and course phases share the same 1180px shell and paper surfaces.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, `next/font/google`, Lucide, Vitest.

## Global Constraints

- Work only in `/Users/rr/Documents/EdTechAi/.worktrees/codex/openrouter-session-course`.
- Do not change API contracts, `LearnerSnapshot` v3, OpenRouter prompts, session-storage keys, or course-generation behaviour.
- Do not change `/teacher-agent` in this pass.
- Default to the light editorial palette: paper `#F4F0E8`, warm white `#FFFDF8`, ink `#202723`, muted ink `#60675F`, quiet ink `#8A9087`, terracotta `#C65F3C`, dark terracotta `#A94C30`, clay `#F1DED3`, sage `#52705D`, and hairline `#DCD6CB`.
- Use Manrope for body copy and add a Cyrillic-capable Google display font only through `next/font/google`.
- Keep body text at 16px or larger, supporting text at 14px or larger, a `65ch` reading measure, 44px minimum interactive targets, and visible keyboard focus.
- Keep the fixed mobile onboarding action with matching bottom content padding; show the desktop rail from `lg` (1024px) upward.
- Do not introduce gradients, glow, glass, grids, star fields, decorative sparkles, pulse/shimmer/ambient motion, or radii larger than 16px in the B2C prototype.

---

### Task 1: Establish editorial font, tokens, and restrained motion

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `components/prototype/B2CPrototype.tsx:58-124`
- Test: existing session contract tests; visual acceptance captures in Task 4

**Interfaces:**
- Consumes: `PrototypeTheme` (`"light" | "dark"`) from `lib/prototype.ts`.
- Produces: the existing CSS variable names (`--page`, `--text`, `--text-2`, `--text-3`, `--accent`, `--accent-key`, `--accent-tint`, `--accent-tint-2`, `--panel`, `--panel-border`, `--pill`, `--node-rest-bg`, `--node-rest-border`) with editorial values, so all existing prototype markup remains type-compatible.

- [x] **Step 1: Record the non-visual contract before style-only changes**

Run: `npm test -- lib/course-session.test.ts`

Expected: the existing course-session suite passes before styling begins. This redesign does not alter the session reducer, so a new production-behaviour test is not warranted; the visual acceptance captures in Task 4 are the red/green check for this presentation-only task.

- [x] **Step 2: Load the editorial display face and remove global dashboard effects**

In `app/layout.tsx`, import `Lora` alongside `Manrope`, with the same Cyrillic and Latin subsets, `display: "swap"`, and `variable: "--font-editorial"`. Apply both variables to `<body>`:

```tsx
const editorial = Lora({
  subsets: ["cyrillic", "latin"],
  variable: "--font-editorial",
  display: "swap",
});

<body className={`${manrope.variable} ${editorial.variable} font-sans antialiased`}>
```

Replace the global `body` gradient with the paper background, replace selection with clay, add `.prototype-display { font-family: var(--font-editorial), Georgia, serif; }`, and leave only the `onboarding-step` short opacity/translate entrance transition. Its reduced-motion rule must continue setting `animation: none`; delete `dark-grid`, `motion-*`, `prototype-pulse`, `prototype-spin`, grid-overlay, float, shimmer, scan, and soft-pulse keyframes.

- [x] **Step 3: Replace the B2C light/dark variable values without changing variable keys**

Use these light values in `themeVars.light`:

```ts
"--page": "#F4F0E8",
"--text": "#202723",
"--text-2": "#60675F",
"--text-3": "#8A9087",
"--accent": "#C65F3C",
"--accent-key": "#A94C30",
"--accent-tint": "#F1DED3",
"--accent-tint-2": "#D9A38E",
"--panel": "#FFFDF8",
"--panel-border": "#DCD6CB",
"--pill": "#FFFDF8",
"--node-rest-bg": "#FFFDF8",
"--node-rest-border": "#DCD6CB",
"--badge-bg": "#F1DED3",
"--badge-border": "#D9A38E",
"--lesson-grad": "#FFFDF8",
"--course-bg": "#F4F0E8",
"--placeholder": "#8A9087",
"--panel-shadow": "0 8px 20px rgba(32,39,35,0.08)",
"--lesson-shadow": "0 8px 20px rgba(32,39,35,0.08)",
"--chip-shadow": "none",
"--node-rest-shadow": "none",
```

Set the dark theme to `--page: #19221D`, `--text: #FFFDF8`, `--text-2: #D8D8CB`, `--text-3: #AEB4A9`, `--accent: #D97652`, `--accent-key: #F1A487`, `--accent-tint: #3E2A23`, `--panel: #202B25`, `--panel-border: #4A564D`, and the same solid-surface approach. Remove gradient-only variables (`--accent-grad`, `--line`, `--vignette`) and change every remaining primary control to `bg-[var(--accent)] hover:bg-[var(--accent-key)]`.

- [x] **Step 4: Re-run the focused test and type-check via production build**

Run: `npm test -- lib/course-session.test.ts && npm run build`

Expected: the existing reducer test and Next production compilation complete with exit code 0.

- [x] **Step 5: Commit the token foundation**

```bash
git add app/layout.tsx app/globals.css components/prototype/B2CPrototype.tsx lib/course-session.test.ts
git commit -m "feat: establish editorial prototype tokens"
```

### Task 2: Recompose the adaptive onboarding as an editorial worksheet

**Files:**
- Modify: `components/prototype/LearnerOnboarding.tsx`
- Modify: `app/globals.css`
- Test: manual semantic and responsive checks in Task 4

**Interfaces:**
- Consumes: unchanged `onComplete(snapshot: LearnerSnapshot)`, `/api/analyze-learner`, `ProfileAnalysis`, and `createLearnerSnapshot`.
- Produces: the identical four-stage onboarding and completion callback, with radio, switch, fieldset, legend, status, and alert semantics preserved.

- [x] **Step 1: Make the desktop shell, header, rail, and footer follow the 1180px editorial composition**

Replace the outer section and shell classes with this geometry; do not change handlers or state:

```tsx
<section className="relative bg-[var(--page)] text-[var(--text)]">
  <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
    <header className="flex items-center justify-between border-b border-[var(--panel-border)] py-5">
      {/* existing product identity and privacy copy */}
    </header>
    <div className="grid lg:grid-cols-[14rem_minmax(0,47.5rem)] lg:justify-center lg:gap-10">
      <aside className="hidden py-10 lg:block">
        {/* stages and extracted AI context */}
      </aside>
      <form className="flex min-w-0 flex-col">
        {/* mobile progress, main and footer */}
      </form>
    </div>
  </div>
</section>
```

The rail uses a `border-r` only as its right-side separator, does not receive a filled card background, and has a 224px (`14rem`) width. Replace the four circular step badges with compact numeral/check marks on a terracotta left rule; make `AI понимает` plain sentence case and render extracted facts as 14px margin notes separated by `border-t border-[var(--panel-border)]`.

- [x] **Step 2: Replace card-like stage controls with accessible answer rows**

Replace `ChoiceCard` with this solid, one-boundary control while retaining `button`, `role="radio"`, `aria-checked`, and its `onClick` contract:

```tsx
className={`relative flex min-h-14 w-full items-start gap-3 border-b px-1 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] ${
  active
    ? "border-[var(--accent)] bg-[var(--accent-tint)]"
    : "border-[var(--panel-border)] bg-transparent hover:border-[var(--accent)]"
}`}
```

Use a square `Check` marker with `rounded-sm`, terracotta fill only when active, and `text-base` label plus `text-sm` description. The Stage 1 follow-up stays one column below 768px and becomes three readable columns only at `md`; criterion options become two columns only at `md`; daily time becomes three columns only at `md`.

- [x] **Step 3: Apply readable content and surface rules to all four stages**

For every `h1`, add `prototype-display` and keep its `max-w` at `22ch` or less. Set descriptions to `text-base leading-7 text-[var(--text-2)]`, supporting labels to at least `text-sm`, and content widths to `max-w-[65ch]`. Replace all `rounded-[1.4rem]`, `rounded-[1.5rem]`, `rounded-[1.6rem]`, `rounded-[1.65rem]`, and `rounded-2xl` onboarding containers with `rounded-xl` or `rounded-2xl` only where Tailwind's 16px `rounded-2xl` is used; remove nested borders from the textarea shell and the summary/review groups.

The summary becomes an editorial pull quote with only a terracotta `border-l-2`, not a speech bubble. The profile review lists values in a definition-list-like two-column grid with hairline row separators, not independent cards. The error alert must use a dark red (`text-[#8D3028]` on light, controlled through variables if necessary) rather than `text-red-400`, and the disabled CTA needs a non-opacity distinction: `bg-[#C8C2B8] text-[#60675F]`.

- [x] **Step 4: Keep the mobile action usable and make primary controls solid terracotta**

Use `fixed inset-x-0 bottom-0` only below `lg`, with `border-t border-[var(--panel-border)] bg-[var(--page)] px-4 py-3`; retain `pb-28` (or larger) on main content. At `lg`, use the normal in-flow footer aligned to the 760px content column. Both navigation and submission buttons have `min-h-11 rounded-xl`; the submit button uses:

```tsx
className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-key)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:bg-[#C8C2B8] disabled:text-[#60675F] disabled:opacity-100"
```

Remove `Sparkles` from onboarding imports and markup; keep icons only for navigation, status, privacy, and scanning value.

- [x] **Step 5: Run lint-equivalent compilation and inspect semantic regressions**

Run: `npm run build && git diff --check`

Expected: compilation succeeds and the diff check reports no whitespace errors. In the browser, tab through each stage to confirm the focus ring, radio state, profile removal buttons, switch, alert, and status remain exposed.

- [x] **Step 6: Commit the onboarding layout**

```bash
git add components/prototype/LearnerOnboarding.tsx app/globals.css
git commit -m "feat: recompose onboarding as editorial worksheet"
```

### Task 3: Redesign topic, generation, and course views around the shared shell

**Files:**
- Modify: `components/prototype/B2CPrototype.tsx`
- Modify: `app/globals.css`
- Test: existing session contract tests; visual acceptance captures in Task 4

**Interfaces:**
- Consumes: unchanged `PrototypePhase`, `submit`, `restart`, `toggleDay`, `GeneratedCourse`, and session-storage effects.
- Produces: the same topic submission, OpenRouter loading/error flow, course progress toggle, course reset, and theme toggle.

- [x] **Step 1: Remove the constellation canvas and animation state without changing phase transitions**

Delete `canvasPalette`, `NodePoint`, `BuiltCluster`, `Star`, `hexA`, `quietZoneFactor`, `buildClusters`, canvas refs, the `useEffect` canvas loop, hover/camera refs, `onInput` hover behaviour, and `activeCluster`/`activeColor`. In `submit`, keep only the existing validation, request payload, state updates, and `setPhase("assembling")`; remove camera and cluster assignments. In `restart`, retain state resets but remove camera/animation resets. This explicitly removes star fields and ambient decoration while preserving the network contract.

- [x] **Step 2: Replace the topic stage with a paper-shell editorial form**

Render the idle phase as a normal document flow section rather than an absolutely centered overlay:

```tsx
<section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1180px] items-center px-4 py-16 sm:px-6 lg:px-8">
  <div className="w-full max-w-[47.5rem]">
    <p className="text-sm font-medium text-[var(--accent-key)]">Персональная учебная траектория</p>
    <h1 className="prototype-display mt-5 max-w-[16ch] text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] text-[var(--text)]">
      Курс, который говорит на твоем языке
    </h1>
    {/* existing explanatory text, fields, errors and suggestions */}
  </div>
</section>
```

Change the query input to a 16px text `rounded-xl border border-[var(--panel-border)] bg-[var(--panel)]` surface, use the solid primary CTA from Task 2, and make goal/level fields simple labeled rows on the same warm-white surface. Render suggestions as `rounded-lg border border-[var(--panel-border)] bg-transparent` buttons. Remove `Sparkles`, the badge pulse, glass backdrop, and all `prototype-control` absolute positioning; place the theme toggle in the shell header. Default `useState<PrototypeTheme>("light")`.

- [x] **Step 3: Make the loading/error stage compact and static**

Use the same shell with a left terracotta rule and `role="status"` rather than a floating icon. Keep its current explanatory copy and the async state; no spinner animation. Keep the existing error retry action immediately below the topic controls, with `aria-live="polite"`, dark-red text, a hairline border, and a visible `Повторить` button.

- [x] **Step 4: Make the seven-day route primary and passport secondary**

Replace the course two-column dashboard with an editorial document at `max-w-[1180px]` and one desktop `lg:grid-cols-[minmax(0,47.5rem)_14rem]` split. Put the route and first lesson in the main reading column first; render the passport `<aside>` second, then place it on the right at `lg` using `lg:order-2`. The passport is a hairline-separated definition list, not cards; the route title and first lesson heading use `prototype-display`.

Use a single boundary around the route section and each day a `border-t` answer-row-like article. Day indicators are `rounded-md bg-[var(--accent)]`, completed indicators are `bg-[#52705D]`, and completion buttons have `min-h-11 rounded-lg border border-[var(--panel-border)]` with a solid sage selected state. Keep calls to `toggleDay(module.day)` unchanged. Replace all remaining 20px–24px radii, glass backgrounds, gradient variables, and chip animations with the 10–16px editorial geometry. Use a 14px model attribution at the route's end.

- [x] **Step 5: Re-run persistent-session coverage**

Run: `npm test -- lib/course-session.test.ts && npm run build`

Expected: the existing session suite passes and the production build completes with exit code 0.

- [x] **Step 6: Commit the B2C course redesign**

```bash
git add components/prototype/B2CPrototype.tsx app/globals.css lib/course-session.test.ts
git commit -m "feat: redesign course flow with editorial composition"
```

### Task 4: Verify visual, responsive, semantic, and live integration requirements

**Files:**
- Verify: `app/layout.tsx`
- Verify: `app/globals.css`
- Verify: `components/prototype/B2CPrototype.tsx`
- Verify: `components/prototype/LearnerOnboarding.tsx`
- Verify: `app/teacher-agent/page.tsx`

**Interfaces:**
- Verifies: user-visible B2C flow while the course and analysis API interfaces remain unchanged.

- [x] **Step 1: Run full automated checks**

Run: `npm test && npm run build && git diff --check`

Expected: all Vitest tests pass, production build exits 0, and `git diff --check` has no output.

- [x] **Step 2: Run the app and capture the required viewport evidence**

Run: `npm run dev`

At 375px, 768px, 1024px, and 1440px capture the onboarding first stage and topic stage. Verify: 16px mobile gutters, no horizontal scrollbar, no clipped mobile footer, 44px actions, rail hidden below 1024px and visible at/above it, a 1180px maximum outer shell, and a non-stretched 760px reading column.

- [x] **Step 3: Exercise live behaviour without changing provider data**

Complete the real flow: narrative of at least 30 characters → successful OpenRouter analysis → follow-up answer → outcome/time → profile review → choose a topic → successful course generation → toggle a route day → refresh the tab → verify the completed day and course restore. If the provider key is unavailable, record the expected configuration message and additionally exercise the existing generated-course API test suite; do not fabricate a successful provider call.

- [x] **Step 4: Check accessibility and out-of-scope isolation**

At the rendered B2C screen, keyboard-tab through every control and confirm a visible focus state. Confirm labels/fieldset/legend/radio/switch/status/alert semantics still exist in source, normal text is at least 16px, support text is at least 14px, and no prototype class contains `gradient`, `glow`, `backdrop-blur`, `Sparkles`, `prototype-pulse`, `prototype-spin`, or `onboarding-grid`. Open `/teacher-agent` and verify it remains unchanged in `git diff`.

- [x] **Step 5: Commit verification-only fixes, if any**

```bash
git add app/layout.tsx app/globals.css components/prototype/B2CPrototype.tsx components/prototype/LearnerOnboarding.tsx
git commit -m "fix: refine editorial responsive states"
```

Run `git status --short` afterwards. If no source files changed during verification, do not make an empty commit.

## Self-Review

- Scope coverage: Task 1 implements the palette, light default, dark parchment variant, typography, reduced motion, and shared tokens. Task 2 covers the desktop rail, margin-note context, worksheet selection controls, mobile CTA, and onboarding semantics. Task 3 covers topic, loading/error, passport, route, lesson, theme and removal of dashboard decoration. Task 4 checks every specified viewport, OpenRouter flow, persistence, overflow, contrast-oriented surface usage, and `/teacher-agent` isolation.
- Completeness: every changed file, named interface, command, token value, and intended class/markup shape is specified; component internals not listed in a snippet retain their existing event handlers and content.
- Consistency: `B2CPrototype` continues to own `PrototypeTheme`, `PrototypePhase`, session state, topic submission, and course toggles; `LearnerOnboarding` continues to produce exactly `onComplete(snapshot)`.
