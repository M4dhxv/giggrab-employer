import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, PhoneIncoming, Globe, ChevronDown, ArrowRight, FileText } from 'lucide-react';
import { WorkerHeader } from './WorkerLandingPage';

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

export default function WorkerGetStartedPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Call-Sarah sub-form
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('English');
  const [consent, setConsent] = useState(true);
  const [calling, setCalling] = useState(false);
  const [callState, setCallState] = useState(0);

  const phoneValid = phone.replace(/\D/g, '').length >= 9 && consent;

  function pickFile() { fileRef.current?.click(); }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setUploading(true);
    // simulate parse → profile
    setTimeout(() => {
      setUploading(false);
      navigate('/worker/profile?via=cv');
    }, 1800);
  }

  function requestCallback(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid) return;
    setCalling(true);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = reduced ? 250 : 1100;
    setTimeout(() => setCallState(1), step);
    setTimeout(() => setCallState(2), step * 2);
    setTimeout(() => navigate('/worker/call'), step * 3);
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
            <h1 className="text-2xl mb-1" key={callState} style={{ animation: 'gg-in .25s both' }}>{CALL_STATES[callState]}</h1>
            <p className="text-gray-500 mb-6">{phone} · in {language}</p>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10 gg-in">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">How would you like to get started?</h1>
            <p className="text-gray-500">Upload your CV and we'll match you to roles — or talk to Sarah and she'll build your profile in two minutes.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 gg-in gg-d1">
            {/* Option 1: Upload CV */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#10b981] p-7 flex flex-col transition-all cursor-pointer gg-lift" onClick={pickFile}>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] grid place-items-center mb-5">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">Upload your CV</h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                Drop a PDF or Word CV — Sarah reads it, structures your profile, and matches you to live roles instantly.
              </p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onFile} />
              <div className="mt-6">
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981]">
                    <span className="w-4 h-4 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin" />
                    Reading {fileName}…
                  </div>
                ) : fileName ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#059669]">
                    <FileText className="w-4 h-4" /> {fileName}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-all">
                    Choose file <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">PDF or Word · Max 10 MB</p>
            </div>

            {/* Option 2: Call Sarah */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#10b981] p-7 flex flex-col transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] grid place-items-center mb-5">
                <PhoneIncoming className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">Let Sarah call you</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                No CV needed. Sarah rings you in seconds, asks a few questions in your language, and builds your profile on the call — free.
              </p>

              <form onSubmit={requestCallback} className="mt-5 flex-1 flex flex-col gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-[#10b981] focus:ring-2 focus:ring-emerald-100 transition-all"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                />
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#10b981] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-emerald-100 transition-all bg-white cursor-pointer"
                  >
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#10b981]" />
                  I agree to receive a recorded AI call. Free — reply STOP to opt out.
                </label>
                <button
                  type="submit"
                  disabled={!phoneValid}
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-bold transition-all"
                >
                  <PhoneIncoming className="w-4 h-4" /> Call me now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
