import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, Play, Check, HardHat, Package, Factory, Truck,
  Heart, UtensilsCrossed, ShoppingBag, Link2, UserSearch, Cpu, Zap,
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

/* how it works */
.gg .how{padding:76px 0}
.gg .how h2{text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:48px;letter-spacing:-.02em}
.gg .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;position:relative}
@media(max-width:760px){.gg .steps{grid-template-columns:1fr 1fr;gap:28px}}
.gg .step{display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 18px}
.gg .step .sbox{width:56px;height:56px;border-radius:16px;background:var(--em-tint);
  border:1px solid var(--em-border);display:grid;place-items:center;margin-bottom:16px;color:var(--em)}
.gg .step h3{font-size:.95rem;font-weight:600;margin-bottom:8px}
.gg .step p{font-size:.85rem;color:var(--gray-500);line-height:1.5}

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

export default function LandingPage({
  onStartHiring,
  onHearSarah = () => {},
}: {
  onStartHiring?: () => void;
  onHearSarah?: () => void;
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
  const steps = [
    { icon: <Link2 size={20} />, title: 'Add your job', body: 'Paste a job link from Indeed, LinkedIn or your careers page — or just call Sarah.' },
    { icon: <UserSearch size={20} />, title: 'We reach workers', body: 'We activate our London network through SMS, WhatsApp and voice — workers you already have.' },
    { icon: <Cpu size={20} />, title: 'Sarah screens & qualifies', body: 'Sarah qualifies candidates by phone in 32 languages, 24/7 — no applications.' },
    { icon: <Zap size={20} />, title: 'You hire faster', body: 'Ready-to-start, qualified candidates land in your dashboard. You just say yes.' },
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
              <button className="ghost" onClick={onHearSarah}>
                <span className="pl"><Play size={11} fill="currentColor" /></span>
                Hear Sarah on the call
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

      {/* HOW IT WORKS */}
      <section className="sec how">
        <div className="wrap">
          <h2>How GigGrab works</h2>
          <div className="steps">
            {steps.map((s) => (
              <div className="step" key={s.title}>
                <div className="sbox">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
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
            <button className="secondary">Book a demo</button>
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
