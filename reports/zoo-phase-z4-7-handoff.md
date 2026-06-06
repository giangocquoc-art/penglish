# Zoo Phase Z4.7 — Handoff

## Completed

- Read `DESIGN.md` and required project files before implementation.
- Stabilized `apps/web/src/App.tsx` auth usage by confirming `AppRoutes` uses one `useAuth()` call and preserving public/local learning routes.
- Created `supabase/migrations/202605290001_penglish_core_schema.sql` with learning content tables, user runtime tables, primary keys, timestamps, JSONB payloads/feedback, and RLS policies.
- Updated `scripts/seed-supabase-penglish-data.mjs` to stop using unavailable `rpc/exec_sql`; schema is now migration-first and seed is upsert-only.
- Integrated Shadowing save attempts in `apps/web/src/pages/ShadowingPage.tsx` on deliberate local feedback clicks.
- Audited English Speed persistence in `apps/web/src/pages/EnglishSpeedPage.tsx`; it remains local-first and catches Supabase failures.
- Applied light user-facing `Poo` naming pass without renaming internal whale components.
- Created QA script: `scripts/zoo-z4-7-stability-supabase-shadowing-qa.cjs`.
- Created main report: `reports/zoo-phase-z4-7-stability-supabase-shadowing.md`.

## Validation status

Passed:

- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit`
- `npm.cmd run validate:lessons`
- `node scripts/seed-supabase-penglish-data.mjs --dry-run`

Blocked by local environment:

- `npm.cmd run build` failed with `ENOSPC: no space left on device, write` during Vite/Rollup output writing.
- `npx.cmd supabase --version` could not complete because npm/Supabase CLI installation also hit disk-space/cache issues.

No deploy was run. No real Supabase seed was run. No remote Supabase writes were made.

## Files changed/created

Created:

- `supabase/migrations/202605290001_penglish_core_schema.sql`
- `scripts/zoo-z4-7-stability-supabase-shadowing-qa.cjs`
- `reports/zoo-phase-z4-7-stability-supabase-shadowing.md`
- `reports/zoo-phase-z4-7-handoff.md`

Updated:

- `apps/web/src/pages/ShadowingPage.tsx`
- `scripts/seed-supabase-penglish-data.mjs`
- `apps/web/src/App.tsx`
- `apps/web/src/pages/EnglishSpeedPage.tsx`
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/pages/LessonPage.tsx`
- `apps/web/src/pages/LearningPathPage.tsx`
- `apps/web/src/components/p-english/RecentPracticeMemoryCard.tsx`
- `apps/web/src/components/p-english/WhaleCoachCard.tsx`
- `reports/supabase-seed-payload-preview.json`
- `reports/supabase-seed-summary.md`

## Notes for next human review

1. Free disk space before rerunning production build and QA.
2. Re-run:
   - `npm.cmd run build`
   - Start/serve the app locally.
   - `node scripts/zoo-z4-7-stability-supabase-shadowing-qa.cjs`
3. After reviewing the migration, run Supabase commands manually:
   1. `npx.cmd supabase login`
   2. `npx.cmd supabase link --project-ref <PROJECT_REF>`
   3. `npx.cmd supabase db push`
   4. Set `SUPABASE_SERVICE_ROLE_KEY` safely in local terminal only.
   5. `node scripts/seed-supabase-penglish-data.mjs`
   6. `vercel.cmd --prod`

## Safety reminders

- Keep `SUPABASE_SERVICE_ROLE_KEY` server/local-terminal only.
- Keep Gemini keys server-side only.
- Frontend may use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Do not claim Gemini is active; Shadowing remains local feedback in this phase.
