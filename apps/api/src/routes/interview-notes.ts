import { InterviewNoteCreateSchema } from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import { createInterviewNote, listInterviewNotes } from "../services/application-store";
import type { AuthedRequest } from "../types";

export const interviewNotesRouter = Router();

const QuerySchema = z.object({
  company: z.string().optional(),
  applicationId: z.string().uuid().optional()
});

interviewNotesRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = QuerySchema.parse(req.query);
    res.json(await listInterviewNotes(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

interviewNotesRouter.post("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const note = InterviewNoteCreateSchema.parse(req.body);
    res.status(201).json(await createInterviewNote(authedReq.user.id, note));
  } catch (error) {
    next(error);
  }
});
