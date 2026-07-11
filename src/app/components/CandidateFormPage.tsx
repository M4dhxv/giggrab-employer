import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Loader2 } from "lucide-react";
import { fc, type CandidateLookup } from "../../lib/fcApi";

const GG = "#10b981";
const GG_LIGHT = "#f0fdf4";

const CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield",
  "Bradford", "Liverpool", "Edinburgh", "Bristol", "Cardiff", "Leicester",
  "Coventry", "Nottingham", "Newcastle", "Southampton", "Brighton", "Oxford",
  "Reading", "Derby", "Portsmouth", "Wolverhampton", "Belfast", "Aberdeen",
];

const ROLES = ["Cleaner", "Housekeeper", "Supervisor", "Team Leader", "Other"];

export function DualHeader() {
  return (
    <header className="border-b border-gray-100 px-6 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-xs leading-none">FC</span>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">FineClean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: GG }}>
            <span className="text-white font-extrabold text-xs leading-none">G</span>
          </div>
          <span className="text-xs font-medium text-gray-400">powered by GigGrab</span>
        </div>
      </div>
    </header>
  );
}

function RadioPair({ value, onChange }: {
  value: "Yes" | "No" | ""; onChange: (v: "Yes" | "No") => void;
}) {
  return (
    <div className="flex gap-3">
      {(["Yes", "No"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150"
          style={{
            borderColor: value === opt ? GG : "#e5e7eb",
            backgroundColor: value === opt ? GG_LIGHT : "white",
            color: value === opt ? GG : "#6b7280",
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function CandidateFormPage() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [candidate, setCandidate] = useState<CandidateLookup | null>(null);
  const [lookupError, setLookupError] = useState<string>("");
  const [startedAt] = useState(() => Date.now());

  const [lookingForWork, setLookingForWork] = useState<"Yes" | "No" | "">("");
  const [city, setCity] = useState("");
  const [availableSoon, setAvailableSoon] = useState<"Yes" | "No" | "">("");
  const [role, setRole] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notLooking, setNotLooking] = useState(false);

  // Resolve the invitation token → candidate.
  useEffect(() => {
    if (!token) { setLookupError("This link is missing its invitation code."); return; }
    fc.lookupCandidate(token)
      .then((c) => {
        setCandidate(c);
        if (c.city) setCity(c.city);
      })
      .catch((e) => setLookupError(e.message || "This invitation link is invalid or expired."));
  }, [token]);

  const valid = lookingForWork !== "" && city !== "" && availableSoon !== "" && role !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setSubmitError("");
    if (!valid || !candidate) return;
    setSubmitting(true);
    try {
      const res = await fc.submitPrequal(
        token,
        candidate.candidate_id,
        [
          { question: "still_looking", answer: lookingForWork },
          { question: "city", answer: city },
          { question: "available_2_weeks", answer: availableSoon },
          { question: "role", answer: role },
        ],
        Math.round((Date.now() - startedAt) / 1000),
      );
      if (res.next_step === "done") { setNotLooking(true); return; }
      navigate(`/screening-call?token=${encodeURIComponent(token)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: boolean) => attempted && !field;

  // Invalid / missing token.
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

  // Loading the candidate from the token.
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

  // Answered "not looking" → gently end.
  if (notLooking) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div className="max-w-sm gg-in">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Thanks for letting us know</h1>
            <p className="text-gray-500 text-sm">No problem — we've taken you off the list. If anything changes, just reply to our message.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <DualHeader />

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8 gg-in">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GG }}>
            Quick check-in
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-snug">
            Complete this short form before starting your AI screening.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 gg-in gg-d1" noValidate>
          {/* Q1 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Are you still looking for work?
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <RadioPair value={lookingForWork} onChange={v => { setLookingForWork(v); }} />
            {err(lookingForWork !== "") && (
              <p className="text-xs text-red-500 mt-1.5">Please select an option</p>
            )}
          </div>

          {/* Q2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Which city are you based in?
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full appearance-none border rounded-xl px-4 py-3 text-sm outline-none bg-white cursor-pointer transition-all"
                style={{ borderColor: err(!city) ? "#ef4444" : city ? GG : "#e5e7eb" }}
                onFocus={e => (e.target.style.borderColor = GG)}
                onBlur={e => (e.target.style.borderColor = city ? GG : err(!city) ? "#ef4444" : "#e5e7eb")}
              >
                <option value="">Select your city…</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {err(!city) && <p className="text-xs text-red-500 mt-1.5">Please select your city</p>}
          </div>

          {/* Q3 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Are you available to start within the next 2 weeks?
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <RadioPair value={availableSoon} onChange={v => setAvailableSoon(v)} />
            {err(availableSoon !== "") && (
              <p className="text-xs text-red-500 mt-1.5">Please select an option</p>
            )}
          </div>

          {/* Q4 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Which role are you looking for?
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full appearance-none border rounded-xl px-4 py-3 text-sm outline-none bg-white cursor-pointer transition-all"
                style={{ borderColor: err(!role) ? "#ef4444" : role ? GG : "#e5e7eb" }}
                onFocus={e => (e.target.style.borderColor = GG)}
                onBlur={e => (e.target.style.borderColor = role ? GG : err(!role) ? "#ef4444" : "#e5e7eb")}
              >
                <option value="">Select a role…</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {err(!role) && <p className="text-xs text-red-500 mt-1.5">Please select a role</p>}
          </div>

          {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: GG }}>
            {submitting ? <><Loader2 size={18} className="animate-spin" />Submitting…</> : "Continue to Screening"}
          </button>
        </form>
      </div>
    </div>
  );
}
