# Foundation48 Poo Ocean Progress UI Report

## Summary

The Foundation48 “Tiến độ tuần này” progress UI now uses an ocean-themed progress track instead of the plain linear bar. Poo swims across a rounded water lane according to the existing real progress percentage: 0% starts at the left edge and 100% reaches the end of the lane.

## Changed files

- [`Foundation48Roadmap.tsx`](../apps/web/src/features/foundation48/Foundation48Roadmap.tsx)
- [`foundation48-entry-simplification-qa.cjs`](../scripts/foundation48-entry-simplification-qa.cjs)
- [`foundation48-entry-simplification-qa-results.json`](./foundation48-entry-simplification-qa-results.json)

## UX changes

- Replaced the standard progress bar in “Tiến độ tuần này” with a custom rounded water lane.
- Added a filled crossed-water segment driven by the existing `progress.percent` value.
- Reused the existing Poo mascot through [`OceanMascot`](../apps/web/src/components/p-english/OceanMascot.tsx), positioned horizontally by progress percentage.
- Kept the numeric progress text visible above the track, for example `0/48 ngày · 0%`.
- Added a 100% completion accent with a small sparkle/success pill when progress reaches completion.
- Added subtle calm motion through the existing mascot `swim` / `celebrate` motion modes.
- Preserved reduced-motion accessibility with a `prefers-reduced-motion` guard on the track.
- Kept the weekly path and all-days collapsed behavior unchanged.

## Preserved behavior

- Foundation48 routes were not changed.
- Foundation48 data was not changed.
- Progress calculation was not changed.
- localStorage behavior was not changed.
- Lock/unlock logic was not changed.
- Day detail flow was not changed.
- This pass only changed visual progress rendering and QA screenshot/assertion coverage.

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

- Primary CTA remains beginner-clear.
- All-days list remains collapsed initially.
- Weekly path still has 7 day items.
- Poo ocean progress track exists on desktop.
- Poo progress mascot exists on desktop.
- Poo ocean progress track exposes `role="progressbar"`.
- Poo ocean progress track exists on mobile.
- Poo progress mascot exists on mobile.
- Expanded all-days list includes 48 rows.
- No desktop horizontal overflow.
- No mobile horizontal overflow.
- No console errors.

## Screenshots

- Desktop overview with Poo progress track: [`foundation48-poo-progress-desktop.png`](./screenshots/foundation48-poo-progress-desktop.png)
- Mobile overview with Poo progress track: [`foundation48-poo-progress-mobile.png`](./screenshots/foundation48-poo-progress-mobile.png)
- Expanded all-days list: [`foundation48-poo-progress-expanded-all-days.png`](./screenshots/foundation48-poo-progress-expanded-all-days.png)

## Notes

- Poo positioning is clamped through the real progress percentage and adjusted so the mascot stays inside the lane at both 0% and 100%.
- The design intentionally remains calm and compact so it does not compete with the primary “Bắt đầu học” action.
