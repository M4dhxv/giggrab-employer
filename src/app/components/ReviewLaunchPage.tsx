import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import { MapPin, Briefcase, TrendingUp, Clock, Users, PhoneCall } from 'lucide-react';

export default function ReviewLaunchPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleLaunch = () => {
    if (agreed) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-2">Ready to launch?</h1>
          <p className="text-gray-600 mb-8">Review your job posting details before going live.</p>

          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl mb-6">Warehouse Associate</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InfoItem
                icon={<MapPin className="w-5 h-5" />}
                label="Location"
                value="Manchester, UK"
              />
              <InfoItem
                icon={<Briefcase className="w-5 h-5" />}
                label="Salary"
                value="£12-15/hour"
              />
              <InfoItem
                icon={<TrendingUp className="w-5 h-5" />}
                label="Plan"
                value="Standard"
              />
              <InfoItem
                icon={<TrendingUp className="w-5 h-5" />}
                label="Daily Budget"
                value="£20/day"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg mb-4">Expected Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  label="Reach"
                  value="450 workers"
                />
                <StatCard
                  icon={<PhoneCall className="w-5 h-5" />}
                  label="Calls"
                  value="35 workers"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Qualified"
                  value="8 candidates"
                />
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Time-to-Fill"
                  value="7-14 days"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  sx={{
                    color: '#10b981',
                    '&.Mui-checked': {
                      color: '#10b981',
                    }
                  }}
                />
              }
              label={
                <span className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-[#10b981] hover:underline">
                    GigGrab Terms of Service
                  </a>
                </span>
              }
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outlined"
              size="large"
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                px: 6,
                py: 1.5,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleLaunch}
              disabled={!agreed}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                px: 6,
                py: 1.5,
                backgroundColor: '#10b981',
                '&:hover': {
                  backgroundColor: '#059669'
                }
              }}
            >
              Launch Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-1">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="text-lg">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-lg">{value}</div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl text-[#10b981]">GigGrab</div>
      </div>
    </header>
  );
}
