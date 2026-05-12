import { Navigate } from 'react-router-dom';
import { isClerkConfigured } from '../config/clerk';
import Pricing from './Pricing';
import Checkout from './Checkout';

/** Legacy mock pricing: when Clerk SaaS is enabled, paid plans live on `/onboarding/plan` + Stripe. */
export function DeferredPricingRoute() {
  if (isClerkConfigured()) return <Navigate to="/onboarding/plan" replace />;
  return <Pricing />;
}

/** Legacy mock checkout form — real payments use Stripe Checkout from `/onboarding/plan`. */
export function DeferredCheckoutRoute() {
  if (isClerkConfigured()) return <Navigate to="/onboarding/plan" replace />;
  return <Checkout />;
}
