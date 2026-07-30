// FineClean Pilot — CandidateFormPage (live, token-authenticated)
// Drop into: src/app/components/CandidateFormPage.tsx
// Requires: src/lib/api.ts

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { fc, type CandidateLookup, type PrequalResponse } from "../../lib/api";

const GG = "#10b981";
const GG_LIGHT = "#f0fdf4";

// Worcester-area towns for the Industrial Cleaner pilot (shifts start from the
// Worcester meeting point). Ordered by proximity, with a catch-all last.
const WORCS_TOWNS = [
  "Worcester","Droitwich","Malvern","Kidderminster","Redditch","Bromsgrove",
  "Evesham","Pershore","Stourport-on-Severn","Bewdley","Upton-upon-Severn",
  "Tenbury Wells","Tewkesbury","Cheltenham","Gloucester","Hereford",
  "Elsewhere",
];

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
        <button key={opt} type="button" onClick={() => onChange(opt)}
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

type LoadState = "loading" | "error" | "invalid" | "inactive" | "ready";

export default function CandidateFormPage() {
  const navigate = useNavigate();
  const startTimeRef = useRef(Date.now());

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [candidate, setCandidate] = useState<CandidateLookup | null>(null);
  const [loadError, setLoadError] = useState("");

  const [lookingForWork, setLookingForWork] = useState<"Yes" | "No" | "">("");
  const [rightToWork, setRightToWork] = useState<"Yes" | "No" | "">("");
  const [town, setTown] = useState("");
  const [canReachWorcester, setCanReachWorcester] = useState<"Yes" | "No" | "">("");
  const [drivingLicence, setDrivingLicence] = useState<"Yes" | "No" | "">("");
  const [availableSoon, setAvailableSoon] = useState<"Yes" | "No" | "">("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notLooking, setNotLooking] = useState(false);

  useEffect(() => {
    if (!token) { setLoadState("invalid"); return; }

    fc.lookupCandidate(token)
      .then((c) => {
        if (!c.is_active) { setLoadState("inactive"); return; }
        setCandidate(c);
        // Prefill the town if their imported city is one we list.
        if (c.city && WORCS_TOWNS.includes(c.city)) setTown(c.city);
        setLoadState("ready");
      })
      .catch((e) => {
        setLoadError(e.message ?? "Unknown error");
        setLoadState("error");
      });
  }, [token]);

  const valid =
    lookingForWork !== "" && rightToWork !== "" && town !== "" &&
    canReachWorcester !== "" && drivingLicence !== "" && availableSoon !== "";
  const err = (field: boolean) => attempted && !field;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!valid || !candidate) return;

    setSubmitting(true);
    const completionSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const responses: PrequalResponse[] = [
      { question: "still_looking", answer: lookingForWork },
      { question: "right_to_work", answer: rightToWork },
      { question: "town", answer: town },
      { question: "can_reach_worcester", answer: canReachWorcester },
      { question: "driving_licence", answer: drivingLicence },
      { question: "available_2_weeks", answer: availableSoon },
    ];

    try {
      const result = await fc.submitPrequal(token, candidate.candidate_id, responses, completionSeconds);

      if (result.next_step === "done") {
        setNotLooking(true);
        return;
      }

      const ctx = { candidate_id: candidate.candidate_id, token, email: candidate.email };
      sessionStorage.setItem("gg_screening_ctx", JSON.stringify(ctx));
      navigate("/screening-call", { state: ctx });
    } catch (err) {
      console.error("submitPrequal:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── States ─────────────────────────────────────────────────────────────────

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <Loader2 size={28} className="animate-spin" style={{ color: GG }} />
      </div>
    );
  }

  if (loadState === "invalid" || loadState === "error") {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h2>
            <p className="text-gray-500 text-sm">
              {loadState === "invalid"
                ? "This link is missing a valid token."
                : `Could not load your application: ${loadError}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadState === "inactive") {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">This link is no longer active</h2>
            <p className="text-gray-500 text-sm">Your application is complete or has been closed.</p>
          </div>
        </div>
      </div>
    );
  }

  if (notLooking) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
        <DualHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm gg-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No problem, {candidate?.first_name}!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We've noted you're not currently looking. We'll keep your details on file and reach out when a suitable role comes up.
            </p>
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
            Industrial Cleaner · Worcester
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-snug">
            Hi {candidate?.first_name} — before your screening call with Sarah, just a few quick questions.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 gg-in gg-d1" noValidate>
          {/* Q1 — still looking (the one gate: "No" closes the application) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Are you still looking for work? <span className="text-red-400">*</span>
            </label>
            <RadioPair value={lookingForWork} onChange={setLookingForWork} />
            {err(lookingForWork !== "") && <p className="text-xs text-red-500 mt-1.5">Please select an option</p>}
          </div>

          {/* Q2 — right to work */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Do you have the right to work in the UK? <span className="text-red-400">*</span>
            </label>
            <RadioPair value={rightToWork} onChange={setRightToWork} />
            {err(rightToWork !== "") && <p className="text-xs text-red-500 mt-1.5">Please select an option</p>}
          </div>

          {/* Q3 — Worcestershire town */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Which area are you based in? <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select value={town} onChange={e => setTown(e.target.value)}
                className="w-full appearance-none border rounded-xl px-4 py-3 text-sm outline-none bg-white cursor-pointer transition-all"
                style={{ borderColor: err(!town) ? "#ef4444" : town ? GG : "#e5e7eb" }}>
                <option value="">Select your area…</option>
                {WORCS_TOWNS.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {err(!town) && <p className="text-xs text-red-500 mt-1.5">Please select your area</p>}
          </div>

          {/* Q4 — can reach the Worcester meeting point */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Most shifts start from our Worcester meeting point (Unit 4, Lowesmoor Wharf). Could you reliably get there for shift starts? <span className="text-red-400">*</span>
            </label>
            <RadioPair value={canReachWorcester} onChange={setCanReachWorcester} />
            {err(canReachWorcester !== "") && <p className="text-xs text-red-500 mt-1.5">Please select an option</p>}
          </div>

          {/* Q5 — full UK driving licence (a plus, not required) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Do you have a full UK driving licence? <span className="text-red-400">*</span>
            </label>
            <RadioPair value={drivingLicence} onChange={setDrivingLicence} />
            {err(drivingLicence !== "") && <p className="text-xs text-red-500 mt-1.5">Please select an option</p>}
          </div>

          {/* Q6 — availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Are you available to start within the next 2 weeks? <span className="text-red-400">*</span>
            </label>
            <RadioPair value={availableSoon} onChange={setAvailableSoon} />
            {err(availableSoon !== "") && <p className="text-xs text-red-500 mt-1.5">Please select an option</p>}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[.98] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: GG }}>
            {submitting ? <><Loader2 size={16} className="animate-spin" />Saving…</> : "Continue to Screening"}
          </button>
        </form>
      </div>
    </div>
  );
}
