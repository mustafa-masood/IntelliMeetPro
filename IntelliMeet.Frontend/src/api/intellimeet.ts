import { DEMO_USER_ID } from '../config/demoUser';

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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
  status: number;
  startUtc?: string | null;
  endUtc?: string | null;
  primaryBotStatus?: string | null;
};

export type MeetingDetail = {
  id: string;
  title: string;
  platform?: string | null;
  meetingUrl: string;
  status: number;
  startUtc?: string | null;
  endUtc?: string | null;
  participants: string[];
  calendarEventId?: string | null;
  bots: { id: string; externalBotId: string; status: number; transcriptionStatus: number }[];
  audioPlaybackUrl?: string | null;
  recentWebhooks: { id: string; eventType: number; receivedAt: string; processed: boolean }[];
};

export type TranscriptDto = {
  meetingId: string;
  status: number;
  rawText?: string | null;
  externalTranscriptionUrl?: string | null;
  /** Diarization / raw transcription URL from Meeting BaaS */
  externalRawTranscriptionUrl?: string | null;
  segments: { speaker: string; startSeconds: number; endSeconds: number; text: string }[];
};

export type MeetingSummaryDto = {
  meetingId: string;
  shortSummary: string;
  structuredSections: string[];
  keyPoints: string[];
};

export type ActionItemDto = {
  id: string;
  title: string;
  description?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  priority: number;
  status: string;
  addToTodoChecked: boolean;
  linkedTodoItemId?: string | null;
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
  provider: number;
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

export type TodoItemDto = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  dueDate?: string | null;
  status: number;
  sourceMeetingId?: string | null;
  sourceActionItemId?: string | null;
};

export type ScheduleBotResponse = {
  externalBotId: string;
  meetingId?: string | null;
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
      body: JSON.stringify({ userId: DEMO_USER_ID }),
    }),
  upcomingMeetings: () => apiJson<UpcomingMeetingCard[]>('/api/dashboard/upcoming-meetings'),
  dashboardCalendar: () => apiJson<DashboardCalendarEntry[]>('/api/dashboard/calendar'),
  joinBot: (meetingUrl: string, botName: string) =>
    apiJson<BotJoinResponse>('/api/dashboard/bots/join', {
      method: 'POST',
      body: JSON.stringify({
        meetingUrl,
        botName,
        userId: DEMO_USER_ID,
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
  connectCalendar: (refreshToken: string, rawCalendarId: string) =>
    apiJson<CalendarConnection>('/api/calendars/connect', {
      method: 'POST',
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        provider: 0,
        oauthRefreshToken: refreshToken,
        rawCalendarId,
      }),
    }),
  listCalendarConnections: () => apiJson<CalendarConnection[]>('/api/calendars'),
  syncCalendar: (id: string) =>
    fetch(`/api/calendars/${id}/sync`, { method: 'POST' }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
    }),
  listCalendarEvents: (id: string) => apiJson<CalendarEventDto[]>(`/api/calendars/${id}/events`),
  scheduleCalendarBot: (calendarId: string, eventId: string, botName: string) =>
    apiJson<ScheduleBotResponse>(`/api/calendars/${calendarId}/schedule-bot`, {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        botName,
        recordingMode: 'speaker_view',
        allOccurrences: false,
      }),
    }),
  listTodos: () => apiJson<TodoItemDto[]>(`/api/todos?userId=${DEMO_USER_ID}`),
  patchTodo: (id: string, body: { status?: number }) =>
    apiJson<TodoItemDto>(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  /** Resolves transcript (incl. Meeting BaaS URLs), runs Groq, persists summary / key points / action items. */
  groqAnalyzeMeeting: (id: string) =>
    apiJson<{ ok: boolean }>(`/api/meetings/${id}/groq-analyze`, { method: 'POST' }),
};
