# Agents Context: EdTech AI B2C Prototype

## Product Goal

This project is a B2C prototype for a GenAI learning platform. The prototype should prove one narrow hypothesis:

> A user feels that the course was made specifically for them when the explanation, examples, assignments, and route are rebuilt around their profession, interests, experience, language, goal, and life context.

The goal is not to prove that AI can generate any course. The goal is to demonstrate deep context-aware personalization: "Курс, который говорит на твоем языке".

## Current App Shape

- Framework: existing Next.js App Router app with TypeScript and Tailwind.
- Homepage `/`: owns the interactive B2C prototype based on the supplied HTML prototype.
- `/teacher-agent`: isolated frontend demo of the Teacher Agent v1 contract.
- `docs/agents/teacher-agent-v1.md`: detailed Teacher Agent v1 behavior/spec.
- This file: high-level context for future agents and developers.

Do not scaffold another Next.js app inside this repo. Extend the existing app.

## Prototype Behavior

The homepage prototype is a frontend-only simulation. It intentionally has no backend, auth, persistence, analytics, payment, or real LLM call in this pass.

Core interactions:

- dark/light theme toggle;
- animated canvas constellation background;
- topic input, Enter submit, and suggestion chips;
- route detection for:
  - AI literacy for work;
  - critical thinking / philosophy;
  - computer science from zero;
- transition from idle hero to route assembling to course result;
- 7-day personalized route;
- learning passport;
- explanation of why this route was selected;
- first adapted lesson;
- practical task;
- feedback prompt;
- restart to build another course.

The original HTML prototype included these key content primitives:

- AI-методист identity;
- headline: "Курс, который говорит на твоем языке";
- input-first onboarding;
- suggestions such as AI-грамотность, философия, критическое мышление, информатика;
- route cards for AI, critical thinking, and computer science;
- passport fields: goal, level, context, format;
- visible explanation layer for why the route is personalized.

## V1 Scope From Roadmap

P0 scope for the working prototype:

- landing / first screen that explains value quickly;
- short onboarding signal via topic input and profile hints;
- learning passport;
- 7-day route generator;
- first lesson with ordinary-vs-personalized framing;
- AI tutor behavior represented through prompts/feedback copy;
- practical assignment tied to the learner context;
- feedback and next-step CTA;
- waitlist/paywall can be simulated later.

P1 and out-of-scope for this pass:

- multiple saved routes;
- repeated diagnostics;
- tone/depth controls;
- PDF export;
- referral mechanics;
- detailed analytics;
- full LMS behavior;
- marketplace;
- SCORM/xAPI;
- social feed;
- fine-tuning;
- required sensitive data collection;
- arbitrary file upload.

## AI Chain Roles

Future backend/AI work should keep the methodical chain explicit. Generation should never be only "nice text"; every module should be able to explain why a route, example, assignment, or order was chosen.

| Component | Role | Input | Output |
|---|---|---|---|
| Profile Analyzer | Analyze learner context | Profession, goal, interests, experience | Learning passport |
| Diagnostic Evaluator | Determine start level | Diagnostic answers | Level, gaps, recommendations |
| Learning Path Generator | Build route | Topic, profile, diagnostics | 7-day plan with reasons |
| Lesson Adapter | Rebuild lesson | Base material and profile | Personalized lesson |
| Tutor Prompt | Guide dialog | Lesson, profile, question | Tutor answer |
| Assessment Checker | Check practice | User answer and rubric | Feedback and next step |

## Safety And Privacy Defaults

- Do not require sensitive attributes for personalization.
- Let users understand which profile fields are used and why.
- Give users a way to ignore or disable personalization parameters in later versions.
- Use approved content/RAG before expanding into open-ended generation.
- Do not present generated output as guaranteed factual truth for fresh, high-risk, or disputed topics.
- Do not build features that help users cheat on tests or submit work they did not understand.
- The prototype should teach and check understanding, not complete the learner's work for them.

## Success Metrics

The roadmap treats the prototype as a product and marketing test. Useful signals:

- 20-30% landing-to-onboarding conversion;
- 40-60% onboarding completion;
- 70%+ route generation completion among onboarded users;
- 50%+ users say the result feels personally relevant;
- 50%+ complete the first lesson;
- 15-25% leave email/waitlist;
- clear payment or return intent from interviews.

## Implementation Notes For Future Agents

- Keep homepage work in the prototype component and its data module unless the feature genuinely belongs elsewhere.
- Preserve the current `/teacher-agent` route as an isolated Teacher Agent v1 demo.
- Keep generated route behavior deterministic until backend/LLM orchestration exists.
- If adding real AI, create a separate orchestration layer and keep model/client initialization build-safe.
- Prefer small, typed data structures for courses, profile fields, route modules, tasks, rubrics, and fallback copy.
- Avoid turning the prototype into a full LMS before the personalization hypothesis is validated.
