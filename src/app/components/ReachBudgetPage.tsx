import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Slider } from '@mui/material';
import { Check, TrendingUp, Clock, Users, PhoneCall } from 'lucide-react';

type PlanId = 'free' | 'standard' | 'premium';

const PLANS: {
  id: PlanId;
  title: string;
  price: string;
  badge: string;
  recommended?: boolean;
  features: string[];
}[] = [
  {
    id: 'free',
    title: 'FREE',
    price: '£0/day',
    badge: 'Best for testing',
    features: ['Listed on GigGrab', 'Basic visibility', 'Organic discovery only'],
  },
  {
    id: 'standard',
    title: 'STANDARD',
    price: '£15–£50/day',
    badge: 'Most popular',
    recommended: true,
    features: [
      'Featured placement',
      'Voice screening',
      'SMS follow-up',
      'Candidate ranking',
      'Worker reactivation',
    ],
  },
  {
    id: 'premium',
    title: 'PREMIUM',
    price: '£50+/day',
    badge: 'Fastest fill',
    features: [
      'Everything in Standard',
      'Worker outreach campaigns',
      'Candidate database access',
      'Priority candidate delivery',
    ],
  },
];

function getEstimates(budget: number) {
  if (budget === 0) return { reach: 150, calls: 0, qualified: 2, timeToFill: '21–30 days' };
  return {
    reach: Math.round(budget * 22.5),
    calls: Math.round(budget * 1.75),
    qualified: Math.round(budget * 0.4),
    timeToFill: budget < 15 ? '14–21 days' : budget < 35 ? '7–14 days' : '3–7 days',
  };
}

export default function ReachBudgetPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('standard');
  const [dailyBudget, setDailyBudget] = useState(20);

  function handlePlanSelect(plan: PlanId) {
    setSelectedPlan(plan);
    if (plan === 'free') setDailyBudget(0);
    else if (plan === 'standard' && dailyBudget === 0) setDailyBudget(20);
    else if (plan === 'premium' && dailyBudget < 50) setDailyBudget(75);
  }

  const est = getEstimates(dailyBudget);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PageHeader />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 gg-in">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">How many workers do you need?</h1>
            <p className="text-gray-500">Choose a plan and set your daily budget to reach qualified candidates.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Plans + slider */}
            <div className="lg:col-span-2 space-y-4">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  {...plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              ))}

              {selectedPlan !== 'free' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-7 gg-in">
                  <h3 className="font-bold text-gray-900 mb-5">Daily Budget</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-gray-900">£{dailyBudget}</span>
                    <span className="text-gray-400">/day</span>
                  </div>
                  <Slider
                    value={dailyBudget}
                    onChange={(_, v) => setDailyBudget(v as number)}
                    min={0}
                    max={250}
                    step={5}
                    sx={{
                      color: '#10b981',
                      '& .MuiSlider-thumb': { width: 20, height: 20 },
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mb-6">
                    <span>£0</span><span>£250</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Estimated Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <EstimateStat icon={<Users className="w-4 h-4" />} label="Expected Reach" value={`${est.reach} workers`} />
                      <EstimateStat icon={<PhoneCall className="w-4 h-4" />} label="Expected Calls" value={`${est.calls} workers`} />
                      <EstimateStat icon={<TrendingUp className="w-4 h-4" />} label="Qualified Candidates" value={`${est.qualified} workers`} />
                      <EstimateStat icon={<Clock className="w-4 h-4" />} label="Est. Time-To-Fill" value={est.timeToFill} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation panel */}
            <div>
              <div className="bg-white rounded-2xl border-2 border-[#10b981] p-6 sticky top-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">GigGrab Recommendation</h3>
                </div>

                <div className="text-xs text-gray-500 mb-1">Based on:</div>
                <ul className="text-xs text-gray-600 space-y-0.5 ml-3 mb-4">
                  <li>• Warehouse Associate</li>
                  <li>• Manchester</li>
                  <li>• Medium urgency</li>
                </ul>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="text-xs text-gray-500 mb-1">Recommended</div>
                  <div className="text-2xl font-extrabold text-gray-900 mb-3">£35/day</div>
                  <div className="text-xs text-gray-500 mb-1">Expected</div>
                  <div className="text-sm font-semibold text-gray-900">10–15 qualified candidates/week</div>
                </div>

                <div className="mb-5">
                  <div className="text-xs text-gray-500 mb-2">Hiring Urgency</div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 h-1.5 rounded bg-gray-200" />
                    <div className="flex-1 h-1.5 rounded bg-[#10b981]" />
                    <div className="flex-1 h-1.5 rounded bg-gray-200" />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Low</span><span>Medium</span><span>High</span>
                  </div>
                </div>

                <button
                  onClick={() => setDailyBudget(35)}
                  className="w-full border border-[#10b981] text-[#10b981] hover:bg-[#f0fdf4] rounded-xl py-2.5 text-sm font-semibold transition-all"
                >
                  Use Recommended Budget
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => navigate('/review')}
              className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl px-8 py-3.5 font-bold text-sm transition-all"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  title, price, badge, recommended, features, selected, onSelect,
}: {
  title: string; price: string; badge: string; recommended?: boolean;
  features: string[]; selected: boolean; onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
        selected ? 'border-[#10b981] shadow-md' : 'border-gray-200 hover:border-gray-300'
      } ${recommended ? 'ring-2 ring-[#10b981] ring-offset-2' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-gray-900 mb-0.5">{title}</div>
          <div className="text-lg font-semibold text-[#10b981]">{price}</div>
        </div>
        <span className="text-[11px] bg-[#10b981]/10 text-[#059669] font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      </div>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EstimateStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
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
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-xl font-extrabold text-[#10b981] tracking-tight">
          GigGrab
        </button>
      </div>
    </header>
  );
}
