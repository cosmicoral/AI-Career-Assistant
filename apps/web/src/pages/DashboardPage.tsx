import { CalendarClock, ClipboardCheck, FileCheck2, ListChecks, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { ScoreRing } from "../components/ScoreRing";
import { StatusBadge } from "../components/StatusBadge";
import { applicationStatuses } from "../lib/constants";
import { useApplications, useAssessmentCentreCases, useAssessmentCentreSessions, useOnlineTestStudyPlans } from "../lib/queries";

const submittedStatuses = ["Applied", "Interview", "Assessment Centre", "Offer", "Rejected"];
const interviewStatuses = ["Interview", "Assessment Centre", "Offer"];

export function DashboardPage() {
  const { data: applications = [], isLoading, error } = useApplications();
  const { data: assessmentCentreCases = [] } = useAssessmentCentreCases();
  const { data: assessmentCentreSessions = [] } = useAssessmentCentreSessions();
  const { data: onlineTestStudyPlans = [] } = useOnlineTestStudyPlans();
  const submitted = applications.filter((application) => submittedStatuses.includes(application.status)).length;
  const interviews = applications.filter((application) => interviewStatuses.includes(application.status)).length;
  const offers = applications.filter((application) => application.status === "Offer").length;
  const offerRate = submitted === 0 ? 0 : Math.round((offers / submitted) * 100);
  const scoredApplications = applications.filter((application) => typeof application.fitScore === "number");
  const averageFitScore =
    scoredApplications.length === 0
      ? "-"
      : Math.round(
          scoredApplications.reduce((total, application) => total + (application.fitScore ?? 0), 0) /
            scoredApplications.length
        );
  const upcomingDeadlines = applications
    .filter((application) => application.deadline && !["Offer", "Rejected"].includes(application.status))
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 6);
  const latestScoredApplication = [...scoredApplications].sort((a, b) =>
    (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? "")
  )[0];
  const practisedCaseIds = new Set(assessmentCentreSessions.map((session) => session.caseId));
  const unpractisedCases = assessmentCentreCases.filter((acCase) => !practisedCaseIds.has(acCase.id)).slice(0, 4);
  const upcomingOnlinePlans = onlineTestStudyPlans
    .filter((plan) => plan.targetDate)
    .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""))
    .slice(0, 4);

  if (isLoading) {
    return <p className="inline-status">Loading applications...</p>;
  }

  return (
    <div className="page-grid">
      {error ? <p className="error-text">{error instanceof Error ? error.message : "Unable to load dashboard."}</p> : null}

      <section className="metrics-grid">
        <MetricCard label="Applications submitted" value={submitted} detail="Applied or later statuses" icon={FileCheck2} />
        <MetricCard label="Interviews" value={interviews} detail="Interview, AC and offer stages" icon={CalendarClock} />
        <MetricCard label="Offer rate" value={`${offerRate}%`} detail="Offers divided by submitted" icon={Trophy} />
        <MetricCard label="Average fit score" value={averageFitScore} detail="Across saved analyses" icon={Target} />
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Pipeline</span>
              <h2>Application workflow</h2>
            </div>
          </div>
          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              body="Paste a real job description and save your first application to start the workflow."
              action={
                <Link className="secondary-button" to="/job-fit">
                  Add first application
                </Link>
              }
            />
          ) : (
            <div className="pipeline-list">
              {applicationStatuses.map((status) => {
                const count = applications.filter((application) => application.status === status).length;
                return (
                  <div className="pipeline-row" key={status}>
                    <StatusBadge status={status} />
                    <div className="pipeline-track">
                      <span style={{ width: `${Math.min(Math.max(count, 0) * 20, 100)}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="panel">
          {latestScoredApplication ? (
            <>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Latest saved fit</span>
                  <h2>{latestScoredApplication.company}</h2>
                  <p className="muted">{latestScoredApplication.role}</p>
                </div>
                <ScoreRing score={latestScoredApplication.fitScore ?? 0} />
              </div>
              <div className="action-row">
                <Link className="secondary-button" to={`/applications/${latestScoredApplication.id}`}>
                  Open workspace
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              title="No saved fit analysis yet"
              body="Run a job fit analysis from a real job description to populate this panel."
              action={
                <Link className="secondary-button" to="/job-fit">
                  Analyze a job
                </Link>
              }
            />
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Deadlines</span>
            <h2>Upcoming applications</h2>
          </div>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <EmptyState title="No upcoming deadlines" body="Add application deadlines to make this dashboard actionable." />
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
                {upcomingDeadlines.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link to={`/applications/${application.id}`}>{application.company}</Link>
                    </td>
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
        )}
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Assessment centre</span>
              <h2>Practice queue</h2>
            </div>
            <ClipboardCheck size={20} />
          </div>
          {unpractisedCases.length === 0 ? (
            <EmptyState title="No AC practice tasks" body="Create assessment-centre cases to build a practice queue." />
          ) : (
            <div className="stack-list">
              {unpractisedCases.map((acCase) => (
                <article className="list-item" key={acCase.id}>
                  <span className="mini-label">{acCase.caseType.replace(/_/g, " ")}</span>
                  <strong>
                    {acCase.company} - {acCase.role}
                  </strong>
                  <p>{acCase.industry}</p>
                  <div className="action-row">
                    <Link className="secondary-button" to={`/assessment-centre?applicationId=${acCase.applicationId ?? ""}`}>
                      Practise
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Online tests</span>
              <h2>Upcoming study plans</h2>
            </div>
            <ListChecks size={20} />
          </div>
          {upcomingOnlinePlans.length === 0 ? (
            <EmptyState title="No online-test deadlines" body="Generate a study plan with a target date to track test prep." />
          ) : (
            <div className="stack-list">
              {upcomingOnlinePlans.map((plan) => {
                const application = plan.applicationId
                  ? applications.find((item) => item.id === plan.applicationId)
                  : undefined;

                return (
                  <article className="list-item" key={plan.id}>
                    <span className="mini-label">{plan.provider}</span>
                    <strong>{plan.testType}</strong>
                    <p>{application ? `${application.company} - ${application.role}` : "General prep"}</p>
                    <div className="tag-row">
                      <span className="tag">Target {plan.targetDate}</span>
                      {plan.priorityTopics.slice(0, 3).map((topic) => (
                        <span className="tag warning" key={topic}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
