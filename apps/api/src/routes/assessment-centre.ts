import { AssessmentCentreCaseCreateSchema, AssessmentCentreSessionCreateSchema } from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import {
  createAssessmentCentreCase,
  createAssessmentCentreSession,
  deleteAssessmentCentreCase,
  getAssessmentCentreCase,
  listAssessmentCentreCases,
  listAssessmentCentreSessions,
  updateAssessmentCentreCase,
  updateAssessmentCentreSession
} from "../services/application-store";
import type { AuthedRequest } from "../types";

export const assessmentCentreRouter = Router();

const IdParamSchema = z.object({
  id: z.string().uuid()
});

const CaseQuerySchema = z.object({
  applicationId: z.string().uuid().optional()
});

const SessionQuerySchema = z.object({
  applicationId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional()
});

assessmentCentreRouter.get("/cases", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = CaseQuerySchema.parse(req.query);
    res.json(await listAssessmentCentreCases(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.post("/cases", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const acCase = AssessmentCentreCaseCreateSchema.parse(req.body);
    res.status(201).json(await createAssessmentCentreCase(authedReq.user.id, acCase));
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.get("/cases/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const acCase = await getAssessmentCentreCase(authedReq.user.id, id);

    if (!acCase) {
      return res.status(404).json({ error: "Assessment centre case not found." });
    }

    return res.json(acCase);
  } catch (error) {
    return next(error);
  }
});

assessmentCentreRouter.patch("/cases/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const acCase = AssessmentCentreCaseCreateSchema.parse(req.body);
    res.json(await updateAssessmentCentreCase(authedReq.user.id, id, acCase));
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.delete("/cases/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    await deleteAssessmentCentreCase(authedReq.user.id, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.get("/sessions", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = SessionQuerySchema.parse(req.query);
    res.json(await listAssessmentCentreSessions(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.post("/sessions", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const session = AssessmentCentreSessionCreateSchema.parse(req.body);
    res.status(201).json(await createAssessmentCentreSession(authedReq.user.id, session));
  } catch (error) {
    next(error);
  }
});

assessmentCentreRouter.patch("/sessions/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const session = AssessmentCentreSessionCreateSchema.parse(req.body);
    res.json(await updateAssessmentCentreSession(authedReq.user.id, id, session));
  } catch (error) {
    next(error);
  }
});
