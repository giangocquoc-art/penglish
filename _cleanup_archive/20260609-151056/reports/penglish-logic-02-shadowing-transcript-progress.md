# PENGLISH-LOGIC-02 — Shadowing transcript progress and sentence status

## Files changed

- `apps/web/src/hooks/useShadowingProgress.ts`
  - Added a localStorage-backed hook for per-lesson Shadowing transcript progress.
- `apps/web/src/pages/ShadowingPage.tsx`
  - Wired Shadowing current sentence state to persisted transcript progress.
  - Added visible progress counters, previous/next controls, practiced/difficult actions, and transcript row state badges.
- `scripts/penglish-logic-shadowing-progress-qa.cjs`
  - Added Playwright QA for mobile/desktop Shadowing progress persistence and screenshots.

## localStorage schema

Storage key:

```text
penglish.shadowing.progress.v1
```

Shape:

```ts
type ShadowingProgressStore = Record<string, {
  currentLineIndex: number;
  practicedLineIds: string[];
  difficultLineIds: string[];
  updatedAt: string;
}>;
```

Notes:

- The record key is the Shadowing lesson id.
- `currentLineIndex` is clamped to the active transcript length.
- `practicedLineIds` and `difficultLineIds` are filtered to valid sentence ids for the active lesson.
- If no saved progress exists for a lesson, the lesson starts at sentence 1.
- Progress remains local to the browser/device and does not require an API, upload, login, microphone, or video embed.

## Progress behavior

- Opening `/shadowing` restores the saved lesson progress from localStorage.
- Changing lessons loads progress for the selected lesson id.
- The current sentence is derived from the saved `currentLineIndex`.
- `Câu trước` and `Câu tiếp` update and persist `currentLineIndex`.
- `Đánh dấu đã luyện` adds the current sentence id to `practicedLineIds`.
- `Đánh dấu câu khó` toggles the current sentence id in `difficultLineIds`.
- Visible progress now shows:
  - `Câu X/Y`
  - `Đã luyện N/Y`
  - `Câu khó N`
- Transcript rows show current, practiced, and difficult states with visual badges.
- Existing transcript-first behavior remains: video embed is still only shown when `embedAllowed=true`.
- English Speed recording logic was not changed.

## Mobile result

- The current sentence and progress summary remain first in the main practice card.
- Transcript stays in a collapsible `details` panel on mobile.
- QA verified no horizontal overflow at `390x844`.

## Screenshots saved

Directory:

```text
reports/screenshots/penglish-logic/
```

Screenshots:

- `shadowing-progress-mobile.png`
- `shadowing-current-sentence-mobile.png`
- `shadowing-transcript-progress-desktop.png`
- `shadowing-progress-after-reload.png`

## Validation

Build command:

```text
npm.cmd run build -w @pshare/web
```

Result:

```text
Exit code 0 — Vite production build completed successfully.
```

QA command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$job = Start-Job -ScriptBlock { Set-Location 'c:/Users/nltn0/OneDrive/Máy tính/PSVip_RELEASE_KH'; npm.cmd run dev -w @pshare/web -- --host 127.0.0.1 --port 5180 }; Start-Sleep -Seconds 8; node scripts/penglish-logic-shadowing-progress-qa.cjs; $code = $LASTEXITCODE; Stop-Job $job -ErrorAction SilentlyContinue; Receive-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -ErrorAction SilentlyContinue; exit $code"
```

Result:

```text
PENGLISH-LOGIC-02 QA passed. Screenshots saved to C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH\reports\screenshots\penglish-logic
```
