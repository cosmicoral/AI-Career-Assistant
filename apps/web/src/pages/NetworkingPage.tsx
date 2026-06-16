import type { NetworkingActionStatus, RelationshipType } from "@careeros/shared";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { networkingActionStatuses, relationshipTypes } from "../lib/constants";
import { useApplications, useNetworkingActions, useNetworkingContacts } from "../lib/queries";
import { useMemo, useState } from "react";

export function NetworkingPage() {
  const [statusFilter, setStatusFilter] = useState<NetworkingActionStatus | "">("");
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipType | "">("");
  const { data: applications = [] } = useApplications();
  const { data: contacts = [], isLoading: contactsLoading, error: contactsError } = useNetworkingContacts({
    relationshipType: relationshipFilter || undefined
  });
  const { data: actions = [], isLoading: actionsLoading, error: actionsError } = useNetworkingActions({
    status: statusFilter || undefined
  });

  const contactsById = useMemo(() => new Map(contacts.map((contact) => [contact.id, contact])), [contacts]);
  const applicationsById = useMemo(
    () => new Map(applications.map((application) => [application.id, application])),
    [applications]
  );
  const today = new Date().toISOString().slice(0, 10);
  const overdueActions = actions.filter(
    (action) => action.dueDate && action.dueDate < today && !["completed", "replied"].includes(action.status)
  );
  const groups = useMemo(() => {
    const grouped = new Map<string, typeof contacts>();

    contacts.forEach((contact) => {
      const application = contact.applicationId ? applicationsById.get(contact.applicationId) : undefined;
      const key = application ? `${contact.company} - ${application.role}` : contact.company;
      grouped.set(key, [...(grouped.get(key) ?? []), contact]);
    });

    return Array.from(grouped.entries());
  }, [applicationsById, contacts]);

  return (
    <div className="page-grid">
      <PageHeader eyebrow="Job-specific networking" title="Networking" />

      {(contactsError || actionsError) ? (
        <p className="error-text">
          {contactsError instanceof Error
            ? contactsError.message
            : actionsError instanceof Error
              ? actionsError.message
              : "Unable to load networking data."}
        </p>
      ) : null}

      <section className="metrics-strip">
        <div>
          <span>Contacts</span>
          <strong>{contacts.length}</strong>
        </div>
        <div>
          <span>Planned outreach</span>
          <strong>{actions.filter((action) => action.status === "planned").length}</strong>
        </div>
        <div>
          <span>Overdue follow-ups</span>
          <strong>{overdueActions.length}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="content-grid two-column compact-form">
          <label>
            Filter by action status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as NetworkingActionStatus | "")}>
              <option value="">All statuses</option>
              {networkingActionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Filter by relationship
            <select
              value={relationshipFilter}
              onChange={(event) => setRelationshipFilter(event.target.value as RelationshipType | "")}
            >
              <option value="">All relationships</option>
              {relationshipTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Contacts</span>
              <h2>Grouped by company/application</h2>
            </div>
          </div>
          {contactsLoading ? (
            <p className="inline-status">Loading contacts...</p>
          ) : groups.length === 0 ? (
            <EmptyState
              title="No networking contacts yet"
              body="Open an application workspace and add contacts manually after finding them."
            />
          ) : (
            <div className="stack-list">
              {groups.map(([group, groupContacts]) => (
                <article className="list-item" key={group}>
                  <strong>{group}</strong>
                  <div className="stack-list">
                    {groupContacts.map((contact) => (
                      <div className="list-item compact" key={contact.id}>
                        <strong>{contact.name}</strong>
                        <p>
                          {contact.title} - {contact.relationshipType.replace("_", " ")}
                        </p>
                        {contact.applicationId ? (
                          <Link to={`/applications/${contact.applicationId}`}>Open application workspace</Link>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Outreach actions</span>
              <h2>Planned and follow-up tasks</h2>
            </div>
          </div>
          {actionsLoading ? (
            <p className="inline-status">Loading actions...</p>
          ) : actions.length === 0 ? (
            <EmptyState
              title="No outreach actions yet"
              body="Add follow-up reminders or mark contacts from an application workspace."
            />
          ) : (
            <div className="stack-list">
              {actions.map((action) => {
                const contact = contactsById.get(action.contactId);
                return (
                  <article className="list-item" key={action.id}>
                    <span className="mini-label">
                      {action.actionType.replace("_", " ")} - {action.status.replace("_", " ")}
                    </span>
                    <strong>{contact?.name ?? "Unknown contact"}</strong>
                    <p>{contact ? `${contact.title} at ${contact.company}` : "Contact details unavailable"}</p>
                    <div className="tag-row">
                      {action.dueDate ? <span className="tag">Due {action.dueDate}</span> : null}
                      {action.dueDate && action.dueDate < today ? <span className="tag warning">Overdue</span> : null}
                    </div>
                    {action.messageDraft ? <p>{action.messageDraft}</p> : null}
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
