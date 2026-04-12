import React, { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import TeamCreationSidebar from './TeamCreationSidebar';
import type { MeetingDetailsProps } from '../types';

const BOT_STATUS: Record<number, string> = {
    0: 'Unknown',
    1: 'Queued',
    2: 'Joining',
    3: 'Waiting room',
    4: 'In call',
    5: 'Recording',
    6: 'Paused',
    7: 'Resumed',
    8: 'Transcribing',
    9: 'Completed',
    10: 'Failed',
    11: 'Scheduled',
    12: 'Removed',
};

const TX_STATUS: Record<number, string> = {
    0: 'None',
    1: 'Pending',
    2: 'Processing',
    3: 'Ready',
    4: 'Failed',
};

const MeetingDetails: React.FC<MeetingDetailsProps> = ({
    summary = '',
    keyPoints = [],
    actionItems = [],
    keyTakeaways = [],
    transcript,
    meetingTitle = 'Meeting Details',
    meetingDate,
    onBack,
    meetingIdForApi = null,
    audioPlaybackUrl = null,
    apiActionItems = null,
    onConvertActionToTodo,
    meetingUrl = null,
    meetingPlatform = null,
    meetingBots = null,
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'transcription'>('summary');
    const [convertingId, setConvertingId] = useState<string | null>(null);
    const [transcriptQuery, setTranscriptQuery] = useState('');

    const safeTranscript = transcript || { fullText: '', segments: [] };

    const rawFullText = (safeTranscript.fullText ?? '').trim();
    const hasSegmentList = (safeTranscript.segments?.length ?? 0) > 0;
    const showPlainTranscriptOnly = rawFullText.length > 0 && !hasSegmentList;

    const filteredSegments = useMemo(() => {
        const segs = safeTranscript.segments || [];
        const q = transcriptQuery.trim().toLowerCase();
        if (!q) return segs;
        return segs.filter(
            (s) =>
                s.text.toLowerCase().includes(q) ||
                (s.speaker && s.speaker.toLowerCase().includes(q))
        );
    }, [safeTranscript.segments, transcriptQuery]);

    const plainTranscriptVisible = useMemo(() => {
        if (!showPlainTranscriptOnly) return '';
        const q = transcriptQuery.trim().toLowerCase();
        if (!q) return rawFullText;
        return rawFullText.toLowerCase().includes(q) ? rawFullText : '';
    }, [showPlainTranscriptOnly, rawFullText, transcriptQuery]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getInitials = (speaker: string): string =>
        speaker
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

    const getAvatarColor = (speaker: string): string => {
        const colors = ['#3c91e6', '#fdeee7', '#16a34a', '#ea580c', '#8B5CF6'];
        const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="flex min-h-screen w-full bg-bg-surface-lv1 overflow-x-hidden">
            <Sidebar />

            <div className="ml-0 lg:ml-[270px] mr-0 xl:mr-[190px] flex-1 flex flex-col min-h-screen overflow-hidden relative">
                <div className="bg-bg-surface-pure/90 backdrop-blur-md border-b border-stroke-primary px-4 sm:px-8 py-3 flex items-center sticky top-0 z-[100]">
                    <SearchBar placeholder="Search in workspace…" />
                </div>

                <div className="px-4 sm:px-8 pt-4 flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Back to meetings"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path
                                d="M12.5 5L7.5 10L12.5 15"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <span className="font-inter font-medium text-sm text-text-primary">
                        Meetings <span className="text-text-tertiary">/</span> {meetingTitle}
                    </span>
                </div>

                {meetingUrl && (
                    <div className="px-4 sm:px-8 pt-4">
                        <div className="rounded-16 border border-stroke-primary bg-gradient-to-r from-bg-surface-pure to-primary-50/30 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-inter font-semibold uppercase tracking-wider text-text-tertiary m-0 mb-1">
                                    Meeting link · Meeting BaaS
                                </p>
                                <p className="font-inter font-medium text-text-primary m-0 truncate text-sm sm:text-base">
                                    {meetingUrl}
                                </p>
                                {meetingPlatform && (
                                    <span className="inline-block mt-2 text-[11px] font-inter font-medium px-2 py-0.5 rounded-8 bg-bg-surface-lv1 text-text-secondary border border-stroke-primary">
                                        {meetingPlatform}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <a
                                    href={meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-10 bg-primary-500 text-white text-sm font-inter font-semibold hover:opacity-95 text-center"
                                >
                                    Join meeting
                                </a>
                                <button
                                    type="button"
                                    onClick={() => void navigator.clipboard.writeText(meetingUrl)}
                                    className="px-4 py-2 rounded-10 border border-stroke-secondary bg-bg-surface-pure text-sm font-inter font-medium text-text-primary hover:bg-bg-surface-lv1"
                                >
                                    Copy link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {meetingBots && meetingBots.length > 0 && (
                    <div className="px-4 sm:px-8 pt-3">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-inter font-medium text-text-secondary">Notetaker bots</span>
                            {meetingBots.map((b) => (
                                <div
                                    key={b.id}
                                    className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-10 border border-stroke-primary bg-bg-surface-pure text-xs font-inter"
                                >
                                    <span className="text-text-tertiary truncate max-w-[140px]" title={b.externalBotId}>
                                        {b.externalBotId.slice(0, 10)}…
                                    </span>
                                    <span className="text-primary-500 font-medium">{BOT_STATUS[b.status] ?? `Status ${b.status}`}</span>
                                    <span className="text-text-tertiary">·</span>
                                    <span className="text-text-secondary">{TX_STATUS[b.transcriptionStatus] ?? 'Tx'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 sm:px-8 pt-4">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-1 sm:p-2 flex gap-1 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 py-2 rounded-10 text-sm font-inter font-medium transition-all ${
                                activeTab === 'summary'
                                    ? 'bg-bg-surface-lv1 text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Summary
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('transcription')}
                            className={`px-4 py-2 rounded-10 text-sm font-inter font-medium transition-all ${
                                activeTab === 'transcription'
                                    ? 'bg-bg-surface-lv1 text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Transcription
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden px-4 sm:px-8 py-4 flex flex-col xl:flex-row gap-0 min-h-0">
                    <div className="flex-1 bg-bg-surface-pure border border-stroke-primary xl:border-r-0 rounded-tl-12 rounded-tr-12 xl:rounded-tr-none rounded-bl-12 flex flex-col overflow-hidden min-h-[320px] xl:min-h-0">
                        {activeTab === 'summary' && (
                            <div className="p-5 border-b border-stroke-primary bg-bg-surface-pure">
                                <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary tracking-tight m-0 mb-2">
                                    {meetingTitle}
                                </h1>
                                {meetingDate && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-medium text-sm bg-primary-500">
                                            {meetingTitle.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-inter text-sm text-text-secondary">{meetingDate}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-5">
                            {activeTab === 'summary' ? (
                                <div className="flex flex-col gap-6 max-w-2xl">
                                    <div>
                                        <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-2">Overview</h2>
                                        <p className="font-inter text-base leading-7 text-text-secondary m-0">
                                            {summary?.trim()
                                                ? summary
                                                : 'No summary yet. It will appear after Groq analysis runs (when transcript text is available), or open a meeting that already has notes in the system.'}
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-2">Key points</h2>
                                        {keyPoints.length > 0 ? (
                                            <ul className="list-none space-y-2 m-0 pl-0">
                                                {keyPoints.map((point, index) => (
                                                    <li
                                                        key={index}
                                                        className="font-inter text-base leading-7 text-text-secondary pl-4 border-l-2 border-primary-500/40"
                                                    >
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="font-inter text-sm text-text-secondary m-0">
                                                No key points yet. They are filled when Groq analysis completes successfully.
                                            </p>
                                        )}
                                    </div>

                                    {keyTakeaways.length > 0 && (
                                        <div>
                                            <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-2">Takeaways</h2>
                                            <ul className="list-none space-y-2 m-0 pl-0">
                                                {keyTakeaways.map((takeaway, index) => (
                                                    <li
                                                        key={index}
                                                        className="font-inter text-base leading-7 text-text-secondary pl-4 border-l-2 border-stroke-secondary"
                                                    >
                                                        {takeaway}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {meetingIdForApi && onConvertActionToTodo ? (
                                        <div>
                                            <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-2">Action items</h2>
                                            {apiActionItems && apiActionItems.length > 0 ? (
                                                <ul className="space-y-3 m-0 pl-0 list-none">
                                                    {apiActionItems.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="rounded-12 border border-stroke-primary p-3 bg-bg-surface-lv1/40"
                                                        >
                                                            <label className="flex items-start gap-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="mt-1 w-4 h-4 accent-primary-500"
                                                                    disabled={item.addToTodoChecked || convertingId === item.id}
                                                                    checked={item.addToTodoChecked}
                                                                    onChange={async () => {
                                                                        if (item.addToTodoChecked) return;
                                                                        setConvertingId(item.id);
                                                                        try {
                                                                            await onConvertActionToTodo(item.id);
                                                                        } finally {
                                                                            setConvertingId(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="font-inter text-sm leading-6 text-text-secondary">
                                                                    <span className="font-semibold text-text-primary">{item.title}</span>
                                                                    {item.description ? ` — ${item.description}` : ''}{' '}
                                                                    {item.owner && (
                                                                        <span className="text-text-tertiary">({item.owner})</span>
                                                                    )}{' '}
                                                                    {item.dueDate && (
                                                                        <span className="text-text-tertiary">Due {item.dueDate}</span>
                                                                    )}
                                                                    {item.addToTodoChecked && (
                                                                        <span className="text-primary-500 text-sm ml-1">· In To-Dos</span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="font-inter text-sm text-text-secondary m-0">
                                                    No action items yet. They appear when the pipeline extracts tasks from the transcript.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        actionItems.length > 0 && (
                                            <div>
                                                <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-2">Action items</h2>
                                                <ol className="list-decimal list-inside space-y-2 font-inter text-sm text-text-secondary">
                                                    {actionItems.map((item, index) => (
                                                        <li key={index}>
                                                            {item.description}{' '}
                                                            {item.owner && `(Owner: ${item.owner})`}{' '}
                                                            {item.dueDate && `(Due: ${item.dueDate})`}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-full max-w-3xl">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <h2 className="font-inter font-semibold text-base text-text-primary m-0">Transcript</h2>
                                        <span className="text-xs text-text-tertiary font-inter">
                                            {showPlainTranscriptOnly
                                                ? 'Plain text'
                                                : `${filteredSegments.length} segment${filteredSegments.length === 1 ? '' : 's'}`}
                                        </span>
                                    </div>

                                    <div className="bg-bg-surface-lv1 border border-stroke-primary rounded-10 px-3 py-2 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                                            <path
                                                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                                                stroke="#2b3d39"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M14 14L11.1 11.1"
                                                stroke="#2b3d39"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <input
                                            type="search"
                                            value={transcriptQuery}
                                            onChange={(e) => setTranscriptQuery(e.target.value)}
                                            className="flex-1 border-none outline-none font-inter text-sm bg-transparent text-text-primary placeholder:text-text-disable min-w-0"
                                            placeholder="Filter by speaker or phrase…"
                                            aria-label="Search transcript"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {showPlainTranscriptOnly && (
                                            <div className="rounded-12 border border-stroke-primary bg-bg-surface-lv1/50 p-4">
                                                <p className="text-xs font-inter font-medium text-text-tertiary m-0 mb-2">
                                                    Diarized segments are not available; showing full transcript text.
                                                </p>
                                                {plainTranscriptVisible ? (
                                                    <pre className="font-inter text-sm text-text-secondary leading-6 whitespace-pre-wrap break-words m-0 max-h-[480px] overflow-y-auto">
                                                        {plainTranscriptVisible}
                                                    </pre>
                                                ) : (
                                                    <p className="font-inter text-sm text-text-secondary m-0">No lines match your search.</p>
                                                )}
                                            </div>
                                        )}
                                        {!showPlainTranscriptOnly && filteredSegments.length > 0 ? (
                                            filteredSegments.map((segment, index) => {
                                                const avatarColor = getAvatarColor(segment.speaker);
                                                const isPrimary = avatarColor === '#3c91e6' || avatarColor === '#16a34a';
                                                return (
                                                    <div key={`${segment.start}-${index}`} className="flex flex-col gap-2">
                                                        <div className="flex gap-2 items-center">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-inter font-medium shrink-0 ${
                                                                    isPrimary ? 'bg-primary-500 text-white' : 'text-text-primary'
                                                                }`}
                                                                style={!isPrimary ? { backgroundColor: avatarColor } : undefined}
                                                            >
                                                                {getInitials(segment.speaker)}
                                                            </div>
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-inter font-medium text-sm text-text-primary truncate">
                                                                    {segment.speaker}
                                                                </span>
                                                                <span className="text-xs font-mono text-primary-500 shrink-0">
                                                                    {formatTime(segment.start)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="font-inter text-sm text-text-secondary leading-6 pl-10 m-0">
                                                            {segment.text}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : !showPlainTranscriptOnly ? (
                                            <p className="font-inter text-sm text-text-secondary m-0">
                                                {safeTranscript.segments?.length
                                                    ? 'No segments match your search.'
                                                    : 'Transcript will load when Meeting BaaS provides text, URLs are hydrated by the API, or after processing completes.'}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden xl:flex w-[6px] bg-bg-surface-lv2 shrink-0" aria-hidden />

                    <div className="w-full xl:w-[min(380px,36vw)] bg-bg-surface-pure border border-stroke-primary border-t-0 xl:border-t xl:border-l-0 rounded-bl-12 rounded-br-12 xl:rounded-bl-none xl:rounded-tr-12 flex flex-col max-h-[420px] xl:max-h-none xl:h-auto min-h-[280px] overflow-hidden">
                        <div className="p-4 border-b border-stroke-primary flex items-center justify-between">
                            <div>
                                <span className="font-inter font-semibold text-sm text-text-primary block">Ask AI</span>
                                <span className="font-inter text-xs text-text-tertiary">Context: this meeting</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <p className="font-inter text-sm text-text-secondary leading-6 m-0">
                                Use this space to draft follow-ups from the summary and transcript. Full chat integration can stream answers
                                grounded in your Meeting BaaS data (transcript webhooks, structured summaries).
                            </p>
                        </div>
                        <div className="p-4 border-t border-stroke-primary">
                            <div className="w-full bg-bg-surface-lv1 border border-stroke-primary rounded-10 px-3 py-2.5 flex items-center gap-2">
                                <span className="font-inter text-sm text-text-disable flex-1">Ask about decisions, risks, or next steps…</span>
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                                    <path
                                        d="M10 3L17 10L10 17M17 10H3"
                                        stroke="#16a34a"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-8 pb-6">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-inter font-semibold text-text-tertiary uppercase tracking-wider m-0 mb-1">
                                Recording playback
                            </p>
                            {audioPlaybackUrl ? (
                                <audio className="w-full max-w-xl" controls src={audioPlaybackUrl} />
                            ) : (
                                <p className="font-inter text-sm text-text-secondary m-0">
                                    No playback URL yet. When the bot completes and Meeting BaaS exposes media, it will show here.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TeamCreationSidebar />
        </div>
    );
};

export default MeetingDetails;
