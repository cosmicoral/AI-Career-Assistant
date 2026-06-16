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

export const RelationshipTypeSchema = z.enum([
  "alumni",
  "recruiter",
  "hiring_manager",
  "employee",
  "founder",
  "mutual_connection",
  "unknown"
]);

export const NetworkingActionTypeSchema = z.enum([
  "connect",
  "message",
  "follow_up",
  "coffee_chat",
  "referral_request",
  "thank_you"
]);

export const NetworkingActionStatusSchema = z.enum([
  "planned",
  "sent",
  "replied",
  "no_response",
  "completed"
]);

export const AssessmentCentreCaseTypeSchema = z.enum([
  "group_discussion",
  "case_study",
  "presentation",
  "role_play",
  "written_exercise",
  "in_tray"
]);

export const OnlineTestProviderSchema = z.enum([
  "SHL",
  "Cappfinity / Capp",
  "Arctic Shores",
  "Watson Glaser",
  "Sova",
  "Aon",
  "HireVue games",
  "Numerical reasoning",
  "Verbal reasoning",
  "Situational judgement test",
  "Logical / diagrammatic reasoning",
  "Other"
]);

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
  careerProfile: CareerProfileSchema,
  applicationId: z.string().uuid().optional()
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
  actionPlan: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const CvTailoringRequestSchema = z.object({
  jobDescription: z.string().min(120),
  masterCv: z.string().min(120),
  careerProfile: CareerProfileSchema,
  applicationId: z.string().uuid().optional()
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
  gapsToAddress: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const CoverLetterRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().min(120),
  careerProfile: CareerProfileSchema,
  applicationId: z.string().uuid().optional()
});

export const CoverLetterResponseSchema = z.object({
  letter: z.string(),
  evidenceUsed: z.array(z.string()),
  risks: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const ApplicationQuestionRequestSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  question: z.string().min(8),
  jobDescription: z.string().optional(),
  careerProfile: CareerProfileSchema,
  applicationId: z.string().uuid().optional()
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
  followUpPrep: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const ApplicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  status: ApplicationStatusSchema,
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
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

export const NetworkingContactSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  company: z.string(),
  name: z.string(),
  title: z.string(),
  linkedinUrl: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  relationshipType: RelationshipTypeSchema,
  relevanceScore: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const NetworkingContactCreateSchema = NetworkingContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  relationshipType: RelationshipTypeSchema.default("unknown"),
  relevanceScore: z.number().min(0).max(100).optional().nullable()
});

export const NetworkingActionSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  applicationId: z.string().optional().nullable(),
  actionType: NetworkingActionTypeSchema,
  status: NetworkingActionStatusSchema,
  dueDate: z.string().optional().nullable(),
  messageDraft: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const NetworkingActionCreateSchema = NetworkingActionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  status: NetworkingActionStatusSchema.default("planned")
});

export const NetworkingStrategyRequestSchema = z.object({
  careerProfile: CareerProfileSchema,
  application: ApplicationSchema.optional(),
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().optional(),
  existingContactInfo: z
    .array(
      z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        relationshipType: RelationshipTypeSchema.optional(),
        notes: z.string().optional()
      })
    )
    .optional()
});

export const NetworkingStrategyResponseSchema = z.object({
  peopleToApproachCategories: z.array(z.string()),
  linkedinSearchQueries: z.array(z.string()),
  outreachStrategy: z.array(z.string()),
  firstMessageDraft: z.string(),
  followUpMessageDraft: z.string(),
  referralRequestDraft: z.string(),
  riskNotes: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const AssessmentCentreCaseSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  company: z.string(),
  role: z.string(),
  industry: z.string(),
  caseType: AssessmentCentreCaseTypeSchema,
  prompt: z.string(),
  difficulty: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const AssessmentCentreCaseCreateSchema = AssessmentCentreCaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const AssessmentCentreSessionSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  applicationId: z.string().optional().nullable(),
  sessionType: z.string(),
  generatedAgenda: z.array(z.string()).default([]),
  stakeholderMap: z.array(z.string()).default([]),
  suggestedArguments: z.array(z.string()).default([]),
  openingStatement: z.string().optional().nullable(),
  finalRecommendation: z.string().optional().nullable(),
  feedbackRubric: z.array(z.string()).default([]),
  userReflection: z.string().optional().nullable(),
  scoreSelfAssessed: z.number().min(0).max(100).optional().nullable(),
  isMock: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const AssessmentCentreSessionCreateSchema = AssessmentCentreSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const AcTrainerRequestSchema = z.object({
  careerProfile: CareerProfileSchema,
  company: z.string().min(1),
  role: z.string().min(1),
  industry: z.string().min(1),
  caseType: AssessmentCentreCaseTypeSchema,
  casePrompt: z.string().min(20),
  applicationId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional()
});

export const AcTrainerResponseSchema = z.object({
  caseSummary: z.string(),
  keyIssues: z.array(z.string()),
  stakeholderMap: z.array(z.string()),
  discussionAgenda: z.array(z.string()),
  strongContributionExamples: z.array(z.string()),
  weakContributionRisks: z.array(z.string()),
  commercialAwarenessPoints: z.array(z.string()),
  recommendedStructure: z.array(z.string()),
  openingStatementDraft: z.string(),
  finalRecommendationDraft: z.string(),
  assessorRubric: z.array(z.string()),
  practiceChecklist: z.array(z.string()),
  improvementPlan: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const OnlineTestResourceSchema = z.object({
  id: z.string(),
  provider: OnlineTestProviderSchema,
  testType: z.string(),
  title: z.string(),
  url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isOfficialResource: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const OnlineTestResourceCreateSchema = OnlineTestResourceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const OnlineTestAttemptSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  provider: OnlineTestProviderSchema,
  testType: z.string(),
  score: z.number().optional().nullable(),
  percentile: z.number().optional().nullable(),
  timeSpentMinutes: z.number().optional().nullable(),
  weakAreas: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  takenAt: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const OnlineTestAttemptCreateSchema = OnlineTestAttemptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const OnlineTestStudyPlanSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  provider: OnlineTestProviderSchema,
  testType: z.string(),
  targetDate: z.string().optional().nullable(),
  plan: z.array(z.string()).default([]),
  priorityTopics: z.array(z.string()).default([]),
  isMock: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const OnlineTestStudyPlanCreateSchema = OnlineTestStudyPlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const OtStudyPlanRequestSchema = z.object({
  applicationId: z.string().uuid().optional(),
  provider: OnlineTestProviderSchema,
  testType: z.string().min(1),
  deadline: z.string().optional(),
  currentScoreOrLevel: z.string().optional(),
  weakAreas: z.array(z.string()).default([]),
  availableTime: z.string().optional(),
  application: ApplicationSchema.optional(),
  company: z.string().optional()
});

export const OtStudyPlanResponseSchema = z.object({
  studyPlan: z.array(z.string()),
  priorityTopics: z.array(z.string()),
  dailyPracticeSchedule: z.array(z.string()),
  testStrategy: z.array(z.string()),
  timeManagementTips: z.array(z.string()),
  errorLogTemplate: z.array(z.string()),
  recommendedOfficialResourceSearchQueries: z.array(z.string()),
  riskNotes: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const OtPracticeQuestionsRequestSchema = z.object({
  provider: OnlineTestProviderSchema,
  testType: z.string().min(1),
  weakAreas: z.array(z.string()).default([]),
  difficulty: z.string().optional(),
  count: z.number().min(1).max(10).default(5)
});

export const OtPracticeQuestionsResponseSchema = z.object({
  questions: z.array(z.string()),
  answerKey: z.array(z.string()),
  explanations: z.array(z.string()),
  skillTags: z.array(z.string()),
  difficulty: z.string(),
  riskNotes: z.array(z.string()),
  isMock: z.boolean().optional()
});

export const GeneratedMaterialTypeSchema = z.enum([
  "cv_tailoring",
  "cover_letter",
  "application_question"
]);

export const JobAnalysisSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  jobDescription: z.string(),
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
  actionPlan: z.array(z.string()),
  isMock: z.boolean().optional(),
  createdAt: z.string().optional()
});

export const GeneratedMaterialSchema = z.object({
  id: z.string(),
  applicationId: z.string().optional().nullable(),
  materialType: GeneratedMaterialTypeSchema,
  promptContext: z.record(z.unknown()).default({}),
  output: z.unknown(),
  isMock: z.boolean().optional(),
  createdAt: z.string().optional()
});

export const ApplicationWorkspaceSchema = z.object({
  application: ApplicationSchema,
  latestFitAnalysis: JobAnalysisSchema.optional().nullable(),
  generatedMaterials: z.array(GeneratedMaterialSchema),
  interviewNotes: z.array(InterviewNoteSchema),
  networkingContacts: z.array(NetworkingContactSchema).default([]),
  networkingActions: z.array(NetworkingActionSchema).default([]),
  assessmentCentreCases: z.array(AssessmentCentreCaseSchema).default([]),
  assessmentCentreSessions: z.array(AssessmentCentreSessionSchema).default([]),
  onlineTestAttempts: z.array(OnlineTestAttemptSchema).default([]),
  onlineTestStudyPlans: z.array(OnlineTestStudyPlanSchema).default([]),
  onlineTestResources: z.array(OnlineTestResourceSchema).default([])
});

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
export type NetworkingActionType = z.infer<typeof NetworkingActionTypeSchema>;
export type NetworkingActionStatus = z.infer<typeof NetworkingActionStatusSchema>;
export type AssessmentCentreCaseType = z.infer<typeof AssessmentCentreCaseTypeSchema>;
export type OnlineTestProvider = z.infer<typeof OnlineTestProviderSchema>;
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
export type GeneratedMaterialType = z.infer<typeof GeneratedMaterialTypeSchema>;
export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;
export type GeneratedMaterial = z.infer<typeof GeneratedMaterialSchema>;
export type ApplicationWorkspace = z.infer<typeof ApplicationWorkspaceSchema>;
export type NetworkingContact = z.infer<typeof NetworkingContactSchema>;
export type NetworkingContactCreate = z.infer<typeof NetworkingContactCreateSchema>;
export type NetworkingAction = z.infer<typeof NetworkingActionSchema>;
export type NetworkingActionCreate = z.infer<typeof NetworkingActionCreateSchema>;
export type NetworkingStrategyRequest = z.infer<typeof NetworkingStrategyRequestSchema>;
export type NetworkingStrategyResponse = z.infer<typeof NetworkingStrategyResponseSchema>;
export type AssessmentCentreCase = z.infer<typeof AssessmentCentreCaseSchema>;
export type AssessmentCentreCaseCreate = z.infer<typeof AssessmentCentreCaseCreateSchema>;
export type AssessmentCentreSession = z.infer<typeof AssessmentCentreSessionSchema>;
export type AssessmentCentreSessionCreate = z.infer<typeof AssessmentCentreSessionCreateSchema>;
export type AcTrainerRequest = z.infer<typeof AcTrainerRequestSchema>;
export type AcTrainerResponse = z.infer<typeof AcTrainerResponseSchema>;
export type OnlineTestResource = z.infer<typeof OnlineTestResourceSchema>;
export type OnlineTestResourceCreate = z.infer<typeof OnlineTestResourceCreateSchema>;
export type OnlineTestAttempt = z.infer<typeof OnlineTestAttemptSchema>;
export type OnlineTestAttemptCreate = z.infer<typeof OnlineTestAttemptCreateSchema>;
export type OnlineTestStudyPlan = z.infer<typeof OnlineTestStudyPlanSchema>;
export type OnlineTestStudyPlanCreate = z.infer<typeof OnlineTestStudyPlanCreateSchema>;
export type OtStudyPlanRequest = z.infer<typeof OtStudyPlanRequestSchema>;
export type OtStudyPlanResponse = z.infer<typeof OtStudyPlanResponseSchema>;
export type OtPracticeQuestionsRequest = z.infer<typeof OtPracticeQuestionsRequestSchema>;
export type OtPracticeQuestionsResponse = z.infer<typeof OtPracticeQuestionsResponseSchema>;
