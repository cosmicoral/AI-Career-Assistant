# Architecture

This file describes the architecture currently implemented in this repository.

## High-Level System

```txt
React/Vite frontend
  -> Express API
  -> Supabase Postgres/Auth
  -> OpenAI API for structured AI generation
```

The project is an npm workspace monorepo:

```txt
apps/web        React app
apps/api        Express API
packages/shared Shared Zod schemas and TypeScript types
supabase        SQL migrations
scripts         Local development scripts
docs            Product and planning docs
```

## Frontend Architecture

Entry points:

- `apps/web/src/main.tsx`: mounts the React app.
- `apps/web/src/App.tsx`: defines route structure.
- `apps/web/src/components/AppShell.tsx`: dashboard layout, sidebar, topbar.

Routes:

- `/`: dashboard
- `/profile`: career profile
- `/job-fit`: job fit analyzer
- `/cv-tailoring`: CV tailoring
- `/cover-letter`: cover letter generator
- `/application-answers`: application answer assistant
- `/tracker`: application tracker
- `/networking`: all saved contacts and outreach actions
- `/assessment-centre`: assessment-centre case library, AI practice sessions, and reflections
- `/online-tests`: online-test resources, attempts, study plans, and original practice drills
- `/interview-kb`: interview knowledge base
- `/login`: Supabase email/password login when Supabase is configured
- `/register`: Supabase email/password registration when Supabase is configured

Important frontend libraries:

- React
- React Router
- React Query for API data fetching and cache invalidation.
- Supabase JS client for auth.
- Lucide React icons.

Current frontend data behavior:

- Production UI fetches from API endpoints through `apps/web/src/lib/api.ts` and `apps/web/src/lib/queries.ts`.
- No sample companies are shown unless the user has saved them.
- If Supabase is not configured, the app runs in local demo mode.

## Backend Architecture

Entry points:

- `apps/api/src/server.ts`: loads dotenv and starts Express.
- `apps/api/src/app.ts`: configures middleware and routes.

Middleware:

- `helmet` for security headers.
- `cors` restricted to `APP_ORIGIN`.
- `express.json` with `1mb` limit.
- `morgan` request logging.
- `express-rate-limit` at 120 requests per minute.
- `requireAuth` for protected route groups.
- `errorHandler` for Zod and runtime errors.

Route groups:

- `/api/health`: service and integration status.
- `/api/profile`: career profile read/upsert.
- `/api/applications`: tracker CRUD.
- `/api/applications/:id/workspace`: application detail workspace with latest fit analysis, generated materials, linked interview notes, and networking data.
- `/api/interview-notes`: interview notes list/create.
- `/api/networking`: networking contacts and outreach action list/create/update.
- `/api/assessment-centre`: assessment-centre cases and practice sessions.
- `/api/online-tests`: online-test resources, attempts, and study plans.
- `/api/ai`: AI generation endpoints.

## Shared Schema Layer

`packages/shared/src/index.ts` defines the contract between frontend, backend, AI outputs, and database row mapping.

Important schemas:

- `CareerProfileSchema`
- `JobFitRequestSchema`
- `JobFitResponseSchema`
- `CvTailoringRequestSchema`
- `CvTailoringResponseSchema`
- `CoverLetterRequestSchema`
- `CoverLetterResponseSchema`
- `ApplicationQuestionRequestSchema`
- `ApplicationQuestionResponseSchema`
- `ApplicationSchema`
- `ApplicationCreateSchema`
- `InterviewNoteSchema`
- `InterviewNoteCreateSchema`
- `NetworkingContactSchema`
- `NetworkingActionSchema`
- `NetworkingStrategyRequestSchema`
- `NetworkingStrategyResponseSchema`
- `AssessmentCentreCaseSchema`
- `AssessmentCentreSessionSchema`
- `AcTrainerRequestSchema`
- `AcTrainerResponseSchema`
- `OnlineTestResourceSchema`
- `OnlineTestAttemptSchema`
- `OnlineTestStudyPlanSchema`
- `OtStudyPlanRequestSchema`
- `OtStudyPlanResponseSchema`
- `OtPracticeQuestionsRequestSchema`
- `OtPracticeQuestionsResponseSchema`

## AI Architecture

AI generation is handled by:

- `apps/api/src/routes/ai.ts`
- `apps/api/src/services/ai-prompts.ts`
- `apps/api/src/services/openai.ts`

Flow:

```txt
request body
  -> Zod request validation
  -> prompt builder
  -> OpenAI chat completion with JSON response format
  -> JSON parse
  -> Zod response validation
  -> HTTP JSON response
```

Guardrails currently live in prompt text:

- Never invent experience, employers, degrees, achievements, metrics, skills, visa status, or eligibility.
- If evidence is weak or missing, state the gap.
- Return valid JSON only.
- Networking assistant does not scrape LinkedIn, claim to find real people, or automate sending messages.
- Assessment-centre trainer uses user-provided/manual practice prompts only and does not claim official employer content.
- Online-test assistant generates plans and original generic drills only; it does not scrape or reproduce commercial test-bank content.

## Database Architecture

The migration creates:

- `career_profiles`
- `applications`
- `job_analyses`
- `generated_materials`
- `interview_notes`
- `networking_contacts`
- `networking_actions`
- `assessment_centre_cases`
- `assessment_centre_sessions`
- `online_test_resources`
- `online_test_attempts`
- `online_test_study_plans`

RLS is enabled for all tables. Policies restrict all user-owned rows to `auth.uid() = user_id`.

## Current Architectural Gaps

- AI endpoints persist to `job_analyses` and `generated_materials` when `applicationId` is supplied.
- Assessment-centre and online-test prep are persisted and linked to application workspaces when `applicationId` is supplied.
- There are no standalone generated material or analysis management endpoints yet.
- There is no LinkedIn scraping or external networking integration by design.
- There is no external assessment-provider integration by design.
- No tests are present.
- No deployment adapter for Express on Vercel serverless yet.
