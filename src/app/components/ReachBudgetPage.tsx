import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Slider } from '@mui/material';
import { Check, TrendingUp, Clock, Users, PhoneCall } from 'lucide-react';

export default function ReachBudgetPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'standard' | 'premium'>('standard');
  const [dailyBudget, setDailyBudget] = useState(20);

  const getEstimates = (budget: number) => {
    if (budget === 0) {
      return {
        reach: 150,
        calls: 0,
        qualified: 2,
        timeToFill: '21-30 days'
      };
    }
    const reach = Math.round(budget * 22.5);
    const calls = Math.round(budget * 1.75);
    const qualified = Math.round(budget * 0.4);
    const timeToFill = budget < 15 ? '14-21 days' : budget < 35 ? '7-14 days' : '3-7 days';
    return { reach, calls, qualified, timeToFill };
  };

  const estimates = getEstimates(dailyBudget);

  const handlePlanSelect = (plan: 'free' | 'standard' | 'premium') => {
    setSelectedPlan(plan);
    if (plan === 'free') setDailyBudget(0);
    else if (plan === 'standard' && dailyBudget === 0) setDailyBudget(20);
    else if (plan === 'premium' && dailyBudget < 50) setDailyBudget(75);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl mb-2">How many workers do you need?</h1>
            <p className="text-gray-600">Choose a plan and set your daily budget to reach qualified candidates.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left: Pricing Plans */}
            <div className="lg:col-span-2 space-y-4">
              <PricingCard
                title="FREE"
                price="£0/day"
                badge="Best for testing"
                features={[
                  'Listed on GigGrab',
                  'Basic visibility',
                  'Organic discovery only'
                ]}
                selected={selectedPlan === 'free'}
                onSelect={() => handlePlanSelect('free')}
              />

              <PricingCard
                title="STANDARD"
                price="£15–£50/day"
                badge="Most popular"
                recommended
                features={[
                  'Featured placement',
                  'Higher visibility',
                  'Voice screening',
                  'SMS follow-up',
                  'Candidate ranking'
                ]}
                selected={selectedPlan === 'standard'}
                onSelect={() => handlePlanSelect('standard')}
              />

              <PricingCard
                title="PREMIUM"
                price="£50+/day"
                badge="Best for urgent hiring"
                features={[
                  'Everything in Standard',
                  'Worker outreach campaigns',
                  'Candidate database access',
                  'Direct worker engagement',
                  'Priority candidate delivery',
                  'Fastest time-to-fill'
                ]}
                selected={selectedPlan === 'premium'}
                onSelect={() => handlePlanSelect('premium')}
              />

              {/* Budget Slider */}
              {selectedPlan !== 'free' && (
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-lg mb-6">Daily Budget</h3>
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-3xl">£{dailyBudget}</span>
                      <span className="text-gray-500">/day</span>
                    </div>
                    <Slider
                      value={dailyBudget}
                      onChange={(_, value) => setDailyBudget(value as number)}
                      min={0}
                      max={250}
                      step={5}
                      sx={{
                        color: '#10b981',
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                        }
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>£0</span>
                      <span>£250</span>
                    </div>
                  </div>

                  {/* Live Estimates */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm text-gray-600 mb-4">Estimated Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <EstimateStat
                        icon={<Users className="w-5 h-5" />}
                        label="Expected Reach"
                        value={`${estimates.reach} workers`}
                      />
                      <EstimateStat
                        icon={<PhoneCall className="w-5 h-5" />}
                        label="Expected Calls"
                        value={`${estimates.calls} workers`}
                      />
                      <EstimateStat
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Qualified Candidates"
                        value={`${estimates.qualified} workers`}
                      />
                      <EstimateStat
                        icon={<Clock className="w-5 h-5" />}
                        label="Est. Time-To-Fill"
                        value={estimates.timeToFill}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Recommendation Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border-2 border-[#10b981] sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg">GigGrab Recommendation</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-sm text-gray-600">
                    <div className="mb-2">Based on:</div>
                    <ul className="space-y-1 ml-4">
                      <li>• Warehouse Associate</li>
                      <li>• Manchester</li>
                      <li>• Warehousing</li>
                      <li>• Medium urgency</li>
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-1">Recommended</div>
                    <div className="text-3xl mb-4">£35/day</div>

                    <div className="text-sm text-gray-600 mb-1">Expected</div>
                    <div className="text-lg">10–15 qualified candidates/week</div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-2">Hiring Urgency</div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-2 rounded bg-gray-200"></div>
                      <div className="flex-1 h-2 rounded bg-[#10b981]"></div>
                      <div className="flex-1 h-2 rounded bg-gray-200"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setDailyBudget(35)}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: '#f0fdf4'
                    }
                  }}
                >
                  Use Recommended Budget
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/review')}
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
              Continue to Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
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

function EstimateStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-600 mb-1">
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
