import type {
  ApplicationQuestionRequest,
  CoverLetterRequest,
  CvTailoringRequest,
  JobFitRequest
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
