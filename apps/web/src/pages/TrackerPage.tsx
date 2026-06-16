import type { Application, ApplicationCreate, ApplicationStatus } from "@careeros/shared";
import { Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { apiFetch } from "../lib/api";
import { applicationStatuses } from "../lib/constants";
import { sampleApplications } from "../lib/mock";

const emptyApplication: ApplicationCreate = {
  company: "",
  role: "",
  status: "Saved",
  applicationDate: null,
  deadline: null,
  jobUrl: "",
  location: "",
  salary: "",
  fitScore: null,
  notes: ""
};

export function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [draft, setDraft] = useState<ApplicationCreate>(emptyApplication);
  const [status, setStatus] = useState("");

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
      const created = await apiFetch<Application>("/api/applications", {
        method: "POST",
        body: JSON.stringify(draft)
      });
      setApplications([created, ...applications]);
      setDraft(emptyApplication);
      setStatus("Application added.");
    } catch (error) {
      const localApplication: Application = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setApplications([localApplication, ...applications]);
      setDraft(emptyApplication);
      setStatus(error instanceof Error ? error.message : "Saved locally.");
    }
  }

  return (
    <div className="page-grid">
      <PageHeader eyebrow="Application workflow" title="Tracker" />

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
          <label>
            Fit score
            <input
              type="number"
              min="0"
              max="100"
              value={draft.fitScore ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, fitScore: event.target.value ? Number(event.target.value) : null })
              }
            />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={16} />
            Add application
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
                    <td>{application.company}</td>
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
        </article>
      </section>
    </div>
  );
}
