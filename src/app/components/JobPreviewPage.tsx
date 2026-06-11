import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, Checkbox } from '@mui/material';
import { MapPin, Briefcase } from 'lucide-react';

export default function JobPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const importType = searchParams.get('type') || 'single';

  const [selectedJobs, setSelectedJobs] = useState(
    importType === 'bulk' ? new Set([0]) : new Set()
  );

  const singleJob = {
    title: 'Warehouse Associate',
    location: 'Manchester, UK',
    salary: '£12-15/hour',
    description: 'We are looking for a reliable Warehouse Associate to join our team...',
    requirements: ['Previous warehouse experience', 'Forklift license preferred', 'Available for shifts']
  };

  const bulkJobs = [
    { id: 0, title: 'Warehouse Associate', location: 'Manchester', salary: '£12-15/hour' },
    { id: 1, title: 'Forklift Operator', location: 'Manchester', salary: '£14-16/hour' },
    { id: 2, title: 'General Labourer', location: 'Liverpool', salary: '£11-13/hour' },
    { id: 3, title: 'Caregiver', location: 'Manchester', salary: '£12-14/hour' },
    { id: 4, title: 'Production Worker', location: 'Birmingham', salary: '£12-15/hour' },
  ];

  const toggleJob = (id: number) => {
    const newSet = new Set(selectedJobs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedJobs(newSet);
  };

  if (importType === 'single') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl mb-8">Job Preview</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl mb-4">{singleJob.title}</h2>
              <div className="flex gap-6 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{singleJob.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{singleJob.salary}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-2">Description</h3>
                <p className="text-gray-700">{singleJob.description}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-600 mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {singleJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/choose-plan')}
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-2">Select Jobs to Import</h1>
          <p className="text-gray-600 mb-8">We found {bulkJobs.length} jobs. Choose which ones to launch.</p>

          <div className="space-y-4 mb-8">
            {bulkJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => toggleJob(job.id)}
                className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                  selectedJobs.has(job.id)
                    ? 'border-[#10b981] shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedJobs.has(job.id)}
                    sx={{
                      color: '#10b981',
                      '&.Mui-checked': {
                        color: '#10b981',
                      }
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl mb-2">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/choose-plan')}
            disabled={selectedJobs.size === 0}
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
            Continue ({selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected)
          </Button>
        </div>
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
