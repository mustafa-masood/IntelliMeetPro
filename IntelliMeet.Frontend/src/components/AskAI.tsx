import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { useSearchParams } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { imApi, type MeetingListItem, type RagContextChunk, type RagMeetingStats } from '../api/intellimeet';

const AskAI: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [contextChunks, setContextChunks] = useState<RagContextChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ragStats, setRagStats] = useState<RagMeetingStats | null>(null);

  const iconBtn =
    "p-1.5 hover:bg-bg-surface-lv1 rounded-md transition-colors cursor-pointer";
  const pinnedMeetingId = searchParams.get('meetingId')?.trim() ?? '';
  const isPinnedToMeeting = pinnedMeetingId.length > 0;

  useEffect(() => {
    if (!isPinnedToMeeting) {
      // Global AskAI mode doesn't need meeting list.
      setMeetings([]);
      setMeetingId('');
      return;
    }
    let active = true;
    imApi.listMeetings()
      .then((rows) => {
        if (!active) return;
        setMeetings(rows);
        if (isPinnedToMeeting) {
          const found = rows.some((m) => m.id === pinnedMeetingId);
          if (found) {
            setMeetingId(pinnedMeetingId);
          } else if (rows.length > 0) {
            setMeetingId(rows[0].id);
            setError('Requested meeting context was not found; using the latest meeting.');
          }
        } else if (rows.length > 0) {
          setMeetingId(rows[0].id);
        }
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load meetings');
      });
    return () => { active = false; };
  }, [isPinnedToMeeting, pinnedMeetingId]);

  useEffect(() => {
    if (!meetingId || !isPinnedToMeeting) {
      setRagStats(null);
      return;
    }
    let active = true;
    imApi
      .ragMeetingStats(meetingId)
      .then((s) => {
        if (!active) return;
        setRagStats(s);
      })
      .catch(() => {
        if (!active) return;
        setRagStats(null);
      });
    return () => {
      active = false;
    };
  }, [meetingId]);

  const selectedMeeting = useMemo(
    () => meetings.find((m) => m.id === meetingId) ?? null,
    [meetings, meetingId]
  );

  const onAsk = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isPinnedToMeeting) {
        if (!meetingId) {
          setError('Meeting context is missing.');
          return;
        }
        const stats = ragStats ?? (await imApi.ragMeetingStats(meetingId));
        if (!stats.enableIndexing) {
          setError('RAG indexing is disabled in server configuration (Rag:EnableIndexing).');
          return;
        }
        const indexedKnown = !!stats.ragIndexedAtUtc || stats.indexedChunkCount > 0;
        if (!indexedKnown) {
          setError('Transcript indexing not yet complete.');
          return;
        }
        res = await imApi.ragMeetingChat(meetingId, message.trim());
      } else {
        res = await imApi.ragGlobalChat(message.trim());
      }
      setAnswer(res.answer);
      setContextChunks(res.contextChunks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'RAG chat failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-0 md:ml-[270px] flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-0 bg-bg-surface-pure overflow-hidden">

          {/* Header */}
          <div className="bg-bg-surface-lv1 border-b border-stroke-primary px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex flex-col gap-1">
              <h1 className="font-inter-tight font-medium text-2xl text-text-primary m-0">
                Chat with IntelliMeet AI
              </h1>
              <p className="text-sm text-text-secondary m-0">
                {isPinnedToMeeting ? 'Ask grounded questions about this meeting transcript' : 'Ask across all meetings'}
              </p>
            </div>
            <button
              className={`${iconBtn} border border-stroke-primary`}
              onClick={() => {
                setAnswer('');
                setContextChunks([]);
                setError(null);
              }}
              title="Reset current answer"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-10 lg:px-20 xl:px-32 py-8 flex flex-col items-center gap-4">
            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  im
                </div>
                <span className="text-sm text-text-secondary">IntelliMeet AI</span>
              </div>

              {isPinnedToMeeting ? (
                <p className="text-sm text-text-secondary m-0">
                  Meeting context locked from details page.
                </p>
              ) : (
                <p className="text-sm text-text-secondary m-0">
                  Global mode: answers are grounded across indexed meetings.
                </p>
              )}
              <p className="text-xs text-text-secondary">
                Powered by Voyage + Pinecone
                {selectedMeeting ? ` • ${selectedMeeting.title}` : ''}
              </p>
              {isPinnedToMeeting && ragStats && (
                <p className="text-xs text-text-secondary m-0">
                  Indexed chunks: {ragStats.indexedChunkCount}
                  {ragStats.indexedChunkCount <= 0 && ragStats.enableIndexing && !ragStats.ragIndexedAtUtc
                    ? ' — Transcript indexing not yet complete.'
                    : ''}
                  {ragStats.ragIndexedAtUtc
                    ? ` — Indexed at ${new Date(ragStats.ragIndexedAtUtc).toLocaleString()}`
                    : ''}
                  {!ragStats.enableIndexing ? ' — RAG indexing is off in configuration.' : ''}
                </p>
              )}
            </div>

            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  im
                </div>
                <span className="text-sm text-text-secondary">IntelliMeet AI</span>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {!error && !answer && (
                <p className="text-sm text-text-secondary">Ask a question to get a grounded answer from this meeting transcript.</p>
              )}
              {answer && <p className="text-sm text-text-secondary whitespace-pre-wrap">{answer}</p>}
              {contextChunks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-text-secondary">Context used</p>
                  {contextChunks.map((c) => (
                    <div key={c.chunkId} className="text-xs border border-stroke-primary rounded-8 p-2">
                      <div className="text-text-secondary">
                        {c.meetingTitle ? `${c.meetingTitle} • ` : ''}
                        {c.chunkId} • score {c.score.toFixed(3)}
                      </div>
                      <div className="text-text-secondary line-clamp-3">{c.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-stroke-primary px-4 md:px-10 lg:px-20 xl:px-32 py-4 shrink-0">
            <div className="border border-stroke-primary rounded-8 p-2 flex items-center justify-between">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask IntelliMeet anything"
                className="flex-1 bg-transparent outline-none text-sm px-2"
              />

              <div className="flex gap-2">
                <button
                  className={iconBtn}
                  onClick={onAsk}
                  disabled={(isPinnedToMeeting && !meetingId) || !message.trim() || loading}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AskAI;