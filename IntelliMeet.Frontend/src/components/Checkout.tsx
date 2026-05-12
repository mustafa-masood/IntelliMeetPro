import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { plan = 'professional', billing = 'monthly' } = location.state || {};

    const [cardholderName, setCardholderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    const planPrices: Record<string, Record<string, number>> = {
        monthly: {
            starter: 0,
            professional: 12,
            organization: 39
        },
        annual: {
            starter: 0,
            professional: 10,
            organization: 35
        }
    };

    const price = planPrices[billing]?.[plan] || 0;
    const subtotal = price;
    const tax = 0;
    const total = subtotal + tax;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle subscription
        navigate('/dashboard');
    };

    return (
        <div className="flex min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-bg-surface-pure">
            {/* Left Column - Checkout Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-bg-surface-lv2 rounded-24">
                <div className="w-full max-w-7xl flex gap-16">
                    {/* Summary Section */}
                    <div className="flex-1 flex flex-col gap-10">
                        <h2 className="font-inter font-semibold text-[20px] text-text-secondary m-0">Summary</h2>
                        <div className="border-b border-text-secondary pb-2">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-inter font-semibold text-[36px] text-text-secondary leading-[46px]">
                                    ${total}
                                </span>
                                <span className="font-inter font-medium text-[17px] text-text-secondary">/month</span>
                            </div>
                            <p className="font-inter font-semibold text-[20px] text-text-secondary capitalize">
                                {plan}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="font-inter font-semibold text-[20px] text-text-secondary">Subtotal</p>
                            <p className="font-inter font-semibold text-[20px] text-text-secondary">${subtotal}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="font-inter font-medium text-[14px] text-text-secondary">Tax</p>
                            <p className="font-inter font-medium text-[14px] text-text-secondary">${tax}</p>
                        </div>
                        <div className="border-t border-text-secondary pt-2 flex justify-between items-center">
                            <p className="font-inter font-semibold text-[20px] text-text-secondary">Total</p>
                            <p className="font-inter font-semibold text-[20px] text-text-secondary">${total}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-stroke-primary" />

                    {/* Payment Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-6">
                            {/* Contact Information */}
                            <div className="flex flex-col gap-3.5">
                                <label className="font-inter font-semibold text-base text-[#2d2d36]">
                                    Contact Information
                                </label>
                                <div className="bg-[#d7d7d7] rounded-16 h-11 flex items-center gap-2 px-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="L22 6L12 13L2 6" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span className="font-inter font-medium text-sm text-[#767676] opacity-80">
                                        ebenuwa8060@gmail.com
                                    </span>
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div className="flex flex-col gap-3.5">
                                <label className="font-inter font-medium text-sm text-[#2d2d36]">
                                    Cardholder Name
                                </label>
                                <input
                                    type="text"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e.target.value)}
                                    placeholder="Alex Yakubu"
                                    className="bg-[#e4ecee] rounded-8 h-11 px-3 font-inter font-medium text-sm text-[#767676] focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>

                            {/* Card Information */}
                            <div className="flex flex-col gap-3.5">
                                <label className="font-inter font-medium text-sm text-[#2d2d36]">
                                    Card Information
                                </label>
                                <div className="bg-[#e4ecee] rounded-8 h-22 p-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between px-2 border-b border-primary-500 pb-2">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                            placeholder="1234 1234 1234 1234"
                                            className="flex-1 bg-transparent font-inter font-medium text-sm text-[#767676] focus:outline-none"
                                            maxLength={19}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <div className="w-8 h-6 bg-white rounded"></div>
                                            <div className="w-8 h-6 bg-white rounded"></div>
                                            <div className="w-8 h-6 bg-white rounded"></div>
                                            <div className="w-8 h-6 bg-white rounded"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 px-2">
                                        <div className="flex-1 border-r border-primary-500 pr-2">
                                            <input
                                                type="text"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                placeholder="MM/YY"
                                                className="w-full bg-transparent font-inter font-medium text-sm text-[#767676] focus:outline-none"
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center justify-between pl-2">
                                            <input
                                                type="text"
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="CVC"
                                                className="flex-1 bg-transparent font-inter font-medium text-sm text-[#767676] focus:outline-none"
                                                maxLength={3}
                                                required
                                            />
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect x="2" y="4" width="20" height="16" rx="2" stroke="#767676" strokeWidth="2"/>
                                                <path d="M2 10H22" stroke="#767676" strokeWidth="2"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subscribe Button */}
                            <button
                                type="submit"
                                className="w-full bg-primary-500 text-white rounded-16 h-11 flex items-center justify-center font-inter font-medium text-sm hover:bg-primary-600 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
