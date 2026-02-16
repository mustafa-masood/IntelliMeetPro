import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Meetings from './components/Meetings';
import Calendar from './components/Calendar';
import Todos from './components/Todos';
import AskAI from './components/AskAI';
import AppIntegrations from './components/AppIntegrations';
import IntegrationDetails from './components/IntegrationDetails';
import MyWorkspace from './components/MyWorkspace';
import AccountSettings from './components/AccountSettings';
import PlanBilling from './components/PlanBilling';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Questionnaire1 from './components/Questionnaire1';
import Questionnaire2 from './components/Questionnaire2';
import Questionnaire3 from './components/Questionnaire3';
import Pricing from './components/Pricing';
import Checkout from './components/Checkout';
import ForgotPassword from './components/ForgotPassword';
import EmailCheck from './components/EmailCheck';
import CreateNewPassword from './components/CreateNewPassword';
import PasswordChanged from './components/PasswordChanged';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/ask-ai" element={<AskAI />} />
        <Route path="/app-integrations" element={<AppIntegrations />} />
        <Route path="/app-integrations/:integrationId" element={<IntegrationDetails />} />
        <Route path="/my-workspace" element={<MyWorkspace />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/plan-billing" element={<PlanBilling />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/questionnaire-1" element={<Questionnaire1 />} />
        <Route path="/signup/questionnaire-2" element={<Questionnaire2 />} />
        <Route path="/signup/questionnaire-3" element={<Questionnaire3 />} />
        <Route path="/signup/pricing" element={<Pricing />} />
        <Route path="/signup/checkout" element={<Checkout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/email-check" element={<EmailCheck />} />
        <Route path="/forgot-password/create-new" element={<CreateNewPassword />} />
        <Route path="/forgot-password/success" element={<PasswordChanged />} />
      </Routes>
    </Router>
  );
}

export default App;
