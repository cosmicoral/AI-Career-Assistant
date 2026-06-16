# Implementation Plan

## 1. Local Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Create a Supabase project.
4. Run `supabase/migrations/001_initial_schema.sql`.
5. Add Supabase URL, anon key and service role key to `.env`.
6. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL`.
7. Run `npm run dev`.

## 2. Product Build Order

1. Replace seeded frontend sample data with API queries.
2. Complete profile editor for education, experience and projects.
3. Persist job fit analyses in `job_analyses`.
4. Attach generated materials to application records.
5. Add application detail pages.
6. Add onboarding and master CV import.
7. Add analytics and conversion tracking.

## 3. API Endpoint Map

```txt
GET    /api/health
GET    /api/profile
PUT    /api/profile
GET    /api/applications
POST   /api/applications
PATCH  /api/applications/:id
DELETE /api/applications/:id
GET    /api/interview-notes
POST   /api/interview-notes
POST   /api/ai/job-fit
POST   /api/ai/cv-tailor
POST   /api/ai/cover-letter
POST   /api/ai/application-answer
```

## 4. Production Checklist

- Add integration tests for API routes.
- Add prompt evaluation fixtures for common graduate job descriptions.
- Persist AI outputs and show generation history.
- Add server-side usage limits per user.
- Add Sentry or equivalent error monitoring.
- Add analytics events for fit analysis, applications created, interviews reached and offers.
- Add billing with free monthly quota and paid application workspace.
- Add data export and account deletion.
