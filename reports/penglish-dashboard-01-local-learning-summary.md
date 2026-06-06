# PENGLISH-DASHBOARD-01 — Local Learning Progress Dashboard

## Status

PASS — Home dashboard now shows compact local/device-only learning progress from existing localStorage systems.

## Files changed

- `apps/web/src/lib/p-english/learning-summary.ts`
  - Added local-only summary helpers for vocabulary, shadowing, and English Speed practice.
- `apps/web/src/pages/HomePage.tsx`
  - Added compact learning summary cards and local privacy copy to the Home dashboard.
  - Wired the hero CTA and summary CTA to the recommended local action.
- `scripts/penglish-dashboard-local-summary-qa.cjs`
  - Added Playwright QA for default state, local review updates, persistence after reload, mobile layout, desktop layout, console errors, failed requests, and unexpected progress writes.
- `reports/penglish-dashboard-01-local-learning-summary.md`
  - This validation report.

## Data sources used

All progress remains local/device-only. No API, login, or server upload was added.

- Vocabulary review progress:
  - Storage key: `penglish.vocabulary.progress.v1`
  - Existing helpers reused: `getAllVocabularyItems()` and `isVocabularyDueToday()` from `apps/web/src/lib/p-english/vocabulary-review.ts`
  - Counts:
    - due-today words
    - difficult/wrong-count words
- Shadowing progress:
  - Storage key: `penglish.shadowing.progress.v1`
  - Counts across saved lesson entries:
    - unique practiced line IDs
    - unique difficult line IDs
- English Speed progress:
  - Storage key: `p-english:speech-progress`
  - Counts existing local attempts/completed values when available.
  - If no persistent progress exists, Home shows the neutral state: `Chưa có dữ liệu luyện phát âm hôm nay.`

## Dashboard summary logic

The new summary shape is implemented in `apps/web/src/lib/p-english/learning-summary.ts`:

- `vocabularyDueCount`
- `difficultWordCount`
- `shadowingPracticedCount`
- `shadowingDifficultCount`
- `englishSpeedPracticedCount`
- `hasEnglishSpeedProgress`
- `recommendedAction`

Recommended action priority:

1. If `vocabularyDueCount > 0`, recommend `Ôn từ vựng`.
2. Else if `shadowingDifficultCount > 0`, recommend `Ôn câu khó`.
3. Else recommend `Học tiếp ngay`.

The Home dashboard now includes compact cards for:

- `Ôn hôm nay`
- `Từ cần ôn`
- `Từ hay sai`
- `Câu shadowing`
- `Câu khó`
- `Luyện phát âm`

Privacy copy is visible as:

- `Lưu trên thiết bị`
- `Mọi dữ liệu đang được lưu trên thiết bị này.`

## Persistence result

PASS.

Browser QA marked one vocabulary item as `Cần ôn` in `/words`, marked one shadowing sentence as practiced and `Câu khó` in `/shadowing`, returned to `/home`, then reloaded `/home`.

Persisted Home results after reload:

- CTA: `Ôn từ vựng`
- Message: `Bạn có 1 từ cần ôn hôm nay. Mọi dữ liệu đang được lưu trên thiết bị này.`
- Vocabulary due count: `1`
- Shadowing practiced count: `1`
- Shadowing difficult count: `1`
- English Speed neutral state remained visible because no local English Speed attempt was created during this QA.

## Mobile result

PASS.

Validated viewport:

- `390x844`

Checks:

- `/home` default state renders the local summary card.
- `/home` updated state renders local review counts.
- No horizontal overflow detected.
- No console errors detected.
- No failed requests detected after filtering normal same-origin asset aborts caused by fast route navigation.
- No unexpected progress/audio server writes detected.

## Desktop result

PASS.

Validated viewport:

- `1366x768`

Checks:

- `/home` renders the local summary dashboard.
- No horizontal overflow detected.
- CTA and local review counts persist on desktop.

## Screenshots saved

Saved under `reports/screenshots/penglish-dashboard/`:

- `dashboard-home-default-mobile.png`
- `dashboard-home-with-review-mobile.png`
- `dashboard-home-desktop.png`

## Build result

PASS.

Commands run:

```powershell
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run build -w @pshare/web
```

Results:

- TypeScript: passed.
- Production build: passed.
- Vite emitted the existing non-fatal large chunk warning for `vendor-ui`.

## Browser QA result

PASS.

Command run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$job = Start-Job -ScriptBlock { Set-Location 'c:/Users/nltn0/OneDrive/Máy tính/PSVip_RELEASE_KH'; npm.cmd run dev -w @pshare/web -- --host 127.0.0.1 --port 5180 --strictPort }; Start-Sleep -Seconds 8; try { node scripts/penglish-dashboard-local-summary-qa.cjs } finally { Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -ErrorAction SilentlyContinue }"
```

Final QA JSON summary:

```json
{
  "ok": true,
  "baseUrl": "http://127.0.0.1:5180",
  "screenshots": [
    "dashboard-home-default-mobile.png",
    "dashboard-home-with-review-mobile.png",
    "dashboard-home-desktop.png"
  ],
  "viewports": [
    "mobile 390x844",
    "desktop 1366x768"
  ],
  "consoleErrors": [],
  "failedRequests": [],
  "unexpectedProgressWrites": [],
  "errors": []
}
```
