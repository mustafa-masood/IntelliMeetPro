import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TryNowLink } from './TryNowLink';

const HomePage: React.FC = () => {
  useEffect(() => {
    const root = document.getElementById('root');
    document.body.style.overflow = '';
    if (root) {
      root.style.overflow = '';
      root.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (root) {
        root.style.overflow = '';
        root.style.height = '';
      }
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] im-app-canvas overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22, 163, 74, 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(15, 118, 110, 0.08), transparent)',
        }}
      />

      <header className="relative z-10 w-full border-b border-stroke-primary/80 bg-bg-surface-alpha-90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-12 bg-primary-500/20 blur-md scale-110" aria-hidden="true" />
              <img
                src="/src/assets/intellimeet-logo-light.png"
                alt="IntelliMeet"
                className="relative w-9 h-9 rounded-12 object-contain ring-1 ring-stroke-primary/60"
              />
            </div>
            <span className="font-inter-tight font-semibold text-lg sm:text-xl text-text-primary tracking-[-0.04em]">
              IntelliMeet
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/pricing"
              className="text-sm font-inter text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 ease-out no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 rounded-8 px-1"
            >
              Pricing
            </Link>
            <TryNowLink className="btn-primary-premium focus-ring-premium no-underline text-center">
              Try now
            </TryNowLink>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="im-stagger grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stroke-primary bg-bg-surface-pure/90 px-3.5 py-1.5 text-xs font-inter font-medium text-text-secondary shadow-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(22,163,74,0.7)]" aria-hidden />
              AI meeting notes · bots · action items
            </div>
            <h1 className="mt-6 font-inter-tight text-4xl sm:text-5xl md:text-[3.25rem] font-semibold text-text-primary tracking-[-0.045em] leading-[1.08]">
              Turn meetings into decisions — automatically.
            </h1>
            <p className="mt-5 text-base sm:text-lg font-inter text-text-secondary max-w-xl leading-relaxed">
              Connect your calendar, let the bot join, and get transcripts, summaries, and action items in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <TryNowLink className="btn-primary-premium focus-ring-premium px-7 py-3.5 text-center no-underline">
                Get started
              </TryNowLink>
              <Link
                to="/meetings"
                className="btn-outline-soft focus-ring-premium text-center no-underline py-3.5"
              >
                Open app
              </Link>
            </div>
            <p className="mt-4 text-xs text-text-tertiary font-inter leading-relaxed max-w-md">
              Try now → Clerk → Choose plan → Stripe (paid) → Dashboard
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-px rounded-[18px] opacity-90 dark:opacity-100 blur-sm bg-gradient-to-br from-primary-400/30 via-primary-500/15 to-teal-600/20 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative card-elevated p-7 sm:p-8 overflow-hidden">
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-500/10 -translate-y-1/2 translate-x-1/4 pointer-events-none"
                aria-hidden="true"
              />
              <p className="font-inter text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400 m-0 mb-3">
                Product
              </p>
              <p className="font-inter text-sm text-text-secondary m-0 mb-6 leading-relaxed">
                Built for teams who want signal without the busywork — calendar-aware bots, transcripts, and AI that
                respects your workspace.
              </p>
              <ul className="m-0 p-0 list-none grid gap-4 text-sm font-inter text-text-primary">
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-500/15" />
                  <span>Basic (free) or Stripe checkout for paid tiers</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-500/15" />
                  <span>Personal dashboard scoped to your workspace</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-500/15" />
                  <span>Meetings, transcripts, RAG and action items preserved</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
