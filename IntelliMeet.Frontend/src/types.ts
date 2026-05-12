export type TranscriptSegment = {
  speaker: string;
  text: string;
  start: number;
  end: number;
};

export type TranscriptResult = {
  fullText: string;
  segments: TranscriptSegment[];
};

export type ActionItem = {
  description: string;
  owner: string;
  dueDate: string | null;
  priority: string;
};

export type AnalysisResult = {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  keyTakeaways: string[];
};

export type MeetingAnalysisResponse = {
  transcript: TranscriptResult;
  analysis: AnalysisResult;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

/** Matches backend ProjectManagementPlatform */
export type PmPlatform = 1 | 2 | 3;

export type ApiActionItemRow = {
    id: string;
    title: string;
    description?: string | null;
    owner?: string | null;
    dueDate?: string | null;
    addToTodoChecked: boolean;
    externalTaskUrl?: string | null;
    syncedPlatform?: PmPlatform | null;
    assignedUserId?: string | null;
    suggestedAssigneeName?: string | null;
    suggestedAssigneeConfidence?: number | null;
};

export type MeetingBotRow = {
  id: string;
  externalBotId: string;
  status: number;
  transcriptionStatus: number;
  statusLabel?: string | null;
  transcriptionStatusLabel?: string | null;
};

export type MeetingDetailsProps = {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  keyTakeaways: string[];
  transcript: TranscriptResult;
  meetingTitle?: string;
  meetingDate?: string;
  onBack: () => void;
  /** When set, action items can be synced to To-Dos via API. */
  meetingIdForApi?: string | null;
  audioPlaybackUrl?: string | null;
  apiActionItems?: ApiActionItemRow[] | null;
  onConvertActionToTodo?: (actionItemId: string) => Promise<void>;
  /** Live meeting URL from Meeting BaaS / calendar sync. */
  meetingUrl?: string | null;
  meetingPlatform?: string | null;
  meetingBots?: MeetingBotRow[] | null;
  /** Backend MeetingProcessingStatus enum value when viewing an API meeting. */
  meetingProcessingStatus?: number | null;
  meetingLifecycleStatusLabel?: string | null;
  meetingProcessingStatusLabel?: string | null;
  meetingAnalysisError?: string | null;
  meetingTranscriptAnalysisCompleted?: boolean | null;
  /** Push action item to Asana (1), Jira (2), or Trello (3). */
  onPushActionToPm?: (actionItemId: string, platform: PmPlatform) => Promise<void>;
  /** Workspace members for assigning action items (admin only). */
  workspaceMembersForAssign?: { userId: string; displayName: string; email: string }[] | null;
  canAssignActionItems?: boolean;
  onAssignActionItemUser?: (actionItemId: string, assignedUserId: string | null) => Promise<void>;
};

