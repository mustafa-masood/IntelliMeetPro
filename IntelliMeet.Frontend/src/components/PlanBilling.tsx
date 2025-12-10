import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  plan: string;
  amount: string;
}

const PlanBilling: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const invoices: Invoice[] = [
    { id: '1', invoiceNumber: 'Invoice 0012', date: '04/01/2025', plan: 'Free', amount: '$00.00' },
    { id: '2', invoiceNumber: 'Invoice 0011', date: '04/01/2025', plan: 'Business', amount: '$99.00' },
    { id: '3', invoiceNumber: 'Invoice 0010', date: '03/01/2025', plan: 'Free', amount: '$00.00' },
    { id: '4', invoiceNumber: 'Invoice 0009', date: '02/01/2025', plan: 'Free', amount: '$00.00' },
    { id: '5', invoiceNumber: 'Invoice 0008', date: '01/01/2025', plan: 'Free', amount: '$00.00' },
  ];

  return (
    <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
          <SearchBar />
        </div>

        {/* Page Header */}
        <div className="px-8 pt-[10px] flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">Plan & Billings</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8">
          {/* Current Plan Section */}
          <div className="max-w-[1106px] mx-auto flex flex-col items-center gap-4 mb-8">
            <h2 className="font-inter font-medium text-2xl text-text-primary tracking-[-0.27px]">You are on the free plan</h2>
            <div className="flex gap-2 bg-bg-surface-pure border border-stroke-primary rounded-8 p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-8 font-inter font-medium text-sm tracking-[-0.084px] transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary-500 text-white'
                    : 'bg-transparent text-text-secondary hover:bg-bg-surface-lv1'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annually')}
                className={`px-6 py-2 rounded-8 font-inter font-medium text-sm tracking-[-0.084px] transition-colors ${
                  billingPeriod === 'annually'
                    ? 'bg-primary-500 text-white'
                    : 'bg-transparent text-text-secondary hover:bg-bg-surface-lv1'
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-[1106px] mx-auto flex gap-4 mb-8">
            {/* Free Plan */}
            <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 relative overflow-hidden">
              <div className="absolute top-[-46px] right-[-46px] w-[99px] h-[99px] bg-primary-50 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-inter font-medium text-2xl text-text-primary tracking-[-0.27px] m-0">Free</h3>
                      <span className="bg-state-success-lighter border border-stroke-primary rounded-4 px-2 py-0.5 text-xs font-inter font-medium text-state-success-dark">
                        Current plan
                      </span>
                    </div>
                    <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">
                      Basic features and reporting.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter font-normal text-2xl text-text-primary tracking-[-0.27px] m-0 line-through opacity-50">
                      $10
                    </p>
                    <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">/month</p>
                  </div>
                </div>
                <div className="h-px bg-stroke-primary mb-4" />
                <button
                  disabled
                  className="w-full bg-bg-surface-lv2 border border-stroke-primary rounded-8 px-3 py-2 font-inter font-medium text-sm text-text-tertiary tracking-[-0.084px] cursor-not-allowed mb-4"
                >
                  Current
                </button>
                <div className="flex flex-col gap-2">
                  <p className="font-inter font-medium text-base text-text-primary tracking-[-0.176px] mb-2">Features</p>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Record & transcribe up to 3 meetings/month
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      AI-generated meeting summaries (basic)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Speaker identification (up to 3 participants)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Basic search across recent meetings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      English transcription only
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      1 GB secure cloud storage
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Access to meeting history (30 days)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Plan */}
            <div className="flex-1 bg-primary-500 border border-primary-500 rounded-12 shadow-card p-4 relative overflow-hidden">
              <div className="absolute top-[-64px] right-[-64px] w-[127px] h-[127px] bg-white/10 rounded-full" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-inter font-medium text-2xl text-white tracking-[-0.27px] m-0">Business</h3>
                      <span className="bg-white/20 border border-white/30 rounded-4 px-2 py-0.5 text-xs font-inter font-medium text-white">
                        Most popular
                      </span>
                    </div>
                    <p className="font-inter font-normal text-base text-white/90 tracking-[-0.176px] m-0">
                      Manage your fast growing team or business
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter font-normal text-2xl text-white tracking-[-0.27px] m-0">
                      {billingPeriod === 'monthly' ? '$99' : '$990'}
                    </p>
                    <p className="font-inter font-normal text-base text-white/90 tracking-[-0.176px] m-0">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-white/20 mb-4" />
                <button className="w-full bg-white border border-white rounded-8 px-3 py-2 font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] cursor-pointer hover:bg-white/90 transition-colors mb-4">
                  Upgrade
                </button>
                <div className="flex flex-col gap-2">
                  <p className="font-inter font-medium text-base text-white tracking-[-0.176px] mb-2">Features</p>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Unlimited meeting recordings & auto join
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Persistent speaker identification
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Search across all your meetings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Slack bot for meeting queries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Integrations with Jira, Trello, Asana
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      10 GB cloud storage
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-white/90 tracking-[-0.084px]">
                      Smart notifications
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 relative overflow-hidden">
              <div className="absolute top-[-46px] right-[-46px] w-[99px] h-[99px] bg-primary-50 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-inter font-medium text-2xl text-text-primary tracking-[-0.27px] m-0">Enterprise</h3>
                      <span className="bg-state-success-lighter border border-stroke-primary rounded-4 px-2 py-0.5 text-xs font-inter font-medium text-state-success-dark">
                        40% Off
                      </span>
                    </div>
                    <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">
                      For advanced security, control & support
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter font-normal text-2xl text-text-primary tracking-[-0.27px] m-0">
                      {billingPeriod === 'monthly' ? '$199' : '$1194'}
                    </p>
                    <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px] m-0">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-stroke-primary mb-4" />
                <button className="w-full bg-bg-surface-lv2 border border-stroke-primary rounded-8 px-3 py-2 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer hover:bg-bg-surface-lv1 transition-colors mb-4">
                  Upgrade
                </button>
                <div className="flex flex-col gap-2">
                  <p className="font-inter font-medium text-base text-text-primary tracking-[-0.176px] mb-2">Features</p>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Workspace support
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Dedicated team dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      Priority support
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                      100 GB cloud storage
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing History Section */}
          <div className="max-w-[1106px] mx-auto bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4">
            <div className="mb-4">
              <h3 className="font-inter font-medium text-lg text-text-primary tracking-[-0.27px] m-0 mb-1">
                Billing History
              </h3>
              <p className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] m-0">
                Access all your previous invoices
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke-primary">
                    <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                      Invoice
                    </th>
                    <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                      Date
                    </th>
                    <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                      Plan
                    </th>
                    <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                      Amount
                    </th>
                    <th className="text-left px-4 py-2.5 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-stroke-primary hover:bg-bg-surface-lv1 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                          <span className="font-inter font-normal text-sm text-text-primary tracking-[-0.084px]">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                          {invoice.date}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                          {invoice.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px]">
                          {invoice.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-bg-surface-lv1 rounded-4 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="4" r="1" fill="#2b3d39" />
                            <circle cx="8" cy="8" r="1" fill="#2b3d39" />
                            <circle cx="8" cy="12" r="1" fill="#2b3d39" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanBilling;

