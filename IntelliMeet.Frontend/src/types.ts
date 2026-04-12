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

export type ApiActionItemRow = {
  id: string;
  title: string;
  description?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  addToTodoChecked: boolean;
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
};

