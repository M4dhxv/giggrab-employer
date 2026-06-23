import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Plus, Trash2, Edit2, X, GripVertical } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

type Question = { id: string; text: string; weight: number };

const DEFAULT_T1: Question[] = [
  { id: "t1-1", text: "Do you have warehouse or logistics experience?",      weight: 20 },
  { id: "t1-2", text: "Can you lift up to 25kg regularly?",                 weight: 20 },
  { id: "t1-3", text: "Are you available to start within 2 weeks?",         weight: 20 },
  { id: "t1-4", text: "Do you have the right to work in the UK?",           weight: 20 },
  { id: "t1-5", text: "Can you work days, lates, and weekends?",            weight: 20 },
];

const DEFAULT_T2: Question[] = [
  { id: "t2-1", text: "Describe a typical shift and the heaviest item you've handled regularly.",       weight: 0 },
  { id: "t2-2", text: "Tell me about a time you worked to a tight deadline in a physical role.",        weight: 0 },
];

function QuestionRow({
  q, tier, onEdit, onDelete,
}: {
  q: Question; tier: 1 | 2;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(q.text);

  function save() {
    if (draft.trim()) onEdit(q.id, draft.trim());
    setEditing(false);
  }

  return (
    <div className="group flex gap-3 items-start p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
      <GripVertical size={14} className="text-gray-300 mt-1 flex-shrink-0 cursor-grab" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              style={{ borderColor: GG }}
            />
            <button onClick={save}
              className="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: GG }}>Save</button>
            <button onClick={() => setEditing(false)}
              className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-snug">{q.text}</p>
        )}
        {tier === 1 && !editing && (
          <p className="text-[10px] text-gray-400 mt-1">{q.weight}% of suitability score</p>
        )}
      </div>
      {!editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setDraft(q.text); setEditing(true); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(q.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function AddQuestion({ onAdd }: { onAdd: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function submit() {
    if (text.trim()) { onAdd(text.trim()); setText(""); setOpen(false); }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 w-full transition-colors">
      <Plus size={14} /> Add question
    </button>
  );

  return (
    <div className="flex gap-2 p-3 rounded-xl border border-gray-200 bg-white" style={{ borderColor: GG }}>
      <input
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
        placeholder="Type your question..."
        className="flex-1 text-sm focus:outline-none text-gray-700 placeholder-gray-300"
      />
      <button onClick={submit}
        className="px-3 py-1 rounded-lg text-white text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: GG }}>Add</button>
      <button onClick={() => setOpen(false)}
        className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  );
}

export default function ScreeningQuestionsPage() {
  const navigate = useNavigate();
  const [t1, setT1] = useState<Question[]>(DEFAULT_T1);
  const [t2, setT2] = useState<Question[]>(DEFAULT_T2);
  const [threshold, setThreshold] = useState(70);

  function recalcWeights(qs: Question[]): Question[] {
    if (qs.length === 0) return [];
    const w = Math.round(100 / qs.length);
    const rem = 100 - w * (qs.length - 1);
    return qs.map((q, i) => ({ ...q, weight: i === qs.length - 1 ? rem : w }));
  }

  function editQ(tier: 1 | 2, id: string, text: string) {
    if (tier === 1) setT1(prev => prev.map(q => q.id === id ? { ...q, text } : q));
    else setT2(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  }

  function deleteQ(tier: 1 | 2, id: string) {
    if (tier === 1) setT1(prev => recalcWeights(prev.filter(q => q.id !== id)));
    else setT2(prev => prev.filter(q => q.id !== id));
  }

  function addQ(tier: 1 | 2, text: string) {
    const id = `${tier === 1 ? "t1" : "t2"}-${Date.now()}`;
    if (tier === 1) setT1(prev => recalcWeights([...prev, { id, text, weight: 0 }]));
    else setT2(prev => [...prev, { id, text, weight: 0 }]);
  }

  const totalWeight = t1.reduce((s, q) => s + q.weight, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-4 border-b border-gray-100 bg-white">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Review your screening questions</h1>
          <p className="text-sm text-gray-500 mt-1">Sarah will use these on every candidate call. Edit, add, or remove before going live.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-1">
            <p className="text-xs text-gray-500 mb-1">Tier 1 questions</p>
            <p className="text-2xl font-bold text-gray-900">{t1.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-1">
            <p className="text-xs text-gray-500 mb-1">Tier 2 questions</p>
            <p className="text-2xl font-bold text-gray-900">{t2.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-1">
            <p className="text-xs text-gray-500 mb-1">Shortlist threshold</p>
            <p className="text-2xl font-bold" style={{ color: GG }}>{threshold}%</p>
          </div>
        </div>

        {/* Tier 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-gray-900">Tier 1 — Qualifying questions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Yes / No questions. Each yes answer contributes to the suitability score.</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: GG_LIGHT, color: GG }}>
              {totalWeight}% total
            </span>
          </div>

          {/* Score visualiser */}
          <div className="mt-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: GG_LIGHT }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: GG }}>Suitability score model</p>
              <p className="text-xs" style={{ color: GG }}>Shortlist at {threshold}%+</p>
            </div>
            <div className="flex gap-1 h-4 rounded-lg overflow-hidden">
              {t1.map((q, i) => (
                <div key={q.id} className="flex-1 flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${155 + i * 8}, 45%, ${50 - i * 3}%)` }}>
                  <span className="text-[8px] text-white font-bold">{q.weight}%</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {t1.map((q) => (
                <span key={q.id} className="text-[9px] text-gray-500 truncate max-w-[140px]">
                  {q.text.split(" ").slice(0, 4).join(" ")}...
                </span>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600">Shortlist threshold</p>
                <p className="text-xs font-bold" style={{ color: GG }}>{threshold}%</p>
              </div>
              <input type="range" min={40} max={90} step={5} value={threshold}
                onChange={e => setThreshold(+e.target.value)}
                className="w-full" style={{ accentColor: GG }} />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>40% (broad)</span><span>90% (strict)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {t1.map(q => (
              <QuestionRow key={q.id} q={q} tier={1}
                onEdit={(id, text) => editQ(1, id, text)}
                onDelete={(id) => deleteQ(1, id)} />
            ))}
            <AddQuestion onAdd={(text) => addQ(1, text)} />
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-900">Tier 2 — Context questions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Follow-up questions asked to candidates who clear the Tier 1 threshold. Answers appear in transcripts and summaries — not scored.
            </p>
          </div>
          <div className="space-y-2">
            {t2.map(q => (
              <QuestionRow key={q.id} q={q} tier={2}
                onEdit={(id, text) => editQ(2, id, text)}
                onDelete={(id) => deleteQ(2, id)} />
            ))}
            <AddQuestion onAdd={(text) => addQ(2, text)} />
          </div>
        </div>

        <button onClick={() => navigate("/service")}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-base"
          style={{ backgroundColor: GG }}>
          Confirm and continue
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">You can update screening questions any time from Settings.</p>
      </div>
    </div>
  );
}
