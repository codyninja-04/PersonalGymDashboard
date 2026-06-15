-- FORGE Schema · v2 (multi-phase + lifestyle + measurements + photos)
-- Idempotent: safe to re-run on an existing project.

-- ============================================================================
-- PROFILES
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Athlete',
  age int not null default 21,
  gender text not null default 'male' check (gender in ('male', 'female')),
  height_cm numeric not null default 178,
  current_weight_kg numeric not null default 72,
  estimated_bf numeric not null default 0.21,
  goal text not null default 'recomp' check (goal in ('recomp', 'cut', 'bulk')),
  phase text not null default 'cut-moderate',
  target_bf numeric not null default 0.11,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists phase_started_at timestamptz default now();
alter table public.profiles add column if not exists last_deload_at timestamptz;
-- Custom workout split, synced across the user's devices.
alter table public.profiles add column if not exists split jsonb;
alter table public.profiles add column if not exists split_template text;

-- ============================================================================
-- WEIGHT HISTORY
-- ============================================================================
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists weight_logs_user_date on public.weight_logs (user_id, date desc);

-- ============================================================================
-- BODY FAT HISTORY
-- ============================================================================
create table if not exists public.bf_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bf numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists bf_logs_user_date on public.bf_logs (user_id, date desc);

-- ============================================================================
-- PERSONAL RECORDS
-- ============================================================================
create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  weight numeric not null,
  reps int not null,
  date date not null,
  estimated_one_rm numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists pr_user_date on public.personal_records (user_id, date desc);

-- ============================================================================
-- WORKOUT SESSIONS
-- ============================================================================
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  split_key text not null,
  split_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  total_volume_kg numeric not null default 0,
  sets jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists session_user_date on public.workout_sessions (user_id, date desc);

-- ============================================================================
-- DAILY NUTRITION + LIFESTYLE
-- ============================================================================
create table if not exists public.daily_fuel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fats int not null default 0,
  water_liters numeric not null default 0,
  creatine_taken boolean not null default false,
  meals jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.daily_fuel add column if not exists sleep_hours numeric;
alter table public.daily_fuel add column if not exists steps int;
alter table public.daily_fuel add column if not exists energy_rating int;     -- 1-5
alter table public.daily_fuel add column if not exists soreness_rating int;   -- 1-5
alter table public.daily_fuel add column if not exists notes text;
create index if not exists fuel_user_date on public.daily_fuel (user_id, date desc);

-- ============================================================================
-- BODY MEASUREMENTS
-- ============================================================================
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  neck_cm numeric,
  thigh_cm numeric,
  hip_cm numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists meas_user_date on public.body_measurements (user_id, date desc);

-- ============================================================================
-- PROGRESS PHOTOS (metadata; actual files in Storage)
-- ============================================================================
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  pose text not null default 'front' check (pose in ('front', 'side', 'back', 'double-bi')),
  storage_path text not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists photos_user_date on public.progress_photos (user_id, date desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.weight_logs enable row level security;
alter table public.bf_logs enable row level security;
alter table public.personal_records enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.daily_fuel enable row level security;
alter table public.body_measurements enable row level security;
alter table public.progress_photos enable row level security;

drop policy if exists "profiles owner select" on public.profiles;
drop policy if exists "profiles owner insert" on public.profiles;
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner select" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id);

do $$
declare
  t text;
begin
  foreach t in array array[
    'weight_logs','bf_logs','personal_records','workout_sessions',
    'daily_fuel','body_measurements','progress_photos'
  ] loop
    execute format('drop policy if exists "%s owner select" on public.%I', t, t);
    execute format('drop policy if exists "%s owner insert" on public.%I', t, t);
    execute format('drop policy if exists "%s owner update" on public.%I', t, t);
    execute format('drop policy if exists "%s owner delete" on public.%I', t, t);
    execute format('create policy "%s owner select" on public.%I for select using (auth.uid() = user_id)', t, t);
    execute format('create policy "%s owner insert" on public.%I for insert with check (auth.uid() = user_id)', t, t);
    execute format('create policy "%s owner update" on public.%I for update using (auth.uid() = user_id)', t, t);
    execute format('create policy "%s owner delete" on public.%I for delete using (auth.uid() = user_id)', t, t);
  end loop;
end $$;

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKET: progress-photos
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('progress-photos', 'progress-photos', false)
  on conflict (id) do nothing;

drop policy if exists "progress-photos owner upload" on storage.objects;
create policy "progress-photos owner upload" on storage.objects
  for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress-photos owner read" on storage.objects;
create policy "progress-photos owner read" on storage.objects
  for select
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress-photos owner delete" on storage.objects;
create policy "progress-photos owner delete" on storage.objects
  for delete
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
