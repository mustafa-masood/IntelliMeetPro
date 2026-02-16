import React from 'react';

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

interface MeetingsTableProps {
    meetings: Meeting[];
    analyzedMeetings?: Array<{ id: string; title: string; date: string }>;
    onMeetingClick: (meeting: Meeting) => void;
    onAnalyzedMeetingClick: (meeting: { id: string; title: string; date: string }) => void;
    formatDateShort: (date: string) => string;
    showAllMeetings: boolean;
}

const MeetingsTable: React.FC<MeetingsTableProps> = ({
    meetings,
    analyzedMeetings = [],
    onMeetingClick,
    onAnalyzedMeetingClick,
    formatDateShort,
    showAllMeetings
}) => {
    const allMeetings = [
        ...(analyzedMeetings || []).map(m => ({
            id: m.id,
            name: m.title,
            initials: m.title.substring(0, 2).toUpperCase(),
            avatarColor: '#16a34a',
            duration: 'N/A',
            creator: 'System',
            status: 'completed' as const,
            date: m.date,
            isAnalyzed: true
        })),
        ...meetings.map(m => ({ ...m, isAnalyzed: false }))
    ];

    // Desktop Table View
    const DesktopTable = () => (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-bg-surface-lv2 border-b border-stroke-primary">
                        <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary">
                            Meeting Name
                        </th>
                        <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary">
                            Duration
                        </th>
                        <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary">
                            Creator
                        </th>
                        <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary">
                            Status
                        </th>
                        <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary">
                            Date
                        </th>
                        <th className="px-3 sm:px-4 h-10 w-12">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {allMeetings.map((meeting) => (
                        <tr 
                            key={meeting.id} 
                            className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors"
                        >
                            <td className="px-3 sm:px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-inter font-medium text-xs shrink-0"
                                        style={{ backgroundColor: meeting.avatarColor }}
                                    >
                                        {meeting.initials}
                                    </div>
                                    <button
                                        onClick={() => meeting.isAnalyzed 
                                            ? onAnalyzedMeetingClick({ id: meeting.id, title: meeting.name, date: meeting.date })
                                            : onMeetingClick(meeting)
                                        }
                                        className="font-inter font-medium text-sm text-text-primary cursor-pointer hover:underline text-left truncate"
                                    >
                                        {meeting.name}
                                    </button>
                                </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary">
                                {meeting.duration}
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary truncate max-w-[150px]">
                                {meeting.creator}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                                <span className={`px-2 py-1 rounded-full font-inter font-medium text-xs ${
                                    meeting.status === 'coming-soon'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-primary-500 text-white'
                                }`}>
                                    {meeting.status === 'coming-soon' ? 'Coming soon' : 'Completed'}
                                </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary whitespace-nowrap">
                                {formatDateShort(meeting.date)}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                                <button 
                                    className="cursor-pointer p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors"
                                    aria-label={`More options for ${meeting.name}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <circle cx="8" cy="3" r="1.5" fill="#2b3d39" />
                                        <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                                        <circle cx="8" cy="13" r="1.5" fill="#2b3d39" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Mobile Card View
    const MobileCards = () => (
        <div className="md:hidden flex flex-col divide-y divide-stroke-primary">
            {allMeetings.map((meeting) => (
                <div 
                    key={meeting.id} 
                    className="p-4 hover:bg-bg-surface-lv1 transition-colors"
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-inter font-medium text-xs shrink-0"
                            style={{ backgroundColor: meeting.avatarColor }}
                        >
                            {meeting.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <button
                                onClick={() => meeting.isAnalyzed 
                                    ? onAnalyzedMeetingClick({ id: meeting.id, title: meeting.name, date: meeting.date })
                                    : onMeetingClick(meeting)
                                }
                                className="font-inter font-medium text-sm text-text-primary mb-2 block text-left hover:underline w-full"
                            >
                                {meeting.name}
                            </button>
                            <div className="flex flex-wrap gap-2 text-xs text-text-secondary mb-2">
                                <span>{meeting.duration}</span>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{meeting.creator}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full font-inter font-medium text-xs ${
                                    meeting.status === 'coming-soon'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-primary-500 text-white'
                                }`}>
                                    {meeting.status === 'coming-soon' ? 'Coming soon' : 'Completed'}
                                </span>
                                <span className="font-inter font-normal text-xs text-text-secondary">
                                    {formatDateShort(meeting.date)}
                                </span>
                            </div>
                        </div>
                        <button 
                            className="cursor-pointer p-1 hover:bg-bg-surface-lv2 rounded-4 transition-colors shrink-0"
                            aria-label={`More options for ${meeting.name}`}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <circle cx="8" cy="3" r="1.5" fill="#2b3d39" />
                                <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                                <circle cx="8" cy="13" r="1.5" fill="#2b3d39" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    if (!showAllMeetings) {
        return (
            <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col overflow-hidden min-h-[400px]">
                <div className="p-8 text-center text-text-secondary">
                    No meetings to display
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col overflow-hidden min-h-[400px]">
            <DesktopTable />
            <MobileCards />
        </div>
    );
};

export default MeetingsTable;
