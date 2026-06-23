import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Check, Database, Send, Sparkles, Globe, Phone, ArrowRight,
  Mic, FileText, DollarSign, Star, UserCheck, Plus,
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

type WFStatus = "pending" | "active" | "done";

const WF1_STEPS = [
  { icon: <Mic size={12} />,        label: "Talk to Sarah" },
  { icon: <FileText size={12} />,   label: "Sarah creates job" },
  { icon: <DollarSign size={12} />, label: "Sarah recommends budget" },
  { icon: <Send size={12} />,       label: "Sarah distributes jobs" },
  { icon: <Phone size={12} />,      label: "Sarah screens applicants" },
  { icon: <Star size={12} />,       label: "Qualified candidates delivered" },
];

const WF2_STEPS = [
  { icon: <Database size={12} />,   label: "Import candidates" },
  { icon: <Phone size={12} />,      label: "Sarah calls candidates" },
  { icon: <Mic size={12} />,        label: "Sarah screens candidates" },
  { icon: <Star size={12} />,       label: "Sarah qualifies candidates" },
  { icon: <UserCheck size={12} />,  label: "Shortlist delivered" },
];

function WFStep({ icon, label, status }: { icon: React.ReactNode; label: string; status: WFStatus }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-500"
      style={status === "active" ? { backgroundColor: GG_LIGHT } : status === "done" ? { backgroundColor: "#f9fafb" } : {}}>
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors duration-500"
        style={
          status === "active" ? { backgroundColor: GG, color: "white" } :
          status === "done"   ? { backgroundColor: "#e5e7eb", color: "#9ca3af" } :
                                { backgroundColor: "#f3f4f6", color: "#d1d5db" }
        }>
        {status === "done" ? <Check size={10} strokeWidth={3} /> : <span className="flex items-center justify-center">{icon}</span>}
      </div>
      <span className="text-xs font-medium transition-colors duration-500"
        style={{ color: status === "active" ? GG : status === "done" ? "#9ca3af" : "#d1d5db" }}>
        {label}
      </span>
      {status === "active" && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: GG }} />
      )}
    </div>
  );
}

function WorkflowAnimation() {
  const [wf1, setWf1] = useState(0);
  const [wf2, setWf2] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setWf1(s => (s >= WF1_STEPS.length ? 0 : s + 1)), 1100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWf2(s => (s >= WF2_STEPS.length ? 0 : s + 1)), 1250);
    return () => clearInterval(t);
  }, []);

  function stepStatus(i: number, active: number): WFStatus {
    if (i < active) return "done";
    if (i === active) return "active";
    return "pending";
  }

  return (
    <div className="rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">Sarah at work</p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: GG_LIGHT, color: GG }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GG }} />
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: GG }}>Distribute & Screen</p>
          <p className="text-xs text-gray-400 mb-3">Post a job, Sarah handles the rest</p>
          <div className="space-y-0.5">
            {WF1_STEPS.map((s, i) => (
              <div key={i}>
                <WFStep icon={s.icon} label={s.label} status={wf1 >= WF1_STEPS.length ? "done" : stepStatus(i, wf1)} />
                {i < WF1_STEPS.length - 1 && <div className="ml-4 w-px h-1.5" style={{ backgroundColor: "#e5e7eb" }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: GG }}>Screen Existing</p>
          <p className="text-xs text-gray-400 mb-3">Import candidates, Sarah qualifies them</p>
          <div className="space-y-0.5">
            {WF2_STEPS.map((s, i) => (
              <div key={i}>
                <WFStep icon={s.icon} label={s.label} status={wf2 >= WF2_STEPS.length ? "done" : stepStatus(i, wf2)} />
                {i < WF2_STEPS.length - 1 && <div className="ml-4 w-px h-1.5" style={{ backgroundColor: "#e5e7eb" }} />}
              </div>
            ))}
          </div>
          <div className="mt-0.5 px-2.5 py-1.5 opacity-0">
            <WFStep icon={<Star size={12} />} label="placeholder" status="pending" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-3 grid grid-cols-3 gap-3 text-center bg-gray-50">
        <div>
          <p className="text-lg font-bold text-gray-900">452</p>
          <p className="text-[10px] text-gray-400">Candidates reached</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">40</p>
          <p className="text-[10px] text-gray-400">Calls in progress</p>
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: GG }}>12</p>
          <p className="text-[10px] text-gray-400">Qualified today</p>
        </div>
      </div>
    </div>
  );
}

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
            Talk to Sarah →
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
              { icon: <Send size={16} />, head: "Distribute jobs & screen applicants", desc: "Sarah posts your role across 10+ boards and screens every inbound applicant." },
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
        <WorkflowAnimation />
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Two ways to use Sarah</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Pick the workflow that fits your hiring.</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                title: "Distribute & Screen",
                tag: "Best for new roles",
                steps: [
                  "Talk to Sarah for 5 min — she writes the job spec",
                  "Sarah posts to Indeed, LinkedIn, ZipRecruiter & more",
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
        </div>
      </section>

      {/* Integrations */}
      <section className="py-14 max-w-5xl mx-auto px-8">
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
                <span className="text-xs text-gray-300">— {sub}</span>
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
      </section>

      {/* 32 Languages */}
      <section className="bg-gray-50 py-12">
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
              {langExpanded ? "Show fewer" : "See all 32 languages"} →
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
      <section className="py-20 text-center">
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
