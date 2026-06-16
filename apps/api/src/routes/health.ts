import { Router } from "express";
import { isOpenAiConfigured, isSupabaseConfigured } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "careeros-api",
    integrations: {
      supabase: isSupabaseConfigured ? "configured" : "missing",
      openai: isOpenAiConfigured ? "configured" : "missing"
    }
  });
});
