# Foundation48 Completion Summary Readability Polish

## Summary

Polished the Foundation48 completion step so the final screen is shorter, more rewarding, and easier to scan on mobile while preserving the existing CTA hierarchy and lesson logic.

## UX changes

- Kept the current completion CTA hierarchy:
  - primary: `Sang Ngày 2`
  - secondary: `Ôn lại bài này`
  - `Đã hoàn thành` remains a compact status badge.
- Replaced long completion body text with short reward copy:
  - `Hoàn thành Ngày 1`
  - `Giỏi lắm! Poo đã lưu tiến độ hôm nay.`
- Added a short `Bạn đã học` summary with compact metrics:
  - `5 câu luyện nói`
  - `10 từ đã ôn`
  - `9 câu quiz`
- Moved grammar reminders into `Xem lại kiến thức`:
  - collapsed by default on mobile via a `details` section;
  - shown as a calm desktop review card.
- Moved the grammar review below the completion CTAs so mobile users see `Sang Ngày 2` with less scrolling.
- Preserved the Poo celebration mascot and reward-card styling.

## Files changed

- `apps/web/src/features/foundation48/Foundation48DayPage.tsx`
  - Shortened completion step subtitle/body.
  - Reworked `CompletePrompt` with compact reward copy and `Bạn đã học` metrics.
  - Added `GrammarReview` for collapsed mobile / desktop review details.
  - Added `getCompletionReminders` to derive review reminders without changing Foundation48 data.
  - Kept progress, sync, auth, routing, and saved-progress logic unchanged.

- `scripts/foundation48-sync-prompt-qa.cjs`
  - Added assertions for the new `Bạn đã học` summary metrics.
  - Added checks for the `Xem lại kiến thức` review section.
  - Added readability checks for shorter reward copy and mobile collapsed review.
  - Continued verifying CTA hierarchy, sync prompt placement, no overflow, no errors, and no mojibake.

## QA results

- `npm run build -w @pshare/web` passed.
- `node scripts/foundation48-sync-prompt-qa.cjs` passed.

Validated:

- Desktop completion remains calm and readable.
- Mobile completion shows the reward title and primary `Sang Ngày 2` action without excessive summary text.
- `Xem lại kiến thức` is collapsed by default on mobile.
- The sync prompt stays visually secondary and below completion CTAs.
- No duplicate completion CTAs were introduced.
- No horizontal overflow was detected.
- No console/page errors or mojibake markers were detected by QA.

## Screenshots

Updated screenshots saved under `reports/screenshots`:

- `foundation48-completion-cta-desktop.png`
- `foundation48-completion-cta-mobile.png`
- `foundation48-sync-vocab-desktop.png`
- `foundation48-sync-quiz-desktop.png`
