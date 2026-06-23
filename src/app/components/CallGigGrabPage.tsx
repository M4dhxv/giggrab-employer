import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { PhoneCall } from 'lucide-react';
import { usePostHog } from '@posthog/react';

const transcript = [
  { speaker: 'GigGrab', text: 'Hi! Thanks for calling. What role are you hiring for?', delay: 0 },
  { speaker: 'Employer', text: 'Warehouse Associates.', delay: 700 },
  { speaker: 'GigGrab', text: 'Great. How many workers do you need?', delay: 1400 },
  { speaker: 'Employer', text: '15.', delay: 2100 },
  { speaker: 'GigGrab', text: 'And where is the location?', delay: 2800 },
  { speaker: 'Employer', text: 'Manchester.', delay: 3500 },
  { speaker: 'GigGrab', text: 'What\'s the salary range?', delay: 4200 },
  { speaker: 'Employer', text: '£12 to £15 per hour.', delay: 4900 },
  { speaker: 'GigGrab', text: 'Night shifts available?', delay: 5600 },
  { speaker: 'Employer', text: 'Yes, we need night shift workers.', delay: 6300 },
  { speaker: 'GigGrab', text: 'Any certifications required?', delay: 7000 },
  { speaker: 'Employer', text: 'Forklift license preferred but not required.', delay: 7700 },
  { speaker: 'GigGrab', text: 'Perfect. I\'ve built your job description — ready to review!', delay: 8800 },
];

export default function CallGigGrabPage() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [messages, setMessages] = useState<typeof transcript>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobData, setJobData] = useState({
    title: '',
    location: '',
    salary: '',
    requirements: '',
    shiftType: '',
    employmentType: 'Full-time',
    hiringVolume: '',
    urgency: '',
    summary: ''
  });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    transcript.forEach((msg, i) => {
      timers.push(setTimeout(() => {
        setMessages(prev => [...prev, msg]);
        setCurrentIndex(i + 1);
        if (i === 1) setJobData(prev => ({ ...prev, title: 'Warehouse Associate' }));
        if (i === 3) setJobData(prev => ({ ...prev, hiringVolume: '15 workers' }));
        if (i === 5) setJobData(prev => ({ ...prev, location: 'Manchester, UK' }));
        if (i === 7) setJobData(prev => ({ ...prev, salary: '£12-15/hour' }));
        if (i === 9) setJobData(prev => ({ ...prev, shiftType: 'Night shifts available' }));
        if (i === 11) setJobData(prev => ({
          ...prev,
          requirements: 'Forklift license preferred',
          summary: 'We are looking for 15 reliable Warehouse Associates to join our team in Manchester. Night shifts available. Competitive pay of £12-15/hour.',
          urgency: 'ASAP',
        }));
      }, msg.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center gg-in">
            <h1 className="text-3xl mb-2">You're on with Sarah</h1>
            <p className="text-gray-600">Talk normally — your job spec is being written in real time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Live Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 gg-in gg-d1">
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
                    className={`gg-in ${msg.speaker === 'GigGrab' ? 'text-left' : 'text-right'}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.speaker}
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        msg.speaker === 'GigGrab'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-[#10b981] text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {currentIndex < transcript.length && currentIndex > 0 && (
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-1">GigGrab</div>
                    <div className="inline-block px-4 py-2 rounded-lg bg-gray-100">
                      <span className="animate-pulse">●●●</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Job Description Builder */}
            <div className="bg-white rounded-xl border-2 border-[#10b981] p-6 gg-in gg-d2">
              <h3 className="text-lg mb-1">Job Description</h3>
              <p className="text-sm text-gray-500 mb-6">Auto-generated during conversation</p>

              <div className="space-y-4 mb-6">
                <JobField label="Job Title" value={jobData.title} />
                <JobField label="Location" value={jobData.location} />
                <JobField label="Salary" value={jobData.salary} />
                <JobField label="Requirements" value={jobData.requirements} />
                <JobField label="Shift Type" value={jobData.shiftType} />
                <JobField label="Employment Type" value={jobData.employmentType} />
                <JobField label="Hiring Volume" value={jobData.hiringVolume} />
                <JobField label="Urgency" value={jobData.urgency} />
              </div>

              {jobData.summary && (
                <div className="border-t pt-4">
                  <div className="text-xs text-gray-500 mb-2">Summary</div>
                  <p className="text-sm text-gray-700">{jobData.summary}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                posthog?.capture('job_spec_completed', {
                  role: jobData.title,
                  location: jobData.location,
                  hiring_volume: jobData.hiringVolume,
                });
                navigate('/market-intel');
              }}
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
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobField({ label, value }: { label: string; value: string }) {
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
