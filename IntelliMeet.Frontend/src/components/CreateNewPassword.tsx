import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateNewPassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === confirmPassword) {
            navigate('/forgot-password/success');
        }
    };

    return (
        <div className="flex min-h-[100dvh] w-full max-w-full flex-col lg:flex-row overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
            <div className="flex-1 flex min-h-0 items-center justify-center p-6 py-10 lg:py-6">
                <div className="w-full max-w-[587px] flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Link to="/forgot-password/email-check" className="flex items-center gap-2 text-text-primary hover:text-primary-500 transition-colors no-underline">
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
                            Create a New Password
                        </h1>
                        <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] m-0">
                            Enter your new password below to complete the reset process. Ensure it's strong and secure
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                New Password <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-3 pr-10 w-full font-inter font-normal text-base text-text-secondary tracking-[-0.176px] focus:outline-none focus:border-primary-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 3.33333C6.66667 3.33333 3.83333 5.41667 2.08333 8.33333C3.83333 11.25 6.66667 13.3333 10 13.3333C13.3333 13.3333 16.1667 11.25 17.9167 8.33333C16.1667 5.41667 13.3333 3.33333 10 3.33333ZM10 11.6667C8.61667 11.6667 7.5 10.55 7.5 9.16667C7.5 7.78333 8.61667 6.66667 10 6.66667C11.3833 6.66667 12.5 7.78333 12.5 9.16667C12.5 10.55 11.3833 11.6667 10 11.6667Z" fill="#2b3d39" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89167 8.775 7.5 9.45 7.5 10C7.5 11.3833 8.61667 12.5 10 12.5C10.55 12.5 11.225 12.1083 11.6667 11.6667M3.33333 3.33333C1.66667 4.58333 0.416667 6.25 0 8.33333C1.75 12.0833 5.41667 14.5833 10 14.5833C11.75 14.5833 13.3333 14.25 14.75 13.6667M13.3333 13.3333L6.66667 6.66667M17.9167 8.33333C17.5 6.25 16.25 4.58333 14.5833 3.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                Confirm Password <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-3 pr-10 w-full font-inter font-normal text-base text-text-secondary tracking-[-0.176px] focus:outline-none focus:border-primary-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 3.33333C6.66667 3.33333 3.83333 5.41667 2.08333 8.33333C3.83333 11.25 6.66667 13.3333 10 13.3333C13.3333 13.3333 16.1667 11.25 17.9167 8.33333C16.1667 5.41667 13.3333 3.33333 10 3.33333ZM10 11.6667C8.61667 11.6667 7.5 10.55 7.5 9.16667C7.5 7.78333 8.61667 6.66667 10 6.66667C11.3833 6.66667 12.5 7.78333 12.5 9.16667C12.5 10.55 11.3833 11.6667 10 11.6667Z" fill="#2b3d39" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89167 8.775 7.5 9.45 7.5 10C7.5 11.3833 8.61667 12.5 10 12.5C10.55 12.5 11.225 12.1083 11.6667 11.6667M3.33333 3.33333C1.66667 4.58333 0.416667 6.25 0 8.33333C1.75 12.0833 5.41667 14.5833 10 14.5833C11.75 14.5833 13.3333 14.25 14.75 13.6667M13.3333 13.3333L6.66667 6.66667M17.9167 8.33333C17.5 6.25 16.25 4.58333 14.5833 3.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-500 text-white rounded-8 px-[10px] py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600 transition-colors"
                        >
                            Submit
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
                <div className="absolute bottom-[438px] left-[80px] w-[940px] h-[668.67px] bg-bg-surface-lv1 rounded-8 border-2 border-stroke-primary flex items-center justify-center">
                    <p className="font-inter font-normal text-base text-text-secondary">App Preview</p>
                </div>
            </div>
        </div>
    );
};

export default CreateNewPassword;
