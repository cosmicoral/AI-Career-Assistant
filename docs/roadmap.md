# MVP Roadmap

## Phase 0: Foundation

- Monorepo, strict TypeScript and shared schemas.
- Supabase schema and RLS policies.
- Supabase Auth magic-link sign-in.
- Express API with health checks, auth middleware and rate limiting.
- OpenAI structured JSON service with schema validation.

## Phase 1: Core Application Workflow

- Career profile CRUD.
- Application tracker CRUD.
- Dashboard metrics: submitted applications, interviews, offers and offer rate.
- Deadline views and status pipeline.
- Persist job analyses against applications.

## Phase 2: AI Application Engine

- Job fit analyzer with apply/maybe/skip recommendation.
- CV tailoring assistant with supported ATS keywords and bullet suggestions.
- UK-style cover letter generator.
- STAR application answer assistant.
- Save generated outputs to `generated_materials`.

## Phase 3: Interview Preparation

- Searchable interview knowledge base.
- Company-level interview prep view.
- Link notes, materials and feedback to application records.
- Generate interview prep packs from previous materials and company notes.

## Phase 4: Product Hardening

- User onboarding flow.
- Empty states and import flows for master CV.
- Usage limits and billing gates.
- Audit logs for generated material.
- Monitoring, error reporting and prompt evaluation set.

## V2: Expansion

- Video interview coach with upload, transcription and delivery analysis.
- Job discovery integrations for LinkedIn, Bright Network, Gradcracker and company careers pages.
- Recommendation engine based on profile, location, visa status and deadline timing.
- Assessment centre preparation packs.
- Online assessment practice modules.
