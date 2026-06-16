import { useNavigate, useLocation } from 'react-router';
import {
  ArrowRight, Phone, Mic, Sparkles, Send,
  HardHat, Package, Heart, UtensilsCrossed, Truck, Sparkle,
  ShoppingBag, Activity,
} from 'lucide-react';

const STEPS = [
  {
    icon: <Mic className="w-6 h-6" />,
    title: 'Speak',
    body: 'Sarah calls you and asks a few short questions in your language. No CV, no forms, no app.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Get matched',
    body: 'She builds your profile from the call and ranks you against live roles near you — before you hang up.',
  },
  {
    icon: <Send className="w-6 h-6" />,
    title: 'Apply',
    body: 'Apply with one tap, or let GigGrab apply to your top matches for you. We text you when an employer responds.',
  },
];

const INDUSTRIES = [
  { icon: <HardHat size={22} />, label: 'Construction' },
  { icon: <Sparkle size={22} />, label: 'Cleaning' },
  { icon: <Package size={22} />, label: 'Warehousing' },
  { icon: <UtensilsCrossed size={22} />, label: 'Hospitality' },
  { icon: <Activity size={22} />, label: 'Healthcare' },
  { icon: <ShoppingBag size={22} />, label: 'Retail' },
];

const HERO_CSS = `
@keyframes wl-fadein { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.wl-in { animation: wl-fadein 0.55s ease-out both; }
.wl-d1 { animation-delay: 0.1s; }
.wl-d2 { animation-delay: 0.22s; }
.wl-d3 { animation-delay: 0.34s; }
@media (prefers-reduced-motion: reduce) { .wl-in { animation: none !important; } }
`;

export default function WorkerLandingPage() {
  const navigate = useNavigate();
  const getStarted = () => navigate('/worker/get-started');

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif', background: '#0a0a0a' }}>
      <style>{HERO_CSS}</style>

      {/* ── HERO (full-bleed image) ── */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-latest.png)' }}
        />
        {/* Overlay — darkens the photo so text is readable */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.72) 100%)' }} />

        {/* Nav — sits on top of image */}
        <header className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4ade80] flex items-center justify-center">
                <span className="text-black font-extrabold text-sm leading-none">G</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">GigGrab for Workers</span>
            </button>

            {/* Nav links */}
            <nav className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-white/75 hover:text-white text-sm font-medium transition-colors"
              >
                For Employers
              </button>
              <button
                onClick={() => navigate('/worker/dashboard')}
                className="text-white/75 hover:text-white text-sm font-medium transition-colors"
              >
                Log in
              </button>
            </nav>
          </div>
        </header>

        {/* Hero content — centred */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-28">
          <h1 className="wl-in text-[3.2rem] sm:text-[4.2rem] lg:text-[5.2rem] font-extrabold text-white leading-[1.05] tracking-[-0.03em] max-w-4xl">
            Work starts with<br />a conversation<span style={{ color: '#4ade80' }}>.</span>
          </h1>

          <p className="wl-in wl-d1 mt-6 text-white/75 text-lg sm:text-xl max-w-xl leading-relaxed">
            Find jobs across construction, cleaning,<br className="hidden sm:block" />
            warehousing, hospitality, retail and healthcare.
          </p>

          <button
            onClick={getStarted}
            className="wl-in wl-d2 mt-10 inline-flex items-center gap-3 font-bold text-lg text-black px-10 py-4 rounded-full transition-all hover:scale-[1.03] hover:shadow-[0_12px_36px_-8px_rgba(74,222,128,0.55)]"
            style={{ background: '#4ade80' }}
          >
            Start Applying <ArrowRight className="w-5 h-5" />
          </button>

          <p className="wl-in wl-d3 mt-5 text-white/45 text-sm">
            Free · No CV needed · 32 languages
          </p>
        </div>

        {/* Industry strip — anchored to the bottom of the hero */}
        <div className="relative z-10 w-full" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/10">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.label}
                className="flex flex-col items-center gap-2 py-5 px-2 text-white/70 hover:text-white transition-colors cursor-default"
              >
                <span style={{ color: '#4ade80' }}>{ind.icon}</span>
                <span className="text-xs font-medium tracking-wide">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 gg-in">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-gray-900">Find work in three steps</h2>
            <p className="text-gray-500 mt-2">The whole thing happens on one phone call.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`bg-white border border-gray-200 rounded-2xl p-6 gg-lift gg-in gg-d${i + 1}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] grid place-items-center mb-4">{s.icon}</div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#10b981] tabular-nums">0{i + 1}</span>
                  <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: '#0a0a0a' }}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center gg-in">
          <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-white">Two minutes on the phone.<br />Then we get to work.</h2>
          <p className="text-white/50 mt-3 max-w-lg mx-auto">
            Drop your number and Sarah rings you straight back — in your language, completely free.
          </p>
          <button
            onClick={getStarted}
            className="inline-flex items-center gap-3 font-bold text-black text-lg px-10 py-4 rounded-full mt-8 transition-all hover:scale-[1.03]"
            style={{ background: '#4ade80' }}
          >
            <Phone className="w-5 h-5" /> Start Applying <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-white/30">
          <span>© GigGrab</span>
          <button onClick={() => navigate('/employer')} className="hover:text-white/70 transition-colors">For employers →</button>
        </div>
      </footer>
    </div>
  );
}

export function WorkerHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = location.pathname === '/worker/dashboard' || location.pathname.startsWith('/worker/profile');
  return (
    <header className="bg-white/85 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#4ade80] flex items-center justify-center">
            <span className="text-black font-extrabold text-xs">G</span>
          </div>
          <span className="text-gray-900 font-bold text-base tracking-tight">GigGrab for Workers</span>
        </button>
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50">Log out</button>
          ) : (
            <>
              <button onClick={() => navigate('/employer')} className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50">For employers</button>
              <button onClick={() => navigate('/worker/dashboard')} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50">Log in</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
