import { useEffect, useState } from 'react';
import { imApi, type RagContextChunk, type RagMeetingStats } from '../api/intellimeet';

export default function MeetingAskAI({ meetingId }: { meetingId: string }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [contextChunks, setContextChunks] = useState<RagContextChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RagMeetingStats | null>(null);

  useEffect(() => {
    let active = true;
    imApi
      .ragMeetingStats(meetingId)
      .then((s) => {
        if (!active) return;
        setStats(s);
      })
      .catch(() => {
        if (!active) return;
        setStats(null);
      });
    return () => {
      active = false;
    };
  }, [meetingId]);

  const onAsk = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const s = stats ?? (await imApi.ragMeetingStats(meetingId));
      if (!s.enableIndexing) {
        setError('Transcript indexing is disabled on the server.');
        return;
      }
      const indexedKnown = !!s.ragIndexedAtUtc || s.indexedChunkCount > 0;
      if (!indexedKnown) {
        setError('Transcript indexing not yet complete.');
        return;
      }
      const res = await imApi.ragMeetingChat(meetingId, message.trim());
      setAnswer(res.answer);
      setContextChunks(res.contextChunks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AskAI failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {stats && (
        <p className="text-[11px] font-inter text-text-tertiary m-0">
          Indexed chunks: {stats.indexedChunkCount}
          {stats.ragIndexedAtUtc ? ` • indexed at ${new Date(stats.ragIndexedAtUtc).toLocaleString()}` : ''}
        </p>
      )}
      {error && <p className="text-sm text-red-500 m-0">{error}</p>}
      {answer && <p className="text-sm text-text-secondary whitespace-pre-wrap m-0">{answer}</p>}
      {contextChunks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-secondary m-0">Context used</p>
          {contextChunks.map((c) => (
            <div key={c.chunkId} className="text-xs border border-stroke-primary rounded-8 p-2">
              <div className="text-text-secondary">
                {c.chunkId} • score {c.score.toFixed(3)}
              </div>
              <div className="text-text-secondary line-clamp-3">{c.text}</div>
            </div>
          ))}
        </div>
      )}
      <div className="w-full bg-bg-surface-lv1 border border-stroke-primary rounded-10 px-3 py-2.5 flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about decisions, risks, or next steps…"
          className="flex-1 bg-transparent outline-none text-sm font-inter"
        />
        <button
          type="button"
          onClick={onAsk}
          disabled={loading || !message.trim()}
          className="text-primary-600 font-inter text-sm disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

