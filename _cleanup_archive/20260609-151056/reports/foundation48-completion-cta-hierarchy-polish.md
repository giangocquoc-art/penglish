# Foundation48 Completion CTA Hierarchy Polish

## Summary

Polished the Foundation48 completion step so the reward screen has one clear primary next action and one secondary review action.

## UX changes

- Kept a single primary completion CTA: `Sang Ngày 2`.
- Kept a single secondary completion CTA: `Ôn lại bài này`.
- Converted `Đã hoàn thành` from a competing button into a compact green status badge.
- Removed duplicate lower next-day navigation from the completed screen.
- Kept the inline sync prompt below the completion panel and reduced its visual emphasis with a slimmer secondary card treatment.
- Scoped completion-only sync UI to the completion step so it does not appear while reviewing earlier lesson steps.

## Files changed

- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
  - Simplified completion actions inside `CompletePrompt`.
  - Added `foundation48-completed-status-badge` for completed state.
  - Hid duplicate previous/next day navigation when the day is completed.
  - Made completion sync prompt secondary and gated it to the actual completion step.

- `scripts/foundation48-sync-prompt-qa.cjs`
  - Added CTA hierarchy assertions for exactly one `Sang Ngày 2` and exactly one `Ôn lại bài này`.
  - Asserted `Đã hoàn thành` is not rendered as a button.
  - Asserted sync prompt appears below completion CTAs.
  - Updated mobile QA to navigate to the completion reward step before asserting the completion panel and sync prompt.

## QA results

- `npm run build -w @pshare/web` passed.
- `node scripts/foundation48-sync-prompt-qa.cjs` passed.

Validated:

- Desktop completion screen shows one visually dominant `Sang Ngày 2` action.
- Mobile completion screen shows the primary action before the sync prompt.
- No duplicate `Ngày 2` / extra next-day CTA appears on the completion screen.
- `Đã hoàn thành` is a status badge, not a button.
- Inline sync prompt still appears only after completion and stays below the completion UI.
- No horizontal overflow detected.
- No console/page errors or mojibake markers detected by QA.

## Screenshots

Saved under `reports/screenshots`:

- `foundation48-completion-cta-desktop.png`
- `foundation48-completion-cta-mobile.png`
- `foundation48-sync-vocab-desktop.png`
- `foundation48-sync-quiz-desktop.png`
