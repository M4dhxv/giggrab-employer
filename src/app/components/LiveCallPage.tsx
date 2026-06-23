import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2 } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const TRANSCRIPT: { from: "sarah" | "employer"; text: string }[] = [
  { from: "sarah",    text: "Hi! I'm Sarah. I've just pulled up the job spec from our conversation. Before I start reaching out to candidates, I'd like to set up your screening questions. This is how I'll qualify everyone who applies." },
  { from: "employer", text: "Great, sounds good." },
  { from: "sarah",    text: "I use a two-tier system. Tier 1 is quick Yes/No qualifying questions. Each yes answer adds to a candidate's suitability score — so if they hit 5 out of 10 criteria, they score 50%. Simple and easy to interpret." },
  { from: "employer", text: "That makes sense." },
  { from: "sarah",    text: "For this Warehouse Associate role, I'd suggest Tier 1 questions like: Do you have warehouse or logistics experience? Can you lift up to 25kg regularly? Are you available to start within 2 weeks? Do you have the right to work in the UK?" },
  { from: "employer", text: "Yes, those are all important. Add shift flexibility too — can they work days, lates, and weekends?" },
  { from: "sarah",    text: "Added. That's 5 Tier 1 questions. Tier 2 then builds on Tier 1 answers with follow-up questions for context. For example: if they say yes to warehouse experience, I'll ask them to describe a typical shift and the heaviest item they've handled regularly." },
  { from: "employer", text: "That's really useful." },
  { from: "sarah",    text: "I'll also add: Can you tell me about a time you had to work to a tight deadline in a physical role? That helps surface reliable, hardworking candidates beyond just the yes/no answers." },
  { from: "employer", text: "Perfect." },
  { from: "sarah",    text: "What suitability score threshold should I use for your shortlist? I'd suggest 60% as a minimum — that means they meet at least 3 out of 5 key criteria." },
  { from: "employer", text: "Let's go with 70%. I'd rather have a tighter shortlist." },
  { from: "sarah",    text: "Done. Shortlist threshold set to 70%. I'll screen every applicant against these criteria and deliver ranked candidates with scores, call transcripts, and summaries. Ready to review your screening questions before we go live?" },
];

// Tier 1 questions populate as the conversation progresses
const T1_REVEALS = [
  { afterMsg: 4, q: "Do you have warehouse or logistics experience?" },
  { afterMsg: 4, q: "Can you lift up to 25kg regularly?" },
  { afterMsg: 4, q: "Are you available to start within 2 weeks?" },
  { afterMsg: 4, q: "Do you have the right to work in the UK?" },
  { afterMsg: 5, q: "Can you work days, lates, and weekends?" },
];

const T2_REVEALS = [
  { afterMsg: 6, q: "Describe a typical shift and the heaviest item you've handled." },
  { afterMsg: 8, q: "Tell me about a time you worked to a tight deadline in a physical role." },
];

export default function LiveCallPage() {
  const navigate = useNavigate();
  const [msgCount, setMsgCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgCount >= TRANSCRIPT.length) return;
    const delay = TRANSCRIPT[msgCount - 1].from === "sarah" ? 2200 : 1100;
    setTyping(true);
    const t = setTimeout(() => { setTyping(false); setMsgCount((c) => c + 1); }, delay);
    return () => clearTimeout(t);
  }, [msgCount]);

  // Update threshold when employer says 70%
  useEffect(() => {
    if (msgCount >= 12) setThreshold(70);
  }, [msgCount]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [msgCount, typing]);

  const t1Visible = T1_REVEALS.filter(q => q.afterMsg <= msgCount - 1).map(q => q.q);
  const t2Visible = T2_REVEALS.filter(q => q.afterMsg <= msgCount - 1).map(q => q.q);
  const score = Math.min(100, Math.round((t1Visible.length / T1_REVEALS.length) * 100));
  const done = msgCount >= TRANSCRIPT.length;

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
          {done ? "Call complete" : "Live call"}
        </span>
      </nav>

      <div className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Setting up your screening</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sarah is building your qualification framework in real time.</p>
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Transcript — 3/5 width */}
          <div className="col-span-3 rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: done ? "#9ca3af" : GG, animation: done ? "none" : "pulse 2s infinite" }} />
              <span className="text-xs font-medium text-gray-600">{done ? "Call ended" : "In progress"}</span>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 420 }}>
              {TRANSCRIPT.slice(0, msgCount).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "employer" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "sarah" && (
                    <div className="mr-2 mt-auto flex-shrink-0">
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
                    <div className="ml-2 mt-auto flex-shrink-0">
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
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Screening framework — 2/5 width */}
          <div className="col-span-2 space-y-3 overflow-y-auto" style={{ maxHeight: 500 }}>
            {/* Suitability score */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Shortlist threshold</p>
                <p className="text-sm font-bold" style={{ color: GG }}>{threshold}%</p>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${threshold}%`, backgroundColor: GG }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Candidates must meet {threshold}% of Tier 1 criteria</p>
            </div>

            {/* Tier 1 */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Tier 1 — Qualifying</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: GG_LIGHT, color: GG }}>Yes / No</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Each yes answer adds to suitability score</p>
              {t1Visible.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Questions will appear as Sarah builds them...</p>
              ) : (
                <div className="space-y-2">
                  {t1Visible.map((q, i) => (
                    <div key={i} className="flex gap-2 items-start animate-in fade-in duration-300">
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: GG }}>
                        <Check size={9} className="text-white" strokeWidth={3} />
                      </div>
                      <p className="text-xs text-gray-700 leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tier 2 */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Tier 2 — Context</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-500">Follow-up</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Asked only to candidates who clear Tier 1</p>
              {t2Visible.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Follow-up questions appear next...</p>
              ) : (
                <div className="space-y-2">
                  {t2Visible.map((q, i) => (
                    <div key={i} className="flex gap-2 items-start animate-in fade-in duration-300">
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: GG }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GG }} />
                      </div>
                      <p className="text-xs text-gray-700 leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/screening-questions")}
            disabled={!done}
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-30 transition-all"
            style={{ backgroundColor: GG }}>
            {done ? "Review screening questions" : "Sarah is building your framework..."}
          </button>
        </div>
      </div>
    </div>
  );
}
