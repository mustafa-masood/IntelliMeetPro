import React, { useState } from 'react';

const RightSidebar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(16);

  const calendarDays = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-[350px] flex flex-col gap-4 overflow-hidden overflow-y-auto">
      <h2 className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px] mb-1">Upcoming Meetings</h2>

      {/* Calendar Card */}
      <div className="bg-bg-surface-pure rounded-16 shadow-card overflow-hidden overflow-y-auto">
        <div className="border-b border-stroke-primary p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-inter font-medium text-base text-text-primary leading-5">January 2025</span>
            <div className="flex border border-stroke-secondary rounded-8 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.05)]">
              <button className="bg-bg-surface-pure border border-stroke-secondary px-2 py-[6px] flex items-center justify-center cursor-pointer">←</button>
              <button className="bg-bg-surface-pure border border-stroke-secondary px-2 py-[6px] flex items-center justify-center cursor-pointer">→</button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {weekdays.map((day) => (
                <div key={day} className="flex-1 flex items-center justify-center px-1 py-[6px] font-inter font-medium text-xs text-text-primary leading-4">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`flex-1 flex items-center justify-center px-1 py-[6px] rounded-[15.476px] font-inter font-medium text-xs text-text-primary cursor-pointer ${day === selectedDate ? 'bg-primary-500 text-text-white' : ''
                        } ${!day ? 'text-text-disable' : 'hover:bg-bg-surface-lv1'}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day}
                      {day === selectedDate && <span className="ml-1">+</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="border-b border-stroke-primary p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">G</div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="font-inter font-medium text-base text-[#303546] tracking-[-0.176px] leading-6">mdjubed30@gmail.com</div>
              <div className="flex items-center gap-1 font-inter font-normal text-xs text-text-secondary leading-4">
                <span>✓</span>
                <span>Calendar Connected</span>
              </div>
            </div>
            <div className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 p-[6px] cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="4" r="1.5" fill="#2b3d39" />
                <circle cx="10" cy="10" r="1.5" fill="#2b3d39" />
                <circle cx="10" cy="16" r="1.5" fill="#2b3d39" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] cursor-pointer">
            <span>+</span>
            <span>Add calendar account</span>
          </div>
        </div>

        {/* Meeting Details Card */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">09:00 PM - 10:30 PM</span>
            <div className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-[6px] flex items-center gap-1 font-inter font-medium text-xs text-text-secondary">
              <span>🕐</span>
              <span>1:30 Hour</span>
            </div>
          </div>
          <div className="font-inter font-medium text-base text-text-primary tracking-[-0.176px] leading-6">
            Are you scheduled to attend the meeting with Thomas Fletcher?
          </div>
          <div className="flex gap-3">
            <button className="px-[10px] py-2 rounded-8 font-inter font-medium text-sm text-text-white tracking-[-0.084px] cursor-pointer border border-primary-500 bg-primary-500">Yes</button>
            <button className="px-[10px] py-2 rounded-8 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer border border-stroke-secondary bg-bg-surface-pure">Don't know yet</button>
            <button className="px-[10px] py-2 rounded-8 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer border border-stroke-secondary bg-bg-surface-pure">No</button>
          </div>
        </div>


 {/* Copy Meeting Link Card */}
 <div className="bg-bg-surface-pure rounded-16 shadow-card overflow-hidden">
        <div className="border-b border-stroke-primary py-[14px] px-0 flex items-center gap-3 px-4">
          <div className="w-6 h-6 p-2 rounded-full shadow-[0px_1px_2px_0px_rgba(9,25,72,0.13),0px_0px_0px_1px_rgba(18,55,105,0.08)]">📋</div>
          <div>
            <div className="font-inter font-medium text-base text-text-primary tracking-[-0.176px] leading-6">Copy paste meeting link</div>
            <div className="font-inter font-normal text-xs text-text-secondary leading-4">
              Invite notetaker ad hoc to a specific meeting
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <input
            type="text"
            className="border border-stroke-primary rounded-8 px-[14px] py-[10px] font-inter text-sm text-text-primary tracking-[-0.14px] w-full"
            placeholder="Paste conference link"
          />
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-b from-white/12 to-transparent bg-gradient-to-r from-primary-500 to-primary-500 border border-[#1f8e6b] rounded-[6px] px-4 py-2 font-inter font-medium text-sm text-text-white cursor-pointer shadow-[inset_0px_-1px_12px_0px_rgba(255,255,255,0.12)]">
              Join Meeting
            </button>
            <button className="w-[95.583px] bg-bg-surface-pure border border-[#d1d5db] rounded-[6px] px-4 py-2 flex items-center justify-center cursor-pointer">
              👥
            </button>
          </div>
        </div>
      </div>



      </div>

     
    </div>
  );
};

export default RightSidebar;
