# P-English Supabase seed summary

- Status: dry-run-ok-env-missing
- Dry run: yes
- Seed name: penglish_learning_data
- Seed version: 2026-05-29
- Payload preview: reports/supabase-seed-payload-preview.json
- Migration: supabase/migrations/202605290001_penglish_core_schema.sql
- Tables intended/touched: penglish_learning_units, penglish_vocabulary_items, penglish_shadowing_lessons, penglish_speech_prompts, penglish_resources
- Missing required environment variables: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY
- Frontend Supabase URL present locally: no
- Frontend Supabase anon key present locally: no
- Service role key present locally: no
- Gemini key present locally: no

## Counts

- penglish_learning_units: 12
- penglish_vocabulary_items: 260
- penglish_shadowing_lessons: 14
- penglish_speech_prompts: 42
- penglish_resources: 9

## Safety notes

- Seed payload contains app-authored learning data only.
- No `.env` values, tokens, screenshots, reports, build outputs, node_modules, local user data, or private files are uploaded.
- Script performs idempotent upserts only; it does not create, alter, or delete Supabase schema/data outside the target rows.
- Runtime app remains local-first; Supabase runtime reads were not made mandatory.

## Required command order

1. `npx.cmd supabase link --project-ref <PROJECT_REF>`
2. `npx.cmd supabase db push`
3. `node scripts/seed-supabase-penglish-data.mjs`

## Note

Dry-run succeeded and payload was generated. Real seed is skipped until required Supabase environment variables are available.

