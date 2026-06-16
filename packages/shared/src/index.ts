import { z } from "zod";

export const ApplicationStatusSchema = z.enum([
  "Saved",
  "Drafting",
  "Applied",
  "Interview",
  "Assessment Centre",
  "Offer",
  "Rejected"
]);

export const RecommendationSchema = z.enum(["Should Apply", "Maybe", "Skip"]);

export const ExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  organisation: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  achievements: z.array(z.string()).default([])
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  grade: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).default([])
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([])
});

export const CareerProfileSchema = z.object({
  userId: z.string().optional(),
  headline: z.string().optional(),
  visaStatus: z.string().optional(),
  targetIndustries: z.array(z.string()).default([]),
  targetLocations: z.array(z.string()).default([]),
  preferredRoles: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  masterCv: z.string().optional(),
  updatedAt: z.string().optional()
});

export const JobFitRequestSchema = z.object({
  jobDescription: z.string().min(120),
  careerProfile: CareerProfileSchema
});

export const JobFitResponseSchema = z.object({
  fitScore: z.number().min(0).max(100),
  recommendation: RecommendationSchema,
  rationale: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  transferableExperiences: z.array(
    z.object({
      evidence: z.string(),
      relevance: z.string()
    })
  ),
  redFlags: z.array(z.string()),
  actionPlan: z.array(z.string())
});

export const CvTailoringRequestSchema = z.object({
  jobDescription: z.string().min(120),
  masterCv: z.string().min(120),
  careerProfile: CareerProfileSchema
});

export const CvTailoringResponseSchema = z.object({
  positioningSummary: z.string(),
  atsKeywords: z.array(z.string()),
  bulletSuggestions: z.array(
    z.object({
      section: z.string(),
      currentEvidence: z.string(),
      tailoredBullet: z.string(),
      whyItHelps: z.string()
    })
  ),
  sectionRecommendations: z.array(z.string()),
  gapsToAddress: z.array(z.string())
});

export const CoverLetterRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().min(120),
  careerProfile: CareerProfileSchema
});

export const CoverLetterResponseSchema = z.object({
  letter: z.string(),
  evidenceUsed: z.array(z.string()),
  risks: z.array(z.string())
});

export const ApplicationQuestionRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  question: z.string().min(8),
  jobDescription: z.string().optional(),
  careerProfile: CareerProfileSchema
});

export const ApplicationQuestionResponseSchema = z.object({
  answer: z.string(),
  starBreakdown: z.object({
    situation: z.string(),
    task: z.string(),
    action: z.string(),
    result: z.string()
  }),
  evidenceUsed: z.array(z.string()),
  followUpPrep: z.array(z.string())
});

export const ApplicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  status: ApplicationStatusSchema,
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  fitScore: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const ApplicationCreateSchema = ApplicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  status: ApplicationStatusSchema.default("Saved")
});

export const InterviewNoteSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string().optional().nullable(),
  noteType: z.enum(["Company Note", "Previous Question", "Feedback", "Material"]),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  sourceApplicationId: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const InterviewNoteCreateSchema = InterviewNoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type CareerProfile = z.infer<typeof CareerProfileSchema>;
export type JobFitRequest = z.infer<typeof JobFitRequestSchema>;
export type JobFitResponse = z.infer<typeof JobFitResponseSchema>;
export type CvTailoringRequest = z.infer<typeof CvTailoringRequestSchema>;
export type CvTailoringResponse = z.infer<typeof CvTailoringResponseSchema>;
export type CoverLetterRequest = z.infer<typeof CoverLetterRequestSchema>;
export type CoverLetterResponse = z.infer<typeof CoverLetterResponseSchema>;
export type ApplicationQuestionRequest = z.infer<typeof ApplicationQuestionRequestSchema>;
export type ApplicationQuestionResponse = z.infer<typeof ApplicationQuestionResponseSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type ApplicationCreate = z.infer<typeof ApplicationCreateSchema>;
export type InterviewNote = z.infer<typeof InterviewNoteSchema>;
export type InterviewNoteCreate = z.infer<typeof InterviewNoteCreateSchema>;
