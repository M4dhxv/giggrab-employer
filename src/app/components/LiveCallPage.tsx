import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

// Phase 1: Sarah asks about the job → builds JD
// Phase 2: Sarah sets up screening questions
const TRANSCRIPT: { from: "sarah" | "employer"; text: string; phase: 1 | 2 }[] = [
  { phase: 1, from: "sarah",    text: "Hi! I'm Sarah. Thanks for calling in. What role are you looking to fill?" },
  { phase: 1, from: "employer", text: "Warehouse Associates." },
  { phase: 1, from: "sarah",    text: "Got it. How many workers do you need and over what timeframe?" },
  { phase: 1, from: "employer", text: "15, as soon as possible." },
  { phase: 1, from: "sarah",    text: "Where is the role based? City and postcode if you have it." },
  { phase: 1, from: "employer", text: "Manchester, M1." },
  { phase: 1, from: "sarah",    text: "What's the pay rate and shift pattern?" },
  { phase: 1, from: "employer", text: "£13 per hour, day shifts, some weekend flexibility needed." },
  { phase: 1, from: "sarah",    text: "Any specific requirements — licences, certifications, physical requirements?" },
  { phase: 1, from: "employer", text: "No licence needed, but they need to be physically fit and reliable. Right to work in the UK is essential." },
  { phase: 1, from: "sarah",    text: "I've put together your job description. Before I start reaching candidates, let me set up how I'll screen them. I use a two-tier system — quick Yes/No questions that build a suitability score, then follow-up questions for context. Sound good?" },
  { phase: 2, from: "employer", text: "Yes, that works." },
  { phase: 2, from: "sarah",    text: "For Tier 1, I'll ask things like: Do you have warehouse or logistics experience? Can you lift 25kg regularly? Are you available to start within 2 weeks? Do you have the right to work in the UK? Flexible on shifts including weekends?" },
  { phase: 2, from: "employer", text: "Yes, those are the key ones." },
  { phase: 2, from: "sarah",    text: "Each yes answer adds to their score. If a candidate hits 70% or more, they go on your shortlist. For Tier 2 context, I'll ask: Tell me about your warehouse experience. Describe a time you worked to a tight physical deadline." },
  { phase: 2, from: "employer", text: "Perfect, that gives a good picture." },
  { phase: 2, from: "sarah",    text: "Great. Your job description is ready and your screening framework is set. Ready to review before we go live?" },
];

const JD_FIELDS: { key: string; val: string; afterMsg: number }[] = [
  { key: "Job Title",       val: "Warehouse Associate",              afterMsg: 1 },
  { key: "Hiring Volume",   val: "15 workers",                       afterMsg: 3 },
  { key: "Location",        val: "Manchester, M1",                   afterMsg: 5 },
  { key: "Pay Rate",        val: "£13/hour",                         afterMsg: 7 },
  { key: "Shift Pattern",   val: "Day shifts, weekend flexibility",   afterMsg: 7 },
  { key: "Requirements",    val: "Physically fit, reliable, RTW UK",  afterMsg: 9 },
];

const T1_QUESTIONS = [
  "Do you have warehouse or logistics experience?",
  "Can you lift 25kg regularly?",
  "Are you available to start within 2 weeks?",
  "Do you have the right to work in the UK?",
  "Flexible on shifts including weekends?",
];

const T2_QUESTIONS = [
  "Tell me about your warehouse experience.",
  "Describe a time you worked to a tight physical deadline.",
];

export default function LiveCallPage() {
  const navigate = useNavigate();
  const [msgCount, setMsgCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const currentPhase = TRANSCRIPT[Math.min(msgCount - 1, TRANSCRIPT.length - 1)].phase;
  const done = msgCount >= TRANSCRIPT.length;

  useEffect(() => {
    if (done) return;
    const delay = TRANSCRIPT[msgCount - 1].from === "sarah" ? 2000 : 1000;
    setTyping(true);
    const t = setTimeout(() => { setTyping(false); setMsgCount(c => c + 1); }, delay);
    return () => clearTimeout(t);
  }, [msgCount, done]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [msgCount, typing]);

  const jdVisible = JD_FIELDS.filter(f => f.afterMsg <= msgCount - 1);
  const t1Visible = msgCount >= 13 ? T1_QUESTIONS : [];
  const t2Visible = msgCount >= 15 ? T2_QUESTIONS : [];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-between py-4 px-8 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: GG_LIGHT, color: GG }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GG }} />
          {done ? "Call complete" : currentPhase === 1 ? "Building your JD" : "Setting up screening"}
        </span>
      </nav>

      <div className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {currentPhase === 1 ? "Tell Sarah about your role" : "Sarah is setting up your screening"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentPhase === 1
              ? "Your job description is being written in real time as you speak."
              : "Sarah is building your two-tier qualification framework."}
          </p>
        </div>

        {/* Phase progress */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { n: 1, label: "Job details" },
            { n: 2, label: "Screening setup" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              {n > 1 && <div className="w-6 h-px bg-gray-200" />}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300"
                  style={
                    n < currentPhase || (n === 2 && done)
                      ? { backgroundColor: GG, borderColor: GG, color: "white" }
                      : n === currentPhase
                        ? { backgroundColor: GG_LIGHT, borderColor: GG, color: GG }
                        : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#d1d5db" }
                  }>
                  {n < currentPhase || (n === 2 && done) ? <Check size={10} strokeWidth={3} /> : n}
                </div>
                <span className="text-xs font-medium" style={{ color: n === currentPhase ? GG : n < currentPhase ? "#9ca3af" : "#d1d5db" }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Chat — 3/5 */}
          <div className="col-span-3 rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: done ? "#9ca3af" : GG, animation: done ? "none" : "pulse 2s infinite" }} />
              <span className="text-xs font-medium text-gray-600">{done ? "Call ended" : "In progress"}</span>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 400 }}>
              {TRANSCRIPT.slice(0, msgCount).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "employer" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "sarah" && (
                    <div className="mr-2 mt-auto">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: GG }}>S</div>
                    </div>
                  )}
                  <div className="max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                    style={msg.from === "employer"
                      ? { backgroundColor: GG, color: "white" }
                      : { backgroundColor: "#f3f4f6", color: "#1f2937" }}>
                    {msg.text}
                  </div>
                  {msg.from === "employer" && (
                    <div className="ml-2 mt-auto">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[9px] font-bold">ME</div>
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="mr-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: GG }}>S</div>
                  </div>
                  <div className="bg-gray-100 px-3 py-2.5 rounded-xl flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel — 2/5 */}
          <div className="col-span-2 space-y-3 overflow-y-auto" style={{ maxHeight: 460 }}>
            {/* JD panel */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700">Job Description</p>
                <span className="text-[10px] text-gray-400">Auto-written</span>
              </div>
              {jdVisible.length === 0
                ? <p className="text-xs text-gray-300 italic">Sarah is listening...</p>
                : (
                  <div className="space-y-2.5">
                    {jdVisible.map(f => (
                      <div key={f.key}>
                        <p className="text-[10px] text-gray-400 mb-0.5">{f.key}</p>
                        <p className="text-sm font-medium text-gray-900">{f.val}</p>
                      </div>
                    ))}
                    {jdVisible.length < JD_FIELDS.length && (
                      <div>
                        <p className="text-[10px] text-gray-200 mb-0.5">Requirements</p>
                        <p className="text-sm text-gray-200">...</p>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Screening panel — appears at phase 2 */}
            {msgCount >= 11 && (
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Screening Framework</p>
                <p className="text-[10px] text-gray-400 mb-3">Two-tier qualification system</p>

                {t1Visible.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GG }}>Tier 1</span>
                      <span className="text-[10px] text-gray-400">Yes/No scoring</span>
                    </div>
                    <div className="space-y-1.5">
                      {t1Visible.map((q, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: GG }}>
                            <Check size={8} className="text-white" strokeWidth={3} />
                          </div>
                          <p className="text-xs text-gray-700 leading-snug">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {t2Visible.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tier 2</span>
                      <span className="text-[10px] text-gray-400">Context follow-ups</span>
                    </div>
                    <div className="space-y-1.5">
                      {t2Visible.map((q, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: "#9ca3af" }}>
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 leading-snug">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {t1Visible.length === 0 && (
                  <p className="text-xs text-gray-300 italic">Questions building...</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/screening-questions")}
            disabled={!done}
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: GG }}>
            {done ? "Review JD and screening questions" : "Sarah is building your setup..."}
          </button>
        </div>
      </div>
    </div>
  );
}
