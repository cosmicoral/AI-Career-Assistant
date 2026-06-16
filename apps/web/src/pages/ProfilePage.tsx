import type { CareerProfile } from "@careeros/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../lib/api";
import { useProfile } from "../lib/queries";

const emptyProfile: CareerProfile = {
  headline: "",
  visaStatus: "",
  targetIndustries: [],
  targetLocations: [],
  preferredRoles: [],
  skills: [],
  achievements: [],
  education: [],
  experience: [],
  projects: [],
  masterCv: ""
};

function splitList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: savedProfile, isLoading, error } = useProfile();
  const [profile, setProfile] = useState<CareerProfile>(emptyProfile);
  const [status, setStatus] = useState("");
  const skillsValue = useMemo(() => profile.skills.join("\n"), [profile.skills]);
  const achievementsValue = useMemo(() => profile.achievements.join("\n"), [profile.achievements]);

  const saveMutation = useMutation({
    mutationFn: (nextProfile: CareerProfile) =>
      apiFetch<CareerProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(nextProfile)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  useEffect(() => {
    setProfile(savedProfile ?? emptyProfile);
  }, [savedProfile]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving...");

    try {
      await saveMutation.mutateAsync(profile);
      setStatus("Profile saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to save profile.");
    }
  }

  return (
    <form className="page-grid" onSubmit={handleSave}>
      <PageHeader
        eyebrow="Career knowledge base"
        title="Permanent career profile"
        actions={
          <button className="primary-button" type="submit" disabled={saveMutation.isPending}>
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        }
      />

      {isLoading ? <p className="inline-status">Loading profile...</p> : null}
      {error ? <p className="error-text">{error instanceof Error ? error.message : "Unable to load profile."}</p> : null}
      {!isLoading && !savedProfile ? (
        <EmptyState
          title="No career profile saved yet"
          body="Add your real profile evidence here. AI workflows will use this instead of dummy data."
        />
      ) : null}

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
            Target locations
            <textarea
              value={profile.targetLocations.join("\n")}
              onChange={(event) => setProfile({ ...profile, targetLocations: splitList(event.target.value) })}
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
        {profile.experience.length === 0 && profile.projects.length === 0 ? (
          <EmptyState
            title="No structured experience yet"
            body="This MVP stores experience/projects in the profile schema, but the current editor only exposes the core text evidence fields."
          />
        ) : (
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
        )}
      </section>
      {status ? <p className="inline-status">{status}</p> : null}
    </form>
  );
}
