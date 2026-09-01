create extension if not exists pgcrypto;

create table if not exists public.penglish_learning_units (
  id text primary key,
  cefr_level text not null,
  title_vi text not null,
  subtitle_vi text not null,
  skill_focus text not null,
  estimated_time text not null,
  lesson_ids jsonb not null default '[]'::jsonb,
  source_ids jsonb not null default '[]'::jsonb,
  primary_mode text not null,
  recommended_practice_modes jsonb not null default '[]'::jsonb,
  unlocked_by_unit_id text,
  sort_order integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_vocabulary_items (
  id text primary key,
  term text not null,
  word text not null,
  cefr_level text not null,
  part_of_speech text,
  part_of_speech_or_type text,
  meaning_vi text not null,
  simple_english_meaning text,
  example text,
  example_meaning_vi text,
  difficulty text,
  tags jsonb not null default '[]'::jsonb,
  group_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_shadowing_lessons (
  id text primary key,
  title_vi text not null,
  title_en text not null,
  cefr_level text not null,
  topic text not null,
  description_vi text not null,
  estimated_time text not null,
  transcript text not null,
  sort_order integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_speech_prompts (
  id text primary key,
  title_vi text not null,
  cefr_level text not null,
  prompt_type text not null,
  prompt_text text not null,
  vietnamese_meaning text not null,
  sort_order integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_resources (
  id text primary key,
  title_vi text not null,
  category text not null,
  cefr_levels jsonb not null default '[]'::jsonb,
  skill_tags jsonb not null default '[]'::jsonb,
  level_hint text,
  summary_vi text not null,
  url text not null,
  is_free boolean not null default true,
  sort_order integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_seed_runs (
  id text primary key,
  seed_name text not null,
  seed_version text not null,
  dry_run boolean not null default false,
  counts jsonb not null default '{}'::jsonb,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.penglish_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  mode text not null default 'signed_in',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.penglish_daily_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_date date not null,
  xp integer not null default 0,
  lessons_touched integer not null default 0,
  words_reviewed integer not null default 0,
  pronunciation_attempts integer not null default 0,
  shadowing_sentences integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, progress_date)
);

create table if not exists public.penglish_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'in_progress',
  progress_percent integer not null default 0,
  completed_steps jsonb not null default '[]'::jsonb,
  last_mode text,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.penglish_vocabulary_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  word text,
  level text,
  status text not null default 'learning',
  review_count integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  ease numeric not null default 2.5,
  due_at timestamptz,
  last_reviewed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table if not exists public.penglish_shadowing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text,
  lesson_id text,
  level text,
  target_text text not null,
  learner_text text,
  feedback_source text not null default 'local',
  feedback_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.penglish_english_speed_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text,
  level text,
  target_text text not null,
  learner_text text,
  score integer,
  feedback_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists penglish_profiles_user_id_idx on public.penglish_profiles (user_id);
create index if not exists penglish_daily_progress_user_date_idx on public.penglish_daily_progress (user_id, progress_date desc);
create index if not exists penglish_daily_progress_date_idx on public.penglish_daily_progress (progress_date desc);
create index if not exists penglish_lesson_progress_user_lesson_idx on public.penglish_lesson_progress (user_id, lesson_id);
create index if not exists penglish_lesson_progress_lesson_id_idx on public.penglish_lesson_progress (lesson_id);
create index if not exists penglish_vocabulary_progress_user_word_idx on public.penglish_vocabulary_progress (user_id, word_id);
create index if not exists penglish_vocabulary_progress_word_id_idx on public.penglish_vocabulary_progress (word_id);
create index if not exists penglish_shadowing_attempts_user_created_idx on public.penglish_shadowing_attempts (user_id, created_at desc);
create index if not exists penglish_shadowing_attempts_lesson_id_idx on public.penglish_shadowing_attempts (lesson_id);
create index if not exists penglish_shadowing_attempts_created_at_idx on public.penglish_shadowing_attempts (created_at desc);
create index if not exists penglish_english_speed_attempts_user_created_idx on public.penglish_english_speed_attempts (user_id, created_at desc);
create index if not exists penglish_english_speed_attempts_prompt_id_idx on public.penglish_english_speed_attempts (prompt_id);
create index if not exists penglish_english_speed_attempts_created_at_idx on public.penglish_english_speed_attempts (created_at desc);
create index if not exists penglish_learning_units_sort_idx on public.penglish_learning_units (sort_order);
create index if not exists penglish_vocabulary_items_level_idx on public.penglish_vocabulary_items (cefr_level);
create index if not exists penglish_shadowing_lessons_sort_idx on public.penglish_shadowing_lessons (sort_order);
create index if not exists penglish_speech_prompts_sort_idx on public.penglish_speech_prompts (sort_order);
create index if not exists penglish_resources_sort_idx on public.penglish_resources (sort_order);

alter table public.penglish_profiles enable row level security;
alter table public.penglish_daily_progress enable row level security;
alter table public.penglish_lesson_progress enable row level security;
alter table public.penglish_vocabulary_progress enable row level security;
alter table public.penglish_shadowing_attempts enable row level security;
alter table public.penglish_english_speed_attempts enable row level security;

alter table public.penglish_learning_units enable row level security;
alter table public.penglish_vocabulary_items enable row level security;
alter table public.penglish_shadowing_lessons enable row level security;
alter table public.penglish_speech_prompts enable row level security;
alter table public.penglish_resources enable row level security;
alter table public.penglish_seed_runs enable row level security;

drop policy if exists "penglish_learning_units_read" on public.penglish_learning_units;
create policy "penglish_learning_units_read" on public.penglish_learning_units for select to anon, authenticated using (true);

drop policy if exists "penglish_vocabulary_items_read" on public.penglish_vocabulary_items;
create policy "penglish_vocabulary_items_read" on public.penglish_vocabulary_items for select to anon, authenticated using (true);

drop policy if exists "penglish_shadowing_lessons_read" on public.penglish_shadowing_lessons;
create policy "penglish_shadowing_lessons_read" on public.penglish_shadowing_lessons for select to anon, authenticated using (true);

drop policy if exists "penglish_speech_prompts_read" on public.penglish_speech_prompts;
create policy "penglish_speech_prompts_read" on public.penglish_speech_prompts for select to anon, authenticated using (true);

drop policy if exists "penglish_resources_read" on public.penglish_resources;
create policy "penglish_resources_read" on public.penglish_resources for select to anon, authenticated using (true);

drop policy if exists "penglish_seed_runs_read_authenticated" on public.penglish_seed_runs;
create policy "penglish_seed_runs_read_authenticated" on public.penglish_seed_runs for select to authenticated using (true);

drop policy if exists "penglish_profiles_select_own" on public.penglish_profiles;
create policy "penglish_profiles_select_own" on public.penglish_profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_profiles_insert_own" on public.penglish_profiles;
create policy "penglish_profiles_insert_own" on public.penglish_profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_profiles_update_own" on public.penglish_profiles;
create policy "penglish_profiles_update_own" on public.penglish_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_profiles_delete_own" on public.penglish_profiles;
create policy "penglish_profiles_delete_own" on public.penglish_profiles for delete to authenticated using (user_id = auth.uid());

drop policy if exists "penglish_daily_progress_select_own" on public.penglish_daily_progress;
create policy "penglish_daily_progress_select_own" on public.penglish_daily_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_daily_progress_insert_own" on public.penglish_daily_progress;
create policy "penglish_daily_progress_insert_own" on public.penglish_daily_progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_daily_progress_update_own" on public.penglish_daily_progress;
create policy "penglish_daily_progress_update_own" on public.penglish_daily_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_daily_progress_delete_own" on public.penglish_daily_progress;
create policy "penglish_daily_progress_delete_own" on public.penglish_daily_progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists "penglish_lesson_progress_select_own" on public.penglish_lesson_progress;
create policy "penglish_lesson_progress_select_own" on public.penglish_lesson_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_lesson_progress_insert_own" on public.penglish_lesson_progress;
create policy "penglish_lesson_progress_insert_own" on public.penglish_lesson_progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_lesson_progress_update_own" on public.penglish_lesson_progress;
create policy "penglish_lesson_progress_update_own" on public.penglish_lesson_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_lesson_progress_delete_own" on public.penglish_lesson_progress;
create policy "penglish_lesson_progress_delete_own" on public.penglish_lesson_progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists "penglish_vocabulary_progress_select_own" on public.penglish_vocabulary_progress;
create policy "penglish_vocabulary_progress_select_own" on public.penglish_vocabulary_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_vocabulary_progress_insert_own" on public.penglish_vocabulary_progress;
create policy "penglish_vocabulary_progress_insert_own" on public.penglish_vocabulary_progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_vocabulary_progress_update_own" on public.penglish_vocabulary_progress;
create policy "penglish_vocabulary_progress_update_own" on public.penglish_vocabulary_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_vocabulary_progress_delete_own" on public.penglish_vocabulary_progress;
create policy "penglish_vocabulary_progress_delete_own" on public.penglish_vocabulary_progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists "penglish_shadowing_attempts_select_own" on public.penglish_shadowing_attempts;
create policy "penglish_shadowing_attempts_select_own" on public.penglish_shadowing_attempts for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_shadowing_attempts_insert_own" on public.penglish_shadowing_attempts;
create policy "penglish_shadowing_attempts_insert_own" on public.penglish_shadowing_attempts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_shadowing_attempts_update_own" on public.penglish_shadowing_attempts;
create policy "penglish_shadowing_attempts_update_own" on public.penglish_shadowing_attempts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_shadowing_attempts_delete_own" on public.penglish_shadowing_attempts;
create policy "penglish_shadowing_attempts_delete_own" on public.penglish_shadowing_attempts for delete to authenticated using (user_id = auth.uid());

drop policy if exists "penglish_english_speed_attempts_select_own" on public.penglish_english_speed_attempts;
create policy "penglish_english_speed_attempts_select_own" on public.penglish_english_speed_attempts for select to authenticated using (user_id = auth.uid());
drop policy if exists "penglish_english_speed_attempts_insert_own" on public.penglish_english_speed_attempts;
create policy "penglish_english_speed_attempts_insert_own" on public.penglish_english_speed_attempts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "penglish_english_speed_attempts_update_own" on public.penglish_english_speed_attempts;
create policy "penglish_english_speed_attempts_update_own" on public.penglish_english_speed_attempts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "penglish_english_speed_attempts_delete_own" on public.penglish_english_speed_attempts;
create policy "penglish_english_speed_attempts_delete_own" on public.penglish_english_speed_attempts for delete to authenticated using (user_id = auth.uid());
