import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, Checkbox } from '@mui/material';
import { Users, Radar, Clock, MapPin, Bot, Check } from 'lucide-react';

interface RoleIntel {
  id: number;
  title: string;
  location: string;
  salary: string;
  available: string;
  activelyLooking: string;
  fillTime: string;
}

const SINGLE_ROLE: RoleIntel = {
  id: 0, title: 'Warehouse Associate', location: 'Manchester, UK', salary: '£12–15/hour',
  available: '1,240', activelyLooking: '387', fillTime: '5–9 days',
};

const BULK_ROLES: RoleIntel[] = [
  { id: 0, title: 'Warehouse Associate', location: 'Manchester', salary: '£12–15/hour', available: '1,240', activelyLooking: '387', fillTime: '5–9 days' },
  { id: 1, title: 'Cleaner', location: 'Manchester', salary: '£11–13/hour', available: '420', activelyLooking: '113', fillTime: '3–6 days' },
  { id: 2, title: 'Forklift Operator', location: 'Manchester', salary: '£14–16/hour', available: '610', activelyLooking: '184', fillTime: '4–8 days' },
];

const SCAN_STEPS = [
  'Searching GigGrab talent pools…',
  'Checking worker communities…',
  'Measuring active interest…',
  'Estimating time-to-fill…',
];

export default function MarketIntelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBulk = searchParams.get('type') === 'bulk';
  const roles = isBulk ? BULK_ROLES : [SINGLE_ROLE];

  const [scanStep, setScanStep] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set(roles.map(r => r.id)));

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setScanning(false); return; }
    const t = setInterval(() => {
      setScanStep(s => {
        if (s >= SCAN_STEPS.length - 1) { clearInterval(t); setTimeout(() => setScanning(false), 450); return s; }
        return s + 1;
      });
    }, 480);
    return () => clearInterval(t);
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (scanning) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center mx-auto mb-6 relative">
              <Bot className="w-8 h-8 text-white" />
              <span className="absolute inset-0 rounded-full border-2 border-[#10b981] animate-ping" />
            </div>
            <h1 className="text-2xl mb-2">Sarah is analysing worker availability</h1>
            <p className="text-gray-500 mb-8">{isBulk ? `${roles.length} roles imported` : 'Job imported'} — checking the market before you spend a penny.</p>
            <div className="space-y-2 max-w-xs mx-auto text-left">
              {SCAN_STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-2.5 text-sm transition-opacity duration-300 ${i <= scanStep ? 'opacity-100' : 'opacity-25'}`}>
                  {i < scanStep
                    ? <Check className="w-4 h-4 text-[#10b981]" />
                    : <span className={`w-4 h-4 rounded-full border-2 ${i === scanStep ? 'border-[#10b981] animate-pulse' : 'border-gray-300'}`} />}
                  <span className={i <= scanStep ? 'text-gray-700' : 'text-gray-400'}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#059669] mb-2 gg-in">
            <Bot className="w-4 h-4" />
            <span>Market intelligence from the GigGrab worker network</span>
          </div>
          <h1 className="text-4xl mb-2 gg-in gg-d1">The workers are already here</h1>
          <p className="text-gray-600 mb-8 gg-in gg-d2">
            {isBulk
              ? 'Sarah checked availability for every role you imported. Pick the ones to launch.'
              : 'Sarah checked availability for your role. Here’s the market right now.'}
          </p>

          <div className="space-y-4 mb-8">
            {roles.map((role, ri) => {
              const isSelected = selected.has(role.id);
              return (
                <div
                  key={role.id}
                  onClick={isBulk ? () => toggle(role.id) : undefined}
                  className={`bg-white rounded-xl border-2 p-6 gg-in gg-lift ${
                    isBulk ? 'cursor-pointer' : ''
                  } ${isSelected ? 'border-[#10b981] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  style={{ animationDelay: `${0.15 + ri * 0.08}s` }}
                >
                  <div className="flex items-start gap-3 mb-5">
                    {isBulk && (
                      <Checkbox
                        checked={isSelected}
                        sx={{ p: 0.5, color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl mb-1">{role.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{role.location}</span>
                        <span>•</span>
                        <span>{role.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <IntelStat icon={<Users className="w-4 h-4" />} label="Available Workers" value={role.available} />
                    <IntelStat icon={<Radar className="w-4 h-4" />} label="Actively Looking" value={role.activelyLooking} highlight />
                    <IntelStat icon={<Clock className="w-4 h-4" />} label="Typical Fill Time" value={role.fillTime} />
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/choose-plan')}
            disabled={selected.size === 0}
            sx={{
              textTransform: 'none', fontSize: '1rem', px: 6, py: 1.5,
              backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' },
            }}
          >
            {isBulk
              ? `Start matching workers (${selected.size} role${selected.size !== 1 ? 's' : ''})`
              : 'Start matching workers'}
          </Button>
          <p className="text-sm text-gray-400 mt-3">No spend yet — you choose a plan and budget next.</p>
        </div>
      </div>
    </div>
  );
}

function IntelStat({ icon, label, value, highlight = false }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-[#f0fdf4]' : 'bg-gray-50'}`}>
      <div className={`flex items-center gap-1.5 text-xs mb-1.5 ${highlight ? 'text-[#059669]' : 'text-gray-500'}`}>
        {icon}
        {label}
      </div>
      <div className={`text-2xl ${highlight ? 'text-[#059669]' : 'text-gray-900'}`} style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl text-[#10b981]">GigGrab</div>
      </div>
    </header>
  );
}
