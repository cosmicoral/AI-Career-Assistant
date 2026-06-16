do $$
begin
  create type public.relationship_type as enum (
    'alumni',
    'recruiter',
    'hiring_manager',
    'employee',
    'founder',
    'mutual_connection',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.networking_action_type as enum (
    'connect',
    'message',
    'follow_up',
    'coffee_chat',
    'referral_request',
    'thank_you'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.networking_action_status as enum (
    'planned',
    'sent',
    'replied',
    'no_response',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.networking_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  company text not null,
  name text not null,
  title text not null,
  linkedin_url text,
  email text,
  relationship_type public.relationship_type not null default 'unknown',
  relevance_score integer check (relevance_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.networking_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.networking_contacts(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  action_type public.networking_action_type not null,
  status public.networking_action_status not null default 'planned',
  due_date date,
  message_draft text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_networking_contacts_updated_at on public.networking_contacts;
create trigger set_networking_contacts_updated_at
before update on public.networking_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_networking_actions_updated_at on public.networking_actions;
create trigger set_networking_actions_updated_at
before update on public.networking_actions
for each row execute function public.set_updated_at();

alter table public.networking_contacts enable row level security;
alter table public.networking_actions enable row level security;

drop policy if exists "Users manage own networking contacts" on public.networking_contacts;
create policy "Users manage own networking contacts"
on public.networking_contacts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own networking actions" on public.networking_actions;
create policy "Users manage own networking actions"
on public.networking_actions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists networking_contacts_user_company_idx on public.networking_contacts(user_id, company);
create index if not exists networking_contacts_user_application_idx on public.networking_contacts(user_id, application_id);
create index if not exists networking_actions_user_status_idx on public.networking_actions(user_id, status);
create index if not exists networking_actions_user_due_date_idx on public.networking_actions(user_id, due_date);
create index if not exists networking_actions_user_application_idx on public.networking_actions(user_id, application_id);
