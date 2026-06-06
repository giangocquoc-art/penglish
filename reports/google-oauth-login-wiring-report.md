# Google OAuth login wiring report

## Changed files

- `apps/web/src/lib/p-english/userSession.ts`
  - Updated `signInWithGoogle()` to call the existing Supabase client with Google OAuth.
  - Uses `redirectTo = `${window.location.origin}/auth/callback``.
  - Logs real OAuth errors to console and returns a friendly Vietnamese error message.
- `apps/web/src/pages/LoginPage.tsx`
  - Google button is now active and displays `Đăng nhập bằng Google`.
  - Guest/local `Tiếp tục học ngay` remains unchanged.
- `apps/web/src/App.tsx`
  - Added `/auth/callback` as a public auth route.
  - Reuses the existing Supabase callback handler and navigates signed-in users to `/home`.
- `apps/web/vite.config.ts`
  - Added `envDir: '../..'` so the workspace-level `.env.local` is loaded when running/building the web workspace.

## Supabase client used

- `apps/web/src/lib/supabaseClient.ts`
- No Supabase URL or anon key was hardcoded.
- The client continues to use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Route after login

- OAuth redirect route sent to Supabase: `/auth/callback`
- Internal learning route after a valid Supabase session: `/home`

## Validation results

- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit`: passed
- `npm.cmd run build`: passed
- Local QA on `/login`: passed for button state and redirect initiation.

## QA notes

- The Google login button is no longer disabled.
- Clicking the button redirects away from `/login` into the Google/Supabase OAuth flow.
- Google currently returns `redirect_uri_mismatch` from Google OAuth after redirect initiation. The requested redirect URI shown by Google is the Supabase callback URL, so code-side OAuth initiation is working; Google Cloud OAuth configuration still needs the exact callback URI accepted by the OAuth client.

## Screenshots

- `reports/screenshots/google-login-active-button.png`
- `reports/screenshots/google-login-redirect-check.png`
