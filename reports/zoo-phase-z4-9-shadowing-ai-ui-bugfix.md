# Zoo Phase Z4.9 — Shadowing AI Voice Capture + Number/Text Normalization + Ocean UI Bugfix

## Summary

Phase Z4.9 is complete. This phase focused on production-facing fixes for Shadowing AI recording reliability, Gemini feedback response stability, number/text speech normalization, and ocean UI consistency across Shadowing, English Speed, Words, Home, and Login.

No deployment was performed.

## Implemented changes

### Shadowing voice capture and upload

- Improved browser recording in [`ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx):
  - Chooses the best supported [`MediaRecorder`](../apps/web/src/pages/ShadowingPage.tsx) MIME type from `audio/webm;codecs=opus`, `audio/webm`, and `audio/mp4`.
  - Starts recording with a timeslice to flush chunks more reliably.
  - Detects zero-byte recordings before upload.
  - Returns the required user-facing `EMPTY_AUDIO` copy: “Poo chưa nghe được âm thanh. Bạn thử nói gần micro hơn hoặc ghi âm lại nhé.”
  - Preserves microphone-denied copy: “Trình duyệt chưa cho phép micro. Hãy bật quyền micro rồi thử lại.”

### Shadowing API route

- Reworked [`shadowing-feedback.ts`](../api/shadowing-feedback.ts):
  - Keeps `GEMINI_API_KEY` server-only via `process.env.GEMINI_API_KEY`.
  - Does not reference `VITE_GEMINI_API_KEY`.
  - Returns `{ ok:false, error:"GEMINI_API_KEY_MISSING" }` with the required message when the server key is missing.
  - Returns `{ ok:false, error:"EMPTY_AUDIO" }` when audio data is missing or empty.
  - Uses binary-safe multipart fallback parsing instead of converting the full upload body to text.
  - Tracks `audioBytes` and `mimeType` safely.
  - Sends Gemini REST audio as `inline_data` with `mime_type` and base64 `data`.
  - Adds safe operational logging without secrets.
  - Normalizes Gemini JSON into the required response shape with `normalizedTranscript`, `normalizedTarget`, and `changedWords`.
  - Adds the natural number-equivalence feedback tip when applicable: “Poo đã hiểu dạng số và dạng chữ là tương đương trong câu này.”

### Number/text normalization

- Added [`speechTextNormalizer.ts`](../apps/web/src/lib/p-english/speechTextNormalizer.ts):
  - Converts number words and digit forms into equivalent comparison tokens.
  - Handles examples like `six` = `6`, `twenty one` = `21`, `Unit one` = `Unit 1`, `one hundred` = `100`.
  - Handles common ordinals such as `first` and suffix forms such as `3rd`.
  - Preserves and normalizes common contractions like `I'm`, `what's`, `don't`, and `can't`.

- Integrated normalization into:
  - [`shadowingApiClient.ts`](../apps/web/src/lib/p-english/shadowingApiClient.ts)
  - [`shadowingFeedbackAdapter.ts`](../apps/web/src/lib/p-english/shadowingFeedbackAdapter.ts)
  - [`speechAdapter.ts`](../apps/web/src/lib/p-english/speechAdapter.ts)

### QA and smoke testing

- Added [`zoo-z4-9-normalizer-smoke-test.cjs`](../scripts/zoo-z4-9-normalizer-smoke-test.cjs).
- Added [`zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs`](../scripts/zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs).

The QA script checks:

- Shadowing recording card and record button exist.
- Empty audio shows the required `EMPTY_AUDIO` user copy.
- Missing Gemini key shows the updated server/Vercel copy.
- Shared ocean classes exist on relevant routes.
- English Speed has exactly one `Poo pronunciation mode` badge on desktop and mobile.
- `/words` desktop and mobile render with ocean shell and no horizontal overflow.
- No `VITE_GEMINI_API_KEY` references in guarded source files.
- Required screenshots are saved.

### Ocean UI consistency

- Added shared ocean class names in [`OceanBackdrop.tsx`](../apps/web/src/components/p-english/OceanBackdrop.tsx):
  - `.penglish-ocean-shell`
  - `.penglish-ocean-background`
  - `.poo-background-swim`

- Updated [`LoginPage.tsx`](../apps/web/src/pages/LoginPage.tsx) to use `.penglish-ocean-shell` because it is outside the authenticated app shell.
- Updated [`EnglishSpeedPage.tsx`](../apps/web/src/pages/EnglishSpeedPage.tsx):
  - Uses transparent shared shell background instead of a separate page gradient.
  - Uses a single consistent `Poo pronunciation mode` badge.
- Updated [`VocabPage.tsx`](../apps/web/src/pages/VocabPage.tsx):
  - Uses `.penglish-ocean-shell`.
  - Desktop table now uses horizontal overflow instead of clipping actions.

## Validation results

All required validation commands passed:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
node scripts\zoo-z4-9-normalizer-smoke-test.cjs
node scripts\zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs
```

Notes:

- [`npm.cmd run build`](../package.json) completed successfully with the existing Vite chunk-size warning for large chunks.
- Browser QA used a mocked [`MediaRecorder`](../scripts/zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs) because headless browser microphone capture is environment-dependent.

## Screenshots captured

- [`zoo-z4-9-shadowing-recording-desktop.png`](screenshots/zoo-z4-9-shadowing-recording-desktop.png)
- [`zoo-z4-9-shadowing-ai-error-or-result.png`](screenshots/zoo-z4-9-shadowing-ai-error-or-result.png)
- [`zoo-z4-9-english-speed-desktop.png`](screenshots/zoo-z4-9-english-speed-desktop.png)
- [`zoo-z4-9-english-speed-mobile.png`](screenshots/zoo-z4-9-english-speed-mobile.png)
- [`zoo-z4-9-words-desktop.png`](screenshots/zoo-z4-9-words-desktop.png)
- [`zoo-z4-9-words-mobile.png`](screenshots/zoo-z4-9-words-mobile.png)
- [`zoo-z4-9-home-ocean-background.png`](screenshots/zoo-z4-9-home-ocean-background.png)

## Safety notes

- No deploy was performed.
- No server secrets were exposed.
- `GEMINI_API_KEY` remains server-only.
- No existing lesson/shadowing features were removed.
