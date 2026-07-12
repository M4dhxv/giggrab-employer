import { useState, useEffect } from "react";
import { Loader2, Lock, RefreshCw, ChevronDown, Phone, Clock } from "lucide-react";
import {
  fetchAdminDashboard,
  recordingSrc,
  type AdminCandidate,
  type AdminSession,
} from "../../lib/fcApi";

const GG = "#10b981";
const GG_LIGHT = "#f0fdf4";
const KEY_STORE = "fc_admin_key";

const REC_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  shortlist: { bg: "#f0fdf4", fg: "#059669", label: "Shortlist" },
  interview: { bg: "#eff6ff", fg: "#2563eb", label: "Interview" },
  hold:      { bg: "#fffbeb", fg: "#b45309", label: "Hold" },
  reject:    { bg: "#fef2f2", fg: "#dc2626", label: "Reject" },
};
const BAND_STYLE: Record<string, { bg: string; fg: string }> = {
  strong: { bg: "#f0fdf4", fg: "#059669" },
  maybe:  { bg: "#fffbeb", fg: "#b45309" },
  weak:   { bg: "#fef2f2", fg: "#dc2626" },
};

function Chip({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

function fmtDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
}

function SessionDetail({ s, adminKey }: { s: AdminSession; adminKey: string }) {
  const ai = s.fc_ai_summaries?.[0];
  const sr = (s.fc_candidate_structured_responses?.[0] ?? {}) as Record<string, unknown>;
  const rec = ai?.recommendation ? REC_STYLE[ai.recommendation] : null;

  const FIELDS: [string, string][] = [
    ["Right to work", "right_to_work"],
    ["RTW basis", "right_to_work_basis"],
    ["RTW expiry", "right_to_work_expiry"],
    ["Transport to site", "transport_to_site"],
    ["Can reach Worcester", "can_reach_site"],
    ["Comfortable w/ travel", "comfortable_with_travel"],
    ["Physical demands OK", "physical_comfort"],
    ["Chemical sensitivities", "chemical_sensitivities"],
    ["Available days", "available_days"],
    ["Earliest start time", "earliest_start_time"],
    ["Latest finish time", "latest_finish_time"],
    ["Shift notice", "shift_notice"],
    ["Earliest start date", "earliest_start_date"],
  ];
  const fmt = (v: unknown) =>
    v === null || v === undefined || v === "" ? "—"
    : typeof v === "boolean" ? (v ? "Yes" : "No")
    : Array.isArray(v) ? (v.length ? v.join(", ") : "—")
    : String(v);

  return (
    <div className="mt-3 space-y-4">
      {/* Call record */}
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
          <span className="font-bold uppercase tracking-widest text-gray-400">Call record</span>
          <Chip bg="#f3f4f6" fg="#374151">{s.status}</Chip>
          <span className="flex items-center gap-1"><Clock size={12} />{fmtDuration(s.duration_seconds)}</span>
          <span>{new Date(s.completed_at ?? s.created_at).toLocaleString()}</span>
          {s.call_id && <span className="text-gray-300 font-mono">{s.call_id.slice(0, 12)}…</span>}
        </div>
        {s.recording_url
          ? <audio controls preload="none" className="w-full h-9" src={recordingSrc(s.id, adminKey)} />
          : <p className="text-[11px] text-gray-400">Recording not available yet.</p>}
      </div>

      {/* Tier-2 AI summary */}
      {ai && (
        <div className="rounded-xl border border-gray-100 p-4" style={{ backgroundColor: "#fafafa" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">AI screening (tier 2)</span>
            {rec && <Chip bg={rec.bg} fg={rec.fg}>{rec.label}</Chip>}
            {ai.confidence_score != null && (
              <span className="text-[11px] text-gray-400">conf {Math.round(ai.confidence_score * 100)}%</span>
            )}
          </div>
          {ai.summary && <p className="text-sm text-gray-700 leading-relaxed mb-3">{ai.summary}</p>}
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {(ai.strengths ?? []).length > 0 && (
              <div><p className="text-[11px] font-bold text-emerald-700 uppercase mb-0.5">Strengths</p>
                <ul className="list-disc list-inside text-xs text-gray-600">{ai.strengths!.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
            {(ai.concerns ?? []).length > 0 && (
              <div><p className="text-[11px] font-bold text-red-600 uppercase mb-0.5">Concerns</p>
                <ul className="list-disc list-inside text-xs text-gray-600">{ai.concerns!.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
          </div>
        </div>
      )}

      {/* Structured answers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FIELDS.map(([label, k]) => (
          <div key={k}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="text-sm text-gray-800">{fmt(sr[k])}</p>
          </div>
        ))}
      </div>

      {/* Transcript */}
      {s.fc_transcript_messages?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Transcript</p>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {s.fc_transcript_messages.map((m, i) => (
              <div key={i} className={`flex ${m.speaker === "sarah" ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[80%] rounded-2xl px-3 py-1.5 text-sm"
                  style={m.speaker === "sarah"
                    ? { backgroundColor: GG_LIGHT, color: "#065f46" }
                    : { backgroundColor: "#f3f4f6", color: "#374151" }}>
                  <span className="block text-[10px] font-bold opacity-60">{m.speaker === "sarah" ? "Sarah" : "Candidate"}</span>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateRow({ c, adminKey }: { c: AdminCandidate; adminKey: string }) {
  const [open, setOpen] = useState(false);
  const name = `${c.first_name} ${c.last_name}`.trim() || c.email;
  const latest = c.fc_screening_sessions?.[0];
  const rec = latest?.fc_ai_summaries?.[0]?.recommendation;
  const recS = rec ? REC_STYLE[rec] : null;
  const bandS = c.prequal_band ? BAND_STYLE[c.prequal_band] : null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
          <p className="text-xs text-gray-400 truncate">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
        </div>
        {c.prequal_score != null && bandS && (
          <Chip bg={bandS.bg} fg={bandS.fg}>Form {c.prequal_score}</Chip>
        )}
        {recS && <Chip bg={recS.bg} fg={recS.fg}>{recS.label}</Chip>}
        <span className="text-[11px] text-gray-400 hidden sm:inline">{c.current_status}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Tier-1 prequal */}
          {c.fc_prequal_responses?.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pre-qual form (tier 1)</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {c.fc_prequal_responses.map((r, i) => (
                  <span key={i} className="text-xs text-gray-600"><b className="text-gray-800">{r.question}:</b> {r.answer}</span>
                ))}
              </div>
            </div>
          )}
          {c.fc_screening_sessions?.length
            ? c.fc_screening_sessions.map(s => <SessionDetail key={s.id} s={s} adminKey={adminKey} />)
            : <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Phone size={12} /> No screening call yet.</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [key, setKey] = useState<string>(() => sessionStorage.getItem(KEY_STORE) ?? "");
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(k: string) {
    setLoading(true); setError("");
    try {
      const data = await fetchAdminDashboard(k);
      setCandidates(data); setAuthed(true);
      sessionStorage.setItem(KEY_STORE, k); setKey(k);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setAuthed(false);
      if (e instanceof Error && e.message === "Wrong password") sessionStorage.removeItem(KEY_STORE);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (key) load(key); /* eslint-disable-next-line */ }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: GG_LIGHT }}>
            <Lock size={20} style={{ color: GG }} />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">FineClean · Recruiter dashboard</h1>
          <p className="text-sm text-gray-500 mb-5">Enter the dashboard password to continue.</p>
          <form onSubmit={e => { e.preventDefault(); load(input); }}>
            <input
              type="password" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Password" autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 mb-3"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button type="submit" disabled={loading || !input}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: GG }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Checking…</> : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const withCalls = candidates.filter(c => c.fc_screening_sessions?.length).length;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-xs">FC</span>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-sm leading-tight">FineClean · Recruiter dashboard</h1>
            <p className="text-[11px] text-gray-400">{candidates.length} candidates · {withCalls} screened</p>
          </div>
          <button onClick={() => load(key)} className="text-gray-400 hover:text-gray-700 p-2" title="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { sessionStorage.removeItem(KEY_STORE); setAuthed(false); setKey(""); setInput(""); }}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700">Lock</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-2.5">
        {candidates.length === 0 && <p className="text-sm text-gray-400 text-center py-10">No candidates yet.</p>}
        {candidates.map(c => <CandidateRow key={c.id} c={c} adminKey={key} />)}
      </div>
    </div>
  );
}
