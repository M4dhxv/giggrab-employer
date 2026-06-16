import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PhoneCall, PhoneIncoming, ShieldCheck, Globe, Zap, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { WorkerHeader } from './WorkerLandingPage';

// All 32 languages Sarah speaks — the call runs fully in the chosen one.
const LANGUAGES = [
  'English', 'Polish', 'Romanian', 'Spanish', 'Portuguese', 'Urdu', 'Hindi',
  'Punjabi', 'Bengali', 'Gujarati', 'Arabic', 'French', 'Italian', 'German',
  'Bulgarian', 'Lithuanian', 'Latvian', 'Hungarian', 'Czech', 'Slovak',
  'Ukrainian', 'Russian', 'Turkish', 'Greek', 'Albanian', 'Somali', 'Tigrinya',
  'Amharic', 'Tagalog', 'Vietnamese', 'Mandarin', 'Cantonese',
];

const CALLING_CSS = `
@keyframes wk-ring { 0% { transform: scale(.55); opacity: .9; } 100% { transform: scale(2.1); opacity: 0; } }
@keyframes wk-shake { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-12deg); } 40% { transform: rotate(10deg); } 60% { transform: rotate(-8deg); } 80% { transform: rotate(6deg); } }
@media (prefers-reduced-motion: reduce) { .wk-anim { animation: none !important; } }
`;

const CALL_STATES = ['Connecting…', 'Ringing…', 'Sarah is calling you'];

export default function WorkerStartPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('English');
  const [consent, setConsent] = useState(true);
  const [calling, setCalling] = useState(false);
  const [callState, setCallState] = useState(0);
  const [callDone, setCallDone] = useState(false);

  const valid = phone.replace(/\D/g, '').length >= 9 && consent;

  // Once the call is placed: connect → ring → "picked up" → live interview
  useEffect(() => {
    if (!calling) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = reduced ? 250 : 1100;
    const t1 = setTimeout(() => setCallState(1), step);
    const t2 = setTimeout(() => setCallState(2), step * 2);
    const t3 = setTimeout(() => setCallDone(true), step * 3);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [calling, navigate]);

  const requestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) setCalling(true);
  };

  if (callDone) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <WorkerHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center gg-in max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sarah has your profile!</h1>
            <p className="text-gray-500 text-sm mb-8">Ready to match you to live roles near you.</p>
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl py-3.5 font-bold text-sm mb-4 transition-all"
            >
              See my matches <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCalling(false); setCallDone(false); setCallState(0); }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Ask Sarah to call back for more info
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (calling) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <style>{CALLING_CSS}</style>
        <WorkerHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center gg-in">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <span className="wk-anim absolute inset-0 rounded-full border-2 border-[#10b981]" style={{ animation: 'wk-ring 1.6s ease-out infinite' }} />
              <span className="wk-anim absolute inset-0 rounded-full border-2 border-[#10b981]" style={{ animation: 'wk-ring 1.6s .55s ease-out infinite' }} />
              <div className="absolute inset-0 rounded-full bg-[#10b981] flex items-center justify-center shadow-lg shadow-emerald-200">
                <PhoneIncoming className="wk-anim w-9 h-9 text-white" style={{ animation: callState === 1 ? 'wk-shake 1s infinite' : undefined }} />
              </div>
            </div>

            <h1 className="text-2xl mb-1" key={callState} style={{ animation: 'gg-in .25s both' }}>
              {CALL_STATES[callState]}
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {phone} · in {language}
            </p>

            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1 rounded-full transition-all duration-300" style={{ width: 28, backgroundColor: i <= callState ? '#10b981' : '#e5e7eb' }} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6">Pick up — Sarah builds your profile while you talk.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <WorkerHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 gg-in">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-5">
              <PhoneCall className="w-7 h-7 text-[#10b981]" />
            </div>
            <h1 className="text-3xl mb-2">Sarah will call you</h1>
            <p className="text-gray-500">
              Drop your number — Sarah calls back in seconds and builds your profile while you talk. No CV, no forms.
            </p>
          </div>

          <form onSubmit={requestCallback} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm gg-in gg-d2">
            <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>Your phone number</label>
            <input
              type="tel"
              autoFocus
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+44 7700 900123"
              className="w-full text-lg border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-emerald-100 transition-all mb-4"
              style={{ fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
            />

            <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
              Call me in <span className="text-gray-400" style={{ fontWeight: 400 }}>— Sarah speaks all 32, AI-powered</span>
            </label>
            <div className="relative mb-4">
              <Globe className="w-4 h-4 text-[#10b981] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-base outline-none focus:border-[#10b981] focus:ring-2 focus:ring-emerald-100 transition-all bg-white cursor-pointer"
                style={{ fontFamily: 'inherit' }}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-gray-600 mb-4 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#10b981]" />
              <span>I agree to receive a recorded call from GigGrab's AI recruiter. Free for workers — reply STOP to opt out anytime.</span>
            </label>

            <button
              type="submit"
              disabled={!valid}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] active:scale-[.99] disabled:opacity-40 disabled:hover:bg-[#10b981] text-white rounded-xl py-3.5 text-base transition-all"
              style={{ fontWeight: 700 }}
            >
              <PhoneIncoming className="w-4 h-4" />
              Call me now
            </button>
          </form>

          <div className="flex items-center justify-center gap-5 mt-6 text-xs text-gray-400 gg-in gg-d3">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#10b981]" />Rings in seconds</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#10b981]" />32 languages</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />Free for workers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
