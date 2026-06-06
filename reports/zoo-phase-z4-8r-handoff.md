# Z4.8R Handoff — Shadowing API-first speaking flow

## Status

Complete. Phase stopped after implementation, validation, QA, screenshots, and reports.

## What changed

Shadowing now defaults to an API-first speaking flow:

- The main visible manual typed-feedback UI was removed.
- Learners record audio instead of typing what they said.
- Stopping the recording automatically sends audio to `/api/shadowing-feedback`.
- Poo displays AI feedback or a clear missing-key/API error.

## Important files

- `apps/web/src/pages/ShadowingPage.tsx`
  - Recording-first UI.
  - `MediaRecorder` start/stop flow.
  - API result/error rendering.
  - `saveShadowingAttempt` integration.

- `apps/web/src/lib/p-english/shadowingApiClient.ts`
  - Frontend API client.
  - Posts recorded blob to `/api/shadowing-feedback`.
  - Normalizes API success/failure.
  - No API key.

- `api/shadowing-feedback.ts`
  - Vercel-compatible server route.
  - Reads `process.env.GEMINI_API_KEY` server-side.
  - Returns `GEMINI_API_KEY_MISSING` with HTTP 503 if missing.
  - Calls Gemini using inline audio data and strict JSON prompt.

- `scripts/zoo-z4-8r-shadowing-api-first-qa.cjs`
  - Fails if old manual/local feedback strings appear.
  - Captures required screenshots.
  - Mocks microphone for missing-key state.

- `reports/zoo-z4-8-gemini-env-setup.md`
  - Local and Vercel env setup guide.

## Removed old visible strings

The main Shadowing page should not visibly contain:

- `Nhập lại câu bạn vừa nói`
- `Bạn vừa nói/nghe được gì?`
- `So sánh local`
- `Local feedback`
- `Không gửi Gemini/API`
- `Poo đang dùng phản hồi local`

## Required server env

- `GEMINI_API_KEY`

Do not use:

- `VITE_GEMINI_API_KEY`

## Persistence behavior

`saveShadowingAttempt` is called after API completion/failure only:

- Success: `feedbackSource: "gemini"`
- Missing key: `feedbackSource: "api-missing-key"`
- Other failure: `feedbackSource: "api-error"`

Guest/local mode continues to work safely.

## Validation passed

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
node scripts/zoo-z4-8r-shadowing-api-first-qa.cjs
```

## Screenshots

- `reports/screenshots/zoo-z4-8r-shadowing-api-first-desktop.png`
- `reports/screenshots/zoo-z4-8r-shadowing-api-first-mobile.png`
- `reports/screenshots/zoo-z4-8r-shadowing-api-missing-key.png`
- `reports/screenshots/zoo-z4-8r-home-regression.png`

## Known limitations

- Real audio-to-Gemini requires Vercel/server runtime with `GEMINI_API_KEY`.
- QA used a mocked `MediaRecorder` for recording because headless browser microphone access is environment-dependent.
- Existing Vite chunk-size warning remains but does not block build.

## Stop point

Do not proceed to another phase automatically.
