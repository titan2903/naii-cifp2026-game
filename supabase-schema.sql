-- ========================================================
-- SUPABASE SCHEMA: CIFP 2026 NAII BOOTH GAME
-- ========================================================

-- 1. Table: Leaderboard (Speed Trivia & Real vs AI)
create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  player_name text not null check (char_length(player_name) between 2 and 50),
  institution text default 'Umum' check (char_length(institution) <= 80),
  game text not null default 'trivia' check (game in ('trivia', 'realvsai')),
  score integer not null default 0 check (score >= 0 and score <= 750),
  correct_count integer not null default 0 check (correct_count >= 0 and correct_count <= total_questions),
  total_questions integer not null default 5 check (total_questions between 1 and 15),
  time_seconds numeric(6, 2) default 0 check (time_seconds >= 0 and time_seconds <= 300),
  session_tag text default 'Break Pagi' check (session_tag in ('Break Pagi', 'Break Siang', 'Break Sore')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_leaderboard_score_desc on public.leaderboard (score desc, time_seconds asc);

alter table public.leaderboard enable row level security;

create policy "Allow anyone to read leaderboard"
  on public.leaderboard for select
  using (true);

create policy "Allow anyone to insert valid score"
  on public.leaderboard for insert
  with check (score >= 0 and score <= 750 and char_length(player_name) between 2 and 50);

alter publication supabase_realtime add table public.leaderboard;

-- 2. Table: Diplomat Personas (Hasil AI Crisis Simulator)
create table if not exists public.diplomat_personas (
  id uuid default gen_random_uuid() primary key,
  player_name text not null check (char_length(player_name) between 2 and 50),
  institution text check (char_length(institution) <= 80),
  scenario_id text not null check (char_length(scenario_id) <= 40),
  option_id text not null check (option_id in ('A', 'B', 'C')),
  persona_title text not null check (char_length(persona_title) <= 60),
  diplomacy_score integer not null check (diplomacy_score between 0 and 100),
  custom_note text check (custom_note is null or char_length(custom_note) <= 280),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diplomat_personas enable row level security;

create policy "Allow anyone to insert diplomat persona"
  on public.diplomat_personas for insert
  with check (diplomacy_score between 0 and 100);

-- 3. Table: Leads (Insert-only untuk kepatuhan privasi UU PDP)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  player_name text not null check (char_length(player_name) between 2 and 50),
  institution text check (char_length(institution) <= 80),
  email text not null check (char_length(email) between 5 and 120 and position('@' in email) > 1),
  consent boolean not null default true check (consent = true),
  source text default 'booth-registration' check (char_length(source) <= 40),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leads enable row level security;

create policy "Allow anyone to insert lead with consent"
  on public.leads for insert
  with check (consent = true);
