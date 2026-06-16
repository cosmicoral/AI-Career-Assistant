# CareerOS AI

AI-powered graduate job application operating system.

CareerOS AI is a production-oriented MVP for UK graduates and early-career applicants who need one place to evaluate roles, tailor materials, answer application questions, track applications, and prepare for interviews.

## Stack

- React, TypeScript, Vite
- Node.js, Express
- PostgreSQL through Supabase
- Supabase Auth
- OpenAI API
- Vercel-ready frontend, separately deployable API

## Project Structure

```txt
apps/
  web/        React application
  api/        Express API and AI orchestration
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

For a real environment, create a Supabase project, run the SQL migration in `supabase/migrations`, and fill in the Supabase and OpenAI environment variables.

## MVP Scope

- Career profile knowledge base
- Job fit analyzer
- CV tailoring assistant
- UK-style cover letter generator
- STAR application answer assistant
- Application tracker and dashboard metrics
- Interview knowledge base

V2 features, including video interview analysis and job discovery integrations, are planned in `docs/roadmap.md`.
