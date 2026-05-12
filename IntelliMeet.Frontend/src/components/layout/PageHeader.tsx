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
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-[100] border-b border-stroke-primary bg-bg-surface-alpha-90 shadow-float backdrop-blur-md backdrop-saturate-150 ${className}`}
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 sm:py-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h1 className="font-inter-tight m-0 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl sm:leading-tight">
            {title}
          </h1>
          {actions && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>
          )}
        </div>
        {showSearch && (
          <div className="w-full max-w-xl">
            <SearchBar className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
