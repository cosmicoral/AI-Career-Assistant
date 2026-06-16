import { CareerProfileSchema } from "@careeros/shared";
import { Router } from "express";
import { getProfile, saveProfile } from "../services/application-store";
import type { AuthedRequest } from "../types";

export const profileRouter = Router();

profileRouter.get("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    res.json(await getProfile(authedReq.user.id));
  } catch (error) {
    next(error);
  }
});

profileRouter.put("/", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const profile = CareerProfileSchema.parse(req.body);
    res.json(await saveProfile(authedReq.user.id, profile));
  } catch (error) {
    next(error);
  }
});
