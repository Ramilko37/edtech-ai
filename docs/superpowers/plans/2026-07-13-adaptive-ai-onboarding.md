# Adaptive AI Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static quiz with a four-stage OpenRouter-powered learner interview and a smaller v3 session snapshot.

**Architecture:** A pure profile-analysis module validates both user input and model JSON. A dedicated Next.js route calls the existing OpenRouter free router; the onboarding component owns only UI state and hands a validated v3 snapshot back to `B2CPrototype` for session persistence.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, OpenRouter, Vitest.

## Global Constraints

- Work in `codex/openrouter-session-course` only.
- Keep `OPENROUTER_API_KEY` server-only.
- Store profile data only in `sessionStorage`.
- Use no preselected quiz answers.
- Keep topic familiarity and course goal outside the global learner snapshot.
- Preserve `/teacher-agent` and existing course generation.

---

### Task 1: Profile analysis contract and route

**Files:**
- Create: `lib/profile-analysis.ts`
- Create: `lib/profile-analysis.test.ts`
- Create: `app/api/analyze-learner/route.ts`
- Create: `app/api/analyze-learner/route.test.ts`

**Interfaces:**
- Produces: `validateProfileNarrative(value)`, `parseProfileAnalysis(value)`, `ProfileAnalysis`.
- Route accepts `{ narrative: string }` and returns `{ analysis, model }`.

- [ ] Write failing tests for narrative bounds, exactly three follow-up choices, valid route output, one structural retry, missing key and rate-limit errors.
- [ ] Run focused tests and confirm failures are caused by the missing module and route.
- [ ] Implement the pure validators and OpenRouter route with JSON-only prompting and one structural retry.
- [ ] Re-run focused tests until green.

### Task 2: Learner snapshot v3

**Files:**
- Modify: `lib/learner-snapshot.ts`
- Modify: `lib/learner-snapshot.test.ts`
- Modify: `lib/course.ts`
- Modify: `lib/course.test.ts`
- Modify: `app/api/generate-course/route.test.ts`

**Interfaces:**
- Produces: `LearnerSnapshot` version 3 and readable consent-filtered prompt lines.
- Consumes: structured values from `ProfileAnalysis` and the user's follow-up answer.

- [ ] Write failing tests for v3 storage, required intentional choices, rejected v2 data and readable prompt formatting.
- [ ] Run focused tests and confirm they fail against v2.
- [ ] Implement the v3 contract, validation and formatting; update course fixtures and version construction.
- [ ] Re-run focused tests until green.

### Task 3: Four-stage AI interview UI

**Files:**
- Replace: `components/prototype/LearnerOnboarding.tsx`
- Modify: `app/globals.css`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `/api/analyze-learner`, `ProfileAnalysis`, `createLearnerSnapshot`.
- Produces: `onComplete(snapshot: LearnerSnapshot)` only after explicit review.

- [ ] Build narrative, AI follow-up, contract and review stages without default answers.
- [ ] Add loading, retry and error states for the live profile analysis.
- [ ] Add responsive editorial layout, four-segment progress, mobile fixed CTA and accessible controls.
- [ ] Keep extracted context editable by returning to the narrative and removable on review.

### Task 4: Verification and delivery

**Files:**
- Verify all modified files.

**Interfaces:**
- Produces: pushed `codex/openrouter-session-course` commit.

- [ ] Run all tests, production build and `git diff --check`.
- [ ] Complete the live browser flow at desktop and 375 px mobile.
- [ ] Verify one real OpenRouter profile analysis and one generated course.
- [ ] Commit and push the branch without merging or deleting the worktree.

## Self-Review

- The flow collects stable person-level context before topic selection and defers topic-specific diagnosis.
- No answer is silently selected.
- The profile analyzer and course generator remain separate testable boundaries.
- Failure handling never exposes the API key or raw provider response.
