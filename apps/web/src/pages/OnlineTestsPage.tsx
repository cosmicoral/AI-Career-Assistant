import type {
  OnlineTestAttempt,
  OnlineTestAttemptCreate,
  OnlineTestProvider,
  OnlineTestResource,
  OnlineTestResourceCreate,
  OnlineTestStudyPlan,
  OtPracticeQuestionsResponse,
  OtStudyPlanResponse
} from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, ClipboardPlus, ListChecks, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { onlineTestProviders } from "../lib/constants";
import {
  useApplications,
  useOnlineTestAttempts,
  useOnlineTestResources,
  useOnlineTestStudyPlans
} from "../lib/queries";

type ResourceDraft = {
  provider: OnlineTestProvider;
  testType: string;
  title: string;
  url: string;
  notes: string;
  isOfficialResource: boolean;
};

type AttemptDraft = {
  provider: OnlineTestProvider;
  testType: string;
  score: string;
  percentile: string;
  timeSpentMinutes: string;
  weakAreas: string;
  notes: string;
  takenAt: string;
};

type PlanDraft = {
  provider: OnlineTestProvider;
  testType: string;
  deadline: string;
  currentScoreOrLevel: string;
  weakAreas: string;
  availableTime: string;
};

type PracticeDraft = {
  provider: OnlineTestProvider;
  testType: string;
  weakAreas: string;
  difficulty: string;
  count: string;
};

const defaultProvider: OnlineTestProvider = "Numerical reasoning";

const emptyResourceDraft: ResourceDraft = {
  provider: defaultProvider,
  testType: "",
  title: "",
  url: "",
  notes: "",
  isOfficialResource: false
};

const emptyAttemptDraft: AttemptDraft = {
  provider: defaultProvider,
  testType: "",
  score: "",
  percentile: "",
  timeSpentMinutes: "",
  weakAreas: "",
  notes: "",
  takenAt: ""
};

const emptyPlanDraft: PlanDraft = {
  provider: defaultProvider,
  testType: "",
  deadline: "",
  currentScoreOrLevel: "",
  weakAreas: "",
  availableTime: ""
};

const emptyPracticeDraft: PracticeDraft = {
  provider: defaultProvider,
  testType: "",
  weakAreas: "",
  difficulty: "medium",
  count: "5"
};

export function OnlineTestsPage() {
  const [searchParams] = useSearchParams();
  const [selectedApplicationId, setSelectedApplicationId] = useState(searchParams.get("applicationId") ?? "");
  const [resourceDraft, setResourceDraft] = useState<ResourceDraft>(emptyResourceDraft);
  const [attemptDraft, setAttemptDraft] = useState<AttemptDraft>(emptyAttemptDraft);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(emptyPlanDraft);
  const [practiceDraft, setPracticeDraft] = useState<PracticeDraft>(emptyPracticeDraft);
  const [planResult, setPlanResult] = useState<OtStudyPlanResponse | null>(null);
  const [practiceResult, setPracticeResult] = useState<OtPracticeQuestionsResponse | null>(null);
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const { data: applications = [] } = useApplications();
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId),
    [applications, selectedApplicationId]
  );
  const { data: resources = [], isLoading: resourcesLoading, error: resourcesError } = useOnlineTestResources();
  const { data: attempts = [], isLoading: attemptsLoading, error: attemptsError } = useOnlineTestAttempts(
    selectedApplicationId ? { applicationId: selectedApplicationId } : {}
  );
  const { data: studyPlans = [], isLoading: plansLoading, error: plansError } = useOnlineTestStudyPlans(
    selectedApplicationId ? { applicationId: selectedApplicationId } : {}
  );

  useEffect(() => {
    if (!selectedApplication?.deadline || planDraft.deadline) return;
    setPlanDraft((current) => ({ ...current, deadline: selectedApplication.deadline ?? "" }));
  }, [planDraft.deadline, selectedApplication]);

  const createResourceMutation = useMutation({
    mutationFn: (payload: OnlineTestResourceCreate) =>
      apiFetch<OnlineTestResource>("/api/online-tests/resources", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      setResourceDraft(emptyResourceDraft);
      setStatus("Resource saved.");
      await queryClient.invalidateQueries({ queryKey: ["online-test-resources"] });
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to save resource.");
    }
  });

  const createAttemptMutation = useMutation({
    mutationFn: (payload: OnlineTestAttemptCreate) =>
      apiFetch<OnlineTestAttempt>("/api/online-tests/attempts", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      setAttemptDraft(emptyAttemptDraft);
      setStatus("Attempt logged.");
      await invalidateOnlineTestQueries(queryClient, selectedApplicationId);
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to log attempt.");
    }
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const result = await apiFetch<OtStudyPlanResponse>("/api/ai/ot-study-plan", {
        method: "POST",
        body: JSON.stringify({
          applicationId: selectedApplicationId || undefined,
          provider: planDraft.provider,
          testType: planDraft.testType,
          deadline: planDraft.deadline || undefined,
          currentScoreOrLevel: planDraft.currentScoreOrLevel || undefined,
          weakAreas: parseList(planDraft.weakAreas),
          availableTime: planDraft.availableTime || undefined,
          application: selectedApplication,
          company: selectedApplication?.company
        })
      });

      if (!selectedApplicationId) {
        await apiFetch<OnlineTestStudyPlan>("/api/online-tests/study-plans", {
          method: "POST",
          body: JSON.stringify({
            applicationId: null,
            provider: planDraft.provider,
            testType: planDraft.testType,
            targetDate: planDraft.deadline || null,
            plan: result.studyPlan,
            priorityTopics: result.priorityTopics,
            isMock: result.isMock
          })
        });
      }

      return result;
    },
    onSuccess: async (result) => {
      setPlanResult(result);
      setStatus("Study plan generated and saved.");
      await invalidateOnlineTestQueries(queryClient, selectedApplicationId);
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to generate study plan.");
    }
  });

  const practiceMutation = useMutation({
    mutationFn: () =>
      apiFetch<OtPracticeQuestionsResponse>("/api/ai/ot-practice-questions", {
        method: "POST",
        body: JSON.stringify({
          provider: practiceDraft.provider,
          testType: practiceDraft.testType,
          weakAreas: parseList(practiceDraft.weakAreas),
          difficulty: practiceDraft.difficulty || undefined,
          count: Number(practiceDraft.count || 5)
        })
      }),
    onSuccess: (result) => {
      setPracticeResult(result);
      setStatus("Original practice questions generated.");
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : "Unable to generate practice questions.");
    }
  });

  async function handleResourceSubmit(event: FormEvent) {
    event.preventDefault();
    await createResourceMutation.mutateAsync(toResourceCreate(resourceDraft));
  }

  async function handleAttemptSubmit(event: FormEvent) {
    event.preventDefault();
    await createAttemptMutation.mutateAsync(toAttemptCreate(attemptDraft, selectedApplicationId));
  }

  async function handlePlanSubmit(event: FormEvent) {
    event.preventDefault();
    setPlanResult(null);
    await generatePlanMutation.mutateAsync();
  }

  async function handlePracticeSubmit(event: FormEvent) {
    event.preventDefault();
    setPracticeResult(null);
    await practiceMutation.mutateAsync();
  }

  const error = resourcesError ?? attemptsError ?? plansError;

  return (
    <div className="page-grid">
      <PageHeader
        eyebrow="Online assessment prep"
        title="Online Test Practice Hub"
        actions={
          selectedApplicationId ? (
            <Link className="secondary-button" to={`/applications/${selectedApplicationId}`}>
              Open workspace
            </Link>
          ) : null
        }
      />

      {error ? <p className="error-text">{error instanceof Error ? error.message : "Unable to load online test data."}</p> : null}
      {status ? <p className={status.includes("Unable") ? "error-text" : "inline-status"}>{status}</p> : null}

      <section className="panel">
        <label>
          Linked application
          <select value={selectedApplicationId} onChange={(event) => setSelectedApplicationId(event.target.value)}>
            <option value="">All / general prep</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.company} - {application.role}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="content-grid two-column">
        <form className="panel form-panel" onSubmit={handlePlanSubmit}>
          <h3>Study plan generator</h3>
          <ProviderSelect value={planDraft.provider} onChange={(provider) => setPlanDraft({ ...planDraft, provider })} />
          <label>
            Test type
            <input
              value={planDraft.testType}
              onChange={(event) => setPlanDraft({ ...planDraft, testType: event.target.value })}
              placeholder="Numerical reasoning, SJT, Watson Glaser..."
              required
            />
          </label>
          <label>
            Deadline
            <input type="date" value={planDraft.deadline} onChange={(event) => setPlanDraft({ ...planDraft, deadline: event.target.value })} />
          </label>
          <label>
            Current score or level
            <input
              value={planDraft.currentScoreOrLevel}
              onChange={(event) => setPlanDraft({ ...planDraft, currentScoreOrLevel: event.target.value })}
              placeholder="Example: 58%, slow on tables"
            />
          </label>
          <label>
            Weak areas
            <input
              value={planDraft.weakAreas}
              onChange={(event) => setPlanDraft({ ...planDraft, weakAreas: event.target.value })}
              placeholder="ratios, inference, timing"
            />
          </label>
          <label>
            Available time
            <input
              value={planDraft.availableTime}
              onChange={(event) => setPlanDraft({ ...planDraft, availableTime: event.target.value })}
              placeholder="45 minutes per day"
            />
          </label>
          <button className="primary-button" type="submit" disabled={generatePlanMutation.isPending}>
            <Sparkles size={16} />
            {generatePlanMutation.isPending ? "Generating..." : "Generate and save plan"}
          </button>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                Study plan <MockBadge show={planResult?.isMock} />
              </span>
              <h2>Latest generated plan</h2>
            </div>
          </div>
          {planResult ? (
            <div className="stack-list">
              <ListBlock label="Plan" items={planResult.studyPlan} />
              <ListBlock label="Priority topics" items={planResult.priorityTopics} />
              <ListBlock label="Daily practice" items={planResult.dailyPracticeSchedule} />
              <ListBlock label="Test strategy" items={planResult.testStrategy} />
              <ListBlock label="Official resource searches" items={planResult.recommendedOfficialResourceSearchQueries} />
            </div>
          ) : (
            <EmptyState title="No plan generated yet" body="Generate a deadline-led study plan for the selected test." />
          )}
        </article>
      </section>

      <section className="content-grid two-column">
        <form className="panel form-panel" onSubmit={handleAttemptSubmit}>
          <h3>Log practice attempt</h3>
          <ProviderSelect value={attemptDraft.provider} onChange={(provider) => setAttemptDraft({ ...attemptDraft, provider })} />
          <label>
            Test type
            <input value={attemptDraft.testType} onChange={(event) => setAttemptDraft({ ...attemptDraft, testType: event.target.value })} required />
          </label>
          <label>
            Score
            <input type="number" value={attemptDraft.score} onChange={(event) => setAttemptDraft({ ...attemptDraft, score: event.target.value })} />
          </label>
          <label>
            Percentile
            <input
              type="number"
              value={attemptDraft.percentile}
              onChange={(event) => setAttemptDraft({ ...attemptDraft, percentile: event.target.value })}
            />
          </label>
          <label>
            Time spent minutes
            <input
              type="number"
              value={attemptDraft.timeSpentMinutes}
              onChange={(event) => setAttemptDraft({ ...attemptDraft, timeSpentMinutes: event.target.value })}
            />
          </label>
          <label>
            Weak areas
            <input value={attemptDraft.weakAreas} onChange={(event) => setAttemptDraft({ ...attemptDraft, weakAreas: event.target.value })} />
          </label>
          <label>
            Taken at
            <input type="date" value={attemptDraft.takenAt} onChange={(event) => setAttemptDraft({ ...attemptDraft, takenAt: event.target.value })} />
          </label>
          <label>
            Notes
            <textarea value={attemptDraft.notes} onChange={(event) => setAttemptDraft({ ...attemptDraft, notes: event.target.value })} />
          </label>
          <button className="secondary-button" type="submit" disabled={createAttemptMutation.isPending}>
            <ClipboardPlus size={16} />
            Log attempt
          </button>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Attempts</span>
              <h2>{selectedApplicationId ? "Application attempts" : "All attempts"}</h2>
            </div>
          </div>
          {attemptsLoading ? (
            <p className="inline-status">Loading attempts...</p>
          ) : attempts.length === 0 ? (
            <EmptyState title="No attempts logged" body="Log real practice scores and weak areas to make prep measurable." />
          ) : (
            <div className="stack-list">
              {attempts.map((attempt) => (
                <article className="list-item" key={attempt.id}>
                  <span className="mini-label">{attempt.provider}</span>
                  <strong>{attempt.testType}</strong>
                  <p>
                    Score {attempt.score ?? "-"} {attempt.percentile ? `- ${attempt.percentile} percentile` : ""}
                  </p>
                  <div className="tag-row">
                    {attempt.takenAt ? <span className="tag">Taken {attempt.takenAt}</span> : null}
                    {attempt.timeSpentMinutes ? <span className="tag">{attempt.timeSpentMinutes} min</span> : null}
                    {attempt.weakAreas.map((area) => (
                      <span className="tag warning" key={area}>
                        {area}
                      </span>
                    ))}
                  </div>
                  {attempt.notes ? <p>{attempt.notes}</p> : null}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="content-grid two-column">
        <form className="panel form-panel" onSubmit={handleResourceSubmit}>
          <h3>Resource log</h3>
          <ProviderSelect value={resourceDraft.provider} onChange={(provider) => setResourceDraft({ ...resourceDraft, provider })} />
          <label>
            Test type
            <input
              value={resourceDraft.testType}
              onChange={(event) => setResourceDraft({ ...resourceDraft, testType: event.target.value })}
              required
            />
          </label>
          <label>
            Title
            <input value={resourceDraft.title} onChange={(event) => setResourceDraft({ ...resourceDraft, title: event.target.value })} required />
          </label>
          <label>
            URL
            <input value={resourceDraft.url} onChange={(event) => setResourceDraft({ ...resourceDraft, url: event.target.value })} />
          </label>
          <label>
            Notes
            <textarea value={resourceDraft.notes} onChange={(event) => setResourceDraft({ ...resourceDraft, notes: event.target.value })} />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={resourceDraft.isOfficialResource}
              onChange={(event) => setResourceDraft({ ...resourceDraft, isOfficialResource: event.target.checked })}
            />
            Official or provider-owned resource
          </label>
          <button className="secondary-button" type="submit" disabled={createResourceMutation.isPending}>
            <BookOpenCheck size={16} />
            Save resource
          </button>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Resources</span>
              <h2>Saved prep links</h2>
            </div>
          </div>
          {resourcesLoading ? (
            <p className="inline-status">Loading resources...</p>
          ) : resources.length === 0 ? (
            <EmptyState title="No resources saved" body="Add official/provider links or your own notes. CareerOS does not scrape test providers." />
          ) : (
            <div className="stack-list">
              {resources.map((resource) => (
                <article className="list-item" key={resource.id}>
                  <span className="mini-label">{resource.provider}</span>
                  <strong>{resource.title}</strong>
                  <p>{resource.testType}</p>
                  <div className="tag-row">
                    {resource.isOfficialResource ? <span className="tag positive">Official</span> : <span className="tag">User saved</span>}
                  </div>
                  {resource.url ? (
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      Open resource
                    </a>
                  ) : null}
                  {resource.notes ? <p>{resource.notes}</p> : null}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="content-grid two-column">
        <form className="panel form-panel" onSubmit={handlePracticeSubmit}>
          <h3>Original practice questions</h3>
          <ProviderSelect value={practiceDraft.provider} onChange={(provider) => setPracticeDraft({ ...practiceDraft, provider })} />
          <label>
            Test type
            <input
              value={practiceDraft.testType}
              onChange={(event) => setPracticeDraft({ ...practiceDraft, testType: event.target.value })}
              required
            />
          </label>
          <label>
            Weak areas
            <input
              value={practiceDraft.weakAreas}
              onChange={(event) => setPracticeDraft({ ...practiceDraft, weakAreas: event.target.value })}
            />
          </label>
          <label>
            Difficulty
            <input
              value={practiceDraft.difficulty}
              onChange={(event) => setPracticeDraft({ ...practiceDraft, difficulty: event.target.value })}
            />
          </label>
          <label>
            Count
            <input
              type="number"
              min="1"
              max="10"
              value={practiceDraft.count}
              onChange={(event) => setPracticeDraft({ ...practiceDraft, count: event.target.value })}
            />
          </label>
          <button className="secondary-button" type="submit" disabled={practiceMutation.isPending}>
            <ListChecks size={16} />
            Generate original drills
          </button>
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                Practice drills <MockBadge show={practiceResult?.isMock} />
              </span>
              <h2>Generated questions</h2>
            </div>
          </div>
          {practiceResult ? (
            <div className="stack-list">
              {practiceResult.questions.map((question, index) => (
                <article className="list-item" key={`${question}-${index}`}>
                  <span className="mini-label">Question {index + 1}</span>
                  <strong>{question}</strong>
                  <p>{practiceResult.answerKey[index]}</p>
                  <p>{practiceResult.explanations[index]}</p>
                </article>
              ))}
              <ListBlock label="Risk notes" items={practiceResult.riskNotes} />
            </div>
          ) : (
            <EmptyState title="No drills generated" body="Generate original generic practice questions for your weak areas." />
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Saved study plans</span>
            <h2>{selectedApplicationId ? "Application plans" : "All plans"}</h2>
          </div>
        </div>
        {plansLoading ? (
          <p className="inline-status">Loading study plans...</p>
        ) : studyPlans.length === 0 ? (
          <EmptyState title="No study plans saved" body="Generate a plan to track preparation against a real deadline." />
        ) : (
          <div className="stack-list">
            {studyPlans.map((plan) => (
              <article className="list-item" key={plan.id}>
                <span className="mini-label">
                  {plan.provider} <MockBadge show={plan.isMock} />
                </span>
                <strong>{plan.testType}</strong>
                <div className="tag-row">
                  {plan.targetDate ? <span className="tag">Target {plan.targetDate}</span> : null}
                  {plan.priorityTopics.map((topic) => (
                    <span className="tag warning" key={topic}>
                      {topic}
                    </span>
                  ))}
                </div>
                <ListBlock label="Plan" items={plan.plan} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderSelect({
  value,
  onChange
}: {
  value: OnlineTestProvider;
  onChange: (provider: OnlineTestProvider) => void;
}) {
  return (
    <label>
      Provider / test family
      <select value={value} onChange={(event) => onChange(event.target.value as OnlineTestProvider)}>
        {onlineTestProviders.map((provider) => (
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
      </select>
    </label>
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

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toResourceCreate(draft: ResourceDraft): OnlineTestResourceCreate {
  return {
    provider: draft.provider,
    testType: draft.testType,
    title: draft.title,
    url: draft.url || null,
    notes: draft.notes || null,
    isOfficialResource: draft.isOfficialResource
  };
}

function toAttemptCreate(draft: AttemptDraft, applicationId: string): OnlineTestAttemptCreate {
  return {
    applicationId: applicationId || null,
    provider: draft.provider,
    testType: draft.testType,
    score: draft.score ? Number(draft.score) : null,
    percentile: draft.percentile ? Number(draft.percentile) : null,
    timeSpentMinutes: draft.timeSpentMinutes ? Number(draft.timeSpentMinutes) : null,
    weakAreas: parseList(draft.weakAreas),
    notes: draft.notes || null,
    takenAt: draft.takenAt || null
  };
}

async function invalidateOnlineTestQueries(queryClient: ReturnType<typeof useQueryClient>, applicationId: string) {
  await queryClient.invalidateQueries({ queryKey: ["online-test-attempts"] });
  await queryClient.invalidateQueries({ queryKey: ["online-test-study-plans"] });
  await queryClient.invalidateQueries({ queryKey: ["application-workspace", applicationId] });
}
