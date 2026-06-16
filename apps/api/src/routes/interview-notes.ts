import { InterviewNoteCreateSchema, InterviewNoteSchema } from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../config/supabase";
import type { AuthedRequest } from "../types";

export const interviewNotesRouter = Router();

const QuerySchema = z.object({
  company: z.string().optional()
});

function fromInterviewNoteRow(row: Record<string, unknown>) {
  return InterviewNoteSchema.parse({
    id: row.id,
    company: row.company,
    role: row.role,
    noteType: row.note_type,
    content: row.content,
    tags: row.tags ?? [],
    sourceApplicationId: row.source_application_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toInterviewNoteRow(req: AuthedRequest) {
  const note = InterviewNoteCreateSchema.parse(req.body);

  return {
    user_id: req.user.id,
    company: note.company,
    role: note.role ?? null,
    note_type: note.noteType,
    content: note.content,
    tags: note.tags,
    source_application_id: note.sourceApplicationId ?? null
  };
}

interviewNotesRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { company } = QuerySchema.parse(req.query);
    let query = getSupabaseAdmin()
      .from("interview_notes")
      .select("*")
      .eq("user_id", authedReq.user.id)
      .order("created_at", { ascending: false });

    if (company) {
      query = query.ilike("company", `%${company}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json((data ?? []).map(fromInterviewNoteRow));
  } catch (error) {
    next(error);
  }
});

interviewNotesRouter.post("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { data, error } = await getSupabaseAdmin()
      .from("interview_notes")
      .insert(toInterviewNoteRow(authedReq))
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json(fromInterviewNoteRow(data));
  } catch (error) {
    next(error);
  }
});
