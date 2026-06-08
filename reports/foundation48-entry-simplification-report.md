# Foundation48 entry simplification report

## Summary

Redesigned the “48 ngày lấy gốc” overview into a calmer beginner-first journey. The page now emphasizes one obvious next action, a large “Hôm nay học” card, a simple 7-day weekly path, and a collapsed compact all-days list.

The existing 48-day data model, routes, progress state, lock logic, and day lesson flow remain intact.

## Changed files

- [`apps/web/src/features/foundation48/Foundation48Page.tsx`](../apps/web/src/features/foundation48/Foundation48Page.tsx) — simplified the overview shell, removed dense dashboard metrics/review blocks from the first screen, added one primary CTA card, short header copy, single example sentence, and a calmer progress summary.
- [`apps/web/src/features/foundation48/Foundation48Roadmap.tsx`](../apps/web/src/features/foundation48/Foundation48Roadmap.tsx) — replaced the default 48-card grid with a 7-day weekly path and a collapsed compact all-days section.
- [`scripts/foundation48-entry-simplification-qa.cjs`](../scripts/foundation48-entry-simplification-qa.cjs) — added visual/UX regression QA for CTA visibility, collapsed all-days behavior, 7-day path, expanded compact list, console errors, and horizontal overflow.
- [`reports/foundation48-entry-simplification-qa-results.json`](./foundation48-entry-simplification-qa-results.json) — generated QA result artifact.
- [`reports/foundation48-release-qa-results.json`](./foundation48-release-qa-results.json) — refreshed Foundation48 release QA artifact after the UI change.

## UX simplified

### Before

The overview presented many cards and dense lesson metadata at once. Desktop showed the full multi-day roadmap immediately, and mobile exposed stage/card density early. This made the next action less obvious for absolute beginners.

### After

The first screen now has a single visual hierarchy:

1. Header: “48 ngày lấy gốc”
2. Short subtitle: “Mỗi ngày 5 phút. Học từng bước.”
3. Main card: “Hôm nay học” + `Ngày X` + short title + one example sentence
4. One primary CTA: “Bắt đầu học” or “Học tiếp hôm nay”
5. Progress summary: `X/48 ngày`
6. Weekly path: 7 dots/cards for the current week
7. Secondary collapsed section: “Xem tất cả ngày học”

Long descriptions, grammar notes, tags, source details, and step-level learning information are no longer shown on the main overview. Those remain inside the day detail flow.

## Preserved behavior

- Route preserved: [`/luyen-tieng-anh/48-ngay-lay-goc`](../apps/web/src/App.tsx)
- Day route preserved: [`/luyen-tieng-anh/48-ngay-lay-goc/ngay/:dayNumber`](../apps/web/src/App.tsx)
- Data source preserved: [`foundation48Days`](../apps/web/src/features/foundation48/foundation48Data.ts)
- Progress summary preserved: [`getFoundation48ProgressSummary`](../apps/web/src/features/foundation48/foundation48Progress.ts)
- Progress update event preserved: [`FOUNDATION48_PROGRESS_UPDATED_EVENT`](../apps/web/src/features/foundation48/foundation48Progress.ts)
- Existing day lesson flow preserved in [`Foundation48DayPage`](../apps/web/src/features/foundation48/Foundation48DayPage.tsx)
- Soft lock/unlock logic preserved in the roadmap state calculation.

## Screenshots

- Before desktop: [`reports/screenshots/foundation48-entry-before-desktop.png`](./screenshots/foundation48-entry-before-desktop.png)
- After desktop: [`reports/screenshots/foundation48-entry-after-desktop.png`](./screenshots/foundation48-entry-after-desktop.png)
- After mobile: [`reports/screenshots/foundation48-entry-after-mobile.png`](./screenshots/foundation48-entry-after-mobile.png)

## Build and QA result

- [`npm run build -w @pshare/web`](../package.json) — passed.
- [`node scripts/foundation48-release-qa.cjs`](../scripts/foundation48-release-qa.cjs) — passed.
  - `ok: true`
  - `errors: 0`
  - `consoleErrors: 0`
  - `failedRequests: 0`
- [`node scripts/foundation48-entry-simplification-qa.cjs`](../scripts/foundation48-entry-simplification-qa.cjs) — passed.
  - `ok: true`
  - `errors: 0`
  - `consoleErrors: 0`
  - Verified 7 weekly path items.
  - Verified all 48 days are hidden until expanding the secondary section.
  - Verified compact expanded list includes 48 days.
  - Verified no horizontal overflow on desktop 1440x950 and mobile 390x844.

## Chrome DevTools MCP note

No Chrome DevTools MCP tool was available in the active toolset for this session. Visual testing and screenshot capture were performed with Playwright against the active preview server at `http://127.0.0.1:5180`, which covered the requested route visually on desktop and mobile.

## Known risks

- The compact all-days list still renders in the DOM while collapsed through Chakra Collapse with `unmountOnExit={false}` so expansion is immediate; QA verifies it has no visible height before expansion.
- The current-week path is calculated by groups of 7 days rather than the existing Foundation48 stage boundaries. This is intentional for beginner simplicity but may not match all pedagogical stage divisions.
- Vite continues to emit existing dynamic/static import chunking warnings around Supabase/Foundation48 modules. These warnings did not fail build or QA.
