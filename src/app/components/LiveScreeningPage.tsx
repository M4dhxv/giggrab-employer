import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PhoneCall, Check } from 'lucide-react';

const TRANSCRIPT = [
  { speaker: 'Sarah', text: "Hi! Thanks for calling about the Warehouse Associate position. Can you tell me your name?", delay: 0 },
  { speaker: 'Worker', text: "Hi, I'm James Thompson.", delay: 2000 },
  { speaker: 'Sarah', text: "Great to meet you, James. Where are you currently located?", delay: 3500 },
  { speaker: 'Worker', text: "I'm in Manchester.", delay: 5000 },
  { speaker: 'Sarah', text: "Perfect. Can you tell me about your warehouse experience?", delay: 6500 },
  { speaker: 'Worker', text: "I worked at Amazon for 3 years doing order picking and packing.", delay: 8000 },
  { speaker: 'Sarah', text: "Do you have forklift certification?", delay: 10000 },
  { speaker: 'Worker', text: "Yes, I have my counterbalance and reach truck licences.", delay: 11500 },
  { speaker: 'Sarah', text: "Excellent. Are you available for night shifts?", delay: 13000 },
  { speaker: 'Worker', text: "Yes, nights work well for me. I prefer them actually.", delay: 14500 },
  { speaker: 'Sarah', text: "And what's your salary expectation for this role?", delay: 16000 },
  { speaker: 'Worker', text: "£13 to £14 per hour would be good.", delay: 17500 },
];

type Profile = {
  name: string;
  location: string;
  experience: string;
  languages: string;
  availability: string;
  licenses: string;
  certifications: string;
  salaryExpectations: string;
  qualificationScore: number;
  status: string;
};

export default function LiveScreeningPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<typeof TRANSCRIPT>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    location: '',
    experience: '',
    languages: 'English',
    availability: '',
    licenses: '',
    certifications: '',
    salaryExpectations: '',
    qualificationScore: 0,
    status: '',
  });

  useEffect(() => {
    if (currentIndex >= TRANSCRIPT.length) return;
    const timer = setTimeout(() => {
      const msg = TRANSCRIPT[currentIndex];
      setMessages((prev) => [...prev, msg]);
      setCurrentIndex((prev) => prev + 1);

      if (currentIndex === 1) setProfile((p) => ({ ...p, name: 'James Thompson' }));
      if (currentIndex === 3) setProfile((p) => ({ ...p, location: 'Manchester', qualificationScore: 20 }));
      if (currentIndex === 5) setProfile((p) => ({ ...p, experience: '3 years — Amazon (picking & packing)', qualificationScore: 50 }));
      if (currentIndex === 7) setProfile((p) => ({ ...p, licenses: 'Counterbalance, Reach truck', certifications: 'Forklift certified', qualificationScore: 75 }));
      if (currentIndex === 9) setProfile((p) => ({ ...p, availability: 'Night shifts (preferred)', qualificationScore: 90 }));
      if (currentIndex === 11) setProfile((p) => ({ ...p, salaryExpectations: '£13–14/hour', qualificationScore: 95, status: 'Qualified' }));
    }, TRANSCRIPT[currentIndex].delay);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const done = currentIndex >= TRANSCRIPT.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <PageHeader />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center gg-in">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Live AI Screening</h1>
            <p className="text-gray-500">Watch as Sarah screens and qualifies a candidate in real time.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Transcript */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 gg-in gg-d1">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="relative w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-white" />
                  {!done && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Live Call</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {done ? 'Call Completed' : 'In Progress…'}
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`gg-in ${msg.speaker === 'Sarah' ? 'text-left' : 'text-right'}`}>
                    <div className="text-[11px] text-gray-400 mb-1">{msg.speaker}</div>
                    <div
                      className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-snug max-w-[85%] ${
                        msg.speaker === 'Sarah'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-[#10b981] text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {!done && (
                  <div className="text-left">
                    <div className="text-[11px] text-gray-400 mb-1">Sarah</div>
                    <div className="inline-block px-4 py-2.5 rounded-2xl bg-gray-100 text-sm">
                      <span className="animate-pulse tracking-widest">●●●</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile */}
            <div className="bg-white rounded-2xl border-2 border-[#10b981] p-6 gg-in gg-d2">
              <h3 className="font-bold text-gray-900 mb-1">Candidate Profile</h3>
              <p className="text-xs text-gray-400 mb-5">Auto-generated during conversation</p>

              <div className="space-y-3.5 mb-6">
                {(
                  [
                    ['Name', profile.name],
                    ['Location', profile.location],
                    ['Experience', profile.experience],
                    ['Languages', profile.languages],
                    ['Availability', profile.availability],
                    ['Licences', profile.licenses],
                    ['Certifications', profile.certifications],
                    ['Salary Expectations', profile.salaryExpectations],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] text-gray-400 mb-0.5">{label}</div>
                    <div className={`text-sm ${value ? 'text-gray-900 gg-in' : 'text-gray-300'}`}>
                      {value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Qualification Score</span>
                  <span className="text-2xl font-bold text-[#10b981]">{profile.qualificationScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[#10b981] transition-all duration-500 rounded-full"
                    style={{ width: `${profile.qualificationScore}%` }}
                  />
                </div>
                {profile.status && (
                  <div className="flex items-center gap-2 text-[#059669] text-sm font-semibold gg-in">
                    <Check className="w-4 h-4" />
                    {profile.status}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/reach-budget')}
              disabled={!done}
              className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-8 py-3.5 font-bold text-sm transition-all"
            >
              Continue to Budget &amp; Reach
            </button>
          </div>
          {!done && (
            <p className="text-center text-xs text-gray-400 mt-3">Wait for the call to complete to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-extrabold text-[#10b981] tracking-tight"
        >
          GigGrab
        </button>
      </div>
    </header>
  );
}
