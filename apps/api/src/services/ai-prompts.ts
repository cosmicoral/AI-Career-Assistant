import type {
  AcTrainerRequest,
  ApplicationQuestionRequest,
  CoverLetterRequest,
  CvTailoringRequest,
  JobFitRequest,
  NetworkingStrategyRequest,
  OtPracticeQuestionsRequest,
  OtStudyPlanRequest
} from "@careeros/shared";

const systemBase = [
  "You are CareerOS AI, a senior UK graduate recruitment coach.",
  "You help applicants win interviews and offers by giving evidence-based, commercially useful guidance.",
  "Never invent experience, employers, degrees, achievements, metrics, skills, visa status, or eligibility.",
  "If evidence is weak or missing, state the gap clearly.",
  "Return valid JSON only, with no markdown."
].join(" ");

export const jobFitSystem = `${systemBase} Evaluate fit for UK graduate, master's, PhD, and career changer applications. Be candid and practical.`;

export function buildJobFitPrompt(input: JobFitRequest) {
  return JSON.stringify(
    {
      task: "Analyze fit between this career profile and job description.",
      requiredOutput: {
        fitScore: "0-100 number",
        recommendation: "Should Apply, Maybe, or Skip",
        rationale: "Short paragraph",
        matchingSkills: "Array of skills evidenced by the profile",
        missingSkills: "Array of important skills not evidenced",
        transferableExperiences: "Array of evidence/relevance objects",
        redFlags: "Array of visa, location, qualification, timing, or evidence risks",
        actionPlan: "Array of practical next steps before applying"
      },
      careerProfile: input.careerProfile,
      jobDescription: input.jobDescription
    },
    null,
    2
  );
}

export const cvTailoringSystem = `${systemBase} Rewrite CV bullets only from provided evidence. Preserve truthfulness over persuasion. Use UK English.`;

export function buildCvTailoringPrompt(input: CvTailoringRequest) {
  return JSON.stringify(
    {
      task: "Suggest CV tailoring for this role without inventing experience.",
      requiredOutput: {
        positioningSummary: "One concise positioning paragraph",
        atsKeywords: "Keywords from the job description that are genuinely supported",
        bulletSuggestions: "Array of section/currentEvidence/tailoredBullet/whyItHelps objects",
        sectionRecommendations: "Array of structural CV recommendations",
        gapsToAddress: "Array of gaps the candidate should address honestly"
      },
      careerProfile: input.careerProfile,
      masterCv: input.masterCv,
      jobDescription: input.jobDescription
    },
    null,
    2
  );
}

export const coverLetterSystem = `${systemBase} Write concise UK-style cover letters with clear motivation, evidence, and fit. Avoid flattery and generic claims.`;

export function buildCoverLetterPrompt(input: CoverLetterRequest) {
  return JSON.stringify(
    {
      task: "Generate a concise professional cover letter.",
      requiredOutput: {
        letter: "Cover letter text",
        evidenceUsed: "Array of exact evidence points from the profile",
        risks: "Array of weak evidence or missing information risks"
      },
      company: input.company,
      role: input.role,
      careerProfile: input.careerProfile,
      jobDescription: input.jobDescription
    },
    null,
    2
  );
}

export const applicationQuestionSystem = `${systemBase} Answer graduate application questions using STAR where relevant. Make answers specific, measured, and credible.`;

export function buildApplicationQuestionPrompt(input: ApplicationQuestionRequest) {
  return JSON.stringify(
    {
      task: "Draft an application answer using STAR structure where appropriate.",
      requiredOutput: {
        answer: "Polished application answer in UK English",
        starBreakdown: {
          situation: "Situation evidence",
          task: "Task evidence",
          action: "Action evidence",
          result: "Result evidence"
        },
        evidenceUsed: "Array of exact evidence points from the profile",
        followUpPrep: "Array of likely follow-up questions or prep notes"
      },
      company: input.company,
      role: input.role,
      question: input.question,
      careerProfile: input.careerProfile,
      jobDescription: input.jobDescription
    },
    null,
    2
  );
}

export const networkingStrategySystem = `${systemBase} You are a practical job-search networking coach. Do not claim you found real people unless the user supplied contact details. Do not scrape LinkedIn, automate LinkedIn, or imply messages were sent. Generate search queries, outreach strategy, and drafts only. Keep the user in control.`;

export function buildNetworkingStrategyPrompt(input: NetworkingStrategyRequest) {
  return JSON.stringify(
    {
      task: "Create a job-specific networking strategy for this application.",
      requiredOutput: {
        peopleToApproachCategories: "Categories of people to look for, not names unless manually supplied",
        linkedinSearchQueries: "Search strings the user can manually paste into LinkedIn",
        outreachStrategy: "Prioritized practical outreach plan",
        firstMessageDraft: "Concise first message draft",
        followUpMessageDraft: "Concise follow-up draft",
        referralRequestDraft: "Referral request draft to use only after rapport",
        riskNotes: "Risks, caveats, and user-control reminders"
      },
      constraints: [
        "Do not claim to have found real people.",
        "Do not scrape LinkedIn.",
        "Do not automate sending messages.",
        "If LinkedIn integration is not available, generate search queries only.",
        "Use manually supplied existing contact info only as context."
      ],
      careerProfile: input.careerProfile,
      application: input.application,
      company: input.company,
      role: input.role,
      jobDescription: input.jobDescription,
      existingContactInfo: input.existingContactInfo ?? []
    },
    null,
    2
  );
}

export const acTrainerSystem = `${systemBase} You are an assessment-centre trainer for UK graduate recruitment. Generate realistic, original practice support only. Do not reproduce copyrighted or commercial assessment content, and do not claim the case comes from a specific employer unless supplied by the user.`;

export function buildAcTrainerPrompt(input: AcTrainerRequest) {
  return JSON.stringify(
    {
      task: "Create an assessment-centre practice session for this manually provided case.",
      requiredOutput: {
        caseSummary: "Concise summary of the case situation",
        keyIssues: "Main business and people issues to notice",
        stakeholderMap: "Relevant stakeholders and what they care about",
        discussionAgenda: "Structured agenda for group discussion or exercise response",
        strongContributionExamples: "Examples of helpful contributions the candidate could make",
        weakContributionRisks: "Behaviours or arguments that may weaken performance",
        commercialAwarenessPoints: "Business considerations to mention",
        recommendedStructure: "Response structure for the exercise",
        openingStatementDraft: "Brief opening contribution",
        finalRecommendationDraft: "Brief final recommendation",
        assessorRubric: "Rubric points for self-assessment",
        practiceChecklist: "Checklist before/during practice",
        improvementPlan: "Practical next steps"
      },
      constraints: [
        "Use only the user-provided case prompt and career profile.",
        "Do not reproduce SHL, Capp, Arctic Shores, Aon, Sova, employer, or other commercial assessment content.",
        "Do not claim this is an official or leaked assessment.",
        "Keep advice practical and suitable for UK graduate assessment centres."
      ],
      careerProfile: input.careerProfile,
      company: input.company,
      role: input.role,
      industry: input.industry,
      caseType: input.caseType,
      casePrompt: input.casePrompt
    },
    null,
    2
  );
}

export const otStudyPlanSystem = `${systemBase} You are an online-assessment preparation coach. Build study plans from user-provided deadlines, weak areas, and notes. Do not scrape, reproduce, or imply access to commercial test-bank content.`;

export function buildOtStudyPlanPrompt(input: OtStudyPlanRequest) {
  return JSON.stringify(
    {
      task: "Create a practical online-test preparation plan.",
      requiredOutput: {
        studyPlan: "Ordered study plan steps",
        priorityTopics: "Topics to prioritize",
        dailyPracticeSchedule: "Day-by-day or session-by-session schedule",
        testStrategy: "Strategy for the test type",
        timeManagementTips: "Timing guidance",
        errorLogTemplate: "Reusable error-log fields or prompts",
        recommendedOfficialResourceSearchQueries: "Search queries for finding official/provider resources manually",
        riskNotes: "Caveats about unofficial resources and limitations"
      },
      constraints: [
        "Do not provide proprietary or copied commercial test questions.",
        "Do not claim to know the exact assessment the employer will use.",
        "Point the user toward official provider resources using search queries only.",
        "Use the user's weak areas and deadline to prioritize the plan."
      ],
      provider: input.provider,
      testType: input.testType,
      deadline: input.deadline,
      currentScoreOrLevel: input.currentScoreOrLevel,
      weakAreas: input.weakAreas,
      availableTime: input.availableTime,
      application: input.application,
      company: input.company
    },
    null,
    2
  );
}

export const otPracticeQuestionsSystem = `${systemBase} You are an online-test practice coach. Generate original, generic practice questions only. Do not reproduce proprietary questions, commercial provider item banks, or employer assessment content.`;

export function buildOtPracticeQuestionsPrompt(input: OtPracticeQuestionsRequest) {
  return JSON.stringify(
    {
      task: "Generate original practice questions for skill-building.",
      requiredOutput: {
        questions: "Original generic practice questions",
        answerKey: "Answer key in the same order",
        explanations: "Short explanation for each answer",
        skillTags: "Skill area tags",
        difficulty: "Difficulty label",
        riskNotes: "Caveats about these not being official provider questions"
      },
      constraints: [
        "Questions must be newly generated and generic.",
        "Do not copy or approximate proprietary provider or employer question banks.",
        "Do not mention that these are official SHL, Capp, Arctic Shores, Aon, Sova, Watson Glaser, or employer questions.",
        "Keep count at or below the requested count."
      ],
      provider: input.provider,
      testType: input.testType,
      weakAreas: input.weakAreas,
      difficulty: input.difficulty,
      count: input.count
    },
    null,
    2
  );
}
