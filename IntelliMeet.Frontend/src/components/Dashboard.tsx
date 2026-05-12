import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentMeetingsTable from './RecentMeetingsTable';
import RightSidebar from './RightSidebar';
import MobileMenuButton from './MobileMenuButton';
import Container from './layout/Container';
import { imApi } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isClerkConfigured()) return;
    let cancelled = false;
    void (async () => {
      try {
        const s = await imApi.onboardingMe();
        if (!cancelled && s.needsPlanSelection) navigate('/onboarding/plan', { replace: true });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex h-[100dvh] min-h-0 max-h-[100dvh] im-app-canvas overflow-hidden">
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col min-h-0 h-full ml-0 md:ml-[270px] transition-all duration-300 overflow-hidden">
        {/* Single scrollable region, no nested overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Container className="py-4 sm:py-6 lg:py-8 h-full">
            <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 min-h-full">
              <div className="flex-1 xl:flex-[2] min-w-0 flex flex-col">
                <RecentMeetingsTable />
              </div>
              <aside className="xl:w-[300px] shrink-0">
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