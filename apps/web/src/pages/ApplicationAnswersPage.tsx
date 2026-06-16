import type { ApplicationQuestionResponse } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText } from "lucide-react";
import { FormEvent, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MockBadge } from "../components/MockBadge";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { useApplications, useProfile } from "../lib/queries";

export function ApplicationAnswersPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: applications = [] } = useApplications();
  const [applicationId, setApplicationId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [question, setQuestion] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ApplicationQuestionResponse | null>(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<ApplicationQuestionResponse>("/api/ai/application-answer", {
        method: "POST",
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          company,
          role,
          question,
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
      setError("Save your career profile before generating application answers.");
      return;
    }

    try {
      await mutation.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate answer.");
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="STAR answer builder"
        title="Application question assistant"
        actions={
          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            <MessageSquareText size={16} />
            {mutation.isPending ? "Drafting..." : "Generate answer"}
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Question context</h3>
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
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} required />
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
            <span className="eyebrow">
              Answer <MockBadge show={result.isMock} />
            </span>
            <h2>{question}</h2>
            <p className="answer-output">{result.answer}</p>
          </article>
        ) : (
          <article className="panel">
            <EmptyState title="No answer yet" body="Enter a real application question to generate a STAR answer." />
          </article>
        )}
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
