import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { PhoneCall, Check } from 'lucide-react';

const transcript = [
  { speaker: 'Sarah', text: 'Hi! Thanks for calling about the Warehouse Associate position. Can you tell me your name?', delay: 0 },
  { speaker: 'Worker', text: 'Hi, I\'m James Thompson.', delay: 2000 },
  { speaker: 'Sarah', text: 'Great to meet you, James. Where are you currently located?', delay: 3500 },
  { speaker: 'Worker', text: 'I\'m in Manchester.', delay: 5000 },
  { speaker: 'Sarah', text: 'Perfect. Can you tell me about your warehouse experience?', delay: 6500 },
  { speaker: 'Worker', text: 'I worked at Amazon for 3 years doing order picking and packing.', delay: 8000 },
  { speaker: 'Sarah', text: 'Do you have forklift certification?', delay: 10000 },
  { speaker: 'Worker', text: 'Yes, I have my counterbalance and reach truck licenses.', delay: 11500 },
  { speaker: 'Sarah', text: 'Excellent. Are you available for night shifts?', delay: 13000 },
  { speaker: 'Worker', text: 'Yes, nights work well for me. I prefer them actually.', delay: 14500 },
  { speaker: 'Sarah', text: 'And what\'s your salary expectation for this role?', delay: 16000 },
  { speaker: 'Worker', text: '£13 to £14 per hour would be good.', delay: 17500 },
];

export default function LiveScreeningPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<typeof transcript>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    experience: '',
    languages: 'English',
    availability: '',
    licenses: '',
    certifications: '',
    salaryExpectations: '',
    qualificationScore: 0,
    status: ''
  });

  useEffect(() => {
    if (currentIndex < transcript.length) {
      const timer = setTimeout(() => {
        const msg = transcript[currentIndex];
        setMessages(prev => [...prev, msg]);
        setCurrentIndex(prev => prev + 1);

        // Update profile based on conversation
        if (currentIndex === 1) {
          setProfile(prev => ({ ...prev, name: 'James Thompson' }));
        }
        if (currentIndex === 3) {
          setProfile(prev => ({ ...prev, location: 'Manchester', qualificationScore: 20 }));
        }
        if (currentIndex === 5) {
          setProfile(prev => ({ ...prev, experience: '3 years - Amazon (picking & packing)', qualificationScore: 50 }));
        }
        if (currentIndex === 7) {
          setProfile(prev => ({ ...prev, licenses: 'Counterbalance, Reach truck', certifications: 'Forklift certified', qualificationScore: 75 }));
        }
        if (currentIndex === 9) {
          setProfile(prev => ({ ...prev, availability: 'Night shifts (preferred)', qualificationScore: 90 }));
        }
        if (currentIndex === 11) {
          setProfile(prev => ({ ...prev, salaryExpectations: '£13-14/hour', qualificationScore: 95, status: 'Qualified' }));
        }
      }, transcript[currentIndex].delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl mb-2">Live AI Screening</h1>
            <p className="text-gray-600">Watch as GigGrab automatically screens and qualifies candidates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Live Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center relative">
                  <PhoneCall className="w-5 h-5 text-white" />
                  {currentIndex < transcript.length && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Live Call</div>
                  <div>
                    {currentIndex < transcript.length ? 'In Progress...' : 'Call Completed'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${msg.speaker === 'Sarah' ? 'text-left' : 'text-right'}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.speaker}
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        msg.speaker === 'Sarah'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-[#10b981] text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {currentIndex < transcript.length && (
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-1">Sarah</div>
                    <div className="inline-block px-4 py-2 rounded-lg bg-gray-100">
                      <span className="animate-pulse">●●●</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Candidate Profile */}
            <div className="bg-white rounded-xl border-2 border-[#10b981] p-6">
              <h3 className="text-lg mb-1">Candidate Profile</h3>
              <p className="text-sm text-gray-500 mb-6">Auto-generated during conversation</p>

              <div className="space-y-4 mb-6">
                <ProfileField label="Name" value={profile.name} />
                <ProfileField label="Location" value={profile.location} />
                <ProfileField label="Experience" value={profile.experience} />
                <ProfileField label="Languages" value={profile.languages} />
                <ProfileField label="Availability" value={profile.availability} />
                <ProfileField label="Licenses" value={profile.licenses} />
                <ProfileField label="Certifications" value={profile.certifications} />
                <ProfileField label="Salary Expectations" value={profile.salaryExpectations} />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Qualification Score</span>
                  <span className="text-2xl text-[#10b981]">{profile.qualificationScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#10b981] transition-all duration-500"
                    style={{ width: `${profile.qualificationScore}%` }}
                  ></div>
                </div>
                {profile.status && (
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <Check className="w-5 h-5" />
                    <span>Status: {profile.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/reach-budget')}
              disabled={currentIndex < transcript.length}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                px: 6,
                py: 1.5,
                backgroundColor: '#10b981',
                '&:hover': {
                  backgroundColor: '#059669'
                }
              }}
            >
              Continue to Budget & Reach
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm ${value ? 'text-gray-900' : 'text-gray-300'}`}>
        {value || '—'}
      </div>
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
