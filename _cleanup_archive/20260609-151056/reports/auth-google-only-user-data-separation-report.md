# Google-only Auth and User Data Separation Report

## Summary

Implemented and verified the remaining Google-only Supabase auth work for P-English. The current app supports a safe guest/local-device mode when Supabase environment variables are absent, and supports Google OAuth account mode when `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY` are configured.

The main completion fixes were:

- Converted the auth callback side effect in `apps/web/src/pages/LoginPage.tsx` from a `useState` initializer to `useEffect`, preventing repeated callback work during render and making `/auth/callback` safer.
- Changed `syncLocalFoundation48ProgressToCloud` in `apps/web/src/features/foundation48/foundation48CloudProgress.ts` to run the merge path rather than blindly overwriting cloud rows. Local and cloud progress now reconcile before upserting.
- Added `scripts/auth-google-only-qa.cjs` and ran it successfully.

## Changed files

- `apps/web/src/pages/LoginPage.tsx`
  - Login remains Google-only plus guest/local mode.
  - Callback processing now uses `useEffect` and redirects after `auth.refreshSession()`.
- `apps/web/src/features/foundation48/foundation48CloudProgress.ts`
  - Manual/profile/sidebar sync now merges local and cloud Foundation48 progress before saving.
- `scripts/auth-google-only-qa.cjs`
  - New static QA script validating Google-only auth, guest mode, callback route, env handling, Foundation48 contracts, and cloud merge wiring.
- `reports/auth-google-only-qa-results.json`
  - Generated QA result for the new auth script.
- `reports/foundation48-release-qa-results.json`
  - Updated by the release QA run.

## Current auth behavior

- If Supabase env variables are missing:
  - The Supabase client exports `null` instead of constructing an invalid client.
  - The app does not crash.
  - Login/profile/sidebar communicate that Google login is not enabled.
  - Users can continue as guest and learn locally.
- If Supabase env variables are present:
  - Login uses Google OAuth only.
  - No email/password login UI is present.
  - `/auth/callback` refreshes the Supabase session and redirects to the stored intended path or Foundation48.
  - Signed-in users are shown with Google-derived name/email/avatar in profile/sidebar.
- Signed-out users are treated as guest/local-device users:
  - Profile/sidebar display guest state.
  - Progress remains local to the browser/device.

## Supabase env requirements

Frontend auth uses only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

No service-role key is used or expected in the frontend bundle.

Operational requirements in Supabase:

- Google OAuth provider must be enabled.
- Site URL and redirect URLs must allow the deployed origin and `/auth/callback`.
- Tables used by current code must exist with compatible RLS policies:
  - `foundation48_progress`
  - `penglish_profiles` if profile upsert is used by callers.

## Cloud/local progress merge behavior

Foundation48 contracts are preserved:

- localStorage key remains `penglish-foundation48-progress-v1`.
- update event remains `penglish-foundation48-progress-updated`.
- deep lesson loading remains resolver/lazy-module based.

Guest behavior:

- Foundation48 reads and writes localStorage only.
- Guest/local progress remains available without Supabase env configuration.

Signed-in behavior:

- On auth state changes and session hydration, local and cloud Foundation48 progress are merged.
- Per-day merge chooses the more advanced day by completion, current step count, score, then timestamp.
- Merged progress is written back to localStorage and upserted into Supabase by `user_id` + `day_number`.
- Manual sync from profile/sidebar now uses the same merge path, reducing the risk of overwriting more advanced cloud progress with older local progress.

## Build result

Command run:

```bash
npm run build -w @pshare/web
```

Result: passed.

Notes:

- Vite emitted chunking warnings because `supabaseClient.ts` and `foundation48CloudProgress.ts` are both statically and dynamically imported in different places. These are warnings, not build failures.

## QA result

Commands run:

```bash
node scripts/auth-google-only-qa.cjs
node scripts/foundation48-release-qa.cjs
```

Results:

- `scripts/auth-google-only-qa.cjs`: passed, 8/8 checks.
- `scripts/foundation48-release-qa.cjs`: passed.
  - Errors: 0
  - Console errors: 0
  - Failed requests: 0
  - Lazy stage modules observed for stages 3 through 8.

The release QA generated/updated `reports/foundation48-release-qa-results.json` and screenshots under `reports/screenshots/`.

## Known risks

- Supabase database schema/RLS was not validated live in this pass. If `foundation48_progress` or `penglish_profiles` are missing, named differently, or have restrictive RLS, cloud sync can fail while guest/local mode continues working.
- Google OAuth cannot be fully end-to-end verified without configured Supabase credentials and provider settings in the active environment.
- Vite chunking warnings indicate the current static imports reduce the intended dynamic chunk separation for Supabase/cloud progress modules. Runtime build passes, but optimizing imports later could improve resolver-only/lazy separation.
- The preview server started for QA remains running in the active terminal on port 5180.
