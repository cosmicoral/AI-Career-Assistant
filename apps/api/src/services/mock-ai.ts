import type {
  AcTrainerRequest,
  AcTrainerResponse,
  ApplicationQuestionRequest,
  ApplicationQuestionResponse,
  CoverLetterRequest,
  CoverLetterResponse,
  CvTailoringRequest,
  CvTailoringResponse,
  JobFitRequest,
  JobFitResponse,
  NetworkingStrategyRequest,
  NetworkingStrategyResponse,
  OtPracticeQuestionsRequest,
  OtPracticeQuestionsResponse,
  OtStudyPlanRequest,
  OtStudyPlanResponse
} from "@careeros/shared";

export function buildMockJobFit(input: JobFitRequest): JobFitResponse {
  const skills = input.careerProfile.skills.slice(0, 5);
  const achievements = input.careerProfile.achievements.slice(0, 2);
  const hasEvidence = skills.length > 0 || achievements.length > 0;

  return {
    fitScore: hasEvidence ? 62 : 38,
    recommendation: hasEvidence ? "Maybe" : "Skip",
    rationale:
      "MOCK analysis generated because OPENAI_API_KEY is not configured. Add a real key for evidence-quality scoring before relying on this result.",
    matchingSkills: skills,
    missingSkills: ["Role-specific requirements need real AI analysis", "Evidence strength has not been fully assessed"],
    transferableExperiences: achievements.map((achievement) => ({
      evidence: achievement,
      relevance: "Potentially relevant, but this needs real AI validation."
    })),
    redFlags: ["MOCK output. Do not submit decisions based on this analysis."],
    actionPlan: ["Configure OPENAI_API_KEY", "Re-run job fit analysis", "Save the real analysis to this application"],
    isMock: true
  };
}

export function buildMockCvTailoring(input: CvTailoringRequest): CvTailoringResponse {
  return {
    positioningSummary:
      "MOCK CV tailoring generated because OPENAI_API_KEY is not configured. Use this only to test the saved workflow.",
    atsKeywords: input.careerProfile.skills.slice(0, 6),
    bulletSuggestions: input.careerProfile.achievements.slice(0, 3).map((achievement) => ({
      section: "Evidence bank",
      currentEvidence: achievement,
      tailoredBullet: `MOCK bullet based on existing evidence: ${achievement}`,
      whyItHelps: "This proves the output can be saved, but it is not a real tailored recommendation."
    })),
    sectionRecommendations: ["MOCK recommendation. Configure OpenAI and regenerate before using."],
    gapsToAddress: ["Real tailoring requires OPENAI_API_KEY."],
    isMock: true
  };
}

export function buildMockCoverLetter(input: CoverLetterRequest): CoverLetterResponse {
  return {
    letter: `MOCK cover letter for ${input.company} - ${input.role}.\n\nThis placeholder exists only because OPENAI_API_KEY is not configured. Configure OpenAI and regenerate before using this in a real application.`,
    evidenceUsed: input.careerProfile.achievements.slice(0, 3),
    risks: ["MOCK output. Do not submit this letter."],
    isMock: true
  };
}

export function buildMockApplicationAnswer(input: ApplicationQuestionRequest): ApplicationQuestionResponse {
  const evidence = input.careerProfile.achievements[0] ?? "No saved evidence found";

  return {
    answer: `MOCK answer for: ${input.question}. Configure OPENAI_API_KEY and regenerate before using this answer in an application.`,
    starBreakdown: {
      situation: `MOCK situation based on: ${evidence}`,
      task: "MOCK task",
      action: "MOCK action",
      result: "MOCK result"
    },
    evidenceUsed: [evidence],
    followUpPrep: ["MOCK output. Add OpenAI configuration and regenerate."],
    isMock: true
  };
}

export function buildMockNetworkingStrategy(input: NetworkingStrategyRequest): NetworkingStrategyResponse {
  const company = input.company;
  const role = input.role;

  return {
    peopleToApproachCategories: [
      "Recruiters or early careers team members",
      `${role} team members at ${company}`,
      "Alumni from your university or previous employers",
      "Employees who joined through a graduate scheme"
    ],
    linkedinSearchQueries: [
      `${company} ${role} recruiter`,
      `${company} graduate scheme`,
      `${company} alumni`,
      `${company} ${role}`,
      `${company} hiring manager`
    ],
    outreachStrategy: [
      "Start with alumni or early-careers recruiters because they are most likely to respond.",
      "Ask for application insight, not a job.",
      "Send one concise follow-up after 4-6 days if there is no response.",
      "Only ask for a referral after a useful conversation or clear rapport."
    ],
    firstMessageDraft: `Hi [Name], I am applying for the ${role} role at ${company} and noticed your experience there. I would really value 10 minutes of insight on what the team looks for in strong applicants. Would you be open to a quick chat?`,
    followUpMessageDraft: `Hi [Name], just following up on my note about the ${role} role at ${company}. I know you are busy, so even one or two pointers on the application process would be hugely appreciated.`,
    referralRequestDraft: `Thanks again for your advice. Based on our conversation, I am still very interested in the ${role} role. If you feel comfortable, would you be open to referring me or pointing me to the right recruiter?`,
    riskNotes: [
      "MOCK strategy generated because OPENAI_API_KEY is not configured.",
      "This has not found real people. Use the search queries manually.",
      "Do not send messages without reviewing and personalising them."
    ],
    isMock: true
  };
}

export function buildMockAcTrainer(input: AcTrainerRequest): AcTrainerResponse {
  return {
    caseSummary: `MOCK assessment-centre session for ${input.company} - ${input.role}. Configure OPENAI_API_KEY for real coaching.`,
    keyIssues: [
      "MOCK: identify the commercial objective before proposing actions.",
      "MOCK: separate customer, cost, risk, and implementation considerations."
    ],
    stakeholderMap: ["Candidate team", "Customer/users", "Commercial sponsor", "Operations or delivery team"],
    discussionAgenda: [
      "Clarify objective and constraints",
      "Prioritise the biggest risks",
      "Compare two or three options",
      "Agree recommendation and next steps"
    ],
    strongContributionExamples: [
      "MOCK: frame trade-offs clearly and invite quieter participants into the discussion.",
      "MOCK: link each recommendation to evidence from the prompt."
    ],
    weakContributionRisks: [
      "MOCK output. Do not treat this as employer-specific assessment content.",
      "Avoid dominating the group or making unsupported assumptions."
    ],
    commercialAwarenessPoints: [
      "Revenue or growth impact",
      "Customer experience",
      "Operational feasibility",
      "Reputational and compliance risk"
    ],
    recommendedStructure: ["Context", "Options", "Recommendation", "Risks", "Next steps"],
    openingStatementDraft: `MOCK opening: I suggest we first agree what ${input.company} is optimising for, then compare options against impact, feasibility, and risk.`,
    finalRecommendationDraft:
      "MOCK recommendation: choose the option with the strongest evidence, fastest implementation path, and clearest risk mitigation.",
    assessorRubric: [
      "Structured thinking",
      "Evidence use",
      "Collaboration",
      "Commercial awareness",
      "Clear recommendation"
    ],
    practiceChecklist: [
      "Time-box reading and planning",
      "Write two trade-offs before speaking",
      "Ask at least one constructive question",
      "Summarise the final recommendation"
    ],
    improvementPlan: [
      "Configure OPENAI_API_KEY and regenerate.",
      "Record a reflection immediately after practice.",
      "Repeat with a different original case prompt."
    ],
    isMock: true
  };
}

export function buildMockOtStudyPlan(input: OtStudyPlanRequest): OtStudyPlanResponse {
  const weakAreas = input.weakAreas.length > 0 ? input.weakAreas : ["timing", "accuracy under pressure"];

  return {
    studyPlan: [
      `MOCK plan for ${input.provider} ${input.testType}. Configure OPENAI_API_KEY for real prioritisation.`,
      "Baseline your current score with a legitimate practice source.",
      "Practise one weak area per session and log every mistake.",
      "Review timing strategy before the deadline."
    ],
    priorityTopics: weakAreas,
    dailyPracticeSchedule: [
      "Session 1: diagnostic practice and error log setup",
      "Session 2: targeted weak-area drills",
      "Session 3: timed mixed practice",
      "Session 4: review and retest"
    ],
    testStrategy: [
      "Read instructions carefully before starting.",
      "Skip and return where the platform allows.",
      "Protect accuracy on easier questions before chasing hard ones."
    ],
    timeManagementTips: [
      "Track average time per question during practice.",
      "Use a cutoff point for questions that are not moving."
    ],
    errorLogTemplate: ["Question type", "Mistake cause", "Correct method", "Timing issue", "Retest date"],
    recommendedOfficialResourceSearchQueries: [
      `${input.provider} official practice ${input.testType}`,
      `${input.provider} candidate preparation guide`,
      `${input.testType} official practice questions`
    ],
    riskNotes: [
      "MOCK output generated because OPENAI_API_KEY is not configured.",
      "CareerOS does not scrape or reproduce commercial test-bank content.",
      "Use official/provider resources where possible."
    ],
    isMock: true
  };
}

export function buildMockOtPracticeQuestions(input: OtPracticeQuestionsRequest): OtPracticeQuestionsResponse {
  const count = Math.min(input.count, 10);
  const questions = Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return `MOCK original ${input.testType} practice question ${n}: choose the best answer based on the information provided. Configure OPENAI_API_KEY for richer original practice.`;
  });

  return {
    questions,
    answerKey: questions.map((_, index) => `Answer ${index + 1}: A`),
    explanations: questions.map(
      (_, index) => `Explanation ${index + 1}: MOCK explanation. This is generic practice, not official provider content.`
    ),
    skillTags: input.weakAreas.length > 0 ? input.weakAreas : [input.testType],
    difficulty: input.difficulty ?? "medium",
    riskNotes: [
      "MOCK output generated because OPENAI_API_KEY is not configured.",
      "These are original generic practice prompts, not copied commercial questions.",
      "Do not treat them as official SHL, Capp, Arctic Shores, Aon, Sova, Watson Glaser, or employer content."
    ],
    isMock: true
  };
}
