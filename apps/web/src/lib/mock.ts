import type {
  Application,
  ApplicationQuestionResponse,
  CareerProfile,
  CoverLetterResponse,
  CvTailoringResponse,
  InterviewNote,
  JobFitResponse
} from "@careeros/shared";

export const sampleProfile: CareerProfile = {
  headline: "MSc Management candidate targeting consulting, product, and operations graduate roles",
  visaStatus: "Graduate visa eligible",
  targetIndustries: ["Consulting", "Technology", "Financial services"],
  targetLocations: ["London", "Manchester", "Birmingham"],
  preferredRoles: ["Graduate Consultant", "Product Analyst", "Operations Associate"],
  skills: ["Market research", "Excel", "SQL", "Stakeholder management", "Presentation"],
  achievements: [
    "Built a customer segmentation project using survey data from 350 respondents",
    "Led a 5-person university consulting project for a local SME",
    "Improved reporting turnaround by 30 percent during an internship"
  ],
  education: [
    {
      institution: "University of Manchester",
      degree: "MSc Management",
      field: "Business and analytics",
      grade: "Distinction expected",
      highlights: ["Strategy", "Business analytics", "Organisational behaviour"]
    }
  ],
  experience: [
    {
      title: "Business Operations Intern",
      organisation: "Fintech scale-up",
      summary: "Supported operations reporting and customer issue analysis.",
      achievements: [
        "Created weekly Excel dashboard used by operations lead",
        "Analysed support tickets to identify onboarding friction"
      ]
    }
  ],
  projects: [
    {
      name: "SME growth strategy project",
      summary: "Delivered market entry recommendations for a local food brand.",
      skills: ["Research", "Commercial analysis", "Presentation"],
      outcomes: ["Presented recommendations to founder and university supervisor"]
    }
  ],
  masterCv:
    "MSc Management candidate with experience in operations reporting, market research, SQL analysis and stakeholder presentations."
};

export const sampleApplications: Application[] = [
  {
    id: "3e7f1010-129a-4d26-ae56-4a0a016a9011",
    company: "Deloitte",
    role: "Graduate Consultant",
    status: "Interview",
    applicationDate: "2026-06-02",
    deadline: "2026-06-20",
    location: "London",
    fitScore: 84
  },
  {
    id: "7cfe7418-0d43-4268-bf02-42739d1a224e",
    company: "Monzo",
    role: "Product Analyst Graduate",
    status: "Drafting",
    applicationDate: null,
    deadline: "2026-06-24",
    location: "London",
    fitScore: 76
  },
  {
    id: "b6766f99-b59e-441c-8c96-3ec59fd74811",
    company: "Amazon",
    role: "Operations Graduate Programme",
    status: "Applied",
    applicationDate: "2026-06-08",
    deadline: "2026-06-28",
    location: "Manchester",
    fitScore: 72
  }
];

export const sampleJobFit: JobFitResponse = {
  fitScore: 84,
  recommendation: "Should Apply",
  rationale:
    "The profile has strong evidence for research, structured problem solving, stakeholder communication and operations analysis. The main risk is limited direct consulting internship experience.",
  matchingSkills: ["Market research", "Excel reporting", "Stakeholder presentations", "Commercial analysis"],
  missingSkills: ["Formal consulting internship", "Advanced financial modelling"],
  transferableExperiences: [
    {
      evidence: "Led a 5-person university consulting project for a local SME",
      relevance: "Maps directly to client-facing analysis and recommendation building."
    },
    {
      evidence: "Improved reporting turnaround by 30 percent during an internship",
      relevance: "Shows measurable operational impact and analytical follow-through."
    }
  ],
  redFlags: ["Confirm visa sponsorship requirements before investing significant time."],
  actionPlan: [
    "Lead with the SME consulting project in the CV profile.",
    "Quantify the Excel dashboard impact in one bullet.",
    "Prepare one commercial awareness example from the target industry."
  ]
};

export const sampleCvTailoring: CvTailoringResponse = {
  positioningSummary:
    "Position the candidate as an analytical graduate with hands-on operations improvement, structured market research, and early client-style project experience.",
  atsKeywords: ["stakeholder management", "market research", "problem solving", "Excel", "commercial analysis"],
  bulletSuggestions: [
    {
      section: "Experience",
      currentEvidence: "Created weekly Excel dashboard used by operations lead",
      tailoredBullet:
        "Built a weekly Excel reporting dashboard for the operations lead, improving visibility of onboarding issues and supporting faster prioritisation.",
      whyItHelps: "Connects analytical work to operational decision making."
    },
    {
      section: "Projects",
      currentEvidence: "Delivered market entry recommendations for a local food brand",
      tailoredBullet:
        "Led market research and competitor analysis for an SME growth project, presenting actionable market entry recommendations to the founder.",
      whyItHelps: "Shows client-facing consulting behaviours without overstating the project."
    }
  ],
  sectionRecommendations: ["Move consulting-style project above less relevant part-time work."],
  gapsToAddress: ["Add a concise example of influencing a stakeholder."]
};

export const sampleCoverLetter: CoverLetterResponse = {
  letter:
    "Dear Hiring Team,\n\nI am applying for the Graduate Consultant role because it combines structured problem solving, commercial analysis and client impact. During my MSc Management studies, I led a five-person consulting project for a local SME, using market research and competitor analysis to develop growth recommendations that were presented to the founder.\n\nMy operations internship also gave me practical experience turning analysis into decisions. I built a weekly Excel dashboard for the operations lead and analysed customer support tickets to identify onboarding friction, contributing to a 30 percent improvement in reporting turnaround.\n\nI would bring analytical rigour, clear communication and a strong learning mindset to your graduate programme. Thank you for considering my application.\n\nYours faithfully,\nYuhan",
  evidenceUsed: [
    "Led a five-person university consulting project",
    "Built a weekly Excel dashboard",
    "Improved reporting turnaround by 30 percent"
  ],
  risks: ["Add company-specific motivation before submitting."]
};

export const sampleApplicationAnswer: ApplicationQuestionResponse = {
  answer:
    "In my MSc consulting project, our team needed to recommend a growth route for a local SME with limited customer insight. I was responsible for structuring the research plan, dividing work across five team members and synthesising survey and competitor findings. I created a simple segmentation framework, challenged assumptions during team reviews and converted the analysis into three practical recommendations. We presented the final proposal to the founder and university supervisor, receiving positive feedback for clarity and commercial practicality.",
  starBreakdown: {
    situation: "A local SME needed growth recommendations with limited customer insight.",
    task: "Structure the research and coordinate a five-person project team.",
    action: "Built a research plan, segmented findings, reviewed assumptions and synthesised recommendations.",
    result: "Presented a practical proposal and received positive feedback for clarity."
  },
  evidenceUsed: ["SME growth strategy project", "Five-person team leadership", "Founder presentation"],
  followUpPrep: ["Prepare the hardest trade-off in the project.", "Quantify the survey or research sample if available."]
};

export const sampleInterviewNotes: InterviewNote[] = [
  {
    id: "7b945f9d-f487-4c2f-89d1-555c8d8722e4",
    company: "Deloitte",
    role: "Graduate Consultant",
    noteType: "Previous Question",
    content: "Tell me about a time you changed someone's mind with data.",
    tags: ["consulting", "behavioural"]
  },
  {
    id: "c25f8dfb-fbb6-4013-82f9-25d07d09fb48",
    company: "Monzo",
    role: "Product Analyst Graduate",
    noteType: "Company Note",
    content: "Focus on customer-centric product decisions and regulated fintech context.",
    tags: ["product", "commercial awareness"]
  }
];
