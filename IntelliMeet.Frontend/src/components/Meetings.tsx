import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import MeetingDetails from './MeetingDetails';
import MobileMenuButton from './MobileMenuButton';
import MeetingsTable from './MeetingsTable';
import Container from './layout/Container';
import SearchBar from './SearchBar';
import type { MeetingAnalysisResponse, Meeting as MeetingType, ApiActionItemRow } from '../types';
import { imApi } from '../api/intellimeet';

interface Meeting {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    duration: string;
    creator: string;
    status: 'coming-soon' | 'completed';
    date: string;
}

const EMPTY_MEETING_ID = '00000000-0000-0000-0000-000000000000';

function formatApiMeetingDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return String(iso);
    }
}

const Meetings: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showUploadFilesView, setShowUploadFilesView] = useState(false);
    const [showAllMeetings, setShowAllMeetings] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzedMeetings, setAnalyzedMeetings] = useState<Array<MeetingType & { analysisResult?: MeetingAnalysisResponse }>>([]);
    const [selectedAnalysisResult, setSelectedAnalysisResult] = useState<MeetingAnalysisResponse | null>(null);
    const [apiMeetings, setApiMeetings] = useState<Meeting[]>([]);
    const [apiMeetingId, setApiMeetingId] = useState<string | null>(null);
    const [apiActionItems, setApiActionItems] = useState<ApiActionItemRow[]>([]);
    const [audioPlaybackUrl, setAudioPlaybackUrl] = useState<string | null>(null);
    const [detailSource, setDetailSource] = useState<'upload' | 'api'>('upload');
    const [liveLink, setLiveLink] = useState('');
    const [liveName, setLiveName] = useState('');
    const [liveJoinBusy, setLiveJoinBusy] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [meetingsListHint, setMeetingsListHint] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const successModalRef = useRef<HTMLDivElement>(null);
    const scheduleModalRef = useRef<HTMLDivElement>(null);
    const uploadModalRef = useRef<HTMLDivElement>(null);

    // Mock uploaded files data
    interface UploadedFile {
        id: string;
        name: string;
        extension: string;
        size: string;
        time: string;
        status: 'progressing';
        badgeColor: 'primary' | 'orange';
    }

    const uploadedFiles: UploadedFile[] = [
        { id: '1', name: 'VID_20240209_15421564', extension: 'mp4', size: '77.7mb', time: 'In a few seconds', status: 'progressing', badgeColor: 'primary' },
        { id: '2', name: 'Recordid_20241875', extension: 'mp4', size: '77.7mb', time: '10 hours ago', status: 'progressing', badgeColor: 'orange' },
        { id: '3', name: 'Meetingrecord_20240321', extension: 'mp4', size: '77.7mb', time: '1 day ago', status: 'progressing', badgeColor: 'primary' },
        { id: '4', name: 'Recordvedio_20240304', extension: 'mp4', size: '77.7mb', time: '2 days ago', status: 'progressing', badgeColor: 'orange' },
        { id: '5', name: 'VID_20240209_96421564', extension: 'mp4', size: '77.7mb', time: '3 days ago', status: 'progressing', badgeColor: 'primary' },
    ];

    const refreshTableMeetings = useCallback(async () => {
        try {
            const [rows, upcoming] = await Promise.all([imApi.listMeetings(), imApi.upcomingMeetings()]);
            const apiRows: Meeting[] = rows.map((m) => ({
                id: m.id,
                name: m.title,
                initials: m.title.substring(0, 2).toUpperCase(),
                avatarColor: '#0d9488',
                duration: '—',
                creator: 'Meeting BaaS',
                status: m.status === 3 ? ('completed' as const) : ('coming-soon' as const),
                date: formatApiMeetingDate(m.startUtc),
            }));
            const seen = new Set(apiRows.map((m) => m.id));
            const sortedUpcoming = [...upcoming].sort((a, b) => {
                const ta = a.startUtc ? new Date(a.startUtc).getTime() : 0;
                const tb = b.startUtc ? new Date(b.startUtc).getTime() : 0;
                return ta - tb;
            });
            const fromCal: Meeting[] = [];
            for (const u of sortedUpcoming) {
                if (!u.calendarEventId) continue;
                const mid =
                    u.meetingId && u.meetingId !== EMPTY_MEETING_ID ? u.meetingId : `cal-${u.calendarEventId}`;
                if (seen.has(mid)) continue;
                seen.add(mid);
                fromCal.push({
                    id: mid,
                    name: u.title,
                    initials: u.title.substring(0, 2).toUpperCase(),
                    avatarColor: '#6366f1',
                    duration: '—',
                    creator: 'Calendar',
                    status: 'coming-soon' as const,
                    date: formatApiMeetingDate(u.startUtc),
                });
            }
            setApiMeetings([...fromCal, ...apiRows]);
        } catch {
            setApiMeetings([]);
        }
    }, []);

    useEffect(() => {
        refreshTableMeetings();
    }, [refreshTableMeetings]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isSuccessModalOpen) {
                    setIsSuccessModalOpen(false);
                } else if (isUploadModalOpen) {
                    setIsUploadModalOpen(false);
                } else if (isScheduleModalOpen) {
                    setIsScheduleModalOpen(false);
                } else if (isModalOpen) {
                    setIsModalOpen(false);
                }
            }
        };

        if (isModalOpen || isSuccessModalOpen || isScheduleModalOpen || isUploadModalOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, isSuccessModalOpen, isScheduleModalOpen, isUploadModalOpen]);

    const handleAddToLiveMeeting = () => {
        setIsDropdownOpen(false);
        setIsModalOpen(true);
    };

    const handleScheduleNewMeeting = () => {
        setIsDropdownOpen(false);
        setIsScheduleModalOpen(true);
    };

    const handleUploadAudioRecording = () => {
        setIsDropdownOpen(false);
        setIsUploadModalOpen(true);
    };

    // Helper function to format date to show only date and month
    const formatDateShort = (dateString: string): string => {
        // Extract date and month from formats like "02 Jan 2025, 08:43 AM" or "22 Dec 2024, 02:33 PM"
        const match = dateString.match(/^(\d{1,2})\s+(\w{3})/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        return dateString; // Fallback to original if format doesn't match
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('File', selectedFile);

            const response = await fetch('/api/meetings/analyzeWithTranscription', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to analyze meeting: ${response.statusText}`);
            }

            const data: MeetingAnalysisResponse = await response.json();

            // Create a meeting entry from the analysis
            const newMeeting: MeetingType & { analysisResult: MeetingAnalysisResponse } = {
                id: `analyzed-${Date.now()}`,
                title: selectedFile.name.replace(/\.[^/.]+$/, '') || 'Analyzed Meeting',
                date: new Date().toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                summary: data.analysis.summary,
                analysisResult: data,
            };

            setAnalyzedMeetings((prev) => [newMeeting, ...prev]);
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setShowAllMeetings(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while analyzing the meeting');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMeetingClick = async (meeting: Meeting) => {
        if (meeting.id.startsWith('cal-')) {
            setMeetingsListHint(
                'This row is a calendar event only. Open the Calendar page, pick your connection, and click “Schedule bot” on the event so the notetaker is allowed to join when the meeting starts. Events need a video link (Meet, Zoom, Teams, etc.).'
            );
            return;
        }
        setMeetingsListHint(null);
        setSelectedMeeting(meeting);
        setDetailSource('api');
        setApiMeetingId(meeting.id);
        try {
            const [detail, transcript, summary, actions] = await Promise.all([
                imApi.getMeeting(meeting.id),
                imApi.getTranscript(meeting.id),
                imApi.getSummary(meeting.id),
                imApi.getActionItems(meeting.id),
            ]);
            setAudioPlaybackUrl(detail.audioPlaybackUrl ?? null);
            setApiActionItems(
                actions.map((a) => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    owner: a.owner,
                    dueDate: a.dueDate,
                    addToTodoChecked: a.addToTodoChecked,
                }))
            );
            setSelectedAnalysisResult({
                analysis: {
                    summary: summary.shortSummary || `Meeting: ${meeting.name}`,
                    keyPoints: summary.keyPoints || [],
                    actionItems: [],
                    keyTakeaways: [],
                },
                transcript: {
                    fullText: transcript.rawText || '',
                    segments: (transcript.segments || []).map((s) => ({
                        speaker: s.speaker,
                        text: s.text,
                        start: s.startSeconds,
                        end: s.endSeconds,
                    })),
                },
            });
        } catch (e) {
            setSelectedAnalysisResult({
                analysis: {
                    summary: `Could not load meeting: ${e instanceof Error ? e.message : 'error'}`,
                    keyPoints: [],
                    actionItems: [],
                    keyTakeaways: [],
                },
                transcript: { fullText: '', segments: [] },
            });
            setApiActionItems([]);
            setAudioPlaybackUrl(null);
        }
    };

    const handleAnalyzedMeetingClick = (meeting: MeetingType & { analysisResult?: MeetingAnalysisResponse }) => {
        setDetailSource('upload');
        setApiMeetingId(null);
        setApiActionItems([]);
        setAudioPlaybackUrl(null);
        if (meeting.analysisResult) {
            setSelectedAnalysisResult(meeting.analysisResult);
            // Store the analysis result for the meeting details view
            setSelectedMeeting({
                id: meeting.id,
                name: meeting.title,
                initials: meeting.title.substring(0, 2).toUpperCase(),
                avatarColor: '#16a34a',
                duration: 'N/A',
                creator: 'System',
                status: 'completed',
                date: meeting.date,
            });
        }
    };

    const handleBackToMeetings = () => {
        setSelectedMeeting(null);
        setSelectedAnalysisResult(null);
        setApiMeetingId(null);
        setApiActionItems([]);
        setAudioPlaybackUrl(null);
    };

    const handleConvertActionToTodo = async (actionItemId: string) => {
        if (!apiMeetingId) return;
        await imApi.convertActionToTodo(apiMeetingId, actionItemId);
        const actions = await imApi.getActionItems(apiMeetingId);
        setApiActionItems(
            actions.map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description,
                owner: a.owner,
                dueDate: a.dueDate,
                addToTodoChecked: a.addToTodoChecked,
            }))
        );
    };

    // If a meeting is selected and we have analysis data, show the details page
    if (selectedMeeting && selectedAnalysisResult) {
        // Ensure all required data exists before rendering
        if (!selectedAnalysisResult.analysis || !selectedAnalysisResult.transcript) {
            console.error('Invalid analysis result structure:', selectedAnalysisResult);
            return (
                <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden items-center justify-center">
                    <div className="text-text-primary">Error: Invalid meeting data. Please try again.</div>
                </div>
            );
        }

        return (
            <MeetingDetails
                summary={selectedAnalysisResult.analysis.summary || ''}
                keyPoints={selectedAnalysisResult.analysis.keyPoints || []}
                actionItems={selectedAnalysisResult.analysis.actionItems || []}
                keyTakeaways={selectedAnalysisResult.analysis.keyTakeaways || []}
                transcript={selectedAnalysisResult.transcript}
                meetingTitle={selectedMeeting.name}
                meetingDate={selectedMeeting.date}
                onBack={handleBackToMeetings}
                meetingIdForApi={detailSource === 'api' ? apiMeetingId : null}
                audioPlaybackUrl={detailSource === 'api' ? audioPlaybackUrl : null}
                apiActionItems={detailSource === 'api' ? apiActionItems : null}
                onConvertActionToTodo={detailSource === 'api' && apiMeetingId ? handleConvertActionToTodo : undefined}
            />
        );
    }

    return (
        <div className=" flex min-h-screen bg-bg-surface-lv1">
            <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            <main className=" flex-1 flex flex-col min-h-screen ml-0 md:ml-[270px] transition-all duration-300">
                <div className="bg-bg-surface-pure border-b border-stroke-primary h-16 flex items-center px-7 sm:px-7">
                    <SearchBar placeholder="Search meetings..." className="sm:w-64" />
                </div>

                <div className=" flex-1 overflow-y-auto">
                    <Container className="py-2 sm:py-2 lg:py-2">
                        {meetingsListHint && (
                            <div className="mb-3 rounded-8 border border-stroke-primary bg-bg-surface-pure px-3 py-2 text-sm text-text-secondary font-inter">
                                {meetingsListHint}
                                <button
                                    type="button"
                                    className="ml-2 text-primary-600 underline font-inter text-sm"
                                    onClick={() => setMeetingsListHint(null)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="   flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between w-full mb-2">
                                <div className="flex-1 w-full sm:w-auto">
                                    <h1 className="font-inter-tight font-medium text-xl sm:text-2xl leading-8 text-text-primary m-0">
                                        My Meetings
                                    </h1>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto relative">
                                    <button
                                        ref={buttonRef}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="bg-primary-500 border-none rounded-8 px-4 sm:px-[10px] py-2 flex items-center justify-center gap-2 cursor-pointer text-white font-inter font-medium text-sm tracking-[-0.084px] leading-5 hover:opacity-90 transition-opacity w-full sm:w-auto"
                                        aria-expanded={isDropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <span>Create New</span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                            <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute bg-bg-surface-pure border border-stroke-primary flex flex-col gap-2 items-start overflow-hidden p-3 sm:p-[10px] rounded-12 sm:rounded-16 shadow-lg top-[calc(100%+8px)] right-0 w-full sm:w-[258px] z-50"
                                            role="menu"
                                        >
                                            <button
                                                onClick={handleAddToLiveMeeting}
                                                className="bg-bg-surface-lv2 flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-full sm:w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors text-left border-none"
                                                role="menuitem"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                                    <path d="M10 2.5C8.75 2.5 7.75 3.5 7.75 4.75V6.5C6.5 7 5.5 8.25 5.5 9.75V13.5L4 15.5V16.5H16V15.5L14.5 13.5V9.75C14.5 8.25 13.5 7 12.25 6.5V4.75C12.25 3.5 11.25 2.5 10 2.5Z" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M7.5 10.5H12.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                                <span className="flex-1 font-inter font-medium text-sm leading-5 text-text-primary tracking-[-0.084px]">
                                                    Add to live meeting
                                                </span>
                                            </button>

                                            <button
                                                onClick={handleScheduleNewMeeting}
                                                className="flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-full sm:w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors border-none text-left bg-transparent"
                                                role="menuitem"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
                                                    <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="flex-1 font-inter font-medium text-sm leading-5 text-text-secondary tracking-[-0.084px]">
                                                    Schedule new meeting
                                                </span>
                                            </button>

                                            <button
                                                onClick={handleUploadAudioRecording}
                                                className="flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-full sm:w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors border-none text-left bg-transparent"
                                                role="menuitem"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
                                                    <path d="M10 13.3333V3.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M6.66667 6.66667L10 3.33333L13.3333 6.66667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3.33333 13.3333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="flex-1 font-inter font-medium text-sm leading-5 text-text-secondary tracking-[-0.084px]">
                                                    Upload audio recording
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowUploadFilesView(!showUploadFilesView);
                                        setShowAllMeetings(!showAllMeetings);
                                    }}
                                    className={`rounded-8 px-3 sm:px-4 py-2 flex items-center justify-center gap-2 cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] leading-5 transition-colors w-full sm:w-auto ${showUploadFilesView
                                            ? 'bg-primary-500 text-white hover:opacity-90'
                                            : 'bg-bg-surface-pure border border-stroke-primary text-text-secondary hover:bg-bg-surface-lv1'
                                        }`}
                                    aria-label="Toggle uploaded files"
                                >

                                    <span>Show Uploaded Files</span>
                                </button>
                            </div>


                        </div>

                        <div className="flex flex-col gap-4 relative min-h-[400px]">
                            {showUploadFilesView ? (
                                <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col overflow-hidden relative z-0 min-h-[400px] overflow-y-auto">
                                    <div className="flex flex-col">
                                        <div className="flex bg-bg-surface-lv2 border-b border-stroke-primary">
                                            <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[517px] rounded-tl-12">
                                                <div className="flex items-center gap-[2px]">
                                                    <span>File Name</span>
                                                   
                                                </div>
                                            </div>
                                            <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary flex-1">
                                                <span>Time</span>
                                            </div>
                                            <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary flex-1">
                                                <span>Status</span>
                                            </div>
                                            <div className="px-3 h-10 flex items-center justify-center w-9 rounded-tr-12"></div>
                                        </div>
                                        {uploadedFiles.map((file) => (
                                            <div key={file.id} className="flex border-b border-stroke-primary last:border-b-0">
                                                <div className="px-3 h-12 flex items-center gap-3 w-[517px]">
                                                    <div className={`overflow-clip relative rounded-full shrink-0 w-6 h-6 flex items-center justify-center ${file.badgeColor === 'primary' ? 'bg-primary-50' : 'bg-orange-50'}`}>
                                                        <p className={`font-inter font-bold text-[9px] leading-normal text-center tracking-[0.4px] m-0 ${file.badgeColor === 'primary' ? 'text-primary-500' : 'text-orange-500'}`}>
                                                            MP4
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-1 flex-col items-start justify-center shrink-0">
                                                        <p className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden text-text-primary tracking-[-0.176px] m-0">
                                                            {file.name}.<span className="text-[#c1c6c5]">{file.extension}</span>
                                                        </p>
                                                        <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                            {file.size}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] flex-1">
                                                    {file.time}
                                                </div>
                                                <div className="px-3 h-12 flex items-center flex-1">
                                                    <div className="bg-[#ffefd4] flex gap-0 items-center justify-center p-1 rounded-8 shrink-0">
                                                        <div className="relative shrink-0 w-4 h-4">
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <circle cx="8" cy="8" r="7" stroke="#735522" strokeWidth="1.5" />
                                                                <path d="M8 5V8M8 11H8.01" stroke="#735522" strokeWidth="1.5" strokeLinecap="round" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex gap-0 items-center justify-center px-1 py-0 relative shrink-0">
                                                            <p className="font-inter font-normal text-xs leading-4 text-[#735522] text-center m-0">
                                                                Progressing transcript
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-3 h-12 flex items-center justify-center w-9">
                                                    <button className="cursor-pointer p-1 hover:bg-bg-surface-lv1 rounded-full transition-colors bg-transparent border-none">
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <circle cx="8" cy="3" r="1.5" fill="#2b3d39" />
                                                            <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                                                            <circle cx="8" cy="13" r="1.5" fill="#2b3d39" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>


                                </div>
                            ) : !showAllMeetings && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-center w-[412px] pointer-events-none z-[1] mt-[100px]">

                                    <div className="flex flex-col gap-0 w-[373px]">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0 mb-4">Transcribe your first meeting</h2>
                                        <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] m-0">
                                            Schedule your calendar event by inviting IntelliMeet Pro, transcribing a live meeting or uploading media.
                                        </p>
                                    </div>
                                </div>
                            )}



                            {showAllMeetings && (
                                <MeetingsTable
                                    meetings={apiMeetings}
                                    analyzedMeetings={analyzedMeetings.map(m => ({ id: m.id, title: m.title, date: m.date }))}
                                    onMeetingClick={handleMeetingClick}
                                    onAnalyzedMeetingClick={(m) => {
                                        const meeting = analyzedMeetings.find(am => am.id === m.id);
                                        if (meeting) handleAnalyzedMeetingClick(meeting);
                                    }}
                                    formatDateShort={formatDateShort}
                                    showAllMeetings={showAllMeetings}
                                />
                            )}
                        </div>
                    </Container>
                </div>
            </main>

            {/* Add to Live Meeting Modal */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur backdrop-filter bg-[rgba(6,27,22,0.3)] z-[1000]"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div
                        ref={modalRef}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface-pure flex flex-col gap-4 items-end overflow-hidden p-4 rounded-[14px] shadow-[0px_12px_40px_1px_rgba(0,0,0,0.06)] w-[612px] z-[1001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex gap-[9px] items-center relative shrink-0 w-full">
                            <div className="flex flex-col justify-center leading-0 relative shrink-0 w-[531px]">
                                <p className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Add to live meeting
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="overflow-clip relative shrink-0 w-6 h-6 cursor-pointer bg-transparent border-none p-0"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 6L18 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="flex gap-[2px] items-center relative shrink-0">
                                <p className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                    Name your meeting
                                </p>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    (optional)
                                </p>
                            </div>
                            <div className="bg-bg-surface-pure border border-stroke-primary flex items-center justify-between px-3 py-2 relative rounded-8 shrink-0 w-full">
                                <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                    <input
                                        type="text"
                                        value={liveName}
                                        onChange={(e) => setLiveName(e.target.value)}
                                        placeholder="Optional display name"
                                        className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-secondary tracking-[-0.176px] border-none outline-none bg-transparent flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="flex gap-[2px] items-center relative shrink-0">
                                <p className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                    Meeting Link
                                </p>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    (optional)
                                </p>
                            </div>
                            <div className="bg-bg-surface-pure border border-stroke-primary flex items-center justify-between px-3 py-2 relative rounded-8 shrink-0 w-full">
                                <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                        <path d="M8.33333 5H5.83333C4.91286 5 4.16667 5.74619 4.16667 6.66667V14.1667C4.16667 15.0871 4.91286 15.8333 5.83333 15.8333H13.3333C14.2538 15.8333 15 15.0871 15 14.1667V11.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11.6667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V9.99999" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.5 7.5L17.5 2.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.5 2.5H17.5V7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <input
                                        type="url"
                                        value={liveLink}
                                        onChange={(e) => setLiveLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-secondary tracking-[-0.176px] border-none outline-none bg-transparent flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {liveJoinBusy && <p className="text-sm text-text-secondary font-inter">Sending bot…</p>}

                        <div className="flex gap-3 items-start relative shrink-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-bg-surface-lv1 border border-bg-surface-pure flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 relative rounded-8 shrink-0 cursor-pointer"
                            >
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">Cancel</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                disabled={liveJoinBusy || !liveLink.trim()}
                                onClick={async () => {
                                    setLiveJoinBusy(true);
                                    try {
                                        await imApi.joinBot(liveLink.trim(), liveName.trim() || 'IntelliMeet Notetaker');
                                        setIsModalOpen(false);
                                        setLiveLink('');
                                        setLiveName('');
                                        setIsSuccessModalOpen(true);
                                        await refreshTableMeetings();
                                    } catch {
                                        setIsSuccessModalOpen(false);
                                    } finally {
                                        setLiveJoinBusy(false);
                                    }
                                }}
                                className="bg-primary-500 flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 relative rounded-8 shrink-0 cursor-pointer disabled:opacity-50 text-white"
                            >
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">Start Capturing</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur backdrop-filter bg-[rgba(6,27,22,0.3)] z-[1000]"
                        onClick={() => setIsSuccessModalOpen(false)}
                    />
                    <div
                        ref={successModalRef}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface-pure flex flex-col gap-4 items-center overflow-hidden p-4 rounded-[14px] w-[612px] z-[1001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Illustration */}
                        <div className="h-[128px] relative shrink-0 w-[172px]">
                            {/* Background circle */}
                            <div className="absolute left-[22px] w-[128px] h-[128px] top-0 bg-primary-500 rounded-full" />

                            {/* Small circles */}
                            <div className="absolute left-[14px] w-3 h-3 top-[14px] bg-primary-500 rounded-full" />
                            <div className="absolute left-[9px] w-4 h-4 top-[104px] bg-primary-500 rounded-full" />
                            <div className="absolute left-[152px] w-4 h-4 top-[28px] bg-primary-500 rounded-full" />
                            <div className="absolute left-[144px] w-[10px] h-[10px] top-1 bg-primary-500 rounded-full" />

                            {/* Cloud illustration - simplified as SVG */}
                            <div className="absolute left-4 top-4 w-[140px] h-[80px] flex items-center justify-center">
                                <svg width="140" height="80" viewBox="0 0 140 80" fill="none" className="absolute">
                                    <path d="M35 40C35 28.9543 43.9543 20 55 20C58.8662 20 62.4568 21.1678 65.3333 23.1421C68.2098 21.1678 71.8004 20 75.6667 20C86.7123 20 95.6667 28.9543 95.6667 40C95.6667 41.1046 95.5233 42.1783 95.2527 43.2067C97.4568 45.1678 99 48.0457 99 51.3333C99 56.8807 94.5473 61.3333 89 61.3333H35C29.4527 61.3333 25 56.8807 25 51.3333C25 45.786 29.4527 41.3333 35 41.3333C35 40.8889 35 40.4444 35 40Z" fill="white" opacity="0.9" />
                                </svg>
                            </div>

                            {/* Checkmark icon */}
                            <div className="absolute bottom-[13px] left-[59px] bg-[rgba(22,163,74,0.1)] flex items-center justify-center p-[11px] rounded-[27px] w-[54px] h-[54px]">
                                <div className="bg-primary-500 flex items-center justify-center p-1 rounded-16 w-8 h-8">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <p className="font-inter-tight font-medium text-2xl leading-8 text-text-primary text-center w-[354px] m-0">
                            IntelliMeet assistant has been invited to the meeting
                        </p>

                        {/* Description */}
                        <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] text-center w-[354px] m-0">
                            Once joined, IntelliMeet notetaker assistant will automatically start taking notes.
                        </p>

                        {/* Open Meeting Button */}
                        <button className="bg-bg-surface-lv1 border border-bg-surface-pure flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 rounded-8 shrink-0 cursor-pointer">
                            <div className="relative shrink-0 w-5 h-5">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect width="20" height="20" rx="4" fill="#00832D" />
                                    <path d="M10 6V14M6 10H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-primary-500 tracking-[-0.084px] whitespace-nowrap">
                                    <p className="leading-5 m-0">Open Meeting</p>
                                </div>
                            </div>
                        </button>

                        {/* Info Button */}
                        <button className="bg-bg-surface-lv1 border border-bg-surface-pure flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 rounded-8 shrink-0 w-full cursor-pointer">
                            <div className="relative shrink-0 w-5 h-5">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="9" stroke="#2b3d39" strokeWidth="1.5" />
                                    <path d="M10 7V10M10 13H10.01" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-1 py-0 relative shrink-0">
                                <div className="flex flex-1 flex-col font-inter font-medium justify-center leading-0 text-sm text-text-secondary tracking-[-0.084px]">
                                    <p className="leading-5 m-0 text-center">
                                        IntelliMeet needs to stay inside the meeting for at least 3 minutes to to process the meeting transcript.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {/* Schedule Meeting Modal */}
            {isScheduleModalOpen && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur backdrop-filter bg-[rgba(6,27,22,0.3)] z-[1000]"
                        onClick={() => setIsScheduleModalOpen(false)}
                    />
                    <div
                        ref={scheduleModalRef}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface-pure flex flex-col gap-4 items-end overflow-hidden p-4 rounded-[14px] shadow-[0px_12px_40px_1px_rgba(0,0,0,0.06)] w-[572px] z-[1001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between relative shrink-0 w-full">
                            <div className="flex flex-col font-inter-tight justify-center leading-0 relative shrink-0 text-2xl text-text-primary w-[531px]">
                                <p className="leading-8 whitespace-pre-wrap m-0">Schedule Meeting</p>
                            </div>
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="overflow-clip relative shrink-0 w-6 h-6 cursor-pointer bg-transparent border-none p-0"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 6L18 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <p className="font-inter font-normal leading-6 not-italic relative shrink-0 text-base text-text-secondary tracking-[-0.176px] w-full whitespace-pre-wrap m-0">
                            Your AI Notetaker will be invited to the calendar meeting to record, transcribe and summarize.
                        </p>

                        <div className="content-stretch flex flex-col gap-3 items-start relative shrink-0 w-full">
                            {/* Google Calendar Button */}
                            <button className="bg-bg-surface-lv1 border border-bg-surface-pure flex gap-1 items-center justify-center overflow-hidden p-[10px] relative rounded-8 shrink-0 w-full cursor-pointer hover:bg-bg-surface-lv2 transition-colors">
                                <div className="relative shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shrink-0 w-8 h-8">
                                    <div className="absolute inset-[6.25%]">
                                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                            <rect width="28" height="28" rx="4" fill="white" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-[18.75%]">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">Google Calendar</p>
                                    </div>
                                </div>
                            </button>


                        </div>
                    </div>
                </>
            )}

            {/* Upload Audio Recording Modal */}
            {isUploadModalOpen && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur backdrop-filter bg-[rgba(6,27,22,0.3)] z-[1000]"
                        onClick={() => setIsUploadModalOpen(false)}
                    />
                    <div
                        ref={uploadModalRef}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface-pure flex flex-col gap-6 items-start overflow-hidden p-4 rounded-[14px] shadow-[0px_12px_40px_1px_rgba(0,0,0,0.06)] w-[612px] z-[1001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex gap-[9px] items-center relative shrink-0 w-full">
                            <div className="flex flex-col font-inter-tight justify-center leading-0 relative shrink-0 text-2xl text-text-primary w-[531px]">
                                <p className="leading-8 whitespace-pre-wrap m-0">Uploading 1 file</p>
                            </div>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="overflow-clip relative shrink-0 w-6 h-6 cursor-pointer bg-transparent border-none p-0"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 6L18 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>



                        {/* Files Section */}
                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="flex gap-[2px] items-center relative shrink-0">
                                <p className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                    Select Audio File
                                </p>
                            </div>
                            {!selectedFile ? (
                                <div className="bg-bg-surface-pure border border-stroke-secondary flex gap-3 items-center px-3 py-2 relative rounded-8 shrink-0 w-full cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*,video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                        <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] m-0">
                                            Click to open file explorer
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-bg-surface-pure border border-stroke-secondary flex gap-3 items-center px-3 py-2 relative rounded-8 shrink-0 w-full">
                                    {/* File Icon */}
                                    <div className="bg-[#3c91e6] overflow-clip relative rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                                        <p className="font-inter font-extrabold text-xs leading-normal text-white text-center tracking-[0.4px] m-0">
                                            {selectedFile.name.split('.').pop()?.toUpperCase().substring(0, 3) || 'FILE'}
                                        </p>
                                    </div>
                                    {/* File Name */}
                                    <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                        <p className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-primary tracking-[-0.176px] m-0">
                                            {selectedFile.name.split('.')[0]}<span className="text-[#c1c6c5]">.{selectedFile.name.split('.').pop()}</span>
                                        </p>
                                    </div>
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="overflow-clip relative shrink-0 w-5 h-5 cursor-pointer bg-transparent border-none p-0"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M15 5L5 15" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 5L15 15" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {error && (
                                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-8 px-3 py-2 w-full">
                                    <p className="font-inter font-normal text-sm text-[#dc2626] m-0">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3 items-start relative shrink-0">
                            <button
                                onClick={handleFileUpload}
                                disabled={!selectedFile || isLoading}
                                className="bg-primary-500 flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 relative rounded-8 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-white tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">{isLoading ? 'Analyzing...' : 'Upload & Analyze'}</p>
                                    </div>
                                </div>
                            </button>
                            {isLoading && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="font-inter font-normal text-sm text-text-secondary">Processing...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Meetings;
