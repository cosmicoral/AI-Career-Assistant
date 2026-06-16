# TODO

## Priority 1: Manual Verification

- Test register/login/logout with Supabase configured.
- Test route protection when logged out.
- Test local demo mode when Supabase env vars are missing.
- Test user isolation by creating data under two Supabase users.
- Test networking contacts/actions in local mode and Supabase mode.
- Confirm networking strategy does not claim real people were found.
- Test Assessment Centre case create/list/session generation/reflection in local mode and Supabase mode.
- Test Online Test resource create, attempt logging, study-plan generation, and practice drills in local mode and Supabase mode.
- Confirm AC and online-test data appears inside `/applications/:id`.
- Confirm dashboard prep panels use only saved real data.
- Confirm online-test drills do not claim to be official provider questions.

## Priority 2: Assessment And Online Test Polish

- Add edit/delete UI for assessment-centre cases.
- Add delete UI for assessment-centre sessions.
- Add case templates made from original generic prompts only.
- Add copy buttons for opening statements, recommendations, and online-test practice questions.
- Add trend charts for online-test scores and weak areas.
- Add due dates/reminders for assessment-centre practice sessions.

## Priority 3: Networking Polish

- Add edit/delete UI for networking contacts.
- Add edit/delete UI for networking actions.
- Add quick action creation from the `/networking` page.
- Add copy buttons for message drafts.
- Add clearer overdue styling for follow-ups.
- Add "last contacted" summary per contact.

## Priority 4: Application Workflow Polish

- Add edit/delete controls to Tracker.
- Add deadline/status filters to Tracker.
- Add a "set as applied today" action.
- Add duplicate warning when company + role + deadline already exists.
- Add confirmation before deleting an application.

## Priority 5: Workspace Generation Controls

- Add CV tailoring, cover letter, and answer generation buttons directly inside `/applications/:id`.
- Add inline regenerate buttons for each saved generated material.
- Add material history with timestamps.
- Add "mark final" for a generated material.

## Priority 6: Profile Completeness

- Add editable education records.
- Add editable work experience records.
- Add editable project records.
- Add evidence tags and STAR examples.
- Validate that AI pages block generation when the profile has no usable evidence.

## Priority 7: Auth Hardening

- Add password reset.
- Add email confirmation UX.
- Add account deletion/export path.
- Clear React Query cache on token expiry.
- Add API tests for unauthorized requests.

## Priority 8: Persistence Hardening

- Add tests for `application-store.ts`.
- Add tests for `local-store.ts`.
- Add API tests for networking contact/action CRUD.
- Add API tests for assessment-centre case/session CRUD.
- Add API tests for online-test resource/attempt/study-plan CRUD.
- Add API tests for AI persistence when `applicationId` exists.
- Add migration verification for `003_networking.sql`.
- Add migration verification for `004_assessment_centre_online_tests.sql`.
- Add safer partial update schemas for PATCH routes.

## Priority 9: Dashboard Improvements

- Add overdue deadline count.
- Add applications due this week.
- Add recent activity from application updates/material generation/networking actions.
- Add status conversion chart from real data.

## Deferred

- RAG.
- VI Coach.
- Job Discovery.
- LinkedIn scraping or automation.
- Assessment-provider scraping.
- Commercial test-bank ingestion.
- Broad CRM beyond job-specific networking.
