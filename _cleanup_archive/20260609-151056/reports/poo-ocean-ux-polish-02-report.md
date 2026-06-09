# PHASE POO-OCEAN-UX-POLISH-02 Report

## Scope

Polished the current P-English ocean UI without deployment, without expanding lesson content, without removing learning data, and without adding paid/pro gates.

## Files changed

- [`apps/web/src/components/p-english/PooSwimLayer.tsx`](../apps/web/src/components/p-english/PooSwimLayer.tsx)
- [`apps/web/src/components/p-english/OceanPageShell.tsx`](../apps/web/src/components/p-english/OceanPageShell.tsx)
- [`apps/web/src/components/p-english/OceanBackdrop.tsx`](../apps/web/src/components/p-english/OceanBackdrop.tsx)
- [`apps/web/src/pages/ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx)
- [`apps/web/src/pages/LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx)
- [`apps/web/src/pages/LearningPathPage.tsx`](../apps/web/src/pages/LearningPathPage.tsx)
- [`apps/web/src/pages/EnglishSpeedPage.tsx`](../apps/web/src/pages/EnglishSpeedPage.tsx)
- [`apps/web/src/pages/VocabPage.tsx`](../apps/web/src/pages/VocabPage.tsx)
- [`apps/web/src/pages/ProfilePage.tsx`](../apps/web/src/pages/ProfilePage.tsx)
- [`scripts/poo-polish-browser-qa.cjs`](../scripts/poo-polish-browser-qa.cjs)
- Generated/updated audit artifacts:
  - [`reports/penglish-learning-data-audit.json`](penglish-learning-data-audit.json)
  - [`reports/penglish-learning-data-audit.md`](penglish-learning-data-audit.md)

## Poo background layer changes

- Reduced main Poo background size into the requested range:
  - mobile: around 76–88px
  - desktop: around 124–148px
- Reduced opacity into the requested range:
  - mobile: around 0.14–0.20 during animation
  - desktop: around 0.20–0.30 during animation
- Removed negative mobile offset so Poo is not cropped by card edges.
- Kept Poo behind content in the page shell layer, clipped by viewport/page shell rather than cards.
- Switched movement to transform-only `x`, `y`, and `rotation` animation with `force3D`.
- Slowed swimming duration for a calmer background feel.
- Reduced baby Poo size and opacity so they remain subtle.
- Preserved reduced-motion behavior with static low-opacity placement.

## Glass UI changes

- Updated shared ocean tokens to use lighter translucent surfaces and softer shadows.
- Added consistent `.penglish-glass-card` styling in the ocean page shell:
  - translucent white background in the 0.72–0.86 range
  - `blur(14px) saturate(1.1)` backdrop filtering
  - soft blue/white translucent border
  - lower-opacity shadow
- Applied the glass treatment across key ocean pages:
  - Dashboard/shared cards via shared tokens
  - Roadmap cards and metrics
  - Lesson hero, step nav, section cards, metrics, coach card, bottom controls
  - Shadowing hero, practice card, feedback panel, collapsible side panels
  - English Speed hero, practice card, coach/focus cards, result panel
  - Vocabulary hero, filter/guidance cards, mobile word cards, empty states, desktop table, footer card

## Shadowing mobile changes

- Reduced first-screen density by compacting the hero and hiding non-critical hero chips/workflow on smaller screens.
- Kept the mobile first screen focused on:
  - compact page title
  - active lesson title
  - current sentence
  - listen/replay/record controls
  - AI feedback panel after recording
- Moved secondary panels into collapsible native details sections:
  - `Chọn bài Shadowing`
  - `Transcript`
  - `Tự tạo transcript`
  - `Video tham khảo`
- Constrained YouTube fallback height:
  - desktop fallback around 220–240px with max 260px
  - mobile fallback max 200px
- Preserved fallback copy:
  - `Video này không cho phát trực tiếp trong web. Bạn vẫn có thể luyện bằng transcript bên dưới.`
- Preserved CTA:
  - `Mở trên YouTube`
- Screenshot QA verified no horizontal overflow, visible Poo layer, compact fallback sizing, and no detected bottom-nav button overlap.

## Lesson mobile changes

- Kept all 7 lesson steps:
  - `Tổng quan`
  - `Từ vựng`
  - `Mẫu câu`
  - `Luyện tập`
  - `Nghe / Nói`
  - `Quiz`
  - `Review`
- Made only the active step content prominent by rendering the selected section content.
- Added sticky mobile step progress/control card.
- Added consistent `Tiếp tục` and `Quay lại` controls near the sticky step nav and at the bottom of the active content.
- Hid the long plan card on mobile to reduce density.
- Limited mobile vocabulary grid height with scroll instead of deleting or trimming learning data.
- Kept lesson data and all practice-mode routing intact.

## Roadmap density changes

- Kept all units visible.
- Shortened roadmap hero description.
- Reduced unit-card hierarchy to:
  - level
  - unit title
  - one short purpose line
  - next action
- Moved longer notes behind native `details` blocks.
- Reduced secondary badges and metadata density.
- Kept Poo/turtle ocean assets subtle and non-dominant.

## Free-first wording cleanup

- Removed visible `VIP` wording from the profile badge and changed it to `Tài khoản`.
- Re-ran wording search. Remaining matches are internal implementation/model names or unrelated source identifiers, such as `LOCAL_PROGRESS_UPDATED_EVENT`, `isVip`, `vipExpiresAt`, and non-P-English pages/components.
- No new paid/pro gates were added.
- Existing learning data fields were left intact to avoid breaking stored user data compatibility.

## Validation and build results

All requested validation commands passed:

- `npm.cmd run audit:learning-data`
  - Passed.
  - Result: errors 0, warnings 53, quality issues 0.
- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit`
  - Passed.
- `npm.cmd run validate:lessons`
  - Passed for 1 fixture lesson.
- `npm.cmd run build`
  - Passed.
  - Build warning remains: one Vite chunk is larger than 500kB after minification. This is pre-existing/general bundle-size guidance and not a functional failure.

## Screenshot QA

Created and ran [`scripts/poo-polish-browser-qa.cjs`](../scripts/poo-polish-browser-qa.cjs).

QA covered:

- console errors
- page errors
- failed requests, excluding YouTube/ytimg/googlevideo/favicon noise
- horizontal overflow
- Poo swim layer existence and visibility
- Poo swim layer size range
- bottom nav overlap heuristic on mobile
- Shadowing desktop/mobile fallback sizing
- Lesson step controls and all 7 step labels
- Shadowing collapsible mobile panels

QA passed for 9 screenshots.

Screenshot paths:

- [`reports/screenshots/poo-polish-home-desktop.png`](screenshots/poo-polish-home-desktop.png)
- [`reports/screenshots/poo-polish-roadmap-desktop.png`](screenshots/poo-polish-roadmap-desktop.png)
- [`reports/screenshots/poo-polish-lesson-desktop.png`](screenshots/poo-polish-lesson-desktop.png)
- [`reports/screenshots/poo-polish-shadowing-desktop.png`](screenshots/poo-polish-shadowing-desktop.png)
- [`reports/screenshots/poo-polish-speed-desktop.png`](screenshots/poo-polish-speed-desktop.png)
- [`reports/screenshots/poo-polish-home-mobile.png`](screenshots/poo-polish-home-mobile.png)
- [`reports/screenshots/poo-polish-lesson-mobile.png`](screenshots/poo-polish-lesson-mobile.png)
- [`reports/screenshots/poo-polish-shadowing-mobile.png`](screenshots/poo-polish-shadowing-mobile.png)
- [`reports/screenshots/poo-polish-speed-mobile.png`](screenshots/poo-polish-speed-mobile.png)

## Remaining issues

- Vite still reports a non-blocking large chunk warning for `vendor-ui` after production build.
- The learning data audit still reports 53 warnings, with 0 errors and 0 quality issues. This phase did not alter or expand lesson content.
- Some non-target app areas still use older opaque card styles, especially outside the P-English ocean shell/practice surfaces. They were not changed because this phase focused on current P-English ocean pages and requested surfaces.

## Readiness recommendation

P-English is ready to proceed to the next big lesson expansion phase from a UI foundation standpoint.

Recommended guardrails for the expansion phase:

- Keep the free-first wording rules in place.
- Add lesson content through data modules/fixtures only, not through UI hardcoding.
- Re-run `npm.cmd run audit:learning-data`, `npm.cmd run validate:lessons`, TypeScript, build, and targeted browser QA after each lesson batch.
- Keep the new glass and mobile-density patterns as the default layout standard for future lesson pages.

## Deployment

No deployment was performed.
