import type {
  ApplicationStatus,
  AssessmentCentreCaseType,
  NetworkingActionStatus,
  NetworkingActionType,
  OnlineTestProvider,
  RelationshipType
} from "@careeros/shared";

export const applicationStatuses: ApplicationStatus[] = [
  "Saved",
  "Drafting",
  "Applied",
  "Interview",
  "Assessment Centre",
  "Offer",
  "Rejected"
];

export const statusTone: Record<ApplicationStatus, string> = {
  Saved: "neutral",
  Drafting: "drafting",
  Applied: "applied",
  Interview: "interview",
  "Assessment Centre": "assessment",
  Offer: "offer",
  Rejected: "rejected"
};

export const relationshipTypes: RelationshipType[] = [
  "alumni",
  "recruiter",
  "hiring_manager",
  "employee",
  "founder",
  "mutual_connection",
  "unknown"
];

export const networkingActionTypes: NetworkingActionType[] = [
  "connect",
  "message",
  "follow_up",
  "coffee_chat",
  "referral_request",
  "thank_you"
];

export const networkingActionStatuses: NetworkingActionStatus[] = [
  "planned",
  "sent",
  "replied",
  "no_response",
  "completed"
];

export const assessmentCentreCaseTypes: AssessmentCentreCaseType[] = [
  "group_discussion",
  "case_study",
  "presentation",
  "role_play",
  "written_exercise",
  "in_tray"
];

export const onlineTestProviders: OnlineTestProvider[] = [
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
];
