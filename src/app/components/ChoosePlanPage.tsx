import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { Check, Zap, Star, Rocket } from 'lucide-react';
import { usePostHog } from '@posthog/react';

const plans = [
  {
    id: 'free',
    name: 'FREE',
    price: '£0/day',
    icon: <Star className="w-5 h-5" />,
    tagline: 'Try Sarah on your first role',
    features: [
      '100 Sarah minutes',
      'Basic worker acquisition',
      'Candidate dashboard',
      'Organic visibility',
    ],
    notIncluded: [],
    cta: 'Start Free',
    highlighted: false,
    badge: null,
  },
  {
    id: 'standard',
    name: 'STANDARD',
    price: 'Starting at £20/day',
    icon: <Zap className="w-5 h-5" />,
    tagline: 'Full autonomous worker acquisition',
    features: [
      '500 Sarah minutes — covers 100 interested workers',
      'Minutes scale up in tiers as interest grows',
      'AI screening',
      'SMS follow-up',
      'Candidate qualification',
      'Candidate ranking',
      'Worker reactivation',
      'Advanced acquisition',
    ],
    notIncluded: [],
    cta: 'Launch Hiring Campaign',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 'Custom pricing',
    icon: <Rocket className="w-5 h-5" />,
    tagline: 'Enterprise workforce acquisition',
    features: [
      'Unlimited Sarah minutes',
      'Dedicated hiring hotline',
      'Enterprise onboarding',
      'Multi-location hiring',
      'Advanced workflows',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    highlighted: false,
    badge: 'Enterprise',
  },
];

export default function ChoosePlanPage() {
  const navigate = useNavigate();
  const posthog = usePostHog();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 gg-in">
            <h1 className="text-4xl mb-2">Launch your hiring campaign</h1>
            <p className="text-gray-600">
              Choose how hard Sarah works for you. She acquires, screens and qualifies — you review outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {plans.map((promo, pi) => (
              <div
                key={promo.id}
                className={`bg-white rounded-xl p-8 border-2 flex flex-col relative gg-in gg-lift ${
                  promo.highlighted ? 'border-[#10b981]' : 'border-gray-200'
                }`}
                style={{ animationDelay: `${0.1 + pi * 0.08}s` }}
              >
                {promo.badge && (
                  <div
                    className={`absolute -top-3 left-6 text-xs px-3 py-1 rounded-full ${
                      promo.highlighted
                        ? 'bg-[#10b981] text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {promo.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      promo.highlighted
                        ? 'bg-[#10b981] text-white'
                        : promo.id === 'premium'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {promo.icon}
                  </div>
                  <div className="text-xl tracking-wide">{promo.name}</div>
                </div>

                <div className="text-2xl mb-1 text-[#10b981]">{promo.price}</div>
                <p className="text-sm text-gray-500 mb-6">{promo.tagline}</p>

                <ul className="space-y-2 mb-4 flex-1">
                  {promo.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-[#10b981] shrink-0" />
                      {f}
                    </li>
                  ))}
                  {promo.notIncluded.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-300">—</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  fullWidth
                  variant={promo.highlighted ? 'contained' : 'outlined'}
                  size="large"
                  onClick={() => {
                    if (promo.id === 'premium') {
                      posthog?.capture('enterprise_sales_contacted', { plan: promo.id });
                      navigate('/enterprise');
                    } else {
                      posthog?.capture('plan_selected', { plan: promo.id, plan_name: promo.name });
                      navigate(`/set-budget?plan=${promo.id}`);
                    }
                  }}
                  sx={{
                    textTransform: 'none',
                    fontSize: '1rem',
                    py: 1.5,
                    mt: 2,
                    ...(promo.highlighted
                      ? {
                          backgroundColor: '#10b981',
                          '&:hover': { backgroundColor: '#059669' },
                        }
                      : promo.id === 'premium'
                      ? {
                          borderColor: '#1f2937',
                          color: '#1f2937',
                          '&:hover': { borderColor: '#111827', backgroundColor: '#f9fafb' },
                        }
                      : {
                          borderColor: '#d1d5db',
                          color: '#6b7280',
                          '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' },
                        }),
                  }}
                >
                  {promo.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400">
            You set the daily budget on the next step. No monthly commitment — pause anytime.
          </p>
        </div>
      </div>
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
