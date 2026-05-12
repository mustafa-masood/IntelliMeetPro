// import React from 'react';

// interface SearchBarProps {
//     className?: string;
//     placeholder?: string;
// }

// const SearchBar: React.FC<SearchBarProps> = ({
//     className = '',
//     placeholder = 'Search',
// }) => {
//     return (
//         <div
//             className={`
//             group flex items-center gap-2.5
//             w-full sm:w-auto sm:min-w-[240px] max-w-full
//             rounded-10 border border-stroke-primary bg-bg-surface-pure/95
//             px-3 py-2.5
//             shadow-xs transition-[box-shadow,border-color,background-color] duration-200
//             hover:border-stroke-secondary hover:shadow-float
//             focus-within:border-primary-500/35 focus-within:shadow-float focus-within:ring-2 focus-within:ring-primary-500/15
//             ${className}
//         `}
//         >
//             <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 16 16"
//                 fill="none"
//                 className="shrink-0 text-text-tertiary transition-colors group-focus-within:text-primary-500"
//                 aria-hidden="true"
//             >
//                 <path
//                     d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                 />
//                 <path
//                     d="M14 14L11.1 11.1"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                 />
//             </svg>
//             <input
//                 type="search"
//                 className="min-w-0 flex-1 border-0 bg-transparent font-inter text-sm text-text-primary outline-none placeholder:text-text-tertiary placeholder:font-normal tracking-[-0.02em]"
//                 placeholder={placeholder}
//                 aria-label="Search"
//             />
//         </div>
//     );
// };

// export default SearchBar;
