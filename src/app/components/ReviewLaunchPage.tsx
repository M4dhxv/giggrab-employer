import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Briefcase, TrendingUp, Clock, Users, PhoneCall } from 'lucide-react';

export default function ReviewLaunchPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PageHeader />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 gg-in">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Ready to launch?</h1>
            <p className="text-gray-500">Review your job details before going live.</p>
          </div>

          {/* Job summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-5 gg-in gg-d1">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Warehouse Associate</h2>

            <div className="grid sm:grid-cols-2 gap-5 mb-7">
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value="Manchester, UK" />
              <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Salary" value="£12–15/hour" />
              <InfoItem icon={<TrendingUp className="w-4 h-4" />} label="Plan" value="Standard" />
              <InfoItem icon={<TrendingUp className="w-4 h-4" />} label="Daily Budget" value="£20/day" />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Expected Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-4 h-4" />} label="Reach" value="450 workers" />
                <StatCard icon={<PhoneCall className="w-4 h-4" />} label="Calls" value="35 workers" />
                <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Qualified" value="8 candidates" />
                <StatCard icon={<Clock className="w-4 h-4" />} label="Time-to-Fill" value="7–14 days" />
              </div>
            </div>
          </div>

          {/* ToS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-7 gg-in gg-d2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#10b981]"
              />
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <button className="text-[#10b981] hover:underline font-medium">GigGrab Terms of Service</button>
                . I understand Sarah will make outbound calls on my behalf.
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reach-budget')}
              className="border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => agreed && navigate('/dashboard')}
              disabled={!agreed}
              className="flex-1 sm:flex-none sm:px-10 flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-bold transition-all"
            >
              Launch Campaign →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-gray-500 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-base font-bold text-gray-900">{value}</div>
    </div>
  );
}

function PageHeader() {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <button onClick={() => navigate('/')} className="text-xl font-extrabold text-[#10b981] tracking-tight">
          GigGrab
        </button>
      </div>
    </header>
  );
}
