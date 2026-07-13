import { useState } from "react";
import { Check, Phone, ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import { DualHeader } from "./CandidateFormPage";
import { fc } from "../../lib/fcApi";

const GG = "#10b981";
const GG_LIGHT = "#f0fdf4";

const COUNTRY_CODES = [
  { code: "+44", flag: "🇬🇧" },
  { code: "+1",  flag: "🇺🇸" },
  { code: "+353",flag: "🇮🇪" },
  { code: "+33", flag: "🇫🇷" },
  { code: "+49", flag: "🇩🇪" },
  { code: "+48", flag: "🇵🇱" },
  { code: "+40", flag: "🇷🇴" },
  { code: "+91", flag: "🇮🇳" },
  { code: "+234",flag: "🇳🇬" },
  { code: "+63", flag: "🇵🇭" },
  { code: "+380",flag: "🇺🇦" },
  { code: "+34", flag: "🇪🇸" },
  { code: "+39", flag: "🇮🇹" },
  { code: "+351",flag: "🇵🇹" },
];

type Step = "form" | "otp" | "calling" | "done";

export default function ScreeningCallPage() {
  const [firstName, setFirstName]     = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phone, setPhone]             = useState("");
  const [consent, setConsent]         = useState(false);
  const [otp, setOtp]                 = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [step, setStep]               = useState<Step>("form");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const rawDigits  = phone.replace(/\D/g, "");
  const nameValid  = firstName.trim().length >= 2;
  const phoneValid = rawDigits.length >= 9;
  const fullPhone  = countryCode + rawDigits;
  const canSend    = nameValid && phoneValid && consent && !loading;

  async function sendCode() {
    if (!canSend) return;
    setError(""); setLoading(true);
    try {
      const res = await fc.requestOtpNew(firstName.trim(), fullPhone);
      setCandidateId(res.candidate_id);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code. Please try again.");
    } finally { setLoading(false); }
  }

  async function startCall() {
    if (otp.length !== 6) { setError("Enter the 6-digit code."); return; }
    setError(""); setLoading(true); setStep("calling");
    try {
      const v = await fc.verifyOtpById(candidateId, otp);
      if (!v.verified) {
        setError(`Incorrect code${v.remaining_attempts != null ? ` — ${v.remaining_attempts} attempts left` : ""}.`);
        setStep("otp"); setLoading(false); return;
      }
      await fc.startScreeningById(candidateId, true);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("otp");
    } finally { setLoading(false); }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-sm gg-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: GG, boxShadow: "0 8px 32px -8px rgba(16,185,129,0.45)" }}>
              <Check size={36} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">You're all set!</h1>
            <p className="text-gray-500 leading-relaxed">
              Sarah will call <span className="font-medium text-gray-700">{fullPhone}</span> in the next few minutes.
            </p>
            <p className="text-gray-500 leading-relaxed mt-1">Please keep your phone nearby.</p>
          </div>
        </div>
      </div>
    );
  }

  const locked = step !== "form";

  // ── Single-page form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <DualHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 gg-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: GG_LIGHT }}>
              <Phone size={24} style={{ color: GG }} />
            </div>
            <h1 className="text-[1.75rem] font-extrabold tracking-tight text-gray-900 mb-2">Start Your AI Screening</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Enter your details and Sarah will call you for a short screening.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 gg-in gg-d1">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">First name</label>
              <input
                type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={locked}
                placeholder="Your first name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:bg-gray-50"
                onFocus={e => (e.target.style.borderColor = GG)} onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Phone number</label>
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <select
                    value={countryCode} onChange={e => setCountryCode(e.target.value)} disabled={locked}
                    className="appearance-none border border-gray-200 rounded-xl pl-3 pr-7 py-3 text-sm bg-white cursor-pointer outline-none disabled:opacity-50 disabled:bg-gray-50"
                    style={{ minWidth: 88 }}
                  >
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={locked}
                  placeholder="7700 900123"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:bg-gray-50"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  onFocus={e => (e.target.style.borderColor = GG)} onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
              <input
                type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={locked}
                className="mt-0.5 w-4 h-4 flex-shrink-0 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I understand that the information I provide will be collected and processed through Gig Grab for the
                purpose of managing and assessing my application for roles with FineClean. Relevant application
                information and screening results will be shared with FineClean and handled in accordance with the
                applicable Candidate Privacy Notice.
              </span>
            </label>

            {/* Step: form → Send Code */}
            {step === "form" && (
              <button
                onClick={sendCode} disabled={!canSend}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: GG }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Sending code…</> : "Send Code"}
              </button>
            )}

            {/* Step: otp → enter code + Start Call */}
            {(step === "otp" || step === "calling") && (
              <div className="gg-in pt-1 space-y-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3">
                  <ShieldCheck size={14} style={{ color: GG }} />
                  Code sent to {fullPhone}
                </div>
                <input
                  type="text" inputMode="numeric" value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="Enter 6-digit code" maxLength={6} disabled={step === "calling"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-2xl tracking-[0.5em] font-mono text-center outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  onFocus={e => (e.target.style.borderColor = GG)} onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  onClick={startCall} disabled={otp.length !== 6 || step === "calling"}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ backgroundColor: GG }}>
                  {step === "calling" ? <><Loader2 size={18} className="animate-spin" />Starting call…</> : <><Phone size={18} />Start Call</>}
                </button>
              </div>
            )}

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
