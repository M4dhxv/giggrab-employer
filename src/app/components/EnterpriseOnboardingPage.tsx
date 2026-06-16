import { useState, useEffect } from 'react';
import {
  Phone, Globe, PhoneForwarded, Check, ArrowRight, Plus,
  Mic, BarChart2, Users, PhoneCall, Activity, Bell,
  Settings, Zap, Star, Clock, TrendingUp, Briefcase,
  RefreshCw, Terminal, X, ChevronRight, MessageSquare,
} from 'lucide-react';

/*
  Enterprise onboarding flow (white-label dedicated hotline)
  Login → Hotline → Provisioning → ATS → Configure → Go Live → Dashboard
  Ported from M4dhxv/Employerjobpostingflowcopy — fully self-contained.
*/

type Step = 'login' | 'hotline' | 'provisioning' | 'ats' | 'configure' | 'golive' | 'dashboard';

const FLOW_STEPS = ['Hotline', 'ATS', 'Configure', 'Go Live'];

function OnboardingShell({
  stepIndex, headline, tagline, children,
}: {
  stepIndex: number; headline: string; tagline: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="hidden lg:flex w-[42%] bg-[#0F1623] flex-col p-10 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-indigo-500/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-indigo-500/15 pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Mic size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">Sarah</span>
        </div>

        <div className="mt-auto mb-12">
          <div className="text-[10px] font-mono text-indigo-400 mb-5 tracking-[0.18em] uppercase">
            Step {stepIndex + 1} of {FLOW_STEPS.length}
          </div>
          <h2
            className="text-3xl font-semibold text-white leading-tight mb-3"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {headline}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">{tagline}</p>
        </div>

        <div className="space-y-2.5">
          {FLOW_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono flex-shrink-0 transition-all ${
                  i < stepIndex
                    ? 'bg-indigo-500 text-white'
                    : i === stepIndex
                    ? 'border-2 border-indigo-400 text-indigo-400'
                    : 'border border-white/15 text-white/25'
                }`}
              >
                {i < stepIndex ? <Check size={9} /> : i + 1}
              </div>
              <span
                className={`text-sm transition-colors ${
                  i === stepIndex ? 'text-white' : i < stepIndex ? 'text-white/60' : 'text-white/25'
                }`}
              >
                {s}
              </span>
              {i === stepIndex && <div className="ml-auto w-1 h-1 rounded-full bg-indigo-400" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#F7F6F3] flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────

function LoginScreen({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="hidden lg:flex w-[42%] bg-[#0F1623] flex-col p-10 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-indigo-500/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Mic size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">GigGrab Enterprise</span>
        </div>

        <div className="mt-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-3 py-1 mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium">AI Hiring Hotline</span>
          </div>
          <h1
            className="text-4xl text-white leading-[1.15] mb-5"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Your dedicated<br />recruiting team,<br />on call 24/7.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Deploy Sarah in minutes. Screen candidates, qualify workers,
            and fill shifts — automatically, around the clock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {(['#6366F1', '#10B981', '#F59E0B', '#8B5CF6'] as const).map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-[#0F1623] flex items-center justify-center text-white text-[10px] font-semibold"
                style={{ backgroundColor: c }}
              >
                {['AC', 'MW', 'JS', 'KP'][i]}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs">340+ employers live this month</p>
        </div>
      </div>

      <div className="flex-1 bg-[#F7F6F3] flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl font-semibold text-[#0F1623] mb-1">Sign in</h2>
          <p className="text-sm text-[#717182] mb-8">Get your hiring hotline live in minutes.</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={onNext}
              className="w-full flex items-center gap-3 bg-white border border-[rgba(0,0,0,0.12)] rounded-xl px-4 py-3 text-sm font-medium text-[#0F1623] hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={onNext}
              className="w-full flex items-center gap-3 bg-white border border-[rgba(0,0,0,0.12)] rounded-xl px-4 py-3 text-sm font-medium text-[#0F1623] hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
            <span className="text-xs text-[#717182]">or</span>
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[rgba(0,0,0,0.12)] rounded-xl px-4 py-3 text-sm text-[#0F1623] placeholder:text-[#717182] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              onClick={onNext}
              className="w-full bg-[#0F1623] text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Continue with email <ArrowRight size={14} />
            </button>
          </div>

          <p className="text-xs text-[#717182] text-center mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer">Terms</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Hotline ───────────────────────────────────────────────────

const HOTLINE_OPTIONS = [
  { id: 'local', icon: <Phone size={18} />, label: 'Local number', description: 'A geographic number for your region', example: '020 7946 0958' },
  { id: 'national', icon: <Globe size={18} />, label: 'National number', description: 'Freephone or non-geographic number', example: '0800 123 4567' },
  { id: 'existing', icon: <PhoneForwarded size={18} />, label: 'Existing company number', description: 'Forward your current number to Sarah', example: 'Forward calls →' },
];

function HotlineScreen({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingShell
      stepIndex={0}
      headline="Choose your hiring hotline"
      tagline="Workers call this number to reach Sarah. She screens, qualifies, and routes candidates automatically."
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#0F1623] mb-1">Select a number</h2>
        <p className="text-sm text-[#717182] mb-7">Choose how workers will reach your hiring hotline.</p>

        <div className="space-y-3 mb-8">
          {HOTLINE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full text-left border rounded-xl p-4 transition-all ${
                selected === opt.id
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-[rgba(0,0,0,0.1)] bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    selected === opt.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-[#ECEAE4] text-[#0F1623]'
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-[#0F1623]">{opt.label}</span>
                    {selected === opt.id && (
                      <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check size={9} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#717182] mb-2">{opt.description}</p>
                  <code className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {opt.example}
                  </code>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full bg-[#0F1623] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Confirm number <ArrowRight size={14} />
        </button>
      </div>
    </OnboardingShell>
  );
}

// ── Provisioning ──────────────────────────────────────────────

const PROVISION_STEPS = [
  { label: 'Provisioning number', delay: 1000 },
  { label: 'Activating Sarah', delay: 2200 },
  { label: 'Connecting workflows', delay: 3400 },
];

function ProvisioningScreen({ onNext }: { onNext: () => void }) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    PROVISION_STEPS.forEach((s, i) => {
      setTimeout(() => setDone((prev) => [...prev, i]), s.delay);
    });
    setTimeout(onNext, 4400);
  }, []);

  return (
    <OnboardingShell
      stepIndex={0}
      headline="Getting Sarah ready"
      tagline="This takes just a moment. Sarah will be ready to screen candidates shortly."
    >
      <div className="text-center">
        <div className="relative flex justify-center mb-10">
          <div className="absolute w-32 h-32 rounded-full border border-indigo-300/30 animate-ping" />
          <div className="absolute w-24 h-24 rounded-full bg-indigo-100/60" />
          <div className="relative w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Mic size={28} className="text-white" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#0F1623] mb-1.5">Setting up your hiring hotline</h2>
        <p className="text-sm text-[#717182] mb-9">Usually takes less than 30 seconds.</p>

        <div className="space-y-3 text-left">
          {PROVISION_STEPS.map((s, i) => {
            const isComplete = done.includes(i);
            const isActive = done.length === i;
            return (
              <div
                key={s.label}
                className={`flex items-center gap-3.5 p-4 bg-white rounded-xl border transition-all ${
                  isActive ? 'border-indigo-300 shadow-sm' : 'border-[rgba(0,0,0,0.07)]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isComplete ? 'bg-emerald-500 shadow-md shadow-emerald-500/25' : isActive ? 'bg-indigo-100' : 'bg-[#ECEAE4]'
                  }`}
                >
                  {isComplete ? (
                    <Check size={13} className="text-white" />
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#717182]/40" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${isComplete || isActive ? 'text-[#0F1623]' : 'text-[#717182]'}`}>
                  {s.label}
                </span>
                {isComplete && <span className="ml-auto text-xs text-emerald-600 font-medium">Done</span>}
                {isActive && <span className="ml-auto text-xs text-indigo-500 font-medium">Working…</span>}
              </div>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}

// ── ATS ───────────────────────────────────────────────────────

const ATS_OPTIONS = [
  { name: 'Greenhouse', color: '#24B47E', initial: 'G' },
  { name: 'Ashby', color: '#6366F1', initial: 'A' },
  { name: 'Lever', color: '#2563EB', initial: 'L' },
  { name: 'Workday', color: '#0075C9', initial: 'W' },
  { name: 'Bullhorn', color: '#E63946', initial: 'B' },
  { name: 'JobAdder', color: '#F97316', initial: 'J' },
  { name: 'Generic API', color: '#6B7280', initial: '⚙' },
];

function ATSScreen({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState<string | null>(null);

  return (
    <OnboardingShell
      stepIndex={1}
      headline="Connect your ATS"
      tagline="Import open jobs and candidate data to sync Sarah with your existing workflow."
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#0F1623] mb-1">Connect your ATS</h2>
        <p className="text-sm text-[#717182] mb-2">Optional — import open jobs, candidates, and hiring workflows.</p>
        <div className="flex items-center gap-1.5 text-xs text-[#717182] mb-7">
          <Zap size={11} className="text-amber-500" />
          Imports open roles, candidate history, and screening workflows automatically
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {ATS_OPTIONS.map((ats) => (
            <button
              key={ats.name}
              onClick={() => setConnected(ats.name === connected ? null : ats.name)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                connected === ats.name
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-[rgba(0,0,0,0.09)] bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: ats.color }}
              >
                {ats.initial}
              </div>
              <span className="text-sm font-medium text-[#0F1623]">{ats.name}</span>
              {connected === ats.name && <Check size={12} className="text-indigo-500 ml-auto" />}
            </button>
          ))}
        </div>

        {connected && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={12} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{connected} connected</p>
              <p className="text-xs text-emerald-700 mt-0.5">Ready to import open jobs, candidates, and hiring workflows.</p>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            onClick={onNext}
            disabled={!connected}
            className="w-full bg-[#0F1623] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {connected ? `Connect ${connected}` : 'Select an ATS'} <ArrowRight size={14} />
          </button>
          <button
            onClick={onNext}
            className="w-full text-center text-sm text-[#717182] hover:text-[#0F1623] transition-colors py-2 flex items-center justify-center gap-1"
          >
            Skip for now <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}

// ── Configure ─────────────────────────────────────────────────

const DEFAULT_QUESTIONS = [
  'Do you have a CSCS card?',
  'Are you available for night shifts?',
  'Do you have cleaning experience?',
  'Are you able to travel to site?',
];

function ConfigureScreen({ onNext }: { onNext: () => void }) {
  const [tab, setTab] = useState<'basic' | 'screening'>('basic');
  const [mode, setMode] = useState<'manual' | 'sarah'>('manual');
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [newQ, setNewQ] = useState('');

  function addQuestion() {
    const q = newQ.trim();
    if (q) { setQuestions((p) => [...p, q]); setNewQ(''); }
  }

  return (
    <OnboardingShell
      stepIndex={2}
      headline="Configure Sarah"
      tagline="Tell Sarah about your company and what you need from candidates. She handles the rest."
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#0F1623] mb-1">Configure Sarah</h2>
        <p className="text-sm text-[#717182] mb-6">Set up company info and screening criteria.</p>

        <div className="flex gap-1 bg-[#ECEAE4] p-1 rounded-xl mb-6">
          {(['basic', 'screening'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${
                tab === t ? 'bg-white text-[#0F1623] shadow-sm' : 'text-[#717182] hover:text-[#0F1623]'
              }`}
            >
              {t === 'basic' ? 'Company Info' : 'Screening'}
            </button>
          ))}
        </div>

        {tab === 'basic' ? (
          <div className="space-y-4">
            {[
              { label: 'Company name', placeholder: 'Acme Construction Ltd' },
              { label: 'Hiring locations', placeholder: 'London, Birmingham, Manchester' },
              { label: 'Languages', placeholder: 'English, Polish, Portuguese' },
              { label: 'Business hours', placeholder: 'Mon–Fri 7am–7pm, Sat 8am–4pm' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-[#0F1623] mb-1.5">{f.label}</label>
                <input
                  defaultValue={f.placeholder}
                  className="w-full bg-white border border-[rgba(0,0,0,0.1)] rounded-xl px-3.5 py-2.5 text-sm text-[#0F1623] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              {(['manual', 'sarah'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    mode === m ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' : 'border-[rgba(0,0,0,0.09)] bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#0F1623] mb-0.5 flex items-center gap-1.5">
                    {m === 'sarah' && <Mic size={12} className="text-indigo-500" />}
                    {m === 'manual' ? 'Add manually' : 'Talk with Sarah'}
                  </div>
                  <div className="text-xs text-[#717182]">
                    {m === 'manual' ? 'Write your own questions' : 'Sarah builds them for you'}
                  </div>
                </button>
              ))}
            </div>

            {mode === 'manual' ? (
              <div>
                <div className="text-[10px] font-semibold text-[#717182] uppercase tracking-widest mb-2">
                  Screening questions
                </div>
                <div className="space-y-2 mb-3">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-[rgba(0,0,0,0.07)]">
                      <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-mono mt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#0F1623] flex-1 leading-relaxed">{q}</span>
                      <button
                        onClick={() => setQuestions((p) => p.filter((_, j) => j !== i))}
                        className="text-[#717182] hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                    placeholder="Add a question…"
                    className="flex-1 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl px-3 py-2 text-xs text-[#0F1623] placeholder:text-[#717182] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    onClick={addQuestion}
                    className="bg-[#0F1623] text-white rounded-xl px-3 py-2 hover:bg-indigo-700 transition-all"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Mic size={22} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Talk with Sarah</h3>
                <p className="text-xs text-indigo-700 mb-5 leading-relaxed max-w-xs mx-auto">
                  Have a short conversation and Sarah automatically builds your screening questions and qualification criteria.
                </p>
                <button className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/25">
                  <Mic size={14} /> Start conversation
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => tab === 'basic' ? setTab('screening') : onNext()}
          className="w-full mt-6 bg-[#0F1623] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          {tab === 'basic' ? 'Next: Screening' : 'Finish setup'} <ArrowRight size={14} />
        </button>
      </div>
    </OnboardingShell>
  );
}

// ── Go Live ───────────────────────────────────────────────────

function GoLiveScreen({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="min-h-screen bg-[#0F1623] flex items-center justify-center p-8 relative overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-indigo-500/10" />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/15" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-indigo-500/20" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="relative flex justify-center mb-10">
          <div className="absolute w-36 h-36 rounded-full border-2 border-emerald-500/30 animate-ping" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Phone size={34} className="text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-sm font-medium">Sarah is live</span>
        </div>

        <h1
          className="text-4xl text-white leading-[1.15] mb-4"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Your hiring hotline<br />is active.
        </h1>
        <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          Workers can call, get screened by Sarah, and enter your candidate pipeline.
          You'll be notified as candidates qualify.
        </p>

        <div className="bg-white/6 border border-white/10 rounded-2xl p-4 mb-8 inline-block font-mono">
          <div className="text-xs text-white/40 mb-1">Your hiring hotline</div>
          <div className="text-2xl text-indigo-300 font-medium tracking-wide">020 7946 0958</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10 max-w-xs mx-auto">
          {[
            { label: 'Hotline', value: 'Active', dot: 'bg-emerald-400' },
            { label: 'Sarah', value: 'Ready', dot: 'bg-indigo-400' },
            { label: 'Pipeline', value: 'Open', dot: 'bg-violet-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className="text-white text-xs font-semibold">{s.value}</span>
              </div>
              <div className="text-white/35 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="bg-indigo-500 text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-indigo-400 transition-all flex items-center gap-2 mx-auto shadow-xl shadow-indigo-500/30"
        >
          Go to dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Enterprise Dashboard ──────────────────────────────────────

const CANDIDATES = [
  { name: 'Marcus Okafor', initials: 'MO', score: 94, role: 'Site Operative', availability: 'Immediate', languages: ['English'], qualifications: ['CSCS Card', 'Driving Licence'], lastInteraction: '2 mins ago', status: 'interview-ready', color: '#6366F1' },
  { name: 'Agnieszka Kowal', initials: 'AK', score: 91, role: 'Cleaning Operative', availability: '48 hrs', languages: ['Polish', 'English'], qualifications: ['CSCS Card', '2+ Yrs Exp'], lastInteraction: '14 mins ago', status: 'qualified', color: '#10B981' },
  { name: 'Deon Petersen', initials: 'DP', score: 87, role: 'Forklift Operator', availability: '1 week', languages: ['English'], qualifications: ['CSCS Card', 'Forklift Licence'], lastInteraction: '1 hr ago', status: 'qualified', color: '#F59E0B' },
  { name: 'Maria Santos', initials: 'MS', score: 82, role: 'General Labourer', availability: 'Immediate', languages: ['Portuguese', 'English'], qualifications: ['CSCS Card'], lastInteraction: '3 hrs ago', status: 'qualified', color: '#EC4899' },
  { name: 'Fatima Al-Hassan', initials: 'FA', score: 88, role: 'Warehouse Operative', availability: 'Immediate', languages: ['Arabic', 'English'], qualifications: ['CSCS Card', 'Forklift Licence'], lastInteraction: '5 hrs ago', status: 'interview-ready', color: '#8B5CF6' },
  { name: 'James Thornton', initials: 'JT', score: 74, role: 'Site Operative', availability: '2 weeks', languages: ['English'], qualifications: ['Driving Licence'], lastInteraction: 'Yesterday', status: 'screening', color: '#6B7280' },
];

const ACTIVITY_FEED = [
  { text: 'Screened 14 candidates for Site Operative roles', time: 'Just now', type: 'screen' },
  { text: 'Qualified 6 candidates — Marcus, Agnieszka, Deon +3 others', time: '12 mins ago', type: 'qualify' },
  { text: 'Scheduled 2 interviews for tomorrow 09:00', time: '1 hr ago', type: 'schedule' },
  { text: 'Reactivated 8 previous workers from 2024 pipeline', time: '3 hrs ago', type: 'reactivate' },
  { text: 'Switched to Polish mid-call with Agnieszka Kowal', time: '5 hrs ago', type: 'translate' },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  'interview-ready': { label: 'Interview Ready', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  qualified: { label: 'Qualified', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  screening: { label: 'Screening', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const ACTIVITY_META: Record<string, { cls: string; icon: React.ReactNode }> = {
  screen: { cls: 'bg-indigo-100 text-indigo-600', icon: <PhoneCall size={12} /> },
  qualify: { cls: 'bg-emerald-100 text-emerald-600', icon: <Check size={12} /> },
  schedule: { cls: 'bg-violet-100 text-violet-600', icon: <Clock size={12} /> },
  reactivate: { cls: 'bg-amber-100 text-amber-600', icon: <RefreshCw size={12} /> },
  translate: { cls: 'bg-slate-100 text-slate-600', icon: <MessageSquare size={12} /> },
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={15} /> },
  { key: 'candidates', label: 'Candidates', icon: <Users size={15} /> },
  { key: 'jobs', label: 'Jobs', icon: <Briefcase size={15} /> },
  { key: 'calls', label: 'Call Logs', icon: <PhoneCall size={15} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
];

function EnterpriseDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [cmd, setCmd] = useState('');

  const candidates = filter === 'all' ? CANDIDATES : CANDIDATES.filter((c) => c.status === filter);

  return (
    <div className="h-screen flex bg-[#F7F6F3] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <aside className="w-[220px] bg-[#0F1623] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Mic size={13} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">Sarah Enterprise</span>
          </div>
        </div>

        <div className="mx-3 mt-4 p-3.5 bg-white/[0.05] rounded-xl border border-white/[0.07]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold">Sarah Active</span>
          </div>
          <div className="text-white/60 text-xs font-mono">020 7946 0958</div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 mt-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeNav === item.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div className="mx-3 mb-4 p-3 bg-white/[0.05] rounded-xl border border-white/[0.07]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-xs font-medium">Greenhouse</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-white/30 text-[11px]">Synced 2 min ago</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-[rgba(0,0,0,0.07)] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[15px] font-semibold text-[#0F1623]">Dashboard</h1>
            <p className="text-xs text-[#717182]">Mon, 16 June 2026 · Acme Construction Ltd</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[#717182] hover:text-[#0F1623] transition-colors rounded-lg hover:bg-[#ECEAE4]">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">AC</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-4 gap-3.5">
            {[
              { label: 'Sarah Status', value: 'Active', sub: 'Hotline live · 24/7', icon: <Mic size={15} />, iconBg: 'bg-emerald-50', iconCl: 'text-emerald-600', trend: '+12%' },
              { label: 'Calls Today', value: '34', sub: '+12 from yesterday', icon: <PhoneCall size={15} />, iconBg: 'bg-indigo-50', iconCl: 'text-indigo-600', trend: '+54%' },
              { label: 'Qualified', value: '6', sub: 'of 14 screened', icon: <Users size={15} />, iconBg: 'bg-violet-50', iconCl: 'text-violet-600', trend: '43%' },
              { label: 'Interview Ready', value: '2', sub: 'Scheduled tomorrow', icon: <Star size={15} />, iconBg: 'bg-amber-50', iconCl: 'text-amber-600', trend: '↑ 2' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-xl ${s.iconBg} ${s.iconCl} flex items-center justify-center`}>{s.icon}</div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{s.trend}</span>
                </div>
                <div className="text-2xl font-bold text-[#0F1623] leading-none mb-1">{s.value}</div>
                <div className="text-xs text-[#717182]">{s.label}</div>
                <div className="text-[11px] text-emerald-600 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-4">
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#717182]" />
                  <h2 className="text-sm font-semibold text-[#0F1623]">Candidate Pipeline</h2>
                  <span className="text-xs bg-[#ECEAE4] text-[#717182] px-2 py-0.5 rounded-full font-mono">{candidates.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'interview-ready', label: 'Interview Ready' },
                    { key: 'qualified', label: 'Qualified' },
                    { key: 'screening', label: 'Screening' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        filter === f.key ? 'bg-[#0F1623] text-white border-[#0F1623]' : 'text-[#717182] border-[rgba(0,0,0,0.1)] hover:border-indigo-300 bg-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[rgba(0,0,0,0.04)]">
                {candidates.map((c) => {
                  const sm = STATUS_META[c.status];
                  return (
                    <div key={c.name} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#F7F6F3] transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-[#0F1623]">{c.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sm.cls}`}>{sm.label}</span>
                        </div>
                        <div className="text-xs text-[#717182] mb-1">{c.role}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-[#717182] flex items-center gap-1"><Clock size={9} />{c.availability}</span>
                          <span className="text-xs text-[#717182]">{c.languages.join(', ')}</span>
                          {c.qualifications.map((q) => (
                            <span key={q} className="text-[10px] bg-[#F0EEE8] text-[#717182] px-1.5 py-0.5 rounded">{q}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-[#0F1623] leading-none">{c.score}<span className="text-xs text-[#717182] font-normal">%</span></div>
                        <div className="text-[11px] text-[#717182] mt-1">{c.lastInteraction}</div>
                      </div>
                      <ChevronRight size={14} className="text-[#717182] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[rgba(0,0,0,0.06)]">
                  <Activity size={13} className="text-indigo-500" />
                  <h2 className="text-sm font-semibold text-[#0F1623]">Sarah Activity</h2>
                </div>
                <div className="p-3 space-y-2.5">
                  {ACTIVITY_FEED.map((item, i) => {
                    const meta = ACTIVITY_META[item.type];
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.cls}`}>{meta.icon}</div>
                        <div>
                          <p className="text-xs text-[#0F1623] leading-snug">{item.text}</p>
                          <p className="text-[11px] text-[#717182] mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0F1623] rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="px-3 py-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2 bg-white/[0.07] rounded-xl px-3 py-2">
                    <Terminal size={11} className="text-white/35 flex-shrink-0" />
                    <input
                      value={cmd}
                      onChange={(e) => setCmd(e.target.value)}
                      placeholder="Tell Sarah what to do…"
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
                    />
                    {cmd && (
                      <button onClick={() => setCmd('')} className="text-white/30 hover:text-white/60 transition-colors">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  {['Call top 10 candidates', 'Find more cleaners', 'Reactivate previous candidates', 'Schedule interviews'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCmd(c)}
                      className="w-full text-left text-xs text-white/40 hover:text-white hover:bg-white/[0.07] px-3 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                      <TrendingUp size={10} className="flex-shrink-0" />{c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────

export default function EnterpriseOnboardingPage() {
  const [step, setStep] = useState<Step>('login');

  return (
    <>
      {step === 'login' && <LoginScreen onNext={() => setStep('hotline')} />}
      {step === 'hotline' && <HotlineScreen onNext={() => setStep('provisioning')} />}
      {step === 'provisioning' && <ProvisioningScreen onNext={() => setStep('ats')} />}
      {step === 'ats' && <ATSScreen onNext={() => setStep('configure')} />}
      {step === 'configure' && <ConfigureScreen onNext={() => setStep('golive')} />}
      {step === 'golive' && <GoLiveScreen onNext={() => setStep('dashboard')} />}
      {step === 'dashboard' && <EnterpriseDashboard />}
    </>
  );
}
