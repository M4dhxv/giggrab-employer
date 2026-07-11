import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, Phone, ChevronDown, Loader2 } from "lucide-react";
import { DualHeader } from "./CandidateFormPage";
import { fc, type CandidateLookup } from "../../lib/fcApi";

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

type Step = "phone" | "otp" | "ready" | "calling" | "done";

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all duration-300"
      style={
        done   ? { backgroundColor: GG, color: "white" } :
        active ? { backgroundColor: GG_LIGHT, color: GG, border: `2px solid ${GG}` } :
                 { backgroundColor: "#f3f4f6", color: "#d1d5db" }
      }>
      {done ? <Check size={10} strokeWidth={3} /> : n}
    </div>
  );
}

export default function ScreeningCallPage() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [candidate, setCandidate] = useState<CandidateLookup | null>(null);
  const [lookupError, setLookupError] = useState("");

  const [firstName, setFirstName]     = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phone, setPhone]             = useState("");
  const [phoneError, setPhoneError]   = useState("");
  const [step, setStep]               = useState<Step>("phone");
  const [loading, setLoading]         = useState(false);
  const [consent, setConsent]         = useState(false);

  const email = candidate?.email ?? "";
  const nameValid  = firstName.trim().length >= 2;
  const rawDigits  = phone.replace(/\D/g, "");
  const phoneValid = rawDigits.length >= 9;
  const fullPhone  = countryCode + rawDigits;

  useEffect(() => {
    if (!token) { setLookupError("This link is missing its invitation code."); return; }
    fc.lookupCandidate(token)
      .then((c) => {
        setCandidate(c);
        if (c.first_name) setFirstName(c.first_name);
      })
      .catch((e) => setLookupError(e.message || "This invitation link is invalid or expired."));
  }, [token]);

  // Testing flow: no OTP. Name + number → consent → call.
  function continueToCall() {
    if (!nameValid) { setPhoneError("Please enter your first name"); return; }
    if (!phoneValid || !candidate) { setPhoneError("Please enter a valid phone number"); return; }
    setPhoneError("");
    setStep("ready");
  }

  async function startCall() {
    if (!candidate || !consent || !nameValid || !phoneValid) return;
    setLoading(true);
    setStep("calling");
    try {
      await fc.requestScreening(token, candidate.candidate_id, {
        first_name: firstName.trim(),
        phone: fullPhone,
        consent: true,
      });
      setStep("done");
    } catch (e) {
      setPhoneError(e instanceof Error ? e.message : "Could not start the call. Try again.");
      setStep("ready");
    } finally { setLoading(false); }
  }

  // ── Invalid token ──────────────────────────────────────────────────────────
  if (lookupError) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="max-w-sm">
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Invitation link problem</h1>
            <p className="text-gray-500 text-sm">{lookupError}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading candidate ──────────────────────────────────────────────────────
  if (!candidate) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" style={{ color: GG }} />
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
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
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">You're All Set!</h1>
            <p className="text-gray-500 leading-relaxed mb-1">
              Sarah will call your verified number shortly.
            </p>
            <p className="text-gray-500 leading-relaxed mb-1">Please keep your phone nearby.</p>
            <p className="text-gray-500 leading-relaxed mb-8">
              We'll also send updates to your registered email.
            </p>
            <div className="rounded-xl p-4 mb-6 text-left" style={{ backgroundColor: GG_LIGHT }}>
              <p className="text-xs font-semibold mb-1" style={{ color: GG }}>Call details</p>
              <p className="text-sm text-gray-700 font-medium">{fullPhone}</p>
              <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            </div>
            <button
              onClick={() => navigate("/worker/dashboard")}
              className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[.98]"
              style={{ backgroundColor: GG }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main flow ──────────────────────────────────────────────────────────────
  const phoneVerified = step === "otp" || step === "ready" || step === "calling";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <DualHeader />

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          {/* Hero text */}
          <div className="text-center mb-8 gg-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: GG_LIGHT }}>
              <Phone size={24} style={{ color: GG }} />
            </div>
            <h1 className="text-[1.75rem] font-extrabold tracking-tight text-gray-900 mb-2">
              Start Your AI Screening
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Sarah will call you in the next few minutes to complete your screening interview.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 gg-in gg-d1">

            {/* Step 1 — Your details */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <StepBadge n={1} active={step === "phone"} done={nameValid} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Your details</span>
              </div>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={phoneVerified}
                placeholder="First name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed mb-2"
                onFocus={e => (e.target.style.borderColor = GG)}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
              />
              {email && (
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-not-allowed select-none"
                />
              )}
            </div>

            {/* Step 2 — Phone */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <StepBadge n={2} active={step === "phone"} done={phoneVerified} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Phone number</span>
                {phoneVerified && (
                  <span className="ml-auto text-xs font-semibold" style={{ color: GG }}>Verified</span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    disabled={phoneVerified}
                    className="appearance-none border border-gray-200 rounded-xl pl-3 pr-7 py-3 text-sm bg-white cursor-pointer outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                    onFocus={e => (e.target.style.borderColor = GG)}
                    onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                    style={{ minWidth: 88 }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setPhoneError(""); }}
                  disabled={phoneVerified}
                  placeholder="7700 900123"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  onFocus={e => (e.target.style.borderColor = GG)}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              {phoneError && <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>}

              {step === "phone" && (
                <button
                  onClick={continueToCall}
                  disabled={!phoneValid || !nameValid}
                  className="mt-3 w-full py-3 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-40"
                  style={{ borderColor: GG, color: GG }}>
                  Continue
                </button>
              )}
            </div>

            {/* Step 3 — Launch */}
            {(step === "ready" || step === "calling") && (
              <div className="p-5 gg-in">
                <div className="flex items-center gap-3 mb-4">
                  <StepBadge n={4} active={true} done={false} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Start your screening</span>
                </div>
                <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: GG_LIGHT }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: GG }}>Sarah will call</p>
                  <p className="text-sm font-medium text-gray-800">{fullPhone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Expect a call within a few minutes of starting.</p>
                </div>

                {/* Consent — required before the call */}
                <label className="flex items-start gap-3 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    disabled={step === "calling"}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I understand that the information I provide will be collected and processed through
                    Gig Grab for the purpose of managing and assessing my application for roles with
                    FineClean. Relevant application information and screening results will be shared with
                    FineClean and handled in accordance with the applicable Candidate Privacy Notice.
                  </span>
                </label>

                <button
                  onClick={startCall}
                  disabled={step === "calling" || !consent}
                  className="w-full py-4 rounded-xl text-white font-bold text-base transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GG }}>
                  {step === "calling"
                    ? <><Loader2 size={18} className="animate-spin" />Requesting call…</>
                    : <><Phone size={18} />Start Screening Call</>}
                </button>
                {!consent && (
                  <p className="text-[11px] text-gray-400 mt-2 text-center">Please tick the box above to continue.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
