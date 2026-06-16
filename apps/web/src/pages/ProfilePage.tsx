import { Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { CareerProfile } from "@careeros/shared";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { sampleProfile } from "../lib/mock";

function splitList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfilePage() {
  const [profile, setProfile] = useState<CareerProfile>(sampleProfile);
  const [status, setStatus] = useState("");
  const skillsValue = useMemo(() => profile.skills.join("\n"), [profile.skills]);
  const achievementsValue = useMemo(() => profile.achievements.join("\n"), [profile.achievements]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      await apiFetch<CareerProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save profile.");
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSave}>
      <PageHeader
        eyebrow="Career knowledge base"
        title="Permanent career profile"
        actions={
          <button className="primary-button" type="submit">
            <Save size={16} />
            Save profile
          </button>
        }
      />

      <section className="content-grid two-column">
        <article className="panel form-panel">
          <h3>Targeting</h3>
          <label>
            Headline
            <input
              value={profile.headline ?? ""}
              onChange={(event) => setProfile({ ...profile, headline: event.target.value })}
            />
          </label>
          <label>
            Visa status
            <input
              value={profile.visaStatus ?? ""}
              onChange={(event) => setProfile({ ...profile, visaStatus: event.target.value })}
            />
          </label>
          <label>
            Target industries
            <textarea
              value={profile.targetIndustries.join("\n")}
              onChange={(event) => setProfile({ ...profile, targetIndustries: splitList(event.target.value) })}
            />
          </label>
          <label>
            Preferred roles
            <textarea
              value={profile.preferredRoles.join("\n")}
              onChange={(event) => setProfile({ ...profile, preferredRoles: splitList(event.target.value) })}
            />
          </label>
        </article>

        <article className="panel form-panel">
          <h3>Evidence bank</h3>
          <label>
            Skills
            <textarea
              value={skillsValue}
              onChange={(event) => setProfile({ ...profile, skills: splitList(event.target.value) })}
            />
          </label>
          <label>
            Achievements
            <textarea
              value={achievementsValue}
              onChange={(event) => setProfile({ ...profile, achievements: splitList(event.target.value) })}
            />
          </label>
          <label>
            Master CV
            <textarea
              className="tall-textarea"
              value={profile.masterCv ?? ""}
              onChange={(event) => setProfile({ ...profile, masterCv: event.target.value })}
            />
          </label>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Structured experience</span>
            <h2>Profile evidence used by AI</h2>
          </div>
        </div>
        <div className="evidence-grid">
          {profile.experience.map((item) => (
            <article className="evidence-card" key={`${item.organisation}-${item.title}`}>
              <span>Experience</span>
              <strong>{item.title}</strong>
              <p>{item.organisation}</p>
              <small>{item.achievements.join(" | ")}</small>
            </article>
          ))}
          {profile.projects.map((item) => (
            <article className="evidence-card" key={item.name}>
              <span>Project</span>
              <strong>{item.name}</strong>
              <p>{item.summary}</p>
              <small>{item.outcomes.join(" | ")}</small>
            </article>
          ))}
        </div>
      </section>
      {status ? <p className="inline-status">{status}</p> : null}
    </form>
  );
}
