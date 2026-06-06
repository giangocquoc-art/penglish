# Phase Z4.8R — Shadowing API-first speaking flow

## Scope

Forced the Shadowing learner flow to be recording-first:

1. User listens to the current sentence.
2. User clicks **Bắt đầu ghi âm**.
3. Browser records audio with `MediaRecorder`.
4. User clicks **Dừng và gửi Poo chấm**.
5. Frontend posts audio to `/api/shadowing-feedback`.
6. Poo shows AI feedback or a clear missing-key/API error state.

No deployment was performed.
No Supabase seed was run.
No Supabase schema changes were made.

## Files changed

- `apps/web/src/pages/ShadowingPage.tsx`
- `apps/web/src/lib/p-english/shadowingApiClient.ts`
- `api/shadowing-feedback.ts`
- `scripts/zoo-z4-8r-shadowing-api-first-qa.cjs`
- `reports/zoo-z4-8-gemini-env-setup.md`

## Removed visible old UI strings

The main Shadowing page no longer shows these old manual/local feedback strings:

- `Nhập lại câu bạn vừa nói`
- `Bạn vừa nói/nghe được gì?`
- `So sánh local`
- `Local feedback`
- `Không gửi Gemini/API`
- `Poo đang dùng phản hồi local`
- `Gemini API chưa bật trong trang này.`

A source search and browser QA both confirmed these strings are not visible in the main Shadowing flow.

## New API-first recording UI

The old side-by-side manual typing panel was replaced with a recording card:

- Title: `Ghi âm câu bạn vừa nói`
- Subtitle: `Nghe câu mẫu, nói đuổi theo nhịp, rồi Poo sẽ gửi bản ghi để AI góp ý.`
- Idle button: `Bắt đầu ghi âm`
- Recording button: `Dừng và gửi Poo chấm`
- Badge: `AI feedback`
- Recording state shows timer and pulse.
- Analyzing state disables record actions and shows `Poo đang nghe lại và phân tích cách nói của bạn…`.
- Missing API key state shows `API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel.`.
- Microphone denied state shows `Trình duyệt chưa cho phép micro. Hãy bật quyền micro rồi thử lại.`.

## API route

Created server route:

- `api/shadowing-feedback.ts`
- Endpoint: `POST /api/shadowing-feedback`
- Server-only env: `GEMINI_API_KEY`

Missing key response:

```json
{
  "ok": false,
  "error": "GEMINI_API_KEY_MISSING",
  "message": "API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel."
}
```

The route accepts multipart form data from the frontend helper and sends audio to Gemini using inline audio data. The prompt requires strict JSON and Vietnamese beginner-friendly feedback.

## Frontend API client

Created `apps/web/src/lib/p-english/shadowingApiClient.ts`.

Responsibilities:

- Accept recorded `Blob` plus sentence metadata.
- POST to `/api/shadowing-feedback`.
- Normalize success payloads.
- Normalize missing-key, network, invalid JSON, no-audio, and API errors.
- Never includes an API key.

## Secret safety

Confirmed:

- No `VITE_GEMINI_API_KEY` usage in frontend source.
- No frontend `process.env.GEMINI_API_KEY` reference.
- Gemini calls happen only through server route `api/shadowing-feedback.ts`.

## saveShadowingAttempt behavior

`ShadowingPage.tsx` saves attempts only after an API result or API failure:

- `feedbackSource: "gemini"` on API success.
- `feedbackSource: "api-missing-key"` when server returns missing-key state.
- `feedbackSource: "api-error"` for network/API failure.
- `learnerText` uses the API/Gemini transcript on success.
- `feedbackJson` stores the normalized full result/failure object.
- Guest/local mode remains safe because `saveShadowingAttempt` already falls back without crashing.

## Screenshots saved

- `reports/screenshots/zoo-z4-8r-shadowing-api-first-desktop.png`
- `reports/screenshots/zoo-z4-8r-shadowing-api-first-mobile.png`
- `reports/screenshots/zoo-z4-8r-shadowing-api-missing-key.png`
- `reports/screenshots/zoo-z4-8r-home-regression.png`

## Validation results

Passed:

```cmd
npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build
node scripts/zoo-z4-8r-shadowing-api-first-qa.cjs
```

QA notes:

- Dev server was available at `http://127.0.0.1:5181`.
- Recording interaction used mocked `MediaRecorder` because headless browser microphone permission is environment-dependent.
- QA fails if the old manual/local strings are visible.
- QA checks `/home`, `/shadowing`, `/english-speed`, no `Pshare` text, no broken images, no horizontal overflow at desktop/mobile, and no frontend `VITE_GEMINI_API_KEY` reference.

Build warning:

- Existing Vite chunk-size warning remains for large chunks; build still passed.

## Known limitations

- Real Gemini analysis requires `GEMINI_API_KEY` in the server/Vercel environment.
- Local Vite dev server can show the missing-key state when the API route is mocked or not served by Vercel dev.
- Headless QA mocks microphone recording; real device microphone behavior should be manually checked in a browser.

## Next manual command / action for Vercel

Add `GEMINI_API_KEY` in Vercel Project Settings → Environment Variables, then redeploy the Vercel project.
