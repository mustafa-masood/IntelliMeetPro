import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { imApi, setClerkBearerToken, type OnboardingMeDto } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

type Props = {
  children: React.ReactNode;
};

/**
 * Phase-1 gate:
 * - If Clerk isn't configured, do nothing (legacy/demo mode stays usable).
 * - If signed out: send to /signup.
 * - If signed in but no active plan: send to /onboarding/plan.
 * - Otherwise: render the protected app page.
 */
export function RequireOnboarded({ children }: Props) {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [state, setState] = useState<{ ready: boolean; me?: OnboardingMeDto }>({ ready: false });

  useEffect(() => {
    if (!isClerkConfigured()) {
      setState({ ready: true });
      return;
    }
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate('/signup', { replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      for (let i = 0; i < 6 && !cancelled; i += 1) {
        try {
          const token = await getToken();
          if (token) setClerkBearerToken(token);
          const me = await imApi.onboardingMe();
          if (cancelled) return;
          if (me.needsPlanSelection) {
            navigate('/onboarding/plan', { replace: true });
            return;
          }
          setState({ ready: true, me });
          return;
        } catch {
          await new Promise((r) => window.setTimeout(r, 250));
        }
      }
      if (!cancelled) navigate('/onboarding/plan', { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, navigate]);

  if (!state.ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-surface-lv1 p-6">
        <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure px-4 py-3 text-sm text-text-secondary font-inter">
          Loading…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

