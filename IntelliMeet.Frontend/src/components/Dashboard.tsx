import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RecentMeetingsTable from './RecentMeetingsTable';
import RightSidebar from './RightSidebar';
import MobileMenuButton from './MobileMenuButton';
import Container from './layout/Container';

const Dashboard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-surface-lv1 overflow-hidden">
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen ml-0 md:ml-[270px] transition-all duration-300 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Container className="py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
              <div className="flex-1 xl:flex-[2] min-w-0">
                <RecentMeetingsTable />
              </div>
              
              <aside className="flex-1 xl:flex-[1] shrink-0">
                <RightSidebar />
              </aside>
            </div>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
