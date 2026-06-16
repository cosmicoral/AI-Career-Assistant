import type { CoverLetterResponse } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { FormEvent, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { useApplications, useProfile } from "../lib/queries";

export function CoverLetterPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: applications = [] } = useApplications();
  const [applicationId, setApplicationId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CoverLetterResponse | null>(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<CoverLetterResponse>("/api/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          company,
          role,
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

  function handleApplicationChange(nextId: string) {
    setApplicationId(nextId);
    const application = applications.find((item) => item.id === nextId);

    if (application) {
      setCompany(application.company);
      setRole(application.role);
      setJobDescription(application.jobDescription ?? "");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!profile) {
      setError("Save your career profile before generating a cover letter.");
      return;
    }

    try {
      await mutation.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate cover letter.");
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="UK graduate applications"
        title="Cover letter generator"
        actions={
          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            <FileText size={16} />
            {mutation.isPending ? "Writing..." : "Generate letter"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Role context</h3>
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
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} required />
          </label>
          <label>
            Role
            <input value={role} onChange={(event) => setRole(event.target.value)} required />
          </label>
          <label>
            Job description
            <textarea
              className="analysis-input"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <span className="eyebrow">
              Draft <MockBadge show={result.isMock} />
            </span>
            <h2>{role}</h2>
            <pre className="letter-output">{result.letter}</pre>
          </article>
        ) : (
          <article className="panel">
            <EmptyState title="No cover letter yet" body="Choose a saved application or enter role details." />
          </article>
        )}
      </section>

      {result ? (
        <section className="content-grid two-column">
          <article className="panel">
            <h3>Evidence used</h3>
            <div className="stack-list">
              {result.evidenceUsed.map((item) => (
                <div className="list-item compact" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>
          <article className="panel">
            <h3>Risks</h3>
            <div className="stack-list">
              {result.risks.map((item) => (
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
