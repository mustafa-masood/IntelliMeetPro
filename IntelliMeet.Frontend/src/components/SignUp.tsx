import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to first questionnaire step
        navigate('/signup/questionnaire-1');
    };

    const handleGoogleSignUp = () => {
        // Handle Google sign up
        navigate('/signup/questionnaire-1');
    };

    const handleAppleSignUp = () => {
        // Handle Apple sign up
        navigate('/signup/questionnaire-1');
    };

    return (
        <div className="flex w-screen h-screen bg-bg-surface-pure">
            {/* Left Column - Sign Up Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[587px] flex flex-col gap-6">
                    {/* Logo and Title */}
                    <div className="flex flex-col gap-4 items-center">
                        <img
                            src="/src/assets/intellimeet-logo-light.png"
                            alt="IntelliMeet Logo"
                            className="w-12 h-12 rounded-8 object-contain"
                        />
                        <h1 className="font-inter-tight font-medium text-[32px] text-text-primary text-center tracking-[-0.16px] m-0">
                            Create your account
                        </h1>
                        <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] max-w-[283px] m-0">
                            Welcome! Please fill in the details to get started.
                        </p>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                        {/* Social Sign Up Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                className="flex-1 bg-bg-surface-lv1 border border-stroke-secondary rounded-12 h-14 px-6 py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-bg-surface-lv2 transition-colors"
                            >
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <path d="M11 11C11 12.1046 10.1046 13 9 13C7.89543 13 7 12.1046 7 11C7 9.89543 7.89543 9 9 9C10.1046 9 11 9.89543 11 11Z" fill="#4285F4" />
                                    <path d="M11 13C13.7614 13 16 10.7614 16 8C16 5.23858 13.7614 3 11 3C8.23858 3 6 5.23858 6 8C6 10.7614 8.23858 13 11 13Z" fill="#34A853" />
                                    <path d="M11 3V13C13.7614 13 16 10.7614 16 8C16 5.23858 13.7614 3 11 3Z" fill="#FBBC04" />
                                    <path d="M3 8C3 5.23858 5.23858 3 8 3H11V13H8C5.23858 13 3 10.7614 3 8Z" fill="#EA4335" />
                                </svg>
                                <span className="font-inter-tight font-semibold text-base text-text-primary tracking-[0.32px]">Sign Up with Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleAppleSignUp}
                                className="flex-1 bg-bg-surface-lv1 border border-stroke-secondary rounded-12 h-14 px-6 py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-bg-surface-lv2 transition-colors"
                            >
                                <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                                    <path d="M15.5 5.5C15.2 5.8 12.8 7.2 12.8 9.8C12.8 12.7 15.7 14 16 14.3C15.9 14.4 15.1 16.8 13.2 19.2C11.5 21.4 9.7 22.8 8 22.8C6.3 22.8 5.8 21.7 4 21.7C2.2 21.7 1.6 22.9 0 22.9V22C1.7 20.3 1.7 17.5 0 15.8C-0.6 15.1 0.1 14.2 0.8 13.5C2.1 12.1 3.4 11.2 4.2 10.5C5.1 9.7 5.8 8.8 6.3 7.8C7.1 6.2 7.5 4.5 7.5 2.8C7.5 1.8 7.4 0.9 7.2 0H8.8C9.1 0.2 9.4 0.4 9.7 0.7C10.4 1.4 11.1 2.1 11.8 2.8C12.5 3.5 13.2 4.2 13.9 4.9C14.6 5.6 15.3 5.5 15.5 5.5Z" fill="#061b16" />
                                </svg>
                                <span className="font-inter-tight font-semibold text-base text-text-primary tracking-[0.32px]">Sign Up with Apple</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-stroke-primary" />
                            <span className="font-manrope font-normal text-base text-text-secondary tracking-[0.3px]">
                                Or with email
                            </span>
                            <div className="flex-1 h-px bg-stroke-primary" />
                        </div>

                        {/* Full Name Input */}
                        <div className="flex flex-col gap-1">
                            <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                Full Name <span className="text-orange-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-3 font-inter font-normal text-base text-text-secondary tracking-[-0.176px] focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>

                        {/* Email Input */}
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

                        {/* Password Input */}
                        <div className="flex flex-col gap-1">
                            <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">
                                Password <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="bg-bg-surface-lv1 border border-stroke-secondary rounded-8 px-3 py-3 pr-10 w-full font-inter font-normal text-base text-text-secondary tracking-[-0.176px] focus:outline-none focus:border-primary-500"
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

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary-500 border border-primary-500 rounded-8 px-[10px] py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-600 transition-colors"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="font-inter font-normal text-base text-text-secondary text-center m-0">
                        Already have an account? <Link to="/signin" className="text-primary-500 cursor-pointer hover:underline font-medium text-lg tracking-[-0.27px] no-underline">Sign In</Link>
                    </p>
                </div>
            </div>

            {/* Right Column - Welcome Message and Illustration */}
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
                {/* App Preview Illustration - Placeholder */}
                <div className="absolute bottom-[438px] left-[80px] w-[940px] h-[668.67px] bg-bg-surface-lv1 rounded-16 border-4 border-white shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] flex items-center justify-center">
                    <p className="font-inter font-normal text-base text-text-secondary">App Preview</p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
