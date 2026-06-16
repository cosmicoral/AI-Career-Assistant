import type { JobFitResponse } from "@careeros/shared";
import { Wand2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { ScoreRing } from "../components/ScoreRing";
import { apiFetch } from "../lib/api";
import { sampleJobFit, sampleProfile } from "../lib/mock";

const starterJobDescription =
  "Paste a graduate scheme job description here, including responsibilities, requirements, location, visa or eligibility notes, and assessment process details.";

export function JobFitPage() {
  const [jobDescription, setJobDescription] = useState(starterJobDescription);
  const [result, setResult] = useState<JobFitResponse | null>(sampleJobFit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<JobFitResponse>("/api/ai/job-fit", {
        method: "POST",
        body: JSON.stringify({
          jobDescription,
          careerProfile: sampleProfile
        })
      });
      setResult(data);
    } catch (err) {
      setResult(sampleJobFit);
      setError(err instanceof Error ? err.message : "Unable to analyze fit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page-grid" onSubmit={handleAnalyze}>
      <PageHeader
        eyebrow="Priority workflow"
        title="Job fit analyzer"
        actions={
          <button className="primary-button" type="submit" disabled={loading}>
            <Wand2 size={16} />
            {loading ? "Analyzing..." : "Analyze fit"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Job description</h3>
          <textarea
            className="analysis-input"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">{result.recommendation}</span>
                <h2>Fit result</h2>
              </div>
              <ScoreRing score={result.fitScore} />
            </div>
            <p className="muted">{result.rationale}</p>
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
        ) : null}
      </section>

      {result ? (
        <section className="content-grid two-column">
          <article className="panel">
            <h3>Transferable evidence</h3>
            <div className="stack-list">
              {result.transferableExperiences.map((item) => (
                <div className="list-item" key={item.evidence}>
                  <strong>{item.evidence}</strong>
                  <p>{item.relevance}</p>
                </div>
              ))}
            </div>
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
