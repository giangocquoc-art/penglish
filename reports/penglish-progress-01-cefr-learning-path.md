# PENGLISH-PROGRESS-01 — CEFR learning path local progress

## Files changed

- `apps/web/src/lib/p-english/cefr-progress.ts`
  - Added `CefrProgressSummary` and `getCefrProgressSummary()`.
  - Reads existing local-only lesson, vocabulary, and shadowing progress.
- `apps/web/src/pages/LearningPathPage.tsx`
  - Connected `/learning-path` summary metrics to the CEFR local progress helper.
  - Added local/device progress copy and compact hints for vocabulary and shadowing.
  - Refreshes local summary on focus, storage updates, local progress updates, and vocabulary review updates.
- `scripts/penglish-learning-path-progress-qa.cjs`
  - Added browser QA for `/learning-path` local progress, persistence, screenshots, and mobile overflow.

## CEFR summary logic

`getCefrProgressSummary()` returns local-only progress:

- `currentLevel`
  - Stays `A1` when there is no lesson/unit progress.
  - Uses the existing app-supported unified dashboard level only when lesson progress exists.
  - Vocabulary and shadowing activity do not advance CEFR level.
- `completedUnits`
  - Counts units completed only from real local lesson progress:
    - `p-english:local-progress` completed lessons.
    - `p-english:lesson-progress:${lessonId}` mode progress summarized by existing lesson progress logic.
- `totalUnits`
  - Uses the generated unified CEFR learning path count (`12`).
- `vocabularyKnownCount`
  - Reads existing vocabulary local progress from `penglish.vocabulary.progress.v1`.
  - Also uses existing `getVocabularyStats()` for adapted vocabulary state.
- `vocabularyReviewCount`
  - Counts `review` and `difficult` vocabulary statuses from local progress.
- `shadowingPracticedLines`
  - Reads `penglish.shadowing.progress.v1` and counts unique practiced line IDs.

## Real progress vs placeholder

Real progress now shown on `/learning-path`:

- `Từ đã nhớ`
- `Từ cần ôn`
- `Câu shadowing đã luyện`
- `Unit hoàn thành` from actual local lesson completion/progress only.

Intentionally unchanged / placeholder-safe behavior:

- With no lesson progress, `Unit hoàn thành` remains `0/12`.
- The UI shows: `Hoàn thành bài học để mở tiến độ unit.`
- `Mức hiện tại` remains `A1 · Nền tảng` unless real lesson progress triggers existing app-supported advancement.
- No fake completed units were added.
- No artificial level unlocks were added.
- No server/API/login/upload progress flow was added.

## Persistence result

Browser QA confirmed local persistence:

- Opened `/learning-path` with clean progress and confirmed `0/12`, `A1`, and all local hint counts at `0`.
- Marked one vocabulary word as `Đã nhớ`.
- Marked another vocabulary word as `Cần ôn`.
- Marked one shadowing sentence as `Đã luyện`.
- Returned to `/learning-path` and confirmed:
  - `Từ đã nhớ 1`
  - `Từ cần ôn 1`
  - `Câu shadowing đã luyện 1`
  - `Mức hiện tại A1 · Nền tảng`
  - `Unit hoàn thành 0/12`
- Reloaded `/learning-path` and confirmed the same values persisted.
- Mobile `390x844` and desktop `1366x768` had no horizontal overflow.
- Browser QA reported no console errors, failed requests, or unexpected server progress writes.

## Screenshots saved

Saved under `reports/screenshots/penglish-dashboard/`:

- `learning-path-progress-mobile.png`
- `learning-path-progress-desktop.png`
- `learning-path-after-progress-reload.png`

## Validation and build result

Passed:

```powershell
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Passed:

```powershell
npm.cmd run build -w @pshare/web
```

Build note:

- Vite completed successfully.
- Existing chunk-size warning remains for large vendor/UI chunks; no build failure.

## Browser QA result

Passed:

```powershell
node scripts/penglish-learning-path-progress-qa.cjs
```

Final QA result:

```json
{
  "ok": true,
  "consoleErrors": [],
  "failedRequests": [],
  "unexpectedProgressWrites": [],
  "errors": []
}
```
