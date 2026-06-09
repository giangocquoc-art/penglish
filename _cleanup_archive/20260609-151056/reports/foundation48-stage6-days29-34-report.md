# Foundation48 Stage 6 Days 29-34 Report

## Summary

Implemented Foundation48 Stage 6 for Days 29-34 with listening-first beginner lessons. The new stage focuses on recognizing short real-life English for missing words, dictation phrases, time, dates, places, and money.

## Changed files

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy.ts`
- `apps/web/src/features/foundation48/foundation48DeepLessonResolver.ts`
- `apps/web/src/features/foundation48/foundation48Data.ts`
- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
- `apps/web/src/features/foundation48/Foundation48Page.tsx`
- `scripts/foundation48-stage6-days29-34-qa.cjs`
- `reports/foundation48-stage6-days29-34-qa-results.json`
- `reports/foundation48-stage6-days29-34-report.md`

## Implemented Days 29-34 content summary

- Day 29: Luyện nghe điền từ — hear a short sentence and fill the missing keyword.
- Day 30: Luyện nghe chép chính tả — listen slowly and type/write short phrases.
- Day 31: Luyện nghe về giờ — recognize times such as seven, eight thirty, eight fifteen, half past six.
- Day 32: Luyện nghe ngày tháng — recognize Monday, Friday, June, March fifth, next Friday.
- Day 33: Luyện nghe địa điểm — recognize school, bus station, supermarket, airport, office, park.
- Day 34: Luyện nghe về tiền bạc — recognize five dollars, twenty thousand dong, seventy-five cents.

Each day includes unique intro copy, beginner-friendly listening explanation, pattern cards, vocabulary cards, listening overview, listen-and-choose challenges, listening fill/dictation-style fill-blank challenges, speaking/shadowing repeat challenges, fill-blank quiz, multiple-choice quiz, sentence-order practice, and completion summary through `buildDeepLesson`.

## Listening-first design notes

Stage 6 content uses short realistic sentences and phrase-level listening. Explanations avoid long grammar-heavy framing and instead emphasize hearing keywords, numbers, places, dates, and money units.

Examples included:

- `I get up at seven.`
- `The meeting is at eight thirty.`
- `Today is Monday.`
- `My birthday is in June.`
- `I am at the bus station.`
- `It costs five dollars.`
- `The ticket is twenty thousand dong.`

## Mobile compact preview changes

`Foundation48DayPage.tsx` now keeps the existing desktop intro preview and adds a small mobile-only preview line for complete deep lessons:

`6 Từ vựng · 3 Mẫu câu · 5 Nghe · 5 Nói lại · 9 Mini quiz`

The mobile preview uses `data-testid="foundation48-mobile-intro-preview"`, stays compact, and avoids duplicating the large desktop preview box on mobile.

## Roadmap mobile stat overlap fix

`Foundation48Page.tsx` now adds extra mobile safe-area bottom padding:

`pb={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 132px)', lg: '8' }}`

The Stage 6 QA script confirmed no bottom-nav overlap on the roadmap at 390x844 and 375x812.

## Lazy module/resolver changes

Stage 6 content lives in:

- `apps/web/src/features/foundation48/foundation48DeepLessons.stage6.lazy.ts`

The shared resolver now supports Days 29-34 through dynamic import and cache:

- `stage6LazyDayRange = { start: 29, end: 34 }`
- `loadStage6LazyLessons()` imports `./foundation48DeepLessons.stage6.lazy`

Stage 3, Stage 4, and Stage 5 resolver paths were preserved. No page-local lazy imports were added.

## Progress/vocabulary sync notes

Progress contracts were preserved:

- localStorage key: `penglish-foundation48-progress-v1`
- update event: `penglish-foundation48-progress-updated`

Existing resolver-based progress/vocabulary sync can read Stage 6 through `getFoundation48DeepLesson` and `getFoundation48CachedDeepLesson`.

## Build result

PASS: `npm run build --workspace apps/web`

## New lazy chunk name/size

- `dist/assets/foundation48DeepLessons.stage6.lazy-Dxst7C2M.js` — 11.94 kB, gzip 3.95 kB

## Playwright QA result

PASS: `node scripts/foundation48-stage6-days29-34-qa.cjs`

- errors: 0
- consoleErrors: 0
- failedRequests: 0
- Stage 6 module observed: `http://127.0.0.1:5180/src/features/foundation48/foundation48DeepLessons.stage6.lazy.ts`

Validated routes/viewports included:

- Roadmap desktop 1440x950
- Roadmap mobile 390x844 and 375x812
- Days 29-34 mobile coverage
- Day 29 desktop and Day 34 desktop intro preview coverage
- Regression routes: Day 13, Day 17, Day 18, Day 21, Day 22, Day 28

The QA script checked visible title/content, progress/status indicators, CTA/navigation visibility, mobile bottom-nav visibility/overlap, horizontal overflow, console errors, failed requests, Stage 6 lazy request observation, desktop intro preview visibility, and mobile compact preview visibility.

## Chrome DevTools QA result or MCP availability limitation

Chrome DevTools MCP was attempted and failed with the exact availability error:

`Error executing MCP tool: No connection found for server: cW49ZA. Please make sure to use MCP servers available under 'Connected MCP Servers'.`

Because Chrome DevTools MCP was unavailable, Playwright script fallback was used and completed the required route, viewport, console, network, overflow, bottom-nav, CTA, progress/status, lazy-module, desktop-preview, and mobile-preview checks.

## Screenshot list

- `reports/screenshots/foundation48-stage6-roadmap-desktop.png`
- `reports/screenshots/foundation48-stage6-roadmap-mobile.png`
- `reports/screenshots/foundation48-stage6-roadmap-mobile-375.png`
- `reports/screenshots/foundation48-stage6-day29-mobile.png`
- `reports/screenshots/foundation48-stage6-day30-mobile.png`
- `reports/screenshots/foundation48-stage6-day31-mobile.png`
- `reports/screenshots/foundation48-stage6-day32-mobile.png`
- `reports/screenshots/foundation48-stage6-day33-mobile.png`
- `reports/screenshots/foundation48-stage6-day34-mobile.png`
- `reports/screenshots/foundation48-stage6-day29-desktop.png`
- `reports/screenshots/foundation48-stage6-day34-desktop.png`
- `reports/screenshots/foundation48-stage6-regression-day13-mobile.png`
- `reports/screenshots/foundation48-stage6-regression-day17-mobile.png`
- `reports/screenshots/foundation48-stage6-regression-day18-mobile.png`
- `reports/screenshots/foundation48-stage6-regression-day21-mobile.png`
- `reports/screenshots/foundation48-stage6-regression-day22-mobile.png`
- `reports/screenshots/foundation48-stage6-regression-day28-mobile.png`

## Known risks

- Chrome DevTools MCP was unavailable in this environment, so direct DevTools MCP inspection could not be completed.
- The QA lazy request was observed from the dev server source module path; the production build separately confirms the emitted Stage 6 lazy chunk.

## Recommendation for Stage 7 Days 35-38

Continue with a dedicated Stage 7 lazy module for grammar review and beginner communication consolidation. Keep resolver-only loading, add lightweight roadmap metadata, and extend the Stage 6 QA script pattern with Stage 7 routes plus regression checks for Stages 3-6.