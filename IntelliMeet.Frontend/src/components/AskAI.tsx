import React, { useState } from 'react';
import Sidebar from './Sidebar';

const AskAI: React.FC = () => {
    const [message, setMessage] = useState('');

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 w-[238px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 14L11.1 11.1" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[-0.084px] bg-transparent placeholder:text-text-secondary"
                            placeholder="Search"
                        />
                        <div className="border border-stroke-primary rounded-[7px] px-[6px] py-0 font-inter text-sm text-text-secondary tracking-[-0.084px] leading-5">⌘ 1</div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col bg-bg-surface-pure relative overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-bg-surface-lv1 border-b border-stroke-primary px-5 py-4 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                Chat with IntelliMeet AI
                            </h1>
                            <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                This channel is just between IntelliMeet and you. Ask anything about your conversations
                            </p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="flex gap-1 items-center">
                                <span className="font-inter font-normal text-xs leading-4 text-text-secondary">GPT-4.0</span>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <button className="p-1 hover:bg-bg-surface-lv2 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M13.5 4.5L4.5 13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.5 4.5L13.5 13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto px-[150px] py-8 flex flex-col gap-4">
                        {/* AI Welcome Message */}
                        <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-3 p-3 w-[806px]">
                            <div className="flex gap-2 items-center">
                                <div className="bg-bg-surface-lv2 p-2 rounded-8 shadow-card">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        im
                                    </div>
                                </div>
                                <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                    IntelliMeet AI
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    IntelliMeet AI Chat, our AI-powered assistant, generates answers from your discussions, meeting Notes, and task lists making your workspace more efficient.
                                </p>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    Not sure what to ask? 😗 click the sparkle icon below to get suggestions.
                                </p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 10V17C7 17.5304 7.21071 18.0391 7.58579 18.4142C7.96086 18.7893 8.46957 19 9 19H11L15 23V19H17C17.5304 19 18.0391 18.7893 18.4142 18.4142C18.7893 18.0391 19 17.5304 19 17V10C19 9.46957 18.7893 8.96086 18.4142 8.58579C18.0391 8.21071 17.5304 8 17 8H9C8.46957 8 7.96086 8.21071 7.58579 8.58579C7.21071 8.96086 7 9.46957 7 10Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 11V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 7V9" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 14V7C7 6.46957 7.21071 5.96086 7.58579 5.58579C7.96086 5.21071 8.46957 5 9 5H11L15 1V5H17C17.5304 5 18.0391 5.21071 18.4142 5.58579C18.7893 5.96086 19 6.46957 19 7V14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H9C8.46957 16 7.96086 15.7893 7.58579 15.4142C7.21071 15.0391 7 14.5304 7 14Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 13V9" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 17V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-3 p-3 w-[806px]">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                                        DL
                                    </div>
                                    <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Devid Lee
                                    </span>
                                </div>
                                <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                                    04/01/2025. 4:30 PM
                                </span>
                            </div>
                            <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                Can you explain the significance of the automatic action item generation feature?
                            </p>
                            <div className="flex gap-3 items-center">
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* AI Response */}
                        <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-3 p-3 w-[806px]">
                            <div className="flex gap-2 items-center">
                                <div className="bg-bg-surface-lv2 p-2 rounded-8 shadow-card">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        im
                                    </div>
                                </div>
                                <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                    IntelliMeet AI
                                </span>
                            </div>
                            <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                Here is your explain significance of the automatic action generation feature.
                            </p>
                            <div className="flex flex-col gap-4">
                                <ol className="list-decimal pl-5 space-y-4 m-0">
                                    <li className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px]">
                                        <span className="font-inter font-medium text-text-primary">Efficiency:</span>
                                        {' '}This feature streamlines the process of tracking tasks that arise during meetings. Instead of manually noting down action items, Fireflies automatically identifies and generates them, saving time and reducing the likelihood of forgetting important tasks.
                                    </li>
                                    <li className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px]">
                                        <span className="font-inter font-medium text-text-primary">Clarity:</span>
                                        {' '}By providing a clear list of action items associated with each meeting, it ensures that all participants understand their responsibilities. This clarity helps in accountability and follow-through on commitments made during discussions.
                                    </li>
                                    <li className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px]">
                                        <span className="font-inter font-medium text-text-primary">Organization:</span>
                                        {' '}The generated tasks are organized per meeting, allowing users to easily reference what needs to be completed after each session. This organization helps in managing workloads and prioritizing tasks effectively.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-stroke-primary px-[150px] py-4 bg-bg-surface-pure">
                        <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-[10px] flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center gap-2 flex-1">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 2C9.5 2 9 2.5 9 3V7C9 7.5 9.5 8 10 8C10.5 8 11 7.5 11 7V3C11 2.5 10.5 2 10 2Z" fill="#2b3d39" />
                                    <path d="M10 12C9.5 12 9 12.5 9 13V17C9 17.5 9.5 18 10 18C10.5 18 11 17.5 11 17V13C11 12.5 10.5 12 10 12Z" fill="#2b3d39" />
                                    <path d="M3 9C2.5 9 2 9.5 2 10C2 10.5 2.5 11 3 11H7C7.5 11 8 10.5 8 10C8 9.5 7.5 9 7 9H3Z" fill="#2b3d39" />
                                    <path d="M13 9C12.5 9 12 9.5 12 10C12 10.5 12.5 11 13 11H17C17.5 11 18 10.5 18 10C18 9.5 17.5 9 17 9H13Z" fill="#2b3d39" />
                                </svg>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ask IntelliMeet anything"
                                    className="flex-1 border-none outline-none font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-transparent placeholder:text-text-secondary"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-1.5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)] cursor-pointer hover:bg-bg-surface-lv1 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 2C9.5 2 9 2.5 9 3V7C9 7.5 9.5 8 10 8C10.5 8 11 7.5 11 7V3C11 2.5 10.5 2 10 2Z" fill="#2b3d39" />
                                        <path d="M10 12C9.5 12 9 12.5 9 13V17C9 17.5 9.5 18 10 18C10.5 18 11 17.5 11 17V13C11 12.5 10.5 12 10 12Z" fill="#2b3d39" />
                                        <path d="M3 9C2.5 9 2 9.5 2 10C2 10.5 2.5 11 3 11H7C7.5 11 8 10.5 8 10C8 9.5 7.5 9 7 9H3Z" fill="#2b3d39" />
                                        <path d="M13 9C12.5 9 12 9.5 12 10C12 10.5 12.5 11 13 11H17C17.5 11 18 10.5 18 10C18 9.5 17.5 9 17 9H13Z" fill="#2b3d39" />
                                    </svg>
                                </button>
                                <button className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-1.5 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)] relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:shadow-[inset_0px_-1px_1px_0px_rgba(0,0,0,0.1)] cursor-pointer hover:bg-bg-surface-lv1 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 4V16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 10L10 4L16 10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AskAI;

