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

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Worker (candidate) side — unchanged */}
          <Route path="/" element={<WorkerLandingPage />} />
          <Route path="/worker" element={<Navigate to="/" replace />} />
          <Route path="/worker/get-started" element={<WorkerGetStartedPage />} />
          <Route path="/worker/start" element={<WorkerStartPage />} />
          <Route path="/worker/call" element={<WorkerCallPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />

          {/* Employer flow */}
          <Route path="/employer" element={<LandingPage />} />
          <Route path="/post-job" element={<CreateJobPage />} />
          <Route path="/connecting" element={<ConnectingPage />} />
          <Route path="/live-call" element={<LiveCallPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
