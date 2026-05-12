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
    <div className="min-h-[100dvh] bg-bg-surface-lv1 flex flex-col items-center px-4 py-10">
      <div className="max-w-4xl w-full">
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
          <div className="mb-4 rounded-10 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure p-5 flex flex-col gap-3 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary m-0">Basic</h2>
            <p className="text-sm text-text-secondary m-0 flex-1">Free · limited meetings and AI chat · no workspace admin UI.</p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void chooseBasic()}
              className="w-full py-2.5 rounded-10 bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {busy === 'basic' ? 'Saving…' : 'Continue with Basic'}
            </button>
          </div>
          <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure p-5 flex flex-col gap-3 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary m-0">Professional</h2>
            <p className="text-sm text-text-secondary m-0 flex-1">Paid · higher limits · no workspace admin UI (for now).</p>
            <button
              type="button"
              disabled={busy !== null || !pricePro}
              onClick={() => void checkout('pro')}
              className="w-full py-2.5 rounded-10 bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {busy === 'pro' ? 'Redirecting…' : 'Subscribe with Stripe'}
            </button>
          </div>
          <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure p-5 flex flex-col gap-3 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary m-0">Enterprise</h2>
            <p className="text-sm text-text-secondary m-0 flex-1">Paid · full workspace features (UI coming later).</p>
            <button
              type="button"
              disabled={busy !== null || !priceEnt}
              onClick={() => void checkout('enterprise')}
              className="w-full py-2.5 rounded-10 bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
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
