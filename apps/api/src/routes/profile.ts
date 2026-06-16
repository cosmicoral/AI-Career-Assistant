import { CareerProfileSchema } from "@careeros/shared";
import { Router } from "express";
import { getSupabaseAdmin } from "../config/supabase";
import type { AuthedRequest } from "../types";

export const profileRouter = Router();

function toProfileRow(req: AuthedRequest) {
  const profile = CareerProfileSchema.parse(req.body);

  return {
    user_id: req.user.id,
    headline: profile.headline ?? null,
    visa_status: profile.visaStatus ?? null,
    target_industries: profile.targetIndustries,
    target_locations: profile.targetLocations,
    preferred_roles: profile.preferredRoles,
    skills: profile.skills,
    achievements: profile.achievements,
    education: profile.education,
    experience: profile.experience,
    projects: profile.projects,
    master_cv: profile.masterCv ?? null,
    updated_at: new Date().toISOString()
  };
}

function fromProfileRow(row: Record<string, unknown>) {
  return CareerProfileSchema.parse({
    userId: row.user_id,
    headline: row.headline ?? undefined,
    visaStatus: row.visa_status ?? undefined,
    targetIndustries: row.target_industries ?? [],
    targetLocations: row.target_locations ?? [],
    preferredRoles: row.preferred_roles ?? [],
    skills: row.skills ?? [],
    achievements: row.achievements ?? [],
    education: row.education ?? [],
    experience: row.experience ?? [],
    projects: row.projects ?? [],
    masterCv: row.master_cv ?? undefined,
    updatedAt: row.updated_at ?? undefined
  });
}

profileRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { data, error } = await getSupabaseAdmin()
      .from("career_profiles")
      .select("*")
      .eq("user_id", authedReq.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data ? fromProfileRow(data) : null);
  } catch (error) {
    next(error);
  }
});

profileRouter.put("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { data, error } = await getSupabaseAdmin()
      .from("career_profiles")
      .upsert(toProfileRow(authedReq), { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    res.json(fromProfileRow(data));
  } catch (error) {
    next(error);
  }
});
