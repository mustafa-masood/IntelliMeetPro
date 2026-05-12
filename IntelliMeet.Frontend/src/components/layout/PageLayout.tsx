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
    <div className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full overflow-hidden bg-bg-surface-lv1 ${className}`.trim()}>
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-0 h-full overflow-hidden ml-0 md:ml-[270px] transition-all duration-300">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">{children}</div>
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
