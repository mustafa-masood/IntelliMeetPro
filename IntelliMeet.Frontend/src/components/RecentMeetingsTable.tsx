import React, { useState, useRef, useEffect } from 'react';
import type { Meeting } from '../types';

interface RecentMeetingsTableProps {
  meetings?: Meeting[];
}

const RecentMeetingsTable: React.FC<RecentMeetingsTableProps> = ({ meetings }) => {
  const defaultMeetings: Meeting[] = [
    { id: '1', title: 'React components', date: '28 Oct 2025, 08:43 AM', summary: 'Discussion about React component architecture' },
    { id: '2', title: 'Starting New component', date: '28 Oct 2025, 10:43 AM', summary: 'Planning new component implementation' },
    { id: '3', title: 'AI Meeting', date: '28 Oct 2025, 05:42 PM', summary: 'AI integration planning session' },
    { id: '4', title: 'New ideas for user forms', date: '27 Oct 2025, 02:33 PM', summary: 'Brainstorming user form improvements' },
    { id: '5', title: 'Quick guide: get transcription and AI summary', date: '27 Oct 2025, 09:33 AM', summary: 'Training session on transcription features' },
    { id: '6', title: 'Backend improvements', date: '27 Oct 2025, 02:33 PM', summary: 'Backend optimization discussion' },
    { id: '7', title: 'Figma designs upgrade', date: '26 Oct 2025, 10:53 AM', summary: 'Design system updates' },
   

  ];

  const [displayMeetings, setDisplayMeetings] = useState<Meeting[]>(meetings || defaultMeetings);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalMeetings = displayMeetings.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (id: string) => {
    setDisplayMeetings((prev) => prev.filter((m) => m.id !== id));
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const DotsButton = ({ meeting }: { meeting: Meeting }) => (
    <div className="relative" ref={openDropdownId === meeting.id ? dropdownRef : undefined}>
      <button
        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] hover:bg-bg-surface-lv1 transition-colors"
        aria-label={`More options for ${meeting.title}`}
        onClick={(e) => toggleDropdown(e, meeting.id)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="4" r="1.5" fill="#2b3d39" />
          <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
          <circle cx="8" cy="12" r="1.5" fill="#2b3d39" />
        </svg>
      </button>

      {openDropdownId === meeting.id && (
        <div className="absolute right-0 top-8 z-50 bg-bg-surface-pure border border-stroke-primary rounded-8 shadow-card min-w-[120px] py-1 overflow-hidden">
          <button
            className="w-full px-4 py-2 text-left font-inter font-normal text-sm text-red-500 hover:bg-bg-surface-lv1 transition-colors flex items-center gap-2 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleDelete(meeting.id); }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1.75 3.5h10.5M5.25 3.5V2.333a.583.583 0 01.583-.583h2.334a.583.583 0 01.583.583V3.5M11.083 3.5l-.583 7.583a.583.583 0 01-.583.584H4.083a.583.583 0 01-.583-.584L2.917 3.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h1 className="font-inter font-medium text-xl text-text-primary tracking-[-0.084px] mb-3">
        Dashboard
      </h1>

      <div className="bg-bg-surface-pure rounded-12 sm:rounded-16 shadow-card flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="border-b border-stroke-primary py-3 sm:py-[14px] px-4 sm:px-6">
          <div className="inline-block relative after:content-[''] after:absolute after:bottom-[-14px] after:left-0 after:w-full after:h-0.5 after:bg-primary-500">
            <span className="font-inter font-medium text-sm text-neutral-900 tracking-[-0.084px]">
              Recent Meetings
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:flex flex-col flex-1 min-h-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg-surface-lv1">
                <th className="px-3 sm:px-4 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                  Name
                </th>
               <th className="px-3 sm:px-4 h-10 text-center font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
  Date
</th>
                <th className="px-5 sm:px-1 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap w-[10%] pr-6">
  Actions
</th>
              </tr>
            </thead>
          </table>
          <div className="flex-1 overflow-y-auto min-h-0">
            <table className="w-full border-collapse">
              <tbody>
                {displayMeetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors cursor-pointer"
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
                    <td className="px-3 sm:px-4 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] whitespace-nowrap">
                      {meeting.date}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <DotsButton meeting={meeting} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-stroke-primary">
          {displayMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 hover:bg-bg-surface-lv1 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-white text-xs shrink-0">
                  {meeting.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-inter font-medium text-sm text-text-primary truncate">
                    {meeting.title}
                  </h3>
                  <p className="font-inter font-normal text-xs text-text-secondary">
                    {meeting.date}
                  </p>
                </div>
                <DotsButton meeting={meeting} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-stroke-primary">
          <span className="font-inter font-medium text-xs sm:text-sm text-text-secondary tracking-[-0.084px] leading-5">
            Showing {totalMeetings} {totalMeetings === 1 ? 'entry' : 'entries'}
          </span>
          <div className="flex gap-2 items-center">
            <button
              className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-8 h-8 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
              aria-label="Previous page"
            >
              ‹
            </button>
            <button
              className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-8 h-8 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentMeetingsTable;