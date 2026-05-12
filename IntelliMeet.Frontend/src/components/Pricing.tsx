import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [billingMode, setBillingMode] = useState<'monthly' | 'annual'>('monthly');

    const plans = {
        monthly: {
            starter: { price: 'Free', features: [
                'Record & transcribe up to 3 meetings/month',
                'AI-generated meeting summaries (basic)',
                'Speaker identification (up to 3 participants)',
                'Basic search across recent meetings',
                'English transcription only',
                '1 GB secure cloud storage',
                'Access to meeting history (30 days)'
            ]},
            professional: { price: '12', unit: '/per month', description: 'For freelancers and professionals', features: [
                'All starter features +',
                'Unlimited meeting recordings & auto join',
                'Persistent speaker identification',
                'Search across all your meetings',
                'Slack bot for meeting queries',
                'Integrations with Jira, Trello, Asana',
                'Slack bot access',
                '10 GB cloud storage',
                'Smart notifications'
            ]},
            organization: { price: '39', unit: '/per month', description: 'For fast-growing businesses', features: [
                'All professional features +',
                'Workspace support',
                'Dedicated team dashboard',
                'Priority support',
                '100 GB cloud storage',
                'Custom integration support'
            ]}
        },
        annual: {
            starter: { price: 'Free', features: [
                'Record & transcribe up to 3 meetings/month',
                'AI-generated meeting summaries (basic)',
                'Speaker identification (up to 3 participants)',
                'Basic search across recent meetings',
                'English transcription only',
                '1 GB secure cloud storage',
                'Access to meeting history (30 days)'
            ]},
            professional: { price: '10', unit: '/per month', description: 'For freelancers and professionals', features: [
                'All starter features +',
                'Unlimited meeting recordings & auto join',
                'Persistent speaker identification',
                'Search across all your meetings',
                'Slack bot for meeting queries',
                'Integrations with Jira, Trello, Asana',
                'Slack bot access',
                '10 GB cloud storage',
                'Smart notifications'
            ]},
            organization: { price: '35', unit: '/per month', description: 'For fast-growing businesses', features: [
                'All professional features +',
                'Workspace support',
                'Dedicated team dashboard',
                'Priority support',
                '100 GB cloud storage',
                'Custom integration support'
            ]}
        }
    };

    const currentPlans = plans[billingMode];

    const handleSelectPlan = (planType: string) => {
        navigate('/deferred/signup/checkout', { state: { plan: planType, billing: billingMode } });
    };

    return (
        <div className="flex min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
            {/* Left Column - Pricing */}
            <div className="flex-1 flex items-start justify-center p-6 bg-bg-surface-lv2 rounded-24 overflow-y-auto">
                <div className="w-full max-w-7xl flex flex-col gap-12 items-center py-12">
                    

                    {/* Heading */}
                    <div className="flex flex-row gap-4 items-center text-center max-w-[709px]">
                        {/* Logo */}
                    <div className="flex items-center justify-center">
                        <img
                            src="/src/assets/intellimeet-logo-dark.png"
                            alt="IntelliMeet Logo"
                            className="w-[100px] h-[100px] rounded-8 object-contain"
                        />
                    </div>
                    <img width="100" height="100" src="https://img.icons8.com/ios/50/vertical-line.png" alt="vertical-line"/>
                        <h1 className="font-inter font-bold text-[56px] text-text-primary tracking-[-2.8px] leading-[1.1] m-0">
                            Plans & Pricing
                        </h1>
                    </div>

                    {/* Payment Mode Toggle */}
                    <div className="flex flex-col gap-2 items-center">
                        <div className="bg-[#e1e1e1] flex p-1 rounded-full">
                            <button
                                onClick={() => setBillingMode('monthly')}
                                className={`px-8 py-2 rounded-full font-inter font-medium text-[15px] tracking-[-0.45px] transition-all ${
                                    billingMode === 'monthly'
                                        ? 'bg-white shadow-sm text-text-primary'
                                        : 'text-text-primary'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingMode('annual')}
                                className={`px-8 py-2 rounded-full font-inter font-medium text-[15px] tracking-[-0.45px] transition-all ${
                                    billingMode === 'annual'
                                        ? 'bg-white shadow-sm text-text-primary'
                                        : 'text-text-primary'
                                }`}
                            >
                                Annual
                            </button>
                        </div>
                        {billingMode === 'annual' && (
                            <p className="font-inter font-medium text-[14px] text-[#1574d2] tracking-[-0.42px]">
                                -15% off on annual payments
                            </p>
                        )}
                    </div>

                    {/* Plan Cards */}
                    <div className="flex flex-wrap justify-center gap-8 w-full">
                        {/* Starter Plan */}
                        <div className="bg-white border border-[#e1e1e1] rounded-24 p-8 shadow-sm w-full max-w-[323px]">
                            <div className="flex flex-col gap-4 mb-8">
                                <div>
                                    <h3 className="font-inter font-bold text-[20px] text-text-primary tracking-[-0.8px] mb-1">Starter</h3>
                                    <p className="font-inter font-normal text-[14px] text-[#666] tracking-[-0.42px]">Ideal for individuals</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-inter font-bold text-[32px] text-text-primary tracking-[-1.28px]">
                                        {currentPlans.starter.price}
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2.5 mb-8">
                                {currentPlans.starter.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-primary-500 mt-0.5">✓</span>
                                        <span className="font-inter font-normal text-[15px] text-text-primary tracking-[-0.45px] leading-[1.2]">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSelectPlan('starter')}
                                className="w-full bg-neutral-900 text-white rounded-full px-6 py-3 font-inter font-medium text-base tracking-[-0.48px] hover:bg-neutral-800 transition-colors"
                            >
                                Try for free
                            </button>
                        </div>

                        {/* Professional Plan - Highlighted */}
                        <div className="bg-primary-500 rounded-28 p-1 shadow-lg relative w-full max-w-[332px]">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-primary-500 px-3 py-1 rounded-full text-xs font-inter font-semibold tracking-[0.96px] whitespace-nowrap">
                                MOST POPULAR PLAN
                            </div>
                            <div className="bg-white rounded-24 p-8">
                                <div className="flex flex-col gap-4 mb-8">
                                    <div>
                                        <h3 className="font-inter font-bold text-[20px] text-text-primary tracking-[-0.8px] mb-1">Professional</h3>
                                        <p className="font-inter font-normal text-[14px] text-[#666] tracking-[-0.42px]">
                                            {currentPlans.professional.description}
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-inter font-medium text-[32px] text-text-primary tracking-[-1.28px]">$</span>
                                        <span className="font-inter font-bold text-[32px] text-text-primary tracking-[-1.28px]">
                                            {currentPlans.professional.price}
                                        </span>
                                        <span className="font-inter font-bold text-[20.64px] text-text-primary tracking-[-1.28px]">
                                            {currentPlans.professional.unit}
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 mb-8">
                                    {currentPlans.professional.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                            <span className="text-primary-500 mt-0.5 font-bold">✓</span>
                                            <span className={`font-inter text-[15px] tracking-[-0.45px] leading-[1.2] ${
                                                feature.startsWith('All starter') 
                                                    ? 'font-bold text-text-primary' 
                                                    : 'font-normal text-text-primary'
                                            }`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleSelectPlan('professional')}
                                    className="w-full bg-neutral-900 text-white rounded-full px-6 py-3 font-inter font-medium text-base tracking-[-0.48px] hover:bg-neutral-800 transition-colors"
                                >
                                    Select plan
                                </button>
                            </div>
                        </div>

                        {/* Organization Plan */}
                        <div className="bg-white border border-[#e1e1e1] rounded-24 p-8 shadow-sm w-full max-w-[323px]">
                            <div className="flex flex-col gap-4 mb-8">
                                <div>
                                    <h3 className="font-inter font-bold text-[20px] text-text-primary tracking-[-0.8px] mb-1">Organization</h3>
                                    <p className="font-inter font-normal text-[14px] text-[#666] tracking-[-0.42px]">
                                        {currentPlans.organization.description}
                                    </p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-inter font-medium text-[32px] text-text-primary tracking-[-1.28px]">$</span>
                                    <span className="font-inter font-bold text-[32px] text-text-primary tracking-[-1.28px]">
                                        {currentPlans.organization.price}
                                    </span>
                                    <span className="font-inter font-bold text-[20.64px] text-text-primary tracking-[-1.28px]">
                                        {currentPlans.organization.unit}
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2.5 mb-8">
                                {currentPlans.organization.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-primary-500 mt-0.5 font-bold">✓</span>
                                        <span className={`font-inter text-[15px] tracking-[-0.45px] leading-[1.2] ${
                                            feature.startsWith('All professional') 
                                                ? 'font-bold text-text-primary' 
                                                : 'font-normal text-text-primary'
                                        }`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSelectPlan('organization')}
                                className="w-full bg-neutral-900 text-white rounded-full px-6 py-3 font-inter font-medium text-base tracking-[-0.48px] hover:bg-neutral-800 transition-colors"
                            >
                                Select plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
