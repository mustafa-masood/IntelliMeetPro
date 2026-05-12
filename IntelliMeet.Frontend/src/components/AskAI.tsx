import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { useSearchParams } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  imApi,
  type MeetingListItem,
  type RagContextChunk,
  type RagMeetingStats
} from '../api/intellimeet';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contextChunks?: RagContextChunk[];
};
const demoMessages: ChatMessage[] = [
  {
    id: 'demo-user-1',
    role: 'user',
    content: 'What were the key decisions from yesterday’s meeting?'
  },
  {
    id: 'demo-ai-1',
    role: 'assistant',
    content:
      'The team finalized the onboarding workflow, approved the UI redesign for the dashboard, and decided to move deployment to Friday.'
  },
  {
    id: 'demo-user-2',
    role: 'user',
    content: 'Were there any action items assigned?'
  },
  {
    id: 'demo-ai-2',
    role: 'assistant',
    content:
      'Yes. Sarah will prepare the onboarding documentation by Thursday, and David will review the API integration before deployment.'
  }
];


const AskAI: React.FC = () => {
    const [showDemo, setShowDemo] = useState(true);
  const [searchParams] = useSearchParams();
const [message, setMessage] = useState('');
const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  // const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragStats, setRagStats] = useState<RagMeetingStats | null>(null);


  const iconBtn =
    "p-1.5 hover:bg-bg-surface-lv1 rounded-md transition-colors cursor-pointer";

  const pinnedMeetingId = searchParams.get('meetingId')?.trim() ?? '';
  const isPinnedToMeeting = pinnedMeetingId.length > 0;

  useEffect(() => {
    if (!isPinnedToMeeting) {
      setMeetings([]);
      setMeetingId('');
      return;
    }

    let active = true;

    imApi.listMeetings()
      .then((rows) => {
        if (!active) return;

        setMeetings(rows);

        const found = rows.some((m) => m.id === pinnedMeetingId);

        if (found) {
          setMeetingId(pinnedMeetingId);
        } else if (rows.length > 0) {
          setMeetingId(rows[0].id);
        }
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load meetings');
      });

    return () => {
      active = false;
    };
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

  const userMessage = message.trim();

  // 1. first time user sends message → remove demo
  if (showDemo) {
    setShowDemo(false);
    setMessages([]);
  }

  // 2. append user message
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage
    }
  ]);

  setMessage('');
  setLoading(true);
  setError(null);

  try {
    let res;

    if (isPinnedToMeeting) {
      if (!meetingId) {
        setError('Meeting context is missing.');
        return;
      }

      const stats =
        ragStats ?? (await imApi.ragMeetingStats(meetingId));

      if (!stats.enableIndexing) {
        setError('RAG indexing is disabled in server configuration.');
        return;
      }

      res = await imApi.ragMeetingChat(meetingId, userMessage);
    } else {
      res = await imApi.ragGlobalChat(userMessage);
    }

    // 3. append AI response
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer,
        contextChunks: res.contextChunks ?? []
      }
    ]);
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

        {/* Header */}
        <div className="bg-bg-surface-lv1 border-b border-stroke-primary px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-inter-tight font-medium text-2xl text-text-primary">
              Chat with IntelliMeet AI
            </h1>

            <p className="text-sm text-text-secondary">
              {isPinnedToMeeting
                ? 'Ask grounded questions about this meeting transcript'
                : 'Ask across all meetings'}
            </p>
          </div>

          <button
            className={`${iconBtn} border border-stroke-primary`}
         onClick={() => {
  setShowDemo(true);
  setMessages(demoMessages);
  setError(null);
}}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-20 xl:px-32 py-8 flex flex-col items-center gap-4">
{/* 
          {messages.length === 0 && (
            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4">
              <p className="text-sm text-text-secondary">
                Ask a question to start chatting.
              </p>
            </div>
          )} */}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`w-full max-w-[806px] flex ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-12 p-4 border ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-bg-surface-pure border-stroke-primary'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {msg.content}
                </p>

                {msg.role === 'assistant' &&
                  msg.contextChunks &&
                  msg.contextChunks.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      <p className="text-xs text-text-secondary">
                        Context used
                      </p>

                      {msg.contextChunks.map((c) => (
                        <div
                          key={c.chunkId}
                          className="text-xs border border-stroke-primary rounded-8 p-2"
                        >
                          <div className="text-text-secondary">
                            {c.meetingTitle
                              ? `${c.meetingTitle} • `
                              : ''}
                            {c.chunkId} • score {c.score.toFixed(3)}
                          </div>

                          <div className="text-text-secondary line-clamp-3">
                            {c.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full max-w-[806px] text-sm text-text-secondary">
              IntelliMeet AI is thinking...
            </div>
          )}

          {error && (
            <div className="w-full max-w-[806px] text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-stroke-primary px-4 md:px-10 lg:px-20 xl:px-32 py-4 shrink-0">
          <div className="border border-stroke-primary rounded-8 p-2 flex items-center justify-between">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAsk();
                }
              }}
              placeholder="Ask IntelliMeet anything"
              className="flex-1 bg-transparent outline-none text-sm px-2"
            />

            <button
              className={iconBtn}
              onClick={onAsk}
              disabled={
                (isPinnedToMeeting && !meetingId) ||
                !message.trim() ||
                loading
              }
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AskAI;