import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { PhoneCall, FileText } from 'lucide-react';
import { WorkerHeader } from './WorkerLandingPage';

/*
  WorkerCallPage — the candidate voice interview, scripted.

  Left: live transcript of Sarah's 8-category interview.
  Right: the CV preview filling in live as Sarah extracts each answer.
  Mirrors the employer CallGigGrabPage two-pane pattern.
*/

const transcript = [
  { speaker: 'Sarah', text: "Hi! I'm Sarah from GigGrab. To start — what's your name, and what language are we speaking?", delay: 0 },
  { speaker: 'You', text: "Marek Kowalski. English is fine.", delay: 900 },
  { speaker: 'Sarah', text: "Great to meet you, Marek. What's your trade — what kind of work do you do?", delay: 1900 },
  { speaker: 'You', text: "Warehouse operative. Forklift driver, about 6 years.", delay: 3000 },
  { speaker: 'Sarah', text: "Any certificates or tickets I should note?", delay: 4100 },
  { speaker: 'You', text: "Counterbalance forklift licence, and a CSCS card.", delay: 5200 },
  { speaker: 'Sarah', text: "Tell me about your most recent job.", delay: 6300 },
  { speaker: 'You', text: "DHL in Manchester — picking, loading, forklift. Two years there.", delay: 7500 },
  { speaker: 'Sarah', text: "Where are you based, and how far can you travel?", delay: 8700 },
  { speaker: 'You', text: "Manchester. Up to 30 minutes by bus or train.", delay: 9900 },
  { speaker: 'Sarah', text: "When could you start, and what hours work for you?", delay: 11100 },
  { speaker: 'You', text: "Right away. Happy with nights or weekends.", delay: 12300 },
  { speaker: 'Sarah', text: "And what pay are you looking for?", delay: 13500 },
  { speaker: 'You', text: "Around £13 an hour, more for nights.", delay: 14700 },
  { speaker: 'Sarah', text: "Anything that would be a deal-breaker for you?", delay: 15900 },
  { speaker: 'You', text: "No zero-hours contracts. Need something steady.", delay: 17100 },
  { speaker: 'Sarah', text: "Perfect, Marek — I've built your profile and I'm already finding matches. Have a look!", delay: 18600 },
];

const EMPTY = {
  name: '', title: '', years: '', location: '', travel: '',
  availability: '', pay: '', credentials: [] as string[],
  recent: '', dealBreakers: '', summary: '',
};

export default function WorkerCallPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<typeof transcript>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cv, setCv] = useState(EMPTY);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    transcript.forEach((msg, i) => {
      timers.push(setTimeout(() => {
        setMessages(prev => [...prev, msg]);
        setCurrentIndex(i + 1);
        if (i === 1) setCv(prev => ({ ...prev, name: 'Marek Kowalski' }));
        if (i === 3) setCv(prev => ({ ...prev, title: 'Forklift Driver / Warehouse Operative', years: '6 years' }));
        if (i === 5) setCv(prev => ({ ...prev, credentials: ['Counterbalance forklift licence', 'CSCS card'] }));
        if (i === 7) setCv(prev => ({ ...prev, recent: 'DHL, Manchester — picking, loading & forklift (2 years)' }));
        if (i === 9) setCv(prev => ({ ...prev, location: 'Manchester, UK', travel: 'Up to 30 min by public transport' }));
        if (i === 11) setCv(prev => ({ ...prev, availability: 'Available now · nights & weekends OK' }));
        if (i === 13) setCv(prev => ({ ...prev, pay: '~£13/hr (more for nights)' }));
        if (i === 15) setCv(prev => ({
          ...prev,
          dealBreakers: 'No zero-hours contracts',
          summary: 'Experienced warehouse operative and counterbalance forklift driver with 6 years in fast-paced logistics. Reliable, flexible on shifts, and looking for steady, permanent work in or around Manchester.',
        }));
      }, msg.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const done = currentIndex >= transcript.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <WorkerHeader />
      <div className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center gg-in">
            <h1 className="text-3xl mb-2">You're on with Sarah</h1>
            <p className="text-gray-600">Talk normally — your profile is being written in real time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Live Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 gg-in gg-d1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center relative">
                  <PhoneCall className="w-5 h-5 text-white" />
                  {!done && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Live Call</div>
                  <div>{done ? 'Call Completed' : 'In Progress...'}</div>
                </div>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`gg-in ${msg.speaker === 'Sarah' ? 'text-left' : 'text-right'}`}>
                    <div className="text-xs text-gray-500 mb-1">{msg.speaker}</div>
                    <div className={`inline-block px-4 py-2 rounded-lg ${msg.speaker === 'Sarah' ? 'bg-gray-100 text-gray-900' : 'bg-[#10b981] text-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {!done && currentIndex > 0 && (
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-1">Sarah</div>
                    <div className="inline-block px-4 py-2 rounded-lg bg-gray-100">
                      <span className="animate-pulse">●●●</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live CV builder */}
            <div className="bg-white rounded-xl border-2 border-[#10b981] p-6 gg-in gg-d2">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-lg">Your profile</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Auto-generated from the call</p>

              <div className="space-y-4 mb-6">
                <CvField label="Name" value={cv.name} />
                <CvField label="Trade" value={cv.title} />
                <CvField label="Experience" value={cv.years} />
                <CvField label="Credentials" value={cv.credentials.join(' · ')} />
                <CvField label="Recent work" value={cv.recent} />
                <CvField label="Location" value={cv.location} />
                <CvField label="Travel" value={cv.travel} />
                <CvField label="Availability" value={cv.availability} />
                <CvField label="Pay expectation" value={cv.pay} />
                <CvField label="Deal-breakers" value={cv.dealBreakers} />
              </div>

              {cv.summary && (
                <div className="border-t pt-4 gg-in">
                  <div className="text-xs text-gray-500 mb-2">Summary</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{cv.summary}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/worker/profile')}
              disabled={!done}
              sx={{ textTransform: 'none', fontSize: '1rem', px: 6, py: 1.5, backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
            >
              Review my profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CvField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm ${value ? 'text-gray-900' : 'text-gray-300'}`}>{value || '—'}</div>
    </div>
  );
}
