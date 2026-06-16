import type { InterviewNote, InterviewNoteCreate } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, StickyNote } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { useApplications, useInterviewNotes } from "../lib/queries";

const emptyNote: InterviewNoteCreate = {
  company: "",
  role: "",
  noteType: "Company Note",
  content: "",
  tags: [],
  sourceApplicationId: null
};

export function InterviewKnowledgeBasePage() {
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading, error } = useInterviewNotes();
  const { data: applications = [] } = useApplications();
  const [draft, setDraft] = useState<InterviewNoteCreate>(emptyNote);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const createMutation = useMutation({
    mutationFn: (note: InterviewNoteCreate) =>
      apiFetch<InterviewNote>("/api/interview-notes", {
        method: "POST",
        body: JSON.stringify(note)
      }),
    onSuccess: async (_note, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["interview-notes"] });
      if (variables.sourceApplicationId) {
        await queryClient.invalidateQueries({ queryKey: ["application-workspace", variables.sourceApplicationId] });
      }
    }
  });

  const filteredNotes = useMemo(() => {
    const term = query.toLowerCase();

    return notes.filter((note) =>
      [note.company, note.role, note.noteType, note.content, note.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [notes, query]);

  function handleApplicationChange(applicationId: string) {
    const application = applications.find((item) => item.id === applicationId);

    setDraft({
      ...draft,
      sourceApplicationId: applicationId || null,
      company: application?.company ?? draft.company,
      role: application?.role ?? draft.role
    });
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      await createMutation.mutateAsync(draft);
      setDraft(emptyNote);
      setStatus("Note saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save note.");
    }
  }

  return (
    <div className="page-grid">
      <PageHeader eyebrow="Interview preparation" title="Company knowledge base" />

      {error ? <p className="error-text">{error instanceof Error ? error.message : "Unable to load notes."}</p> : null}

      <section className="content-grid tracker-grid">
        <form className="panel form-panel" onSubmit={handleCreate}>
          <h3>Add note</h3>
          <label>
            Link to application
            <select value={draft.sourceApplicationId ?? ""} onChange={(event) => handleApplicationChange(event.target.value)}>
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
            <input
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })}
              required
            />
          </label>
          <label>
            Role
            <input value={draft.role ?? ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} />
          </label>
          <label>
            Type
            <select
              value={draft.noteType}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  noteType: event.target.value as InterviewNoteCreate["noteType"]
                })
              }
            >
              <option>Company Note</option>
              <option>Previous Question</option>
              <option>Feedback</option>
              <option>Material</option>
            </select>
          </label>
          <label>
            Content
            <textarea
              className="tall-textarea"
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
              required
            />
          </label>
          <label>
            Tags
            <input
              value={draft.tags.join(", ")}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            <StickyNote size={16} />
            {createMutation.isPending ? "Saving..." : "Save note"}
          </button>
          {status ? <p className="inline-status">{status}</p> : null}
        </form>

        <article className="panel">
          <div className="search-bar">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, role, question or tag"
            />
          </div>
          {isLoading ? (
            <p className="inline-status">Loading notes...</p>
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              title={notes.length === 0 ? "No interview notes yet" : "No matching notes"}
              body="Save real company notes, previous questions, materials, or feedback here."
            />
          ) : (
            <div className="notes-list">
              {filteredNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div>
                    <span className="mini-label">{note.noteType}</span>
                    <h3>{note.company}</h3>
                    <p>{note.role}</p>
                  </div>
                  <p>{note.content}</p>
                  <div className="tag-row">
                    {note.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
