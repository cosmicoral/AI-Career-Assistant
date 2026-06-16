import type {
  Application,
  ApplicationCreate,
  ApplicationStatus,
  GeneratedMaterial,
  NetworkingAction,
  NetworkingActionCreate,
  NetworkingActionStatus,
  NetworkingContact,
  NetworkingContactCreate,
  NetworkingStrategyResponse,
  RelationshipType
} from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, ExternalLink, ListChecks, MessageSquarePlus, Search, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { ScoreRing } from "../components/ScoreRing";
import { StatusBadge } from "../components/StatusBadge";
import { apiFetch } from "../lib/api";
import { applicationStatuses, relationshipTypes } from "../lib/constants";
import { useApplicationWorkspace, useProfile } from "../lib/queries";

const emptyContactDraft: NetworkingContactCreate = {
  applicationId: null,
  company: "",
  name: "",
  title: "",
  linkedinUrl: "",
  email: "",
  relationshipType: "unknown",
  relevanceScore: null,
  notes: ""
};

export function ApplicationWorkspacePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: workspace, isLoading, error } = useApplicationWorkspace(id);
  const { data: profile } = useProfile();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactDraft, setContactDraft] = useState<NetworkingContactCreate>(emptyContactDraft);
  const [strategy, setStrategy] = useState<NetworkingStrategyResponse | null>(null);
  const [networkingStatus, setNetworkingStatus] = useState("");

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => {
      if (!workspace) throw new Error("Application is not loaded.");

      return apiFetch<Application>(`/api/applications/${workspace.application.id}`, {
        method: "PATCH",
        body: JSON.stringify(toApplicationCreate(workspace.application, status))
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["application-workspace", id] });
    }
  });

  const strategyMutation = useMutation({
    mutationFn: () => {
      if (!workspace) throw new Error("Application is not loaded.");
      if (!profile) throw new Error("Save your career profile before generating a networking strategy.");

      return apiFetch<NetworkingStrategyResponse>("/api/ai/networking-strategy", {
        method: "POST",
        body: JSON.stringify({
          careerProfile: profile,
          application: workspace.application,
          company: workspace.application.company,
          role: workspace.application.role,
          jobDescription: workspace.application.jobDescription ?? undefined,
          existingContactInfo: workspace.networkingContacts.map((contact) => ({
            name: contact.name,
            title: contact.title,
            relationshipType: contact.relationshipType,
            notes: contact.notes ?? undefined
          }))
        })
      });
    },
    onSuccess: (data) => {
      setStrategy(data);
      setNetworkingStatus("Networking strategy generated.");
    },
    onError: (err) => {
      setNetworkingStatus(err instanceof Error ? err.message : "Unable to generate networking strategy.");
    }
  });

  const createContactMutation = useMutation({
    mutationFn: (contact: NetworkingContactCreate) =>
      apiFetch<NetworkingContact>("/api/networking/contacts", {
        method: "POST",
        body: JSON.stringify(contact)
      }),
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, id);
      setShowContactForm(false);
      setContactDraft(emptyContactDraft);
      setNetworkingStatus("Contact saved.");
    },
    onError: (err) => {
      setNetworkingStatus(err instanceof Error ? err.message : "Unable to save contact.");
    }
  });

  const createActionMutation = useMutation({
    mutationFn: (action: NetworkingActionCreate) =>
      apiFetch<NetworkingAction>("/api/networking/actions", {
        method: "POST",
        body: JSON.stringify(action)
      }),
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, id);
    }
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ actionId, action }: { actionId: string; action: NetworkingActionCreate }) =>
      apiFetch<NetworkingAction>(`/api/networking/actions/${actionId}`, {
        method: "PATCH",
        body: JSON.stringify(action)
      }),
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, id);
    }
  });

  if (isLoading) {
    return <p className="inline-status">Loading application workspace...</p>;
  }

  if (error || !workspace) {
    return (
      <EmptyState
        title="Application not found"
        body={error instanceof Error ? error.message : "This application could not be loaded."}
        action={
          <Link className="secondary-button" to="/tracker">
            Back to tracker
          </Link>
        }
      />
    );
  }

  const loadedWorkspace = workspace;
  const cvTailoring = loadedWorkspace.generatedMaterials.filter((material) => material.materialType === "cv_tailoring");
  const coverLetters = loadedWorkspace.generatedMaterials.filter((material) => material.materialType === "cover_letter");
  const answers = loadedWorkspace.generatedMaterials.filter((material) => material.materialType === "application_question");

  async function handleCreateContact(event: FormEvent) {
    event.preventDefault();
    await createContactMutation.mutateAsync({
      ...contactDraft,
      applicationId: loadedWorkspace.application.id,
      company: contactDraft.company || loadedWorkspace.application.company
    });
  }

  async function addFollowUp(contact: NetworkingContact) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    await createActionMutation.mutateAsync({
      contactId: contact.id,
      applicationId: loadedWorkspace.application.id,
      actionType: "follow_up",
      status: "planned",
      dueDate: dueDate.toISOString().slice(0, 10),
      messageDraft: strategy?.followUpMessageDraft ?? "",
      notes: "Follow up from CareerOS networking strategy."
    });
    setNetworkingStatus("Follow-up reminder added.");
  }

  async function markContact(contact: NetworkingContact, status: Extract<NetworkingActionStatus, "sent" | "replied">) {
    const existingAction = loadedWorkspace.networkingActions.find((action) => action.contactId === contact.id);
    const actionPayload: NetworkingActionCreate = {
      contactId: contact.id,
      applicationId: loadedWorkspace.application.id,
      actionType: status === "sent" ? "message" : "thank_you",
      status,
      dueDate: null,
      messageDraft: status === "sent" ? strategy?.firstMessageDraft ?? "" : "",
      notes: status === "sent" ? "Marked as contacted." : "Marked as replied."
    };

    if (existingAction) {
      await updateActionMutation.mutateAsync({
        actionId: existingAction.id,
        action: {
          ...existingAction,
          ...actionPayload
        }
      });
    } else {
      await createActionMutation.mutateAsync(actionPayload);
    }

    setNetworkingStatus(status === "sent" ? "Contact marked as contacted." : "Contact marked as replied.");
  }

  return (
    <div className="page-grid">
      <PageHeader
        eyebrow="Application workspace"
        title={`${workspace.application.company} - ${workspace.application.role}`}
        actions={
          <Link className="secondary-button" to="/tracker">
            Back to tracker
          </Link>
        }
      />

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Application</span>
              <h2>{workspace.application.company}</h2>
              <p className="muted">{workspace.application.role}</p>
            </div>
            <StatusBadge status={workspace.application.status} />
          </div>
          <div className="detail-list">
            <div>
              <span>Deadline</span>
              <strong>{workspace.application.deadline ?? "Not set"}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{workspace.application.location ?? "Not set"}</strong>
            </div>
            <div>
              <span>Job URL</span>
              {workspace.application.jobUrl ? (
                <a href={workspace.application.jobUrl} target="_blank" rel="noreferrer">
                  Open job <ExternalLink size={14} />
                </a>
              ) : (
                <strong>Not set</strong>
              )}
            </div>
          </div>
          <label>
            Status
            <select
              value={workspace.application.status}
              onChange={(event) => statusMutation.mutate(event.target.value as ApplicationStatus)}
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          {statusMutation.isPending ? <p className="inline-status">Updating status...</p> : null}
        </article>

        <article className="panel">
          {workspace.latestFitAnalysis ? (
            <>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    {workspace.latestFitAnalysis.recommendation} <MockBadge show={workspace.latestFitAnalysis.isMock} />
                  </span>
                  <h2>Latest fit analysis</h2>
                </div>
                <ScoreRing score={workspace.latestFitAnalysis.fitScore} />
              </div>
              <p className="muted">{workspace.latestFitAnalysis.rationale}</p>
              <div className="tag-row">
                {workspace.latestFitAnalysis.matchingSkills.map((skill) => (
                  <span className="tag positive" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No fit analysis saved"
              body="Run Job Fit with this application selected to save the analysis here."
              action={
                <Link className="secondary-button" to="/job-fit">
                  Run job fit
                </Link>
              }
            />
          )}
        </article>
      </section>

      <section className="panel">
        <span className="eyebrow">Job description</span>
        {workspace.application.jobDescription ? (
          <pre className="letter-output">{workspace.application.jobDescription}</pre>
        ) : (
          <EmptyState title="No job description saved" body="Save an application through Job Fit to keep the JD here." />
        )}
      </section>

      <section className="content-grid two-column">
        <MaterialsPanel title="Generated CV tailoring notes" empty="No CV tailoring saved yet." materials={cvTailoring} />
        <MaterialsPanel title="Generated cover letter" empty="No cover letter saved yet." materials={coverLetters} />
      </section>

      <section className="content-grid two-column">
        <MaterialsPanel title="Generated application answers" empty="No application answers saved yet." materials={answers} />
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Interview notes</span>
              <h2>Linked notes</h2>
            </div>
          </div>
          {workspace.interviewNotes.length === 0 ? (
            <EmptyState
              title="No linked interview notes"
              body="Link notes to this application from the Interview KB page."
              action={
                <Link className="secondary-button" to="/interview-kb">
                  Add notes
                </Link>
              }
            />
          ) : (
            <div className="stack-list">
              {workspace.interviewNotes.map((note) => (
                <article className="list-item" key={note.id}>
                  <span className="mini-label">{note.noteType}</span>
                  <strong>{note.company}</strong>
                  <p>{note.content}</p>
                  <div className="tag-row">
                    {note.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Assessment centre prep</span>
              <h2>Cases and practice sessions</h2>
            </div>
            <Link className="secondary-button" to={`/assessment-centre?applicationId=${workspace.application.id}`}>
              <ClipboardCheck size={16} />
              Prep AC
            </Link>
          </div>
          {workspace.assessmentCentreCases.length === 0 && workspace.assessmentCentreSessions.length === 0 ? (
            <EmptyState
              title="No assessment-centre prep saved"
              body="Create a manual case prompt and generate a practice session for this application."
            />
          ) : (
            <div className="stack-list">
              {workspace.assessmentCentreCases.map((acCase) => (
                <article className="list-item" key={acCase.id}>
                  <span className="mini-label">{acCase.caseType.replace("_", " ")}</span>
                  <strong>{acCase.industry}</strong>
                  <p>{acCase.prompt}</p>
                  <div className="tag-row">
                    {acCase.difficulty ? <span className="tag">{acCase.difficulty}</span> : null}
                    {acCase.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              {workspace.assessmentCentreSessions.map((session) => (
                <article className="list-item" key={session.id}>
                  <span className="mini-label">
                    Practice session <MockBadge show={session.isMock} />
                  </span>
                  <strong>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : session.sessionType}</strong>
                  {session.finalRecommendation ? <p>{session.finalRecommendation}</p> : null}
                  <div className="tag-row">
                    {session.scoreSelfAssessed !== null && session.scoreSelfAssessed !== undefined ? (
                      <span className="tag">Self score {session.scoreSelfAssessed}</span>
                    ) : null}
                    {session.feedbackRubric.slice(0, 4).map((item) => (
                      <span className="tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Online test prep</span>
              <h2>Attempts and study plans</h2>
            </div>
            <Link className="secondary-button" to={`/online-tests?applicationId=${workspace.application.id}`}>
              <ListChecks size={16} />
              Prep tests
            </Link>
          </div>
          {workspace.onlineTestAttempts.length === 0 && workspace.onlineTestStudyPlans.length === 0 ? (
            <EmptyState
              title="No online-test prep saved"
              body="Log practice attempts or generate a study plan for this application."
            />
          ) : (
            <div className="stack-list">
              {workspace.onlineTestStudyPlans.map((plan) => (
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
                  {plan.plan[0] ? <p>{plan.plan[0]}</p> : null}
                </article>
              ))}
              {workspace.onlineTestAttempts.map((attempt) => (
                <article className="list-item" key={attempt.id}>
                  <span className="mini-label">{attempt.provider}</span>
                  <strong>{attempt.testType}</strong>
                  <p>
                    Score {attempt.score ?? "-"} {attempt.percentile ? `- ${attempt.percentile} percentile` : ""}
                  </p>
                  <div className="tag-row">
                    {attempt.takenAt ? <span className="tag">Taken {attempt.takenAt}</span> : null}
                    {attempt.weakAreas.map((area) => (
                      <span className="tag warning" key={area}>
                        {area}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Networking Strategy</span>
            <h2>People to approach for this application</h2>
          </div>
          <div className="action-row">
            <button className="secondary-button" type="button" onClick={() => setShowContactForm((value) => !value)}>
              <UserPlus size={16} />
              Add contact manually
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => strategyMutation.mutate()}
              disabled={strategyMutation.isPending}
            >
              <Search size={16} />
              Generate LinkedIn search queries
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => strategyMutation.mutate()}
              disabled={strategyMutation.isPending}
            >
              <MessageSquarePlus size={16} />
              Generate outreach message
            </button>
          </div>
        </div>

        {networkingStatus ? (
          <p className={networkingStatus.includes("Unable") || networkingStatus.includes("Save your") ? "error-text" : "inline-status"}>
            {networkingStatus}
          </p>
        ) : null}

        {showContactForm ? (
          <form className="content-grid two-column compact-form" onSubmit={handleCreateContact}>
            <label>
              Name
              <input
                value={contactDraft.name}
                onChange={(event) => setContactDraft({ ...contactDraft, name: event.target.value })}
                required
              />
            </label>
            <label>
              Title
              <input
                value={contactDraft.title}
                onChange={(event) => setContactDraft({ ...contactDraft, title: event.target.value })}
                required
              />
            </label>
            <label>
              LinkedIn URL
              <input
                value={contactDraft.linkedinUrl ?? ""}
                onChange={(event) => setContactDraft({ ...contactDraft, linkedinUrl: event.target.value })}
              />
            </label>
            <label>
              Relationship
              <select
                value={contactDraft.relationshipType}
                onChange={(event) =>
                  setContactDraft({ ...contactDraft, relationshipType: event.target.value as RelationshipType })
                }
              >
                {relationshipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Relevance score
              <input
                type="number"
                min="0"
                max="100"
                value={contactDraft.relevanceScore ?? ""}
                onChange={(event) =>
                  setContactDraft({
                    ...contactDraft,
                    relevanceScore: event.target.value ? Number(event.target.value) : null
                  })
                }
              />
            </label>
            <label>
              Notes
              <input
                value={contactDraft.notes ?? ""}
                onChange={(event) => setContactDraft({ ...contactDraft, notes: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit" disabled={createContactMutation.isPending}>
              Save contact
            </button>
          </form>
        ) : null}

        <div className="content-grid two-column networking-grid">
          <article>
            <h3>Target people to approach</h3>
            {workspace.networkingContacts.length === 0 ? (
              <EmptyState
                title="No contacts added"
                body="Add people manually after finding them. CareerOS will not claim to have found real people."
              />
            ) : (
              <div className="stack-list">
                {workspace.networkingContacts.map((contact) => {
                  const contactActions = workspace.networkingActions.filter((action) => action.contactId === contact.id);
                  return (
                    <article className="list-item" key={contact.id}>
                      <span className="mini-label">{contact.relationshipType.replace("_", " ")}</span>
                      <strong>{contact.name}</strong>
                      <p>
                        {contact.title} at {contact.company}
                      </p>
                      {contact.linkedinUrl ? (
                        <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
                          LinkedIn <ExternalLink size={14} />
                        </a>
                      ) : null}
                      <div className="tag-row">
                        {typeof contact.relevanceScore === "number" ? <span className="tag">Priority {contact.relevanceScore}</span> : null}
                        {contactActions.map((action) => (
                          <span className="tag" key={action.id}>
                            {action.actionType.replace("_", " ")}: {action.status.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                      <div className="action-row">
                        <button className="secondary-button" type="button" onClick={() => addFollowUp(contact)}>
                          Add follow-up reminder
                        </button>
                        <button className="secondary-button" type="button" onClick={() => markContact(contact, "sent")}>
                          Mark as contacted
                        </button>
                        <button className="secondary-button" type="button" onClick={() => markContact(contact, "replied")}>
                          Mark as replied
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article>
            <h3>Suggested searches and drafts</h3>
            {strategy ? (
              <div className="stack-list">
                <div className="list-item">
                  <span className="mini-label">People categories</span>
                  <div className="stack-list">
                    {strategy.peopleToApproachCategories.map((category) => (
                      <div className="list-item compact" key={category}>
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="list-item">
                  <span className="mini-label">
                    Search queries <MockBadge show={strategy.isMock} />
                  </span>
                  <div className="stack-list">
                    {strategy.linkedinSearchQueries.map((query) => (
                      <div className="list-item compact" key={query}>
                        {query}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="list-item">
                  <span className="mini-label">Outreach priority</span>
                  <div className="stack-list">
                    {strategy.outreachStrategy.map((step) => (
                      <div className="list-item compact" key={step}>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="list-item">
                  <span className="mini-label">First message</span>
                  <p>{strategy.firstMessageDraft}</p>
                </div>
                <div className="list-item">
                  <span className="mini-label">Follow-up</span>
                  <p>{strategy.followUpMessageDraft}</p>
                </div>
                <div className="list-item">
                  <span className="mini-label">Referral request</span>
                  <p>{strategy.referralRequestDraft}</p>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No networking strategy generated"
                body="Generate search queries and message drafts. CareerOS does not scrape LinkedIn or send messages."
              />
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

function MaterialsPanel({ title, empty, materials }: { title: string; empty: string; materials: GeneratedMaterial[] }) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Generated material</span>
          <h2>{title}</h2>
        </div>
      </div>
      {materials.length === 0 ? (
        <EmptyState title={empty} body="Generate this from the relevant assistant with the application selected." />
      ) : (
        <div className="stack-list">
          {materials.map((material) => (
            <article className="list-item" key={material.id}>
              <span className="mini-label">
                {material.materialType.replace("_", " ")} <MockBadge show={material.isMock} />
              </span>
              <MaterialOutput material={material} />
            </article>
          ))}
        </div>
      )}
    </article>
  );
}

function MaterialOutput({ material }: { material: GeneratedMaterial }) {
  const output = material.output as Record<string, unknown>;

  if (material.materialType === "cover_letter" && typeof output.letter === "string") {
    return <pre className="letter-output">{output.letter}</pre>;
  }

  if (material.materialType === "cv_tailoring") {
    return (
      <>
        {typeof output.positioningSummary === "string" ? <p>{output.positioningSummary}</p> : null}
        {Array.isArray(output.atsKeywords) ? (
          <div className="tag-row">
            {output.atsKeywords.map((keyword) => (
              <span className="tag" key={String(keyword)}>
                {String(keyword)}
              </span>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  if (material.materialType === "application_question" && typeof output.answer === "string") {
    return <p>{output.answer}</p>;
  }

  return <pre className="letter-output">{JSON.stringify(material.output, null, 2)}</pre>;
}

function toApplicationCreate(application: Application, status: ApplicationStatus): ApplicationCreate {
  return {
    company: application.company,
    role: application.role,
    status,
    applicationDate: application.applicationDate ?? null,
    deadline: application.deadline ?? null,
    jobUrl: application.jobUrl ?? null,
    jobDescription: application.jobDescription ?? "",
    location: application.location ?? null,
    salary: application.salary ?? null,
    fitScore: application.fitScore ?? null,
    notes: application.notes ?? null
  };
}

async function invalidateWorkspace(queryClient: ReturnType<typeof useQueryClient>, id: string | undefined) {
  await queryClient.invalidateQueries({ queryKey: ["application-workspace", id] });
  await queryClient.invalidateQueries({ queryKey: ["networking-contacts"] });
  await queryClient.invalidateQueries({ queryKey: ["networking-actions"] });
}
