# Z4.8R Gemini environment setup

Shadowing AI feedback uses a server-side Vercel API route only:

- Endpoint: `/api/shadowing-feedback`
- Secret name: `GEMINI_API_KEY`
- Frontend public env is not used for Gemini.
- Do not create or use `VITE_GEMINI_API_KEY`.

## Local development

For Vercel-style local API testing, set `GEMINI_API_KEY` in the server runtime environment before starting the local Vercel/dev server that serves `/api/shadowing-feedback`.

Example PowerShell session:

```powershell
$env:GEMINI_API_KEY="your-server-side-key"
vercel dev
```

Example cmd.exe session:

```cmd
set GEMINI_API_KEY=your-server-side-key
vercel dev
```

## Vercel production/preview

Add the environment variable in Vercel Project Settings:

1. Open the Vercel project.
2. Go to Settings → Environment Variables.
3. Add `GEMINI_API_KEY`.
4. Select Preview and Production as needed.
5. Redeploy after saving the variable.

The app intentionally returns this soft error when the key is missing:

```json
{
  "ok": false,
  "error": "GEMINI_API_KEY_MISSING",
  "message": "API góp ý chưa bật. Cần thêm GEMINI_API_KEY trên server/Vercel."
}
```

This protects learners from a broken page while keeping the API key server-side.
