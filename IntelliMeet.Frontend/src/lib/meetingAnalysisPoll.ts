import type { MeetingDetail } from '../api/intellimeet';
import { imApi } from '../api/intellimeet';

/** MeetingProcessingStatus.AnalyzingTranscript */
const ANALYZING = 3;

/** Poll until the backend leaves the analyzing state (or timeout). */
export async function waitForMeetingNotAnalyzing(
  meetingId: string,
  maxWaitMs = 180_000,
  intervalMs = 2000
): Promise<MeetingDetail> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const d = await imApi.getMeeting(meetingId);
    if (d.processingStatus !== ANALYZING) return d;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return imApi.getMeeting(meetingId);
}
