import { imApi, type MeetingDetail } from '../api/intellimeet';

const TTL_MS = 45_000;
const store = new Map<string, { detail: MeetingDetail; at: number }>();

export function invalidateMeetingDetailCache(meetingId: string): void {
  store.delete(meetingId);
}

/** Returns a cached meeting detail when fresh; always refetches when bypassCache is true. */
export async function getMeetingDetailCached(
  meetingId: string,
  bypassCache = false
): Promise<MeetingDetail> {
  if (!bypassCache) {
    const hit = store.get(meetingId);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.detail;
  }
  const d = await imApi.getMeeting(meetingId);
  store.set(meetingId, { detail: d, at: Date.now() });
  return d;
}
