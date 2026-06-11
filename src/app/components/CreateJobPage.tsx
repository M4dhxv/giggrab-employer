import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, TextField, Tabs, Tab } from '@mui/material';
import { Link2, PhoneCall } from 'lucide-react';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'paste' | 'call' | null>(null);
  const [importTab, setImportTab] = useState<'single' | 'bulk'>('single');
  const [jobUrl, setJobUrl] = useState('');

  const handleImport = () => {
    if (jobUrl) {
      navigate(`/preview?type=${importTab}`);
    }
  };

  const handleStartCall = () => {
    navigate('/call-giggrab');
  };

  if (!method) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl mb-12 text-center">How would you like to create your job?</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Paste a Link */}
              <div
                onClick={() => setMethod('paste')}
                className="border-2 border-gray-200 rounded-xl p-8 hover:border-[#10b981] cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-4">
                  <Link2 className="w-6 h-6 text-[#10b981]" />
                </div>
                <h3 className="text-2xl mb-3">Paste a Job Link</h3>
                <p className="text-gray-600 mb-4">Import existing jobs from:</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• LinkedIn</li>
                  <li>• Indeed</li>
                  <li>• Reed</li>
                  <li>• Totaljobs</li>
                  <li>• Company Careers Page</li>
                </ul>
              </div>

              {/* Call GigGrab */}
              <div
                onClick={() => setMethod('call')}
                className="border-2 border-gray-200 rounded-xl p-8 hover:border-[#10b981] cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-4">
                  <PhoneCall className="w-6 h-6 text-[#10b981]" />
                </div>
                <h3 className="text-2xl mb-3">Call GigGrab</h3>
                <p className="text-gray-600 mb-4">Describe your hiring needs over a phone call.</p>
                <p className="text-sm text-gray-600">GigGrab builds the job description automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (method === 'call') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full text-center">
            <button
              onClick={() => setMethod(null)}
              className="text-gray-600 mb-8 hover:text-gray-900"
            >
              ← Back
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6">
              <PhoneCall className="w-8 h-8 text-[#10b981]" />
            </div>

            <h1 className="text-4xl mb-4">Call GigGrab</h1>
            <p className="text-xl text-gray-600 mb-12">
              Describe your hiring needs over the phone. We'll build your job description in real-time.
            </p>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleStartCall}
              sx={{
                textTransform: 'none',
                fontSize: '1.125rem',
                py: 2,
                backgroundColor: '#10b981',
                '&:hover': {
                  backgroundColor: '#059669'
                }
              }}
            >
              Start Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full">
          <button
            onClick={() => setMethod(null)}
            className="text-gray-600 mb-8 hover:text-gray-900"
          >
            ← Back
          </button>

          <h1 className="text-4xl mb-8 text-center">Paste a Job Link</h1>

          <Tabs
            value={importTab}
            onChange={(_, newValue) => setImportTab(newValue)}
            sx={{
              mb: 4,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
              },
              '& .Mui-selected': {
                color: '#10b981',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#10b981',
              }
            }}
          >
            <Tab label="Single Job" value="single" />
            <Tab label="Bulk Import" value="bulk" />
          </Tabs>

          {importTab === 'single' ? (
            <div>
              <p className="text-gray-600 mb-6">
                Paste one job URL. We'll automatically extract job details.
              </p>
              <p className="text-sm text-gray-500 mb-4">Example:</p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>• LinkedIn job posting</li>
                <li>• Indeed job posting</li>
                <li>• Company careers page</li>
              </ul>
              <TextField
                fullWidth
                placeholder="https://uk.indeed.com/viewjob?jk=..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.125rem',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Paste your careers page URL. GigGrab will automatically discover all jobs.
              </p>
              <p className="text-sm text-gray-500 mb-4">Example:</p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>• https://company.com/careers</li>
              </ul>
              <TextField
                fullWidth
                placeholder="https://company.com/careers"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.125rem',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                  }
                }}
              />
            </div>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleImport}
            disabled={!jobUrl}
            sx={{
              textTransform: 'none',
              fontSize: '1.125rem',
              py: 2,
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669'
              }
            }}
          >
            {importTab === 'single' ? 'Import Job' : 'Import Jobs'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl text-[#10b981]">GigGrab</div>
      </div>
    </header>
  );
}
