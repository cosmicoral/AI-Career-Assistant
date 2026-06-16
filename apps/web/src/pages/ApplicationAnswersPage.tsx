import type { ApplicationQuestionResponse } from "@careeros/shared";
import { MessageSquareText } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { sampleApplicationAnswer, sampleProfile } from "../lib/mock";

export function ApplicationAnswersPage() {
  const [company, setCompany] = useState("Deloitte");
  const [role, setRole] = useState("Graduate Consultant");
  const [question, setQuestion] = useState("Tell me about a time you solved a complex problem.");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ApplicationQuestionResponse | null>(sampleApplicationAnswer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<ApplicationQuestionResponse>("/api/ai/application-answer", {
        method: "POST",
        body: JSON.stringify({
          company,
          role,
          question,
          jobDescription,
          careerProfile: sampleProfile
        })
      });
      setResult(data);
    } catch (err) {
      setResult(sampleApplicationAnswer);
      setError(err instanceof Error ? err.message : "Unable to generate answer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="STAR answer builder"
        title="Application question assistant"
        actions={
          <button className="primary-button" type="submit" disabled={loading}>
            <MessageSquareText size={16} />
            {loading ? "Drafting..." : "Generate answer"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Question context</h3>
          <label>
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
          <label>
            Role
            <input value={role} onChange={(event) => setRole(event.target.value)} />
          </label>
          <label>
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <label>
            Job description
            <textarea
              className="tall-textarea"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        {result ? (
          <article className="panel">
            <span className="eyebrow">Answer</span>
            <h2>{question}</h2>
            <p className="answer-output">{result.answer}</p>
          </article>
        ) : null}
      </section>

      {result ? (
        <section className="content-grid two-column">
          <article className="panel">
            <h3>STAR breakdown</h3>
            <div className="star-grid">
              {Object.entries(result.starBreakdown).map(([key, value]) => (
                <div className="star-cell" key={key}>
                  <span>{key}</span>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h3>Follow-up prep</h3>
            <div className="stack-list">
              {[...result.evidenceUsed, ...result.followUpPrep].map((item) => (
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
