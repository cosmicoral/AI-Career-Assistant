# CareerOS AI Architecture

## Product Positioning

CareerOS AI is a graduate application operating system, not a resume writer. The core job is to help applicants make better decisions, produce stronger evidence-based materials, and keep momentum across many parallel applications.

## System Overview

```txt
React/Vite web app
  |
  | Supabase Auth JWT
  v
Express API
  |
  | service role for user-scoped reads/writes
  v
Supabase Postgres
  |
  | structured prompts and JSON schemas
  v
OpenAI API
```

## Frontend

- `apps/web/src/pages/DashboardPage.tsx`: command centre with metrics, pipeline and deadlines.
- `ProfilePage.tsx`: permanent evidence bank for education, skills, achievements, projects and master CV.
- `JobFitPage.tsx`: paste job description, receive fit score, matching evidence, gaps, risks and apply decision.
- `CvTailoringPage.tsx`: ATS keywords, tailored bullets and section recommendations.
- `CoverLetterPage.tsx`: concise UK-style cover letters grounded in profile evidence.
- `ApplicationAnswersPage.tsx`: STAR answers for company, role and behavioural questions.
- `TrackerPage.tsx`: application status pipeline and metrics.
- `InterviewKnowledgeBasePage.tsx`: searchable company notes, previous questions, materials and feedback.

## Backend

- `apps/api/src/app.ts`: Express app, security middleware, rate limit, route registration.
- `routes/ai.ts`: structured AI endpoints.
- `routes/profile.ts`: career profile read and upsert.
- `routes/applications.ts`: application tracker CRUD.
- `routes/interview-notes.ts`: interview knowledge base storage.
- `services/openai.ts`: JSON-object generation and schema validation.
- `services/ai-prompts.ts`: prompt templates with truthfulness constraints.

## Shared Contracts

`packages/shared/src/index.ts` defines Zod schemas and TypeScript types for:

- Career profile
- Application status
- Job fit output
- CV tailoring output
- Cover letter output
- Application answer output
- Interview notes

The API validates inbound requests and AI responses against these schemas. The frontend consumes the same types.

## Data Model

Primary tables:

- `career_profiles`: permanent candidate knowledge base.
- `applications`: tracker records and pipeline status.
- `job_analyses`: persisted fit analyses.
- `generated_materials`: CV, cover letter and application answer outputs.
- `interview_notes`: company notes, previous questions, materials and feedback.

Row-level security is enabled for every user-owned table.

## AI Guardrails

- Never invent experience, skills, employers, metrics or visa status.
- Use only supplied career profile, master CV and job description evidence.
- Return structured JSON only.
- Validate every AI response before returning to the frontend.
- Expose missing evidence as a gap instead of filling it creatively.

## Deployment

Recommended deployment split:

- Web: Vercel project rooted at `apps/web`.
- API: Vercel serverless, Render, Fly.io or Railway rooted at `apps/api`.
- Database and auth: Supabase.

For Vercel-only API deployment, convert Express routes to Vercel functions or wrap the Express app with a serverless adapter.
