import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Meetings from './components/Meetings';
import Calendar from './components/Calendar';
import Todos from './components/Todos';
import AskAI from './components/AskAI';
import AppIntegrations from './components/AppIntegrations';
import TrelloOAuthCallback from './components/TrelloOAuthCallback';
import IntegrationDetails from './components/IntegrationDetails';
import MyWorkspace from './components/MyWorkspace';
import AccountSettings from './components/AccountSettings';
import PlanBilling from './components/PlanBilling';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Questionnaire1 from './components/Questionnaire1';
import Questionnaire2 from './components/Questionnaire2';
import Questionnaire3 from './components/Questionnaire3';
import ForgotPassword from './components/ForgotPassword';
import EmailCheck from './components/EmailCheck';
import CreateNewPassword from './components/CreateNewPassword';
import PasswordChanged from './components/PasswordChanged';
import GoogleOAuthCallback from './components/GoogleOAuthCallback';
import { ClerkTokenBridge } from './components/ClerkTokenBridge';
import PostSignInRedirect from './components/PostSignInRedirect';
import OnboardingPlan from './components/OnboardingPlan';
import BillingSuccess from './components/BillingSuccess';
import BillingCancel from './components/BillingCancel';
import { DeferredPricingRoute, DeferredCheckoutRoute } from './components/DeferredSignupRoutes';
import { isClerkConfigured } from './config/clerk';
import { RequireOnboarded } from './components/RequireOnboarded';
import { RequireEnterprise } from './components/RequireEnterprise';

function App() {
  return (
    <Router>
      {isClerkConfigured() ? <ClerkTokenBridge /> : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <RequireOnboarded>
              <Dashboard />
            </RequireOnboarded>
          }
        />
        <Route
          path="/meetings"
          element={
            <RequireOnboarded>
              <Meetings />
            </RequireOnboarded>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireOnboarded>
              <Calendar />
            </RequireOnboarded>
          }
        />
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
        <Route path="/integrations/trello/callback" element={<TrelloOAuthCallback />} />
        <Route
          path="/todos"
          element={
            <RequireOnboarded>
              <Todos />
            </RequireOnboarded>
          }
        />
        {/* Experimental/deferred routes are intentionally namespaced off the core flow. */}
        <Route
          path="/experimental/ask-ai"
          element={
            <RequireOnboarded>
              <AskAI />
            </RequireOnboarded>
          }
        />
        <Route path="/deferred/app-integrations" element={<AppIntegrations />} />
        <Route path="/deferred/app-integrations/:integrationId" element={<IntegrationDetails />} />
        <Route
          path="/my-workspace"
          element={
            <RequireOnboarded>
              <RequireEnterprise>
                <MyWorkspace />
              </RequireEnterprise>
            </RequireOnboarded>
          }
        />
        <Route
          path="/account-settings"
          element={
            <RequireOnboarded>
              <AccountSettings />
            </RequireOnboarded>
          }
        />
        <Route path="/deferred/plan-billing" element={<PlanBilling />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
        <Route path="/auth/post-signin" element={<PostSignInRedirect />} />
        <Route path="/onboarding/plan" element={<OnboardingPlan />} />
        <Route path="/pricing" element={<OnboardingPlan />} />
        <Route path="/signup/questionnaire-1" element={<Navigate to="/onboarding/questionnaire-1" replace />} />
        <Route path="/signup/questionnaire-2" element={<Navigate to="/onboarding/questionnaire-2" replace />} />
        <Route path="/signup/questionnaire-3" element={<Navigate to="/onboarding/questionnaire-3" replace />} />
        <Route path="/onboarding/questionnaire-1" element={<Questionnaire1 />} />
        <Route path="/onboarding/questionnaire-2" element={<Questionnaire2 />} />
        <Route path="/onboarding/questionnaire-3" element={<Questionnaire3 />} />
        <Route path="/deferred/signup/pricing" element={<DeferredPricingRoute />} />
        <Route path="/deferred/signup/checkout" element={<DeferredCheckoutRoute />} />
        <Route path="/signin/*" element={<SignIn />} />
        <Route path="/signup/*" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/email-check" element={<EmailCheck />} />
        <Route path="/forgot-password/create-new" element={<CreateNewPassword />} />
        <Route path="/forgot-password/success" element={<PasswordChanged />} />
      </Routes>
    </Router>
  );
}

export default App;
