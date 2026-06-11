import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { Check, Zap, Star, Rocket } from 'lucide-react';

const promotions = [
  {
    id: 'free',
    name: 'FREE',
    price: '£0/day',
    icon: <Star className="w-5 h-5" />,
    tagline: 'Basic listing, no promotion',
    features: [
      'Post job listing',
      'Low visibility',
      'Organic discovery only',
    ],
    notIncluded: [
      'No candidate outreach',
      'No promotion',
    ],
    cta: 'Post for Free',
    highlighted: false,
    badge: null,
  },
  {
    id: 'standard',
    name: 'STANDARD',
    price: 'Starts at £20/day',
    icon: <Zap className="w-5 h-5" />,
    tagline: 'Promoted listing with screening',
    features: [
      'Higher visibility',
      'Featured placement',
      'Candidate screening',
      'SMS follow-up',
      'Better search ranking',
    ],
    notIncluded: [],
    cta: 'Choose Standard',
    highlighted: true,
    badge: 'Recommended',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 'Starts at £35/day',
    icon: <Rocket className="w-5 h-5" />,
    tagline: 'Full candidate acquisition campaign',
    features: [
      'Everything in Standard',
      'Instant candidate campaigns',
      'SMS outreach',
      'WhatsApp outreach',
      'Worker database activation',
      'Priority candidate delivery',
    ],
    notIncluded: [],
    cta: 'Choose Premium',
    highlighted: false,
    badge: 'Fastest time-to-fill',
  },
];

export default function ChoosePlanPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl mb-2">Choose how to promote your job</h1>
            <p className="text-gray-600">
              More promotion means more visibility, more candidates, faster hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={`bg-white rounded-xl p-8 border-2 flex flex-col relative ${
                  promo.highlighted ? 'border-[#10b981]' : 'border-gray-200'
                }`}
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
                  onClick={() => navigate(`/set-budget?plan=${promo.id}`)}
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
            You can adjust your daily budget on the next step. No monthly commitment.
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
