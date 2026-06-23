import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Check, Database, Send, Sparkles, Globe, Phone, ArrowRight,
  Mic, FileText, DollarSign, Star, UserCheck, Plus, PhoneCall,
  Clock, MessageSquare,
} from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const ATS_DATA = [
  { name: "Greenhouse", color: "#24a053", bg: "#e8f7ef", letter: "G" },
  { name: "Ashby",      color: "#6366f1", bg: "#eeeffd", letter: "A" },
  { name: "Lever",      color: "#1b7ee1", bg: "#e6f1fb", letter: "L" },
  { name: "Workday",    color: "#e85d04", bg: "#fef0e8", letter: "W" },
  { name: "Bullhorn",   color: "#c0392b", bg: "#fdecea", letter: "B" },
];

const BOARD_DATA = [
  { name: "Indeed",       color: "#003a9b", bg: "#e6eaf7", letter: "I" },
  { name: "LinkedIn",     color: "#0077b5", bg: "#e5f2fa", letter: "in" },
  { name: "ZipRecruiter", color: "#4a00d4", bg: "#ede5fb", letter: "Z" },
  { name: "Adzuna",       color: "#e85d04", bg: "#fef0e8", letter: "A" },
  { name: "Jooble",       color: "#1da462", bg: "#e8f7ef", letter: "J" },
];

const LANGUAGES = [
  "English","Spanish","French","German","Portuguese","Mandarin",
  "Arabic","Hindi","Polish","Italian","Dutch","Japanese",
  "Korean","Turkish","Romanian","Ukrainian","Russian","Swedish",
  "Norwegian","Danish","Finnish","Czech","Hungarian","Greek",
  "Thai","Vietnamese","Indonesian","Malay","Tagalog","Bengali","Urdu","Swahili",
];

// Agentic activity feed — things Sarah is actively doing
const ACTIVITY_POOL = [
  { action: "Called",       name: "Marcus L.",   detail: null,                      type: "call"    },
  { action: "Qualified",    name: "Emma R.",     detail: "87%",                     type: "qualify" },
  { action: "Sent SMS to",  name: "Tom K.",      detail: null,                      type: "sms"     },
  { action: "Screened",     name: "David M.",    detail: "62%",                     type: "screen"  },
  { action: "Called",       name: "Lisa P.",     detail: null,                      type: "call"    },
  { action: "Qualified",    name: "Aisha B.",    detail: "91%",                     type: "qualify" },
  { action: "Left message for", name: "James O.", detail: null,                     type: "sms"     },
  { action: "Screened",     name: "Rosa T.",     detail: "74%",                     type: "screen"  },
  { action: "Booked interview", name: "Emma R.", detail: "Tomorrow 10am",           type: "book"    },
  { action: "Called",       name: "Kevin S.",    detail: null,                      type: "call"    },
  { action: "Qualified",    name: "Nadia H.",    detail: "83%",                     type: "qualify" },
  { action: "Screened",     name: "Piotr W.",    detail: "55%",                     type: "screen"  },
];

const SCORE_COLORS: Record<string, string> = {
  call:    "#3b82f6",
  qualify: GG,
  screen:  "#8b5cf6",
  sms:     "#f59e0b",
  book:    "#06b6d4",
};

const CANDIDATE_QUEUE = [
  { name: "Emma R.",  score: 87, status: "Qualified", initials: "ER", color: GG },
  { name: "Aisha B.", score: 91, status: "Qualified", initials: "AB", color: "#6366f1" },
  { name: "Nadia H.", score: 83, status: "Qualified", initials: "NH", color: "#f59e0b" },
  { name: "Rosa T.",  score: 74, status: "Review",    initials: "RT", color: "#06b6d4" },
  { name: "David M.", score: 62, status: "Review",    initials: "DM", color: "#8b5cf6" },
];

function AgenticHero() {
  const [feed, setFeed] = useState(() => ACTIVITY_POOL.slice(0, 5).map((a, i) => ({ ...a, id: i, ts: i * 8 + 5 })));
  const [tick, setTick] = useState(0);
  const [nextIdx, setNextIdx] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(x => x + 1);
      setFeed(prev => {
        const item = { ...ACTIVITY_POOL[nextIdx % ACTIVITY_POOL.length], id: Date.now(), ts: 0 };
        setNextIdx(i => i + 1);
        return [item, ...prev.slice(0, 5)].map((x, i) => ({ ...x, ts: i * 9 + (i === 0 ? 0 : x.ts) }));
      });
    }, 1800);
    return () => clearInterval(t);
  }, [nextIdx]);

  // increment timestamps
  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => prev.map(a => ({ ...a, ts: a.ts + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const [callsNow, setCallsNow] = useState(40);
  const [qualifiedToday, setQualifiedToday] = useState(12);
  const [reached, setReached] = useState(452);

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.6) setCallsNow(n => n + (Math.random() > 0.5 ? 1 : -1));
      if (Math.random() > 0.8) setQualifiedToday(n => n + 1);
      if (Math.random() > 0.5) setReached(n => n + Math.floor(Math.random() * 3));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Sarah</span>
          <span className="text-xs text-gray-400">is recruiting right now</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: GG_LIGHT, color: GG }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GG }} />
          Active
        </span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Live activity feed */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Live Actions</p>
          <div className="space-y-1.5">
            {feed.slice(0, 5).map((item, i) => (
              <div key={item.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-500"
                style={{
                  backgroundColor: i === 0 ? GG_LIGHT : "#f9fafb",
                  opacity: 1 - i * 0.12,
                }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SCORE_COLORS[item.type] }} />
                <span className="text-xs text-gray-600 flex-1 truncate">
                  {item.action}{" "}
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  {item.detail && (
                    <span className="ml-1 font-bold" style={{ color: item.type === "qualify" ? GG : "#6b7280" }}>
                      {item.detail}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-300 flex-shrink-0">{item.ts}s ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate scores */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Shortlist Building</p>
          <div className="space-y-1.5">
            {CANDIDATE_QUEUE.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: c.color }}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 truncate">{c.name}</span>
                    <span className="text-xs font-bold ml-1" style={{ color: c.score >= 75 ? GG : "#9ca3af" }}>{c.score}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${c.score}%`, backgroundColor: c.score >= 75 ? GG : "#d1d5db" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-gray-100 px-5 py-3 grid grid-cols-3 gap-3 text-center bg-gray-50">
        <div>
          <p className="text-lg font-bold text-gray-900 tabular-nums">{reached}</p>
          <p className="text-[10px] text-gray-400">Candidates reached</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 tabular-nums">{callsNow}</p>
          <p className="text-[10px] text-gray-400">Calls in progress</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums" style={{ color: GG }}>{qualifiedToday}</p>
          <p className="text-[10px] text-gray-400">Qualified today</p>
        </div>
      </div>
    </div>
  );
}

const FLOW_STEPS = [
  {
    icon: <Mic size={18} />,
    title: "You talk to Sarah",
    desc: "5-minute call. Tell Sarah what you need. She writes the job spec in real time.",
    time: "5 min",
  },
  {
    icon: <FileText size={18} />,
    title: "Job spec auto-written",
    desc: "Sarah creates a complete job description, screening criteria, and qualification score.",
    time: "Instant",
  },
  {
    icon: <Send size={18} />,
    title: "Posted to 10+ boards",
    desc: "Sarah posts to Indeed, LinkedIn, ZipRecruiter and more. No manual setup needed.",
    time: "Real-time",
  },
  {
    icon: <PhoneCall size={18} />,
    title: "Sarah calls and screens",
    desc: "Every inbound applicant gets a structured screening call from Sarah. 24/7, 32 languages.",
    time: "24/7",
  },
  {
    icon: <Star size={18} />,
    title: "Shortlist delivered",
    desc: "Ranked candidates with suitability scores, call transcripts, and AI summaries ready to review.",
    time: "Same day",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [langExpanded, setLangExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <button className="text-xl font-bold tracking-tight" style={{ color: GG }}>GigGrab</button>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-gray-900">For Workers</span>
          <span className="cursor-pointer font-medium hover:text-gray-900">Pricing</span>
          <button onClick={() => navigate("/dashboard")} className="hover:text-gray-900">Log In</button>
          <button onClick={() => navigate("/post-job")}
            className="px-4 py-2 text-xs text-white rounded-xl font-semibold cursor-pointer transition-opacity"
            style={{ backgroundColor: GG }}>
            Talk to Sarah
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-12 grid grid-cols-2 gap-14 items-start">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-5"
            style={{ backgroundColor: GG_LIGHT, color: GG }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GG }} />
            Sarah is recruiting now
          </span>
          <h1 className="mt-5 text-[3.5rem] font-extrabold text-gray-900 leading-[1.06] mb-4"
            style={{ letterSpacing: "-0.025em" }}>
            Your AI recruiting<br />
            <span style={{ color: GG }}>operator.</span>
          </h1>
          <div className="space-y-2.5 mb-7">
            {[
              { icon: <Database size={16} />, head: "Screen existing candidates", desc: "Upload your ATS or candidate database. Sarah calls and qualifies everyone." },
              { icon: <Send size={16} />, head: "Distribute jobs and screen applicants", desc: "Sarah posts your role across 10+ boards and screens every inbound applicant." },
              { icon: <Sparkles size={16} />, head: "Run your entire recruiting operation", desc: "Sarah handles outreach, follow-ups, scheduling, and delivers a ranked shortlist." },
            ].map(({ icon, head, desc }) => (
              <div key={head} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: GG_LIGHT, color: GG }}>{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{head}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/post-job")}
            className="px-5 py-3 text-sm text-white rounded-xl font-semibold cursor-pointer"
            style={{ backgroundColor: GG }}>
            Talk to Sarah — free call, starts in minutes
          </button>
          <div className="mt-3 flex items-center gap-5 text-xs text-gray-400">
            {["No credit card required", "32 languages", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Check size={12} style={{ color: GG }} />{t}
              </span>
            ))}
          </div>
        </div>
        <AgenticHero />
      </section>

      {/* Full flow */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">From call to qualified shortlist in hours.</h2>
          <div className="relative">
            {/* connecting line */}
            <div className="absolute top-9 left-[calc(10%+20px)] right-[calc(10%+20px)] h-px bg-gray-200 hidden lg:block" />
            <div className="grid grid-cols-5 gap-4">
              {FLOW_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3 z-10 border-2 border-white shadow-sm"
                    style={{ backgroundColor: GG_LIGHT, color: GG }}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: "#e5e7eb", color: "#6b7280" }}>
                    {step.time}
                  </span>
                  <p className="text-sm font-bold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <button onClick={() => navigate("/post-job")}
              className="px-5 py-3 text-sm text-white rounded-xl font-semibold"
              style={{ backgroundColor: GG }}>
              Start with a free call
            </button>
          </div>
        </div>
      </section>

      {/* Two modes */}
      <section className="py-14 max-w-5xl mx-auto px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Two ways to hire</p>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Pick the workflow that fits your hiring.</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            {
              title: "Distribute and Screen",
              tag: "Best for new roles",
              steps: [
                "Talk to Sarah for 5 min — she writes the job spec",
                "Sarah posts to Indeed, LinkedIn, ZipRecruiter and more",
                "Sarah calls and screens every inbound applicant",
                "Qualified shortlist delivered to your dashboard",
              ],
              cta: "Start distributing",
            },
            {
              title: "Screen Existing Candidates",
              tag: "Best for talent pipelines",
              steps: [
                "Import your ATS, CSV, or existing candidate database",
                "Sarah calls each candidate for a structured screen",
                "Sarah scores and qualifies against your criteria",
                "Ranked shortlist ready — no effort from your team",
              ],
              cta: "Start screening",
            },
          ].map(({ title, tag, steps, cta }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>
              </div>
              <div className="space-y-2.5 mb-5">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: GG }}>{i + 1}</div>
                    <p className="text-sm text-gray-600 leading-snug">{s}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/post-job")}
                className="text-sm font-semibold flex items-center gap-1" style={{ color: GG }}>
                {cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Integrations</p>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Works with your existing stack</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Sarah plugs into your ATS and job boards. No manual posting, ever.</p>
          <div className="grid grid-cols-2 gap-10">
            {[
              { label: "ATS", sub: "applicant tracking", items: ATS_DATA, more: "20 more ATS" },
              { label: "Job Boards", sub: "multi-platform", items: BOARD_DATA, more: "15 more boards" },
            ].map(({ label, sub, items, more }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                  <span className="text-xs text-gray-300">{sub}</span>
                </div>
                <div className="space-y-2">
                  {items.map((b) => (
                    <div key={b.name} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ backgroundColor: b.bg, color: b.color }}>{b.letter}</div>
                      <span className="text-sm font-medium text-gray-700">{b.name}</span>
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: GG_LIGHT, color: GG }}>Available</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-gray-200">
                    <div className="flex -space-x-1.5">
                      {["#6b7280","#9ca3af","#d1d5db"].map((c, i) => (
                        <div key={i} className="w-7 h-7 rounded-md border-2 border-white flex items-center justify-center" style={{ backgroundColor: c }}>
                          <Plus size={10} className="text-white" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">+ {more}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 32 Languages */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: GG_LIGHT, color: GG }}>
                <Globe size={16} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">32 Languages</p>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sarah speaks your candidates' language.</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Sarah conducts screening calls in 32 languages natively, powered by AI. Every candidate gets a fair, fluent conversation — no interpreters, no delays.
            </p>
            <button onClick={() => setLangExpanded(x => !x)}
              className="text-sm font-medium flex items-center gap-1" style={{ color: GG }}>
              {langExpanded ? "Show fewer" : "See all 32 languages"} <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(langExpanded ? LANGUAGES : LANGUAGES.slice(0, 16)).map((lang) => (
              <span key={lang} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 font-medium">{lang}</span>
            ))}
            {!langExpanded && (
              <span onClick={() => setLangExpanded(true)}
                className="text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 font-medium cursor-pointer">
                + 16 more
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center bg-gray-50">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Ready when you are</p>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
          Let Sarah staff your next role.
        </h2>
        <p className="text-gray-500 mb-7 text-sm max-w-xs mx-auto">
          One call. Sarah screens candidates, posts your job, and delivers a qualified shortlist.
        </p>
        <button onClick={() => navigate("/post-job")}
          className="px-5 py-3 text-sm text-white rounded-xl font-semibold cursor-pointer"
          style={{ backgroundColor: GG }}>
          Talk to Sarah — free call
        </button>
        <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
          {["No credit card","Free call","32 languages","Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-1">
              <Check size={12} style={{ color: GG }} />{t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
