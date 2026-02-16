import React from 'react';
import Sidebar from '../Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showRightSidebar = false,
  rightSidebarContent,
  className = '' 
}) => {
  return (
    <div className="flex min-h-screen bg-bg-surface-lv1">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[270px] transition-all duration-300">
        {children}
      </main>

      {showRightSidebar && rightSidebarContent && (
        <aside className="hidden xl:block w-[350px] flex-shrink-0 border-l border-stroke-primary bg-bg-surface-pure">
          {rightSidebarContent}
        </aside>
      )}
    </div>
  );
};

export default PageLayout;
