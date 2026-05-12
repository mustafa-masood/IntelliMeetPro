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
    <div className="flex h-[100dvh] min-h-0 max-h-[100dvh] overflow-hidden bg-bg-surface-lv1 surface-gradient">
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-out md:ml-[270px] ml-0">
        {/* Single scrollable region, no nested overflow */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Container className="h-full py-5 sm:py-7 lg:py-9">
            <div className="flex min-h-full flex-col gap-5 lg:gap-8 xl:flex-row">
              <div className="flex min-w-0 flex-1 flex-col xl:flex-[2]">
                <RecentMeetingsTable />
              </div>
              <aside className="shrink-0 xl:w-[300px]">
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