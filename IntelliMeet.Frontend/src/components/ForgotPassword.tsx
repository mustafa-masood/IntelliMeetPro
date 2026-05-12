import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/forgot-password/email-check');
    };

    return (
        <div className="flex min-h-[100dvh] w-full max-w-full flex-col lg:flex-row overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
            <div className="flex-1 flex min-h-0 items-center justify-center p-6 py-10 lg:py-6">
                <div className="w-full max-w-[587px] flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Link to="/signin" className="flex items-center gap-2 text-text-primary hover:text-primary-500 transition-colors no-underline">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-inter-tight font-medium text-xl">Back</span>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                        <img
                            src="/src/assets/intellimeet-logo-light.png"
                            alt="IntelliMeet Logo"
                            className="w-12 h-12 rounded-8 object-contain"
                        />
                        <h1 className="font-inter-tight font-medium text-[32px] text-text-primary tracking-[-0.16px] text-center m-0">
                            Forgot Password
                        </h1>
                        <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] max-w-[283px] m-0">
                            No worries! Enter your email address below, and we'll send you a link to reset your password.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                Email <span className="text-orange-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-3 font-inter font-normal text-base text-text-secondary tracking-[-0.176px] focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-500 text-white rounded-8 px-[10px] py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600 transition-colors"
                        >
                            Send
                        </button>
                    </form>
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

export default ForgotPassword;
