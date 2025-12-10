import React from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

interface TodoItem {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
}

const Todos: React.FC = () => {
    const todoItems: TodoItem[] = [
        { id: '1', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
        { id: '2', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
        { id: '3', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
        { id: '4', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
        { id: '5', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
        { id: '6', title: 'Pixem Recording notes', description: 'Essential takeaways documented by Pixem\'s recording feature.', category: 'Front-end', date: 'Feb 5, 2025' },
    ];

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <SearchBar />
                </div>

                {/* Page Header */}
                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <div className="flex gap-3 items-center w-full">
                        <div className="flex-1 flex flex-col">
                            <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                Notes
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-3 items-center w-full">
                        <div className="flex gap-2 items-start">
                            <div className="border border-stroke-primary rounded-8 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.05)] overflow-hidden">
                                <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                                    <span>All time</span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                            <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M6.66667 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.3333 2.5V5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.33333 8.33333H16.6667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Select date range</span>
                            </button>
                            <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-[10px] py-2 flex items-center gap-[2px] cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.07px] leading-5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                                <span>Select</span>
                                <div className="bg-primary-500 rounded-4 shadow-[0px_1px_2px_0px_rgba(22,163,74,0.06)] w-5 h-5 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-2 flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                            <span>Sort by</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 4V16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 9L10 4L15 9" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 16L5 11L15 11" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-2 flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                            <span>Filter by</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M8.33333 15V10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.33333 5V8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 12.5V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 5V8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 10V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 5V6.66667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.6667 5H8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.3333 10H10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.66667 12.5H5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-8 py-4 max-w-[1106px] w-full mx-auto">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-16 shadow-card flex flex-col gap-4 p-4">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 py-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4H20V20H4V4Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8H16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 12H16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 16H12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h2 className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                Your To-do's
                            </h2>
                        </div>

                        {/* Todo Items */}
                        <div className="flex flex-col gap-3">
                            {todoItems.map((item) => (
                                <div key={item.id} className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-start justify-between">
                                    <div className="flex flex-col gap-3 flex-1 max-w-[544px]">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-inter font-medium text-sm leading-5 text-text-primary tracking-[-0.084px] m-0">
                                                {item.title}
                                            </p>
                                            <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <div className="bg-[#d1f1eb] flex gap-0 items-center justify-center p-1 rounded-8">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M4 6L8 10L12 6" stroke="#061b16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="font-inter font-normal text-xs leading-4 text-text-primary px-1">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M6.66667 2V5.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9.33333 2V5.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M2.66667 6.66667H13.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3.33333 3.33333H12.6667C13.403 3.33333 14 3.93029 14 4.66667V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V4.66667C2 3.93029 2.59695 3.33333 3.33333 3.33333Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="font-inter font-normal text-xs leading-4 text-text-secondary">
                                                    {item.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="font-inter font-medium text-base leading-6 text-text-secondary tracking-[-0.176px] cursor-pointer">
                                            Edit
                                        </span>
                                        <button className="p-1.5 rounded-8 cursor-pointer hover:bg-bg-surface-lv1 transition-colors bg-transparent border-none">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <circle cx="10" cy="3" r="1.5" fill="#2b3d39" />
                                                <circle cx="10" cy="10" r="1.5" fill="#2b3d39" />
                                                <circle cx="10" cy="17" r="1.5" fill="#2b3d39" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Todos;

