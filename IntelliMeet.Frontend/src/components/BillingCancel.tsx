import React from 'react';
import { Link } from 'react-router-dom';

const BillingCancel: React.FC = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-surface-lv1 p-6 text-center gap-4">
      <h1 className="font-inter-tight text-2xl font-semibold text-text-primary m-0">Checkout not completed</h1>
      <p className="text-sm text-text-secondary m-0 max-w-md">
        Your subscription was not completed. You can try again later from the plan page.
      </p>
      <Link to="/onboarding/plan" className="text-sm font-medium text-primary-600 underline">
        Back to plans
      </Link>
    </div>
  );
};

export default BillingCancel;
