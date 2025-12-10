import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import TeamCreationSidebar from './TeamCreationSidebar';
import MeetingDetails from './MeetingDetails';

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

const Meetings: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showUploadFilesView, setShowUploadFilesView] = useState(false);
    const [showAllMeetings, setShowAllMeetings] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
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

    // Mock meetings data
    const meetings: Meeting[] = [
        { id: '1', name: 'Design Explanations', initials: 'DE', avatarColor: '#3B82F6', duration: '1hours 30min', creator: 'Thomas L. Fletcher', status: 'coming-soon', date: '02 Jan 2025, 08:43 AM' },
        { id: '2', name: 'Project Discussions', initials: 'PD', avatarColor: '#8B5CF6', duration: '1hours', creator: 'Andre Tie', status: 'coming-soon', date: '03 Jan 2025, 10:15 AM' },
        { id: '3', name: 'Vision & Goals Workshop', initials: 'PO', avatarColor: '#EC4899', duration: '30min', creator: 'Cristian Robarts', status: 'coming-soon', date: '04 Jan 2025, 02:00 PM' },
        { id: '4', name: 'Weekly Alignment Huddle', initials: 'EF', avatarColor: '#10B981', duration: '2hours', creator: 'Allies Holland', status: 'coming-soon', date: '05 Jan 2025, 09:30 AM' },
        { id: '5', name: 'Innovation Roundtable', initials: 'IR', avatarColor: '#F59E0B', duration: '1.30 Hours', creator: 'Jhon Smith', status: 'coming-soon', date: '06 Jan 2025, 11:00 AM' },
        { id: '6', name: 'Operational Excellence Review', initials: 'OE', avatarColor: '#EF4444', duration: '1hours', creator: 'Thomas L. Fletcher', status: 'completed', date: '22 Dec 2024, 02:33 PM' },
        { id: '7', name: 'Customer Success Insights', initials: 'CS', avatarColor: '#06B6D4', duration: '45min', creator: 'Andre Tie', status: 'completed', date: '21 Dec 2024, 03:15 PM' },
        { id: '8', name: 'Work Overview', initials: 'WO', avatarColor: '#84CC16', duration: '1hours', creator: 'Cristian Robarts', status: 'completed', date: '20 Dec 2024, 10:00 AM' },
        { id: '9', name: 'Team Retrospective', initials: 'TR', avatarColor: '#F97316', duration: '1hours 30min', creator: 'Allies Holland', status: 'completed', date: '19 Dec 2024, 04:45 PM' },
        { id: '10', name: 'Growth Acceleration Forum', initials: 'WD', avatarColor: '#6366F1', duration: '2hours', creator: 'Jhon Smith', status: 'completed', date: '18 Dec 2024, 01:30 PM' },
        { id: '11', name: 'Problem-Solving Lab', initials: 'PS', avatarColor: '#14B8A6', duration: '1hours', creator: 'Thomas L. Fletcher', status: 'completed', date: '17 Dec 2024, 09:00 AM' },
        { id: '12', name: 'Quarterly Roadmap Update', initials: 'QR', avatarColor: '#A855F7', duration: '1hours 15min', creator: 'Andre Tie', status: 'completed', date: '16 Dec 2024, 11:20 AM' },
        { id: '13', name: 'Key Metrics Review', initials: 'KM', avatarColor: '#EC4899', duration: '30min', creator: 'Cristian Robarts', status: 'completed', date: '15 Dec 2024, 02:00 PM' },
        { id: '14', name: 'Strategic Planning Session', initials: 'SP', avatarColor: '#10B981', duration: '2hours', creator: 'Allies Holland', status: 'completed', date: '14 Dec 2024, 10:30 AM' },
        { id: '15', name: 'Product Launch Discussion', initials: 'PL', avatarColor: '#F59E0B', duration: '1hours 45min', creator: 'Jhon Smith', status: 'completed', date: '13 Dec 2024, 03:00 PM' },
    ];

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

    const handleMeetingClick = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
    };

    const handleBackToMeetings = () => {
        setSelectedMeeting(null);
    };

    // If a meeting is selected, show the details page
    if (selectedMeeting) {
        return <MeetingDetails meeting={selectedMeeting} onBack={handleBackToMeetings} />;
    }

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] mr-[190px] flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-[100]">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 w-[238px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 14L11.1 11.1" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[-0.084px] bg-transparent placeholder:text-text-secondary"
                            placeholder="Search"
                        />
                        <div className="border border-stroke-primary rounded-[7px] px-[6px] py-0 font-inter text-sm text-text-secondary tracking-[-0.084px] leading-5">⌘ 1</div>
                    </div>
                    {showAllMeetings && (
                        <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>All</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <div className="flex gap-3 items-center w-full">
                        <div className="flex-1 flex flex-col">
                            <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                {showUploadFilesView ? 'My Meetings' : showAllMeetings ? 'My Meeting' : 'My Meetings'}
                            </h1>
                        </div>
                        <div className="flex gap-3 items-center relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="bg-primary-500 border-none rounded-8 px-[10px] py-2 flex items-center gap-[2px] cursor-pointer text-white font-inter font-medium text-sm tracking-[-0.084px] leading-5"
                            >
                                <span>Create New</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute bg-bg-surface-pure border border-stroke-primary flex flex-col gap-2 items-start overflow-hidden p-[10px] rounded-16 shadow-[0px_12px_40px_1px_rgba(0,0,0,0.06)] top-[calc(100%+8px)] right-0 w-[258px] z-50"
                                >
                                    <div
                                        onClick={handleAddToLiveMeeting}
                                        className="bg-bg-surface-lv2 flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                            <path d="M10 2.5C8.75 2.5 7.75 3.5 7.75 4.75V6.5C6.5 7 5.5 8.25 5.5 9.75V13.5L4 15.5V16.5H16V15.5L14.5 13.5V9.75C14.5 8.25 13.5 7 12.25 6.5V4.75C12.25 3.5 11.25 2.5 10 2.5Z" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M7.5 10.5H12.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <p className="flex-1 font-inter font-medium text-sm leading-5 text-text-primary tracking-[-0.084px] m-0">
                                            Add to live meeting
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleScheduleNewMeeting}
                                        className="flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors border-none text-left bg-transparent"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                            <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="flex-1 font-inter font-medium text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            Schedule new meeting
                                        </p>
                                    </button>

                                    <button
                                        onClick={handleUploadAudioRecording}
                                        className="flex gap-[6px] items-center overflow-hidden p-2 relative rounded-8 shrink-0 w-[238px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors border-none text-left bg-transparent"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                                            <path d="M10 13.3333V3.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M6.66667 6.66667L10 3.33333L13.3333 6.66667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.33333 13.3333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="flex-1 font-inter font-medium text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            Upload audio recording
                                        </p>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 items-center w-full">
                        <div className="flex gap-2 items-start">
                            <div className="border border-stroke-primary rounded-8 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.05)] overflow-hidden">
                                <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.07px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                                    <span>Add to live meeting</span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M5 10H15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                            <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-[10px] py-2 flex items-center gap-[2px] cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.07px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                                <span>Schedule</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-[10px] py-2 flex items-center gap-[2px] cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                            <span>Upload</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 13.3333V3.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.66667 6.66667L10 3.33333L13.3333 6.66667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.33333 13.3333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8  max-w-[1106px] w-full mx-auto flex flex-col gap-4 relative min-h-[calc(100vh-200px)] ">
                    {showUploadFilesView ? (
                        <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col overflow-hidden relative z-0 min-h-[400px] overflow-y-auto">
                            <div className="flex flex-col">
                                <div className="flex bg-bg-surface-lv2 border-b border-stroke-primary">
                                    <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[517px] rounded-tl-12">
                                        <div className="flex items-center gap-[2px]">
                                            <span>File</span>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 4V12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M4 8H12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
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

                            <div className="p-3 flex items-center justify-center rounded-10">
                                <div className="flex items-center justify-between w-full">
                                    <div className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                                        Showing 1-20 of 260 entries
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>Previous</span>
                                        </button>
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[8px] pr-[9px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">1</button>
                                        <button className="bg-primary-500 text-white border border-primary-500 rounded-8 px-[8px] pr-[9px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] leading-5 min-w-[32px] justify-center">2</button>
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">...</button>
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-1 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">16</button>
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 pl-[5px] pr-1 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">17</button>
                                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">
                                            <span>Next</span>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M7.5 5L12.5 10L7.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !showAllMeetings && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-center w-[412px] pointer-events-none z-[1] mt-[100px]">
                            <div className="relative w-[166px] h-[135px]">
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[119px] h-[119px] bg-bg-surface-lv1 rounded-full" />
                                <div className="absolute left-1/2 top-[26px] -translate-x-1/2 w-[145px] h-[72px] bg-bg-surface-pure border-[0.469px] border-stroke-primary rounded-[5.625px] shadow-[0px_0.938px_1.875px_0px_rgba(24,35,34,0.05)]" />
                                <div className="absolute left-1/2 top-[37px] -translate-x-1/2 w-[166px] h-[50px] bg-bg-surface-pure border-[0.469px] border-stroke-primary rounded-[7.5px] shadow-[0px_11.25px_15px_-3.75px_rgba(24,35,34,0.08),0px_3.75px_5.625px_-1.875px_rgba(24,35,34,0.03)]" />
                                <div className="absolute left-[51px] top-[49px] w-[106px] flex flex-col gap-2">
                                    <div className="w-[94px] h-1 bg-[#dadddc] rounded-[5.625px]" />
                                    <div className="flex flex-col gap-2">
                                        <div className="w-[106px] h-1 bg-bg-surface-lv2 rounded-[5.625px]" />
                                        <div className="w-[81px] h-1 bg-bg-surface-lv2 rounded-[5.625px]" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0 w-[373px]">
                                <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0 mb-4">Transcribe your first meeting</h2>
                                <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] m-0">
                                    Schedule your calendar event by inviting Fireflies, transcribing a live meeting or uploading media.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col overflow-hidden relative z-0 min-h-[400px]">
                        <div className="flex flex-col">
                            <div className="flex bg-bg-surface-lv2 border-b border-stroke-primary">
                                <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[328px] rounded-tl-10">
                                    <div className="flex items-center gap-[2px]">
                                        <span>Meeting Name</span>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 4V12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M4 8H12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[164px]">
                                    <span>Duration</span>
                                </div>
                                <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[152px]">
                                    <span>Creator</span>
                                </div>
                                <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary w-[145px]">
                                    <span>Status</span>
                                </div>
                                <div className="px-3 h-10 flex items-center font-inter font-normal text-sm text-text-secondary flex-1">
                                    <span>Date</span>
                                </div>
                                <div className="px-3 h-10 flex items-center justify-center w-9 rounded-tr-10"></div>
                            </div>

                            {showAllMeetings ? (
                                meetings.map((meeting) => (
                                    <div key={meeting.id} className="flex border-b border-stroke-primary">
                                        <div className="px-3 h-12 flex items-center gap-2 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[328px]">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-inter font-medium text-xs"
                                                style={{ backgroundColor: meeting.avatarColor }}
                                            >
                                                {meeting.initials}
                                            </div>
                                            <button
                                                onClick={() => handleMeetingClick(meeting)}
                                                className="font-inter font-medium text-sm text-text-primary cursor-pointer hover:underline text-left"
                                            >
                                                {meeting.name}
                                            </button>
                                        </div>
                                        <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[164px]">
                                            {meeting.duration}
                                        </div>
                                        <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[152px]">
                                            {meeting.creator}
                                        </div>
                                        <div className="px-3 h-12 flex items-center w-[145px]">
                                            {meeting.status === 'coming-soon' ? (
                                                <span className="bg-orange-500 text-white px-2 py-1 rounded-full font-inter font-medium text-xs">
                                                    Coming soon
                                                </span>
                                            ) : (
                                                <span className="bg-primary-500 text-white px-2 py-1 rounded-full font-inter font-medium text-xs">
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                        <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] flex-1">
                                            {formatDateShort(meeting.date)}
                                        </div>
                                        <div className="px-3 h-12 flex items-center justify-center w-9">
                                            <button className="cursor-pointer p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <circle cx="8" cy="3" r="1.5" fill="#2b3d39" />
                                                    <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                                                    <circle cx="8" cy="13" r="1.5" fill="#2b3d39" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex border-b border-stroke-primary">
                                    <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[328px]"></div>
                                    <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[164px]"></div>
                                    <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-[152px]"></div>
                                    <div className="px-3 h-12 flex items-center w-[145px]"></div>
                                    <div className="px-3 h-12 flex items-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] flex-1"></div>
                                    <div className="px-3 h-12 flex items-center justify-center w-9"></div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 flex items-center justify-center rounded-10">
                            <div className="flex items-center justify-between w-full">
                                <div className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                                    Showing 1-20 of 260 entries
                                </div>
                                <div className="flex gap-2 items-center">
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>Previous</span>
                                    </button>
                                    <button className="bg-primary-500 text-text-white border border-primary-500 rounded-8 px-[8px] pr-[9px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] leading-5 min-w-[32px] justify-center">1</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 pl-[8px] pr-[9px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">2</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">3</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">...</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-1 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">16</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 pl-[5px] pr-1 py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">17</button>
                                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 min-w-[32px] justify-center">
                                        <span>Next</span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7.5 5L12.5 10L7.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TeamCreationSidebar onAllMeetingsClick={() => {
                setShowAllMeetings(true);
                setShowUploadFilesView(false);
            }} />

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
                                        placeholder="Placeholder"
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
                                        type="text"
                                        placeholder="Placeholder"
                                        className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-secondary tracking-[-0.176px] border-none outline-none bg-transparent flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="flex gap-[2px] items-center relative shrink-0">
                                <p className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                    Meeting Language
                                </p>
                            </div>
                            <div className="bg-bg-surface-pure border border-stroke-primary flex items-center justify-between px-3 py-2 relative rounded-8 shrink-0 w-full">
                                <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                    <p className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-secondary tracking-[-0.176px] m-0">
                                        English USA
                                    </p>
                                </div>
                                <div className="overflow-clip relative shrink-0 w-5 h-5 cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

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
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsSuccessModalOpen(true);
                                }}
                                className="bg-bg-surface-lv1 flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 relative rounded-8 shrink-0 cursor-pointer"
                            >
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-text-tertiary tracking-[-0.084px] whitespace-nowrap">
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

                            {/* Microsoft OneDrive Button */}
                            <button className="bg-bg-surface-lv1 border border-bg-surface-pure flex gap-1 items-center justify-center overflow-hidden p-[10px] relative rounded-8 shrink-0 w-full cursor-pointer hover:bg-bg-surface-lv2 transition-colors">
                                <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 2.5L3.75 7.5V17.5L10 12.5L16.25 17.5V7.5L10 2.5Z" fill="#0078D4" />
                                        <path d="M10 2.5L3.75 7.5L10 12.5L16.25 7.5L10 2.5Z" fill="#0078D4" opacity="0.8" />
                                    </svg>
                                </div>
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">Microsoft ondrive</p>
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

                        {/* Language Selection */}
                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="bg-bg-surface-pure border border-stroke-secondary flex items-center justify-between px-3 py-2 relative rounded-8 shrink-0 w-full">
                                <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                    <p className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-primary tracking-[-0.176px] m-0">
                                        English USA
                                    </p>
                                </div>
                                <div className="overflow-clip relative shrink-0 w-5 h-5 cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Files Section */}
                        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
                            <div className="flex gap-[2px] items-center relative shrink-0">
                                <p className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                    Files
                                </p>
                            </div>
                            <div className="bg-bg-surface-pure border border-stroke-secondary flex gap-3 items-center px-3 py-2 relative rounded-8 shrink-0 w-full">
                                {/* MP3 Icon */}
                                <div className="bg-[#3c91e6] overflow-clip relative rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                                    <p className="font-inter font-extrabold text-xs leading-normal text-white text-center tracking-[0.4px] m-0">
                                        MP3
                                    </p>
                                </div>
                                {/* File Name */}
                                <div className="flex flex-1 gap-2 items-center p-0 relative shrink-0">
                                    <p className="font-inter font-normal text-base leading-6 overflow-ellipsis overflow-hidden relative shrink-0 text-text-primary tracking-[-0.176px] m-0">
                                        AUD_20240209_15421564.<span className="text-[#c1c6c5]">mp3</span>
                                    </p>
                                </div>
                                {/* Remove Button */}
                                <button className="overflow-clip relative shrink-0 w-5 h-5 cursor-pointer bg-transparent border-none p-0">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15 5L5 15" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 5L15 15" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3 items-start relative shrink-0">
                            <button
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setShowUploadFilesView(true);
                                }}
                                className="bg-primary-500 flex gap-1 items-center justify-center overflow-hidden px-[10px] py-2 relative rounded-8 shrink-0 cursor-pointer"
                            >
                                <div className="flex items-center justify-center px-1 py-0 relative shrink-0">
                                    <div className="flex flex-col font-inter font-medium justify-center leading-0 relative shrink-0 text-sm text-white tracking-[-0.084px] whitespace-nowrap">
                                        <p className="leading-5 m-0">Upload</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Meetings;
