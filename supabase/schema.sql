-- Mustang Capital Group — Mustang Terminal Schema
-- Run this in the Supabase SQL Editor after creating a new project.

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (auto-created on signup via trigger)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'analyst' check (role in ('officer', 'analyst')),
  created_at timestamptz not null default now()
);

-- Auto-create profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- IMPORTANT: This function bypasses RLS to avoid infinite recursion when
-- policies on other tables need to check the caller's role.
create or replace function get_my_role()
returns text language sql security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- ============================================================
-- HOLDINGS
-- ============================================================

create table holdings (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  company_name text not null,
  sector text not null,
  shares numeric not null check (shares >= 0),
  cost_basis numeric not null check (cost_basis >= 0),
  target_weight numeric not null default 0 check (target_weight >= 0 and target_weight <= 1),
  book_value numeric generated always as (shares * cost_basis) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- NAV HISTORY
-- ============================================================

create table nav_history (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  nav numeric not null,
  benchmark_value numeric not null
);

-- ============================================================
-- PITCHES
-- ============================================================

create table pitches (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  company_name text not null,
  sector text not null,
  thesis text not null,
  valuation_summary text not null default '',
  target_price numeric not null,
  current_price numeric not null default 0,
  recommendation text not null default 'Buy' check (recommendation in ('Buy', 'Sell', 'Hold')),
  key_risks text[] not null default '{}',
  submitted_by uuid not null references profiles(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_rationale text,
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PITCH VOTES
-- ============================================================

create table pitch_votes (
  id uuid primary key default uuid_generate_v4(),
  pitch_id uuid not null references pitches(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  vote text not null check (vote in ('buy', 'pass')),
  created_at timestamptz not null default now(),
  unique(pitch_id, user_id)
);

-- ============================================================
-- RESEARCH NOTES
-- ============================================================

create table research_notes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  ticker text,
  content text not null default '',
  tags text[] not null default '{}',
  author_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full-text search column
alter table research_notes add column fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(ticker, '') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) stored;

create index research_notes_fts_idx on research_notes using gin(fts);

-- ============================================================
-- FLASHCARDS
-- ============================================================

create table flashcards (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FLASHCARD PROGRESS
-- ============================================================

create table flashcard_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references flashcards(id) on delete cascade,
  state text not null default 'unseen' check (state in ('known', 'review', 'unseen')),
  updated_at timestamptz not null default now(),
  unique(user_id, card_id)
);

-- ============================================================
-- DCF SCENARIOS
-- ============================================================

create table dcf_scenarios (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ticker text not null,
  user_id uuid not null references profiles(id) on delete cascade,
  inputs jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FUND SETTINGS (single row)
-- ============================================================

create table fund_settings (
  id uuid primary key default uuid_generate_v4(),
  fund_name text not null default 'Mustang Capital Group',
  aum_inception numeric not null default 1000000,
  inception_date date not null default '2026-01-15',
  benchmark_ticker text not null default 'SPY',
  cash_balance numeric not null default 0,
  concentration_limit numeric not null default 0.25
);

-- Insert default fund settings row
insert into fund_settings (fund_name, aum_inception, inception_date, benchmark_ticker, cash_balance, concentration_limit)
values ('Mustang Capital Group', 1000000, '2026-01-15', 'SPY', 87500, 0.25);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table holdings enable row level security;
alter table nav_history enable row level security;
alter table pitches enable row level security;
alter table pitch_votes enable row level security;
alter table research_notes enable row level security;
alter table flashcards enable row level security;
alter table flashcard_progress enable row level security;
alter table dcf_scenarios enable row level security;
alter table fund_settings enable row level security;

-- profiles: users see their own; officers see all
create policy "profiles_select_own" on profiles for select
  using (id = auth.uid() or get_my_role() = 'officer');
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_insert_trigger" on profiles for insert
  with check (true); -- allow trigger insert

-- holdings: all authenticated read; officer all operations
create policy "holdings_select" on holdings for select
  using (auth.uid() is not null);
create policy "holdings_officer" on holdings for all
  using (get_my_role() = 'officer')
  with check (get_my_role() = 'officer');

-- nav_history: all authenticated read; officer insert
create policy "nav_select" on nav_history for select
  using (auth.uid() is not null);
create policy "nav_officer" on nav_history for insert
  with check (get_my_role() = 'officer');

-- pitches: all authenticated read; any user insert their own; officer update
create policy "pitches_select" on pitches for select
  using (auth.uid() is not null);
create policy "pitches_insert" on pitches for insert
  with check (submitted_by = auth.uid());
create policy "pitches_officer_update" on pitches for update
  using (get_my_role() = 'officer');

-- pitch_votes: all authenticated read; upsert/delete own vote
create policy "votes_select" on pitch_votes for select
  using (auth.uid() is not null);
create policy "votes_insert" on pitch_votes for insert
  with check (user_id = auth.uid());
create policy "votes_delete" on pitch_votes for delete
  using (user_id = auth.uid());

-- research_notes: all authenticated read; author or officer write
create policy "notes_select" on research_notes for select
  using (auth.uid() is not null);
create policy "notes_insert" on research_notes for insert
  with check (author_id = auth.uid());
create policy "notes_update" on research_notes for update
  using (author_id = auth.uid() or get_my_role() = 'officer');
create policy "notes_delete" on research_notes for delete
  using (author_id = auth.uid() or get_my_role() = 'officer');

-- flashcards: all authenticated read; officer all
create policy "cards_select" on flashcards for select
  using (auth.uid() is not null);
create policy "cards_officer" on flashcards for all
  using (get_my_role() = 'officer')
  with check (get_my_role() = 'officer');

-- flashcard_progress: own records only
create policy "progress_own" on flashcard_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- dcf_scenarios: own records only
create policy "dcf_own" on dcf_scenarios for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- fund_settings: all authenticated read; officer update
create policy "settings_select" on fund_settings for select
  using (auth.uid() is not null);
create policy "settings_officer_update" on fund_settings for update
  using (get_my_role() = 'officer');
