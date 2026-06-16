import { useNavigate } from 'react-router';
import { Check, ArrowRight, Phone, Zap, Layers } from 'lucide-react';

const STARTER_FEATURES = [
  'Sarah screens & qualifies candidates',
  'Ranked shortlist in 24–48 hours',
  '32 languages supported',
  'SMS + call follow-up',
  'Live AI screening demo',
  'Self-serve campaign setup',
  'Cancel or pause anytime',
];

const ENTERPRISE_FEATURES = [
  'Everything in Starter',
  'White-label dedicated hiring hotline',
  'Your number, your brand',
  'ATS integration (Greenhouse, Ashby, Lever +)',
  'Dedicated account manager',
  'Custom screening workflows',
  'Priority candidate delivery',
  'Multi-location campaigns',
  'GigGrab handles your onboarding call',
];

const FAQ = [
  {
    q: 'How is billing calculated?',
    a: 'You set a daily budget. We only deduct on days Sarah is actively working your campaign.',
  },
  {
    q: 'Can I pause anytime?',
    a: 'Yes — pause, edit, or cancel from the dashboard at any time. No penalty.',
  },
  {
    q: 'What languages does Sarah speak?',
    a: '32 languages including English, Polish, Portuguese, Arabic, Urdu, Hindi and more.',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="border-b border-gray-100 sticky top-0 bg-white/85 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-extrabold text-[#10b981] tracking-tight"
          >
            GigGrab
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/worker')}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              For workers
            </button>
            <button
              onClick={() => navigate('/post-job')}
              className="ml-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center gg-in">
        <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#059669] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          Pricing
        </span>
        <h1 className="text-[2.8rem] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
          Pay for results,<br />not subscriptions.
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          Sarah works around the clock. Set a daily budget and pause anytime.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Starter */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col gg-in gg-d1 gg-lift">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] grid place-items-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Starter</div>
            <div className="mb-1">
              <span className="text-sm font-medium text-gray-400">Starts from </span>
              <span className="text-4xl font-extrabold text-gray-900">£20</span>
              <span className="text-xl text-gray-400 font-medium"> /day</span>
            </div>
            <p className="text-sm text-gray-500 mb-7">Self-serve. Full AI hiring from day one.</p>

            <ul className="space-y-3 mb-8 flex-1">
              {STARTER_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/post-job')}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl py-3.5 font-bold text-sm transition-all"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">No monthly commitment. Cancel anytime.</p>
          </div>

          {/* Enterprise */}
          <div className="bg-gray-900 rounded-2xl border-2 border-gray-900 p-8 flex flex-col gg-in gg-d2 gg-lift relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-[#10b981] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                White-label
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white grid place-items-center mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">Enterprise</div>
            <div className="text-4xl font-extrabold text-white mb-1">Custom</div>
            <p className="text-sm text-white/60 mb-7">Dedicated hotline. GigGrab handles onboarding.</p>

            <ul className="space-y-3 mb-8 flex-1">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/enterprise')}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl py-3.5 font-bold text-sm transition-all"
            >
              <Phone className="w-4 h-4" /> Book a call with sales <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      <section className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-9">Common questions</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© GigGrab</span>
          <button onClick={() => navigate('/worker')} className="hover:text-gray-700">
            For workers →
          </button>
        </div>
      </footer>
    </div>
  );
}
