import React from 'react';
import Sidebar from './Sidebar';
import RecentMeetingsTable from './RecentMeetingsTable';
import RightSidebar from './RightSidebar';
import SearchBar from './SearchBar';

const Dashboard: React.FC = () => {
  return (
    <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden">
        <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-[100]">
          <SearchBar />
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
