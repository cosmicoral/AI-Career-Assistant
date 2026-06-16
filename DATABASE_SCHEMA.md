# Database Schema

The current Supabase schema lives in `supabase/migrations`.

Run migrations in order:

```txt
001_initial_schema.sql
002_application_workspace.sql
003_networking.sql
004_assessment_centre_online_tests.sql
```

All user-owned tables use `user_id uuid references auth.users(id) on delete cascade` and RLS policies scoped to `auth.uid() = user_id`.

## Enums

- `application_status`: `Saved`, `Drafting`, `Applied`, `Interview`, `Assessment Centre`, `Offer`, `Rejected`
- `generated_material_type`: `cv_tailoring`, `cover_letter`, `application_question`
- `interview_note_type`: `Company Note`, `Previous Question`, `Feedback`, `Material`
- `relationship_type`: `alumni`, `recruiter`, `hiring_manager`, `employee`, `founder`, `mutual_connection`, `unknown`
- `networking_action_type`: `connect`, `message`, `follow_up`, `coffee_chat`, `referral_request`, `thank_you`
- `networking_action_status`: `planned`, `sent`, `replied`, `no_response`, `completed`
- `assessment_centre_case_type`: `group_discussion`, `case_study`, `presentation`, `role_play`, `written_exercise`, `in_tray`

Online-test providers are stored as text and validated by shared Zod schemas in the API. Current supported provider/test-family values are `SHL`, `Cappfinity / Capp`, `Arctic Shores`, `Watson Glaser`, `Sova`, `Aon`, `HireVue games`, `Numerical reasoning`, `Verbal reasoning`, `Situational judgement test`, `Logical / diagrammatic reasoning`, and `Other`.

## Tables

### `career_profiles`

Permanent user career knowledge base.

Important columns:

- `user_id`
- `headline`
- `visa_status`
- `target_industries`
- `target_locations`
- `preferred_roles`
- `skills`
- `achievements`
- `education jsonb`
- `experience jsonb`
- `projects jsonb`
- `master_cv`
- `created_at`
- `updated_at`

API:

- `GET /api/profile`
- `PUT /api/profile`

### `applications`

Application tracker records and job workspace root.

Important columns:

- `id`
- `user_id`
- `company`
- `role`
- `status`
- `application_date`
- `deadline`
- `job_url`
- `job_description`
- `location`
- `salary`
- `fit_score`
- `notes`
- `created_at`
- `updated_at`

API:

- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `GET /api/applications/:id/workspace`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`

### `job_analyses`

Persisted job fit analysis outputs.

Important columns:

- `id`
- `user_id`
- `application_id`
- `job_description`
- `fit_score`
- `recommendation`
- `matching_skills`
- `missing_skills`
- `transferable_experiences`
- `red_flags`
- `action_plan`
- `rationale`
- `is_mock`
- `created_at`

API:

- Written by `POST /api/ai/job-fit` when `applicationId` exists.
- Read by `GET /api/applications/:id/workspace`.

### `generated_materials`

Persisted AI-generated CV tailoring, cover letters, and application answers.

Important columns:

- `id`
- `user_id`
- `application_id`
- `material_type`
- `prompt_context`
- `output`
- `is_mock`
- `created_at`

API:

- Written by CV tailoring, cover letter, and application answer AI endpoints when `applicationId` exists.
- Read by `GET /api/applications/:id/workspace`.

### `interview_notes`

Interview prep notes linked optionally to applications.

Important columns:

- `id`
- `user_id`
- `company`
- `role`
- `note_type`
- `content`
- `tags`
- `source_application_id`
- `created_at`
- `updated_at`

API:

- `GET /api/interview-notes`
- `POST /api/interview-notes`

### `networking_contacts`

Manually added people the user may approach for an application/job.

Columns:

- `id`
- `user_id`
- `application_id nullable`
- `company`
- `name`
- `title`
- `linkedin_url`
- `email nullable`
- `relationship_type`
- `relevance_score`
- `notes`
- `created_at`
- `updated_at`

API:

- `GET /api/networking/contacts`
- `POST /api/networking/contacts`
- `PATCH /api/networking/contacts/:id`

### `networking_actions`

Planned and completed outreach actions.

Columns:

- `id`
- `user_id`
- `contact_id`
- `application_id nullable`
- `action_type`
- `status`
- `due_date`
- `message_draft`
- `notes`
- `created_at`
- `updated_at`

API:

- `GET /api/networking/actions`
- `POST /api/networking/actions`
- `PATCH /api/networking/actions/:id`

### `assessment_centre_cases`

Manually added assessment-centre case prompts linked optionally to an application.

Columns:

- `id`
- `user_id`
- `application_id nullable`
- `company`
- `role`
- `industry`
- `case_type`
- `prompt`
- `difficulty`
- `source_note`
- `tags`
- `created_at`
- `updated_at`

API:

- `GET /api/assessment-centre/cases`
- `POST /api/assessment-centre/cases`
- `GET /api/assessment-centre/cases/:id`
- `PATCH /api/assessment-centre/cases/:id`
- `DELETE /api/assessment-centre/cases/:id`

### `assessment_centre_sessions`

AI-generated practice sessions and user self-reflections for saved cases.

Columns:

- `id`
- `user_id`
- `case_id`
- `application_id nullable`
- `session_type`
- `generated_agenda`
- `stakeholder_map`
- `suggested_arguments`
- `opening_statement`
- `final_recommendation`
- `feedback_rubric`
- `user_reflection`
- `score_self_assessed`
- `is_mock`
- `created_at`
- `updated_at`

API:

- `GET /api/assessment-centre/sessions`
- `POST /api/assessment-centre/sessions`
- `PATCH /api/assessment-centre/sessions/:id`
- Written by `POST /api/ai/ac-trainer` when `caseId` exists.

### `online_test_resources`

User-saved prep links and notes. These are manually added by the user.

Columns:

- `id`
- `user_id`
- `provider`
- `test_type`
- `title`
- `url`
- `notes`
- `is_official_resource`
- `created_at`
- `updated_at`

API:

- `GET /api/online-tests/resources`
- `POST /api/online-tests/resources`

### `online_test_attempts`

Logged online-test practice attempts and weak areas.

Columns:

- `id`
- `user_id`
- `application_id nullable`
- `provider`
- `test_type`
- `score`
- `percentile`
- `time_spent_minutes`
- `weak_areas`
- `notes`
- `taken_at`
- `created_at`
- `updated_at`

API:

- `GET /api/online-tests/attempts`
- `POST /api/online-tests/attempts`

### `online_test_study_plans`

Saved AI-generated or manually persisted online-test study plans.

Columns:

- `id`
- `user_id`
- `application_id nullable`
- `provider`
- `test_type`
- `target_date`
- `plan`
- `priority_topics`
- `is_mock`
- `created_at`
- `updated_at`

API:

- `GET /api/online-tests/study-plans`
- `POST /api/online-tests/study-plans`
- Written by `POST /api/ai/ot-study-plan` when `applicationId` exists.

## Triggers

`public.set_updated_at()` updates `updated_at` before update on:

- `career_profiles`
- `applications`
- `interview_notes`
- `networking_contacts`
- `networking_actions`
- `assessment_centre_cases`
- `assessment_centre_sessions`
- `online_test_resources`
- `online_test_attempts`
- `online_test_study_plans`

## Indexes

Important indexes:

- `applications_user_status_idx`
- `applications_user_deadline_idx`
- `job_analyses_user_created_idx`
- `generated_materials_user_created_idx`
- `interview_notes_user_company_idx`
- `interview_notes_tags_idx`
- `networking_contacts_user_company_idx`
- `networking_contacts_user_application_idx`
- `networking_actions_user_status_idx`
- `networking_actions_user_due_date_idx`
- `networking_actions_user_application_idx`
- `ac_cases_user_application_idx`
- `ac_cases_user_company_idx`
- `ac_sessions_user_case_idx`
- `ac_sessions_user_application_idx`
- `ot_resources_user_provider_idx`
- `ot_attempts_user_application_idx`
- `ot_attempts_user_taken_at_idx`
- `ot_study_plans_user_application_idx`
- `ot_study_plans_user_target_date_idx`

## What Is Not In The Schema

- No job discovery/source tables.
- No LinkedIn scraping tables.
- No assessment-provider scraping tables.
- No commercial test-bank content tables.
- No video interview upload/analysis tables.
- No normalized evidence library tables yet.
