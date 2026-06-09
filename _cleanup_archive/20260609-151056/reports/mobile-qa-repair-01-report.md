# P-English Mobile QA Repair 01

## Scope

PHASE P-ENGLISH-MOBILE-QA-REPAIR-01 focused on real mobile UX repair and strict screenshot QA across the core P-English learning routes. No new lessons were added, no learning data was removed, no paid/pro gate was introduced, and no deployment was performed.

## Repairs completed

- Strengthened the screenshot QA flow in [`capture-lesson-audit-screenshots.cjs`](../scripts/capture-lesson-audit-screenshots.cjs) with mobile/desktop capture, required selector checks, blank-image protection, horizontal overflow metrics, and bottom-nav overlap checks.
- Repaired global mobile bottom-nav safe spacing through the app shell and page-level safe padding.
- Reworked [`VocabPage.tsx`](../apps/web/src/pages/VocabPage.tsx) mobile ordering so search and filters are usable before dense stats/content.
- Compact-polished [`EnglishSpeedPage.tsx`](../apps/web/src/pages/EnglishSpeedPage.tsx) with stable mobile selectors and no horizontal overflow.
- Compact-polished [`ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx), including mobile-safe recording/feedback capture behavior.
- Compact-polished [`LessonPage.tsx`](../apps/web/src/pages/LessonPage.tsx) and removed the mobile-only duplicate bottom pager that overlapped the fixed nav.
- Preserved the ocean/Poo visual direction while keeping background decoration subtle and non-blocking.

## Validation results

- Learning data audit: passed with 0 errors, 0 warnings, 0 quality issues.
- Runtime learning data counts from [`penglish-learning-data-audit.json`](penglish-learning-data-audit.json):
  - runtime lessons: 73
  - generated grammar lesson sources: 24
  - generated reading lesson sources: 46
  - vocabulary items: 452
  - vocabulary groups: 4
  - speech prompts: 101
  - shadowing items: 43
  - roadmap units: 12
- Production build: passed.
- Vite emitted the existing large chunk warning for `vendor-ui`, but the build completed successfully.

## Screenshot QA results

Strict screenshot QA passed for all required route/viewport pairs with no horizontal overflow and no detected mobile bottom-nav overlap.

Captured screenshots:

- [`mobile-qa-repair-home-desktop.png`](screenshots/mobile-qa-repair-home-desktop.png)
- [`mobile-qa-repair-home-mobile.png`](screenshots/mobile-qa-repair-home-mobile.png)
- [`mobile-qa-repair-roadmap-desktop.png`](screenshots/mobile-qa-repair-roadmap-desktop.png)
- [`mobile-qa-repair-roadmap-mobile.png`](screenshots/mobile-qa-repair-roadmap-mobile.png)
- [`mobile-qa-repair-words-desktop.png`](screenshots/mobile-qa-repair-words-desktop.png)
- [`mobile-qa-repair-words-mobile.png`](screenshots/mobile-qa-repair-words-mobile.png)
- [`mobile-qa-repair-english-speed-desktop.png`](screenshots/mobile-qa-repair-english-speed-desktop.png)
- [`mobile-qa-repair-english-speed-mobile.png`](screenshots/mobile-qa-repair-english-speed-mobile.png)
- [`mobile-qa-repair-shadowing-desktop.png`](screenshots/mobile-qa-repair-shadowing-desktop.png)
- [`mobile-qa-repair-shadowing-mobile.png`](screenshots/mobile-qa-repair-shadowing-mobile.png)
- [`mobile-qa-repair-sample-lesson-desktop.png`](screenshots/mobile-qa-repair-sample-lesson-desktop.png)
- [`mobile-qa-repair-sample-lesson-mobile.png`](screenshots/mobile-qa-repair-sample-lesson-mobile.png)

## Commands run

```text
npm.cmd run build
```

```text
$env:ZOO_QA_BASE_URL='http://localhost:4173'; node scripts/capture-lesson-audit-screenshots.cjs
```

## Deployment

No deployment was performed in this phase.
