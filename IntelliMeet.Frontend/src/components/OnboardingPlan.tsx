import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { imApi } from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

function OnboardingPlanInner() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [priceStarter, setPriceStarter] = useState('');
  const [pricePro, setPricePro] = useState('');
  const [priceEnt, setPriceEnt] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate('/signup', { replace: true });
      return;
    }
    void (async () => {
      try {
        const s = await imApi.onboardingMe();
        if (!s.needsPlanSelection) {
          navigate('/meetings', { replace: true });
          return;
        }
        const p = await imApi.billingPlanPrices();
        setPriceStarter(p.priceIdStarter ?? '');
        setPricePro(p.priceIdPro);
        setPriceEnt(p.priceIdPremium);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not load plan options');
      }
    })();
  }, [isLoaded, isSignedIn, navigate]);

  const chooseBasic = async () => {
    if (priceStarter) {
      await checkout('starter');
      return;
    }
    setBusy('basic');
    setErr(null);
    try {
      await imApi.setBasicPlan();
      navigate('/meetings', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to activate Basic');
    } finally {
      setBusy(null);
    }
  };

  const checkout = async (which: 'starter' | 'pro' | 'enterprise') => {
    const priceId = which === 'starter' ? priceStarter : which === 'pro' ? pricePro : priceEnt;
    if (!priceId) {
      setErr('Stripe price ids are not configured on the server.');
      return;
    }
    setBusy(which === 'starter' ? 'basic' : which);
    setErr(null);
    try {
      const { sessionUrl } = await imApi.createCheckoutSession(priceId);
      window.location.href = sessionUrl;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Checkout failed');
      setBusy(null);
    }
  };

  return (
    <div className="relative min-h-[100dvh] im-app-canvas flex flex-col items-center px-4 py-10 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(420px,55vh)] opacity-50 dark:opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(22, 163, 74, 0.14), transparent 65%)',
        }}
      />
      <div className="relative z-[1] max-w-4xl w-full im-stagger">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            className="text-xs font-medium text-text-secondary underline"
            onClick={() => void signOut(() => navigate('/signin', { replace: true }))}
          >
            Sign out
          </button>
        </div>
        <h1 className="font-inter-tight text-2xl md:text-3xl font-semibold text-text-primary m-0 mb-2 text-center">
          Choose your plan
        </h1>
        <p className="text-sm text-text-secondary text-center m-0 mb-8">
          Basic is free with limits. Professional and Enterprise use Stripe checkout.
        </p>
        {err && (
          <div className="mb-4 rounded-10 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
            {err}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <div className="card-elevated p-5 sm:p-6 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0">
            <h2 className="text-lg font-inter-tight font-semibold text-text-primary m-0">Basic</h2>
            <p className="text-sm text-text-secondary m-0 flex-1 leading-relaxed">
              Free · limited meetings and AI chat · no workspace admin UI.
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void chooseBasic()}
              className="btn-primary-premium focus-ring-premium w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'basic' ? 'Saving…' : 'Continue with Basic'}
            </button>
          </div>
          <div className="card-elevated p-5 sm:p-6 flex flex-col gap-3 ring-1 ring-primary-500/20 shadow-glow-sm transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0">
            <h2 className="text-lg font-inter-tight font-semibold text-text-primary m-0">Professional</h2>
            <p className="text-sm text-text-secondary m-0 flex-1 leading-relaxed">
              Paid · higher limits · no workspace admin UI (for now).
            </p>
            <button
              type="button"
              disabled={busy !== null || !pricePro}
              onClick={() => void checkout('pro')}
              className="btn-primary-premium focus-ring-premium w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'pro' ? 'Redirecting…' : 'Subscribe with Stripe'}
            </button>
          </div>
          <div className="card-elevated p-5 sm:p-6 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0">
            <h2 className="text-lg font-inter-tight font-semibold text-text-primary m-0">Enterprise</h2>
            <p className="text-sm text-text-secondary m-0 flex-1 leading-relaxed">
              Paid · full workspace features (UI coming later).
            </p>
            <button
              type="button"
              disabled={busy !== null || !priceEnt}
              onClick={() => void checkout('enterprise')}
              className="btn-primary-premium focus-ring-premium w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'enterprise' ? 'Redirecting…' : 'Subscribe with Stripe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const OnboardingPlan: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isClerkConfigured()) navigate('/signin', { replace: true });
  }, [navigate]);

  if (!isClerkConfigured()) return null;
  return <OnboardingPlanInner />;
};

export default OnboardingPlan;
