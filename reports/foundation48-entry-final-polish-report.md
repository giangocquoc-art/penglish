# Foundation48 Entry Final Polish Report

## Summary

This final pass kept the existing second-pass Foundation48 entry design intact and made only small refinements. The page remains centered on one primary action: starting today’s lesson.

## Changed files

- [`apps/web/src/features/foundation48/Foundation48Roadmap.tsx`](../apps/web/src/features/foundation48/Foundation48Roadmap.tsx)
- [`apps/web/src/features/foundation48/Foundation48Page.tsx`](../apps/web/src/features/foundation48/Foundation48Page.tsx)
- [`apps/web/src/components/Sidebar.tsx`](../apps/web/src/components/Sidebar.tsx)
- [`scripts/foundation48-entry-simplification-qa.cjs`](../scripts/foundation48-entry-simplification-qa.cjs)
- [`reports/foundation48-entry-simplification-qa-results.json`](./foundation48-entry-simplification-qa-results.json)

## UX changes

- Added a mobile-only weekly path hint: “Vuốt để xem ngày tiếp theo →”. This keeps all 7 week days accessible while making the horizontal path feel more understandable on small screens.
- Replaced the technical footer note with a friendlier sentence: “Học mỗi ngày một chút, Poo sẽ lưu tiến độ cho bạn.”
- Reduced the visual emphasis of the Google sync action in the sidebar by changing it from a filled blue CTA to a quieter ghost button labeled “Đồng bộ bằng Google”.
- Kept the primary lesson CTA unchanged and prominent.
- Kept the all-days list collapsed by default.

## Preserved behavior

- Foundation48 routes were not changed.
- Foundation48 data was not changed.
- Progress and localStorage behavior were not changed.
- Lock/unlock logic was not changed.
- Day detail flow was not changed.
- The all-days section remains collapsed by default.

## Build result

Passed:

```text
npm run build -w @pshare/web
```

The build completed successfully. Existing non-fatal Vite warnings remain for modules that are both dynamically and statically imported.

## Browser QA result

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

Validated:

- Primary CTA remains “Bắt đầu học”.
- All-days list is not expanded initially.
- Compact day rows are not visible before expansion.
- Weekly path still has 7 day items.
- Expanded all-days list includes 48 rows.
- No desktop horizontal overflow.
- No mobile horizontal overflow.
- No console errors.

## Screenshots

- Desktop overview: [`reports/screenshots/foundation48-entry-final-polish-desktop.png`](./screenshots/foundation48-entry-final-polish-desktop.png)
- Mobile overview: [`reports/screenshots/foundation48-entry-final-polish-mobile.png`](./screenshots/foundation48-entry-final-polish-mobile.png)
- Expanded all-days list: [`reports/screenshots/foundation48-entry-final-polish-expanded-all-days.png`](./screenshots/foundation48-entry-final-polish-expanded-all-days.png)

## Notes

- This was intentionally a polish pass, not a redesign.
- The Google sync option is still available, but visually secondary so learners can start without thinking login is required.
