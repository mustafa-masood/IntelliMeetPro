import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
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
      </Routes>
    </Router>
  );
}

export default App;
