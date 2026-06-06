# Zoo Phase Z4.9 Handoff — Shadowing AI Voice Capture + Number/Text Normalization + Ocean UI

## Status

Phase Z4.9 is complete and validated locally. No deployment was performed.

## Main files changed or created

### Created

- [`speechTextNormalizer.ts`](../apps/web/src/lib/p-english/speechTextNormalizer.ts)
- [`zoo-z4-9-normalizer-smoke-test.cjs`](../scripts/zoo-z4-9-normalizer-smoke-test.cjs)
- [`zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs`](../scripts/zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs)
- [`zoo-phase-z4-9-shadowing-ai-ui-bugfix.md`](zoo-phase-z4-9-shadowing-ai-ui-bugfix.md)
- [`zoo-phase-z4-9-handoff.md`](zoo-phase-z4-9-handoff.md)

### Updated

- [`shadowing-feedback.ts`](../api/shadowing-feedback.ts)
- [`ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx)
- [`shadowingApiClient.ts`](../apps/web/src/lib/p-english/shadowingApiClient.ts)
- [`shadowingFeedbackAdapter.ts`](../apps/web/src/lib/p-english/shadowingFeedbackAdapter.ts)
- [`speechAdapter.ts`](../apps/web/src/lib/p-english/speechAdapter.ts)
- [`OceanBackdrop.tsx`](../apps/web/src/components/p-english/OceanBackdrop.tsx)
- [`LoginPage.tsx`](../apps/web/src/pages/LoginPage.tsx)
- [`EnglishSpeedPage.tsx`](../apps/web/src/pages/EnglishSpeedPage.tsx)
- [`VocabPage.tsx`](../apps/web/src/pages/VocabPage.tsx)

## Key implementation notes

### Shadowing recording

[`ShadowingPage.tsx`](../apps/web/src/pages/ShadowingPage.tsx) now selects a supported browser recording MIME type, flushes chunks during recording, and blocks empty uploads with the required `EMPTY_AUDIO` message.

### API and Gemini

[`shadowing-feedback.ts`](../api/shadowing-feedback.ts) now:

- Uses server-only `process.env.GEMINI_API_KEY`.
- Returns `GEMINI_API_KEY_MISSING` with the required server/Vercel message when missing.
- Returns `EMPTY_AUDIO` for empty uploads.
- Parses multipart audio in a binary-safe way.
- Sends Gemini REST audio using `inline_data`.
- Normalizes response fields into the Z4.9 required success shape.
- Adds normalized comparison and number-equivalence feedback.

### Normalization

[`speechTextNormalizer.ts`](../apps/web/src/lib/p-english/speechTextNormalizer.ts) is the frontend shared helper for speech comparisons. It is used by Shadowing API post-processing, Shadowing local fallback, and English Speed speech comparison.

Expected equivalences include:

- `six` = `6`
- `twenty one` = `21`
- `Unit one` = `Unit 1`
- `I get up at six` = `I get up at 6`
- `Lesson twenty-one` = `lesson 21`

### UI consistency

The shared ocean/whale classes are present in [`OceanBackdrop.tsx`](../apps/web/src/components/p-english/OceanBackdrop.tsx):

- `.penglish-ocean-shell`
- `.penglish-ocean-background`
- `.poo-background-swim`

[`EnglishSpeedPage.tsx`](../apps/web/src/pages/EnglishSpeedPage.tsx) uses one `Poo pronunciation mode` badge across desktop and mobile. [`VocabPage.tsx`](../apps/web/src/pages/VocabPage.tsx) uses the shared ocean shell and desktop horizontal table overflow to avoid clipping actions.

## Validation commands run

All passed:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
node scripts\zoo-z4-9-normalizer-smoke-test.cjs
node scripts\zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs
```

The build produced only the existing Vite chunk-size warning.

## QA screenshots

Saved in [`reports/screenshots`](screenshots):

- [`zoo-z4-9-shadowing-recording-desktop.png`](screenshots/zoo-z4-9-shadowing-recording-desktop.png)
- [`zoo-z4-9-shadowing-ai-error-or-result.png`](screenshots/zoo-z4-9-shadowing-ai-error-or-result.png)
- [`zoo-z4-9-english-speed-desktop.png`](screenshots/zoo-z4-9-english-speed-desktop.png)
- [`zoo-z4-9-english-speed-mobile.png`](screenshots/zoo-z4-9-english-speed-mobile.png)
- [`zoo-z4-9-words-desktop.png`](screenshots/zoo-z4-9-words-desktop.png)
- [`zoo-z4-9-words-mobile.png`](screenshots/zoo-z4-9-words-mobile.png)
- [`zoo-z4-9-home-ocean-background.png`](screenshots/zoo-z4-9-home-ocean-background.png)

## Notes for next operator

- Do not deploy unless explicitly requested.
- Keep `GEMINI_API_KEY` server-only.
- Do not add `VITE_GEMINI_API_KEY`.
- The Z4.9 browser QA script uses a mocked [`MediaRecorder`](../scripts/zoo-z4-9-shadowing-ai-ui-bugfix-qa.cjs) because headless browser microphone capture is environment-dependent.
- A local Vite dev server may still be running on `http://127.0.0.1:5181` from QA.
