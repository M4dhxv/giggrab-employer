import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2 } from "lucide-react";

const GG = "#3d8c62";

const TRANSCRIPT = [
  { from: "sarah", text: "Hi! Thanks for calling. What role are you hiring for?" },
  { from: "employer", text: "Warehouse Associates." },
  { from: "sarah", text: "Great. How many workers do you need?" },
  { from: "employer", text: "15." },
  { from: "sarah", text: "And the location? City and postcode if you have it." },
  { from: "employer", text: "Manchester, M1." },
  { from: "sarah", text: "Perfect. What's the pay rate?" },
  { from: "employer", text: "£13 per hour." },
  { from: "sarah", text: "Any specific requirements — licences, certifications?" },
  { from: "employer", text: "No licence needed, just physically fit and reliable." },
];

const JOB_FIELDS = [
  { key: "Job Title",           val: "Warehouse Associate",      after: 1 },
  { key: "Employment Type",     val: "Full-time",                after: 0 },
  { key: "Hiring Volume",       val: "15 workers",               after: 3 },
  { key: "Location",            val: "Manchester, M1",           after: 5 },
  { key: "Pay",                 val: "£13/hour",                 after: 7 },
  { key: "Shift Type",          val: "Days",                     after: 7 },
  { key: "Requirements",        val: "Physical fitness, reliable", after: 9 },
  { key: "Screening Questions", val: "Generating…",              after: 9 },
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

export default function LiveCallPage() {
  const navigate = useNavigate();
  const [msgCount, setMsgCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgCount >= TRANSCRIPT.length) return;
    const delay = TRANSCRIPT[msgCount - 1].from === "sarah" ? 1800 : 1000;
    setTyping(true);
    const t = setTimeout(() => { setTyping(false); setMsgCount((c) => c + 1); }, delay);
    return () => clearTimeout(t);
  }, [msgCount]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [msgCount, typing]);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-4 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{"You're on with Sarah"}</h1>
          <p className="text-sm text-gray-500 mt-1">Talk normally — your job spec is being written in real time.</p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-2 gap-5">
          {/* Live chat */}
          <div className="rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GG }} />
              <span className="text-xs font-medium text-gray-600">Live Call · In Progress…</span>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 340 }}>
              {TRANSCRIPT.slice(0, msgCount).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "employer" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "sarah" && (
                    <span className="mr-2 mt-0.5 text-xs text-gray-400 flex-shrink-0 w-12 text-right self-end">GigGrab</span>
                  )}
                  <div
                    className={`max-w-[68%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.from === "employer" ? "text-white" : "bg-gray-100 text-gray-800"}`}
                    style={msg.from === "employer" ? { backgroundColor: GG } : {}}>
                    {msg.text}
                  </div>
                  {msg.from === "employer" && (
                    <span className="ml-2 mt-0.5 text-xs text-gray-400 flex-shrink-0 w-14 self-end">Employer</span>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <span className="mr-2 text-xs text-gray-400 w-12 text-right mt-0.5 self-end">GigGrab</span>
                  <div className="bg-gray-100 px-3 py-2.5 rounded-xl flex gap-1 items-center">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auto-generated job spec */}
          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-0.5">Job Description</p>
            <p className="text-xs text-gray-400 mb-4">Auto-generated during conversation</p>
            <div className="space-y-3.5">
              {JOB_FIELDS.map((f) => (
                <div key={f.key}>
                  <p className="text-xs text-gray-400 mb-0.5">{f.key}</p>
                  {f.after <= msgCount - 1
                    ? <p className="text-sm font-medium text-gray-900">{f.val}</p>
                    : <p className="text-sm text-gray-200">—</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/service")}
            disabled={msgCount < 8}
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: GG }}>
            Continue
          </button>
          {msgCount < 8 && (
            <p className="text-xs text-gray-400 text-center mt-2">Sarah is still building your job spec…</p>
          )}
        </div>
      </div>
    </div>
  );
}
