# Editorial Visual System Redesign

## Goal

Replace the prototype's generic AI-dashboard aesthetic with a calm, credible educational product. Improve desktop composition while preserving the working adaptive onboarding, OpenRouter integration, session persistence, topic selection, and generated course flow.

## Chosen Direction

The product uses a warm editorial language inspired by contemporary educational publishing rather than AI tooling. The memorable quality is the feeling of a thoughtfully edited personal workbook: generous paper-like space, strong typography, restrained controls, and personal context shown as annotations rather than glowing data cards.

## Scope

The redesign applies to the complete B2C prototype:

- adaptive onboarding;
- topic and goal selection;
- generation and error states;
- learning passport;
- seven-day route and first lesson;
- theme tokens shared by these screens.

The API contracts, onboarding stages, learner snapshot v3, course generation, and session storage behavior do not change.

## Palette

The default theme becomes light.

| Token role | Value | Use |
| --- | --- | --- |
| Paper | `#F4F0E8` | Page background |
| Warm white | `#FFFDF8` | Primary surfaces and inputs |
| Ink | `#202723` | Headings and primary text |
| Muted ink | `#60675F` | Body copy |
| Quiet ink | `#8A9087` | Metadata |
| Terracotta | `#C65F3C` | Primary actions and active progress |
| Terracotta dark | `#A94C30` | Hover and high-contrast accent text |
| Clay tint | `#F1DED3` | Selected states |
| Sage | `#52705D` | Success and completed learning states |
| Hairline | `#DCD6CB` | Deliberate separators |

There are no purple gradients, cyan glow, glass panels, luminous borders, star fields, or grid overlays. Gradients are replaced by solid colors. Shadows are sparse and resemble lifted paper rather than floating software panels.

The optional dark theme becomes an ink-and-parchment variant: near-black green ink background, warm cream text, terracotta accent. It must retain the same restrained editorial geometry.

## Typography

- Keep Manrope for body copy to avoid a new font dependency and preserve Cyrillic quality.
- Add a characterful editorial display face with Cyrillic support through `next/font/google` for major headings only.
- Use sentence case rather than excessive uppercase labels.
- Maintain body text at 16px or larger and a maximum reading measure of roughly 65 characters.
- Reduce tracking on navigation and remove most letter-spaced micro-labels.

## Desktop Composition

The application uses a centered fluid shell capped at `1180px`.

Onboarding desktop layout:

- a slim `220–240px` progress rail;
- a readable main column capped around `760px`;
- the rail aligns with content rather than extending as a full-height dashboard sidebar;
- the header is part of the centered shell, not a full-width control bar;
- the footer action aligns to the content column and does not span the viewport;
- section height follows content instead of forcing empty `100vh` expanses.

The AI-understood context in the rail is presented as short editorial margin notes separated by rules. It is not a stack of cards.

Topic selection and course views use the same shell and reading measures. The learning passport is secondary to the route, not a competing dashboard column.

## Component Geometry

- Corner radii range from `10px` to `16px`; large `24–28px` rounded containers are removed.
- One visible boundary per semantic group; nested borders are avoided.
- Choice controls read like answer rows or workbook selections rather than tiles.
- Active selections use a clay background and terracotta rule/check, not glow.
- Primary buttons are solid terracotta with a restrained dark hover.
- Icons are used only when they improve scanning; decorative sparkles are removed.

## Responsive Behavior

The implementation remains mobile-first and uses the existing Tailwind breakpoints.

- `375px`: single column, 16px gutters, 44px minimum targets, fixed bottom CTA with safe content padding.
- `768px`: wider reading column; answer choices may use two columns only when their copy remains readable.
- `1024px`: progress rail appears and content remains centered.
- `1440px`: shell stops growing at 1180px; no stretched form fields or excessive empty sides.

There must be no horizontal overflow, clipped footer, or text smaller than 14px. The main body copy remains at least 16px.

## Motion

Motion is limited to one short entrance transition per stage and subtle selection feedback. Pulsing icons, floating gradients, shimmer, and ambient animated decoration are removed. Reduced-motion behavior remains supported.

## Accessibility

- Maintain visible keyboard focus on every interactive element.
- Preserve radio, switch, fieldset, legend, and status semantics.
- Ensure text and controls meet WCAG AA contrast on paper and ink surfaces.
- Preserve clear disabled and loading states without relying on opacity alone.

## Verification

- Run the existing Vitest suite and production build.
- Complete the onboarding through a real OpenRouter analysis.
- Inspect screenshots at 375, 768, 1024, and 1440px.
- Verify the topic screen and generated course use the new shared tokens.
- Check for horizontal overflow, footer overlap, low-contrast text, and console errors.

## Non-Goals

- No change to onboarding questions or OpenRouter prompts.
- No new backend or persistence layer.
- No new illustration or image-generation dependency.
- No redesign of `/teacher-agent` in this pass.
