import React, { useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import TeamCreationSidebar from './TeamCreationSidebar';
import type { MeetingDetailsProps } from '../types';

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
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'transcription'>('summary');
    const [convertingId, setConvertingId] = useState<string | null>(null);
    
    // Ensure transcript has required structure
    const safeTranscript = transcript || { fullText: '', segments: [] };

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] mr-[190px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-[100]">
                    <SearchBar />
                </div>

                {/* Breadcrumb */}
                <div className="px-8 pt-4 flex items-center gap-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 5L7.5 10L12.5 15" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">
                        All Meetings / {meetingTitle}
                    </span>
                </div>

                {/* Tab Menu */}
                <div className="px-8 pt-4">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 px-5 py-4 flex gap-5 items-center">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'summary' ? 'text-text-primary' : 'text-text-secondary'
                                }`}
                        >
                            <span className="font-inter font-medium text-sm tracking-[-0.084px]">Summary</span>
                            {activeTab === 'summary' && (
                                <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('transcription')}
                            className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'transcription' ? 'text-text-primary' : 'text-text-secondary'
                                }`}
                        >
                            <span className="font-inter font-medium text-sm tracking-[-0.084px]">Transcription</span>
                            {activeTab === 'transcription' && (
                                <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden px-8 py-4 flex gap-0">
                    {/* Left Content */}
                    <div className="flex-1 bg-bg-surface-pure border border-stroke-primary border-r-0 rounded-tl-12 rounded-bl-12 flex flex-col overflow-hidden">
                        {activeTab === 'summary' && (
                            <>
                                {/* Header */}
                                <div className="p-5 border-b border-stroke-primary">
                                    <h1 className="font-inter font-medium text-2xl leading-8 text-text-primary tracking-[-0.36px] mb-2">
                                        {meetingTitle}
                                    </h1>
                                    {meetingDate && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-inter font-medium text-sm bg-primary-500">
                                                {meetingTitle.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">
                                                IntelliMeet {meetingDate} English (Global)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Filter Buttons */}
                        {/* <div className="px-5 py-4 border-b border-stroke-primary flex gap-2 items-center"> */}
                        {/* <div className="flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M3.33333 5H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.33333 10H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.33333 15H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">General Summary</span>
                            </div> */}
                        {/* <div className="ml-auto flex gap-2">
                                {['All', 'Transcription', 'Meeting summary', 'Integration', 'Analysis'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter.toLowerCase())}
                                        className={`bg-bg-surface-pure border border-stroke-primary rounded-8 px-[10px] py-[6px] font-inter font-medium text-sm tracking-[-0.084px] cursor-pointer ${activeFilter === filter.toLowerCase()
                                                ? 'bg-bg-surface-lv2 text-text-primary'
                                                : 'text-text-secondary'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div> */}
                        {/* <button className="ml-2 cursor-pointer">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="5" r="1.5" fill="#2b3d39" />
                                    <circle cx="10" cy="10" r="1.5" fill="#2b3d39" />
                                    <circle cx="10" cy="15" r="1.5" fill="#2b3d39" />
                                </svg>
                            </button> */}
                        {/* </div> */}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {activeTab === 'summary' ? (
                                <div className="flex flex-col gap-4 max-w-[666px]">
                                    <div>
                                        <h2 className="font-inter font-medium text-lg leading-6 text-text-primary tracking-[-0.27px] mb-2">
                                            Overview
                                        </h2>
                                        <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                            {summary}
                                        </p>
                                    </div>

                                    {keyPoints.length > 0 && (
                                        <div>
                                            <h2 className="font-inter font-medium text-lg leading-6 text-text-primary tracking-[-0.27px] mb-2">
                                                Key Points
                                            </h2>
                                            <ul className="list-disc list-inside space-y-1">
                                                {keyPoints.map((point, index) => (
                                                    <li key={index} className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {keyTakeaways.length > 0 && (
                                        <div>
                                            <h2 className="font-inter font-medium text-lg leading-6 text-text-primary tracking-[-0.27px] mb-2">
                                                Key Takeaways
                                            </h2>
                                            <ul className="list-disc list-inside space-y-1">
                                                {keyTakeaways.map((takeaway, index) => (
                                                    <li key={index} className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                                        {takeaway}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {meetingIdForApi && onConvertActionToTodo ? (
                                        <div>
                                            <h2 className="font-inter font-medium text-lg leading-6 text-text-primary tracking-[-0.27px] mb-2">
                                                Action Items
                                            </h2>
                                            {apiActionItems && apiActionItems.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {apiActionItems.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="font-inter text-base leading-6 text-text-secondary tracking-[-0.176px] flex flex-wrap items-start gap-2"
                                                        >
                                                            <label className="flex items-start gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="mt-1"
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
                                                                <span>
                                                                    <span className="font-medium text-text-primary">{item.title}</span>
                                                                    {item.description ? ` — ${item.description}` : ''}{' '}
                                                                    {item.owner && `(Owner: ${item.owner})`}{' '}
                                                                    {item.dueDate && `(Due: ${item.dueDate})`}
                                                                    {item.addToTodoChecked && (
                                                                        <span className="text-primary-600 text-sm ml-1">· Added to To-Dos</span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="font-inter text-sm text-text-secondary">No action items for this meeting yet.</p>
                                            )}
                                        </div>
                                    ) : (
                                        actionItems.length > 0 && (
                                            <div>
                                                <h2 className="font-inter font-medium text-lg leading-6 text-text-primary tracking-[-0.27px] mb-2">
                                                    Action Items
                                                </h2>
                                                <ol className="list-decimal list-inside space-y-1">
                                                    {actionItems.map((item, index) => (
                                                        <li key={index} className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                                            {item.description} {item.owner && `(Owner: ${item.owner})`} {item.dueDate && `(Due: ${item.dueDate})`}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-full">
                                    {/* Transcription Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-inter font-normal text-base text-text-primary tracking-[-0.176px]">
                                            Transcription
                                        </h2>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 w-full">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14 14L11.1 11.1" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <input
                                            type="text"
                                            className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[0.28px] bg-transparent placeholder:text-text-secondary"
                                            placeholder="Search Transcript"
                                        />
                                        <div className="border border-stroke-primary rounded-[7px] px-[6px] py-0 font-inter text-sm text-text-secondary tracking-[-0.084px] leading-5">⌘ 1</div>
                                    </div>

                                    {/* Transcript List */}
                                    <div className="flex flex-col gap-4">
                                        {safeTranscript?.segments && safeTranscript.segments.length > 0 ? (
                                            safeTranscript.segments.map((segment, index) => {
                                            const formatTime = (seconds: number): string => {
                                                const mins = Math.floor(seconds / 60);
                                                const secs = Math.floor(seconds % 60);
                                                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                            };

                                            const getInitials = (speaker: string): string => {
                                                return speaker
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .substring(0, 2);
                                            };

                                            const getAvatarColor = (speaker: string): string => {
                                                const colors = ['#3c91e6', '#fdeee7', '#16a34a', '#ea580c', '#8B5CF6'];
                                                const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                return colors[hash % colors.length];
                                            };

                                            const avatarColor = getAvatarColor(segment.speaker);
                                            const isPrimary = avatarColor === '#3c91e6' || avatarColor === '#16a34a';

                                            return (
                                                <div key={index} className="flex flex-col gap-3">
                                                    <div className="flex gap-2 items-center">
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-inter font-medium ${
                                                                isPrimary ? 'bg-primary-500 text-white' : 'bg-[#fdeee7] text-text-primary'
                                                            }`}
                                                            style={!isPrimary ? { backgroundColor: avatarColor } : undefined}
                                                        >
                                                            {getInitials(segment.speaker)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-inter font-normal text-sm text-text-primary tracking-[-0.084px]">
                                                                {segment.speaker}
                                                            </span>
                                                            <div className="w-1 h-1 rounded-full bg-stroke-primary"></div>
                                                            <span className="font-inter font-normal text-sm text-[#3c91e6] tracking-[-0.084px]">
                                                                {formatTime(segment.start)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] leading-5 ml-8">
                                                        {segment.text}
                                                    </p>
                                                </div>
                                            );
                                        })
                                        ) : (
                                            <div className="text-text-secondary font-inter text-sm">
                                                No transcript segments available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-[6px] bg-bg-surface-lv2"></div>

                    {/* Right Sidebar - AI Chat */}
                    <div className="w-[379px] bg-bg-surface-pure border-l border-stroke-primary rounded-tr-12 flex flex-col h-full overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-5 border-b border-stroke-primary flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                    IntelliMeet Pro AI Chat
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="font-inter font-normal text-xs text-text-secondary">GPT-4.0</span>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3.5 4.375L7 7.875L10.5 4.375" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <button className="cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M13.5 4.5L4.5 13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 4.5L13.5 13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-inter font-medium text-sm">
                                    P
                                </div>
                                <span className="font-inter font-medium text-sm text-text-secondary">You</span>
                            </div>
                            <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] ml-10">
                                Can you explain the significance of the automatic action item generation feature?
                            </p>

                            <div className="flex items-center gap-2 mt-4">
                                <div className="w-8 h-8 rounded-full bg-bg-surface-lv2 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                        <span className="text-white text-xs">i</span>
                                    </div>
                                </div>
                                <span className="font-inter font-medium text-base text-text-primary">IntelliMeet Pro AI Chat</span>
                            </div>
                            <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] ml-10">
                                The automatic action item generation feature in Fireflies is significant for several reasons:
                            </p>
                            <ol className="list-decimal list-inside ml-10 space-y-2 text-sm text-text-secondary">
                                <li>
                                    <span className="font-medium text-text-primary">Efficiency:</span> This feature streamlines the process of tracking tasks that arise during meetings. Instead of manually noting down action items, Fireflies automatically identifies and generates them, saving time and reducing the likelihood of forgetting important tasks.
                                </li>
                                <li>
                                    <span className="font-medium text-text-primary">Clarity:</span> By providing a clear list of action items associated with each meeting, it ensures that all participants understand their responsibilities. This clarity helps in accountability and follow-through on commitments made during discussions.
                                </li>
                                <li>
                                    <span className="font-medium text-text-primary">Organization:</span> The generated tasks are organized per meeting, allowing users to easily reference what needs to be completed after each session. This organization helps in managing workloads and prioritizing tasks effectively.
                                </li>
                            </ol>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-stroke-primary">
                            <button className="w-full bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <rect x="2" y="2" width="6" height="6" rx="1" stroke="#2b3d39" strokeWidth="1.5" />
                                        <rect x="12" y="2" width="6" height="6" rx="1" stroke="#2b3d39" strokeWidth="1.5" />
                                        <rect x="2" y="12" width="6" height="6" rx="1" stroke="#2b3d39" strokeWidth="1.5" />
                                        <rect x="12" y="12" width="6" height="6" rx="1" stroke="#2b3d39" strokeWidth="1.5" />
                                    </svg>
                                    <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Ask IntelliMeet Pro AI Chat anything
                                    </span>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 3L17 10L10 17M17 10H3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audio Player */}
                <div className="bg-bg-surface-pure border border-stroke-primary border-t-0 rounded-bl-12 rounded-br-12 px-8 py-4 flex flex-col gap-2">
                    {audioPlaybackUrl ? (
                        <audio className="w-full max-w-xl" controls src={audioPlaybackUrl} />
                    ) : (
                        <div className="flex items-center gap-4">
                            <button type="button" className="w-9 h-9 rounded-full bg-[#6cc58d] flex items-center justify-center cursor-pointer opacity-50" disabled>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M6.66667 5V15M13.3333 5V15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                            <span className="font-inter text-sm text-text-secondary">No recording URL yet (join a bot and complete the meeting).</span>
                        </div>
                    )}
                </div>
            </div>

            <TeamCreationSidebar />
        </div>
    );
};

export default MeetingDetails;

