import React from 'react';

interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    className = '', 
    placeholder = 'Search' 
}) => {
    return (
        <div className={`
            bg-bg-surface-pure 
            border border-stroke-primary 
            rounded-8 
            px-3 py-2 
            flex items-center gap-2 
            w-full sm:w-auto sm:min-w-[238px]
            ${className}
        `}>
            <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                className="shrink-0"
                aria-hidden="true"
            >
                <path 
                    d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" 
                    stroke="#2b3d39" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
                <path 
                    d="M14 14L11.1 11.1" 
                    stroke="#2b3d39" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
            </svg>
            <input
                type="search"
                className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[-0.084px] bg-transparent placeholder:text-text-secondary min-w-0"
                placeholder={placeholder}
                aria-label="Search"
            />
        </div>
    );
};

export default SearchBar;

