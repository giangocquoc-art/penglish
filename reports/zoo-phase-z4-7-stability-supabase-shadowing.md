# Zoo Phase Z4.7 — Stability + Supabase + Shadowing Report

## Scope

Phase Z4.7 stabilized the P-English build surface, added a migration-based Supabase data foundation, aligned seeding to safe upsert-only behavior, and persisted deliberate Shadowing feedback attempts without making Supabase mandatory.

## App.tsx duplicate auth fix status

- Inspected `apps/web/src/App.tsx`.
- `AppRoutes` now has a single `useAuth()` call.
- Public routes preserved:
  - `/`
  - `/login`
  - `/login/callback`
  - `/auth/google`
- Learning routes preserved:
  - `/home`
  - `/shadowing`
  - `/english-speed`
  - `/learning-path`
  - `/vocabularies`
  - `/words`
  - `/practice`
  - `/lessons/:lessonId`
- Local guest learning remains available because unauthenticated/non-Supabase sessions continue through the shell and local adapters.

## Supabase migration file created

Created:

- `supabase/migrations/202605290001_penglish_core_schema.sql`

## Tables created by migration

Learning content tables:

1. `public.penglish_learning_units`
2. `public.penglish_vocabulary_items`
3. `public.penglish_shadowing_lessons`
4. `public.penglish_speech_prompts`
5. `public.penglish_resources`
6. `public.penglish_seed_runs`

User runtime tables:

7. `public.penglish_profiles`
8. `public.penglish_daily_progress`
9. `public.penglish_lesson_progress`
10. `public.penglish_vocabulary_progress`
11. `public.penglish_shadowing_attempts`
12. `public.penglish_english_speed_attempts`

## RLS policy summary

- RLS enabled on all user-specific tables.
- Authenticated users can select, insert, update, and delete only rows where `user_id = auth.uid()`.
- Learning content tables are readable by `anon` and `authenticated` users.
- No anonymous write policies were added.
- `penglish_seed_runs` is readable by authenticated users only.
- Service role remains unrestricted by Supabase/Postgres role behavior.

## Seed script changes

Updated `scripts/seed-supabase-penglish-data.mjs`:

- Removed dependency on `/rest/v1/rpc/exec_sql`.
- Removed runtime schema creation logic from the seed path.
- Keeps dry-run mode.
- Keeps payload preview: `reports/supabase-seed-payload-preview.json`.
- Keeps seed summary: `reports/supabase-seed-summary.md`.
- Uses idempotent `upsert` behavior through PostgREST `on_conflict=id`.
- If tables are missing, reports and throws: `Run supabase db push first, then rerun seed.`
- Report includes command order:
  1. `npx.cmd supabase link --project-ref <PROJECT_REF>`
  2. `npx.cmd supabase db push`
  3. `node scripts/seed-supabase-penglish-data.mjs`

## Shadowing save attempt integration

Updated `apps/web/src/pages/ShadowingPage.tsx`:

- Imports `saveShadowingAttempt` from `apps/web/src/lib/p-english/userDataAdapter.ts`.
- On deliberate `So sánh local` click, saves one Shadowing attempt with:
  - `itemId`
  - `lessonId`
  - `level`
  - `targetText`
  - `learnerText`
  - `feedbackSource: "local"`
  - `feedbackJson` containing status, summary, matched words, missing words, extra words, changed words, rhythm tips, and next drills.
- Does not call Gemini.
- Does not save on render.
- Does not block UI if save fails.
- Shows sync status:
  - `Đã lưu lượt luyện trên thiết bị`
  - `Đã đồng bộ lượt luyện`
  - `Chưa đồng bộ được, vẫn lưu local`

## English Speed save audit

Reviewed `apps/web/src/pages/EnglishSpeedPage.tsx`:

- `saveEnglishSpeedAttempt` is called only when a user evaluates an attempt through speech recognition result or manual check.
- It is not called on render.
- It catches Supabase save failures with `.catch(() => {})`, keeping local-first behavior.
- It sends only safe local feedback JSON.
- It does not expose secrets.
- Light user-facing label changed from `Cá voi coach` to `Poo coach`.

## Brand/Poo text changes

Light user-facing replacements were applied where safe:

- `apps/web/src/App.tsx`: loading copy now says `Poo đang chuẩn bị...`.
- `apps/web/src/pages/HomePage.tsx`: home suggestion says `Poo gợi ý...`.
- `apps/web/src/pages/LessonPage.tsx`: lesson coach label says `Poo gợi ý`.
- `apps/web/src/pages/LearningPathPage.tsx`: path copy says reminder from `Poo`.
- `apps/web/src/pages/EnglishSpeedPage.tsx`: label says `Poo coach`.
- `apps/web/src/components/p-english/RecentPracticeMemoryCard.tsx`: suggestion and empty state mention `Poo`.
- `apps/web/src/components/p-english/WhaleCoachCard.tsx`: coach label says `Poo gợi ý`.

Internal whale component names were not renamed.

## Validation results

- `npx.cmd tsc -p apps/web/tsconfig.json --noEmit`: passed.
- `npm.cmd run validate:lessons`: passed.
- `npm.cmd run build`: failed because the local machine ran out of disk space while Rollup/Vite wrote build output.
  - Error: `ENOSPC: no space left on device, write`
  - API TypeScript build completed before the web build write failure.
- `node scripts/seed-supabase-penglish-data.mjs --dry-run`: passed.
- `npx.cmd supabase --version`: attempted only to check CLI availability; failed because npm could not install/cache Supabase CLI due to disk space and missing binary package after partial install.
  - No remote Supabase changes were made.

## Dry-run seed result

Dry-run succeeded and wrote:

- `reports/supabase-seed-payload-preview.json`
- `reports/supabase-seed-summary.md`

Counts:

- `penglish_learning_units`: 12
- `penglish_vocabulary_items`: 260
- `penglish_shadowing_lessons`: 14
- `penglish_speech_prompts`: 42
- `penglish_resources`: 9

Environment missing for real seed:

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_ANON_KEY`

Real seed was not run.

## QA script

Created:

- `scripts/zoo-z4-7-stability-supabase-shadowing-qa.cjs`

It checks:

- `/`, `/login`, `/auth/google`, `/home`, `/shadowing`, `/english-speed`, `/learning-path`, `/vocabulary`, `/words`
- no visible `Pshare` on public pages
- horizontal overflow on `/home` and `/shadowing` at `1366x768` and `390x844`
- Shadowing feedback panel and sync status after local feedback
- serious console/page/request errors

## Screenshots saved

QA script is configured to save:

- `reports/screenshots/zoo-z4-7-home.png`
- `reports/screenshots/zoo-z4-7-shadowing-feedback.png`
- `reports/screenshots/zoo-z4-7-login.png`

Screenshots were not generated in this run because the production build failed from local disk `ENOSPC`, so QA could not be run against a fresh production build server.

## Exact manual commands for the human to run next

1. `npx.cmd supabase login`
2. `npx.cmd supabase link --project-ref <PROJECT_REF>`
3. `npx.cmd supabase db push`
4. Set `SUPABASE_SERVICE_ROLE_KEY` safely in local terminal only.
5. `node scripts/seed-supabase-penglish-data.mjs`
6. `vercel.cmd --prod`

## Safety confirmations

- No production deploy was run.
- No real Supabase seed was run.
- No remote Supabase writes were made.
- Gemini API was not implemented or called.
- No secret key was added to frontend code.
