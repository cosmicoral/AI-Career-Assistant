# CareerOS AI Project Audit

Date: 2026-06-16

This audit reflects the actual repository after adding Supabase Auth, job-specific networking, Assessment Centre Trainer, and Online Test Practice Hub.

## Current Structure

- `apps/web`: React/Vite frontend.
  - Entry: `apps/web/src/main.tsx`
  - Routes: `apps/web/src/App.tsx`
  - Auth provider: `apps/web/src/lib/auth.tsx`
  - API hooks: `apps/web/src/lib/queries.ts`
  - Main shell: `apps/web/src/components/AppShell.tsx`
  - New prep pages: `apps/web/src/pages/AssessmentCentrePage.tsx`, `apps/web/src/pages/OnlineTestsPage.tsx`
- `apps/api`: Express backend.
  - Entry: `apps/api/src/server.ts`
  - Router setup: `apps/api/src/app.ts`
  - Auth middleware: `apps/api/src/middleware/auth.ts`
  - Persistence: `apps/api/src/services/application-store.ts`
  - Local fallback: `apps/api/src/services/local-store.ts`
  - AI: `apps/api/src/services/ai-prompts.ts`, `openai.ts`, `mock-ai.ts`
  - Prep routes: `apps/api/src/routes/assessment-centre.ts`, `apps/api/src/routes/online-tests.ts`
- `packages/shared`: Zod schemas and TypeScript types.
- `supabase/migrations`: `001_initial_schema.sql`, `002_application_workspace.sql`, `003_networking.sql`, `004_assessment_centre_online_tests.sql`

## Authentication

Status: implemented

- Login page: `apps/web/src/pages/LoginPage.tsx`
- Register page: `apps/web/src/pages/RegisterPage.tsx`
- Route protection: `apps/web/src/components/ProtectedRoute.tsx`
- Logout: `apps/web/src/components/AppShell.tsx`
- API JWT validation: `apps/api/src/middleware/auth.ts`

Behavior:

- Supabase configured: email/password register and login are enabled, all main routes require a session, and API data is scoped to authenticated `user_id`.
- Supabase missing: app shows `Local mode`, skips auth, and stores development data in `.local-data/store.json`.
- `Local mode` is shown only when frontend Supabase env vars are missing.

User-scoped data:

- career profiles
- applications
- job analyses
- generated materials
- interview notes
- networking contacts
- networking actions
- assessment-centre cases
- assessment-centre sessions
- online-test resources
- online-test attempts
- online-test study plans

## Implemented Features

### Career Profile

Status: implemented for core fields

- Frontend: `ProfilePage.tsx`
- API: `GET /api/profile`, `PUT /api/profile`
- Storage: `career_profiles` or local store
- Still missing: full structured editing for education, experience, and projects.

### Job Fit Analyzer

Status: implemented and persisted

- Frontend: `JobFitPage.tsx`
- API: `POST /api/applications`, `POST /api/ai/job-fit`
- Storage: `applications`, `job_analyses`
- Mock AI appears only in development without `OPENAI_API_KEY` and is labelled `MOCK`.

### CV Tailoring

Status: implemented and optionally persisted

- Frontend: `CvTailoringPage.tsx`
- API: `POST /api/ai/cv-tailor`
- Storage: `generated_materials`

### Cover Letter Generator

Status: implemented and optionally persisted

- Frontend: `CoverLetterPage.tsx`
- API: `POST /api/ai/cover-letter`
- Storage: `generated_materials`

### Application Question Assistant

Status: implemented and optionally persisted

- Frontend: `ApplicationAnswersPage.tsx`
- API: `POST /api/ai/application-answer`
- Storage: `generated_materials`

### Application Tracker And Dashboard

Status: implemented

- Frontend: `DashboardPage.tsx`, `TrackerPage.tsx`
- API: `GET/POST/PATCH/DELETE /api/applications`
- Storage: `applications`
- Still missing: tracker edit/delete controls.

### Application Workspace

Status: implemented

- Frontend: `ApplicationWorkspacePage.tsx`
- API: `GET /api/applications/:id/workspace`
- Shows application details, job description, latest fit analysis, generated materials, linked interview notes, networking contacts, and outreach actions.

### Interview Knowledge Base

Status: implemented for list/create/linking

- Frontend: `InterviewKnowledgeBasePage.tsx`
- API: `GET /api/interview-notes`, `POST /api/interview-notes`
- Storage: `interview_notes`

### Job-Specific Networking

Status: implemented

- Frontend: `ApplicationWorkspacePage.tsx`, `NetworkingPage.tsx`
- API:
  - `GET /api/networking/contacts`
  - `POST /api/networking/contacts`
  - `PATCH /api/networking/contacts/:id`
  - `GET /api/networking/actions`
  - `POST /api/networking/actions`
  - `PATCH /api/networking/actions/:id`
  - `POST /api/ai/networking-strategy`
- Storage: `networking_contacts`, `networking_actions`

Implemented:

- Add contacts manually from an application workspace.
- Generate LinkedIn search queries and outreach drafts.
- Add follow-up reminders.
- Mark contacts as contacted or replied.
- View all contacts/actions on `/networking`.
- Filter by action status and relationship type.
- Show overdue follow-ups.

Safety boundary:

- No LinkedIn scraping.
- No automated message sending.
- No claims that CareerOS found real people.
- AI generates strategy, queries, and drafts only.

### Assessment Centre Trainer

Status: implemented for manually supplied cases and AI practice sessions

- Frontend: `AssessmentCentrePage.tsx`, `ApplicationWorkspacePage.tsx`, `DashboardPage.tsx`
- API:
  - `GET /api/assessment-centre/cases`
  - `POST /api/assessment-centre/cases`
  - `GET /api/assessment-centre/cases/:id`
  - `PATCH /api/assessment-centre/cases/:id`
  - `DELETE /api/assessment-centre/cases/:id`
  - `GET /api/assessment-centre/sessions`
  - `POST /api/assessment-centre/sessions`
  - `PATCH /api/assessment-centre/sessions/:id`
  - `POST /api/ai/ac-trainer`
- Storage: `assessment_centre_cases`, `assessment_centre_sessions`

Implemented:

- Add case prompts manually.
- Link cases to applications.
- Generate AI practice sessions from the saved prompt.
- Save generated sessions to the application workspace when linked.
- Record self-reflection and self-assessed score.
- Show AC prep in dashboard and `/applications/:id`.

Safety boundary:

- No scraped assessment-provider content.
- No copied commercial test-bank content.
- No claim that a case is official employer content unless the user supplied that context.

### Online Test Practice Hub

Status: implemented for resources, attempts, plans, and original drills

- Frontend: `OnlineTestsPage.tsx`, `ApplicationWorkspacePage.tsx`, `DashboardPage.tsx`
- API:
  - `GET /api/online-tests/resources`
  - `POST /api/online-tests/resources`
  - `GET /api/online-tests/attempts`
  - `POST /api/online-tests/attempts`
  - `GET /api/online-tests/study-plans`
  - `POST /api/online-tests/study-plans`
  - `POST /api/ai/ot-study-plan`
  - `POST /api/ai/ot-practice-questions`
- Storage: `online_test_resources`, `online_test_attempts`, `online_test_study_plans`

Implemented:

- Save official/user resource links manually.
- Log practice attempts with score, percentile, time, weak areas, and notes.
- Generate and save study plans, linked to an application when selected.
- Generate original generic practice drills.
- Show online-test prep in dashboard and `/applications/:id`.

Safety boundary:

- No SHL, Cappfinity/Capp, Arctic Shores, Aon, Sova, Watson Glaser, HireVue, employer, or other provider scraping.
- No copied commercial test-bank questions.
- Generated drills are original generic practice only.

### Career Evidence Library

Status: scaffolded

- Evidence lives inside `career_profiles`.
- No standalone evidence library yet.

### Job Sources Layer

Status: missing

- Manual job URL storage exists.
- No external job discovery integration.

### Career CRM

Status: missing / deferred

- Job-specific networking exists for application-linked contacts and outreach actions.
- There is no broader CRM pipeline beyond saved applications, networking contacts, and networking actions.
- No recruiter/company relationship history outside those tables.

### VI Coach

Status: missing

- No page, route, upload, storage, or analysis.

## Requires Supabase

- Real login/register.
- Authenticated multi-user cloud data.
- RLS-backed user isolation.

## Does Not Require Supabase

- Local demo mode.
- Local JSON persistence in `.local-data/store.json`.
- Development mock AI responses when OpenAI is missing.

## Does Not Scrape LinkedIn

Networking generates search queries such as company + recruiter/alumni/role terms. The user manually searches, reviews people, adds contacts, and sends messages.

## Does Not Scrape Assessment Providers

Assessment-centre and online-test modules use user-supplied prompts, manually saved resources, and original AI-generated practice. CareerOS does not scrape provider sites or reproduce proprietary question banks.

## Manual Test Checklist

1. Configure Supabase env vars and register a user.
2. Log out and confirm app routes redirect to `/login`.
3. Log in and confirm dashboard loads.
4. Save a career profile.
5. Save and analyze a real job.
6. Confirm the application appears in dashboard, tracker, and `/applications/:id`.
7. Add a networking contact manually in the application workspace.
8. Generate LinkedIn search queries and outreach message.
9. Add a follow-up reminder.
10. Mark the contact as contacted and replied.
11. Open `/networking` and confirm contacts/actions/filters/overdue section work.
12. Open `/assessment-centre`, create a case linked to the saved application, generate a session, and save a reflection.
13. Confirm the AC case/session appears in `/applications/:id` and the dashboard practice queue.
14. Open `/online-tests`, log an attempt linked to the saved application, save a resource, and generate a study plan.
15. Confirm online-test attempts/plans appear in `/applications/:id` and dashboard online-test panels.
16. Remove Supabase env vars and confirm `Local mode` plus local persistence.
