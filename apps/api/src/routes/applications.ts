import { ApplicationCreateSchema } from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationWorkspace,
  listApplications,
  updateApplication
} from "../services/application-store";
import type { AuthedRequest } from "../types";

export const applicationsRouter = Router();

const IdParamSchema = z.object({
  id: z.string().uuid()
});

applicationsRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    res.json(await listApplications(authedReq.user.id));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.post("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const application = ApplicationCreateSchema.parse(req.body);
    res.status(201).json(await createApplication(authedReq.user.id, application));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.get("/:id/workspace", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    res.json(await getApplicationWorkspace(authedReq.user.id, id));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.get("/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const application = await getApplication(authedReq.user.id, id);

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    return res.json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRouter.patch("/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const updates = ApplicationCreateSchema.parse(req.body);
    res.json(await updateApplication(authedReq.user.id, id, updates));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.delete("/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    await deleteApplication(authedReq.user.id, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
