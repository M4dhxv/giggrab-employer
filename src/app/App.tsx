import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import LandingPage from './components/LandingPage';
import CreateJobPage from './components/CreateJobPage';
import MarketIntelPage from './components/MarketIntelPage';
import CallGigGrabPage from './components/CallGigGrabPage';
import ChoosePlanPage from './components/ChoosePlanPage';
import SetBudgetPage from './components/SetBudgetPage';
import DashboardPage from './components/DashboardPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/post-job" element={<CreateJobPage />} />
          <Route path="/market-intel" element={<MarketIntelPage />} />
          <Route path="/call-giggrab" element={<CallGigGrabPage />} />
          <Route path="/choose-plan" element={<ChoosePlanPage />} />
          <Route path="/set-budget" element={<SetBudgetPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
