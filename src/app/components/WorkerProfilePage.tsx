import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Phone, Download, ArrowRight, RefreshCw, PhoneIncoming, FileText } from 'lucide-react';
import { WorkerHeader } from './WorkerLandingPage';

/*
  WorkerProfilePage — post-call review. Two panes:
  Left: the conversation, with an input to add or correct anything.
  Right: the rendered CV that updates as you edit.
  CTAs: Call again / See matches. Mock — edits append locally.
*/

type Turn = { speaker: 'Sarah' | 'You'; text: string };

const INITIAL_TURNS: Turn[] = [
  { speaker: 'Sarah', text: "All done, Marek! Here's your profile. Add or correct anything below and your CV updates instantly." },
  { speaker: 'You', text: "Forklift driver, 6 years, based in Manchester." },
  { speaker: 'Sarah', text: "Got it. I also noted your counterbalance licence and CSCS card." },
];

const PROFILE = {
  name: 'Marek Kowalski',
  title: 'Forklift Driver / Warehouse Operative',
  years: '6 years',
  location: 'Manchester, UK',
  languages: ['English', 'Polish'],
  summary:
    'Experienced warehouse operative and counterbalance forklift driver with 6 years in fast-paced logistics. Reliable, flexible on shifts, and looking for steady, permanent work in or around Manchester.',
  credentials: ['Counterbalance forklift licence', 'CSCS card'],
  rightToWork: 'Settled status — full right to work in the UK',
  availability: 'Available now · nights & weekends OK',
  pay: '~£13/hr (more for nights)',
  projects: [
    { role: 'Warehouse Operative', company: 'DHL', period: '2023 – 2025', desc: 'Picking, loading and counterbalance forklift driving in a high-volume distribution centre.' },
    { role: 'Forklift Driver', company: 'XPO Logistics', period: '2019 – 2023', desc: 'Reach truck and counterbalance, inbound goods and stock replenishment.' },
  ],
};

export default function WorkerProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCvUpload = searchParams.get('via') === 'cv';
  const [turns, setTurns] = useState<Turn[]>(INITIAL_TURNS);
  const [extras, setExtras] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTurns(prev => [...prev, { speaker: 'You', text }]);
    setExtras(prev => [...prev, text]);
    setDraft('');
    setTimeout(() => {
      setTurns(prev => [...prev, { speaker: 'Sarah', text: 'Updated — added that to your profile. ✓' }]);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <WorkerHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6 flex items-center justify-between gg-in">
          <div>
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Your profile</h1>
          </div>
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10b981] hover:bg-[#059669] px-5 py-2.5 text-sm font-bold text-white transition-all"
          >
            See matches <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isCvUpload && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 gg-in">
            <FileText className="w-4 h-4 text-[#059669] shrink-0" />
            <p className="text-sm text-emerald-900">
              <strong>Profile extracted from your CV</strong> · Structured by Sarah AI · Add anything missing below
            </p>
          </div>
        )}

        <div className={`grid gap-6 ${isCvUpload ? '' : 'lg:grid-cols-2'}`} style={{ minHeight: 560 }}>
          {/* Conversation pane — only for phone-call users */}
          {!isCvUpload && (
          <section className="flex flex-col rounded-2xl border border-gray-200 bg-white gg-in gg-d1">
            <header className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Conversation</h2>
              <p className="mt-0.5 text-xs text-gray-500">Add or correct anything — your CV updates automatically.</p>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5 max-h-[440px]">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.speaker === 'Sarah' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${t.speaker === 'Sarah' ? 'bg-gray-100 text-gray-900' : 'bg-[#10b981] text-white'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="border-t border-gray-100 p-3">
              <div className="flex items-end gap-2">
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Add or correct anything…"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <button type="submit" disabled={!draft.trim()} className="rounded-lg bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-300 px-4 py-2.5 text-sm font-semibold text-white transition-all">
                  Send
                </button>
              </div>
            </form>
          </section>
          )}

          {/* CV preview pane */}
          <section className="flex flex-col rounded-2xl border border-gray-200 bg-white gg-in gg-d2">
            <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">CV preview</h2>
              <button className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669] hover:text-[#047857]">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </header>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 max-h-[480px]">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{PROFILE.name}</h3>
                <p className="mt-1 text-sm text-gray-700">{PROFILE.title} · {PROFILE.years}</p>
                <p className="text-sm text-gray-500">{PROFILE.location}</p>
              </div>

              <CvSection heading="Profile">
                <p className="text-sm leading-relaxed text-gray-800">{PROFILE.summary}</p>
              </CvSection>

              <CvSection heading="Credentials">
                <div className="flex flex-wrap gap-2">
                  {PROFILE.credentials.map(c => (
                    <span key={c} className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[12.5px] font-semibold text-emerald-800">{c}</span>
                  ))}
                </div>
              </CvSection>

              <div className="grid grid-cols-2 gap-4">
                <CvSection heading="Availability"><p className="text-sm text-gray-800">{PROFILE.availability}</p></CvSection>
                <CvSection heading="Pay expectation"><p className="text-sm text-gray-800">{PROFILE.pay}</p></CvSection>
              </div>

              <CvSection heading="Languages">
                <ul className="flex flex-wrap gap-2">
                  {PROFILE.languages.map(l => (
                    <li key={l} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-[12.5px] font-medium text-gray-700">{l}</li>
                  ))}
                </ul>
              </CvSection>

              <CvSection heading="Right to work">
                <p className="text-sm text-gray-800">{PROFILE.rightToWork}</p>
              </CvSection>

              <CvSection heading="Recent work">
                <div className="space-y-3">
                  {PROFILE.projects.map((p, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-gray-900">{p.role} — {p.company}</p>
                      <p className="text-xs text-gray-500">{p.period}</p>
                      <p className="mt-1 text-sm text-gray-700">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </CvSection>

              {extras.length > 0 && (
                <CvSection heading="Added by you">
                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
                    {extras.map((x, i) => <li key={i} className="gg-in">{x}</li>)}
                  </ul>
                </CvSection>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 gg-in">
          {isCvUpload ? (
            <button onClick={() => navigate('/worker/start')} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:border-emerald-300 transition-all">
              <PhoneIncoming className="w-4 h-4" /> Request a callback from Sarah to update CV
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/worker/start')} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-all">
                <RefreshCw className="w-4 h-4" /> Call again
              </button>
              <a href="tel:+442045718822" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-all">
                <Phone className="w-4 h-4" /> Talk to Sarah
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CvSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{heading}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}
