import React from 'react';
import { Link } from 'react-router-dom';

const PasswordChanged: React.FC = () => {
    return (
        <div className="flex w-screen h-screen bg-bg-surface-pure">
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[587px] flex flex-col gap-6 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <div className="w-[172px] h-[128px] relative flex items-center justify-center">
                            <div className="w-[128px] h-[128px] bg-primary-50 rounded-full flex items-center justify-center">
                                <div className="w-[54px] h-[54px] bg-primary-500 rounded-[27px] flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <h1 className="font-inter-tight font-medium text-[32px] text-text-primary tracking-[-0.16px] text-center leading-[40px] m-0">
                            Your password has been successfully reset!
                        </h1>
                        <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] m-0">
                            You can now log in with your new password. If you encounter any issues, please contact support
                        </p>
                    </div>
                    <Link
                        to="/signin"
                        className="w-full bg-primary-500 text-white rounded-8 px-[10px] py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600 transition-colors no-underline"
                    >
                        Back to log In
                    </Link>
                </div>
            </div>
            <div className="flex-1 bg-bg-surface-lv2 flex flex-col items-center justify-center gap-8 px-0 py-[180px] rounded-24 relative overflow-hidden">
                <div className="flex flex-col gap-8 items-center max-w-[500px] text-center">
                    <div className="flex flex-col gap-5">
                        <h2 className="font-inter-tight font-medium text-[40px] text-text-primary tracking-[-0.4px] m-0">
                            Welcome! Please fill in the details to get started.
                        </h2>
                        <p className="font-inter font-medium text-base text-text-primary opacity-70 tracking-[-0.176px] m-0">
                            Welcome! We're excited to see you. Please create an account to pick up right where you left off, access all your tools and features, and continue your journey with us.
                        </p>
                    </div>
                    <div className="h-1.5 w-[52px] bg-text-primary rounded-full" />
                </div>
                <div className="absolute bottom-[438px] left-[80px] w-[940px] h-[668.67px] bg-bg-surface-lv1 rounded-8 border-2 border-stroke-primary flex items-center justify-center">
                    <p className="font-inter font-normal text-base text-text-secondary">App Preview</p>
                </div>
            </div>
        </div>
    );
};

export default PasswordChanged;
