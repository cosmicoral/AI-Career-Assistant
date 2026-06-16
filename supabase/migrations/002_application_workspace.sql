alter table public.applications
add column if not exists job_description text;

alter table public.job_analyses
add column if not exists is_mock boolean not null default false;

alter table public.generated_materials
add column if not exists is_mock boolean not null default false;
