import React from 'react';

type Variant = 'signin' | 'signup';

const copy: Record<
  Variant,
  { title: string; subtitle: string; asideTitle: string; asideBody: string }
> = {
  signup: {
    title: 'Create your account',
    subtitle: 'Welcome! Continue with Clerk to secure your workspace and billing.',
    asideTitle: 'Welcome! Please fill in the details to get started.',
    asideBody:
      "We're excited to see you. Create your account to pick up where you left off, access your tools, and continue your journey with us.",
  },
  signin: {
    title: 'Sign in to IntelliMeet',
    subtitle: 'Use your Clerk account to access meetings, calendar, and billing.',
    asideTitle: 'Welcome back! Sign in to continue',
    asideBody:
      "We're excited to see you again. Sign in to access all your tools and features, and continue your journey with us.",
  },
};

/**
 * Same two-column marketing layout as the original SignIn / SignUp mock screens;
 * left column hosts Clerk so the branded shell stays intact when SaaS auth is on.
 */
export function AuthMarketingShell({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  const c = copy[variant];

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col lg:flex-row overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
      <div className="flex-1 flex min-h-0 items-center justify-center p-6 py-10 lg:py-6">
        <div className="w-full max-w-[587px] flex flex-col gap-6">
          <div className="flex flex-col gap-4 items-center">
            <img
              src="/src/assets/intellimeet-logo-light.png"
              alt="IntelliMeet Logo"
              className="w-12 h-12 rounded-8 object-contain"
            />
            <h1
              className={`font-inter-tight font-medium text-text-primary text-center tracking-[-0.16px] m-0 ${
                variant === 'signin' ? 'text-2xl' : 'text-[32px]'
              }`}
            >
              {c.title}
            </h1>
            <p className="font-inter font-medium text-base text-text-secondary text-center tracking-[-0.176px] max-w-[383px] m-0">
              {c.subtitle}
            </p>
          </div>
          <div className="w-full flex justify-center">{children}</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-bg-surface-lv2 flex flex-col items-center justify-center gap-8 px-4 py-12 lg:py-[180px] rounded-24 relative overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center max-w-[500px] text-center">
          <div className="flex flex-col gap-5">
            <h2
              className={`font-inter-tight font-medium text-text-primary tracking-[-0.4px] m-0 ${
                variant === 'signin' ? 'text-2xl' : 'text-[40px]'
              }`}
            >
              {c.asideTitle}
            </h2>
            <p className="font-inter font-medium text-base text-text-primary opacity-70 tracking-[-0.176px] m-0">
              {c.asideBody}
            </p>
          </div>
          <div className="h-1.5 w-[52px] bg-text-primary rounded-full" />
        </div>
        <div className="absolute bottom-[438px] left-[80px] w-[940px] h-[668.67px] bg-bg-surface-lv1 rounded-16 border-4 border-white shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] flex items-center justify-center pointer-events-none hidden xl:flex">
          <p className="font-inter font-normal text-base text-text-secondary">App Preview</p>
        </div>
      </div>
    </div>
  );
}
