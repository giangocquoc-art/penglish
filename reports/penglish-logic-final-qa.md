# PENGLISH-LOGIC-QA — Final QA Report

## Scope

Final QA was run for the completed P-English logic rounds:

- English Speed recording flow
- Shadowing transcript progress
- Vocabulary review queue

No new features were added and no redesign work was done. Only the QA automation script needed small fixes for reliable screenshot/locator execution.

## TypeScript Result

Command:

```text
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
```

Result: PASS

- Exit code: 0
- TypeScript completed with no output/errors.

## Build Result

Command:

```text
npm.cmd run build -w @pshare/web
```

Result: PASS

- Exit code: 0
- Vite production build completed successfully.
- Build warning only: one UI vendor chunk is larger than 500 kB after minification. This is an existing bundling warning, not a logic QA failure.

## Browser QA Script

Created:

```text
scripts/penglish-logic-final-qa.cjs
```

QA command used:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$job = Start-Job -ScriptBlock { Set-Location 'c:/Users/nltn0/OneDrive/Máy tính/PSVip_RELEASE_KH'; npm.cmd run dev -w @pshare/web -- --host 127.0.0.1 --port 5180 --strictPort }; Start-Sleep -Seconds 8; try { node scripts/penglish-logic-final-qa.cjs } finally { Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -ErrorAction SilentlyContinue }"
```

Result: PASS

Final script output:

```json
{
  "ok": true,
  "baseUrl": "http://127.0.0.1:5180",
  "routesTested": [
    "/home",
    "/learning-path",
    "/lessons/unit-1-greetings-introduction",
    "/english-speed",
    "/shadowing",
    "/words"
  ],
  "viewports": [
    "desktop 1366x768",
    "mobile 390x844"
  ],
  "screenshots": [
    "final-qa-console-check.png",
    "final-qa-english-speed-mobile.png",
    "final-qa-home-desktop.png",
    "final-qa-shadowing-mobile.png",
    "final-qa-words-mobile.png"
  ],
  "consoleErrors": [],
  "failedRequests": [],
  "errors": [],
  "englishSpeed": "PASS: prompt, sample audio button, record state, denied mic handling, local recorded state, replay button, and no upload request verified.",
  "shadowing": "PASS: lesson load, current sentence, next/previous, practiced/difficult marking, reload persistence, transcript-first safety, and iframe safety verified.",
  "vocabulary": "PASS: word list, status chips, filters, review queue, reload persistence, and no server progress request verified."
}
```

## Routes Tested

Desktop `1366x768` and mobile `390x844` were tested for:

- `/home`
- `/learning-path`
- `/lessons/unit-1-greetings-introduction`
- `/english-speed`
- `/shadowing`
- `/words`

## English Speed Result

Result: PASS

Validated:

- Prompt loads on `/english-speed`.
- Sample audio button is clickable and fails gracefully under automation if speech synthesis is unavailable.
- Record button state changes to recording.
- Microphone permission denied path shows the user-facing error panel.
- Recorded state appears with local mock recording.
- Replay button appears after recording.
- No upload/API/progress network request is made for audio recording.

## Shadowing Result

Result: PASS

Validated:

- Lesson loads on `/shadowing`.
- Current sentence is visible.
- Next sentence works.
- Previous sentence works.
- Mark practiced works.
- Mark difficult works.
- Progress persists after reload in `penglish.shadowing.progress.v1`.
- Transcript-first mode remains safe.
- No unsafe YouTube iframe was found unless `embedAllowed=true`.

## Vocabulary Result

Result: PASS

Validated:

- Word list loads on `/words`.
- Status chips work.
- Filters work for review/difficult/known states.
- Review queue works.
- Progress persists after reload in `penglish.vocabulary.progress.v1`.
- No server request is made for vocabulary progress.

## Mobile Result

Result: PASS

Validated at `390x844`:

- No horizontal overflow on required routes.
- Mobile bottom nav did not cover checked main buttons/interactions.
- Ambient Poo/whale elements remained non-blocking for interactions.
- Required mobile screenshots were captured.

## Console / Network Result

Result: PASS

- Console errors: none.
- Page errors: none.
- Failed requests: none.
- English Speed audio upload/network request: none.
- Vocabulary progress server request: none.

## Screenshots Saved

Directory:

```text
reports/screenshots/penglish-logic/final-qa/
```

Files:

- `final-qa-english-speed-mobile.png`
- `final-qa-shadowing-mobile.png`
- `final-qa-words-mobile.png`
- `final-qa-home-desktop.png`
- `final-qa-console-check.png`

## Small QA Script Fixes Made

Only the QA automation script was adjusted:

- Switched required screenshots to viewport screenshots instead of full-page screenshots to avoid timeout from long animated pages.
- Used attached-state readiness for the home data-mode indicator because the element can be present but hidden responsively.
- Fixed an in-page evaluation scoping issue in the mobile bottom-safe-area checker.

No application feature logic was changed during final QA.

## Remaining Issues

None for this logic round.

Known non-blocking note:

- Production build emits a chunk-size warning for `vendor-ui`, but the build passes and this is outside the English Speed/Shadowing/Vocabulary logic scope.

## Stop/Go Decision

Ready to stop: YES.

The English Speed, Shadowing, and Vocabulary logic rounds are validated together across the required routes, desktop/mobile viewports, screenshots, console/network checks, and production validation.
