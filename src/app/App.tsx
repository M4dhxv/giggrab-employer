import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import LandingPage from './components/LandingPage';
import CreateJobPage from './components/CreateJobPage';
import MarketIntelPage from './components/MarketIntelPage';
import CallGigGrabPage from './components/CallGigGrabPage';
import ChoosePlanPage from './components/ChoosePlanPage';
import SetBudgetPage from './components/SetBudgetPage';
import DashboardPage from './components/DashboardPage';
import PricingPage from './components/PricingPage';
import LiveScreeningPage from './components/LiveScreeningPage';
import ReachBudgetPage from './components/ReachBudgetPage';
import ReviewLaunchPage from './components/ReviewLaunchPage';
import EnterpriseOnboardingPage from './components/EnterpriseOnboardingPage';
import WorkerLandingPage from './components/WorkerLandingPage';
import WorkerGetStartedPage from './components/WorkerGetStartedPage';
import WorkerStartPage from './components/WorkerStartPage';
import WorkerCallPage from './components/WorkerCallPage';
import WorkerProfilePage from './components/WorkerProfilePage';
import WorkerDashboardPage from './components/WorkerDashboardPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<WorkerLandingPage />} />
          <Route path="/employer" element={<LandingPage />} />
          <Route path="/post-job" element={<CreateJobPage />} />
          <Route path="/market-intel" element={<MarketIntelPage />} />
          <Route path="/call-giggrab" element={<CallGigGrabPage />} />
          <Route path="/choose-plan" element={<ChoosePlanPage />} />
          <Route path="/set-budget" element={<SetBudgetPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Pricing + campaign funnel */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/live-screening" element={<LiveScreeningPage />} />
          <Route path="/reach-budget" element={<ReachBudgetPage />} />
          <Route path="/review" element={<ReviewLaunchPage />} />

          {/* Enterprise white-label onboarding */}
          <Route path="/enterprise" element={<EnterpriseOnboardingPage />} />

          {/* Worker (candidate) side */}
          <Route path="/worker" element={<Navigate to="/" replace />} />
          <Route path="/worker/get-started" element={<WorkerGetStartedPage />} />
          <Route path="/worker/start" element={<WorkerStartPage />} />
          <Route path="/worker/call" element={<WorkerCallPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
