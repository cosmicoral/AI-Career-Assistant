import type { Application, ApplicationCreate, JobFitResponse } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Save, Wand2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { ScoreRing } from "../components/ScoreRing";
import { apiFetch } from "../lib/api";
import { useProfile } from "../lib/queries";

type JobDraft = {
  company: string;
  role: string;
  location: string;
  deadline: string;
  jobUrl: string;
  jobDescription: string;
};

const emptyJobDraft: JobDraft = {
  company: "",
  role: "",
  location: "",
  deadline: "",
  jobUrl: "",
  jobDescription: ""
};

export function JobFitPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [draft, setDraft] = useState<JobDraft>(emptyJobDraft);
  const [result, setResult] = useState<JobFitResponse | null>(null);
  const [savedApplication, setSavedApplication] = useState<Application | null>(null);
  const [status, setStatus] = useState("");

  const createApplicationMutation = useMutation({
    mutationFn: (application: ApplicationCreate) =>
      apiFetch<Application>("/api/applications", {
        method: "POST",
        body: JSON.stringify(application)
      })
  });

  const analyzeMutation = useMutation({
    mutationFn: (params: { applicationId?: string }) =>
      apiFetch<JobFitResponse>("/api/ai/job-fit", {
        method: "POST",
        body: JSON.stringify({
          applicationId: params.applicationId,
          jobDescription: draft.jobDescription,
          careerProfile: profile
        })
      })
  });

  const hasProfileEvidence = Boolean(
    profile &&
      ((profile.masterCv && profile.masterCv.trim().length > 0) ||
        profile.skills.length > 0 ||
        profile.achievements.length > 0)
  );

  async function handleAnalyzeAndSave(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setSavedApplication(null);

    if (!profile) {
      setStatus("Create and save your career profile before running job fit analysis.");
      return;
    }

    try {
      setStatus("Saving application...");
      const application = await createApplicationMutation.mutateAsync({
        company: draft.company,
        role: draft.role,
        status: "Saved",
        applicationDate: null,
        deadline: draft.deadline || null,
        jobUrl: draft.jobUrl || null,
        jobDescription: draft.jobDescription,
        location: draft.location || null,
        salary: "",
        fitScore: null,
        notes: ""
      });

      setSavedApplication(application);
      setStatus("Running fit analysis...");
      const analysis = await analyzeMutation.mutateAsync({ applicationId: application.id });
      setResult(analysis);
      setStatus("Application and fit analysis saved.");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["application-workspace", application.id] });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save and analyze this job.");
    }
  }

  async function handleSaveOnly() {
    setStatus("Saving application...");

    try {
      const application = await createApplicationMutation.mutateAsync({
        company: draft.company,
        role: draft.role,
        status: "Saved",
        applicationDate: null,
        deadline: draft.deadline || null,
        jobUrl: draft.jobUrl || null,
        jobDescription: draft.jobDescription,
        location: draft.location || null,
        salary: "",
        fitScore: null,
        notes: ""
      });
      setSavedApplication(application);
      setStatus("Application saved without fit analysis.");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save application.");
    }
  }

  const isBusy = createApplicationMutation.isPending || analyzeMutation.isPending;

  return (
    <form className="page-grid" onSubmit={handleAnalyzeAndSave}>
      <PageHeader
        eyebrow="Priority workflow"
        title="Save application and analyze fit"
        actions={
          <button className="primary-button" type="submit" disabled={isBusy || profileLoading || !hasProfileEvidence}>
            <Wand2 size={16} />
            {isBusy ? "Working..." : "Save and analyze"}
          </button>
        }
      />

      {!profileLoading && !hasProfileEvidence ? (
        <EmptyState
          title="Career profile needed"
          body="Save at least a master CV, skills, or achievements before running real fit analysis."
          action={
            <Link className="secondary-button" to="/profile">
              Open profile
            </Link>
          }
        />
      ) : null}

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Job details</h3>
          <label>
            Company
            <input
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })}
              required
            />
          </label>
          <label>
            Role
            <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} required />
          </label>
          <label>
            Location
            <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={draft.deadline}
              onChange={(event) => setDraft({ ...draft, deadline: event.target.value })}
            />
          </label>
          <label>
            Job URL
            <input value={draft.jobUrl} onChange={(event) => setDraft({ ...draft, jobUrl: event.target.value })} />
          </label>
          <label>
            Job description
            <textarea
              className="analysis-input"
              value={draft.jobDescription}
              onChange={(event) => setDraft({ ...draft, jobDescription: event.target.value })}
              placeholder="Paste the real job description here..."
              required
            />
          </label>
          <div className="action-row">
            <button className="secondary-button" type="button" onClick={handleSaveOnly} disabled={isBusy}>
              <Save size={16} />
              Save without analysis
            </button>
          </div>
          {status ? <p className={status.includes("Unable") || status.includes("before") ? "error-text" : "inline-status"}>{status}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  {result.recommendation} <MockBadge show={result.isMock} />
                </span>
                <h2>Saved fit result</h2>
              </div>
              <ScoreRing score={result.fitScore} />
            </div>
            <p className="muted">{result.rationale}</p>
            {savedApplication ? (
              <div className="action-row">
                <Link className="secondary-button" to={`/applications/${savedApplication.id}`}>
                  <BriefcaseBusiness size={16} />
                  Open workspace
                </Link>
                <Link className="secondary-button" to="/tracker">
                  Return to tracker
                </Link>
              </div>
            ) : null}
            <div className="analysis-columns">
              <div>
                <h3>Matching skills</h3>
                <div className="tag-row">
                  {result.matchingSkills.map((skill) => (
                    <span className="tag positive" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3>Missing skills</h3>
                <div className="tag-row">
                  {result.missingSkills.map((skill) => (
                    <span className="tag warning" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article className="panel">
            <EmptyState
              title="No analysis yet"
              body="Enter a real job and run Save and analyze. The saved application will appear in Tracker."
            />
          </article>
        )}
      </section>

      {result ? (
        <section className="content-grid two-column">
          <article className="panel">
            <h3>Transferable evidence</h3>
            {result.transferableExperiences.length === 0 ? (
              <EmptyState title="No transferable evidence returned" body="Add more profile evidence and re-run analysis." />
            ) : (
              <div className="stack-list">
                {result.transferableExperiences.map((item) => (
                  <div className="list-item" key={item.evidence}>
                    <strong>{item.evidence}</strong>
                    <p>{item.relevance}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel">
            <h3>Risks and next actions</h3>
            <div className="stack-list">
              {[...result.redFlags, ...result.actionPlan].map((item) => (
                <div className="list-item compact" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </form>
  );
}
