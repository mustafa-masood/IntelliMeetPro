import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imApi, type OnboardingMeDto } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

type Props = {
  children: React.ReactNode;
};

export function RequireEnterprise({ children }: Props) {
  const navigate = useNavigate();
  const [state, setState] = useState<{ ready: boolean; me?: OnboardingMeDto }>({ ready: false });

  useEffect(() => {
    if (!isClerkConfigured()) {
      setState({ ready: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const me = await imApi.onboardingMe();
        if (cancelled) return;
        const plan = (me.currentPlan ?? '').toLowerCase();
        const status = (me.subscriptionStatus ?? '').toLowerCase();
        const isEnterprise = plan === 'enterprise' && status === 'active';
        if (!isEnterprise) {
          navigate('/meetings', { replace: true });
          return;
        }
        setState({ ready: true, me });
      } catch {
        if (!cancelled) navigate('/meetings', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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

