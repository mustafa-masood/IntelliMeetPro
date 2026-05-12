import React, { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
// import TeamCreationSidebar from './TeamCreationSidebar';
import type { MeetingDetailsProps, PmPlatform } from '../types';
import { Link } from 'react-router-dom';
import MeetingAskAI from './MeetingAskAI';

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

const PIPELINE_STATUS: Record<number, string> = {
    0: 'Idle',
    1: 'Syncing meeting data',
    2: 'Awaiting transcript',
    3: 'Analyzing transcript',
    4: 'Analysis complete',
    5: 'Analysis failed',
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
    meetingProcessingStatus = null,
    meetingLifecycleStatusLabel = null,
    meetingProcessingStatusLabel = null,
    meetingAnalysisError = null,
    meetingTranscriptAnalysisCompleted = null,
    onPushActionToPm,
    workspaceMembersForAssign = null,
    canAssignActionItems = false,
    onAssignActionItemUser,
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'transcription'>('summary');
    const [convertingId, setConvertingId] = useState<string | null>(null);
    const [pushKey, setPushKey] = useState<string | null>(null);
    const [assignBusyId, setAssignBusyId] = useState<string | null>(null);
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

    const pmLabel = (p: PmPlatform) =>
        p === 1 ? 'Asana' : p === 2 ? 'Jira' : 'Trello';

    const runPush = async (itemId: string, platform: PmPlatform) => {
        if (!onPushActionToPm) return;
        setPushKey(`${platform}:${itemId}`);
        try {
            await onPushActionToPm(itemId, platform);
        } finally {
            setPushKey(null);
        }
    };

    const getAvatarColor = (speaker: string): string => {
        const colors = ['#3c91e6', '#fdeee7', '#16a34a', '#ea580c', '#8B5CF6'];
        const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full overflow-hidden bg-bg-surface-lv1 surface-gradient">
            <Sidebar />

            <div className="relative ml-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:ml-[270px] xl:mr-0">
                {/* <div className="sticky top-0 z-[100] flex shrink-0 items-center border-b border-stroke-primary bg-bg-surface-pure/85 px-4 py-3 shadow-float backdrop-blur-md backdrop-saturate-150 sm:px-8">
                    <SearchBar placeholder="Search in workspace…" className="max-w-xl sm:w-96" />
                </div> */}

                <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 pt-5 sm:px-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex cursor-pointer items-center gap-1 rounded-10 border-0 bg-transparent p-1.5 text-text-secondary transition-colors hover:bg-bg-surface-lv1 hover:text-text-primary"
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
                    <span className="font-inter text-sm font-medium text-text-primary">
                        Meetings <span className="text-text-tertiary">/</span> {meetingTitle}
                    </span>
                </div>

            {(meetingIdForApi && typeof meetingProcessingStatus === 'number') ||
meetingBots?.length ? (
    <div className="shrink-0 px-4 pt-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-3 rounded-14 border border-stroke-primary bg-bg-surface-pure/95 px-4 py-3 shadow-xs backdrop-blur-sm">

            {/* Pipeline Status */}
            {meetingIdForApi && typeof meetingProcessingStatus === 'number' && (
                <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-inter font-medium ${
                        meetingProcessingStatus === 5
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : meetingProcessingStatus === 4 || meetingTranscriptAnalysisCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                    role="status"
                >
                    <span className="w-2 h-2 rounded-full bg-current opacity-80" />

                    <span>
                        {meetingProcessingStatusLabel ??
                            PIPELINE_STATUS[meetingProcessingStatus] ??
                            `Status (${meetingProcessingStatus})`}
                    </span>
                </div>
            )}

            {/* Error */}
            {meetingAnalysisError && (
                <span className="text-xs text-red-600 font-inter truncate">
                    {meetingAnalysisError}
                </span>
            )}

            {/* Divider */}
            {meetingBots && meetingBots.length > 0 && (
                <div className="h-4 w-px bg-stroke-primary hidden sm:block" />
            )}

            {/* Bots */}
            {meetingBots && meetingBots.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-inter font-medium text-text-tertiary">
                        Bots
                    </span>

                    {meetingBots.map((b) => (
                        <div
                            key={b.id}
                            className="inline-flex items-center gap-2 rounded-full border border-stroke-primary bg-bg-surface-lv1 px-3 py-1 text-xs font-inter"
                        >
                            <span
                                className="truncate max-w-[90px] text-text-tertiary"
                                title={b.externalBotId}
                            >
                                {b.externalBotId.slice(0, 8)}…
                            </span>

                            <span className="text-primary-600 font-medium">
                                {b.statusLabel ??
                                    BOT_STATUS[b.status] ??
                                    `Status ${b.status}`}
                            </span>

                            <span className="text-text-disable">•</span>

                            <span className="text-text-secondary">
                                {b.transcriptionStatusLabel ??
                                    TX_STATUS[b.transcriptionStatus] ??
                                    'Tx'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
) : null}
                <div className="shrink-0 px-4 pt-4 sm:px-8">
                    <div className="inline-flex w-fit gap-1 rounded-12 border border-stroke-primary bg-bg-surface-lv1/90 p-1 shadow-xs backdrop-blur-sm sm:p-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('summary')}
                            className={`rounded-10 px-4 py-2 font-inter text-sm font-medium transition-all duration-200 ${activeTab === 'summary'
                                    ? 'bg-bg-surface-pure text-text-primary shadow-float ring-1 ring-black/[0.04]'
                                    : 'text-text-secondary hover:bg-bg-surface-pure/60 hover:text-text-primary'
                                }`}
                        >
                            Summary
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('transcription')}
                            className={`rounded-10 px-4 py-2 font-inter text-sm font-medium transition-all duration-200 ${activeTab === 'transcription'
                                    ? 'bg-bg-surface-pure text-text-primary shadow-float ring-1 ring-black/[0.04]'
                                    : 'text-text-secondary hover:bg-bg-surface-pure/60 hover:text-text-primary'
                                }`}
                        >
                            Transcription
                        </button>
                    </div>
                </div>
               <div className="flex min-h-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-8 xl:flex-row">
                    <div className="flex  min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-stroke-primary bg-bg-surface-pure shadow-float  xl:rounded-r-none xl:border-r-0">
                        {activeTab === 'summary' && (
                            <div className="border-b border-stroke-primary bg-gradient-to-r from-bg-surface-pure to-primary-50/20 p-2 sm:p-6">
                                <h1 className="font-inter-tight m-0 mb-1 text-lg font-semibold leading-tight tracking-tight text-text-primary sm:text-[1.65rem]">
                                    {meetingTitle}
                                </h1>
                                {meetingDate && (
                                    <div className="flex items-center gap-2">
                                        {/* <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-medium text-sm bg-primary-500">
                                            {meetingTitle.substring(0, 2).toUpperCase()}
                                        </div> */}
                                        <span className="font-inter text-sm text-text-secondary">{meetingDate}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className=" flex-1 overflow-y-auto p-5 sm:p-6">
                            {activeTab === 'summary' ? (
                                <div className="flex flex-col gap-6 max-w-2xl">
                                    <div>
                                        <h2 className="font-inter-tight m-0 mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                            Overview
                                        </h2>
                                        <p className="m-0 font-inter text-base leading-7 text-text-secondary">
                                            {summary?.trim()
                                                ? summary
                                                : 'No summary yet. It will appear after local Ollama analysis runs (when transcript text is available), or open a meeting that already has notes in the system.'}
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="font-inter-tight m-0 mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                            Key points
                                        </h2>
                                        {keyPoints.length > 0 ? (
                                            <ul className="list-none space-y-2 m-0 pl-0">
                                                {keyPoints.map((point, index) => (
                                                    <li
                                                        key={index}
                                                        className="font-inter border-l-2 border-primary-500/50 pl-4 text-base leading-7 text-text-secondary"
                                                    >
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="font-inter text-sm text-text-secondary m-0">
                                                No key points yet. They are filled when Ollama analysis completes successfully.
                                            </p>
                                        )}
                                    </div>

                                    {keyTakeaways.length > 0 && (
                                        <div>
                                            <h2 className="font-inter-tight m-0 mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                                Takeaways
                                            </h2>
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
                                            <h2 className="font-inter-tight m-0 mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                                Action items
                                            </h2>
                                            {apiActionItems && apiActionItems.length > 0 ? (
                                                <ul className="space-y-3 m-0 pl-0 list-none">
                                                    {apiActionItems.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="rounded-12 border border-stroke-primary bg-bg-surface-lv1/50 p-4 shadow-xs transition-shadow hover:shadow-sm"
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
                                                                    {item.syncedPlatform && (
                                                                        <span className="text-emerald-600 text-sm ml-1">
                                                                            · Synced to {pmLabel(item.syncedPlatform)}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                            {item.suggestedAssigneeName &&
                                                                !item.assignedUserId &&
                                                                onAssignActionItemUser &&
                                                                workspaceMembersForAssign &&
                                                                workspaceMembersForAssign.length > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={assignBusyId !== null}
                                                                        className="mt-1 ml-7 text-xs text-primary-600 underline text-left"
                                                                        onClick={async () => {
                                                                            const q = item.suggestedAssigneeName!.trim().toLowerCase();
                                                                            const m = workspaceMembersForAssign.find(
                                                                                (x) =>
                                                                                    x.displayName.trim().toLowerCase() === q ||
                                                                                    x.email.trim().toLowerCase().split('@')[0] === q
                                                                            );
                                                                            if (!m) return;
                                                                            setAssignBusyId(item.id);
                                                                            try {
                                                                                await onAssignActionItemUser(item.id, m.userId);
                                                                            } finally {
                                                                                setAssignBusyId(null);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Suggested: {item.suggestedAssigneeName} (click to assign)
                                                                    </button>
                                                                )}
                                                            {canAssignActionItems &&
                                                                workspaceMembersForAssign &&
                                                                workspaceMembersForAssign.length > 0 &&
                                                                onAssignActionItemUser && (
                                                                    <div className="mt-2 pl-7">
                                                                        <label className="sr-only" htmlFor={`assign-${item.id}`}>
                                                                            Assign action item
                                                                        </label>
                                                                        <select
                                                                            id={`assign-${item.id}`}
                                                                            className="text-xs border border-stroke-secondary rounded-8 px-2 py-1.5 bg-bg-surface-pure max-w-[260px]"
                                                                            value={item.assignedUserId ?? ''}
                                                                            disabled={assignBusyId === item.id}
                                                                            onChange={async (e) => {
                                                                                const v = e.target.value;
                                                                                setAssignBusyId(item.id);
                                                                                try {
                                                                                    await onAssignActionItemUser(
                                                                                        item.id,
                                                                                        v ? v : null
                                                                                    );
                                                                                } finally {
                                                                                    setAssignBusyId(null);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <option value="">Workspace member…</option>
                                                                            {workspaceMembersForAssign.map((m) => (
                                                                                <option key={m.userId} value={m.userId}>
                                                                                    {m.displayName || m.email}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            {onPushActionToPm && meetingIdForApi && (
                                                                <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
                                                                    {item.externalTaskUrl && (
                                                                        <a
                                                                            href={item.externalTaskUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-primary-600 underline"
                                                                        >
                                                                            Open in {item.syncedPlatform ? pmLabel(item.syncedPlatform) : 'tool'}
                                                                        </a>
                                                                    )}
                                                                    {([1, 2, 3] as const).map((pl) => (
                                                                        <button
                                                                            key={pl}
                                                                            type="button"
                                                                            disabled={pushKey !== null}
                                                                            onClick={() => void runPush(item.id, pl)}
                                                                            className="text-xs px-2 py-1 rounded-8 border border-stroke-secondary bg-bg-surface-pure text-text-secondary hover:bg-bg-surface-lv1 disabled:opacity-50"
                                                                        >
                                                                            {pushKey === `${pl}:${item.id}` ? '…' : `Add to ${pmLabel(pl)}`}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
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
                                                <h2 className="font-inter-tight m-0 mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                                    Action items
                                                </h2>
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
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <h2 className="font-inter-tight m-0 text-sm font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                                            Transcript
                                        </h2>
                                        <span className="text-xs text-text-tertiary font-inter">
                                            {showPlainTranscriptOnly
                                                ? 'Plain text'
                                                : `${filteredSegments.length} segment${filteredSegments.length === 1 ? '' : 's'}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-10 border border-stroke-primary bg-bg-surface-pure/90 px-3 py-2 shadow-xs backdrop-blur-sm">
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
                                            className="min-w-0 flex-1 border-0 bg-transparent font-inter text-sm text-text-primary outline-none placeholder:text-text-disable"
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
                                                    <div key={`${segment.start}-${index}`} className="group rounded-12 border border-transparent px-2 py-2 transition-colors hover:border-stroke-primary hover:bg-bg-surface-lv1/60">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-inter font-medium shrink-0 ${isPrimary ? 'bg-primary-500 text-white' : 'text-text-primary'
                                                                        }`}
                                                                    style={!isPrimary ? { backgroundColor: avatarColor } : undefined}
                                                                >
                                                                    {getInitials(segment.speaker)}
                                                                </div>
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="truncate font-inter text-sm font-medium text-text-primary">
                                                                        {segment.speaker}
                                                                    </span>
                                                                    <span className="shrink-0 font-mono text-xs tabular-nums text-primary-600">
                                                                        {formatTime(segment.start)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="m-0 pl-10 font-inter text-sm leading-6 text-text-secondary">
                                                                {segment.text}
                                                            </p>
                                                        </div>
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
  

                    <div className="flex max-h-[420px] min-h-[280px] w-full flex-col overflow-hidden rounded-16 border border-stroke-primary border-t-0 bg-bg-surface-pure/95 shadow-float backdrop-blur-md xl:h-auto xl:max-h-none xl:w-[min(380px,36vw)] xl:rounded-bl-none xl:rounded-tr-16 xl:border-l-0 xl:border-t">
                        <div className="flex items-center justify-between border-b border-stroke-primary bg-gradient-to-r from-bg-surface-pure to-primary-50/15 px-4 py-3">
                            <div>
                                <span className="block font-inter text-sm font-semibold text-text-primary">Ask AI</span>
                                <span className="font-inter text-xs text-text-tertiary">Context: this meeting</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {meetingIdForApi ? (
                                <MeetingAskAI meetingId={meetingIdForApi} />
                            ) : (
                                <p className="font-inter text-sm text-text-secondary leading-6 m-0">
                                    Ask AI is available for API-backed meetings.
                                </p>
                            )}
                        </div>
                        <div className="p-4 border-t border-stroke-primary">
                            {meetingIdForApi ? (
                                <Link
                                    to={`/experimental/ask-ai?meetingId=${meetingIdForApi}`}
                                    className="text-xs font-inter text-text-tertiary underline"
                                >
                                    Open global Ask AI (this meeting pinned)
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </div>


                {/* {meetingUrl && (
                    <div className="px-4 sm:px-8 pt-4 shrink-0">
                        <div className="flex flex-col gap-4 rounded-16 border border-stroke-primary bg-gradient-to-br from-bg-surface-pure via-bg-surface-pure to-primary-50/25 p-4 shadow-float sm:flex-row sm:items-center sm:p-5 lg:gap-6">
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
                                {meetingLifecycleStatusLabel && (
                                    <span className="inline-block mt-2 ml-2 text-[11px] font-inter font-medium px-2 py-0.5 rounded-8 bg-primary-50 text-primary-700 border border-primary-200">
                                        {meetingLifecycleStatusLabel}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <a
                                    href={meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-10 bg-primary-500 px-4 py-2 text-center text-sm font-inter font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md"
                                >
                                    Join meeting
                                </a>
                                <button
                                    type="button"
                                    onClick={() => void navigator.clipboard.writeText(meetingUrl)}
                                    className="rounded-10 border border-stroke-secondary bg-bg-surface-pure px-4 py-2 text-sm font-inter font-medium text-text-primary transition-colors hover:border-primary-500/25 hover:bg-bg-surface-lv1"
                                >
                                    Copy link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

               



                */}




<div className="px-4 pb-4 pt-2 sm:px-8">
    <div className="flex items-center gap-4 rounded-16 border border-stroke-primary bg-bg-surface-pure/95 px-4 py-3 shadow-float backdrop-blur-sm">
        <p className="shrink-0 text-xs font-inter font-semibold text-text-tertiary uppercase tracking-wider m-0">
            Recording playback
        </p>

        <div className="flex-1 min-w-0">
            {audioPlaybackUrl ? (
                <audio className="w-full max-w-xl h-10" controls src={audioPlaybackUrl} />
            ) : (
                <p className="font-inter text-sm text-text-secondary m-0">
                    No playback available yet.
                </p>
            )}
        </div>
    </div>
</div>
            </div>

            {/* <TeamCreationSidebar /> */}
        </div>
    );
};

export default MeetingDetails;
