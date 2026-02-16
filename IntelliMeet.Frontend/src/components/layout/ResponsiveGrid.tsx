import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  cols = { xs: 1, sm: 1, md: 2, lg: 2, xl: 3 },
  gap = 'md',
  className = '' 
}) => {
  const gapClasses = {
    'sm': 'gap-2 sm:gap-3',
    'md': 'gap-4 sm:gap-6',
    'lg': 'gap-6 sm:gap-8',
  };

  const gridCols = {
    xs: cols.xs || 1,
    sm: cols.sm || cols.xs || 1,
    md: cols.md || cols.sm || 1,
    lg: cols.lg || cols.md || 2,
    xl: cols.xl || cols.lg || 3,
  };

  const gridColsClasses = `grid-cols-${gridCols.xs} sm:grid-cols-${gridCols.sm} md:grid-cols-${gridCols.md} lg:grid-cols-${gridCols.lg} xl:grid-cols-${gridCols.xl}`;

  return (
    <div className={`grid ${gridColsClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
