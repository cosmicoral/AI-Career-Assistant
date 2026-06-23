# CareerOS AI

AI-powered graduate job application operating system. 

Built with extensive support from Codex and Claude Code, with manual product design, architecture review, debugging and feature validation.

CareerOS AI helps graduates manage real applications: save jobs, analyze fit, tailor materials, track statuses, prepare interviews, plan job-specific networking, and prepare for assessment centres and online tests.

## Stack

- React, TypeScript, Vite
- Node.js, Express
- PostgreSQL through Supabase
- Supabase Auth
- OpenAI API
- Local JSON fallback for development when Supabase is not configured

## Project Structure

```txt
apps/
  web/        React application
  api/        Express API, auth middleware, AI orchestration, persistence
packages/
  shared/     Zod schemas and shared TypeScript types
supabase/
  migrations/ PostgreSQL schema, RLS policies, indexes
docs/
  architecture.md
  roadmap.md
  wireframes.md
  implementation-plan.md
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.

If another local app owns IPv6 localhost, open `http://127.0.0.1:5173`.

## Environment Setup

Minimum local demo mode:

```bash
NODE_ENV=development
PORT=4000
APP_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000
```

Supabase Auth and cloud persistence:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Real AI generation:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
```

`OPENAI_MODEL` is optional.

## Supabase Setup

Run the migrations in order:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_application_workspace.sql
supabase/migrations/003_networking.sql
supabase/migrations/004_assessment_centre_online_tests.sql
```

When Supabase env vars are present, the app requires login/register and all data is scoped by authenticated `user_id`.

When Supabase env vars are missing, the app shows `Local mode` and stores development data in `.local-data/store.json`.

## Implemented Scope

- Email/password login and register through Supabase Auth
- Protected app routes and logout
- Career profile
- Application tracker and dashboard metrics
- Job fit analyzer with saved fit analyses
- CV tailoring, cover letter, and application answer generation with optional saved outputs
- Application workspace at `/applications/:id`
- Interview knowledge base
- Job-specific networking contacts and actions
- AI networking strategy endpoint that generates categories, LinkedIn search queries, and message drafts
- Assessment Centre Trainer with manually added case prompts, AI practice sessions, self-reflection, and application workspace links
- Online Test Practice Hub with resources, attempt/error logging, saved study plans, and original AI-generated practice drills

## Networking Safety

CareerOS does not scrape LinkedIn, does not claim to have found real people, and does not automate sending messages. The networking assistant only generates search queries, outreach strategy, and drafts for the user to review and send manually.

## Assessment And Online Test Safety

CareerOS does not scrape SHL, Cappfinity/Capp, Arctic Shores, Aon, Sova, Watson Glaser, HireVue, employer portals, or other assessment providers. It does not provide copied commercial test-bank content. Users can manually add their own notes, links, attempts, and practice prompts; AI-generated drills are original generic practice only and are labelled `MOCK` when OpenAI is not configured.
