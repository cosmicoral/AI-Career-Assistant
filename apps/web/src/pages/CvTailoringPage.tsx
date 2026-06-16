import type { CvTailoringResponse } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePenLine } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { useApplications, useProfile } from "../lib/queries";

export function CvTailoringPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: applications = [] } = useApplications();
  const [applicationId, setApplicationId] = useState("");
  const [masterCv, setMasterCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CvTailoringResponse | null>(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<CvTailoringResponse>("/api/ai/cv-tailor", {
        method: "POST",
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          masterCv,
          jobDescription,
          careerProfile: profile
        })
      }),
    onSuccess: async (data) => {
      setResult(data);
      if (applicationId) {
        await queryClient.invalidateQueries({ queryKey: ["application-workspace", applicationId] });
      }
    }
  });

  useEffect(() => {
    if (profile?.masterCv) {
      setMasterCv(profile.masterCv);
    }
  }, [profile]);

  function handleApplicationChange(nextId: string) {
    setApplicationId(nextId);
    const application = applications.find((item) => item.id === nextId);

    if (application?.jobDescription) {
      setJobDescription(application.jobDescription);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!profile) {
      setError("Save your career profile before generating CV tailoring.");
      return;
    }

    try {
      await mutation.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to tailor CV.");
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="Evidence-based tailoring"
        title="CV tailoring assistant"
        actions={
          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            <FilePenLine size={16} />
            {mutation.isPending ? "Tailoring..." : "Generate suggestions"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Inputs</h3>
          <label>
            Saved application
            <select value={applicationId} onChange={(event) => handleApplicationChange(event.target.value)}>
              <option value="">Not linked</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company} - {application.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Master CV
            <textarea
              className="tall-textarea"
              value={masterCv}
              onChange={(event) => setMasterCv(event.target.value)}
            />
          </label>
          <label>
            Job description
            <textarea
              className="tall-textarea"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the role description..."
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <span className="eyebrow">
              Positioning <MockBadge show={result.isMock} />
            </span>
            <h2>Role-specific angle</h2>
            <p className="muted">{result.positioningSummary}</p>
            <h3>ATS keywords</h3>
            <div className="tag-row">
              {result.atsKeywords.map((keyword) => (
                <span className="tag" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>
            <h3>Gaps to address</h3>
            <div className="stack-list">
              {result.gapsToAddress.map((gap) => (
                <div className="list-item compact" key={gap}>
                  {gap}
                </div>
              ))}
            </div>
          </article>
        ) : (
          <article className="panel">
            <EmptyState title="No CV tailoring yet" body="Choose a saved application or paste a job description." />
          </article>
        )}
      </section>

      {result ? (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Tailored evidence</span>
              <h2>Bullet recommendations</h2>
            </div>
          </div>
          <div className="stack-list">
            {result.bulletSuggestions.map((bullet) => (
              <article className="list-item" key={bullet.tailoredBullet}>
                <span className="mini-label">{bullet.section}</span>
                <strong>{bullet.tailoredBullet}</strong>
                <p>{bullet.whyItHelps}</p>
                <small>Evidence: {bullet.currentEvidence}</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </form>
  );
}
