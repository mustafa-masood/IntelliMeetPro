import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TryNowLink } from './TryNowLink';

const HomePage: React.FC = () => {
  // Phase-1 SaaS landing (new flow). Legacy marketing UI remains below but is intentionally bypassed.
  return (
    <div className="min-h-[100dvh] bg-bg-surface-lv1">
      <header className="w-full border-b border-stroke-primary bg-bg-surface-pure/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/intellimeet-logo-light.png"
              alt="IntelliMeet"
              className="w-8 h-8 rounded-8 object-contain"
            />
            <span className="font-inter font-semibold text-lg text-text-primary tracking-[-0.48px]">
              IntelliMeet
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm font-inter text-text-secondary hover:text-text-primary no-underline">
              Pricing
            </Link>
            <TryNowLink className="bg-primary-500 text-white px-5 py-2 rounded-10 font-inter font-medium text-sm hover:bg-primary-600 transition-colors no-underline">
              Try now
            </TryNowLink>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stroke-primary bg-bg-surface-pure px-3 py-1 text-xs font-inter text-text-secondary">
              AI meeting notes · bots · action items
            </div>
            <h1 className="mt-4 font-inter-tight text-4xl md:text-5xl font-semibold text-text-primary tracking-[-0.8px]">
              Turn meetings into decisions — automatically.
            </h1>
            <p className="mt-4 text-base md:text-lg font-inter text-text-secondary max-w-xl">
              Connect your calendar, let the bot join, and get transcripts, summaries, and action items in one place.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <TryNowLink className="bg-primary-500 text-white px-7 py-3 rounded-12 font-inter font-medium text-sm hover:bg-primary-600 transition-colors text-center no-underline">
                Get started
              </TryNowLink>
              <Link
                to="/meetings"
                className="bg-bg-surface-pure border border-stroke-primary text-text-primary px-7 py-3 rounded-12 font-inter font-medium text-sm hover:bg-bg-surface-lv1 transition-colors text-center no-underline"
              >
                Open app
              </Link>
            </div>
            <p className="mt-3 text-xs text-text-tertiary font-inter">
              Try now → Clerk → Choose plan → Stripe (paid) → Dashboard
            </p>
          </div>

          <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-6 shadow-card">
            <p className="font-inter text-sm text-text-secondary m-0 mb-4">Phase 1</p>
            <ul className="m-0 p-0 list-none grid gap-3 text-sm font-inter text-text-primary">
              <li className="flex gap-2">
                <span className="text-primary-600 font-semibold">•</span> Basic (free) or Stripe checkout for paid tiers
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-semibold">•</span> Personal dashboard scoped to your workspace
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-semibold">•</span> Meetings, transcripts, RAG and action items preserved
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );

  // Allow scrolling on the homepage
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-stroke-primary">
        <div className="flex items-center gap-2">
          <img
            src="/src/assets/intellimeet-logo-light.png"
            alt="IntelliMeet Logo"
            className="w-8 h-8 rounded-8 object-contain"
          />
          <span className="font-inter font-semibold text-xl text-text-primary tracking-[-0.48px]">
            IntelliMeet
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="#about" className="font-inter font-medium text-base text-text-secondary hover:text-primary-500 transition-colors no-underline">
            About
          </Link>
          <Link to="#how-it-works" className="font-inter font-medium text-base text-text-secondary hover:text-primary-500 transition-colors no-underline">
            How it works
          </Link>
          <Link to="#customers" className="font-inter font-medium text-base text-text-secondary hover:text-primary-500 transition-colors no-underline">
            Customers
          </Link>
        </nav>
        <TryNowLink
          className="bg-primary-500 text-white px-6 py-2 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors no-underline"
        >
          Try now
        </TryNowLink>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-block bg-primary-50 text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-medium w-fit">
              Top AI for Tech Companies
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-500 leading-tight">
              Level Up Your Team Meetings
            </h1>
            <p className="text-xl text-text-secondary font-inter">
              With IntelliMeet, you can summarize and take notes of your meetings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TryNowLink className="bg-primary-500 text-white px-8 py-4 rounded-8 font-inter font-medium text-base hover:bg-primary-600 transition-colors text-center no-underline">
                Try now
              </TryNowLink>
              <button className="bg-white border border-stroke-secondary text-text-primary px-8 py-4 rounded-8 font-inter font-medium text-base hover:bg-bg-surface-lv1 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Phone Mockup Placeholder */}
            <div className="relative bg-bg-surface-lv1 rounded-24 p-8 border border-stroke-primary">
              <div className="aspect-[9/16] bg-white rounded-12 shadow-lg relative overflow-hidden">
                {/* Video Call Interface Mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 p-4">
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="bg-white/50 rounded-8"></div>
                    <div className="bg-white/50 rounded-8"></div>
                    <div className="bg-white/50 rounded-8 col-span-2"></div>
                  </div>
                </div>
                {/* Overlay Cards */}
                <div className="absolute top-4 left-4 bg-white rounded-8 p-3 shadow-lg max-w-[140px]">
                  <p className="font-inter font-medium text-xs text-text-primary mb-2">Speaking Time Distribution</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <div className="flex-1 h-2 bg-bg-surface-lv1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 h-2 bg-bg-surface-lv1 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1 h-2 bg-bg-surface-lv1 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-8 p-3 shadow-lg">
                  <p className="font-inter font-medium text-xs text-text-primary mb-2">Summary</p>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>• Q4 Marketing Plan Discussion</li>
                    <li>• Holiday Promotions</li>
                    <li>• New Campaign Visuals</li>
                  </ul>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg w-16 h-16 flex items-center justify-center">
                  <div className="text-xs font-inter font-medium text-text-primary">72%</div>
                </div>
              </div>
            </div>
            {/* Feature Cards */}
            <div className="absolute -right-8 top-1/4 bg-white rounded-12 p-4 shadow-lg max-w-[200px] border border-stroke-primary">
              <h3 className="font-inter font-semibold text-sm text-text-primary mb-2">Turn Conversations into Actions</h3>
              <p className="font-inter text-xs text-text-secondary">Transforms casual conversations and ensuring every decision drives meet results.</p>
            </div>
            <div className="absolute -left-8 bottom-1/4 bg-white rounded-12 p-4 shadow-lg max-w-[200px] border border-stroke-primary">
              <h3 className="font-inter font-semibold text-sm text-text-primary mb-2">Data-Driven Meeting Insights</h3>
              <p className="font-inter text-xs text-text-secondary">Analyzes patterns across all your meetings to help you build better collaboration habits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Logos */}
      <section className="px-6 py-8 bg-bg-surface-lv1">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="font-inter font-semibold text-lg text-text-secondary">ClickUp</div>
          <div className="font-inter font-semibold text-lg text-text-secondary">ZOOM</div>
          <div className="font-inter font-semibold text-lg text-text-secondary">Meet</div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section id="about" className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-50 text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-medium mb-4">
            WHAT SET US APART
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Great Meetings Deserve Better than 'Reply All' Email Chains
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Our AI assistant takes notes with the precision of a veteran secretary and the insights of a business analyst.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="bg-bg-surface-lv1 rounded-24 aspect-video flex items-center justify-center">
              <p className="font-inter text-text-secondary">Team Collaboration Image</p>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-stroke-primary rounded-12 p-6">
              <h3 className="font-inter font-semibold text-lg text-text-primary mb-4">Integration</h3>
              <p className="font-inter text-sm text-text-secondary mb-4">IntelliMeet Integrated with Many Meeting Apps</p>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-bg-surface-lv1 rounded-8 flex items-center justify-center">S</div>
                <div className="w-12 h-12 bg-bg-surface-lv1 rounded-8 flex items-center justify-center">T</div>
                <div className="w-12 h-12 bg-bg-surface-lv1 rounded-8 flex items-center justify-center">Z</div>
                <div className="w-12 h-12 bg-bg-surface-lv1 rounded-8 flex items-center justify-center">G</div>
              </div>
            </div>
            <div className="bg-primary-500 text-white rounded-12 p-6">
              <div className="text-4xl font-bold mb-2">500K+</div>
              <p className="font-inter text-sm">Active User Around The World</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stop Watching Recordings */}
      <section id="how-it-works" className="px-6 py-16 md:py-24 bg-bg-surface-lv1">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">
            Stop watching recordings. Start moving forward.
          </h2>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 relative">
              <div className="bg-white rounded-24 aspect-video flex items-center justify-center mb-4">
                <p className="font-inter text-text-secondary">Meeting Interface Image</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-primary-500 text-white px-6 py-3 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors">
                  Real-time Note Taking
                </button>
                <button className="bg-primary-500 text-white px-6 py-3 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors">
                  Smart Summaries
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-white rounded-12 p-4 border border-stroke-primary">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-inter font-medium text-sm text-text-primary">On-Progress Meeting</span>
                  <span className="font-inter text-xs text-text-secondary">16:32</span>
                </div>
                <p className="font-inter text-xs text-text-secondary">Annual Meeting: Q4 Meets...</p>
                <div className="flex gap-2 mt-2">
                  <div className="w-6 h-6 bg-primary-100 rounded-full"></div>
                  <div className="w-6 h-6 bg-primary-100 rounded-full"></div>
                  <div className="w-6 h-6 bg-primary-100 rounded-full"></div>
                </div>
              </div>
              <div className="bg-white rounded-12 p-4 border border-stroke-primary">
                <p className="font-inter font-medium text-sm text-text-primary mb-2">Speaking Time Distribution</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1 h-2 bg-bg-surface-lv1 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 h-2 bg-bg-surface-lv1 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jump Into Your Meeting */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-50 text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-medium mb-4">
            CONNECT & CAPTURE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Jump Into Your Meeting Like You Always Do
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter mb-6">
            IntelliMeet AI quietly tags along through our secure browser extension. No awkward introductions needed. The best part? You'll forget we're even there until you need us.
          </p>
          <ul className="text-left max-w-xl mx-auto space-y-3 font-inter text-text-secondary mb-6">
            <li className="flex items-center gap-2">
              <span className="text-primary-500">✓</span>
              One-click installation of our secure browser extension
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-500">✓</span>
              Smart join technology that follows your meeting links
            </li>
          </ul>
          <TryNowLink className="inline-block bg-primary-500 text-white px-8 py-4 rounded-8 font-inter font-medium text-base hover:bg-primary-600 transition-colors no-underline">
            Learn more
          </TryNowLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-surface-lv1 rounded-12 p-6 border border-stroke-primary">
            <p className="font-inter font-medium text-sm text-text-primary mb-2">Today's Meeting</p>
            <p className="font-inter text-2xl font-bold text-text-primary">20</p>
            <p className="font-inter text-xs text-text-secondary">to do</p>
          </div>
          <div className="bg-bg-surface-lv1 rounded-12 p-6 border border-stroke-primary">
            <p className="font-inter font-medium text-sm text-text-primary mb-2">IntelliMeet is starting...</p>
            <div className="flex gap-2 mt-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-bg-surface-lv1 rounded-12 p-6 border border-stroke-primary">
            <p className="font-inter font-medium text-sm text-text-primary mb-2">Meeting Summary</p>
            <p className="font-inter text-xs text-text-secondary mb-2">Participants and contributions</p>
            <button className="text-primary-500 font-inter text-xs hover:underline">Download Summary.pdf</button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 md:py-24 bg-bg-surface-lv1">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Prices for IntelliMeet Service
            </h2>
            <p className="text-lg text-text-secondary font-inter">
              Choose the service that suits your needs, from personal needs to enterprises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-12 p-8 border border-stroke-primary">
              <h3 className="font-inter font-semibold text-xl text-text-primary mb-2">Starter</h3>
              <p className="font-inter text-sm text-text-secondary mb-4">Per-host for small teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-text-primary">$15</span>
                <span className="font-inter text-text-secondary"> /month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">10 hours of meeting coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Basic summaries and action items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Basic analytics and visuals</span>
                </li>
              </ul>
              <TryNowLink className="block w-full bg-primary-500 text-white text-center px-6 py-3 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors no-underline">
                Choose plan
              </TryNowLink>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary-500 text-white rounded-12 p-8 border-2 border-primary-500 relative">
              <div className="absolute top-4 right-4 bg-white text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-medium">
                Best Value
              </div>
              <h3 className="font-inter font-semibold text-xl mb-2">Pro</h3>
              <p className="font-inter text-sm opacity-90 mb-4">For the meeting wizard</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="font-inter opacity-90"> /month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">Advanced analytics and visualizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">Unlimited meeting coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">Team collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">CSV export</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">✓</span>
                  <span className="font-inter text-sm">Custom AI training</span>
                </li>
              </ul>
              <TryNowLink className="block w-full bg-white text-primary-500 text-center px-6 py-3 rounded-8 font-inter font-medium text-sm hover:bg-bg-surface-lv1 transition-colors no-underline">
                Choose plan
              </TryNowLink>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-12 p-8 border border-stroke-primary">
              <h3 className="font-inter font-semibold text-xl text-text-primary mb-2">Enterprise</h3>
              <p className="font-inter text-sm text-text-secondary mb-4">Built for organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-text-primary">Contact us</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Custom integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Advanced security features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Dedicated success manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="font-inter text-sm text-text-secondary">Custom AI training</span>
                </li>
              </ul>
              <TryNowLink className="block w-full bg-primary-500 text-white text-center px-6 py-3 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors no-underline">
                Contact for pricing
              </TryNowLink>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="customers" className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-50 text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-medium mb-4">
            CUSTOMER SAY
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            What Customers Say About IntelliMeet?
          </h2>
          <p className="text-lg text-text-secondary font-inter">
            Let's see what they say about how IntelliMeet help their meetings.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-12 p-8 border border-stroke-primary">
            <p className="font-inter text-text-secondary mb-6">
              "I'd spend hours writing up meeting notes and still miss crucial details. Now, I can fully engage in discussions with IntelliMeet."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full"></div>
              <div>
                <p className="font-inter font-semibold text-sm text-text-primary">Ricky Chain</p>
                <p className="font-inter text-xs text-text-secondary">Project Manager at manifest.co</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-12 p-8 border border-stroke-primary">
            <p className="font-inter text-text-secondary mb-6">
              "Running a remote startup means endless meetings across time zones. IntelliMeet has become our secret weapon."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full"></div>
              <div>
                <p className="font-inter font-semibold text-sm text-text-primary">Millie Rock</p>
                <p className="font-inter text-xs text-text-secondary">CEO of RocketShip</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 md:py-24 bg-primary-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img
              src="/src/assets/intellimeet-logo-light.png"
              alt="IntelliMeet Logo"
              className="w-8 h-8 rounded-8 object-contain"
            />
            <span className="font-inter font-semibold text-xl">IntelliMeet</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Meetings?
          </h2>
          <p className="text-lg mb-8 font-inter opacity-90">
            Stop letting valuable insights slip through the cracks. Start capturing the complete picture with IntelliMeet. Try it free for 14 days – no credit card required.
          </p>
          <TryNowLink className="inline-block bg-white text-primary-500 px-8 py-4 rounded-8 font-inter font-medium text-base hover:bg-bg-surface-lv1 transition-colors no-underline">
            Try for free
          </TryNowLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-stroke-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Newsletter */}
            <div className="md:col-span-2">
              <h3 className="font-inter font-semibold text-base text-text-primary mb-2">Subscribe to our newsletter</h3>
              <p className="font-inter text-sm text-text-secondary mb-4">Find out what we do every week?</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Insert your email"
                  className="flex-1 bg-bg-surface-lv1 border border-stroke-secondary rounded-8 px-4 py-2 font-inter text-sm focus:outline-none focus:border-primary-500"
                />
                <button className="bg-primary-500 text-white px-6 py-2 rounded-8 font-inter font-medium text-sm hover:bg-primary-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-inter font-semibold text-sm text-text-primary mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="#about" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">About</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Leadership</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Blogs</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Careers</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Referral Program</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-inter font-semibold text-sm text-text-primary mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Tools & Integrations</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Function</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">API</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-inter font-semibold text-sm text-text-primary mb-4">Community</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Tutorials</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Q&A</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Current Research</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Developer Meet</Link></li>
                <li><Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Meetups</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-stroke-primary">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img
                src="/src/assets/intellimeet-logo-light.png"
                alt="IntelliMeet Logo"
                className="w-6 h-6 rounded-8 object-contain"
              />
              <span className="font-inter font-semibold text-sm text-text-primary">IntelliMeet</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Support</Link>
              <Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Sales</Link>
              <Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">System Status</Link>
              <Link to="#" className="font-inter text-sm text-text-secondary hover:text-primary-500 transition-colors no-underline">Share your ideas</Link>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link to="#" className="w-6 h-6 bg-bg-surface-lv1 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-xs">X</span>
              </Link>
              <Link to="#" className="w-6 h-6 bg-bg-surface-lv1 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-xs">in</span>
              </Link>
              <Link to="#" className="w-6 h-6 bg-bg-surface-lv1 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <span className="text-xs">f</span>
              </Link>
            </div>
          </div>
          <p className="text-center mt-8 font-inter text-xs text-text-secondary">
            © 2024 IntelliMeet, LLC.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
