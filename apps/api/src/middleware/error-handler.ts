import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";

type ApiError = Error & {
  statusCode?: number;
};

export function errorHandler(error: ApiError, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      issues: error.flatten()
    });
  }

  const statusCode = error.statusCode ?? 500;

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error." : error.message,
    detail: env.NODE_ENV === "production" ? undefined : error.message
  });
}
