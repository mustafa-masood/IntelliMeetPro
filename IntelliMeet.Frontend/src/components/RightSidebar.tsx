import React, { useState, useRef, useEffect } from 'react';

const RightSidebar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(16);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calendarDays = [
    [1,2,3,4,5,6,7],[8,9,10,11,12,13,14],
    [15,16,17,18,19,20,21],[22,23,24,25,26,27,28],
    [29,30,31,null,null,null,null],
  ];
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full xl:w-[300px] flex flex-col gap-3">
      <h2 className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px] mb-1">
        Upcoming Meetings
      </h2>

      {/* Calendar Card */}
      <div className="bg-bg-surface-pure rounded-12 shadow-card overflow-visible">
        {/* Calendar */}
        <div className="border-b border-stroke-primary p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-inter font-medium text-sm text-text-primary leading-5">
              April 2026
            </span>
            <div className="flex gap-1.5 items-center">
              <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-7 h-7 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors" aria-label="Previous month">‹</button>
              <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-7 h-7 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors" aria-label="Next month">›</button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="grid grid-cols-7">
              {weekdays.map((day) => (
                <div key={day} className="flex items-center justify-center py-1 font-inter font-medium text-[11px] text-text-primary leading-4">{day}</div>
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              {calendarDays.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => (
                    <button
                      key={di}
                      className={`flex items-center justify-center py-1 rounded-full font-inter font-medium text-[11px] cursor-pointer transition-colors
                        ${day === selectedDate ? 'bg-primary-500 text-white' : day ? 'text-text-primary hover:bg-bg-surface-lv1' : 'text-text-disable cursor-not-allowed'}`}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                    >{day}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="border-b border-stroke-primary p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base">G</div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="font-inter font-medium text-sm text-[#303546] tracking-[-0.176px] leading-5 truncate">mustafa@gmail.com</div>
              <div className="flex items-center gap-1 font-inter font-normal text-xs text-text-secondary leading-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                <span>Calendar Connected</span>
              </div>
            </div>
            <div className="relative shrink-0" ref={dropdownRef}>
              <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 p-1 cursor-pointer hover:bg-bg-surface-lv2 transition-colors" onClick={() => setDropdownOpen(p => !p)}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="4" r="1.5" fill="#2b3d39"/><circle cx="10" cy="10" r="1.5" fill="#2b3d39"/><circle cx="10" cy="16" r="1.5" fill="#2b3d39"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-8 z-20 bg-bg-surface-pure border border-stroke-secondary rounded-8 shadow-md min-w-[160px] overflow-hidden">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-inter text-text-primary hover:bg-bg-surface-lv1 transition-colors" onClick={() => setDropdownOpen(false)}>
                    Change calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Meeting */}
        <div className="p-3">
          <div className="border-l-[3px] border-primary-500 rounded-r-8 bg-[#e1f5ee] px-3 py-2.5 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-inter font-medium text-sm text-[#085041]">Brainstorming Session</span>
              <span className="shrink-0 text-[10px] font-medium font-inter bg-primary-500 text-white px-2 py-[2px] rounded-full">Upcoming</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-inter text-[#0f6e56]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#0f6e56" strokeWidth="1.2"/><polyline points="6,3 6,6 8,7.5" stroke="#0f6e56" strokeWidth="1.2" strokeLinecap="round"/></svg>
              09:00 PM – 10:30 PM
            </div>
          </div>
        </div>
      </div>

      {/* Paste Meeting Link */}
      <div className="bg-bg-surface-pure rounded-12 shadow-card overflow-hidden">
        <div className="border-b border-stroke-primary py-2.5 px-4 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-bg-surface-lv1 border border-stroke-primary rounded-8 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="3" y="1" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="5" y="0" width="4" height="2.5" rx="0.5" fill="currentColor"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-inter font-medium text-sm text-text-primary tracking-[-0.176px] leading-5">Paste meeting link</div>
            <div className="font-inter font-normal text-xs text-text-secondary leading-4">Invite notetaker to meeting</div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2.5">
          <input type="text" className="border border-stroke-primary rounded-8 px-3 py-2 font-inter text-sm text-text-primary tracking-[-0.14px] w-full" placeholder="Paste conference link" />
          <button className="w-full bg-primary-500 border border-[#1f8e6b] rounded-[6px] px-4 py-2 font-inter font-medium text-sm text-white cursor-pointer hover:bg-green-700 transition-colors">
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;