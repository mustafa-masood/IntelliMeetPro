import React from 'react';
import { Link } from 'react-router-dom';

const EmailCheck: React.FC = () => {
    return (
        <div className="flex min-h-[100dvh] w-full max-w-full flex-col lg:flex-row overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
            <div className="flex-1 flex min-h-0 items-center justify-center p-6 py-10 lg:py-6">
                <div className="w-full max-w-[587px] flex flex-col gap-6 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <div className="w-[172px] h-[128px] relative flex items-center justify-center">
                            <div className="w-[128px] h-[128px] bg-primary-50 rounded-full flex items-center justify-center">
                                <div className="w-[54px] h-[54px] bg-primary-500 rounded-[27px] flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="L22 6L12 13L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <h1 className="font-inter-tight font-medium text-[32px] text-text-primary tracking-[-0.16px] text-center m-0">
                            Check your email
                        </h1>
                        <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] m-0">
                            We sent a password reset link to your email. Please check your inbox.
                        </p>
                    </div>
                    <button className="w-full bg-primary-500 text-white rounded-8 px-[10px] py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600 transition-colors">
                        Open Your email
                    </button>
                    <p className="font-inter font-normal text-base text-text-secondary text-center m-0">
                        Didn't receive the email? <Link to="/forgot-password/email-check" className="text-primary-500 font-medium text-lg tracking-[-0.27px] hover:underline no-underline">Resend</Link>
                    </p>
                </div>
            </div>
            <div className="flex-1 min-h-0 bg-bg-surface-lv2 flex flex-col items-center justify-center gap-8 px-4 py-12 lg:py-[180px] rounded-24 relative overflow-y-auto overflow-x-hidden">
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
                <div className="absolute bottom-[438px] left-[80px] w-[940px] h-[668.67px] bg-bg-surface-lv1 rounded-16 border-4 border-white shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] flex items-center justify-center">
                    <p className="font-inter font-normal text-base text-text-secondary">App Preview</p>
                </div>
            </div>
        </div>
    );
};

export default EmailCheck;
