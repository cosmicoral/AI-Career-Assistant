import {
  OnlineTestAttemptCreateSchema,
  OnlineTestResourceCreateSchema,
  OnlineTestStudyPlanCreateSchema
} from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import {
  createOnlineTestAttempt,
  createOnlineTestResource,
  createOnlineTestStudyPlan,
  listOnlineTestAttempts,
  listOnlineTestResources,
  listOnlineTestStudyPlans
} from "../services/application-store";
import type { AuthedRequest } from "../types";

export const onlineTestsRouter = Router();

const ApplicationQuerySchema = z.object({
  applicationId: z.string().uuid().optional()
});

onlineTestsRouter.get("/resources", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    res.json(await listOnlineTestResources(authedReq.user.id));
  } catch (error) {
    next(error);
  }
});

onlineTestsRouter.post("/resources", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const resource = OnlineTestResourceCreateSchema.parse(req.body);
    res.status(201).json(await createOnlineTestResource(authedReq.user.id, resource));
  } catch (error) {
    next(error);
  }
});

onlineTestsRouter.get("/attempts", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = ApplicationQuerySchema.parse(req.query);
    res.json(await listOnlineTestAttempts(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

onlineTestsRouter.post("/attempts", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const attempt = OnlineTestAttemptCreateSchema.parse(req.body);
    res.status(201).json(await createOnlineTestAttempt(authedReq.user.id, attempt));
  } catch (error) {
    next(error);
  }
});

onlineTestsRouter.get("/study-plans", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = ApplicationQuerySchema.parse(req.query);
    res.json(await listOnlineTestStudyPlans(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

onlineTestsRouter.post("/study-plans", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const plan = OnlineTestStudyPlanCreateSchema.parse(req.body);
    res.status(201).json(await createOnlineTestStudyPlan(authedReq.user.id, plan));
  } catch (error) {
    next(error);
  }
});
