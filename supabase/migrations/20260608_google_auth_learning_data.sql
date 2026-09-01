create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.foundation48_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null,
  current_step int default 1,
  completed boolean default false,
  correct_count int default 0,
  wrong_count int default 0,
  score int default 0,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, day_number)
);

create table if not exists public.user_vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  meaning text,
  source text default 'foundation48',
  source_day int,
  status text default 'learning',
  review_count int default 0,
  next_review_at timestamptz,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shadowing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text default 'shadowing',
  prompt_text text,
  feedback jsonb default '{}'::jsonb,
  score int,
  created_at timestamptz default now()
);

create table if not exists public.user_learning_summary (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_foundation48_day int default 1,
  completed_days int default 0,
  streak_days int default 0,
  last_studied_at timestamptz,
  payload jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.foundation48_progress enable row level security;
alter table public.user_vocabulary_items enable row level security;
alter table public.shadowing_attempts enable row level security;
alter table public.user_learning_summary enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own foundation48 progress" on public.foundation48_progress;
create policy "Users can read own foundation48 progress"
on public.foundation48_progress for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own foundation48 progress" on public.foundation48_progress;
create policy "Users can insert own foundation48 progress"
on public.foundation48_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own foundation48 progress" on public.foundation48_progress;
create policy "Users can update own foundation48 progress"
on public.foundation48_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own foundation48 progress" on public.foundation48_progress;
create policy "Users can delete own foundation48 progress"
on public.foundation48_progress for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own vocab" on public.user_vocabulary_items;
create policy "Users can read own vocab"
on public.user_vocabulary_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own vocab" on public.user_vocabulary_items;
create policy "Users can insert own vocab"
on public.user_vocabulary_items for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own vocab" on public.user_vocabulary_items;
create policy "Users can update own vocab"
on public.user_vocabulary_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own vocab" on public.user_vocabulary_items;
create policy "Users can delete own vocab"
on public.user_vocabulary_items for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own shadowing attempts" on public.shadowing_attempts;
create policy "Users can read own shadowing attempts"
on public.shadowing_attempts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own shadowing attempts" on public.shadowing_attempts;
create policy "Users can insert own shadowing attempts"
on public.shadowing_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own learning summary" on public.user_learning_summary;
create policy "Users can read own learning summary"
on public.user_learning_summary for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own learning summary" on public.user_learning_summary;
create policy "Users can insert own learning summary"
on public.user_learning_summary for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own learning summary" on public.user_learning_summary;
create policy "Users can update own learning summary"
on public.user_learning_summary for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
