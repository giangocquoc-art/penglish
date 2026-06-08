# Foundation48 Entry Second-Pass Simplification Report

## Summary

The Foundation48 entry page was simplified further to make the first screen communicate one primary action: start today's lesson. The overview now emphasizes the page title, a calmer compact hero, the shortened today lesson title, and one large CTA before secondary progress details.

## Changed files

- [`apps/web/src/features/foundation48/Foundation48Page.tsx`](../apps/web/src/features/foundation48/Foundation48Page.tsx)
- [`apps/web/src/features/foundation48/Foundation48Roadmap.tsx`](../apps/web/src/features/foundation48/Foundation48Roadmap.tsx)
- [`apps/web/src/components/Sidebar.tsx`](../apps/web/src/components/Sidebar.tsx)
- [`apps/web/src/components/MobileDrawer.tsx`](../apps/web/src/components/MobileDrawer.tsx)
- [`scripts/foundation48-entry-simplification-qa.cjs`](../scripts/foundation48-entry-simplification-qa.cjs)
- [`reports/foundation48-entry-simplification-qa-results.json`](./foundation48-entry-simplification-qa-results.json)
- [`reports/foundation48-release-qa-results.json`](./foundation48-release-qa-results.json)

## UX changes

- Shortened the today lesson title on the overview card by trimming day prefixes and grammar detail after the em dash.
- Reduced the desktop hero/card footprint so the “Hôm nay học” card becomes the dominant visual target.
- Reduced mobile density by hiding the example sentence on mobile and keeping the main CTA prominent.
- Removed the standalone heavy progress card from the overview.
- Combined progress and weekly path into one compact “Tiến độ tuần này” section.
- Kept “Xem tất cả ngày học” collapsed by default and made the section visually lighter.
- Made all-days rows use friendly short titles so the expanded list remains secondary and scannable.
- Simplified desktop sidebar labels to beginner-first navigation: Học, Ôn tập, Từ vựng, Trang chủ.
- Simplified mobile drawer labels to: Học, Ôn tập, Từ vựng, Hồ sơ.

## Preserved behavior

- Foundation48 data model remains unchanged.
- Route structure remains unchanged.
- Progress summary and localStorage behavior remain unchanged.
- Lock/unlock logic remains unchanged.
- Day detail flow remains unchanged.
- All-days list remains collapsed by default.

## Build result

Passed:

```text
npm run build -w @pshare/web
```

Build completed successfully. Vite still reports existing non-fatal dynamic/static import warnings for Supabase/Foundation48 cloud modules.

## QA result

Passed:

```text
node scripts/foundation48-release-qa.cjs
```

Result:

```json
{
  "ok": true,
  "errors": 0,
  "consoleErrors": 0,
  "failedRequests": 0
}
```

Passed:

```text
node scripts/foundation48-entry-simplification-qa.cjs
```

Result:

```json
{
  "ok": true,
  "errors": 0,
  "consoleErrors": 0
}
```

Browser QA confirmed:

- Primary CTA text is beginner-clear.
- All-days list is collapsed by default.
- Compact day cards are not visible before expansion.
- Weekly path still contains 7 day dots.
- Expanded all-days list includes 48 rows.
- No desktop horizontal overflow.
- No mobile horizontal overflow.
- No console errors.

## Screenshots

- Desktop overview: [`reports/screenshots/foundation48-entry-second-pass-desktop.png`](./screenshots/foundation48-entry-second-pass-desktop.png)
- Mobile overview: [`reports/screenshots/foundation48-entry-second-pass-mobile.png`](./screenshots/foundation48-entry-second-pass-mobile.png)
- Expanded all-days list: [`reports/screenshots/foundation48-entry-second-pass-expanded-all-days.png`](./screenshots/foundation48-entry-second-pass-expanded-all-days.png)

## Known risks

- The desktop sidebar now visually prioritizes Foundation48 and hides some previously prominent destinations from the primary nav list; routes are still intact but discoverability of older pages is intentionally reduced.
- The mobile drawer includes a separate Hồ sơ item and also retains the profile card at the bottom, creating a small intentional redundancy for beginner clarity.
- Existing Vite chunking warnings remain non-fatal and were not addressed in this UX pass.
