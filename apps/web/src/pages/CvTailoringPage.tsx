import type { CvTailoringResponse } from "@careeros/shared";
import { FilePenLine } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { sampleCvTailoring, sampleProfile } from "../lib/mock";

export function CvTailoringPage() {
  const [masterCv, setMasterCv] = useState(sampleProfile.masterCv ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CvTailoringResponse | null>(sampleCvTailoring);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<CvTailoringResponse>("/api/ai/cv-tailor", {
        method: "POST",
        body: JSON.stringify({
          masterCv,
          jobDescription,
          careerProfile: sampleProfile
        })
      });
      setResult(data);
    } catch (err) {
      setResult(sampleCvTailoring);
      setError(err instanceof Error ? err.message : "Unable to tailor CV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="Evidence-based tailoring"
        title="CV tailoring assistant"
        actions={
          <button className="primary-button" type="submit" disabled={loading}>
            <FilePenLine size={16} />
            {loading ? "Tailoring..." : "Generate suggestions"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Inputs</h3>
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
            <span className="eyebrow">Positioning</span>
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
        ) : null}
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
