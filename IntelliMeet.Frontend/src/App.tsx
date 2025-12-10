import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Meetings from './components/Meetings';
import Todos from './components/Todos';
import AskAI from './components/AskAI';
import AppIntegrations from './components/AppIntegrations';
import IntegrationDetails from './components/IntegrationDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/ask-ai" element={<AskAI />} />
        <Route path="/app-integrations" element={<AppIntegrations />} />
        <Route path="/app-integrations/:integrationId" element={<IntegrationDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
