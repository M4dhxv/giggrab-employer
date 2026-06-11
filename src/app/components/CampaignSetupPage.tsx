import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { Check } from 'lucide-react';

export default function ChoosePlanPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'standard' | 'premium'>('standard');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl mb-2">Choose Plan</h1>
          <p className="text-gray-600 mb-8">Select the plan that fits your hiring needs.</p>

          <div className="space-y-4 mb-8">
            <PlanCard
              title="FREE"
              price="£0/day"
              badge="Best for testing"
              features={[
                'Organic listing only',
                'Limited visibility',
                'Workers discover jobs naturally'
              ]}
              selected={selectedPlan === 'free'}
              onSelect={() => setSelectedPlan('free')}
            />

            <PlanCard
              title="STANDARD"
              price="Variable"
              badge="Recommended"
              recommended
              features={[
                'Featured placement',
                'Voice screening',
                'SMS follow-up',
                'Higher visibility'
              ]}
              selected={selectedPlan === 'standard'}
              onSelect={() => setSelectedPlan('standard')}
            />

            <PlanCard
              title="PREMIUM"
              price="Variable"
              badge="Fastest hiring"
              features={[
                'Everything in Standard',
                'Proactive worker outreach',
                'Candidate database access',
                'Priority worker acquisition',
                'Fastest time-to-fill'
              ]}
              selected={selectedPlan === 'premium'}
              onSelect={() => setSelectedPlan('premium')}
            />
          </div>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/set-budget')}
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
            Continue to Budget
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  badge,
  recommended,
  features,
  selected,
  onSelect
}: {
  title: string;
  price: string;
  badge: string;
  recommended?: boolean;
  features: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${
        selected ? 'border-[#10b981] shadow-lg' : 'border-gray-200 hover:border-gray-300'
      } ${recommended ? 'ring-2 ring-[#10b981] ring-offset-2' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg mb-1">{title}</h3>
          <div className="text-2xl mb-2">{price}</div>
        </div>
        <span className="bg-[#10b981]/10 text-[#10b981] text-xs px-3 py-1 rounded-full">
          {badge}
        </span>
      </div>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700">
            <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JobSummary({ title, location }: { title: string; location: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
      <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-[#10b981]" />
      </div>
      <div>
        <div className="text-sm">{title}</div>
        <div className="text-xs text-gray-500">{location}</div>
      </div>
    </div>
  );
}

function VolumeOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#10b981] bg-[#10b981]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-lg">{label}</div>
      <div className="text-xs text-gray-500 mt-1">workers</div>
    </button>
  );
}

function UrgencyOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#10b981] bg-[#10b981]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-lg">{label}</div>
    </button>
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
