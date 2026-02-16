import React from 'react';
import type { Meeting } from '../types';

interface RecentMeetingsTableProps {
  meetings?: Meeting[];
}

const RecentMeetingsTable: React.FC<RecentMeetingsTableProps> = ({ meetings }) => {
  // Default mock data for Dashboard if no meetings provided
  const defaultMeetings: Meeting[] = [
    { id: '1', title: 'React components', date: '28 Oct 2025, 08:43 AM', summary: 'Discussion about React component architecture' },
    { id: '2', title: 'Starting New component', date: '28 Oct 2025, 10:43 AM', summary: 'Planning new component implementation' },
    { id: '3', title: 'AI Meeting', date: '28 Oct 2025, 05:42 PM', summary: 'AI integration planning session' },
    { id: '4', title: 'New ideas for user forms', date: '27 Oct 2025, 02:33 PM', summary: 'Brainstorming user form improvements' },
    { id: '5', title: 'Quick guide: get transcription and AI summary', date: '27 Oct 2025, 09:33 AM', summary: 'Training session on transcription features' },
    { id: '6', title: 'Backend improvements', date: '27 Oct 2025, 02:33 PM', summary: 'Backend optimization discussion' },
    { id: '7', title: 'Figma designs upgrade', date: '26 Oct 2025, 10:53 AM', summary: 'Design system updates' },
    { id: '8', title: 'Onboarding new team', date: '12 Oct 2025, 06:33 PM', summary: 'New team member orientation' },
    { id: '9', title: 'Bug issues resolving team', date: '10 Oct 2025, 02:40 PM', summary: 'Bug triage and resolution planning' },
    { id: '10', title: 'FYP discussion items to tell', date: '14 Sept 2025, 07:12 AM', summary: 'Final year project discussion' },
    { id: '11', title: 'Getting budget statements', date: '10 Sept 2025, 11:33 AM', summary: 'Budget review and planning' },
  ];

  const displayMeetings = meetings || defaultMeetings;

  const getIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('audio') || titleLower.includes('mic') || titleLower.includes('recording')) {
      return '🎤';
    } else if (titleLower.includes('doc') || titleLower.includes('document')) {
      return '📄';
    } else if (titleLower.includes('video') || titleLower.includes('meet')) {
      return '📹';
    } else if (titleLower.includes('zoom')) {
      return '💻';
    }
    return '📞';
  };

  return (
    <div className="bg-bg-surface-pure rounded-12 sm:rounded-16 shadow-card p-0 w-full flex flex-col overflow-hidden">
      <div className="border-b border-stroke-primary py-3 sm:py-[14px] px-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:gap-5 relative">
        <div className="flex items-center gap-[6px] relative after:content-[''] after:absolute after:bottom-[-14px] after:left-0 after:right-0 after:h-0.5 after:bg-primary-500">
          <span className="font-inter font-medium text-sm text-neutral-900 tracking-[-0.084px]">
            Recent Meetings
          </span>
        </div>
        <button 
          className="sm:absolute sm:right-2 sm:top-2 bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-3 sm:px-[10px] py-2 sm:py-[6px] font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv2 transition-colors self-start sm:self-auto"
          aria-label="See more meetings"
        >
          See more
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg-surface-lv1">
              <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                Name
              </th>
              <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                Summary
              </th>
              <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                Date
              </th>
              <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayMeetings.map((meeting) => (
              <tr 
                key={meeting.id} 
                className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors"
              >
                <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary-500 text-white text-xs shrink-0">
                      {meeting.title.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-inter font-medium text-sm text-text-primary truncate">
                      {meeting.title}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                  <span className="line-clamp-1">
                    {meeting.summary.substring(0, 50)}...
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
                  {meeting.date}
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <button 
                    className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] hover:bg-bg-surface-lv1 transition-colors"
                    aria-label={`More options for ${meeting.title}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="4" r="1.5" fill="#2b3d39" />
                      <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                      <circle cx="8" cy="12" r="1.5" fill="#2b3d39" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-stroke-primary">
        {displayMeetings.map((meeting) => (
          <div 
            key={meeting.id} 
            className="p-4 hover:bg-bg-surface-lv1 transition-colors"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-white text-xs shrink-0">
                {meeting.title.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-inter font-medium text-sm text-text-primary mb-1 truncate">
                  {meeting.title}
                </h3>
                <p className="font-inter font-normal text-xs text-text-secondary line-clamp-2 mb-2">
                  {meeting.summary}
                </p>
                <p className="font-inter font-normal text-xs text-text-secondary">
                  {meeting.date}
                </p>
              </div>
              <button 
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-bg-surface-lv2 transition-colors shrink-0"
                aria-label={`More options for ${meeting.title}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="4" r="1.5" fill="#2b3d39" />
                  <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                  <circle cx="8" cy="12" r="1.5" fill="#2b3d39" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-stroke-primary">
        <span className="font-inter font-medium text-xs sm:text-sm text-text-secondary tracking-[-0.084px] leading-5">
          Showing 1-20 entries
        </span>
        <div className="flex gap-2 items-center flex-wrap justify-center">
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-3 sm:px-[10px] py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
            aria-label="Previous page"
          >
            Previous
          </button>
          <button 
            className="bg-primary-500 text-text-white border border-primary-500 rounded-8 px-2 sm:px-[8px] pr-[9px] py-2 sm:py-[6px] font-inter font-medium text-xs cursor-pointer hover:opacity-90 transition-opacity min-w-[32px]"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </button>
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 sm:px-[8px] pr-[9px] py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors min-w-[32px]"
            aria-label="Page 2"
          >
            2
          </button>
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors min-w-[32px]"
            aria-label="Page 3"
          >
            3
          </button>
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors min-w-[32px]"
            aria-label="More pages"
          >
            ...
          </button>
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 sm:px-[8px] pr-[9px] py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors min-w-[32px]"
            aria-label="Page 17"
          >
            17
          </button>
          <button 
            className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-3 sm:px-[10px] py-2 sm:py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentMeetingsTable;
