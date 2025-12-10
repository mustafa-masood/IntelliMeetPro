import React from 'react';

interface Meeting {
  id: string;
  name: string;
  duration: string;
  creator: string;
  date: string;
  icon: 'mic' | 'doc' | 'video' | 'zoom' | 'meet';
}

const RecentMeetingsTable: React.FC = () => {
  const meetings: Meeting[] = [
    { id: '1', name: 'React components', duration: '1hours 30min', creator: 'Thomas L. Fletcher', date: '28 Oct 2025, 08:43 AM', icon: 'mic' },
    { id: '2', name: 'Starting New component', duration: '1hours 30min', creator: 'Julius Lias', date: '28 Oct 2025, 10:43 AM', icon: 'doc' },
    { id: '3', name: 'AI Meeting', duration: '1hours 30min', creator: 'Grace Berg', date: '28 Oct 2025, 05:42 PM', icon: 'video' },
    { id: '4', name: 'New ideas for user forms', duration: '1.30 Hours', creator: 'Allen Paul', date: '27 Oct 2025, 02:33 PM', icon: 'meet' },
    { id: '5', name: 'Quick guide: get transcription and AI summary', duration: '1.30 Hours', creator: 'Jhon Smith', date: '27 Oct 2025, 09:33 AM', icon: 'meet' },
    { id: '6', name: 'Backend improvements', duration: '1.30 Hours', creator: 'Samuel Dong', date: '27 Oct 2025, 02:33 PM', icon: 'zoom' },
    { id: '7', name: 'Figma designs upgrade', duration: '1.30 Hours', creator: 'Brian Zim', date: '26 Oct 2025, 10:53 AM', icon: 'meet' },
    { id: '8', name: 'Onboarding new team', duration: '1.30 Hours', creator: 'Jhon Smith', date: '12 Oct 2025, 06:33 PM', icon: 'mic' },
    { id: '9', name: 'Bug issues resolving team', duration: '1.30 Hours', creator: 'Tally Hue', date: '10 Oct 2025, 02:40 PM', icon: 'zoom' },
    { id: '10', name: 'FYP discussion items to tell', duration: '1.30 Hours', creator: 'Farah Shing', date: '14 Sept 2025, 07:12 AM', icon: 'mic' },
    { id: '11', name: 'Getting budget statements', duration: '1.30 Hours', creator: 'Jing Mi', date: '10 Sept 2025, 11:33 AM', icon: 'video' },
  ];

  const getIcon = (icon: Meeting['icon']) => {
    switch (icon) {
      case 'mic':
        return '🎤';
      case 'doc':
        return '📄';
      case 'video':
        return '📹';
      case 'zoom':
        return '💻';
      case 'meet':
        return '📞';
      default:
        return '📹';
    }
  };

  return (
    <div className="bg-bg-surface-pure rounded-16 shadow-card p-0 flex-1 max-w-[740px] flex flex-col overflow-hidden">
      <div className="border-b border-stroke-primary py-[14px] px-0 flex gap-5 relative">
        <div className="flex items-center gap-[6px] relative after:content-[''] after:absolute after:bottom-[-14px] after:left-0 after:right-0 after:h-0.5 after:bg-primary-500">
          <span className="font-inter font-medium text-sm text-neutral-900 tracking-[-0.084px]">Recent Meetings</span>
        </div>
        <button className="absolute right-2 top-2 bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-[6px] font-inter font-medium text-sm text-text-secondary cursor-pointer">
          See more
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg-surface-lv1">
              <th className="px-3 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">Name</th>
              <th className="px-3 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">Duration</th>
              <th className="px-3 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">Creator</th>
              <th className="px-3 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">Date</th>
              <th className="px-3 h-10 text-left font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]"></th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="border-b border-stroke-primary">
                <td className="px-3 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${meeting.icon === 'mic' ? 'bg-orange-500' : ''}`}>
                      {getIcon(meeting.icon)}
                    </div>
                    <span>{meeting.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">{meeting.duration}</td>
                <td className="px-3 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">{meeting.creator}</td>
                <td className="px-3 py-3 font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">{meeting.date}</td>
                <td className="px-3 py-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="4" r="1.5" fill="#2b3d39" />
                      <circle cx="8" cy="8" r="1.5" fill="#2b3d39" />
                      <circle cx="8" cy="12" r="1.5" fill="#2b3d39" />
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-1 px-0 flex items-center justify-center rounded-10">
        <div className="flex items-center justify-between w-full px-3">
          <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">Showing 1-20 entries</span>
          <div className="flex gap-2 items-center">
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">Previous</button>
            <button className="bg-primary-500 text-text-white border border-primary-500 rounded-8 px-[8px] pr-[9px] py-[6px] font-inter font-medium text-xs cursor-pointer flex items-center justify-center">1</button>
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[8px] pr-[9px] py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">2</button>
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">3</button>
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-2 py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">...</button>
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[8px] pr-[9px] py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">17</button>
            <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-[6px] font-inter font-medium text-xs text-text-secondary cursor-pointer flex items-center justify-center">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentMeetingsTable;
