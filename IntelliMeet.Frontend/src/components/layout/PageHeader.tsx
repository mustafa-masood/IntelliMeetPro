import React from 'react';
import SearchBar from '../SearchBar';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actions,
  showSearch = true,
  className = '' 
}) => {
  return (
    <header className={`bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary sticky top-0 z-[100] shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex-1 w-full sm:w-auto">
          {showSearch && <SearchBar className="w-full sm:w-auto" />}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <h1 className="font-inter-tight font-medium text-2xl sm:text-3xl leading-8 text-text-primary">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default PageHeader;
