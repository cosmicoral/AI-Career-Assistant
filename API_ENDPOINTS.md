# API Endpoints

Base URL in local development:

```txt
http://localhost:4000
```

All endpoints except health are protected by `requireAuth`.

In development without Supabase configured, `requireAuth` assigns a demo user ID:

```txt
00000000-0000-4000-8000-000000000001
```

When Supabase is not configured in development, persistence uses `.local-data/store.json`.

## Health

### `GET /api/health`

Returns service status and integration configuration status.

Response shape:

```json
{
  "status": "ok",
  "service": "careeros-api",
  "integrations": {
    "supabase": "configured",
    "openai": "configured"
  }
}
```

## Profile

### `GET /api/profile`

Reads the authenticated user's career profile.

Returns:

- `CareerProfile`
- `null` when no profile exists

Tables:

- `career_profiles`

### `PUT /api/profile`

Upserts the authenticated user's career profile.

Body:

```ts
CareerProfileSchema
```

Tables:

- `career_profiles`

## Applications

### `GET /api/applications`

Lists the authenticated user's applications in descending creation order.

Tables:

- `applications`

### `POST /api/applications`

Creates an application.

Body:

```ts
ApplicationCreateSchema
```

Tables:

- `applications`

### `PATCH /api/applications/:id`

Updates an application by UUID for the authenticated user.

Body:

```ts
ApplicationCreateSchema
```

Note: the current implementation expects the same full create-shaped body for patch updates rather than a partial update schema.

Tables:

- `applications`

### `DELETE /api/applications/:id`

Deletes an application by UUID for the authenticated user.

Tables:

- `applications`

### `GET /api/applications/:id`

Reads one application for the authenticated user.

Tables:

- `applications`

### `GET /api/applications/:id/workspace`

Reads the application workspace.

Response includes:

- `application`
- `latestFitAnalysis`
- `generatedMaterials`
- `interviewNotes`
- `networkingContacts`
- `networkingActions`
- `assessmentCentreCases`
- `assessmentCentreSessions`
- `onlineTestAttempts`
- `onlineTestStudyPlans`
- `onlineTestResources`

Tables:

- `applications`
- `job_analyses`
- `generated_materials`
- `interview_notes`
- `networking_contacts`
- `networking_actions`
- `assessment_centre_cases`
- `assessment_centre_sessions`
- `online_test_attempts`
- `online_test_study_plans`
- `online_test_resources`

## Interview Notes

### `GET /api/interview-notes`

Lists interview notes for the authenticated user.

Optional queries:

```txt
?company=<query>
?applicationId=<uuid>
```

The company query uses a Supabase `ilike` filter when Supabase is configured. `applicationId` filters linked notes.

Tables:

- `interview_notes`

## Networking

### `GET /api/networking/contacts`

Lists networking contacts for the authenticated user.

Optional queries:

```txt
?applicationId=<uuid>
?relationshipType=<relationship>
```

Tables:

- `networking_contacts`

### `POST /api/networking/contacts`

Creates a networking contact.

Body:

```ts
NetworkingContactCreateSchema
```

Tables:

- `networking_contacts`

### `PATCH /api/networking/contacts/:id`

Updates a networking contact. The current implementation expects a full create-shaped body.

Tables:

- `networking_contacts`

### `GET /api/networking/actions`

Lists outreach actions for the authenticated user.

Optional queries:

```txt
?applicationId=<uuid>
?contactId=<uuid>
?status=<planned|sent|replied|no_response|completed>
```

Tables:

- `networking_actions`

### `POST /api/networking/actions`

Creates an outreach action.

Body:

```ts
NetworkingActionCreateSchema
```

Tables:

- `networking_actions`

### `PATCH /api/networking/actions/:id`

Updates an outreach action. The current implementation expects a full create-shaped body.

Tables:

- `networking_actions`

### `POST /api/interview-notes`

Creates an interview note.

Body:

```ts
InterviewNoteCreateSchema
```

Tables:

- `interview_notes`

## Assessment Centre

### `GET /api/assessment-centre/cases`

Lists saved assessment-centre cases.

Optional query:

```txt
?applicationId=<uuid>
```

Tables:

- `assessment_centre_cases`

### `POST /api/assessment-centre/cases`

Creates a manually supplied case prompt.

Body:

```ts
AssessmentCentreCaseCreateSchema
```

Tables:

- `assessment_centre_cases`

### `GET /api/assessment-centre/cases/:id`

Reads one saved case for the authenticated user.

### `PATCH /api/assessment-centre/cases/:id`

Updates a case. The current implementation expects a full create-shaped body.

### `DELETE /api/assessment-centre/cases/:id`

Deletes a case and cascades/deletes linked sessions.

### `GET /api/assessment-centre/sessions`

Lists generated practice sessions and reflections.

Optional queries:

```txt
?applicationId=<uuid>
?caseId=<uuid>
```

Tables:

- `assessment_centre_sessions`

### `POST /api/assessment-centre/sessions`

Creates a session record.

Body:

```ts
AssessmentCentreSessionCreateSchema
```

### `PATCH /api/assessment-centre/sessions/:id`

Updates a session. Used by the UI to save self-reflection and self-score.

## Online Tests

### `GET /api/online-tests/resources`

Lists saved online-test resources and links.

Tables:

- `online_test_resources`

### `POST /api/online-tests/resources`

Creates a user-saved resource.

Body:

```ts
OnlineTestResourceCreateSchema
```

### `GET /api/online-tests/attempts`

Lists online-test practice attempts.

Optional query:

```txt
?applicationId=<uuid>
```

Tables:

- `online_test_attempts`

### `POST /api/online-tests/attempts`

Creates an attempt log.

Body:

```ts
OnlineTestAttemptCreateSchema
```

### `GET /api/online-tests/study-plans`

Lists saved online-test study plans.

Optional query:

```txt
?applicationId=<uuid>
```

Tables:

- `online_test_study_plans`

### `POST /api/online-tests/study-plans`

Creates a study-plan record. The UI uses this for general plans without an application link.

Body:

```ts
OnlineTestStudyPlanCreateSchema
```

## AI

All AI endpoints require:

- Valid auth or development demo auth.
- Valid request body matching shared Zod schemas.

Real AI generation requires `OPENAI_API_KEY`. In non-production without `OPENAI_API_KEY`, the backend returns explicit development mock outputs with `isMock: true`.

Current AI endpoints persist outputs when `applicationId` is supplied.

### `POST /api/ai/job-fit`

Analyzes fit between a career profile and job description.

Body:

```ts
{
  jobDescription: string;
  careerProfile: CareerProfile;
  applicationId?: string;
}
```

Response:

```ts
JobFitResponse
```

Persistence:

- Writes to `job_analyses` when `applicationId` is present.
- Updates `applications.fit_score`.

### `POST /api/ai/cv-tailor`

Generates CV tailoring suggestions.

Body:

```ts
{
  jobDescription: string;
  masterCv: string;
  careerProfile: CareerProfile;
  applicationId?: string;
}
```

Response:

```ts
CvTailoringResponse
```

Persistence:

- Writes to `generated_materials` as `cv_tailoring` when `applicationId` is present.

### `POST /api/ai/cover-letter`

Generates a UK-style cover letter.

Body:

```ts
{
  company: string;
  role: string;
  jobDescription: string;
  careerProfile: CareerProfile;
  applicationId?: string;
}
```

Response:

```ts
CoverLetterResponse
```

Persistence:

- Writes to `generated_materials` as `cover_letter` when `applicationId` is present.

### `POST /api/ai/application-answer`

Generates a STAR-style application answer.

Body:

```ts
{
  company: string;
  role: string;
  question: string;
  jobDescription?: string;
  careerProfile: CareerProfile;
  applicationId?: string;
}
```

Response:

```ts
ApplicationQuestionResponse
```

Persistence:

- Writes to `generated_materials` as `application_question` when `applicationId` is present.

### `POST /api/ai/networking-strategy`

Generates a networking strategy for a job/application.

Body:

```ts
{
  careerProfile: CareerProfile;
  application?: Application;
  company: string;
  role: string;
  jobDescription?: string;
  existingContactInfo?: Array<{
    name?: string;
    title?: string;
    relationshipType?: RelationshipType;
    notes?: string;
  }>;
}
```

Response:

```ts
NetworkingStrategyResponse
```

Important:

- Does not scrape LinkedIn.
- Does not claim to have found real people.
- Does not send or automate messages.
- Generates search queries and drafts only.

### `POST /api/ai/ac-trainer`

Generates an assessment-centre practice session from a manually supplied case prompt.

Body:

```ts
{
  careerProfile: CareerProfile;
  company: string;
  role: string;
  industry: string;
  caseType: AssessmentCentreCaseType;
  casePrompt: string;
  applicationId?: string;
  caseId?: string;
}
```

Response:

```ts
AcTrainerResponse
```

Persistence:

- Writes to `assessment_centre_sessions` when `caseId` exists.

Important:

- Does not reproduce copyrighted or commercial assessment content.
- Does not claim the prompt is official employer content.
- Uses user-provided/manual case prompts only.

### `POST /api/ai/ot-study-plan`

Generates a deadline-led online-test study plan.

Body:

```ts
{
  applicationId?: string;
  provider: OnlineTestProvider;
  testType: string;
  deadline?: string;
  currentScoreOrLevel?: string;
  weakAreas: string[];
  availableTime?: string;
  application?: Application;
  company?: string;
}
```

Response:

```ts
OtStudyPlanResponse
```

Persistence:

- Writes to `online_test_study_plans` when `applicationId` exists.

Important:

- Does not scrape providers.
- Does not claim to know the exact employer assessment.
- Generates official resource search queries only.

### `POST /api/ai/ot-practice-questions`

Generates original, generic practice drills.

Body:

```ts
{
  provider: OnlineTestProvider;
  testType: string;
  weakAreas: string[];
  difficulty?: string;
  count: number;
}
```

Response:

```ts
OtPracticeQuestionsResponse
```

Important:

- Does not reproduce SHL, Cappfinity/Capp, Arctic Shores, Aon, Sova, Watson Glaser, HireVue, employer, or other commercial test-bank questions.
- Generated questions are not official provider content.

## Missing API Areas

- No job source endpoints.
- No standalone generated material history endpoints.
- No standalone persisted job analysis list endpoint.
- No video interview coach endpoints.
- No assessment-provider scraping endpoints.
