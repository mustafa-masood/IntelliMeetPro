import React from 'react';

interface TeamCreationSidebarProps {
    onAllMeetingsClick?: () => void;
}

const TeamCreationSidebar: React.FC<TeamCreationSidebarProps> = ({ onAllMeetingsClick }) => {
    return (
        <div className="w-[190px] bg-bg-surface-pure border-l border-r border-stroke-primary h-screen fixed right-0 top-0 flex flex-col gap-5 p-5 overflow-y-auto">
            <div className="flex flex-col gap-2 rounded-16 shadow-card p-0 bg-bg-surface-pure">
                <div className="py-1 px-2 flex items-center justify-center">
                    <p className="flex-1 font-inter font-medium text-xs leading-4 text-text-secondary m-0">My Meetings</p>
                </div>
                <div
                    onClick={onAllMeetingsClick}
                    className="flex gap-[6px] items-center p-2 rounded-8 cursor-pointer relative bg-[rgba(22,163,74,0.1)] hover:bg-[rgba(22,163,74,0.15)] transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.6667 2.5H3.33333C2.41286 2.5 1.66667 3.24619 1.66667 4.16667V15.8333C1.66667 16.7538 2.41286 17.5 3.33333 17.5H16.6667C17.5871 17.5 18.3333 16.7538 18.3333 15.8333V4.16667C18.3333 3.24619 17.5871 2.5 16.6667 2.5Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.3333 1.66667V4.16667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.66667 1.66667V4.16667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.66667 7.5H18.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">All Meetings</span>
                    <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                </div>
            </div>

            <div className="flex flex-col gap-0">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-inter font-medium text-xs leading-4 text-text-secondary m-0">TEAMS</p>
                    <button className="bg-transparent border-none w-[18px] h-[18px] flex items-center justify-center cursor-pointer p-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 4.5V13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M4.5 9H13.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-2 items-center py-5">
                    <div className="flex items-center justify-center">
                        <div className="bg-primary-50 rounded-[27px] w-[54px] h-[54px] flex items-center justify-center p-[11px]">
                            <div className="bg-primary-500 rounded-16 w-8 h-8 flex items-center justify-center p-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5V19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M5 12H19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <p className="font-inter font-normal text-xs leading-4 text-text-secondary text-center w-[186px] m-0">
                        Create teams to organize meetings
                    </p>
                    <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-[6px] flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4.5V15.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M4.5 10H15.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Create</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamCreationSidebar;
