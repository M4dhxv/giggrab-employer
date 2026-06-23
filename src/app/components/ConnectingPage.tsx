import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Phone, PhoneCall, Check } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

type Stage = "calling" | "ringing" | "connected";

const CSS = `
@keyframes ring-out {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes phone-shake {
  0%,100% { transform: rotate(0deg); }
  20%      { transform: rotate(-15deg); }
  40%      { transform: rotate(12deg); }
  60%      { transform: rotate(-8deg); }
  80%      { transform: rotate(6deg); }
}
@keyframes connected-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .cp-ring, .cp-shake, .cp-pop { animation: none !important; }
}
`;

export default function ConnectingPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("calling");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("ringing"),   1400);
    const t2 = setTimeout(() => setStage("connected"), 2900);
    const t3 = setTimeout(() => navigate("/live-call"), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{CSS}</style>

      <nav className="flex items-center justify-center py-5 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {/* Icon area */}
        <div className="relative flex items-center justify-center w-36 h-36">
          {/* Ring pulses — only when ringing */}
          {stage === "ringing" && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i}
                  className="cp-ring absolute rounded-full border-2"
                  style={{
                    width: 56 + i * 30,
                    height: 56 + i * 30,
                    borderColor: GG,
                    opacity: 0,
                    animation: `ring-out 1.8s ease-out ${i * 0.4}s infinite`,
                  }}
                />
              ))}
            </>
          )}

          {/* Central icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center z-10 shadow-lg transition-all duration-500"
            style={{ backgroundColor: stage === "connected" ? GG : GG_LIGHT }}>
            {stage === "connected" ? (
              <Check size={36} className="text-white cp-pop"
                style={{ animation: "connected-pop 0.4s ease-out forwards" }} />
            ) : (
              <Phone size={32}
                className={stage === "ringing" ? "cp-shake" : ""}
                style={{
                  color: GG,
                  animation: stage === "ringing" ? "phone-shake 0.6s ease-in-out infinite" : "none",
                }} />
            )}
          </div>
        </div>

        {/* Stage labels */}
        <div className="flex items-center gap-8">
          {(["calling", "ringing", "connected"] as Stage[]).map((s, i) => {
            const done = (s === "calling" && (stage === "ringing" || stage === "connected"))
                      || (s === "ringing" && stage === "connected");
            const active = stage === s;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-gray-200 -ml-4" />}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-400"
                    style={{
                      backgroundColor: done ? GG : active ? GG_LIGHT : "white",
                      borderColor: done || active ? GG : "#e5e7eb",
                    }}>
                    {done && <Check size={10} className="text-white" strokeWidth={3} />}
                    {active && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GG }} />}
                  </div>
                  <span className="text-xs font-medium capitalize transition-colors duration-300"
                    style={{ color: active ? GG : done ? "#9ca3af" : "#d1d5db" }}>
                    {s === "connected" ? "Connected" : s.charAt(0).toUpperCase() + s.slice(1) + "..."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-400">
          {stage === "calling"   && "Reaching Sarah..."}
          {stage === "ringing"   && "Sarah is answering..."}
          {stage === "connected" && "Starting your session"}
        </p>
      </div>
    </div>
  );
}
