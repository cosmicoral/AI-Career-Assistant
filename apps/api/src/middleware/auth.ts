import type { NextFunction, Request, Response } from "express";
import { env, isSupabaseConfigured } from "../config/env";
import { getSupabaseAuthClient } from "../config/supabase";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isSupabaseConfigured && env.NODE_ENV !== "production") {
    req.user = {
      id: req.header("x-demo-user-id") ?? "00000000-0000-4000-8000-000000000001"
    };
    return next();
  }

  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token." });
  }

  const { data, error } = await getSupabaseAuthClient().auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired bearer token." });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email
  };

  return next();
}
