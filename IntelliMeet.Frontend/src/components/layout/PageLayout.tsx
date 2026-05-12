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
  className = '',
}) => {
  return (
    <div
      className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full overflow-hidden bg-bg-surface-lv1 surface-gradient ${className}`.trim()}
    >
      <Sidebar />

      <main className="ml-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-out md:ml-[270px]">
        <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </main>

      {showRightSidebar && rightSidebarContent && (
        <aside className="hidden w-[350px] flex-shrink-0 border-l border-stroke-primary bg-bg-surface-pure/95 shadow-float backdrop-blur-sm xl:block">
          {rightSidebarContent}
        </aside>
      )}
    </div>
  );
};

export default PageLayout;
