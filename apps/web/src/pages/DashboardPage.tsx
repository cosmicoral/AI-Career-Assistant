import { CalendarClock, FileCheck2, Target, Trophy } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { ScoreRing } from "../components/ScoreRing";
import { StatusBadge } from "../components/StatusBadge";
import { applicationStatuses } from "../lib/constants";
import { sampleApplications, sampleJobFit } from "../lib/mock";

export function DashboardPage() {
  const submitted = sampleApplications.filter((application) =>
    ["Applied", "Interview", "Assessment Centre", "Offer", "Rejected"].includes(application.status)
  ).length;
  const interviews = sampleApplications.filter((application) =>
    ["Interview", "Assessment Centre", "Offer"].includes(application.status)
  ).length;
  const offers = sampleApplications.filter((application) => application.status === "Offer").length;
  const offerRate = submitted === 0 ? 0 : Math.round((offers / submitted) * 100);

  return (
    <div className="page-grid">
      <section className="metrics-grid">
        <MetricCard label="Applications submitted" value={submitted} detail="Active graduate pipeline" icon={FileCheck2} />
        <MetricCard label="Interviews" value={interviews} detail="Phone, video and live rounds" icon={CalendarClock} />
        <MetricCard label="Offer rate" value={`${offerRate}%`} detail="Updates as outcomes arrive" icon={Trophy} />
        <MetricCard label="Average fit score" value="77" detail="Across saved target roles" icon={Target} />
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Pipeline</span>
              <h2>Application workflow</h2>
            </div>
          </div>
          <div className="pipeline-list">
            {applicationStatuses.map((status) => {
              const count = sampleApplications.filter((application) => application.status === status).length;
              return (
                <div className="pipeline-row" key={status}>
                  <StatusBadge status={status} />
                  <div className="pipeline-track">
                    <span style={{ width: `${Math.max(count, 1) * 22}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Latest analysis</span>
              <h2>Deloitte Graduate Consultant</h2>
            </div>
            <ScoreRing score={sampleJobFit.fitScore} />
          </div>
          <p className="muted">{sampleJobFit.rationale}</p>
          <div className="tag-row">
            {sampleJobFit.matchingSkills.slice(0, 4).map((skill) => (
              <span className="tag" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Deadlines</span>
            <h2>Upcoming applications</h2>
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
              {sampleApplications.map((application) => (
                <tr key={application.id}>
                  <td>{application.company}</td>
                  <td>{application.role}</td>
                  <td>
                    <StatusBadge status={application.status} />
                  </td>
                  <td>{application.deadline}</td>
                  <td>{application.fitScore ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
