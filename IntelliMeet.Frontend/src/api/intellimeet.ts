import { DEMO_USER_ID } from '../config/demoUser';
import { isClerkConfigured } from '../config/clerk';

/** Default display name for Meeting BaaS bots (join + calendar schedule). */
export const NOTETAKER_BOT_NAME = 'IntelliMeet Pro Notetaker' as const;

// Mirrors backend enums in Domain/Enums for stable UI typing.
export type MeetingStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type BotOperationalStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type TranscriptStatus = 0 | 1 | 2 | 3 | 4;
export type MeetingProcessingStatus = 0 | 1 | 2 | 3 | 4 | 5;

let clerkBearerToken: string | null = null;

/** Populated from GET /api/onboarding/me; OAuth redirects cannot send Authorization headers. */
let cachedBackendUserId: string | null = null;

/** Called from Clerk auth bridge when the session token changes. */
export function setClerkBearerToken(token: string | null) {
  clerkBearerToken = token;
  if (!token) cachedBackendUserId = null;
}

/** Resolves the backend user id for Clerk SaaS (cached after onboarding/me). Demo mode uses the seeded GUID. */
export async function ensureBackendUserId(): Promise<string> {
  if (!isClerkConfigured()) return DEMO_USER_ID;
  if (cachedBackendUserId) return cachedBackendUserId;
  const me = await apiJson<OnboardingMeDto>('/api/onboarding/me');
  cachedBackendUserId = me.userId;
  return me.userId;
}

/** Full-page Google OAuth navigation (cannot attach Bearer). */
export function googleCalendarConnectUrl(backendUserId: string): string {
  return `/api/auth/google/connect?userId=${encodeURIComponent(backendUserId)}`;
}

/** Asana/Jira authorize redirect; must include the signed-in user's backend id in query string. */
export function pmIntegrationAuthUrl(platform: 'asana' | 'jira', backendUserId: string): string {
  return `/api/integrations/${platform}/auth?userId=${encodeURIComponent(backendUserId)}`;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...integrationHeaders(),
    ...((init?.headers as Record<string, string>) || {}),
  };
  const r = await fetch(path, { ...init, headers });
  const text = await r.text();
  if (!r.ok) {
    let msg = text || r.statusText;
    try {
      const j = JSON.parse(text) as Record<string, unknown>;
      const errs = j.errors as Record<string, string[]> | undefined;
      const firstField = errs && Object.values(errs).flat()[0];
      const code = typeof j.code === 'string' ? j.code : '';
      const message = typeof j.message === 'string' ? j.message : '';
      const errStr = typeof j.error === 'string' ? j.error : '';
      const blob = `${code} ${message} ${errStr} ${text}`;
      if (
        code === 'FST_ERR_CALENDAR_CONNECTION_ALREADY_EXISTS' ||
        blob.includes('FST_ERR_CALENDAR_CONNECTION_ALREADY_EXISTS') ||
        (blob.includes('already exists') && blob.includes('calendar'))
      ) {
        msg =
          'This Google account is already linked to Meeting BaaS. Open Calendar and use “Refresh connections”, then select the active calendar below.';
      } else {
        msg = message || errStr || (typeof j.title === 'string' && j.title) || firstField || msg;
        if (errStr && message && errStr !== message && message.length < 400) msg = `${errStr}: ${message}`;
      }
    } catch {
      /* use text */
    }
    throw new Error(msg);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export type MeetingListItem = {
  id: string;
  title: string;
  meetingUrl: string;
  status: MeetingStatus;
  startUtc?: string | null;
  endUtc?: string | null;
  primaryBotStatus?: string | null;
  primaryBotStatusLabel?: string | null;
  processingStatusLabel?: string | null;
};

export type MeetingDetail = {
  id: string;
  title: string;
  platform?: string | null;
  meetingUrl: string;
  status: MeetingStatus;
  startUtc?: string | null;
  endUtc?: string | null;
  participants: string[];
  calendarEventId?: string | null;
  bots: MeetingBotSummaryDto[];
  audioPlaybackUrl?: string | null;
  recentWebhooks: { id: string; eventType: number; receivedAt: string; processed: boolean }[];
  processingStatus: MeetingProcessingStatus;
  lifecycleStatusLabel?: string | null;
  processingStatusLabel?: string | null;
  transcriptAnalysisCompleted: boolean;
  analysisError?: string | null;
  ragIndexedAtUtc?: string | null;
  transcript: TranscriptDto;
  summary: MeetingSummaryDto;
  actionItems: ActionItemDto[];
};

export type TranscriptDto = {
  meetingId: string;
  status: TranscriptStatus;
  rawText?: string | null;
  externalTranscriptionUrl?: string | null;
  /** Diarization / raw transcription URL from Meeting BaaS */
  externalRawTranscriptionUrl?: string | null;
  segments: { speaker: string; startSeconds: number; endSeconds: number; text: string }[];
};

export type MeetingBotSummaryDto = {
  id: string;
  externalBotId: string;
  status: BotOperationalStatus;
  transcriptionStatus: TranscriptStatus;
  statusLabel?: string | null;
  transcriptionStatusLabel?: string | null;
};

export type MeetingSummaryDto = {
  meetingId: string;
  shortSummary: string;
  structuredSections: string[];
  keyPoints: string[];
  decisions?: string[];
  risks?: string[];
};

export type ActionItemDto = {
  id: string;
  title: string;
  description?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  priority: 0 | 1 | 2;
  status: string;
  addToTodoChecked: boolean;
  linkedTodoItemId?: string | null;
  externalTaskUrl?: string | null;
  /** ProjectManagementPlatform */
  syncedPlatform?: 1 | 2 | 3 | null;
  assignedUserId?: string | null;
  suggestedAssigneeName?: string | null;
  suggestedAssigneeConfidence?: number | null;
};

export type PmPlatform = 1 | 2 | 3;

export type IntegrationConnection = {
  platform: PmPlatform;
  connected: boolean;
  projectId?: string | null;
  boardId?: string | null;
  displayName?: string | null;
};

export type IntegrationSetupOption = {
  id: string;
  name: string;
  type: string;
};

export type PushActionItemResponse = {
  externalUrl?: string | null;
  platform: PmPlatform;
};

function integrationHeaders(): Record<string, string> {
  // In SaaS mode (Clerk), the backend identifies the user from the Bearer token via middleware.
  // The legacy demo header is only for local/dev flows when no Clerk token exists.
  if (clerkBearerToken) return { Authorization: `Bearer ${clerkBearerToken}` };
  return { 'X-IntelliMeet-User-Id': DEMO_USER_ID };
}

export type CalendarMbaasStatus = {
  isConnected: boolean;
  provider?: string | null;
  calendarId?: string | null;
  localConnectionId?: string | null;
};

export type WorkspaceMemberRole = 0 | 1;
export type WorkspacePlan = 0 | 1 | 2;

export type WorkspaceSummary = {
  workspaceId: string;
  name: string;
  plan: WorkspacePlan;
  members: { userId: string; email: string; displayName: string; role: WorkspaceMemberRole; teamId?: string | null; teamName?: string | null }[];
};

export type TeamRowDto = {
  id: string;
  name: string;
};

export type UsageSummaryDto = {
  currentPlan: string;
  subscriptionStatus: string;
  meetingsThisMonth: number;
  meetingsLimit: number;
  chatThisMonth: number;
  chatLimit: number;
};

export type CreateCheckoutSessionResponse = {
  sessionUrl: string;
};

export type ConfirmCheckoutSessionResponse = {
  ok: boolean;
};

export type OnboardingMeDto = {
  userId: string;
  needsPlanSelection: boolean;
  currentPlan: string;
  subscriptionStatus: string;
  workspaceId?: string | null;
  planEndDateUtc?: string | null;
  role?: string | null;
  teamId?: string | null;
};

export type BillingPlanPricesDto = {
  priceIdStarter: string;
  priceIdPro: string;
  priceIdPremium: string;
};

export type UpcomingMeetingCard = {
  meetingId: string;
  title: string;
  startUtc?: string | null;
  endUtc?: string | null;
  meetingUrl: string;
  botStatus: string;
  externalBotId?: string | null;
  calendarEventTitle?: string | null;
  calendarEventId?: string | null;
};

export type DashboardCalendarEntry = {
  calendarEventId?: string | null;
  calendarConnectionId?: string | null;
  title: string;
  startUtc: string;
  endUtc: string;
  meetingUrl?: string | null;
  hasScheduledBot: boolean;
};

export type BotJoinResponse = {
  meetingId: string;
  meetingBotId: string;
  externalBotId: string;
  status: string;
};

export type GoogleAuthConfig = {
  clientId: string;
  redirectUri: string;
  scope: string;
  authorizeUrl: string;
};

export type GoogleTokenResponse = {
  refreshToken?: string | null;
  accessToken?: string | null;
  expiresIn: number;
  email?: string | null;
};

export type RawCalendarItem = {
  id: string;
  name: string;
  email: string;
  isPrimary: boolean;
};

export type CalendarConnection = {
  id: string;
  userId: string;
  provider: 0 | 1;
  externalCalendarId: string;
  status: string;
  lastSyncedAt?: string | null;
  accountEmail?: string | null;
};

export type CalendarEventDto = {
  id: string;
  externalEventId: string;
  seriesId?: string | null;
  title: string;
  startUtc: string;
  endUtc: string;
  meetingUrl?: string | null;
  isRecurring: boolean;
  isCancelled: boolean;
  linkedMeetingId?: string | null;
};

export type CreateMeetingFromUiRequest = {
  title: string;
  startUtc: string;
  endUtc: string;
  attendees: string[];
  provider?: 'google' | 'outlook';
  /** Enterprise: optional workspace team id (validated server-side). */
  teamId?: string | null;
};

export type CreateMeetingFromUiResponse = {
  meetingId: string;
  calendarEventId?: string | null;
  googleCalendarEventId?: string | null;
  meetingUrl: string;
  botScheduled: boolean;
  botAlreadyScheduled: boolean;
};

export type CalendarMeetingListItem = {
  meetingId: string;
  title: string;
  startUtc?: string | null;
  endUtc?: string | null;
  meetingUrl?: string | null;
  botScheduled: boolean;
  botScheduledAtUtc?: string | null;
  calendarEventLink?: string | null;
  transcriptReady: boolean;
  isPast: boolean;
};

export type TodoItemDto = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  dueDate?: string | null;
  status: 0 | 1 | 2;
  sourceMeetingId?: string | null;
  sourceActionItemId?: string | null;
};

export type ScheduleBotResponse = {
  externalBotId: string;
  meetingId?: string | null;
};

export type RagContextChunk = {
  chunkId: string;
  text: string;
  score: number;
  meetingId?: string;
  meetingTitle?: string | null;
};

export type RagChatResponse = {
  answer: string;
  contextChunks: RagContextChunk[];
};

export type RagMeetingStats = {
  meetingId: string;
  ragIndexedAtUtc?: string | null;
  indexedChunkCount: number;
  topK: number;
  effectiveTopK: number;
  chunkSizeChars: number;
  chunkOverlapChars: number;
  minChunkSizeChars: number;
  maxChunkSizeChars: number;
  effectiveChunkSizeChars: number;
  effectiveOverlapChars: number;
  stepChars: number;
  enableIndexing: boolean;
  enableChat: boolean;
};

export const imApi = {
  listMeetings: () => apiJson<MeetingListItem[]>('/api/meetings'),
  getMeeting: (id: string) => apiJson<MeetingDetail>(`/api/meetings/${id}`),
  getTranscript: (id: string) => apiJson<TranscriptDto>(`/api/meetings/${id}/transcript`),
  getSummary: (id: string) => apiJson<MeetingSummaryDto>(`/api/meetings/${id}/summary`),
  getActionItems: (id: string) => apiJson<ActionItemDto[]>(`/api/meetings/${id}/action-items`),
  convertActionToTodo: (meetingId: string, actionItemId: string) =>
    apiJson<unknown>(`/api/meetings/${meetingId}/action-items/${actionItemId}/convert-to-todo`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  upcomingMeetings: () => apiJson<UpcomingMeetingCard[]>('/api/dashboard/upcoming-meetings'),
  dashboardCalendar: () => apiJson<DashboardCalendarEntry[]>('/api/dashboard/calendar'),
  joinBot: (meetingUrl: string, botName?: string | null) =>
    apiJson<BotJoinResponse>('/api/dashboard/bots/join', {
      method: 'POST',
      body: JSON.stringify({
        meetingUrl,
        ...(botName?.trim() ? { botName: botName.trim() } : {}),
        transcriptionEnabled: true,
      }),
    }),
  googleAuthConfig: () => apiJson<GoogleAuthConfig>('/api/auth/google/config'),
  exchangeGoogleCode: (code: string) =>
    apiJson<GoogleTokenResponse>('/api/auth/google/token', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  listRawCalendars: (refreshToken: string) =>
    apiJson<RawCalendarItem[]>('/api/calendars/google/list-raw', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  connectCalendar: async (refreshToken: string, rawCalendarId: string, accountEmail?: string | null) => {
    const userId = await ensureBackendUserId();
    return apiJson<CalendarConnection>('/api/calendars/connect', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        provider: 0,
        oauthRefreshToken: refreshToken,
        rawCalendarId,
        ...(accountEmail?.trim() ? { accountEmail: accountEmail.trim() } : {}),
      }),
    });
  },
  listCalendarConnections: () => apiJson<CalendarConnection[]>('/api/calendars'),
  calendarMbaasStatus: () => apiJson<CalendarMbaasStatus>('/api/calendar/status'),
  disconnectCalendar: async (id: string) => {
    const r = await fetch(`/api/calendars/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...integrationHeaders() },
    });
    if (!r.ok) throw new Error(await r.text().then((t) => t || r.statusText));
  },
  getWorkspace: () => apiJson<WorkspaceSummary>('/api/workspace'),
  listWorkspaceTeams: () => apiJson<TeamRowDto[]>('/api/workspace/teams'),
  createWorkspaceTeam: (name: string) =>
    apiJson<TeamRowDto>('/api/workspace/teams', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  inviteWorkspaceMember: (email: string, teamId?: string | null) =>
    apiJson<void>('/api/workspace/members/invite', {
      method: 'POST',
      body: JSON.stringify({ email, ...(teamId ? { teamId } : {}) }),
    }),
  assignWorkspaceMemberTeam: (userId: string, teamId?: string | null) =>
    apiJson<void>('/api/workspace/members/assign-team', {
      method: 'POST',
      body: JSON.stringify({ userId, teamId: teamId ?? null }),
    }),
  assignActionItemUser: (meetingId: string, actionItemId: string, assignedUserId: string | null) =>
    apiJson<ActionItemDto>(`/api/meetings/${meetingId}/action-items/${actionItemId}/assign-user`, {
      method: 'POST',
      body: JSON.stringify({ assignedUserId }),
    }),
  createCheckoutSession: (priceId: string) =>
    apiJson<CreateCheckoutSessionResponse>('/api/billing/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),
  confirmCheckoutSession: (sessionId: string) =>
    apiJson<ConfirmCheckoutSessionResponse>('/api/billing/confirm-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
  billingUsageSummary: () => apiJson<UsageSummaryDto>('/api/billing/usage-summary'),
  onboardingMe: async () => {
    const me = await apiJson<OnboardingMeDto>('/api/onboarding/me');
    if (me.userId) cachedBackendUserId = me.userId;
    return me;
  },
  setBasicPlan: () =>
    apiJson<{ ok: boolean }>('/api/onboarding/set-basic-plan', {
      method: 'POST',
      body: '{}',
    }),
  billingPlanPrices: () => apiJson<BillingPlanPricesDto>('/api/billing/plan-prices'),
  syncCalendar: async (id: string) => {
    const r = await fetch(`/api/calendars/${encodeURIComponent(id)}/sync`, {
      method: 'POST',
      headers: { ...integrationHeaders() },
    });
    if (!r.ok) throw new Error(r.statusText);
  },
  listCalendarEvents: (id: string) => apiJson<CalendarEventDto[]>(`/api/calendars/${id}/events`),
  scheduleCalendarBot: (calendarId: string, eventId: string, botName?: string | null) =>
    apiJson<ScheduleBotResponse>(`/api/calendars/${calendarId}/schedule-bot`, {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        ...(botName?.trim() ? { botName: botName.trim() } : {}),
        recordingMode: 'speaker_view',
        allOccurrences: false,
      }),
    }),
  createMeetingFromUi: (body: CreateMeetingFromUiRequest) =>
    apiJson<CreateMeetingFromUiResponse>('/api/meetings/create-from-ui', {
      method: 'POST',
      headers: integrationHeaders(),
      body: JSON.stringify(body),
    }),
  listUpcomingCalendarMeetings: () =>
    apiJson<CalendarMeetingListItem[]>('/api/meetings/upcoming-calendar', {
      headers: integrationHeaders(),
    }),
  listPastCalendarMeetings: () =>
    apiJson<CalendarMeetingListItem[]>('/api/meetings/past', {
      headers: integrationHeaders(),
    }),
  listTodos: async () => {
    const userId = await ensureBackendUserId();
    return apiJson<TodoItemDto[]>(`/api/todos?userId=${encodeURIComponent(userId)}`);
  },
  patchTodo: (id: string, body: { status?: 0 | 1 | 2 }) =>
    apiJson<TodoItemDto>(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  /** Resolves transcript (incl. Meeting BaaS URLs), runs Ollama, persists summary / key points / action items. */
  analyzeMeeting: (id: string, force?: boolean) =>
    apiJson<{ ok: boolean; status?: string }>(`/api/meetings/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ force: force ?? false }),
    }),
  ragMeetingStats: (meetingId: string) =>
    apiJson<RagMeetingStats>(`/api/rag/meetings/${meetingId}/stats`),
  ragMeetingChat: (meetingId: string, question: string) =>
    apiJson<RagChatResponse>(`/api/rag/meetings/${meetingId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  ragGlobalChat: (question: string) =>
    apiJson<RagChatResponse>(`/api/rag/chat`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  integrationsStatus: () =>
    apiJson<IntegrationConnection[]>('/api/integrations/status', { headers: integrationHeaders() }),
  getIntegrationSetup: (platform: 'asana' | 'jira' | 'trello') =>
    apiJson<IntegrationSetupOption[]>(`/api/integrations/${platform}/setup`, { headers: integrationHeaders() }),
  postIntegrationSetup: (platform: 'asana' | 'jira' | 'trello', body: { projectId?: string; boardId?: string }) =>
    apiJson<{ ok: boolean }>(`/api/integrations/${platform}/setup`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: integrationHeaders(),
    }),
  processTrelloToken: (token: string, userId: string) =>
    apiJson<{ ok: boolean }>('/api/integrations/trello/process-token', {
      method: 'POST',
      body: JSON.stringify({ token, userId }),
      headers: integrationHeaders(),
    }),
  disconnectPmIntegration: async (platform: 'asana' | 'jira' | 'trello') => {
    const r = await fetch(`/api/integrations/${platform}/connection`, {
      method: 'DELETE',
      headers: { ...integrationHeaders() },
    });
    if (!r.ok) throw new Error(await r.text().then((t) => t || r.statusText));
  },
  pushActionToAsana: (meetingId: string, actionItemId: string) =>
    apiJson<PushActionItemResponse>('/api/integrations/asana/push-action-item', {
      method: 'POST',
      body: JSON.stringify({ meetingId, actionItemId }),
      headers: integrationHeaders(),
    }),
  pushActionToJira: (meetingId: string, actionItemId: string) =>
    apiJson<PushActionItemResponse>('/api/integrations/jira/push-action-item', {
      method: 'POST',
      body: JSON.stringify({ meetingId, actionItemId }),
      headers: integrationHeaders(),
    }),
  pushActionToTrello: (meetingId: string, actionItemId: string) =>
    apiJson<PushActionItemResponse>('/api/integrations/trello/push-action-item', {
      method: 'POST',
      body: JSON.stringify({ meetingId, actionItemId }),
      headers: integrationHeaders(),
    }),
  trelloAuthorizeUrl: () => `/api/integrations/trello/auth`,
};
