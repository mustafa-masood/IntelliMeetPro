import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { imApi } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

type Props = {
  className: string;
  children?: React.ReactNode;
};

function TryNowWithClerk({ className, children = 'Try now' }: Props) {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <button
      type="button"
      className={className}
      disabled={!isLoaded}
      onClick={async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        if (!isSignedIn) {
          navigate('/signup');
          return;
        }
        try {
          const s = await imApi.onboardingMe();
          navigate(s.needsPlanSelection ? '/onboarding/plan' : '/meetings');
        } catch {
          navigate('/auth/post-signin');
        }
      }}
    >
      {children}
    </button>
  );
}

/** Home / marketing “Try now”: Clerk sign-up if logged out; plan picker if not onboarded; else meetings. */
export function TryNowLink({ className, children = 'Try now' }: Props) {
  if (!isClerkConfigured()) {
    return (
      <Link to="/signin" className={className}>
        {children}
      </Link>
    );
  }
  return <TryNowWithClerk className={className}>{children}</TryNowWithClerk>;
}
