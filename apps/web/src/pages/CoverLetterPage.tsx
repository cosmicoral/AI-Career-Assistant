import type { CoverLetterResponse } from "@careeros/shared";
import { FileText } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { sampleCoverLetter, sampleProfile } from "../lib/mock";

export function CoverLetterPage() {
  const [company, setCompany] = useState("Deloitte");
  const [role, setRole] = useState("Graduate Consultant");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CoverLetterResponse | null>(sampleCoverLetter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<CoverLetterResponse>("/api/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify({
          company,
          role,
          jobDescription,
          careerProfile: sampleProfile
        })
      });
      setResult(data);
    } catch (err) {
      setResult(sampleCoverLetter);
      setError(err instanceof Error ? err.message : "Unable to generate cover letter.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="UK graduate applications"
        title="Cover letter generator"
        actions={
          <button className="primary-button" type="submit" disabled={loading}>
            <FileText size={16} />
            {loading ? "Writing..." : "Generate letter"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Role context</h3>
          <label>
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
          <label>
            Role
            <input value={role} onChange={(event) => setRole(event.target.value)} />
          </label>
          <label>
            Job description
            <textarea
              className="analysis-input"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <span className="eyebrow">Draft</span>
            <h2>{role}</h2>
            <pre className="letter-output">{result.letter}</pre>
          </article>
        ) : null}
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
