import type { ApplicationStatus } from "@careeros/shared";

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
