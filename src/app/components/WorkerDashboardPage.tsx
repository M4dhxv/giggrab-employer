import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Check, Search, X, ChevronDown, Star } from 'lucide-react';
import { WorkerHeader } from './WorkerLandingPage';

/*
  WorkerDashboardPage — Frank's dashboard layout, our mock data.
  Two tabs: My profile | Jobs.
  Jobs tab: search + filter pill rows + Frank-style job cards.
*/

type Tab = 'profile' | 'jobs';
type LocationFilter = 'all' | 'near' | 'remote';
type TypeFilter = 'all' | 'fulltime' | 'parttime' | 'nights';
type TimeFilter = 'any' | '7' | '30';
type ViewFilter = 'all' | 'applied';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  pay: string;
  shift: string;
  source: 'giggrab' | 'external';
  matchPct: number;
  why: string;
  description: string;
  mustHaves: string[];
  tags: LocationFilter[];
  typeTag: TypeFilter[];
};

const JOBS: Job[] = [
  {
    id: 'j1', title: 'Forklift Driver (Counterbalance)', company: 'Kuehne+Nagel',
    location: 'Trafford Park, Manchester', pay: '£13.50–£15/hr', shift: 'Nights · Full-time',
    source: 'giggrab', matchPct: 96,
    why: 'Exact trade + valid counterbalance licence, 8 min from you, nights you said you prefer.',
    description: 'Operating counterbalance forklifts in a busy distribution centre. Nights team, permanent contract, overtime available.',
    mustHaves: ['Valid counterbalance licence', 'Steel-toe boots'],
    tags: ['near'], typeTag: ['fulltime', 'nights'],
  },
  {
    id: 'j2', title: 'Warehouse Operative', company: 'DHL Supply Chain',
    location: 'Salford, Manchester', pay: '£12.80/hr', shift: 'Rotating · Full-time',
    source: 'external', matchPct: 91,
    why: 'Same role as your last job at DHL — picking & loading experience maps directly.',
    description: 'Picking, packing, and loading in a temperature-controlled warehouse. Rotating shifts, permanent role.',
    mustHaves: ['Warehouse experience', 'Reliable attendance'],
    tags: ['near'], typeTag: ['fulltime'],
  },
  {
    id: 'j3', title: 'Reach Truck Driver', company: 'XPO Logistics',
    location: 'Trafford Park, Manchester', pay: '£14/hr', shift: 'Days · Full-time',
    source: 'giggrab', matchPct: 88,
    why: 'You drove reach trucks at XPO before — strong fit and pay above your stated floor.',
    description: 'Day shift reach truck driving in a high-bay warehouse. Permanent contract with pension.',
    mustHaves: ['Reach truck licence', 'MHE experience'],
    tags: ['near'], typeTag: ['fulltime'],
  },
  {
    id: 'j4', title: 'Night Shift Picker', company: 'Amazon Fulfilment',
    location: 'Haydock, St Helens', pay: '£13/hr', shift: 'Nights · Part-time',
    source: 'external', matchPct: 82,
    why: 'Night shift preference matched, consistent guaranteed hours, no zero-hours.',
    description: 'Part-time nights in a fulfilment centre. Fixed hours, weekly pay, no zero-hours contract.',
    mustHaves: ['Flexible nights availability'],
    tags: [], typeTag: ['parttime', 'nights'],
  },
  {
    id: 'j5', title: 'Goods-In Operative', company: 'The Hut Group',
    location: 'Warrington', pay: '£12.50/hr', shift: 'Weekends · Part-time',
    source: 'external', matchPct: 79,
    why: 'Within your travel range and weekend hours match your availability.',
    description: 'Receiving and checking inbound stock at a modern fulfilment centre. Weekend shifts, part-time.',
    mustHaves: [],
    tags: [], typeTag: ['parttime'],
  },
  {
    id: 'j6', title: 'Delivery Driver', company: 'Evri',
    location: 'Remote / Manchester routes', pay: '£14–£17/hr', shift: 'Flexible · Full-time',
    source: 'external', matchPct: 74,
    why: 'Flexible hours, pays above your floor, van provided. No forklift needed.',
    description: 'Parcel delivery driver on Manchester routes. Van provided, flexible start times, self-employed basis.',
    mustHaves: ['Full UK driving licence', 'Own phone'],
    tags: ['remote'], typeTag: ['fulltime'],
  },
];

const HOTLINE = '+44 20 4571 8822';

export default function WorkerDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('jobs');
  const [q, setQ] = useState('');
  const [locationFilter, setLocation] = useState<LocationFilter>('all');
  const [typeFilter, setType] = useState<TypeFilter>('all');
  const [timeFilter, setTime] = useState<TimeFilter>('any');
  const [viewFilter, setView] = useState<ViewFilter>('all');
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    let out = JOBS;
    if (viewFilter === 'applied') out = out.filter(j => applied.has(j.id));
    if (locationFilter !== 'all') out = out.filter(j => j.tags.includes(locationFilter));
    if (typeFilter !== 'all') out = out.filter(j => j.typeTag.includes(typeFilter));
    if (q.trim().length > 1) {
      const term = q.toLowerCase();
      out = out.filter(j =>
        j.title.toLowerCase().includes(term) ||
        j.company.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term)
      );
    }
    return out;
  }, [q, locationFilter, typeFilter, viewFilter, applied]);

  const apply = (id: string) => setApplied(prev => new Set([...prev, id]));
  const toggleSaved = (id: string) => setSaved(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleExpanded = (id: string) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleScore = (id: string) => setScores(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const modeBanner = (() => {
    if (viewFilter === 'applied') return { text: `${list.length} application${list.length !== 1 ? 's' : ''}`, tone: 'green' };
    if (q.trim().length > 1 && list.length === 0) return { text: `No matches for "${q}" — try different terms`, tone: 'amber' };
    if (q.trim().length > 1) return { text: `${list.length} result${list.length !== 1 ? 's' : ''} for "${q}"`, tone: 'green' };
    if (locationFilter === 'near') return { text: `${list.length} role${list.length !== 1 ? 's' : ''} near Manchester — ranked for your profile`, tone: 'blue' };
    return { text: `${list.length} role${list.length !== 1 ? 's' : ''} — ranked for your profile`, tone: 'blue' };
  })();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, #f0fdf4 0%, #fff 45%)' }}>
      <WorkerHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 sm:py-14">
        <div className="mb-6 gg-in">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#059669]">Welcome back</p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-gray-900">Hi Marek — let's pick up where you left off.</h1>
        </div>

        {/* Tab switcher */}
        <div className="mb-7 inline-flex rounded-xl border border-gray-200 p-1 bg-white">
          <TabBtn active={tab === 'profile'} onClick={() => setTab('profile')}>My profile</TabBtn>
          <TabBtn active={tab === 'jobs'} onClick={() => setTab('jobs')}>Jobs</TabBtn>
        </div>

        {tab === 'profile' && <ProfileTab navigate={navigate} />}
        {tab === 'jobs' && (
          <div className="gg-in">
            {/* Hotline nudge banner */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-emerald-50 p-3.5">
              <p className="text-sm text-gray-700 m-0">
                <strong>Prefer to talk?</strong> Call Sarah and she'll apply to any role on your behalf.
              </p>
              <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#10b981] px-3 text-xs font-bold text-white">
                <Phone className="w-3.5 h-3.5" /> {HOTLINE}
              </a>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search by title, company or location…"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#10b981] transition-all"
              />
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              {q && (
                <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Filter pill rows */}
            <div className="mb-4 -mx-1 flex flex-wrap gap-y-2 gap-x-2 overflow-x-auto px-1 pb-1">
              <PillGroup
                value={locationFilter}
                onChange={v => setLocation(v as LocationFilter)}
                options={[{ v: 'all', l: 'Any location' }, { v: 'near', l: '📍 Near me' }, { v: 'remote', l: '🌐 Remote' }]}
              />
              <PillGroup
                value={typeFilter}
                onChange={v => setType(v as TypeFilter)}
                options={[{ v: 'all', l: 'All hours' }, { v: 'fulltime', l: 'Full-time' }, { v: 'parttime', l: 'Part-time' }, { v: 'nights', l: '🌙 Nights' }]}
              />
              <PillGroup
                value={timeFilter}
                onChange={v => setTime(v as TimeFilter)}
                options={[{ v: 'any', l: 'Any time' }, { v: '7', l: 'Last 7 days' }, { v: '30', l: 'Last 30 days' }]}
              />
              <PillGroup
                value={viewFilter}
                onChange={v => setView(v as ViewFilter)}
                options={[{ v: 'all', l: 'All' }, { v: 'applied', l: '✓ Applied' }]}
              />
            </div>

            {/* Mode banner */}
            {list.length > 0 && (
              <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${modeBanner.tone === 'amber' ? 'bg-amber-50 text-amber-800' : modeBanner.tone === 'blue' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>
                {modeBanner.text}
              </div>
            )}

            {/* Job cards */}
            {list.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-sm text-gray-500">
                  {viewFilter === 'applied' ? "You haven't applied to any roles yet." : `No roles match the current filters.`}
                </p>
                <button onClick={() => { setQ(''); setLocation('all'); setType('all'); setView('all'); }} className="mt-4 text-xs font-semibold text-[#059669] underline">
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map(job => {
                  const isApplied = applied.has(job.id);
                  const isSaved = saved.has(job.id);
                  const isExpanded = expanded.has(job.id);
                  const hasScore = scores.has(job.id);
                  return (
                    <article
                      key={job.id}
                      className="overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 gg-lift"
                      style={{ borderColor: isApplied ? '#a7f3d0' : '#e5e7eb', background: isApplied ? '#f0fdf4' : 'white' }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[17px] font-bold tracking-tight text-gray-900">{job.title}</h3>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{job.matchPct}% match</span>
                            {job.source === 'giggrab' && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">GigGrab</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600">{job.company}</p>
                          <p className="mt-1.5 font-mono text-xs text-gray-400" style={{ letterSpacing: '0.04em' }}>
                            {[job.location, job.pay, job.shift, `via ${job.source}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                          <button onClick={() => toggleSaved(job.id)} aria-label="Save" className={`grid h-10 w-10 place-items-center rounded-lg border transition-all ${isSaved ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                            <Star className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                          </button>
                          {isApplied ? (
                            <span className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold text-white sm:flex-initial" style={{ background: '#059669' }}>
                              <Check className="w-3.5 h-3.5" /> Applied
                            </span>
                          ) : (
                            <button onClick={() => apply(job.id)} className="inline-flex h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold text-white sm:flex-initial" style={{ background: '#10b981' }}>
                              Apply
                            </button>
                          )}
                          <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 sm:flex-initial">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <button onClick={() => toggleExpanded(job.id)} className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 sm:flex-initial">
                            {isExpanded ? 'Hide' : 'View details'} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {!hasScore && (
                            <button onClick={() => toggleScore(job.id)} className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 sm:flex-initial">
                              Match score
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Match score */}
                      {hasScore && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-emerald-100 bg-white p-4 gg-in">
                          <div className="flex items-center gap-3 flex-wrap justify-between">
                            <div className="flex items-center gap-3">
                              <ScoreRing value={job.matchPct} size={56} />
                              <div>
                                <p className="font-mono text-[10px] font-semibold uppercase text-gray-400 tracking-wider">Match score</p>
                                <p className="text-sm text-gray-700 leading-snug">{job.why}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3 max-w-xs">
                            <ScoreRing value={Math.max(job.matchPct - 4, 60)} size={44} label="Experience" />
                            <ScoreRing value={Math.max(job.matchPct - 8, 55)} size={44} label="Skills" />
                            <ScoreRing value={Math.max(job.matchPct - 12, 50)} size={44} label="Industry" />
                          </div>
                        </div>
                      )}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 space-y-4 text-sm gg-in">
                          <DetailRow label="Role" value={job.description} />
                          {job.mustHaves.length > 0 && (
                            <div>
                              <p className="font-mono text-[10px] font-semibold uppercase text-gray-400 tracking-wider mb-1.5">Must-haves</p>
                              <div className="flex flex-wrap gap-1.5">
                                {job.mustHaves.map(m => (
                                  <span key={m} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">{m}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Applied confirmation */}
                      {isApplied && (
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-900 gg-in">
                          <strong>Application logged.</strong> We'll call you when {job.company} responds.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="max-w-2xl gg-in">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Marek Kowalski</h2>
            <p className="mt-0.5 text-sm text-gray-600">Forklift Driver / Warehouse Operative · 6 years · Manchester, UK</p>
          </div>
          <button onClick={() => navigate('/worker/profile')} className="text-sm font-semibold text-[#059669] hover:text-[#047857]">Edit →</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <CvSection heading="Profile">
            <p className="text-sm leading-relaxed text-gray-800">Experienced warehouse operative and counterbalance forklift driver with 6 years in fast-paced logistics. Reliable, flexible on shifts, looking for steady permanent work in or around Manchester.</p>
          </CvSection>
          <CvSection heading="Credentials">
            <div className="flex flex-wrap gap-2">
              {['Counterbalance forklift licence', 'CSCS card'].map(c => (
                <span key={c} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{c}</span>
              ))}
            </div>
          </CvSection>
          <div className="grid grid-cols-2 gap-4">
            <CvSection heading="Availability"><p className="text-sm text-gray-800">Available now · nights & weekends OK</p></CvSection>
            <CvSection heading="Pay expectation"><p className="text-sm text-gray-800">~£13/hr (more for nights)</p></CvSection>
          </div>
          <CvSection heading="Languages">
            <div className="flex gap-2 flex-wrap">
              {['English', 'Polish'].map(l => <span key={l} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">{l}</span>)}
            </div>
          </CvSection>
          <CvSection heading="Recent work">
            <div className="space-y-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">Warehouse Operative — DHL</p>
                <p className="text-xs text-gray-500">2023 – 2025 · Picking, loading & counterbalance forklift in a high-volume distribution centre.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Forklift Driver — XPO Logistics</p>
                <p className="text-xs text-gray-500">2019 – 2023 · Reach truck and counterbalance, inbound goods and stock replenishment.</p>
              </div>
            </div>
          </CvSection>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={() => navigate('/worker/start')} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
            🔁 Call again
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
            ↑ Upload CV
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-lg px-5 py-2 text-sm font-semibold transition-all" style={{ background: active ? 'white' : 'transparent', color: active ? '#0f172a' : '#6b7280', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : undefined }}>
      {children}
    </button>
  );
}

function PillGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="inline-flex flex-shrink-0 whitespace-nowrap rounded-xl border border-gray-200 p-0.5 bg-white">
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all" style={{ background: o.v === value ? 'white' : 'transparent', color: o.v === value ? '#0f172a' : '#6b7280', boxShadow: o.v === value ? '0 1px 3px rgba(0,0,0,0.06)' : undefined }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function ScoreRing({ value, size = 44, label }: { value: number; size?: number; label?: string }) {
  const stroke = size <= 50 ? 4 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const dash = (c * v) / 100;
  const color = v >= 70 ? '#059669' : v >= 40 ? '#D97706' : '#9CA3AF';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-bold" style={{ color: '#0f172a', fontSize: size <= 50 ? 11 : 14 }}>{v}%</span>
      </div>
      {label && <p className="mt-1 text-[10px] font-semibold uppercase text-gray-400" style={{ letterSpacing: '0.1em' }}>{label}</p>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase text-gray-400 tracking-wider">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">{value}</p>
    </div>
  );
}

function CvSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{heading}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}
