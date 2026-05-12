import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { imApi } from '../api/intellimeet';

const BillingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [status, setStatus] = useState<'working' | 'failed'>('working');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const sid = search.get('session_id');
      if (sid) {
        try {
          await imApi.confirmCheckoutSession(sid);
        } catch (e) {
          if (!cancelled) {
            setStatus('failed');
            setError(e instanceof Error ? e.message : 'Could not verify checkout session yet.');
          }
          return;
        }
      }
      if (!cancelled) navigate('/meetings', { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, search]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-surface-lv1 p-6 text-center gap-3">
      <h1 className="font-inter-tight text-2xl font-semibold text-text-primary m-0">Thanks — your plan is active</h1>
      <p className="text-sm text-text-secondary m-0 max-w-md">
        You can start using IntelliMeet. If the dashboard does not update immediately, wait a moment for billing to sync.
      </p>
      {status === 'working' ? (
        <p className="text-xs text-text-tertiary m-0">Finalizing billing and redirecting…</p>
      ) : (
        <>
          <p className="text-xs text-red-600 m-0">{error ?? 'Could not finalize billing yet.'}</p>
          <button
            type="button"
            className="mt-1 px-3 py-1.5 rounded-8 bg-primary-500 text-white text-xs"
            onClick={() => navigate('/onboarding/plan', { replace: true })}
          >
            Go back to plan page
          </button>
        </>
      )}
    </div>
  );
};

export default BillingSuccess;
