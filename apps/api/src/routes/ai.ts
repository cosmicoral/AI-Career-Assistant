import {
  AcTrainerRequestSchema,
  AcTrainerResponseSchema,
  ApplicationQuestionRequestSchema,
  ApplicationQuestionResponseSchema,
  CoverLetterRequestSchema,
  CoverLetterResponseSchema,
  CvTailoringRequestSchema,
  CvTailoringResponseSchema,
  JobFitRequestSchema,
  JobFitResponseSchema,
  NetworkingStrategyRequestSchema,
  NetworkingStrategyResponseSchema,
  OtPracticeQuestionsRequestSchema,
  OtPracticeQuestionsResponseSchema,
  OtStudyPlanRequestSchema,
  OtStudyPlanResponseSchema
} from "@careeros/shared";
import { Router } from "express";
import {
  applicationQuestionSystem,
  acTrainerSystem,
  buildAcTrainerPrompt,
  buildApplicationQuestionPrompt,
  buildCoverLetterPrompt,
  buildCvTailoringPrompt,
  buildJobFitPrompt,
  buildNetworkingStrategyPrompt,
  buildOtPracticeQuestionsPrompt,
  buildOtStudyPlanPrompt,
  coverLetterSystem,
  cvTailoringSystem,
  jobFitSystem,
  networkingStrategySystem,
  otPracticeQuestionsSystem,
  otStudyPlanSystem
} from "../services/ai-prompts";
import {
  buildMockAcTrainer,
  buildMockApplicationAnswer,
  buildMockCoverLetter,
  buildMockCvTailoring,
  buildMockJobFit,
  buildMockNetworkingStrategy,
  buildMockOtPracticeQuestions,
  buildMockOtStudyPlan
} from "../services/mock-ai";
import { generateStructuredObject } from "../services/openai";
import {
  createAssessmentCentreSession,
  createOnlineTestStudyPlan,
  saveGeneratedMaterial,
  saveJobAnalysis
} from "../services/application-store";
import type { AuthedRequest } from "../types";

export const aiRouter = Router();

aiRouter.post("/job-fit", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = JobFitRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: jobFitSystem,
      user: buildJobFitPrompt(input),
      schema: JobFitResponseSchema,
      mock: () => buildMockJobFit(input)
    });

    if (input.applicationId) {
      await saveJobAnalysis({
        userId: authedReq.user.id,
        applicationId: input.applicationId,
        jobDescription: input.jobDescription,
        result
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/cv-tailor", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = CvTailoringRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: cvTailoringSystem,
      user: buildCvTailoringPrompt(input),
      schema: CvTailoringResponseSchema,
      mock: () => buildMockCvTailoring(input)
    });

    if (input.applicationId) {
      await saveGeneratedMaterial({
        userId: authedReq.user.id,
        applicationId: input.applicationId,
        materialType: "cv_tailoring",
        promptContext: {
          jobDescription: input.jobDescription,
          masterCv: input.masterCv
        },
        output: result,
        isMock: result.isMock
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/cover-letter", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = CoverLetterRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: coverLetterSystem,
      user: buildCoverLetterPrompt(input),
      schema: CoverLetterResponseSchema,
      mock: () => buildMockCoverLetter(input)
    });

    if (input.applicationId) {
      await saveGeneratedMaterial({
        userId: authedReq.user.id,
        applicationId: input.applicationId,
        materialType: "cover_letter",
        promptContext: {
          company: input.company,
          role: input.role,
          jobDescription: input.jobDescription
        },
        output: result,
        isMock: result.isMock
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/application-answer", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = ApplicationQuestionRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: applicationQuestionSystem,
      user: buildApplicationQuestionPrompt(input),
      schema: ApplicationQuestionResponseSchema,
      mock: () => buildMockApplicationAnswer(input)
    });

    if (input.applicationId) {
      await saveGeneratedMaterial({
        userId: authedReq.user.id,
        applicationId: input.applicationId,
        materialType: "application_question",
        promptContext: {
          company: input.company,
          role: input.role,
          question: input.question,
          jobDescription: input.jobDescription
        },
        output: result,
        isMock: result.isMock
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/networking-strategy", async (req, res, next) => {
  try {
    const input = NetworkingStrategyRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: networkingStrategySystem,
      user: buildNetworkingStrategyPrompt(input),
      schema: NetworkingStrategyResponseSchema,
      mock: () => buildMockNetworkingStrategy(input)
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/ac-trainer", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = AcTrainerRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: acTrainerSystem,
      user: buildAcTrainerPrompt(input),
      schema: AcTrainerResponseSchema,
      mock: () => buildMockAcTrainer(input)
    });

    if (input.caseId) {
      await createAssessmentCentreSession(authedReq.user.id, {
        caseId: input.caseId,
        applicationId: input.applicationId ?? null,
        sessionType: input.caseType,
        generatedAgenda: result.discussionAgenda,
        stakeholderMap: result.stakeholderMap,
        suggestedArguments: result.strongContributionExamples,
        openingStatement: result.openingStatementDraft,
        finalRecommendation: result.finalRecommendationDraft,
        feedbackRubric: result.assessorRubric,
        userReflection: null,
        scoreSelfAssessed: null,
        isMock: result.isMock
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/ot-study-plan", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const input = OtStudyPlanRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: otStudyPlanSystem,
      user: buildOtStudyPlanPrompt(input),
      schema: OtStudyPlanResponseSchema,
      mock: () => buildMockOtStudyPlan(input)
    });

    if (input.applicationId) {
      await createOnlineTestStudyPlan(authedReq.user.id, {
        applicationId: input.applicationId,
        provider: input.provider,
        testType: input.testType,
        targetDate: input.deadline ?? null,
        plan: result.studyPlan,
        priorityTopics: result.priorityTopics,
        isMock: result.isMock
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/ot-practice-questions", async (req, res, next) => {
  try {
    const input = OtPracticeQuestionsRequestSchema.parse(req.body);
    const result = await generateStructuredObject({
      system: otPracticeQuestionsSystem,
      user: buildOtPracticeQuestionsPrompt(input),
      schema: OtPracticeQuestionsResponseSchema,
      mock: () => buildMockOtPracticeQuestions(input)
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});
