import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";

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
  const [lookingForWork, setLookingForWork] = useState<"Yes" | "No" | "">("");
  const [city, setCity] = useState("");
  const [availableSoon, setAvailableSoon] = useState<"Yes" | "No" | "">("");
  const [role, setRole] = useState("");
  const [attempted, setAttempted] = useState(false);

  const valid = lookingForWork !== "" && city !== "" && availableSoon !== "" && role !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!valid) return;
    sessionStorage.setItem("gg_candidate_form", JSON.stringify({ lookingForWork, city, availableSoon, role }));
    navigate("/screening-call");
  }

  const err = (field: boolean) => attempted && !field;

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

          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[.98]"
            style={{ backgroundColor: GG }}>
            Continue to Screening
          </button>
        </form>
      </div>
    </div>
  );
}
