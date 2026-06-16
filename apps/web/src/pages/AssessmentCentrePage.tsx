import type {
  AcTrainerResponse,
  Application,
  AssessmentCentreCase,
  AssessmentCentreCaseCreate,
  AssessmentCentreCaseType,
  AssessmentCentreSession,
  AssessmentCentreSessionCreate
} from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, PlayCircle, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { assessmentCentreCaseTypes } from "../lib/constants";
import { useApplications, useAssessmentCentreCases, useAssessmentCentreSessions, useProfile } from "../lib/queries";

type CaseDraft = {
  applicationId: string;
  company: string;
  role: string;
  industry: string;
  caseType: AssessmentCentreCaseType;
  prompt: string;
  difficulty: string;
  sourceNote: string;
  tags: string;
};

const emptyCaseDraft: CaseDraft = {
  applicationId: "",
  company: "",
  role: "",
  industry: "",
  caseType: "group_discussion",
  prompt: "",
  difficulty: "",
  sourceNote: "",
  tags: ""
};

export function AssessmentCentrePage() {
  const [searchParams] = useSearchParams();
  const initialApplicationId = searchParams.get("applicationId") ?? "";
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: applications = [] } = useApplications();
  const [draft, setDraft] = useState<CaseDraft>({ ...emptyCaseDraft, applicationId: initialApplicationId });
  const [result, setResult] = useState<AcTrainerResponse | null>(null);
  const [status, setStatus] = useState("");

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === draft.applicationId),
    [applications, draft.applicationId]
  );

  const {
    data: cases = [],
    isLoading: casesLoading,
    error: casesError
  } = useAssessmentCentreCases(draft.applicationId ? { applicationId: draft.applicationId } : {});
  const { data: sessions = [], isLoading: sessionsLoading } = useAssessmentCentreSessions(
    draft.applicationId ? { applicationId: draft.applicationId } : {}
  );

  useEffect(() => {
    if (!selectedApplication) return;

    setDraft((current) => ({
      ...current,
      company: current.company || selectedApplication.company,
      role: current.role || selectedApplication.role
    }));
  }, [selectedApplication]);

  const createCaseMutation = useMutation({
    mutationFn: (payload: AssessmentCentreCaseCreate) =>
      apiFetch<AssessmentCentreCase>("/api/assessment-centre/cases", {
        method: "POST",
        body: JSON.stringify(payload)
      })
  });

  const trainerMutation = useMutation({
    mutationFn: (acCase: AssessmentCentreCase) => {
      if (!profile) {
        throw new Error("Save your career profile before generating assessment-centre coaching.");
      }

      return apiFetch<AcTrainerResponse>("/api/ai/ac-trainer", {
        method: "POST",
        body: JSON.stringify({
          careerProfile: profile,
          company: acCase.company,
          role: acCase.role,
          industry: acCase.industry,
          caseType: acCase.caseType,
          casePrompt: acCase.prompt,
          applicationId: acCase.applicationId ?? undefined,
          caseId: acCase.id
        })
      });
    },
    onSuccess: async (data, acCase) => {
      setResult(data);
      setStatus("Practice session generated and saved.");
      await queryClient.invalidateQueries({ queryKey: ["assessment-centre-sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["application-workspace", acCase.applicationId] });
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to generate assessment-centre session.");
    }
  });

  async function handleCreateCase(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);

    try {
      const acCase = await createCaseMutation.mutateAsync(toCaseCreate(draft));
      await queryClient.invalidateQueries({ queryKey: ["assessment-centre-cases"] });
      await queryClient.invalidateQueries({ queryKey: ["application-workspace", acCase.applicationId] });
      setStatus("Assessment-centre case saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save assessment-centre case.");
    }
  }

  async function handleCreateAndRun() {
    setStatus("");
    setResult(null);

    try {
      const acCase = await createCaseMutation.mutateAsync(toCaseCreate(draft));
      await queryClient.invalidateQueries({ queryKey: ["assessment-centre-cases"] });
      await trainerMutation.mutateAsync(acCase);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create and run assessment-centre practice.");
    }
  }

  function handleApplicationChange(applicationId: string) {
    const application = applications.find((item) => item.id === applicationId);

    setDraft((current) => ({
      ...current,
      applicationId,
      company: application?.company ?? current.company,
      role: application?.role ?? current.role
    }));
  }

  const isBusy = createCaseMutation.isPending || trainerMutation.isPending;

  return (
    <div className="page-grid">
      <PageHeader
        eyebrow="Assessment centre prep"
        title="Assessment Centre Trainer"
        actions={
          <button className="primary-button" type="button" onClick={handleCreateAndRun} disabled={isBusy}>
            <PlayCircle size={16} />
            {isBusy ? "Working..." : "Save and generate session"}
          </button>
        }
      />

      {casesError ? (
        <p className="error-text">{casesError instanceof Error ? casesError.message : "Unable to load cases."}</p>
      ) : null}

      <section className="content-grid two-column">
        <form className="panel form-panel" onSubmit={handleCreateCase}>
          <h3>Case setup</h3>
          <label>
            Linked application
            <select value={draft.applicationId} onChange={(event) => handleApplicationChange(event.target.value)}>
              <option value="">No linked application</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company} - {application.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Company
            <input value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} required />
          </label>
          <label>
            Role
            <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} required />
          </label>
          <label>
            Industry
            <input
              value={draft.industry}
              onChange={(event) => setDraft({ ...draft, industry: event.target.value })}
              placeholder="Consulting, finance, marketing..."
              required
            />
          </label>
          <label>
            Exercise type
            <select
              value={draft.caseType}
              onChange={(event) => setDraft({ ...draft, caseType: event.target.value as AssessmentCentreCaseType })}
            >
              {assessmentCentreCaseTypes.map((type) => (
                <option key={type} value={type}>
                  {caseTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <input value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })} />
          </label>
          <label>
            Source note
            <input
              value={draft.sourceNote}
              onChange={(event) => setDraft({ ...draft, sourceNote: event.target.value })}
              placeholder="Manual note, recruiter hint, employer page..."
            />
          </label>
          <label>
            Tags
            <input
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
              placeholder="strategy, teamwork, commercial"
            />
          </label>
          <label>
            Case prompt
            <textarea
              className="tall-textarea"
              value={draft.prompt}
              onChange={(event) => setDraft({ ...draft, prompt: event.target.value })}
              placeholder="Paste or write your own practice case. Do not paste copyrighted test-bank content."
              required
            />
          </label>
          <div className="action-row">
            <button className="secondary-button" type="submit" disabled={isBusy}>
              <Save size={16} />
              Save case only
            </button>
          </div>
          {status ? <p className={status.includes("Unable") || status.includes("Save your") ? "error-text" : "inline-status"}>{status}</p> : null}
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                Trainer output <MockBadge show={result?.isMock} />
              </span>
              <h2>Practice session</h2>
            </div>
          </div>
          {result ? (
            <div className="stack-list">
              <div className="list-item">
                <span className="mini-label">Case summary</span>
                <p>{result.caseSummary}</p>
              </div>
              <ListBlock label="Discussion agenda" items={result.discussionAgenda} />
              <ListBlock label="Strong contribution examples" items={result.strongContributionExamples} />
              <ListBlock label="Assessor rubric" items={result.assessorRubric} />
              <div className="list-item">
                <span className="mini-label">Opening statement</span>
                <p>{result.openingStatementDraft}</p>
              </div>
              <div className="list-item">
                <span className="mini-label">Final recommendation</span>
                <p>{result.finalRecommendationDraft}</p>
              </div>
            </div>
          ) : (
            <EmptyState title="No session generated yet" body="Save a case and generate a practice session to start." />
          )}
        </article>
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Case library</span>
              <h2>{draft.applicationId ? "Linked cases" : "All saved cases"}</h2>
            </div>
          </div>
          {casesLoading ? (
            <p className="inline-status">Loading cases...</p>
          ) : cases.length === 0 ? (
            <EmptyState
              title="No assessment-centre cases saved"
              body="Add a manual case prompt above. CareerOS does not scrape or provide commercial test-bank content."
            />
          ) : (
            <div className="stack-list">
              {cases.map((acCase) => (
                <article className="list-item" key={acCase.id}>
                  <span className="mini-label">{caseTypeLabel(acCase.caseType)}</span>
                  <strong>
                    {acCase.company} - {acCase.role}
                  </strong>
                  <p>{acCase.prompt}</p>
                  <div className="tag-row">
                    <span className="tag">{acCase.industry}</span>
                    {acCase.difficulty ? <span className="tag">{acCase.difficulty}</span> : null}
                    {acCase.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="action-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => trainerMutation.mutate(acCase)}
                      disabled={trainerMutation.isPending}
                    >
                      <ClipboardCheck size={16} />
                      Generate session
                    </button>
                    {acCase.applicationId ? (
                      <Link className="secondary-button" to={`/applications/${acCase.applicationId}`}>
                        Open workspace
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Practice history</span>
              <h2>Sessions and reflections</h2>
            </div>
          </div>
          {sessionsLoading ? (
            <p className="inline-status">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <EmptyState title="No practice sessions yet" body="Generate a session from a saved case to track practice." />
          ) : (
            <div className="stack-list">
              {sessions.map((session) => (
                <SessionReflectionForm key={session.id} session={session} />
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function SessionReflectionForm({ session }: { session: AssessmentCentreSession }) {
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState(session.userReflection ?? "");
  const [score, setScore] = useState(session.scoreSelfAssessed?.toString() ?? "");
  const [status, setStatus] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: AssessmentCentreSessionCreate) =>
      apiFetch<AssessmentCentreSession>(`/api/assessment-centre/sessions/${session.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      }),
    onSuccess: async (updatedSession) => {
      setStatus("Reflection saved.");
      await queryClient.invalidateQueries({ queryKey: ["assessment-centre-sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["application-workspace", updatedSession.applicationId] });
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to save reflection.");
    }
  });

  async function handleSaveReflection() {
    await mutation.mutateAsync({
      ...toSessionCreate(session),
      userReflection: reflection || null,
      scoreSelfAssessed: score ? Number(score) : null
    });
  }

  return (
    <article className="list-item">
      <span className="mini-label">
        {caseTypeLabel(session.sessionType as AssessmentCentreCaseType)} <MockBadge show={session.isMock} />
      </span>
      <strong>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "Practice session"}</strong>
      <div className="stack-list">
        <ListBlock label="Agenda" items={session.generatedAgenda} />
        <ListBlock label="Rubric" items={session.feedbackRubric} />
      </div>
      {session.openingStatement ? <p>{session.openingStatement}</p> : null}
      <div className="content-grid two-column compact-form">
        <label>
          Self-reflection
          <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} />
        </label>
        <label>
          Self score
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </label>
      </div>
      <div className="action-row">
        <button className="secondary-button" type="button" onClick={handleSaveReflection} disabled={mutation.isPending}>
          Save reflection
        </button>
      </div>
      {status ? <p className={status.includes("Unable") ? "error-text" : "inline-status"}>{status}</p> : null}
    </article>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="list-item compact">
      <span className="mini-label">{label}</span>
      <div className="stack-list">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function toCaseCreate(draft: CaseDraft): AssessmentCentreCaseCreate {
  return {
    applicationId: draft.applicationId || null,
    company: draft.company,
    role: draft.role,
    industry: draft.industry,
    caseType: draft.caseType,
    prompt: draft.prompt,
    difficulty: draft.difficulty || null,
    sourceNote: draft.sourceNote || null,
    tags: draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };
}

function toSessionCreate(session: AssessmentCentreSession): AssessmentCentreSessionCreate {
  return {
    caseId: session.caseId,
    applicationId: session.applicationId ?? null,
    sessionType: session.sessionType,
    generatedAgenda: session.generatedAgenda,
    stakeholderMap: session.stakeholderMap,
    suggestedArguments: session.suggestedArguments,
    openingStatement: session.openingStatement ?? null,
    finalRecommendation: session.finalRecommendation ?? null,
    feedbackRubric: session.feedbackRubric,
    userReflection: session.userReflection ?? null,
    scoreSelfAssessed: session.scoreSelfAssessed ?? null,
    isMock: session.isMock
  };
}

function caseTypeLabel(type: AssessmentCentreCaseType | string) {
  return type.replace(/_/g, " ");
}
