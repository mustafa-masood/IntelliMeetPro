import React from 'react';
import { Link } from 'react-router-dom';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { clerkAppearance, isClerkConfigured } from '../config/clerk';

const SignUp: React.FC = () => {
    if (isClerkConfigured()) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 p-6">
                <ClerkSignUp
                    routing="path"
                    path="/signup"
                    signInUrl="/signin"
                    afterSignUpUrl="/auth/post-signin"
                    appearance={clerkAppearance}
                />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 p-6">
            <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure p-6 max-w-md w-full text-center">
                <h1 className="font-inter-tight text-2xl font-semibold text-text-primary m-0 mb-2">Sign up</h1>
                <p className="font-inter text-sm text-text-secondary m-0 mb-4">
                    Clerk is not configured. Add <span className="font-medium">VITE_CLERK_PUBLISHABLE_KEY</span> to the
                    frontend and restart the dev server.
                </p>
                <Link className="text-primary-600 underline text-sm font-inter" to="/">
                    Back to home
                </Link>
            </div>
        </div>
    );
};

export default SignUp;
