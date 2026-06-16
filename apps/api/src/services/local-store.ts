import type {
  Application,
  ApplicationCreate,
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
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type UserOwned<T> = T & {
  userId: string;
};

type LocalStore = {
  profiles: Record<string, CareerProfile>;
  applications: Array<UserOwned<Application>>;
  interviewNotes: Array<UserOwned<InterviewNote>>;
  jobAnalyses: Array<UserOwned<JobAnalysis>>;
  generatedMaterials: Array<UserOwned<GeneratedMaterial>>;
  networkingContacts: Array<UserOwned<NetworkingContact>>;
  networkingActions: Array<UserOwned<NetworkingAction>>;
  assessmentCentreCases: Array<UserOwned<AssessmentCentreCase>>;
  assessmentCentreSessions: Array<UserOwned<AssessmentCentreSession>>;
  onlineTestResources: Array<UserOwned<OnlineTestResource>>;
  onlineTestAttempts: Array<UserOwned<OnlineTestAttempt>>;
  onlineTestStudyPlans: Array<UserOwned<OnlineTestStudyPlan>>;
};

const storePath = path.resolve(process.cwd(), ".local-data", "store.json");

const emptyStore: LocalStore = {
  profiles: {},
  applications: [],
  interviewNotes: [],
  jobAnalyses: [],
  generatedMaterials: [],
  networkingContacts: [],
  networkingActions: [],
  assessmentCentreCases: [],
  assessmentCentreSessions: [],
  onlineTestResources: [],
  onlineTestAttempts: [],
  onlineTestStudyPlans: []
};

function normalizeStore(store: Partial<LocalStore>): LocalStore {
  return {
    profiles: store.profiles ?? {},
    applications: store.applications ?? [],
    interviewNotes: store.interviewNotes ?? [],
    jobAnalyses: store.jobAnalyses ?? [],
    generatedMaterials: store.generatedMaterials ?? [],
    networkingContacts: store.networkingContacts ?? [],
    networkingActions: store.networkingActions ?? [],
    assessmentCentreCases: store.assessmentCentreCases ?? [],
    assessmentCentreSessions: store.assessmentCentreSessions ?? [],
    onlineTestResources: store.onlineTestResources ?? [],
    onlineTestAttempts: store.onlineTestAttempts ?? [],
    onlineTestStudyPlans: store.onlineTestStudyPlans ?? []
  };
}

async function readStore(): Promise<LocalStore> {
  try {
    return normalizeStore(JSON.parse(await readFile(storePath, "utf8")) as Partial<LocalStore>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return structuredClone(emptyStore);
    }

    throw error;
  }
}

async function writeStore(store: LocalStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2));
}

function notFound(message: string) {
  return Object.assign(new Error(message), { statusCode: 404 });
}

export async function getLocalProfile(userId: string) {
  const store = await readStore();
  return store.profiles[userId] ?? null;
}

export async function upsertLocalProfile(userId: string, profile: CareerProfile) {
  const store = await readStore();
  const nextProfile: CareerProfile = {
    ...profile,
    userId,
    updatedAt: new Date().toISOString()
  };
  store.profiles[userId] = nextProfile;
  await writeStore(store);
  return nextProfile;
}

export async function listLocalApplications(userId: string) {
  const store = await readStore();
  return store.applications
    .filter((application) => application.userId === userId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function getLocalApplication(userId: string, id: string) {
  const store = await readStore();
  const application = store.applications.find((item) => item.userId === userId && item.id === id);
  return application ? stripUserId(application) : null;
}

export async function createLocalApplication(userId: string, input: ApplicationCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const application: UserOwned<Application> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.applications.unshift(application);
  await writeStore(store);
  return stripUserId(application);
}

export async function updateLocalApplication(userId: string, id: string, input: ApplicationCreate) {
  const store = await readStore();
  const index = store.applications.findIndex((item) => item.userId === userId && item.id === id);

  if (index < 0) {
    throw notFound("Application not found.");
  }

  const existing = store.applications[index]!;
  const application: UserOwned<Application> = {
    ...existing,
    ...input,
    id,
    userId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  store.applications[index] = application;
  await writeStore(store);
  return stripUserId(application);
}

export async function deleteLocalApplication(userId: string, id: string) {
  const store = await readStore();
  store.applications = store.applications.filter((item) => !(item.userId === userId && item.id === id));
  await writeStore(store);
}

export async function listLocalInterviewNotes(userId: string, filters: { company?: string; applicationId?: string }) {
  const store = await readStore();
  const company = filters.company?.toLowerCase();

  return store.interviewNotes
    .filter((note) => note.userId === userId)
    .filter((note) => (company ? note.company.toLowerCase().includes(company) : true))
    .filter((note) => (filters.applicationId ? note.sourceApplicationId === filters.applicationId : true))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalInterviewNote(userId: string, input: InterviewNoteCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const note: UserOwned<InterviewNote> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.interviewNotes.unshift(note);
  await writeStore(store);
  return stripUserId(note);
}

export async function createLocalJobAnalysis(params: {
  userId: string;
  applicationId?: string;
  jobDescription: string;
  result: JobFitResponse;
}) {
  const store = await readStore();
  const analysis: UserOwned<JobAnalysis> = {
    id: randomUUID(),
    userId: params.userId,
    applicationId: params.applicationId ?? null,
    jobDescription: params.jobDescription,
    fitScore: params.result.fitScore,
    recommendation: params.result.recommendation,
    rationale: params.result.rationale,
    matchingSkills: params.result.matchingSkills,
    missingSkills: params.result.missingSkills,
    transferableExperiences: params.result.transferableExperiences,
    redFlags: params.result.redFlags,
    actionPlan: params.result.actionPlan,
    isMock: params.result.isMock,
    createdAt: new Date().toISOString()
  };

  store.jobAnalyses.unshift(analysis);

  if (params.applicationId) {
    const application = store.applications.find(
      (item) => item.userId === params.userId && item.id === params.applicationId
    );

    if (application) {
      application.fitScore = params.result.fitScore;
      application.jobDescription = params.jobDescription;
      application.updatedAt = new Date().toISOString();
    }
  }

  await writeStore(store);
  return stripUserId(analysis);
}

export async function createLocalGeneratedMaterial(params: {
  userId: string;
  applicationId?: string;
  materialType: GeneratedMaterialType;
  promptContext: Record<string, unknown>;
  output: unknown;
  isMock?: boolean;
}) {
  const store = await readStore();
  const material: UserOwned<GeneratedMaterial> = {
    id: randomUUID(),
    userId: params.userId,
    applicationId: params.applicationId ?? null,
    materialType: params.materialType,
    promptContext: params.promptContext,
    output: params.output,
    isMock: params.isMock,
    createdAt: new Date().toISOString()
  };
  store.generatedMaterials.unshift(material);
  await writeStore(store);
  return stripUserId(material);
}

export async function listLocalNetworkingContacts(
  userId: string,
  filters: {
    applicationId?: string;
    relationshipType?: string;
  }
) {
  const store = await readStore();

  return store.networkingContacts
    .filter((contact) => contact.userId === userId)
    .filter((contact) => (filters.applicationId ? contact.applicationId === filters.applicationId : true))
    .filter((contact) => (filters.relationshipType ? contact.relationshipType === filters.relationshipType : true))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalNetworkingContact(userId: string, input: NetworkingContactCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const contact: UserOwned<NetworkingContact> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.networkingContacts.unshift(contact);
  await writeStore(store);
  return stripUserId(contact);
}

export async function updateLocalNetworkingContact(userId: string, id: string, input: NetworkingContactCreate) {
  const store = await readStore();
  const index = store.networkingContacts.findIndex((item) => item.userId === userId && item.id === id);

  if (index < 0) {
    throw notFound("Networking contact not found.");
  }

  const existing = store.networkingContacts[index]!;
  const contact: UserOwned<NetworkingContact> = {
    ...existing,
    ...input,
    id,
    userId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  store.networkingContacts[index] = contact;
  await writeStore(store);
  return stripUserId(contact);
}

export async function listLocalNetworkingActions(
  userId: string,
  filters: {
    applicationId?: string;
    contactId?: string;
    status?: string;
  }
) {
  const store = await readStore();

  return store.networkingActions
    .filter((action) => action.userId === userId)
    .filter((action) => (filters.applicationId ? action.applicationId === filters.applicationId : true))
    .filter((action) => (filters.contactId ? action.contactId === filters.contactId : true))
    .filter((action) => (filters.status ? action.status === filters.status : true))
    .sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"))
    .map(stripUserId);
}

export async function createLocalNetworkingAction(userId: string, input: NetworkingActionCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const action: UserOwned<NetworkingAction> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.networkingActions.unshift(action);
  await writeStore(store);
  return stripUserId(action);
}

export async function updateLocalNetworkingAction(userId: string, id: string, input: NetworkingActionCreate) {
  const store = await readStore();
  const index = store.networkingActions.findIndex((item) => item.userId === userId && item.id === id);

  if (index < 0) {
    throw notFound("Networking action not found.");
  }

  const existing = store.networkingActions[index]!;
  const action: UserOwned<NetworkingAction> = {
    ...existing,
    ...input,
    id,
    userId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  store.networkingActions[index] = action;
  await writeStore(store);
  return stripUserId(action);
}

export async function listLocalAssessmentCentreCases(userId: string, filters: { applicationId?: string }) {
  const store = await readStore();

  return store.assessmentCentreCases
    .filter((item) => item.userId === userId)
    .filter((item) => (filters.applicationId ? item.applicationId === filters.applicationId : true))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function getLocalAssessmentCentreCase(userId: string, id: string) {
  const store = await readStore();
  const acCase = store.assessmentCentreCases.find((item) => item.userId === userId && item.id === id);
  return acCase ? stripUserId(acCase) : null;
}

export async function createLocalAssessmentCentreCase(userId: string, input: AssessmentCentreCaseCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const acCase: UserOwned<AssessmentCentreCase> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.assessmentCentreCases.unshift(acCase);
  await writeStore(store);
  return stripUserId(acCase);
}

export async function updateLocalAssessmentCentreCase(userId: string, id: string, input: AssessmentCentreCaseCreate) {
  const store = await readStore();
  const index = store.assessmentCentreCases.findIndex((item) => item.userId === userId && item.id === id);

  if (index < 0) throw notFound("Assessment centre case not found.");

  const existing = store.assessmentCentreCases[index]!;
  const acCase: UserOwned<AssessmentCentreCase> = {
    ...existing,
    ...input,
    id,
    userId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  store.assessmentCentreCases[index] = acCase;
  await writeStore(store);
  return stripUserId(acCase);
}

export async function deleteLocalAssessmentCentreCase(userId: string, id: string) {
  const store = await readStore();
  store.assessmentCentreCases = store.assessmentCentreCases.filter((item) => !(item.userId === userId && item.id === id));
  store.assessmentCentreSessions = store.assessmentCentreSessions.filter((item) => !(item.userId === userId && item.caseId === id));
  await writeStore(store);
}

export async function listLocalAssessmentCentreSessions(userId: string, filters: { applicationId?: string; caseId?: string }) {
  const store = await readStore();

  return store.assessmentCentreSessions
    .filter((item) => item.userId === userId)
    .filter((item) => (filters.applicationId ? item.applicationId === filters.applicationId : true))
    .filter((item) => (filters.caseId ? item.caseId === filters.caseId : true))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalAssessmentCentreSession(userId: string, input: AssessmentCentreSessionCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const session: UserOwned<AssessmentCentreSession> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.assessmentCentreSessions.unshift(session);
  await writeStore(store);
  return stripUserId(session);
}

export async function updateLocalAssessmentCentreSession(userId: string, id: string, input: AssessmentCentreSessionCreate) {
  const store = await readStore();
  const index = store.assessmentCentreSessions.findIndex((item) => item.userId === userId && item.id === id);

  if (index < 0) throw notFound("Assessment centre session not found.");

  const existing = store.assessmentCentreSessions[index]!;
  const session: UserOwned<AssessmentCentreSession> = {
    ...existing,
    ...input,
    id,
    userId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };
  store.assessmentCentreSessions[index] = session;
  await writeStore(store);
  return stripUserId(session);
}

export async function listLocalOnlineTestResources(userId: string) {
  const store = await readStore();
  return store.onlineTestResources
    .filter((item) => item.userId === userId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalOnlineTestResource(userId: string, input: OnlineTestResourceCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const resource: UserOwned<OnlineTestResource> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.onlineTestResources.unshift(resource);
  await writeStore(store);
  return stripUserId(resource);
}

export async function listLocalOnlineTestAttempts(userId: string, filters: { applicationId?: string }) {
  const store = await readStore();
  return store.onlineTestAttempts
    .filter((item) => item.userId === userId)
    .filter((item) => (filters.applicationId ? item.applicationId === filters.applicationId : true))
    .sort((a, b) => (b.takenAt ?? b.createdAt ?? "").localeCompare(a.takenAt ?? a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalOnlineTestAttempt(userId: string, input: OnlineTestAttemptCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const attempt: UserOwned<OnlineTestAttempt> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.onlineTestAttempts.unshift(attempt);
  await writeStore(store);
  return stripUserId(attempt);
}

export async function listLocalOnlineTestStudyPlans(userId: string, filters: { applicationId?: string }) {
  const store = await readStore();
  return store.onlineTestStudyPlans
    .filter((item) => item.userId === userId)
    .filter((item) => (filters.applicationId ? item.applicationId === filters.applicationId : true))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
}

export async function createLocalOnlineTestStudyPlan(userId: string, input: OnlineTestStudyPlanCreate) {
  const store = await readStore();
  const now = new Date().toISOString();
  const plan: UserOwned<OnlineTestStudyPlan> = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now
  };
  store.onlineTestStudyPlans.unshift(plan);
  await writeStore(store);
  return stripUserId(plan);
}

export async function getLocalApplicationWorkspace(userId: string, id: string) {
  const application = await getLocalApplication(userId, id);

  if (!application) {
    throw notFound("Application not found.");
  }

  const store = await readStore();
  const generatedMaterials = store.generatedMaterials
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const latestFitAnalysis =
    store.jobAnalyses
      .filter((item) => item.userId === userId && item.applicationId === id)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .map(stripUserId)[0] ?? null;
  const interviewNotes = store.interviewNotes
    .filter((item) => item.userId === userId && item.sourceApplicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const networkingContacts = store.networkingContacts
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const networkingActions = store.networkingActions
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"))
    .map(stripUserId);
  const assessmentCentreCases = store.assessmentCentreCases
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const assessmentCentreSessions = store.assessmentCentreSessions
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const onlineTestAttempts = store.onlineTestAttempts
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.takenAt ?? b.createdAt ?? "").localeCompare(a.takenAt ?? a.createdAt ?? ""))
    .map(stripUserId);
  const onlineTestStudyPlans = store.onlineTestStudyPlans
    .filter((item) => item.userId === userId && item.applicationId === id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);
  const onlineTestResources = store.onlineTestResources
    .filter((item) => item.userId === userId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .map(stripUserId);

  return {
    application,
    latestFitAnalysis,
    generatedMaterials,
    interviewNotes,
    networkingContacts,
    networkingActions,
    assessmentCentreCases,
    assessmentCentreSessions,
    onlineTestAttempts,
    onlineTestStudyPlans,
    onlineTestResources
  };
}

function stripUserId<T extends { userId: string }>(item: T): Omit<T, "userId"> {
  const { userId: _userId, ...rest } = item;
  return rest;
}
