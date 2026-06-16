create extension if not exists "pgcrypto";

create type public.application_status as enum (
  'Saved',
  'Drafting',
  'Applied',
  'Interview',
  'Assessment Centre',
  'Offer',
  'Rejected'
);

create type public.generated_material_type as enum (
  'cv_tailoring',
  'cover_letter',
  'application_question'
);

create type public.interview_note_type as enum (
  'Company Note',
  'Previous Question',
  'Feedback',
  'Material'
);

create table public.career_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  headline text,
  visa_status text,
  target_industries text[] not null default '{}',
  target_locations text[] not null default '{}',
  preferred_roles text[] not null default '{}',
  skills text[] not null default '{}',
  achievements text[] not null default '{}',
  education jsonb not null default '[]',
  experience jsonb not null default '[]',
  projects jsonb not null default '[]',
  master_cv text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status public.application_status not null default 'Saved',
  application_date date,
  deadline date,
  job_url text,
  location text,
  salary text,
  fit_score integer check (fit_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  job_description text not null,
  fit_score integer not null check (fit_score between 0 and 100),
  recommendation text not null check (recommendation in ('Should Apply', 'Maybe', 'Skip')),
  matching_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  transferable_experiences jsonb not null default '[]',
  red_flags text[] not null default '{}',
  action_plan jsonb not null default '[]',
  rationale text not null,
  created_at timestamptz not null default now()
);

create table public.generated_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  material_type public.generated_material_type not null,
  prompt_context jsonb not null default '{}',
  output jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.interview_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text,
  note_type public.interview_note_type not null,
  content text not null,
  tags text[] not null default '{}',
  source_application_id uuid references public.applications(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_career_profiles_updated_at
before update on public.career_profiles
for each row execute function public.set_updated_at();

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger set_interview_notes_updated_at
before update on public.interview_notes
for each row execute function public.set_updated_at();

alter table public.career_profiles enable row level security;
alter table public.applications enable row level security;
alter table public.job_analyses enable row level security;
alter table public.generated_materials enable row level security;
alter table public.interview_notes enable row level security;

create policy "Users manage own career profile"
on public.career_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own applications"
on public.applications
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own job analyses"
on public.job_analyses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own generated materials"
on public.generated_materials
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own interview notes"
on public.interview_notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index applications_user_status_idx on public.applications(user_id, status);
create index applications_user_deadline_idx on public.applications(user_id, deadline);
create index job_analyses_user_created_idx on public.job_analyses(user_id, created_at desc);
create index generated_materials_user_created_idx on public.generated_materials(user_id, created_at desc);
create index interview_notes_user_company_idx on public.interview_notes(user_id, company);
create index interview_notes_tags_idx on public.interview_notes using gin(tags);
