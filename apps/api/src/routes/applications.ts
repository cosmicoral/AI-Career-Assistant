import { ApplicationCreateSchema, ApplicationSchema } from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../config/supabase";
import type { AuthedRequest } from "../types";

export const applicationsRouter = Router();

const IdParamSchema = z.object({
  id: z.string().uuid()
});

function fromApplicationRow(row: Record<string, unknown>) {
  return ApplicationSchema.parse({
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    applicationDate: row.application_date,
    deadline: row.deadline,
    jobUrl: row.job_url,
    location: row.location,
    salary: row.salary,
    fitScore: row.fit_score,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toApplicationRow(req: AuthedRequest) {
  const application = ApplicationCreateSchema.parse(req.body);

  return {
    user_id: req.user.id,
    company: application.company,
    role: application.role,
    status: application.status,
    application_date: application.applicationDate ?? null,
    deadline: application.deadline ?? null,
    job_url: application.jobUrl ?? null,
    location: application.location ?? null,
    salary: application.salary ?? null,
    fit_score: application.fitScore ?? null,
    notes: application.notes ?? null
  };
}

applicationsRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { data, error } = await getSupabaseAdmin()
      .from("applications")
      .select("*")
      .eq("user_id", authedReq.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json((data ?? []).map(fromApplicationRow));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.post("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { data, error } = await getSupabaseAdmin()
      .from("applications")
      .insert(toApplicationRow(authedReq))
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json(fromApplicationRow(data));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.patch("/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const updates = toApplicationRow(authedReq);

    const { data, error } = await getSupabaseAdmin()
      .from("applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", authedReq.user.id)
      .select("*")
      .single();

    if (error) throw error;
    res.json(fromApplicationRow(data));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.delete("/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);

    const { error } = await getSupabaseAdmin()
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", authedReq.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
