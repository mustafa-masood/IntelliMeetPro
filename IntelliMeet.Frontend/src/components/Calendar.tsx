import React, { useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

interface CalendarMeeting {
    id: string;
    title: string;
    email: string;
    iconColor: string;
    iconType: 'calendar' | 'design' | 'collaboration' | 'leadership' | 'project';
    date: string;
    time: string;
    addRead: boolean;
    flexible: boolean;
}

const Calendar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'schedule'>('upcoming');
    const [proMode, setProMode] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [addReadStates, setAddReadStates] = useState<{ [key: string]: boolean }>({});
    const [flexibleStates, setFlexibleStates] = useState<{ [key: string]: boolean }>({});
    const [defaultLinkStates, setDefaultLinkStates] = useState<{ [key: string]: boolean }>({
        '15min': false,
        '30min': true,
        '45min': true,
        '1hour': true,
    });

    // Mock calendar meetings data
    const calendarMeetings: CalendarMeeting[] = [
        { id: '1', title: 'My Meeting', email: 'hipixem@mail.com', iconColor: '#3B82F6', iconType: 'calendar', date: '09/01/2025', time: '12:35 PM', addRead: false, flexible: false },
        { id: '2', title: 'Happy designing', email: 'hipixem@mail.com', iconColor: '#F59E0B', iconType: 'design', date: '09/01/2025', time: '10:35 PM', addRead: true, flexible: true },
        { id: '3', title: 'Collaboration Catalyst', email: 'hipixem@mail.com', iconColor: '#06B6D4', iconType: 'collaboration', date: '08/01/2025', time: '09:35 PM', addRead: false, flexible: false },
        { id: '4', title: 'Leadership Think Tank', email: 'hipixem@mail.com', iconColor: '#8B5CF6', iconType: 'leadership', date: '08/01/2025', time: '12:35 PM', addRead: true, flexible: false },
        { id: '5', title: 'Project Pulse Check', email: 'hipixem@mail.com', iconColor: '#10B981', iconType: 'project', date: '08/01/2025', time: '10:35 AM', addRead: true, flexible: true },
        { id: '6', title: 'Strategic Planning', email: 'hipixem@mail.com', iconColor: '#EC4899', iconType: 'calendar', date: '07/01/2025', time: '02:00 PM', addRead: false, flexible: true },
        { id: '7', title: 'Design Review', email: 'hipixem@mail.com', iconColor: '#F59E0B', iconType: 'design', date: '07/01/2025', time: '11:00 AM', addRead: true, flexible: false },
        { id: '8', title: 'Team Sync', email: 'hipixem@mail.com', iconColor: '#06B6D4', iconType: 'collaboration', date: '06/01/2025', time: '03:30 PM', addRead: false, flexible: false },
        { id: '9', title: 'Executive Briefing', email: 'hipixem@mail.com', iconColor: '#8B5CF6', iconType: 'leadership', date: '06/01/2025', time: '09:00 AM', addRead: true, flexible: true },
        { id: '10', title: 'Sprint Planning', email: 'hipixem@mail.com', iconColor: '#10B981', iconType: 'project', date: '05/01/2025', time: '01:15 PM', addRead: true, flexible: false },
        { id: '11', title: 'Client Meeting', email: 'hipixem@mail.com', iconColor: '#3B82F6', iconType: 'calendar', date: '05/01/2025', time: '04:45 PM', addRead: false, flexible: true },
        { id: '12', title: 'UI/UX Workshop', email: 'hipixem@mail.com', iconColor: '#F59E0B', iconType: 'design', date: '04/01/2025', time: '10:20 AM', addRead: true, flexible: false },
        { id: '13', title: 'Cross-functional', email: 'hipixem@mail.com', iconColor: '#06B6D4', iconType: 'collaboration', date: '04/01/2025', time: '02:30 PM', addRead: false, flexible: true },
        { id: '14', title: 'Board Meeting', email: 'hipixem@mail.com', iconColor: '#8B5CF6', iconType: 'leadership', date: '03/01/2025', time: '11:00 AM', addRead: true, flexible: false },
        { id: '15', title: 'Product Demo', email: 'hipixem@mail.com', iconColor: '#10B981', iconType: 'project', date: '03/01/2025', time: '03:00 PM', addRead: true, flexible: true },
        { id: '16', title: 'Weekly Standup', email: 'hipixem@mail.com', iconColor: '#3B82F6', iconType: 'calendar', date: '02/01/2025', time: '09:30 AM', addRead: false, flexible: false },
        { id: '17', title: 'Design Critique', email: 'hipixem@mail.com', iconColor: '#F59E0B', iconType: 'design', date: '02/01/2025', time: '01:00 PM', addRead: true, flexible: true },
        { id: '18', title: 'Brainstorming', email: 'hipixem@mail.com', iconColor: '#06B6D4', iconType: 'collaboration', date: '01/01/2025', time: '10:00 AM', addRead: false, flexible: false },
        { id: '19', title: 'All Hands', email: 'hipixem@mail.com', iconColor: '#8B5CF6', iconType: 'leadership', date: '01/01/2025', time: '02:00 PM', addRead: true, flexible: false },
        { id: '20', title: 'Retrospective', email: 'hipixem@mail.com', iconColor: '#10B981', iconType: 'project', date: '31/12/2024', time: '04:00 PM', addRead: true, flexible: true },
    ];

    const totalEntries = 260;
    const entriesPerPage = 20;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    const getIcon = (iconType: string, color: string) => {
        switch (iconType) {
            case 'calendar':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" fill="white" />
                        <path d="M2 6H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M5 1.5V3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 1.5V3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'design':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L13 7L8 12L3 7L8 2Z" fill="white" />
                        <path d="M8 4.5L11 7.5L8 10.5L5 7.5L8 4.5Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'collaboration':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="5.5" cy="5" r="2.5" fill="white" />
                        <circle cx="10.5" cy="5" r="2.5" fill="white" />
                        <path d="M2.5 13C2.5 11 4 9.5 6 9.5H10C12 9.5 13.5 11 13.5 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                );
            case 'leadership':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L9.5 6.5L14 7.5L10.5 11L11.5 16L8 13.5L4.5 16L5.5 11L2 7.5L6.5 6.5L8 2Z" fill="white" />
                    </svg>
                );
            case 'project':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3.5" width="12" height="10" rx="1.5" fill="white" />
                        <path d="M2 7H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="5" cy="5" r="0.5" fill={color} />
                        <circle cx="7" cy="5" r="0.5" fill={color} />
                    </svg>
                );
            default:
                return null;
        }
    };

    const toggleAddRead = (id: string) => {
        setAddReadStates(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleFlexible = (id: string) => {
        setFlexibleStates(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getAddReadState = (id: string, defaultValue: boolean) => {
        return addReadStates[id] !== undefined ? addReadStates[id] : defaultValue;
    };

    const getFlexibleState = (id: string, defaultValue: boolean) => {
        return flexibleStates[id] !== undefined ? flexibleStates[id] : defaultValue;
    };

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <SearchBar />
                    <div className="flex items-center gap-3">
                        {/* <div className="flex items-center gap-2">
                            <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Pro Mode</span>
                            <button
                                onClick={() => setProMode(!proMode)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${proMode ? 'bg-primary-500' : 'bg-neutral-300'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${proMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div> */}
                        <button className="bg-primary-500 border border-primary-500 rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px]">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2.66667V13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2.66667 8H13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Scheduling Link</span>
                        </button>
                    </div>
                </div>

                {/* Page Header */}
                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">Calendar</h1>
                </div>

                {/* Table Container */}
                <div className="px-8 pt-4 flex-1 overflow-y-auto">
                    <div className="max-w-[1106px] w-full mx-auto bg-bg-surface-pure border border-stroke-primary rounded-8">
                        {/* Tab Menu */}
                        <div className="px-4 pt-4 flex items-center gap-6 border-b border-stroke-primary">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`pb-3 font-inter font-medium text-sm tracking-[-0.084px] border-b-2 transition-colors ${activeTab === 'upcoming' ? 'text-text-primary border-primary-500' : 'text-text-secondary border-transparent'}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('schedule')}
                                className={`pb-3 font-inter font-medium text-sm tracking-[-0.084px] border-b-2 transition-colors ${activeTab === 'schedule' ? 'text-text-primary border-primary-500' : 'text-text-secondary border-transparent'}`}
                            >
                                Schedule
                            </button>
                        </div>

                        {/* Schedule Tab Content */}
                        {activeTab === 'schedule' ? (
                            <>
                                {/* Calendar Info Section */}
                                <div className="px-4 pt-4 pb-3 flex items-center justify-between bg-bg-surface-lv1">
                                    <div className="flex items-center gap-2">
                                        <div className="border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 bg-bg-surface-pure">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M13.3333 1.66667V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6.66667 1.66667V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2.5 8.33333H17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                                Scheduling based on :studiopixen@gmail.com (Google Calendar)
                                            </span>
                                        </div>
                                        <button className="px-3 py-2 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer hover:opacity-80">
                                            Change Calendar
                                        </button>
                                        <button className="px-3 py-2 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer hover:opacity-80">
                                            Scheduling Settings
                                        </button>
                                    </div>
                                    <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 2.5V17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2.5 10H17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>+ Add to a live meeting</span>
                                    </button>
                                </div>

                                {/* Two Column Layout */}
                                <div className="px-4 pb-4 flex gap-3">
                                    {/* Left Column - Default scheduling links */}
                                    <div className="w-[490px] bg-bg-surface-pure border border-stroke-primary rounded-12 p-4 flex flex-col gap-5">
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-inter font-medium text-lg text-text-primary tracking-[-0.27px] m-0">
                                                Default scheduling links
                                            </h3>
                                            <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] m-0">
                                                Allows others to schedule a meeting with you. when someone visits your general scheduling link (cal.IntelliMeet.ai/pixen-sxkgo).
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">
                                                4 links (3 active)
                                            </p>
                                            {[
                                                { id: '15min', title: '15-minute Meeting', duration: '15 minutes', link: 'cal.IntelliMeet.ai/pixen-sxkgo.30-min', active: defaultLinkStates['15min'] },
                                                { id: '30min', title: '30- minute Meeting', duration: '30 minutes', link: 'cal.IntelliMeet.ai/pixen-sxkgo.30-min', active: defaultLinkStates['30min'] },
                                                { id: '45min', title: '45-minute Meeting', duration: '45 minutes', link: 'cal.IntelliMeet.ai/pixen-sxkgo.30-min', active: defaultLinkStates['45min'] },
                                                { id: '1hour', title: '1-hours Meeting', duration: '1 hours', link: 'cal.IntelliMeet.ai/pixen-sxkgo.30-min', active: defaultLinkStates['1hour'] },
                                            ].map((link) => (
                                                <div key={link.id} className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <button
                                                                onClick={() => setDefaultLinkStates(prev => ({ ...prev, [link.id]: !prev[link.id] }))}
                                                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 mt-0.5 ${link.active ? 'bg-primary-500' : 'bg-stroke-primary'}`}
                                                            >
                                                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 border-2 ${link.active ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-stroke-primary'}`} />
                                                            </button>
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <span className="font-inter font-normal text-base text-text-primary tracking-[-0.176px]">{link.title}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="6" stroke="#2b3d39" strokeWidth="1.5" />
                                                                        <path d="M8 5V8L10 10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                    <span className="font-inter font-normal text-xs text-text-secondary">{link.duration}</span>
                                                                </div>
                                                                <span className="font-inter font-normal text-xs text-blue-500">{link.link}</span>
                                                            </div>
                                                        </div>
                                                        <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-1.5 cursor-pointer hover:bg-bg-surface-lv1 transition-colors">
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <path d="M10 2.66667V13.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M2.66667 8H13.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column - Custom scheduling links */}
                                    <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-4 flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-inter font-medium text-lg text-text-primary tracking-[-0.27px] m-0">
                                                    Custom scheduling links
                                                </h3>
                                                <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] m-0">
                                                    Send one of the links below to allow others to schedule a meeting based on specific constraints. These links do not expire.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">0 links</span>
                                                <button className="font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] cursor-pointer hover:opacity-80">
                                                    New custom link
                                                </button>
                                            </div>
                                            <div className="bg-bg-surface-lv1 border border-stroke-secondary border-dashed rounded-md p-9 flex flex-col items-center justify-center gap-4">
                                                <div className="relative w-[172px] h-[128px] flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-primary-50 rounded-full opacity-50" />
                                                    <div className="relative bg-primary-50 rounded-[27px] p-3 flex items-center justify-center">
                                                        <div className="bg-primary-500 rounded-2xl p-1 flex items-center justify-center">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M10 13C10.5523 13 11 12.5523 11 12C11 11.4477 10.5523 11 10 11C9.44772 11 9 11.4477 9 12C9 12.5523 9.44772 13 10 13Z" fill="white" />
                                                                <path d="M14 13C14.5523 13 15 12.5523 15 12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12C13 12.5523 13.4477 13 14 13Z" fill="white" />
                                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-2 text-center">
                                                    <h4 className="font-inter-tight font-medium text-2xl text-text-primary m-0">No custom links</h4>
                                                    <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0 max-w-md">
                                                        Create a new custom scheduling link to choose specific constraints links duration, video conferencing platform, and more.
                                                    </p>
                                                </div>
                                                <button className="bg-primary-500 border border-primary-500 rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:opacity-90 transition-opacity">
                                                    New custom link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Filters and Actions */}
                                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button className="border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-bg-surface-pure">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M2 4H14" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M4 8H12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6 12H10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>Filter</span>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 6L8 10L12 6" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button className="border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-bg-surface-pure">
                                            <span>Has video conference</span>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 6L8 10L12 6" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button className="bg-primary-500 border border-primary-500 rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px]">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 2.66667V13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2.66667 8H13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>+ Add to a live meeting</span>
                                    </button>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-stroke-primary">
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Meeting</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Date</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Time</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Add Read?</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Flexible?</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">Share</th>
                                                <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calendarMeetings.map((meeting) => {
                                                const addRead = getAddReadState(meeting.id, meeting.addRead);
                                                const flexible = getFlexibleState(meeting.id, meeting.flexible);
                                                return (
                                                    <tr key={meeting.id} className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-8 flex items-center justify-center shrink-0" style={{ backgroundColor: meeting.iconColor }}>
                                                                    {getIcon(meeting.iconType, meeting.iconColor)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">{meeting.title}</span>
                                                                    <span className="font-inter font-normal text-xs text-text-tertiary tracking-[-0.07px]">{meeting.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">{meeting.date}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">{meeting.time}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => toggleAddRead(meeting.id)}
                                                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${addRead ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                                            >
                                                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${addRead ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => toggleFlexible(meeting.id)}
                                                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${flexible ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                                            >
                                                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${flexible ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-bg-surface-lv1 rounded-4 transition-colors">
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M8 10.6667V5.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M5.33333 8L8 10.6667L10.6667 8" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M2.66667 13.3333C2.66667 12.2288 3.5621 11.3333 4.66667 11.3333H11.3333C12.4379 11.3333 13.3333 12.2288 13.3333 13.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-bg-surface-lv1 rounded-4 transition-colors">
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <circle cx="8" cy="4" r="1" fill="#2b3d39" />
                                                                    <circle cx="8" cy="8" r="1" fill="#2b3d39" />
                                                                    <circle cx="8" cy="12" r="1" fill="#2b3d39" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {activeTab === 'upcoming' && (
                                    <div className="px-4 py-4 border-t border-stroke-primary flex items-center justify-between">
                                        <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                                            Showing {((currentPage - 1) * entriesPerPage) + 1}-{Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-3 py-2 rounded-8 border border-stroke-primary font-inter font-medium text-sm tracking-[-0.084px] ${currentPage === 1 ? 'bg-bg-surface-lv1 text-text-tertiary cursor-not-allowed' : 'bg-bg-surface-pure text-text-secondary cursor-pointer hover:bg-bg-surface-lv1'}`}
                                            >
                                                &lt; Previous
                                            </button>
                                            {currentPage > 2 && (
                                                <>
                                                    <button
                                                        onClick={() => setCurrentPage(1)}
                                                        className="px-3 py-2 rounded-8 border border-stroke-primary bg-bg-surface-pure text-text-secondary font-inter font-medium text-sm tracking-[-0.084px] cursor-pointer hover:bg-bg-surface-lv1"
                                                    >
                                                        1
                                                    </button>
                                                    {currentPage > 3 && <span className="px-2 text-text-tertiary">...</span>}
                                                </>
                                            )}
                                            {currentPage > 1 && (
                                                <button
                                                    onClick={() => setCurrentPage(currentPage - 1)}
                                                    className="px-3 py-2 rounded-8 border border-stroke-primary bg-bg-surface-pure text-text-secondary font-inter font-medium text-sm tracking-[-0.084px] cursor-pointer hover:bg-bg-surface-lv1"
                                                >
                                                    {currentPage - 1}
                                                </button>
                                            )}
                                            <button
                                                className="px-3 py-2 rounded-8 border border-primary-500 bg-primary-500 text-white font-inter font-medium text-sm tracking-[-0.084px]"
                                            >
                                                {currentPage}
                                            </button>
                                            {currentPage < totalPages && (
                                                <button
                                                    onClick={() => setCurrentPage(currentPage + 1)}
                                                    className="px-3 py-2 rounded-8 border border-stroke-primary bg-bg-surface-pure text-text-secondary font-inter font-medium text-sm tracking-[-0.084px] cursor-pointer hover:bg-bg-surface-lv1"
                                                >
                                                    {currentPage + 1}
                                                </button>
                                            )}
                                            {currentPage < totalPages - 1 && (
                                                <>
                                                    {currentPage < totalPages - 2 && <span className="px-2 text-text-tertiary">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className="px-3 py-2 rounded-8 border border-stroke-primary bg-bg-surface-pure text-text-secondary font-inter font-medium text-sm tracking-[-0.084px] cursor-pointer hover:bg-bg-surface-lv1"
                                                    >
                                                        {totalPages}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`px-3 py-2 rounded-8 border border-stroke-primary font-inter font-medium text-sm tracking-[-0.084px] ${currentPage === totalPages ? 'bg-bg-surface-lv1 text-text-tertiary cursor-not-allowed' : 'bg-bg-surface-pure text-text-secondary cursor-pointer hover:bg-bg-surface-lv1'}`}
                                            >
                                                Next &gt;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;

