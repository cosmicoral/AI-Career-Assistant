import type { Application, ApplicationCreate, ApplicationStatus } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { apiFetch } from "../lib/api";
import { applicationStatuses } from "../lib/constants";
import { useApplications } from "../lib/queries";

const emptyApplication: ApplicationCreate = {
  company: "",
  role: "",
  status: "Saved",
  applicationDate: null,
  deadline: null,
  jobUrl: "",
  jobDescription: "",
  location: "",
  salary: "",
  fitScore: null,
  notes: ""
};

export function TrackerPage() {
  const queryClient = useQueryClient();
  const { data: applications = [], isLoading, error } = useApplications();
  const [draft, setDraft] = useState<ApplicationCreate>(emptyApplication);
  const [status, setStatus] = useState("");

  const createMutation = useMutation({
    mutationFn: (application: ApplicationCreate) =>
      apiFetch<Application>("/api/applications", {
        method: "POST",
        body: JSON.stringify(application)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    }
  });

  const metrics = useMemo(
    () => ({
      applied: applications.filter((application) =>
        ["Applied", "Interview", "Assessment Centre", "Offer", "Rejected"].includes(application.status)
      ).length,
      interviews: applications.filter((application) =>
        ["Interview", "Assessment Centre", "Offer"].includes(application.status)
      ).length,
      offers: applications.filter((application) => application.status === "Offer").length
    }),
    [applications]
  );

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      await createMutation.mutateAsync(draft);
      setDraft(emptyApplication);
      setStatus("Application added.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save application.");
    }
  }

  return (
    <div className="page-grid">
      <PageHeader eyebrow="Application workflow" title="Tracker" />

      {error ? <p className="error-text">{error instanceof Error ? error.message : "Unable to load applications."}</p> : null}

      <section className="metrics-strip">
        <div>
          <span>Submitted</span>
          <strong>{metrics.applied}</strong>
        </div>
        <div>
          <span>Interviews</span>
          <strong>{metrics.interviews}</strong>
        </div>
        <div>
          <span>Offers</span>
          <strong>{metrics.offers}</strong>
        </div>
      </section>

      <section className="content-grid tracker-grid">
        <form className="panel form-panel" onSubmit={handleCreate}>
          <h3>Add application</h3>
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
            <input value={draft.location ?? ""} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label>
            Job URL
            <input value={draft.jobUrl ?? ""} onChange={(event) => setDraft({ ...draft, jobUrl: event.target.value })} />
          </label>
          <label>
            Status
            <select
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as ApplicationStatus })}
            >
              {applicationStatuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={draft.deadline ?? ""}
              onChange={(event) => setDraft({ ...draft, deadline: event.target.value || null })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            <Plus size={16} />
            {createMutation.isPending ? "Adding..." : "Add application"}
          </button>
          {status ? <p className="inline-status">{status}</p> : null}
        </form>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Live pipeline</span>
              <h2>Applications</h2>
            </div>
          </div>
          {isLoading ? (
            <p className="inline-status">Loading applications...</p>
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications saved"
              body="Add a real company and role here, or use Job Fit to save one with analysis."
              action={
                <Link className="secondary-button" to="/job-fit">
                  Use job fit workflow
                </Link>
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <Link to={`/applications/${application.id}`}>{application.company}</Link>
                      </td>
                      <td>{application.role}</td>
                      <td>
                        <StatusBadge status={application.status} />
                      </td>
                      <td>{application.deadline ?? "-"}</td>
                      <td>{application.fitScore ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
