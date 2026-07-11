import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import LandingPage from './components/LandingPage';
import CreateJobPage from './components/CreateJobPage';
import ConnectingPage from './components/ConnectingPage';
import LiveCallPage from './components/LiveCallPage';
import ServicePage from './components/ServicePage';
import LaunchPage from './components/LaunchPage';
import DashboardPage from './components/DashboardPage';
import CampaignsPage from './components/CampaignsPage';
import SettingsPage from './components/SettingsPage';
import WorkerLandingPage from './components/WorkerLandingPage';
import WorkerGetStartedPage from './components/WorkerGetStartedPage';
import WorkerStartPage from './components/WorkerStartPage';
import WorkerCallPage from './components/WorkerCallPage';
import WorkerProfilePage from './components/WorkerProfilePage';
import WorkerDashboardPage from './components/WorkerDashboardPage';
import CandidateFormPage from './components/CandidateFormPage';
import ScreeningCallPage from './components/ScreeningCallPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import EnterpriseOnboardingPage from './components/EnterpriseOnboardingPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Employer flow — homepage */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/employer" element={<Navigate to="/" replace />} />

          {/* Worker (candidate) side */}
          <Route path="/worker" element={<WorkerLandingPage />} />
          <Route path="/worker/get-started" element={<WorkerGetStartedPage />} />
          <Route path="/worker/start" element={<WorkerStartPage />} />
          <Route path="/worker/call" element={<WorkerCallPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
          <Route path="/post-job" element={<CreateJobPage />} />
          <Route path="/connecting" element={<ConnectingPage />} />
          <Route path="/live-call" element={<LiveCallPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Candidate flow pages */}
          <Route path="/form" element={<CandidateFormPage />} />
          <Route path="/screening-call" element={<ScreeningCallPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/enterprise" element={<EnterpriseOnboardingPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
