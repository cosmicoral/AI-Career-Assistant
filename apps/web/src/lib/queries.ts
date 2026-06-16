import type {
  Application,
  ApplicationWorkspace,
  AssessmentCentreCase,
  AssessmentCentreSession,
  CareerProfile,
  InterviewNote,
  NetworkingAction,
  NetworkingContact,
  OnlineTestAttempt,
  OnlineTestResource,
  OnlineTestStudyPlan
} from "@careeros/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => apiFetch<Application[]>("/api/applications")
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<CareerProfile | null>("/api/profile")
  });
}

export function useInterviewNotes() {
  return useQuery({
    queryKey: ["interview-notes"],
    queryFn: () => apiFetch<InterviewNote[]>("/api/interview-notes")
  });
}

export function useApplicationWorkspace(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["application-workspace", applicationId],
    queryFn: () => apiFetch<ApplicationWorkspace>(`/api/applications/${applicationId}/workspace`),
    enabled: Boolean(applicationId)
  });
}

export function useNetworkingContacts(filters: { applicationId?: string; relationshipType?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);
  if (filters.relationshipType) params.set("relationshipType", filters.relationshipType);

  return useQuery({
    queryKey: ["networking-contacts", filters],
    queryFn: () => apiFetch<NetworkingContact[]>(`/api/networking/contacts${params.size ? `?${params}` : ""}`)
  });
}

export function useNetworkingActions(filters: { applicationId?: string; contactId?: string; status?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);
  if (filters.contactId) params.set("contactId", filters.contactId);
  if (filters.status) params.set("status", filters.status);

  return useQuery({
    queryKey: ["networking-actions", filters],
    queryFn: () => apiFetch<NetworkingAction[]>(`/api/networking/actions${params.size ? `?${params}` : ""}`)
  });
}

export function useAssessmentCentreCases(filters: { applicationId?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);

  return useQuery({
    queryKey: ["assessment-centre-cases", filters],
    queryFn: () => apiFetch<AssessmentCentreCase[]>(`/api/assessment-centre/cases${params.size ? `?${params}` : ""}`)
  });
}

export function useAssessmentCentreSessions(filters: { applicationId?: string; caseId?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);
  if (filters.caseId) params.set("caseId", filters.caseId);

  return useQuery({
    queryKey: ["assessment-centre-sessions", filters],
    queryFn: () => apiFetch<AssessmentCentreSession[]>(`/api/assessment-centre/sessions${params.size ? `?${params}` : ""}`)
  });
}

export function useOnlineTestResources() {
  return useQuery({
    queryKey: ["online-test-resources"],
    queryFn: () => apiFetch<OnlineTestResource[]>("/api/online-tests/resources")
  });
}

export function useOnlineTestAttempts(filters: { applicationId?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);

  return useQuery({
    queryKey: ["online-test-attempts", filters],
    queryFn: () => apiFetch<OnlineTestAttempt[]>(`/api/online-tests/attempts${params.size ? `?${params}` : ""}`)
  });
}

export function useOnlineTestStudyPlans(filters: { applicationId?: string } = {}) {
  const params = new URLSearchParams();

  if (filters.applicationId) params.set("applicationId", filters.applicationId);

  return useQuery({
    queryKey: ["online-test-study-plans", filters],
    queryFn: () => apiFetch<OnlineTestStudyPlan[]>(`/api/online-tests/study-plans${params.size ? `?${params}` : ""}`)
  });
}
