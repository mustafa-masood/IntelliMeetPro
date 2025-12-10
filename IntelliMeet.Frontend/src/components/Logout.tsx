import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/');
  };

  return (
    <div className="flex w-screen h-screen bg-bg-surface-lv1 items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-8 flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-primary-500 rounded-8 flex items-center justify-center text-white font-bold text-2xl">
              i
            </div>
            <span className="font-inter font-semibold text-3xl text-text-primary tracking-[-0.48px]">IntelliMeet</span>
          </div>

          {/* Logout Message */}
          <div className="flex flex-col gap-3">
            <h1 className="font-inter-tight font-medium text-3xl text-text-primary tracking-[-0.27px] m-0">
              You've been logged out
            </h1>
            <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">
              Thank you for using IntelliMeet. You have been successfully logged out of your account.
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            className="w-full bg-primary-500 border border-primary-500 rounded-8 px-6 py-3 flex items-center justify-center gap-2 cursor-pointer font-inter font-medium text-base text-white tracking-[-0.176px] hover:bg-primary-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5H7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.3333 14.1667L17.5 10L13.3333 5.83333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.5 10H7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Sign in</span>
          </button>

          {/* Additional Info */}
          <p className="font-inter font-normal text-sm text-text-tertiary tracking-[-0.084px] m-0">
            Need help? <a href="#" className="text-primary-500 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Logout;

