import {
  ApplicationQuestionRequestSchema,
  ApplicationQuestionResponseSchema,
  CoverLetterRequestSchema,
  CoverLetterResponseSchema,
  CvTailoringRequestSchema,
  CvTailoringResponseSchema,
  JobFitRequestSchema,
  JobFitResponseSchema
} from "@careeros/shared";
import { Router } from "express";
import {
  applicationQuestionSystem,
  buildApplicationQuestionPrompt,
  buildCoverLetterPrompt,
  buildCvTailoringPrompt,
  buildJobFitPrompt,
  coverLetterSystem,
  cvTailoringSystem,
  jobFitSystem
} from "../services/ai-prompts";
import { generateStructuredObject } from "../services/openai";

export const aiRouter = Router();

aiRouter.post("/job-fit", async (req, res, next) => {
  try {
    const input = JobFitRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: jobFitSystem,
      user: buildJobFitPrompt(input),
      schema: JobFitResponseSchema
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/cv-tailor", async (req, res, next) => {
  try {
    const input = CvTailoringRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: cvTailoringSystem,
      user: buildCvTailoringPrompt(input),
      schema: CvTailoringResponseSchema
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/cover-letter", async (req, res, next) => {
  try {
    const input = CoverLetterRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: coverLetterSystem,
      user: buildCoverLetterPrompt(input),
      schema: CoverLetterResponseSchema
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/application-answer", async (req, res, next) => {
  try {
    const input = ApplicationQuestionRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: applicationQuestionSystem,
      user: buildApplicationQuestionPrompt(input),
      schema: ApplicationQuestionResponseSchema
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});
