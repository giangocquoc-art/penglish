# Foundation48 sync prompt UX polish

## Changed files

- [`apps/web/src/features/auth/AuthProvider.tsx`](../apps/web/src/features/auth/AuthProvider.tsx): removed the global fixed sync prompt from the auth provider so it no longer appears over lesson content.
- [`apps/web/src/features/foundation48/Foundation48DayPage.tsx`](../apps/web/src/features/foundation48/Foundation48DayPage.tsx): added an inline completion-only sync prompt below the completion panel, with session-level dismissal and existing cloud sync behavior.
- [`scripts/foundation48-sync-prompt-qa.cjs`](../scripts/foundation48-sync-prompt-qa.cjs): added regression QA for quiz/vocab/speaking/completion sync prompt behavior and screenshots.

## Behavior

- The sync prompt is no longer shown automatically during vocabulary, speaking, quiz, or other in-progress lesson steps.
- The prompt appears only after the learner has completed the day and is placed inline under the completion panel.
- The copy is now:
  - `Đồng bộ tiến độ lên tài khoản Google?`
  - `Đồng bộ`
  - `Để sau`
- Clicking `Đồng bộ` calls the existing `syncLocalFoundation48ProgressToCloud` flow and refreshes Foundation48 progress.
- Clicking `Để sau` hides the prompt and stores a per-user/per-day session dismissal in `sessionStorage`, so it does not reappear during the same lesson session.
- Existing sidebar/profile manual `Đồng bộ tiến độ` buttons remain unchanged.
- Auth protection, Google login, route logic, Foundation48 data, and lesson progress logic were preserved.

## Build result

- `npm run build -w @pshare/web`: passed.
- Notes: existing Vite/Rollup warnings remain for `react-wavify` pure annotations and dynamic/static imports; no build failure.

## QA result

- QA script: `node scripts/foundation48-sync-prompt-qa.cjs`: passed.
- Verified:
  - no sync prompt before completion on vocabulary cards;
  - no sync prompt before completion on speaking cards;
  - no sync prompt before completion on quiz answers/feedback;
  - inline prompt appears after completion only;
  - prompt does not overlap the completion panel on desktop or mobile;
  - `Để sau` suppresses the prompt for the same lesson session;
  - no console errors captured by the script;
  - no 404/500 network errors captured by the script;
  - no horizontal overflow;
  - no mojibake markers.

## Screenshots

Saved under [`reports/screenshots`](screenshots):

- [`foundation48-sync-vocab-desktop.png`](screenshots/foundation48-sync-vocab-desktop.png)
- [`foundation48-sync-quiz-desktop.png`](screenshots/foundation48-sync-quiz-desktop.png)
- [`foundation48-sync-complete-desktop.png`](screenshots/foundation48-sync-complete-desktop.png)
- [`foundation48-sync-complete-mobile.png`](screenshots/foundation48-sync-complete-mobile.png)
