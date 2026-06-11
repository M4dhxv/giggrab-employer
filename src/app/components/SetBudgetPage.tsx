import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, Slider } from '@mui/material';
import { TrendingUp, Clock, Users, Star, Check, Zap } from 'lucide-react';

const PLAN_CONFIG = {
  free: { label: 'FREE', min: 0, max: 0, default: 0, recommended: 0 },
  standard: { label: 'STANDARD', min: 20, max: 250, default: 20, recommended: 45 },
};

type Plan = keyof typeof PLAN_CONFIG;

function getEstimates(plan: Plan, budget: number) {
  if (plan === 'free' || budget === 0) {
    return {
      reach: '~150',
      interest: '2–5',
      qualified: '1–2',
      timeToFill: '21–30 days',
    };
  }
  const reach = Math.round(budget * 18);
  const interestLow = Math.round(budget * 1.2);
  const interestHigh = Math.round(budget * 1.8);
  const qualLow = Math.round(budget * 0.35);
  const qualHigh = Math.round(budget * 0.55);
  const days = budget < 30 ? '14–21 days' : budget < 60 ? '10–14 days' : '7–10 days';
  return {
    reach: reach.toLocaleString(),
    interest: `${interestLow}–${interestHigh}`,
    qualified: `${qualLow}–${qualHigh}`,
    timeToFill: days,
  };
}

export default function SetBudgetPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan: Plan = (params.get('plan') as Plan) || 'standard';
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.standard;

  const [dailyBudget, setDailyBudget] = useState(config.default);
  const estimates = getEstimates(plan, dailyBudget);

  const planIcon = plan === 'free' ? <Star className="w-4 h-4" /> : <Zap className="w-4 h-4" />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl">Set your daily budget</h1>
              <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {planIcon}
                {config.label}
              </span>
            </div>
            <p className="text-gray-600">
              {plan === 'free'
                ? 'Your job will be listed for free with organic visibility only.'
                : 'Your daily spend controls how many candidates you reach. Pause or adjust anytime.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-8 border border-gray-200 mb-6">
                <h3 className="text-lg mb-6">Daily Budget</h3>

                {plan === 'free' ? (
                  <div className="mb-8">
                    <div className="text-5xl mb-2">£0</div>
                    <div className="text-sm text-gray-500">/day — no budget required</div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                      Your job will appear in organic search results only. Upgrade to Standard or Premium to reach more candidates faster.
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl">£{dailyBudget}</span>
                      <span className="text-gray-500">/day</span>
                    </div>
                    <Slider
                      value={dailyBudget}
                      onChange={(_, value) => setDailyBudget(Math.max(config.min, value as number))}
                      min={config.min}
                      max={config.max}
                      step={5}
                      sx={{
                        color: '#10b981',
                        '& .MuiSlider-thumb': { width: 20, height: 20 },
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>£{config.min} (min)</span>
                      <span>£{config.max}</span>
                    </div>
                  </div>
                )}

                {/* Expected Results */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-sm text-gray-600 mb-4">Expected Results</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <EstimateStat
                      icon={<Users className="w-5 h-5" />}
                      label="Expected Reach"
                      value={`${estimates.reach} workers`}
                    />
                    <EstimateStat
                      icon={<TrendingUp className="w-5 h-5" />}
                      label="Interested Workers"
                      value={`${estimates.interest} workers`}
                    />
                    <EstimateStat
                      icon={<Check className="w-5 h-5" />}
                      label="Qualified Candidates"
                      value={`${estimates.qualified} candidates`}
                    />
                    <EstimateStat
                      icon={<Clock className="w-5 h-5" />}
                      label="Estimated Time-To-Fill"
                      value={estimates.timeToFill}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/launch')}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  px: 6,
                  py: 1.5,
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' },
                }}
              >
                Continue to Launch
              </Button>
            </div>

            {/* Recommendation Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border-2 border-[#10b981] sticky top-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-[#10b981]">GigGrab Recommendation</span>
                </div>

                <div className="mt-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="text-lg mb-0.5">Warehouse Associate</div>
                  <div className="text-sm text-gray-500">Manchester</div>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Recommended plan</div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-700" />
                      <span className="text-base">Standard</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Recommended daily budget</div>
                    <div className="text-3xl text-[#10b981]">£45/day</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Expected results at £45/day</div>
                  <RecoStat label="Worker Reach" value="810" />
                  <RecoStat label="Interested Workers" value="54–81" />
                  <RecoStat label="Qualified Candidates" value="16–25" />
                  <RecoStat label="Estimated Fill Time" value="10–14 days" />
                </div>

                {plan !== 'free' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      if (plan !== 'free') setDailyBudget(45);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': { borderColor: '#059669', backgroundColor: '#f0fdf4' },
                    }}
                  >
                    Use Recommended Budget
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EstimateStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-lg">{value}</div>
    </div>
  );
}

function RecoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-2xl text-[#10b981]">GigGrab</div>
      </div>
    </header>
  );
}
