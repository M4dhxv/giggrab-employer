import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Activity, Check, Loader2 } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const CONNECT_STEPS = [
  "Calling…",
  "Connecting…",
  "Building Job Description…",
  "Creating Screening Workflow…",
  "Preparing Recruiting Campaign…",
];

function CheckDot({ done, active }: { done?: boolean; active?: boolean }) {
  if (done) return (
    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GG }}>
      <Check size={10} className="text-white" strokeWidth={3} />
    </div>
  );
  if (active) return <Loader2 size={16} className="flex-shrink-0 animate-spin" style={{ color: GG }} />;
  return <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />;
}

export default function ConnectingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < CONNECT_STEPS.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => navigate("/live-call"), 1000);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-5 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: GG_LIGHT }}>
            <Activity size={32} className="animate-pulse" style={{ color: GG }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-8">Connecting Sarah…</h2>
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {CONNECT_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckDot done={i < step} active={i === step} />
                <span className={`text-sm ${i < step ? "text-gray-400" : i === step ? "text-gray-900 font-medium" : "text-gray-300"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
