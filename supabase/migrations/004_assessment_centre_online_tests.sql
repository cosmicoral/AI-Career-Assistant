do $$
begin
  create type public.assessment_centre_case_type as enum (
    'group_discussion',
    'case_study',
    'presentation',
    'role_play',
    'written_exercise',
    'in_tray'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.assessment_centre_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  company text not null,
  role text not null,
  industry text not null,
  case_type public.assessment_centre_case_type not null,
  prompt text not null,
  difficulty text,
  source_note text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_centre_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.assessment_centre_cases(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  session_type text not null,
  generated_agenda jsonb not null default '[]',
  stakeholder_map jsonb not null default '[]',
  suggested_arguments jsonb not null default '[]',
  opening_statement text,
  final_recommendation text,
  feedback_rubric jsonb not null default '[]',
  user_reflection text,
  score_self_assessed integer check (score_self_assessed between 0 and 100),
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.online_test_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  test_type text not null,
  title text not null,
  url text,
  notes text,
  is_official_resource boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.online_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  provider text not null,
  test_type text not null,
  score numeric,
  percentile numeric,
  time_spent_minutes integer,
  weak_areas text[] not null default '{}',
  notes text,
  taken_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.online_test_study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  provider text not null,
  test_type text not null,
  target_date date,
  plan jsonb not null default '[]',
  priority_topics text[] not null default '{}',
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_assessment_centre_cases_updated_at on public.assessment_centre_cases;
create trigger set_assessment_centre_cases_updated_at
before update on public.assessment_centre_cases
for each row execute function public.set_updated_at();

drop trigger if exists set_assessment_centre_sessions_updated_at on public.assessment_centre_sessions;
create trigger set_assessment_centre_sessions_updated_at
before update on public.assessment_centre_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_online_test_resources_updated_at on public.online_test_resources;
create trigger set_online_test_resources_updated_at
before update on public.online_test_resources
for each row execute function public.set_updated_at();

drop trigger if exists set_online_test_attempts_updated_at on public.online_test_attempts;
create trigger set_online_test_attempts_updated_at
before update on public.online_test_attempts
for each row execute function public.set_updated_at();

drop trigger if exists set_online_test_study_plans_updated_at on public.online_test_study_plans;
create trigger set_online_test_study_plans_updated_at
before update on public.online_test_study_plans
for each row execute function public.set_updated_at();

alter table public.assessment_centre_cases enable row level security;
alter table public.assessment_centre_sessions enable row level security;
alter table public.online_test_resources enable row level security;
alter table public.online_test_attempts enable row level security;
alter table public.online_test_study_plans enable row level security;

drop policy if exists "Users manage own assessment centre cases" on public.assessment_centre_cases;
create policy "Users manage own assessment centre cases"
on public.assessment_centre_cases
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own assessment centre sessions" on public.assessment_centre_sessions;
create policy "Users manage own assessment centre sessions"
on public.assessment_centre_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own online test resources" on public.online_test_resources;
create policy "Users manage own online test resources"
on public.online_test_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own online test attempts" on public.online_test_attempts;
create policy "Users manage own online test attempts"
on public.online_test_attempts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own online test study plans" on public.online_test_study_plans;
create policy "Users manage own online test study plans"
on public.online_test_study_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists ac_cases_user_application_idx on public.assessment_centre_cases(user_id, application_id);
create index if not exists ac_cases_user_company_idx on public.assessment_centre_cases(user_id, company);
create index if not exists ac_sessions_user_case_idx on public.assessment_centre_sessions(user_id, case_id);
create index if not exists ac_sessions_user_application_idx on public.assessment_centre_sessions(user_id, application_id);
create index if not exists ot_resources_user_provider_idx on public.online_test_resources(user_id, provider);
create index if not exists ot_attempts_user_application_idx on public.online_test_attempts(user_id, application_id);
create index if not exists ot_attempts_user_taken_at_idx on public.online_test_attempts(user_id, taken_at);
create index if not exists ot_study_plans_user_application_idx on public.online_test_study_plans(user_id, application_id);
create index if not exists ot_study_plans_user_target_date_idx on public.online_test_study_plans(user_id, target_date);
