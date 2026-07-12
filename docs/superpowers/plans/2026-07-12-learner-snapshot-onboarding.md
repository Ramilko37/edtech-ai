# Learner Snapshot Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a session-only learner onboarding that creates a reusable context snapshot before a user chooses a course topic.

**Architecture:** Pure learner-snapshot validation and storage live in `lib/`. The existing route accepts a validated snapshot together with course-specific input and converts only consented snapshot signals to the OpenRouter prompt. The current prototype conditionally renders onboarding, topic selection, profile editing and generated-course states.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Keep `OPENROUTER_API_KEY` server-only.
- Store snapshot and one course only in `sessionStorage`.
- Do not infer ability, subject mastery or personal attributes from profile fields.
- The snapshot may shape examples, sequence, pace and practice; topic familiarity is per-course.
- Preserve `/teacher-agent` unchanged.

---

### Task 1: Define, validate and persist `LearnerSnapshot`

**Files:**
- Create: `lib/learner-snapshot.ts`
- Create: `lib/learner-snapshot.test.ts`

- [ ] Write tests for a valid snapshot, optional skipped fields, rejected unapproved signals and corrupt storage.
- [ ] Run `npm test -- lib/learner-snapshot.test.ts` and confirm it fails before the module exists.
- [ ] Implement `LearnerSnapshot`, `validateLearnerSnapshot`, `LEARNER_SNAPSHOT_KEY`, `parseLearnerSnapshot` and `createLearnerSnapshot`.
- [ ] Persist only a versioned object with: role, domain, background, dailyReality, primaryGoal, goalHorizon, language, dailyTime, preferredFormat, explanationComplexity, interests and enabledPersonalizationSignals.
- [ ] Re-run the focused test and commit `feat: add learner snapshot storage`.

### Task 2: Make snapshot-aware course generation safe and testable

**Files:**
- Modify: `lib/course.ts`
- Modify: `lib/course.test.ts`
- Modify: `app/api/generate-course/route.ts`
- Modify: `app/api/generate-course/route.test.ts`

- [ ] Add a failing route test that submits a snapshot with a disabled optional field and asserts the outbound OpenRouter body contains allowed signals but not the disabled one.
- [ ] Extend `GenerateCourseInput` with `learnerSnapshot`, `courseGoal?`, and `topicFamiliarity?`; remove the old general-purpose context fields from this contract.
- [ ] Build the user prompt from topic-specific input plus a consent-filtered snapshot; require the model to preserve depth and cite used signals in `whyThisRoute`.
- [ ] Run focused route tests and `npm run build`; commit `feat: personalize course prompts with learner snapshot`.

### Task 3: Build the five-step onboarding and profile review

**Files:**
- Create: `components/prototype/LearnerOnboarding.tsx`
- Modify: `components/prototype/B2CPrototype.tsx`

- [ ] Write an interaction-level acceptance checklist: first visit displays onboarding; optional inputs can be skipped; review allows editing; completed review saves the snapshot and opens topic selection.
- [ ] Implement the five steps: role/background, direction, daily learning reality, interaction preferences, review and consent.
- [ ] Keep each step short, labelled, keyboard-accessible, responsive and equipped with back/progress controls.
- [ ] Use an `onComplete(snapshot)` callback so the parent controls session persistence.
- [ ] Commit `feat: add learner snapshot onboarding`.

### Task 4: Connect profile-first topic choice and validate the full flow

**Files:**
- Modify: `components/prototype/B2CPrototype.tsx`
- Modify: `lib/course-session.ts`
- Modify: `lib/course-session.test.ts`

- [ ] Show the current profile through a `Мой профиль` control with edit/reset-profile actions; resetting a course must not remove the snapshot.
- [ ] Replace goal/context/level fields with topic, course goal and topic familiarity fields after onboarding.
- [ ] Send the snapshot to `/api/generate-course`; preserve it across a reload and reuse it for a second course.
- [ ] Run `npm test`, `npm run build`, and a browser flow covering onboarding → first generation → reload → second topic → profile reset.
- [ ] Commit `feat: generate courses from learner snapshots`.

## Self-Review

- Snapshot data is distinct from per-topic familiarity.
- The API performs consent filtering on the server rather than trusting the browser.
- Course reset preserves profile; profile reset clears its own session key.
- No task adds persistent storage, authentication or a full LMS.
