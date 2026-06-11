import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, Check, HardHat, Package, Factory, Truck,
  Heart, UtensilsCrossed, ShoppingBag, Link2, Megaphone, PhoneCall,
  ClipboardCheck, UserCheck, Bot, MessageSquare, Mic,
} from 'lucide-react';

/*
  GigGrab — LandingPage

  Defaults: "Start hiring" navigates to /post-job. Override via props:
    <LandingPage onStartHiring={() => navigate('/somewhere-else')} />
*/

const CSS = `
.gg{--em:#10b981;--em-d:#059669;--em-tint:#f0fdf4;--em-border:#a7f3d0;
  --gray-900:#0f172a;--gray-600:#4b5563;--gray-500:#6b7280;--gray-400:#9ca3af;
  --line:#e5e7eb;--line-2:#f3f4f6;--blue:#2563eb;
  font-family:'Inter',sans-serif;background:#fff;color:var(--gray-900);
  -webkit-font-smoothing:antialiased;min-height:100vh;
  font-feature-settings:"tnum" 1,"cv01" 1;}
.gg *{box-sizing:border-box;margin:0;padding:0}
.gg .wrap{max-width:1200px;margin:0 auto;padding:0 24px}

.gg header{border-bottom:1px solid var(--line-2);position:sticky;top:0;
  background:rgba(255,255,255,.85);backdrop-filter:blur(8px);z-index:50}
.gg .nav{display:flex;align-items:center;justify-content:space-between;padding:14px 0}
.gg .nav-l{display:flex;align-items:center;gap:36px}
.gg .logo{font-size:1.2rem;font-weight:800;color:var(--em);letter-spacing:-.01em}
.gg .links{display:flex;gap:2px}
.gg .links button{background:none;border:none;font-family:inherit;font-size:.875rem;font-weight:500;
  color:var(--gray-500);padding:6px 12px;border-radius:6px;cursor:pointer;transition:.15s}
.gg .links button:hover{color:var(--gray-900);background:#f9fafb}
.gg .login{background:none;border:none;font-family:inherit;font-size:.875rem;font-weight:500;
  color:var(--gray-600);padding:6px 12px;border-radius:6px;cursor:pointer}
.gg .login:hover{background:#f9fafb}
@media(max-width:820px){.gg .links{display:none}}

/* hero split */
.gg .hero{padding:clamp(40px,7vh,76px) 0}
.gg .hgrid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
@media(max-width:900px){.gg .hgrid{grid-template-columns:1fr;gap:40px}}

.gg .kicker{display:inline-flex;align-items:center;gap:8px;font-size:.74rem;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--em-d);margin-bottom:20px}
.gg .kicker .d{width:6px;height:6px;border-radius:50%;background:var(--em);position:relative}
.gg .kicker .d::after{content:"";position:absolute;inset:-4px;border-radius:50%;
  border:1.5px solid var(--em);animation:ggring 2s infinite}
.gg h1{font-size:clamp(2.6rem,5vw,3.8rem);font-weight:800;line-height:1.06;
  letter-spacing:-.035em;color:var(--gray-900)}
.gg h1 .g{color:var(--em)}
.gg .sub{font-size:1.05rem;line-height:1.6;color:var(--gray-500);max-width:440px;margin-top:22px}
.gg .sub b{color:var(--gray-900);font-weight:600}
.gg .cta-row{display:flex;align-items:center;gap:16px;margin-top:32px;flex-wrap:wrap}
.gg .cta{display:inline-flex;align-items:center;gap:10px;background:var(--em);color:#fff;border:none;
  font-family:inherit;font-size:.95rem;font-weight:700;padding:15px 28px;border-radius:13px;cursor:pointer;
  transition:.18s;box-shadow:0 12px 28px -10px rgba(16,185,129,.5)}
.gg .cta:hover{background:var(--em-d);transform:translateY(-1px)}
.gg .cta svg{transition:transform .18s}.gg .cta:hover svg{transform:translateX(3px)}
.gg .ghost{display:inline-flex;align-items:center;gap:9px;font-size:.92rem;font-weight:600;
  color:var(--gray-600);text-decoration:none;cursor:pointer;background:none;border:none;font-family:inherit;transition:.15s}
.gg .ghost:hover{color:var(--gray-900)}
.gg .ghost .pl{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);display:grid;
  place-items:center;color:var(--em)}
.gg .trust{margin-top:22px;font-size:.82rem;font-weight:500;color:var(--gray-400)}

/* right: odometer */
.gg .stage{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.gg .odo{display:inline-flex;align-items:flex-end;font-weight:800;letter-spacing:-.04em;
  font-size:clamp(4.4rem,11vw,8rem);line-height:.9;color:var(--gray-900)}
.gg .digit{position:relative;height:1em;overflow:hidden;width:.6em}
.gg .reel{display:flex;flex-direction:column;will-change:transform;
  transition:transform .62s cubic-bezier(.22,1,.36,1)}
.gg .reel .n{height:1em;display:flex;align-items:center;justify-content:center}
.gg .comma{width:.26em;display:flex;align-items:flex-end;justify-content:center;color:var(--gray-900)}
.gg .label{margin-top:16px;font-size:1.02rem;font-weight:500;color:var(--gray-500)}
.gg .label b{color:var(--gray-900);font-weight:600}
.gg .activity{margin-top:22px;height:24px;display:flex;align-items:center;justify-content:center;gap:10px}
.gg .activity .adot{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:background .3s;background:var(--em)}
.gg .activity .atxt{font-size:.92rem;font-weight:500;color:var(--gray-600);transition:opacity .3s;white-space:nowrap}

/* industries */
.gg .sec{border-top:1px solid var(--line-2)}
.gg .ind{padding:34px 0}
.gg .ind-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:40px}
.gg .ind-item{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--gray-400)}
.gg .ind-item .ibox{width:44px;height:44px;border-radius:12px;background:#f9fafb;border:1px solid var(--line);
  display:grid;place-items:center}
.gg .ind-item span{font-size:.72rem;font-weight:500}

/* product story */
.gg .how{padding:76px 0}
.gg .how h2{text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:10px;letter-spacing:-.02em}
.gg .how .hsub{text-align:center;font-size:1rem;color:var(--gray-500);margin-bottom:44px}
.gg .sgrid{display:grid;grid-template-columns:340px 1fr;gap:40px;align-items:stretch}
@media(max-width:860px){.gg .sgrid{grid-template-columns:1fr}}
.gg .stp{display:flex;gap:14px;padding:14px 16px;border-radius:14px;cursor:pointer;border:1px solid transparent;
  background:none;font-family:inherit;text-align:left;width:100%;transition:.2s;position:relative;overflow:hidden}
.gg .stp+.stp{margin-top:6px}
.gg .stp:hover{background:#f9fafb}
.gg .stp.on{background:#fff;border-color:var(--em-border);box-shadow:0 8px 24px -14px rgba(16,185,129,.35)}
.gg .stp .sico{width:38px;height:38px;border-radius:11px;background:#f3f4f6;color:var(--gray-400);
  display:grid;place-items:center;flex-shrink:0;transition:.2s}
.gg .stp.on .sico{background:var(--em-tint);color:var(--em);border:1px solid var(--em-border)}
.gg .stp h3{font-size:.9rem;font-weight:600;color:var(--gray-600)}
.gg .stp.on h3{color:var(--gray-900)}
.gg .stp p{font-size:.8rem;color:var(--gray-400);line-height:1.45;margin-top:3px}
.gg .stp .sprog{position:absolute;left:0;bottom:0;height:2px;background:var(--em);width:0}
.gg .stp.on .sprog{animation:ggprog var(--dur) linear forwards}
@keyframes ggprog{from{width:0}to{width:100%}}

/* demo viewport */
.gg .demo{background:linear-gradient(180deg,#fafafa,#fff);border:1px solid var(--line);border-radius:20px;
  padding:28px;min-height:340px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.gg .demo .dhead{display:flex;align-items:center;gap:8px;margin-bottom:18px}
.gg .demo .dhead .sav{width:26px;height:26px;border-radius:50%;background:var(--em);display:grid;place-items:center;color:#fff}
.gg .demo .dhead span{font-size:.8rem;font-weight:600;color:var(--gray-600)}
.gg .demo .dhead .live{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:.7rem;
  font-weight:700;color:var(--em-d);text-transform:uppercase;letter-spacing:.06em}
.gg .demo .dhead .live::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--em);animation:ggblink 1.4s infinite}
@keyframes ggblink{0%,100%{opacity:1}50%{opacity:.25}}
.gg .dcard{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px;
  animation:ggrise .45s cubic-bezier(.22,1,.36,1) both}
.gg .dcard+.dcard{margin-top:10px}
@keyframes ggrise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ggpop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.gg .durl{display:flex;align-items:center;gap:10px;font-size:.85rem;color:var(--gray-600)}
.gg .durl .dom{color:var(--gray-400);font-size:.78rem;overflow:hidden;white-space:nowrap}
.gg .dok{display:inline-flex;align-items:center;gap:7px;font-size:.82rem;font-weight:600;color:var(--em-d)}
.gg .dok .tick{width:18px;height:18px;border-radius:50%;background:var(--em);color:#fff;display:grid;place-items:center;animation:ggpop .3s both}
.gg .drow{display:flex;align-items:center;gap:10px;font-size:.85rem;color:var(--gray-600)}
.gg .drow .ric{width:30px;height:30px;border-radius:9px;background:var(--em-tint);color:var(--em);
  border:1px solid var(--em-border);display:grid;place-items:center;flex-shrink:0}
.gg .drow b{font-weight:600;color:var(--gray-900)}
.gg .drow .rok{margin-left:auto;color:var(--em-d);display:flex;animation:ggpop .3s both}
.gg .avrow{display:flex;align-items:center;margin-top:14px}
.gg .av{width:34px;height:34px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;
  color:#fff;font-size:.72rem;font-weight:700;margin-left:-8px;animation:ggpop .35s both;flex-shrink:0}
.gg .avrow .av:first-child{margin-left:0}
.gg .avrow .more{margin-left:10px;font-size:.8rem;font-weight:600;color:var(--gray-500)}
.gg .pulse-ic{position:relative}
.gg .pulse-ic::after{content:"";position:absolute;inset:-4px;border-radius:12px;border:1.5px solid var(--em);animation:ggring 1.6s infinite}
.gg .score{margin-top:8px}
.gg .score .sl{display:flex;justify-content:space-between;font-size:.75rem;color:var(--gray-500);margin-bottom:5px}
.gg .score .sl b{color:var(--em-d);font-weight:700}
.gg .score .bar{height:7px;border-radius:99px;background:var(--line-2);overflow:hidden}
.gg .score .fill{height:100%;border-radius:99px;background:var(--em);width:0;animation:ggfill 1.6s .3s cubic-bezier(.22,1,.36,1) forwards}
@keyframes ggfill{to{width:var(--w)}}
.gg .bubble{font-size:.82rem;line-height:1.45;color:#374151;background:#f9fafb;border-radius:4px 14px 14px 14px;
  padding:9px 13px;max-width:88%}
.gg .bubble.me{background:var(--em-tint);border-radius:14px 4px 14px 14px;margin-left:auto}
.gg .qbadge{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;color:#15803d;
  background:var(--em-tint);border:1px solid var(--em-border);padding:3px 9px;border-radius:99px}

/* bottom cta */
.gg .band{padding:24px 0 56px}
.gg .band-in{background:var(--em);border-radius:20px;padding:44px 40px;display:flex;
  align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.gg .band-in h2{color:#fff;font-size:1.55rem;font-weight:700;margin-bottom:4px}
.gg .band-in p{color:#a7f3d0;font-size:1rem}
.gg .band-btns{display:flex;gap:12px;flex-shrink:0}
.gg .band-btns .primary{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--em-d);
  border:none;font-family:inherit;font-weight:700;font-size:.9rem;padding:12px 22px;border-radius:12px;cursor:pointer}
.gg .band-btns .secondary{display:inline-flex;align-items:center;background:none;color:#fff;cursor:pointer;
  border:1px solid rgba(255,255,255,.45);font-family:inherit;font-weight:500;font-size:.9rem;padding:12px 22px;border-radius:12px}

.gg footer{border-top:1px solid var(--line-2);padding:30px 0}
.gg .foot{display:flex;align-items:center;justify-content:space-between;gap:16px;
  font-size:.85rem;color:var(--gray-400);flex-wrap:wrap}

.gg button:focus-visible,.gg a:focus-visible{outline:2px solid var(--em);outline-offset:3px;border-radius:8px}
@keyframes ggring{0%{transform:scale(.7);opacity:1}100%{transform:scale(2.1);opacity:0}}
@media(prefers-reduced-motion:reduce){
  .gg *{animation:none!important}
  .gg .reel{transition:none!important}
  .gg .activity .atxt{transition:none!important}
}
`;

/* ── Odometer: imperative reel with clean upward wrap ── */
function Odometer({ value, start = 8412 }: { value: number; start?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef<{ digits: { reel: HTMLDivElement; cur: number }[]; len: number }>({ digits: [], len: 0 });

  function buildReel() {
    const reel = document.createElement('div');
    reel.className = 'reel';
    for (let i = 0; i <= 10; i++) {
      const n = document.createElement('div');
      n.className = 'n';
      n.textContent = String(i % 10);
      reel.appendChild(n);
    }
    return reel;
  }
  function buildStructure(str: string) {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    st.current.digits = [];
    for (const ch of str) {
      if (ch === ',') {
        const c = document.createElement('div');
        c.className = 'comma'; c.textContent = ',';
        el.appendChild(c);
      } else {
        const d = document.createElement('div');
        d.className = 'digit';
        const reel = buildReel();
        d.appendChild(reel);
        el.appendChild(d);
        const v = parseInt(ch, 10);
        st.current.digits.push({ reel, cur: v });
        reel.style.transition = 'none';
        reel.style.transform = `translateY(-${v}em)`;
      }
    }
    requestAnimationFrame(() => {
      st.current.digits.forEach((d) => { d.reel.style.transition = ''; });
    });
    st.current.len = str.length;
  }
  function setDigit(d: { reel: HTMLDivElement; cur: number }, v: number) {
    if (v === d.cur) return;
    if (v > d.cur) {
      d.reel.style.transform = `translateY(-${v}em)`;
      d.cur = v;
    } else {
      const reel = d.reel;
      reel.style.transform = 'translateY(-10em)';
      const onEnd = () => {
        reel.removeEventListener('transitionend', onEnd);
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0em)';
        void reel.offsetHeight;
        reel.style.transition = '';
        if (v > 0) requestAnimationFrame(() => { reel.style.transform = `translateY(-${v}em)`; });
      };
      reel.addEventListener('transitionend', onEnd);
      d.cur = v;
    }
  }
  function setNumber(n: number) {
    const str = n.toLocaleString('en-GB');
    const digCount = str.replace(/,/g, '').length;
    if (digCount !== st.current.digits.length) { buildStructure(str); return; }
    let di = 0;
    for (const ch of str) {
      if (ch === ',') continue;
      setDigit(st.current.digits[di], parseInt(ch, 10));
      di++;
    }
  }

  useEffect(() => { buildStructure(start.toLocaleString('en-GB')); /* eslint-disable-next-line */ }, []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setNumber(value);
    /* eslint-disable-next-line */
  }, [value]);

  return <div className="odo" ref={ref} aria-label="workers ready to start" />;
}

const BOROUGHS = ['Newham','Barking','Croydon','Wembley','Hounslow','Stratford','Greenwich','Enfield','Ealing'];
const ROLES = ['forklift driver','warehouse operative','picker / packer','CSCS labourer','kitchen porter','care assistant','HGV Class 2 driver','cleaner','machine operator'];
const pk = (a: string[]) => a[Math.floor(Math.random() * a.length)];

/* ── ProductStory: auto-playing pipeline showing Sarah working ── */

const STAGE_MS = 3600;

const STAGES = [
  { icon: <Link2 size={17} />, title: 'You paste a job', body: 'A link from Indeed, LinkedIn or your careers page is all Sarah needs.' },
  { icon: <Megaphone size={17} />, title: 'Sarah builds the campaign', body: 'Voice, SMS and WhatsApp outreach goes live across our worker network.' },
  { icon: <PhoneCall size={17} />, title: 'Workers engage', body: 'Workers call in or pick up. No applications, no forms — just conversations.' },
  { icon: <ClipboardCheck size={17} />, title: 'Sarah screens & qualifies', body: 'Experience, availability, certifications — checked by phone in 32 languages.' },
  { icon: <UserCheck size={17} />, title: 'Qualified workers delivered', body: 'Ready-to-interview candidates land in your dashboard. You review outcomes.' },
];

const AV = [
  { i: 'JT', c: '#10b981' }, { i: 'MS', c: '#6366f1' }, { i: 'AK', c: '#f59e0b' },
  { i: 'RO', c: '#14b8a6' }, { i: 'SM', c: '#8b5cf6' }, { i: 'JW', c: '#ec4899' },
];

function StoryDemo({ stage }: { stage: number }) {
  const d = (n: number) => ({ animationDelay: `${n}ms` } as React.CSSProperties);
  switch (stage) {
    case 0: return (
      <>
        <div className="dcard">
          <div className="durl">
            <Link2 size={15} color="#9ca3af" />
            <span className="dom">uk.indeed.com/viewjob?jk=88f2…</span>
          </div>
        </div>
        <div className="dcard" style={d(700)}>
          <div className="dok"><span className="tick" style={d(900)}><Check size={11} strokeWidth={3.5} /></span>
            Job imported — Warehouse Associate, Manchester</div>
        </div>
        <div className="dcard" style={d(1500)}>
          <div className="drow"><div className="ric"><Bot size={15} /></div>
            <span><b>Sarah</b> is reading the role requirements…</span></div>
        </div>
      </>
    );
    case 1: return (
      <>
        {[
          { ic: <Mic size={14} />, t: <><b>Voice outreach</b> — hiring line is live</>, dl: 0 },
          { ic: <MessageSquare size={14} />, t: <><b>SMS campaign</b> — 412 workers notified</>, dl: 600 },
          { ic: <Megaphone size={14} />, t: <><b>Warehouse Workers London</b> — community activated</>, dl: 1200 },
        ].map((r, i) => (
          <div className="dcard" key={i} style={d(r.dl)}>
            <div className="drow"><div className="ric">{r.ic}</div><span>{r.t}</span>
              <span className="rok" style={d(r.dl + 350)}><Check size={15} strokeWidth={3} /></span></div>
          </div>
        ))}
        <div className="dcard" style={d(2000)}>
          <div className="dok"><span className="tick" style={d(2200)}><Check size={11} strokeWidth={3.5} /></span>
            Campaign live — Sarah is now on duty 24/7</div>
        </div>
      </>
    );
    case 2: return (
      <>
        <div className="dcard">
          <div className="drow"><div className="ric pulse-ic"><PhoneCall size={14} /></div>
            <span><b>Incoming call</b> — worker from Stratford</span></div>
          <div className="avrow">
            {AV.map((a, i) => (
              <span className="av" key={a.i} style={{ background: a.c, ...d(300 + i * 280) }}>{a.i}</span>
            ))}
            <span className="more">+17 engaging now</span>
          </div>
        </div>
        <div className="dcard" style={d(1400)}>
          <div className="drow"><div className="ric"><MessageSquare size={14} /></div>
            <span><b>23 replies</b> via SMS &amp; WhatsApp in the last hour</span></div>
        </div>
      </>
    );
    case 3: return (
      <>
        <div className="dcard"><div className="bubble">Do you hold a valid forklift licence?</div></div>
        <div className="dcard" style={d(700)}><div className="bubble me">Yes — counterbalance, renewed last year.</div></div>
        <div className="dcard" style={d(1400)}>
          <div className="score">
            <div className="sl"><span>Match score — John T.</span><b>92%</b></div>
            <div className="bar"><span className="fill" style={{ '--w': '92%', animationDelay: '1.6s' } as React.CSSProperties} /></div>
          </div>
        </div>
      </>
    );
    default: return (
      <>
        {[
          { i: 'JT', c: '#10b981', n: 'John Thornton', r: 'Forklift certified · starts immediately', s: '92%', dl: 0 },
          { i: 'MS', c: '#6366f1', n: 'Maria Santos', r: 'Bilingual · 6 yrs logistics', s: '87%', dl: 600 },
          { i: 'RO', c: '#14b8a6', n: "Rachel O'Brien", r: 'FLT licence · available now', s: '88%', dl: 1200 },
        ].map(cd => (
          <div className="dcard" key={cd.i} style={d(cd.dl)}>
            <div className="drow">
              <span className="av" style={{ background: cd.c, marginLeft: 0, animationDelay: `${cd.dl + 150}ms` }}>{cd.i}</span>
              <span><b>{cd.n}</b><br /><span style={{ fontSize: '.76rem', color: '#9ca3af' }}>{cd.r}</span></span>
              <span className="qbadge" style={{ marginLeft: 'auto' }}><Check size={11} strokeWidth={3} />{cd.s}</span>
            </div>
          </div>
        ))}
      </>
    );
  }
}

function ProductStory() {
  const [stage, setStage] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;
    const t = setInterval(() => setStage(s => (s + 1) % STAGES.length), STAGE_MS);
    return () => clearInterval(t);
  }, [stage]);

  return (
    <div className="sgrid" style={{ '--dur': `${STAGE_MS}ms` } as React.CSSProperties}>
      <div>
        {STAGES.map((s, i) => (
          <button key={s.title} className={`stp${i === stage ? ' on' : ''}`} onClick={() => setStage(i)}>
            <span className="sico">{s.icon}</span>
            <span>
              <h3>{s.title}</h3>
              {i === stage && <p>{s.body}</p>}
            </span>
            <span className="sprog" />
          </button>
        ))}
      </div>
      <div className="demo">
        <div className="dhead">
          <span className="sav"><Bot size={14} /></span>
          <span>Sarah · AI hiring agent</span>
          <span className="live">Working</span>
        </div>
        <div key={stage}>
          <StoryDemo stage={stage} />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({
  onStartHiring,
}: {
  onStartHiring?: () => void;
} = {}) {
  const navigate = useNavigate();
  const startHiring = onStartHiring ?? (() => navigate('/post-job'));
  const [count, setCount] = useState(8412);
  const actTxt = useRef<HTMLSpanElement>(null);
  const actDot = useRef<HTMLSpanElement>(null);

  // load Inter once
  useEffect(() => {
    const id = 'gg-inter-font';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  // live activity → drives the number
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cycle = () => {
      const r = Math.random();
      let html, color, bump = 0;
      if (r < 0.5) {
        color = '#10b981'; bump = 1;
        html = `<span style="color:#059669;font-weight:600">Qualified ✓</span> · ${pk(ROLES)}, ${pk(BOROUGHS)}`;
      } else if (r < 0.8) {
        color = '#2563eb';
        html = `<span style="color:#2563eb;font-weight:600">Sarah is on a call</span> · ${pk(BOROUGHS)}`;
      } else {
        color = '#9ca3af';
        html = `<span style="color:#4b5563;font-weight:600">SMS follow-up sent</span> · ${8 + Math.floor(Math.random()*20)} candidates`;
      }
      if (actTxt.current) actTxt.current.style.opacity = '0';
      setTimeout(() => {
        if (actTxt.current) { actTxt.current.innerHTML = html; actTxt.current.style.opacity = '1'; }
        if (actDot.current) actDot.current.style.background = color;
        if (bump) setCount((c) => c + bump);
      }, 300);
    };
    const a = setInterval(cycle, 2600);
    const b = setInterval(() => setCount((c) => c + 1), 4300);
    return () => { clearInterval(a); clearInterval(b); };
  }, [setCount]);

  const industries = [
    { icon: <HardHat size={20} />, label: 'Construction' },
    { icon: <Package size={20} />, label: 'Warehousing' },
    { icon: <Factory size={20} />, label: 'Manufacturing' },
    { icon: <Truck size={20} />, label: 'Logistics' },
    { icon: <Heart size={20} />, label: 'Healthcare' },
    { icon: <UtensilsCrossed size={20} />, label: 'Hospitality' },
    { icon: <ShoppingBag size={20} />, label: 'Retail' },
  ];
  return (
    <div className="gg">
      <style>{CSS}</style>

      <header>
        <div className="wrap nav">
          <div className="nav-l">
            <span className="logo">GigGrab</span>
            <div className="links">
              <button>How it works</button><button>Industries</button>
              <button>Resources</button><button>About us</button>
            </div>
          </div>
          <button className="login">Log in</button>
        </div>
      </header>

      {/* HERO */}
      <section className="wrap hero">
        <div className="hgrid">
          {/* left */}
          <div>
            <span className="kicker"><span className="d" />Live across London</span>
            <h1>The workers are already <span className="g">here.</span></h1>
            <p className="sub">
              Don't post and wait. Describe a shift, set a daily budget — and <b>screened,
              ready-to-start workers</b> come to you. Sarah qualifies them by phone, around the clock.
            </p>
            <div className="cta-row">
              <button className="cta" onClick={startHiring}>
                Start hiring <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </div>
            <div className="trust">No credit card required · Cancel anytime · Free for workers</div>
          </div>

          {/* right: odometer */}
          <div className="stage">
            <Odometer value={count} start={8412} />
            <div className="label"><b>workers ready to start</b> across London right now</div>
            <div className="activity">
              <span className="adot" ref={actDot} />
              <span className="atxt" ref={actTxt}>Sarah is on a call · Newham</span>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="sec ind">
        <div className="wrap ind-row">
          {industries.map((i) => (
            <div className="ind-item" key={i.label}>
              <div className="ibox">{i.icon}</div>
              <span>{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT STORY */}
      <section className="sec how">
        <div className="wrap">
          <h2>You paste a job. Sarah does the rest.</h2>
          <p className="hsub">Watch what happens the moment a campaign goes live.</p>
          <ProductStory />
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="wrap band">
        <div className="band-in">
          <div>
            <h2>Need workers?</h2>
            <p>Launch a campaign in minutes and start receiving qualified candidates.</p>
          </div>
          <div className="band-btns">
            <button className="primary" onClick={startHiring}>
              Start hiring <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap foot">
          <span className="logo">GigGrab</span>
          <span>© 2026 GigGrab Ltd. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
