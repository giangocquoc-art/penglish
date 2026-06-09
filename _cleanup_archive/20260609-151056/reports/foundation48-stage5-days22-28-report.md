# Foundation48 Stage 5 Days 22-28 Report

## Summary

Implemented Foundation48 Stage 5 for Days 22-28 with practical beginner communication lessons covering modal verbs, conjunctions, time/opposition connectors, and conditional sentences type 1-3. All deep lesson reads remain routed through the shared resolver architecture.

## Changed files

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy.ts`
- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`
- `apps/web/src/features/foundation48/foundation48Data.ts`
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `scripts/foundation48-stage5-days22-28-qa.cjs`
- `reports/foundation48-stage5-days22-28-qa-results.json`
- `reports/foundation48-stage5-days22-28-report.md`

## Implemented Days 22-28 content summary

- Day 22: Động từ khuyết thiếu — `can`, `should`, `must`, `have to`, `may`.
- Day 23: Liên từ `and`, `but`, `or`, `so`, `because`.
- Day 24: Liên từ chỉ thời gian — `before`, `after`, `when`, `while`, `until`.
- Day 25: Liên từ chỉ sự đối lập — `but`, `although`, `however`, `even though`.
- Day 26: Câu điều kiện loại 1 — `If + present simple, will + verb`.
- Day 27: Câu điều kiện loại 2 — `If + past simple, would + verb`.
- Day 28: Câu điều kiện loại 3 — `If + had + V3, would have + V3`.

Each day includes a unique intro goal, beginner-friendly explanation, pattern cards, vocabulary cards, listening overview, listen-and-choose challenges, speaking/shadowing repeat challenges, fill-blank quiz, multiple-choice quiz, sentence-order practice where useful, and completion summary through `buildDeepLesson`.

## UX intro preview changes

`Foundation48DayPage.tsx` now shows a desktop-only intro preview box on complete deep lessons with short lesson counts:

- Từ vựng
- Mẫu câu
- Nghe
- Nói lại
- Mini quiz

The preview is hidden on base/mobile viewports to avoid crowding the compact mobile lesson layout.

## Lazy module/resolver changes

Stage 5 lesson content lives in the dedicated lazy module:

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage5.lazy.ts`

The shared resolver now supports Days 22-28 through dynamic import and caching in:

- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`

No page-local lazy imports were added. Stage 3 and Stage 4 resolver paths were preserved.

## Progress/vocabulary sync notes

Progress contracts were preserved:

- localStorage key: `penglish-foundation48-progress-v1`
- update event: `penglish-foundation48-progress-updated`

Existing progress/vocabulary sync remains resolver-based and can read Days 22-28 through `getFoundation48DeepLesson` / `getFoundation48CachedDeepLesson`.

## Build result

PASS: `npm run build --workspace apps/web`

## New lazy chunk name/size

- `dist/assets/foundation48DeepLessons.stage5.lazy-ixnWbady.js` — 17.74 kB, gzip 5.64 kB

## Playwright QA result

PASS: `node scripts/foundation48-stage5-days22-28-qa.cjs`

- errors: 0
- consoleErrors: 0
- failedRequests: 0
- Stage 5 module observed: `http://127.0.0.1:5180/src/features/foundation48/foundation48DeepLessons.stage5.lazy.ts`

Validated routes/viewports included:

- Roadmap desktop 1440x950
- Roadmap mobile 390x844 and 375x812
- Days 22-28 mobile coverage
- Day 22 desktop and Day 28 desktop intro preview coverage
- Regression routes: Day 13, Day 17, Day 18, Day 21

The QA script checked visible title/content, progress/status indicators, CTA/navigation visibility, mobile bottom-nav visibility/overlap, horizontal overflow, console errors, failed requests, Stage 5 lazy request observation, and desktop intro preview visibility.

## Chrome DevTools QA result

Chrome DevTools MCP manual QA was not completed before context-compaction pressure. Playwright script fallback completed the requested route, viewport, console, network, overflow, bottom-nav, CTA, progress/status, lazy-module, and desktop-preview checks.

## Screenshot list

- `reports/screenshots/foundation48-stage5-roadmap-desktop.png`
- `reports/screenshots/foundation48-stage5-roadmap-mobile.png`
- `reports/screenshots/foundation48-stage5-roadmap-mobile-375.png`
- `reports/screenshots/foundation48-stage5-day22-mobile.png`
- `reports/screenshots/foundation48-stage5-day23-mobile.png`
- `reports/screenshots/foundation48-stage5-day24-mobile.png`
- `reports/screenshots/foundation48-stage5-day25-mobile.png`
- `reports/screenshots/foundation48-stage5-day26-mobile.png`
- `reports/screenshots/foundation48-stage5-day27-mobile.png`
- `reports/screenshots/foundation48-stage5-day28-mobile.png`
- `reports/screenshots/foundation48-stage5-day22-desktop.png`
- `reports/screenshots/foundation48-stage5-day28-desktop.png`
- `reports/screenshots/foundation48-stage5-regression-day13-mobile.png`
- `reports/screenshots/foundation48-stage5-regression-day17-mobile.png`
- `reports/screenshots/foundation48-stage5-regression-day18-mobile.png`
- `reports/screenshots/foundation48-stage5-regression-day21-mobile.png`

## Known risks

- Chrome DevTools MCP-specific manual inspection still needs a follow-up pass if strict MCP evidence is required.
- QA lazy request was observed from the dev server source module path; production build separately confirms the emitted Stage 5 lazy chunk.

## Recommendation for Stage 6 Days 29-34

Continue with a dedicated Stage 6 lazy module for listening-focused lessons, keep the resolver-only architecture, add lightweight roadmap metadata only, and reuse the Stage 5 QA script pattern with Stage 6 route coverage and lazy module detection.