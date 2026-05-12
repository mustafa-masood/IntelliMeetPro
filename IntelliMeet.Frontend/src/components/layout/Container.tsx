import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'content';
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'content',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    content: 'max-w-content',
  };

  return (
    <div
      className={`mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
