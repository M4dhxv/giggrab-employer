import { BrowserRouter as Router, Routes, Route } from 'react-router';
import CandidateFormPage from './components/CandidateFormPage';
import ScreeningCallPage from './components/ScreeningCallPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import InviteOnlyPage from './components/InviteOnlyPage';

// Invite-only FineClean candidate portal. Only the candidate flow (/form,
// /screening-call) and the internal /admin dashboard resolve; every other URL
// renders the invite-only page in place — no redirects, no marketing pages.
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Candidate flow — the only public pages */}
          <Route path="/form" element={<CandidateFormPage />} />
          <Route path="/screening-call" element={<ScreeningCallPage />} />

          {/* Internal recruiter dashboard (not linked anywhere public) */}
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Home + everything else: invite-only notice, rendered in place */}
          <Route path="*" element={<InviteOnlyPage />} />
        </Routes>
      </div>
    </Router>
  );
}
