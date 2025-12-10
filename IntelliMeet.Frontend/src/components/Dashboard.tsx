import React from 'react';
import Sidebar from './Sidebar';
import RecentMeetingsTable from './RecentMeetingsTable';
import RightSidebar from './RightSidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden">
        <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-[100]">
          <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 w-[238px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 14L11.1 11.1" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[-0.084px] bg-transparent"
              placeholder="Search"
            />
            <div className="border border-stroke-primary rounded-[7px] px-[6px] py-0 font-inter text-sm text-text-secondary tracking-[-0.084px] leading-5">⌘ 1</div>
          </div>
        </div>

        <div>
          <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary w-full max-w-[1106px] px-[23px] ">Dashboard</h1>
        </div>

        <div className="flex gap-2 px-[23px] flex-1 overflow-y-auto max-w-[1440px] w-full mx-auto">
          <RecentMeetingsTable />
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
