import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  maxWidth = 'lg'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-md z-[1000] bg-[color:var(--overlay-scrim)] transition-opacity duration-300 motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={`
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-bg-surface-pure 
          flex flex-col 
          overflow-hidden 
          rounded-12 sm:rounded-[14px] 
          shadow-modal-premium ring-1 ring-stroke-primary/80
          w-[calc(100%-2rem)] sm:w-full
          ${maxWidthClasses[maxWidth]}
          max-h-[90vh]
          overflow-y-auto
          z-[1001]
          im-enter-active
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stroke-primary shrink-0">
            <h2 id="modal-title" className="font-inter-tight font-medium text-xl sm:text-2xl leading-8 text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="overflow-clip relative shrink-0 w-6 h-6 cursor-pointer bg-transparent border-none p-0 hover:opacity-70 transition-opacity"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6L18 18" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
