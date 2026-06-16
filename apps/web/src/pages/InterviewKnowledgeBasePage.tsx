import type { InterviewNote, InterviewNoteCreate } from "@careeros/shared";
import { Search, StickyNote } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { sampleInterviewNotes } from "../lib/mock";

const emptyNote: InterviewNoteCreate = {
  company: "",
  role: "",
  noteType: "Company Note",
  content: "",
  tags: [],
  sourceApplicationId: null
};

export function InterviewKnowledgeBasePage() {
  const [notes, setNotes] = useState<InterviewNote[]>(sampleInterviewNotes);
  const [draft, setDraft] = useState<InterviewNoteCreate>(emptyNote);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filteredNotes = useMemo(() => {
    const term = query.toLowerCase();

    return notes.filter((note) =>
      [note.company, note.role, note.noteType, note.content, note.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [notes, query]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      const created = await apiFetch<InterviewNote>("/api/interview-notes", {
        method: "POST",
        body: JSON.stringify(draft)
      });
      setNotes([created, ...notes]);
      setDraft(emptyNote);
      setStatus("Note saved.");
    } catch (error) {
      const localNote: InterviewNote = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([localNote, ...notes]);
      setDraft(emptyNote);
      setStatus(error instanceof Error ? error.message : "Saved locally.");
    }
  }

  return (
    <div className="page-grid">
      <PageHeader eyebrow="Interview preparation" title="Company knowledge base" />

      <section className="content-grid tracker-grid">
        <form className="panel form-panel" onSubmit={handleCreate}>
          <h3>Add note</h3>
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
          <button className="primary-button" type="submit">
            <StickyNote size={16} />
            Save note
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
        </article>
      </section>
    </div>
  );
}
