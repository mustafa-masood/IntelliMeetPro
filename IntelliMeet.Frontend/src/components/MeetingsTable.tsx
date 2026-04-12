import React, { useState } from 'react';

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

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

    const totalMeetings = allMeetings.length;
    const totalPages = Math.ceil(totalMeetings / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMeetings = allMeetings.slice(startIndex, startIndex + itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Desktop Table View
    const DesktopTable = () => (
        <div className="hidden md:flex flex-col flex-1 min-h-0">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-bg-surface-lv2 border-b border-stroke-primary">
                            <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary ">
                                Meeting Name
                            </th>
                            <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary w-[15%]">
                                Duration
                            </th>
                            <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary w-[20%]">
                                Creator
                            </th>
                            <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary w-[12%]">
                                Status
                            </th>
                            <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary w-[15%]">
                                Date
                            </th>
                            <th className="px-3 sm:px-4 h-10 w-12">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              <table className="w-full border-collapse table-fixed">
  <tbody>
    {paginatedMeetings.map((meeting) => (
      <tr
        key={meeting.id}
        className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors"
      >
        {/* NAME */}
        <td className="px-3 sm:px-4 py-3 w-[35%]">
          <div className="flex items-center gap-2 w-full min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-inter font-medium text-xs shrink-0"
              style={{ backgroundColor: meeting.avatarColor }}
            >
              {meeting.initials}
            </div>

            <button
              onClick={() =>
                meeting.isAnalyzed
                  ? onAnalyzedMeetingClick({
                      id: meeting.id,
                      title: meeting.name,
                      date: meeting.date,
                    })
                  : onMeetingClick(meeting)
              }
              className="font-inter font-medium text-sm text-text-primary cursor-pointer hover:underline text-left truncate block w-full"
            >
              {meeting.name}
            </button>
          </div>
        </td>

        {/* DURATION */}
        <td className="px-3 sm:px-4 py-3 w-[12%] whitespace-nowrap text-sm text-text-secondary">
          {meeting.duration}
        </td>

        {/* CREATOR */}
        <td className="px-3 sm:px-4 py-3 w-[20%] truncate text-sm text-text-secondary">
          {meeting.creator}
        </td>

        {/* STATUS */}
        <td className="px-3 sm:px-4 py-3 w-[15%]">
          <span
            className={`px-2 py-1 rounded-full font-inter font-medium text-xs ${
              meeting.status === "coming-soon"
                ? "bg-orange-500 text-white"
                : "bg-primary-500 text-white"
            }`}
          >
            {meeting.status === "coming-soon" ? "Coming soon" : "Completed"}
          </span>
        </td>

        {/* DATE */}
        <td className="px-3 sm:px-4 py-3 w-[15%] whitespace-nowrap text-sm text-text-secondary">
          {formatDateShort(meeting.date)}
        </td>

        {/* ACTIONS */}
        <td className="px-3 sm:px-4 py-3 w-[5%] ">
          <button
            className="cursor-pointer p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors"
            aria-label={`More options for ${meeting.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
        </div>
    );

    // Mobile Card View
    const MobileCards = () => (
        <div className="md:hidden flex flex-col divide-y divide-stroke-primary overflow-y-auto max-h-[336px]">
            {paginatedMeetings.map((meeting) => (
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
                                <span className={`px-2 py-1 rounded-full font-inter font-medium text-xs ${meeting.status === 'coming-soon'
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

            {/* Pagination */}
            <div className="py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-stroke-primary">
                <span className="font-inter font-medium text-xs sm:text-sm text-text-secondary tracking-[-0.084px] leading-5">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalMeetings)}  {totalMeetings === 1 ? 'entry' : 'entries'}
                </span>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-8 h-8 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        ‹
                    </button>
                    <span className="text-xs text-text-secondary">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-8 h-8 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingsTable;
