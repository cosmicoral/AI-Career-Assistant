import type {
  Application,
  ApplicationCreate,
  ApplicationWorkspace,
  AssessmentCentreCase,
  AssessmentCentreCaseCreate,
  AssessmentCentreSession,
  AssessmentCentreSessionCreate,
  CareerProfile,
  GeneratedMaterial,
  GeneratedMaterialType,
  InterviewNote,
  InterviewNoteCreate,
  JobAnalysis,
  JobFitResponse,
  NetworkingAction,
  NetworkingActionCreate,
  NetworkingContact,
  NetworkingContactCreate,
  OnlineTestAttempt,
  OnlineTestAttemptCreate,
  OnlineTestResource,
  OnlineTestResourceCreate,
  OnlineTestStudyPlan,
  OnlineTestStudyPlanCreate
} from "@careeros/shared";
import {
  ApplicationSchema,
  ApplicationWorkspaceSchema,
  AssessmentCentreCaseSchema,
  AssessmentCentreSessionSchema,
  CareerProfileSchema,
  GeneratedMaterialSchema,
  InterviewNoteSchema,
  JobAnalysisSchema,
  NetworkingActionSchema,
  NetworkingContactSchema,
  OnlineTestAttemptSchema,
  OnlineTestResourceSchema,
  OnlineTestStudyPlanSchema
} from "@careeros/shared";
import { isSupabaseConfigured } from "../config/env";
import { getSupabaseAdmin } from "../config/supabase";
import {
  createLocalApplication,
  createLocalAssessmentCentreCase,
  createLocalAssessmentCentreSession,
  createLocalGeneratedMaterial,
  createLocalInterviewNote,
  createLocalJobAnalysis,
  createLocalNetworkingAction,
  createLocalNetworkingContact,
  createLocalOnlineTestAttempt,
  createLocalOnlineTestResource,
  createLocalOnlineTestStudyPlan,
  deleteLocalAssessmentCentreCase,
  deleteLocalApplication,
  getLocalApplication,
  getLocalApplicationWorkspace,
  getLocalAssessmentCentreCase,
  getLocalProfile,
  listLocalApplications,
  listLocalAssessmentCentreCases,
  listLocalAssessmentCentreSessions,
  listLocalInterviewNotes,
  listLocalNetworkingActions,
  listLocalNetworkingContacts,
  listLocalOnlineTestAttempts,
  listLocalOnlineTestResources,
  listLocalOnlineTestStudyPlans,
  updateLocalAssessmentCentreCase,
  updateLocalAssessmentCentreSession,
  updateLocalNetworkingAction,
  updateLocalNetworkingContact,
  updateLocalApplication,
  upsertLocalProfile
} from "./local-store";

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured) {
    return getLocalProfile(userId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("career_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? fromProfileRow(data) : null;
}

export async function saveProfile(userId: string, profile: CareerProfile) {
  if (!isSupabaseConfigured) {
    return upsertLocalProfile(userId, profile);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("career_profiles")
    .upsert(toProfileRow(userId, profile), { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return fromProfileRow(data);
}

export async function listApplications(userId: string) {
  if (!isSupabaseConfigured) {
    return listLocalApplications(userId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromApplicationRow);
}

export async function getApplication(userId: string, id: string) {
  if (!isSupabaseConfigured) {
    return getLocalApplication(userId, id);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? fromApplicationRow(data) : null;
}

export async function createApplication(userId: string, input: ApplicationCreate) {
  if (!isSupabaseConfigured) {
    return createLocalApplication(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .insert(toApplicationRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromApplicationRow(data);
}

export async function updateApplication(userId: string, id: string, input: ApplicationCreate) {
  if (!isSupabaseConfigured) {
    return updateLocalApplication(userId, id, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .update(toApplicationRow(userId, input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return fromApplicationRow(data);
}

export async function deleteApplication(userId: string, id: string) {
  if (!isSupabaseConfigured) {
    await deleteLocalApplication(userId, id);
    return;
  }

  const { error } = await getSupabaseAdmin().from("applications").delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}

export async function listInterviewNotes(
  userId: string,
  filters: {
    company?: string;
    applicationId?: string;
  }
) {
  if (!isSupabaseConfigured) {
    return listLocalInterviewNotes(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("interview_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.company) {
    query = query.ilike("company", `%${filters.company}%`);
  }

  if (filters.applicationId) {
    query = query.eq("source_application_id", filters.applicationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(fromInterviewNoteRow);
}

export async function createInterviewNote(userId: string, input: InterviewNoteCreate) {
  if (!isSupabaseConfigured) {
    return createLocalInterviewNote(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("interview_notes")
    .insert(toInterviewNoteRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromInterviewNoteRow(data);
}

export async function listNetworkingContacts(
  userId: string,
  filters: {
    applicationId?: string;
    relationshipType?: string;
  }
) {
  if (!isSupabaseConfigured) {
    return listLocalNetworkingContacts(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("networking_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.relationshipType) {
    query = query.eq("relationship_type", filters.relationshipType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(fromNetworkingContactRow);
}

export async function createNetworkingContact(userId: string, input: NetworkingContactCreate) {
  if (!isSupabaseConfigured) {
    return createLocalNetworkingContact(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("networking_contacts")
    .insert(toNetworkingContactRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromNetworkingContactRow(data);
}

export async function updateNetworkingContact(userId: string, id: string, input: NetworkingContactCreate) {
  if (!isSupabaseConfigured) {
    return updateLocalNetworkingContact(userId, id, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("networking_contacts")
    .update(toNetworkingContactRow(userId, input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return fromNetworkingContactRow(data);
}

export async function listNetworkingActions(
  userId: string,
  filters: {
    applicationId?: string;
    contactId?: string;
    status?: string;
  }
) {
  if (!isSupabaseConfigured) {
    return listLocalNetworkingActions(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("networking_actions")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.contactId) {
    query = query.eq("contact_id", filters.contactId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(fromNetworkingActionRow);
}

export async function createNetworkingAction(userId: string, input: NetworkingActionCreate) {
  if (!isSupabaseConfigured) {
    return createLocalNetworkingAction(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("networking_actions")
    .insert(toNetworkingActionRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromNetworkingActionRow(data);
}

export async function updateNetworkingAction(userId: string, id: string, input: NetworkingActionCreate) {
  if (!isSupabaseConfigured) {
    return updateLocalNetworkingAction(userId, id, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("networking_actions")
    .update(toNetworkingActionRow(userId, input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return fromNetworkingActionRow(data);
}

export async function listAssessmentCentreCases(userId: string, filters: { applicationId?: string }) {
  if (!isSupabaseConfigured) {
    return listLocalAssessmentCentreCases(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("assessment_centre_cases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.applicationId) query = query.eq("application_id", filters.applicationId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromAssessmentCentreCaseRow);
}

export async function getAssessmentCentreCase(userId: string, id: string) {
  if (!isSupabaseConfigured) {
    return getLocalAssessmentCentreCase(userId, id);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("assessment_centre_cases")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? fromAssessmentCentreCaseRow(data) : null;
}

export async function createAssessmentCentreCase(userId: string, input: AssessmentCentreCaseCreate) {
  if (!isSupabaseConfigured) {
    return createLocalAssessmentCentreCase(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("assessment_centre_cases")
    .insert(toAssessmentCentreCaseRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromAssessmentCentreCaseRow(data);
}

export async function updateAssessmentCentreCase(userId: string, id: string, input: AssessmentCentreCaseCreate) {
  if (!isSupabaseConfigured) {
    return updateLocalAssessmentCentreCase(userId, id, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("assessment_centre_cases")
    .update(toAssessmentCentreCaseRow(userId, input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return fromAssessmentCentreCaseRow(data);
}

export async function deleteAssessmentCentreCase(userId: string, id: string) {
  if (!isSupabaseConfigured) {
    await deleteLocalAssessmentCentreCase(userId, id);
    return;
  }

  const { error } = await getSupabaseAdmin()
    .from("assessment_centre_cases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listAssessmentCentreSessions(userId: string, filters: { applicationId?: string; caseId?: string }) {
  if (!isSupabaseConfigured) {
    return listLocalAssessmentCentreSessions(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("assessment_centre_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.applicationId) query = query.eq("application_id", filters.applicationId);
  if (filters.caseId) query = query.eq("case_id", filters.caseId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromAssessmentCentreSessionRow);
}

export async function createAssessmentCentreSession(userId: string, input: AssessmentCentreSessionCreate) {
  if (!isSupabaseConfigured) {
    return createLocalAssessmentCentreSession(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("assessment_centre_sessions")
    .insert(toAssessmentCentreSessionRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromAssessmentCentreSessionRow(data);
}

export async function updateAssessmentCentreSession(userId: string, id: string, input: AssessmentCentreSessionCreate) {
  if (!isSupabaseConfigured) {
    return updateLocalAssessmentCentreSession(userId, id, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("assessment_centre_sessions")
    .update(toAssessmentCentreSessionRow(userId, input))
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return fromAssessmentCentreSessionRow(data);
}

export async function listOnlineTestResources(userId: string) {
  if (!isSupabaseConfigured) {
    return listLocalOnlineTestResources(userId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("online_test_resources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromOnlineTestResourceRow);
}

export async function createOnlineTestResource(userId: string, input: OnlineTestResourceCreate) {
  if (!isSupabaseConfigured) {
    return createLocalOnlineTestResource(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("online_test_resources")
    .insert(toOnlineTestResourceRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromOnlineTestResourceRow(data);
}

export async function listOnlineTestAttempts(userId: string, filters: { applicationId?: string }) {
  if (!isSupabaseConfigured) {
    return listLocalOnlineTestAttempts(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("online_test_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("taken_at", { ascending: false, nullsFirst: false });

  if (filters.applicationId) query = query.eq("application_id", filters.applicationId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromOnlineTestAttemptRow);
}

export async function createOnlineTestAttempt(userId: string, input: OnlineTestAttemptCreate) {
  if (!isSupabaseConfigured) {
    return createLocalOnlineTestAttempt(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("online_test_attempts")
    .insert(toOnlineTestAttemptRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromOnlineTestAttemptRow(data);
}

export async function listOnlineTestStudyPlans(userId: string, filters: { applicationId?: string }) {
  if (!isSupabaseConfigured) {
    return listLocalOnlineTestStudyPlans(userId, filters);
  }

  let query = getSupabaseAdmin()
    .from("online_test_study_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.applicationId) query = query.eq("application_id", filters.applicationId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromOnlineTestStudyPlanRow);
}

export async function createOnlineTestStudyPlan(userId: string, input: OnlineTestStudyPlanCreate) {
  if (!isSupabaseConfigured) {
    return createLocalOnlineTestStudyPlan(userId, input);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("online_test_study_plans")
    .insert(toOnlineTestStudyPlanRow(userId, input))
    .select("*")
    .single();

  if (error) throw error;
  return fromOnlineTestStudyPlanRow(data);
}

export async function saveJobAnalysis(params: {
  userId: string;
  applicationId?: string;
  jobDescription: string;
  result: JobFitResponse;
}) {
  if (!isSupabaseConfigured) {
    return createLocalJobAnalysis(params);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("job_analyses")
    .insert({
      user_id: params.userId,
      application_id: params.applicationId ?? null,
      job_description: params.jobDescription,
      fit_score: params.result.fitScore,
      recommendation: params.result.recommendation,
      rationale: params.result.rationale,
      matching_skills: params.result.matchingSkills,
      missing_skills: params.result.missingSkills,
      transferable_experiences: params.result.transferableExperiences,
      red_flags: params.result.redFlags,
      action_plan: params.result.actionPlan,
      is_mock: params.result.isMock ?? false
    })
    .select("*")
    .single();

  if (error) throw error;

  if (params.applicationId) {
    const { error: updateError } = await getSupabaseAdmin()
      .from("applications")
      .update({
        fit_score: params.result.fitScore,
        job_description: params.jobDescription
      })
      .eq("id", params.applicationId)
      .eq("user_id", params.userId);

    if (updateError) throw updateError;
  }

  return fromJobAnalysisRow(data);
}

export async function saveGeneratedMaterial(params: {
  userId: string;
  applicationId?: string;
  materialType: GeneratedMaterialType;
  promptContext: Record<string, unknown>;
  output: unknown;
  isMock?: boolean;
}) {
  if (!isSupabaseConfigured) {
    return createLocalGeneratedMaterial(params);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("generated_materials")
    .insert({
      user_id: params.userId,
      application_id: params.applicationId ?? null,
      material_type: params.materialType,
      prompt_context: params.promptContext,
      output: params.output,
      is_mock: params.isMock ?? false
    })
    .select("*")
    .single();

  if (error) throw error;
  return fromGeneratedMaterialRow(data);
}

export async function getApplicationWorkspace(userId: string, id: string): Promise<ApplicationWorkspace> {
  if (!isSupabaseConfigured) {
    return ApplicationWorkspaceSchema.parse(await getLocalApplicationWorkspace(userId, id));
  }

  const application = await getApplication(userId, id);

  if (!application) {
    throw Object.assign(new Error("Application not found."), { statusCode: 404 });
  }

  const [
    { data: analysisRows, error: analysisError },
    { data: materialRows, error: materialError },
    { data: noteRows, error: noteError },
    { data: contactRows, error: contactError },
    { data: actionRows, error: actionError },
    { data: acCaseRows, error: acCaseError },
    { data: acSessionRows, error: acSessionError },
    { data: otAttemptRows, error: otAttemptError },
    { data: otStudyPlanRows, error: otStudyPlanError },
    { data: otResourceRows, error: otResourceError }
  ] =
    await Promise.all([
      getSupabaseAdmin()
        .from("job_analyses")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false })
        .limit(1),
      getSupabaseAdmin()
        .from("generated_materials")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("interview_notes")
        .select("*")
        .eq("user_id", userId)
        .eq("source_application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("networking_contacts")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("networking_actions")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("assessment_centre_cases")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("assessment_centre_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("online_test_attempts")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("taken_at", { ascending: false, nullsFirst: false }),
      getSupabaseAdmin()
        .from("online_test_study_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      getSupabaseAdmin()
        .from("online_test_resources")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ]);

  if (analysisError) throw analysisError;
  if (materialError) throw materialError;
  if (noteError) throw noteError;
  if (contactError) throw contactError;
  if (actionError) throw actionError;
  if (acCaseError) throw acCaseError;
  if (acSessionError) throw acSessionError;
  if (otAttemptError) throw otAttemptError;
  if (otStudyPlanError) throw otStudyPlanError;
  if (otResourceError) throw otResourceError;

  return ApplicationWorkspaceSchema.parse({
    application,
    latestFitAnalysis: analysisRows?.[0] ? fromJobAnalysisRow(analysisRows[0]) : null,
    generatedMaterials: (materialRows ?? []).map(fromGeneratedMaterialRow),
    interviewNotes: (noteRows ?? []).map(fromInterviewNoteRow),
    networkingContacts: (contactRows ?? []).map(fromNetworkingContactRow),
    networkingActions: (actionRows ?? []).map(fromNetworkingActionRow),
    assessmentCentreCases: (acCaseRows ?? []).map(fromAssessmentCentreCaseRow),
    assessmentCentreSessions: (acSessionRows ?? []).map(fromAssessmentCentreSessionRow),
    onlineTestAttempts: (otAttemptRows ?? []).map(fromOnlineTestAttemptRow),
    onlineTestStudyPlans: (otStudyPlanRows ?? []).map(fromOnlineTestStudyPlanRow),
    onlineTestResources: (otResourceRows ?? []).map(fromOnlineTestResourceRow)
  });
}

function toProfileRow(userId: string, profile: CareerProfile) {
  return {
    user_id: userId,
    headline: profile.headline ?? null,
    visa_status: profile.visaStatus ?? null,
    target_industries: profile.targetIndustries,
    target_locations: profile.targetLocations,
    preferred_roles: profile.preferredRoles,
    skills: profile.skills,
    achievements: profile.achievements,
    education: profile.education,
    experience: profile.experience,
    projects: profile.projects,
    master_cv: profile.masterCv ?? null,
    updated_at: new Date().toISOString()
  };
}

function fromProfileRow(row: Record<string, unknown>) {
  return CareerProfileSchema.parse({
    userId: row.user_id,
    headline: row.headline ?? undefined,
    visaStatus: row.visa_status ?? undefined,
    targetIndustries: row.target_industries ?? [],
    targetLocations: row.target_locations ?? [],
    preferredRoles: row.preferred_roles ?? [],
    skills: row.skills ?? [],
    achievements: row.achievements ?? [],
    education: row.education ?? [],
    experience: row.experience ?? [],
    projects: row.projects ?? [],
    masterCv: row.master_cv ?? undefined,
    updatedAt: row.updated_at ?? undefined
  });
}

function toApplicationRow(userId: string, application: ApplicationCreate) {
  return {
    user_id: userId,
    company: application.company,
    role: application.role,
    status: application.status,
    application_date: application.applicationDate ?? null,
    deadline: application.deadline ?? null,
    job_url: application.jobUrl ?? null,
    job_description: application.jobDescription ?? null,
    location: application.location ?? null,
    salary: application.salary ?? null,
    fit_score: application.fitScore ?? null,
    notes: application.notes ?? null
  };
}

function fromApplicationRow(row: Record<string, unknown>): Application {
  return ApplicationSchema.parse({
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    applicationDate: row.application_date,
    deadline: row.deadline,
    jobUrl: row.job_url,
    jobDescription: row.job_description,
    location: row.location,
    salary: row.salary,
    fitScore: row.fit_score,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toInterviewNoteRow(userId: string, note: InterviewNoteCreate) {
  return {
    user_id: userId,
    company: note.company,
    role: note.role ?? null,
    note_type: note.noteType,
    content: note.content,
    tags: note.tags,
    source_application_id: note.sourceApplicationId ?? null
  };
}

function fromInterviewNoteRow(row: Record<string, unknown>): InterviewNote {
  return InterviewNoteSchema.parse({
    id: row.id,
    company: row.company,
    role: row.role,
    noteType: row.note_type,
    content: row.content,
    tags: row.tags ?? [],
    sourceApplicationId: row.source_application_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function fromJobAnalysisRow(row: Record<string, unknown>): JobAnalysis {
  return JobAnalysisSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    jobDescription: row.job_description,
    fitScore: row.fit_score,
    recommendation: row.recommendation,
    rationale: row.rationale,
    matchingSkills: row.matching_skills ?? [],
    missingSkills: row.missing_skills ?? [],
    transferableExperiences: row.transferable_experiences ?? [],
    redFlags: row.red_flags ?? [],
    actionPlan: row.action_plan ?? [],
    isMock: row.is_mock,
    createdAt: row.created_at
  });
}

function fromGeneratedMaterialRow(row: Record<string, unknown>): GeneratedMaterial {
  return GeneratedMaterialSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    materialType: row.material_type,
    promptContext: row.prompt_context ?? {},
    output: row.output ?? {},
    isMock: row.is_mock,
    createdAt: row.created_at
  });
}

function toNetworkingContactRow(userId: string, contact: NetworkingContactCreate) {
  return {
    user_id: userId,
    application_id: contact.applicationId ?? null,
    company: contact.company,
    name: contact.name,
    title: contact.title,
    linkedin_url: contact.linkedinUrl ?? null,
    email: contact.email ?? null,
    relationship_type: contact.relationshipType,
    relevance_score: contact.relevanceScore ?? null,
    notes: contact.notes ?? null
  };
}

function fromNetworkingContactRow(row: Record<string, unknown>): NetworkingContact {
  return NetworkingContactSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    company: row.company,
    name: row.name,
    title: row.title,
    linkedinUrl: row.linkedin_url,
    email: row.email,
    relationshipType: row.relationship_type,
    relevanceScore: row.relevance_score,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toNetworkingActionRow(userId: string, action: NetworkingActionCreate) {
  return {
    user_id: userId,
    contact_id: action.contactId,
    application_id: action.applicationId ?? null,
    action_type: action.actionType,
    status: action.status,
    due_date: action.dueDate ?? null,
    message_draft: action.messageDraft ?? null,
    notes: action.notes ?? null
  };
}

function fromNetworkingActionRow(row: Record<string, unknown>): NetworkingAction {
  return NetworkingActionSchema.parse({
    id: row.id,
    contactId: row.contact_id,
    applicationId: row.application_id,
    actionType: row.action_type,
    status: row.status,
    dueDate: row.due_date,
    messageDraft: row.message_draft,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toAssessmentCentreCaseRow(userId: string, acCase: AssessmentCentreCaseCreate) {
  return {
    user_id: userId,
    application_id: acCase.applicationId ?? null,
    company: acCase.company,
    role: acCase.role,
    industry: acCase.industry,
    case_type: acCase.caseType,
    prompt: acCase.prompt,
    difficulty: acCase.difficulty ?? null,
    source_note: acCase.sourceNote ?? null,
    tags: acCase.tags
  };
}

function fromAssessmentCentreCaseRow(row: Record<string, unknown>): AssessmentCentreCase {
  return AssessmentCentreCaseSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    company: row.company,
    role: row.role,
    industry: row.industry,
    caseType: row.case_type,
    prompt: row.prompt,
    difficulty: row.difficulty,
    sourceNote: row.source_note,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toAssessmentCentreSessionRow(userId: string, session: AssessmentCentreSessionCreate) {
  return {
    user_id: userId,
    case_id: session.caseId,
    application_id: session.applicationId ?? null,
    session_type: session.sessionType,
    generated_agenda: session.generatedAgenda,
    stakeholder_map: session.stakeholderMap,
    suggested_arguments: session.suggestedArguments,
    opening_statement: session.openingStatement ?? null,
    final_recommendation: session.finalRecommendation ?? null,
    feedback_rubric: session.feedbackRubric,
    user_reflection: session.userReflection ?? null,
    score_self_assessed: session.scoreSelfAssessed ?? null,
    is_mock: session.isMock ?? false
  };
}

function fromAssessmentCentreSessionRow(row: Record<string, unknown>): AssessmentCentreSession {
  return AssessmentCentreSessionSchema.parse({
    id: row.id,
    caseId: row.case_id,
    applicationId: row.application_id,
    sessionType: row.session_type,
    generatedAgenda: row.generated_agenda ?? [],
    stakeholderMap: row.stakeholder_map ?? [],
    suggestedArguments: row.suggested_arguments ?? [],
    openingStatement: row.opening_statement,
    finalRecommendation: row.final_recommendation,
    feedbackRubric: row.feedback_rubric ?? [],
    userReflection: row.user_reflection,
    scoreSelfAssessed: row.score_self_assessed,
    isMock: row.is_mock,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toOnlineTestResourceRow(userId: string, resource: OnlineTestResourceCreate) {
  return {
    user_id: userId,
    provider: resource.provider,
    test_type: resource.testType,
    title: resource.title,
    url: resource.url ?? null,
    notes: resource.notes ?? null,
    is_official_resource: resource.isOfficialResource
  };
}

function fromOnlineTestResourceRow(row: Record<string, unknown>): OnlineTestResource {
  return OnlineTestResourceSchema.parse({
    id: row.id,
    provider: row.provider,
    testType: row.test_type,
    title: row.title,
    url: row.url,
    notes: row.notes,
    isOfficialResource: row.is_official_resource,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toOnlineTestAttemptRow(userId: string, attempt: OnlineTestAttemptCreate) {
  return {
    user_id: userId,
    application_id: attempt.applicationId ?? null,
    provider: attempt.provider,
    test_type: attempt.testType,
    score: attempt.score ?? null,
    percentile: attempt.percentile ?? null,
    time_spent_minutes: attempt.timeSpentMinutes ?? null,
    weak_areas: attempt.weakAreas,
    notes: attempt.notes ?? null,
    taken_at: attempt.takenAt ?? null
  };
}

function fromOnlineTestAttemptRow(row: Record<string, unknown>): OnlineTestAttempt {
  return OnlineTestAttemptSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    provider: row.provider,
    testType: row.test_type,
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    percentile: row.percentile === null || row.percentile === undefined ? null : Number(row.percentile),
    timeSpentMinutes: row.time_spent_minutes,
    weakAreas: row.weak_areas ?? [],
    notes: row.notes,
    takenAt: row.taken_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function toOnlineTestStudyPlanRow(userId: string, plan: OnlineTestStudyPlanCreate) {
  return {
    user_id: userId,
    application_id: plan.applicationId ?? null,
    provider: plan.provider,
    test_type: plan.testType,
    target_date: plan.targetDate ?? null,
    plan: plan.plan,
    priority_topics: plan.priorityTopics,
    is_mock: plan.isMock ?? false
  };
}

function fromOnlineTestStudyPlanRow(row: Record<string, unknown>): OnlineTestStudyPlan {
  return OnlineTestStudyPlanSchema.parse({
    id: row.id,
    applicationId: row.application_id,
    provider: row.provider,
    testType: row.test_type,
    targetDate: row.target_date,
    plan: row.plan ?? [],
    priorityTopics: row.priority_topics ?? [],
    isMock: row.is_mock,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}
