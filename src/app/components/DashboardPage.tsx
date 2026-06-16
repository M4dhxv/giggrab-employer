import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Briefcase, Users, Settings,
  Plus, ChevronRight, Search, ArrowUpRight,
  MapPin, Globe, Star, Clock, DollarSign, TrendingUp,
  CheckCircle, Calendar, XCircle, Edit, Pause, AlertCircle,
  ArrowLeft, FileText, Phone, HelpCircle, ChevronDown,
  Sparkles, MessageSquare, ChevronUp, User, CreditCard,
  Bell, Shield, RotateCcw, Bot, Send, Activity, PhoneCall,
  Menu, X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type View = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'profile';
type ProfileTab = 'summary' | 'transcript' | 'interviews' | 'profile';

interface Interview {
  id: string;
  date: string;
  time: string;
  type: 'Phone' | 'Video' | 'In-person';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;
}

interface Candidate {
  id: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  experience: string;
  location: string;
  languages: string[];
  score: number;
  status: 'Qualified' | 'Review' | 'Interview' | 'Available' | 'Shortlisted' | 'Rejected';
  badge?: string;
  availability: string;
  certifications: string[];
  employmentStatus: string;
  notes: string;
  job: string;
  jobId: string;
  addedAt: string;
  salaryExpectation: string;
  screeningSummary: {
    experience: string;
    availability: string;
    certifications: string;
    languages: string;
    salaryExpectations: string;
    strengths: string[];
    concerns: string[];
  };
  transcript: { speaker: 'AI' | 'Candidate'; text: string; time: string }[];
  interviews: Interview[];
}

interface Job {
  id: string;
  title: string;
  location: string;
  status: 'Active' | 'Paused' | 'Closed';
  promotion: 'FREE' | 'STANDARD' | 'PREMIUM';
  budget: number;
  totalSpend: number;
  candidates: number;
  qualified: number;
  awaitingReview: number;
  interviews: number;
  daysToFill: number;
  postedAt: string;
  salary: string;
  imported?: boolean;
  workerReach?: number;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const INITIAL_JOBS: Job[] = [
  { id: '1', title: 'Warehouse Associate', location: 'Manchester, UK', status: 'Active', promotion: 'PREMIUM', budget: 45, totalSpend: 360, candidates: 47, qualified: 12, awaitingReview: 8, interviews: 4, daysToFill: 8, postedAt: '3 days ago', salary: '£12–15/hr' },
  { id: '2', title: 'Forklift Operator',   location: 'Manchester, UK', status: 'Active', promotion: 'STANDARD', budget: 25, totalSpend: 150, candidates: 18, qualified: 5,  awaitingReview: 3, interviews: 1, daysToFill: 14, postedAt: '6 days ago', salary: '£14–17/hr' },
  { id: '3', title: 'Night Shift Packer',  location: 'Salford, UK',    status: 'Paused', promotion: 'STANDARD', budget: 20, totalSpend: 240, candidates: 9,  qualified: 2,  awaitingReview: 1, interviews: 0, daysToFill: 21, postedAt: '12 days ago', salary: '£11–13/hr' },
  { id: '4', title: 'Care Worker',         location: 'Bolton, UK',     status: 'Active', promotion: 'PREMIUM', budget: 40, totalSpend: 280, candidates: 31, qualified: 9,  awaitingReview: 5, interviews: 2, daysToFill: 10, postedAt: '5 days ago', salary: '£11–14/hr' },
  { id: '5', title: 'Production Worker',   location: 'Wigan, UK',      status: 'Active', promotion: 'STANDARD', budget: 22, totalSpend: 88,  candidates: 11, qualified: 3,  awaitingReview: 2, interviews: 0, daysToFill: 18, postedAt: '2 days ago', salary: '£12/hr' },
];

const CANDIDATES: Candidate[] = [
  {
    id: '1', initials: 'JT', color: '#10b981', name: 'John Thornton',
    role: 'Warehouse Associate', experience: '4yr experience', location: 'Manchester',
    languages: ['English'], score: 92, status: 'Qualified', badge: 'Forklift Certified',
    availability: 'Available immediately', certifications: ['Forklift Licence', 'Manual Handling'],
    employmentStatus: 'Available', notes: 'Highly motivated. Available nights and weekends.',
    job: 'Warehouse Associate', jobId: '1', addedAt: '5 mins ago', salaryExpectation: '£13–15/hr',
    screeningSummary: {
      experience: '4 years in warehouse and logistics roles, including 2 years operating forklifts at a major distribution centre in Manchester.',
      availability: 'Available to start immediately. Flexible on shifts including nights and weekends.',
      certifications: 'Valid Forklift Licence (FLT counterbalance). Manual Handling certified.',
      languages: 'English (native).',
      salaryExpectations: 'Expecting £13–15/hr. Flexible for the right opportunity.',
      strengths: ['Strong forklift experience', 'Immediate availability', 'Night shift flexibility', 'Proven in high-volume environments'],
      concerns: ['No reach truck experience mentioned', 'Last role ended 3 months ago — worth clarifying reason'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi John, thanks for calling GigGrab. I\'m going to ask you a few quick questions about the Warehouse Associate role. Is now a good time?', time: '10:01' },
      { speaker: 'Candidate', text: 'Yeah, perfect. Go ahead.', time: '10:01' },
      { speaker: 'AI', text: 'Great. How many years of warehouse experience do you have?', time: '10:02' },
      { speaker: 'Candidate', text: 'About 4 years. Worked at a DHL depot in Manchester for 2 years, then an Amazon fulfilment centre.', time: '10:02' },
      { speaker: 'AI', text: 'Do you hold a valid forklift licence?', time: '10:03' },
      { speaker: 'Candidate', text: 'Yes, counterbalance. Got it renewed last year.', time: '10:03' },
      { speaker: 'AI', text: 'Are you available to start immediately and are you open to night shifts?', time: '10:04' },
      { speaker: 'Candidate', text: 'Yes to both. Nights are actually better for me.', time: '10:04' },
      { speaker: 'AI', text: 'What salary are you looking for?', time: '10:05' },
      { speaker: 'Candidate', text: 'Somewhere between £13 and £15 an hour. But I\'m open if the role is a good fit.', time: '10:05' },
      { speaker: 'AI', text: 'Perfect. That\'s everything I need. You\'re a strong match for this role. The employer will be in touch shortly.', time: '10:06' },
    ],
    interviews: [
      { id: 'i1', date: '12 Jun 2026', time: '10:00 AM', type: 'Phone', status: 'Upcoming', notes: 'Initial screening call with hiring manager.' },
    ],
  },
  {
    id: '2', initials: 'MS', color: '#6366f1', name: 'Maria Santos',
    role: 'Forklift Operator', experience: '6yr experience', location: 'Salford',
    languages: ['English', 'Spanish'], score: 87, status: 'Qualified',
    availability: 'Within 1 week', certifications: ['Forklift Licence'],
    employmentStatus: 'Available', notes: 'Strong logistics background. Bilingual.',
    job: 'Warehouse Associate', jobId: '1', addedAt: '12 mins ago', salaryExpectation: '£14–16/hr',
    screeningSummary: {
      experience: '6 years in logistics and warehouse operations across the UK and Spain. Experienced in stock management and team supervision.',
      availability: 'Can start within 1 week.',
      certifications: 'Valid Forklift Licence.',
      languages: 'Fluent in English and Spanish. Beneficial for diverse teams.',
      salaryExpectations: 'Looking for £14–16/hr.',
      strengths: ['Extensive logistics experience', 'Bilingual capability', 'Team supervision experience', 'Quick availability'],
      concerns: ['Salary expectation slightly above posted range', 'May be overqualified for associate-level role'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi Maria, I\'m calling on behalf of GigGrab about the Warehouse Associate role. Do you have a few minutes?', time: '11:15' },
      { speaker: 'Candidate', text: 'Yes of course.', time: '11:15' },
      { speaker: 'AI', text: 'Excellent. How long have you been working in warehouse and logistics?', time: '11:16' },
      { speaker: 'Candidate', text: 'About 6 years. Most of it in logistics — I managed a small team in my last role.', time: '11:16' },
      { speaker: 'AI', text: 'Do you have a forklift licence?', time: '11:17' },
      { speaker: 'Candidate', text: 'Yes, counterbalance. Still valid.', time: '11:17' },
      { speaker: 'AI', text: 'What languages do you speak?', time: '11:18' },
      { speaker: 'Candidate', text: 'English and Spanish, both fluent.', time: '11:18' },
      { speaker: 'AI', text: 'And what salary are you looking for?', time: '11:19' },
      { speaker: 'Candidate', text: 'Around £14 to £16 an hour.', time: '11:19' },
      { speaker: 'AI', text: 'Great. You\'re a strong match. The employer will review your profile and be in touch.', time: '11:20' },
    ],
    interviews: [],
  },
  {
    id: '3', initials: 'AK', color: '#f59e0b', name: 'Ahmed Khan',
    role: 'General Labourer', experience: '2yr experience', location: 'Manchester',
    languages: ['English', 'Urdu'], score: 81, status: 'Available',
    availability: 'Available immediately', certifications: [],
    employmentStatus: 'Available', notes: 'Flexible availability. Night shifts preferred.',
    job: 'Warehouse Associate', jobId: '1', addedAt: '18 mins ago', salaryExpectation: '£12/hr',
    screeningSummary: {
      experience: '2 years in general labour and warehouse picking roles.',
      availability: 'Available immediately. Prefers night shifts.',
      certifications: 'No formal certifications held.',
      languages: 'English and Urdu.',
      salaryExpectations: 'Happy with £12/hr.',
      strengths: ['Immediate availability', 'Night shift preference matches role', 'Flexible attitude'],
      concerns: ['Limited experience (2 years)', 'No certifications', 'No forklift licence'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi Ahmed, this is GigGrab calling about a Warehouse Associate position. Is now okay to chat?', time: '14:30' },
      { speaker: 'Candidate', text: 'Yes, go ahead.', time: '14:30' },
      { speaker: 'AI', text: 'How much warehouse experience do you have?', time: '14:31' },
      { speaker: 'Candidate', text: 'About 2 years. Mainly picking and packing.', time: '14:31' },
      { speaker: 'AI', text: 'Do you have any licences or certifications?', time: '14:32' },
      { speaker: 'Candidate', text: 'No, nothing like that yet. But I\'m keen to train.', time: '14:32' },
      { speaker: 'AI', text: 'Are you available to start immediately?', time: '14:33' },
      { speaker: 'Candidate', text: 'Yes, straight away. I prefer nights actually.', time: '14:33' },
      { speaker: 'AI', text: 'What pay are you looking for?', time: '14:34' },
      { speaker: 'Candidate', text: '£12 an hour would be good.', time: '14:34' },
      { speaker: 'AI', text: 'Thanks Ahmed. We\'ll pass your profile to the employer now.', time: '14:35' },
    ],
    interviews: [],
  },
  {
    id: '4', initials: 'SM', color: '#8b5cf6', name: 'Sarah Mitchell',
    role: 'Warehouse Associate', experience: '1yr experience', location: 'Stockport',
    languages: ['English'], score: 74, status: 'Review',
    availability: '2 weeks notice', certifications: [],
    employmentStatus: 'Currently Employed', notes: 'Transitioning from retail. Eager to learn.',
    job: 'Warehouse Associate', jobId: '1', addedAt: '25 mins ago', salaryExpectation: '£12–13/hr',
    screeningSummary: {
      experience: '1 year in a retail stock room environment. Limited direct warehouse experience but transferable skills.',
      availability: 'Currently employed. 2 weeks notice required.',
      certifications: 'None held.',
      languages: 'English only.',
      salaryExpectations: '£12–13/hr.',
      strengths: ['Eager to transition', 'Organised and reliable per screening responses', 'Quick notice period'],
      concerns: ['Limited warehouse-specific experience', 'No certifications', 'Currently employed — may need managing'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi Sarah, calling from GigGrab about a Warehouse Associate role. Can you talk?', time: '09:15' },
      { speaker: 'Candidate', text: 'Yes, I\'ve been expecting your call.', time: '09:15' },
      { speaker: 'AI', text: 'Great. Tell me about your warehouse experience.', time: '09:16' },
      { speaker: 'Candidate', text: 'I\'ve been working in a large retail stockroom for a year. It\'s not exactly warehouse but it\'s similar in a lot of ways.', time: '09:16' },
      { speaker: 'AI', text: 'Do you hold any licences or certifications?', time: '09:17' },
      { speaker: 'Candidate', text: 'Not yet but I\'m very keen to do my forklift licence.', time: '09:17' },
      { speaker: 'AI', text: 'When would you be available to start?', time: '09:18' },
      { speaker: 'Candidate', text: 'I\'d need to give 2 weeks notice. So maybe 2 to 3 weeks.', time: '09:18' },
      { speaker: 'AI', text: 'What salary are you expecting?', time: '09:19' },
      { speaker: 'Candidate', text: '£12 or £13 an hour.', time: '09:19' },
      { speaker: 'AI', text: 'Thank you Sarah. We\'ll review your profile and be in touch.', time: '09:20' },
    ],
    interviews: [],
  },
  {
    id: '5', initials: 'JW', color: '#ec4899', name: 'James Wilson',
    role: 'Warehouse Operative', experience: '4yr experience', location: 'Bolton',
    languages: ['English'], score: 70, status: 'Review',
    availability: 'Within 1 week', certifications: ['Manual Handling'],
    employmentStatus: 'Available', notes: 'Solid experience, needs interview.',
    job: 'Warehouse Associate', jobId: '1', addedAt: '32 mins ago', salaryExpectation: '£12–14/hr',
    screeningSummary: {
      experience: '4 years in warehouse operative roles across two employers. Consistent employment history.',
      availability: 'Can start within 1 week.',
      certifications: 'Manual Handling certified. No forklift licence.',
      languages: 'English only.',
      salaryExpectations: '£12–14/hr.',
      strengths: ['Solid experience level', 'Consistent employment history', 'Quick availability', 'Manual Handling certified'],
      concerns: ['Score slightly lower due to no forklift licence', 'Location (Bolton) may create commute issues'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi James, I\'m calling from GigGrab about a Warehouse Associate role in Manchester. Is now a good time?', time: '15:45' },
      { speaker: 'Candidate', text: 'Sure, go ahead.', time: '15:45' },
      { speaker: 'AI', text: 'How long have you been working in warehouse roles?', time: '15:46' },
      { speaker: 'Candidate', text: '4 years. Two different employers. Mostly pick and pack and some stock control.', time: '15:46' },
      { speaker: 'AI', text: 'Do you hold a forklift licence?', time: '15:47' },
      { speaker: 'Candidate', text: 'No, not yet. Only Manual Handling.', time: '15:47' },
      { speaker: 'AI', text: 'When can you start?', time: '15:48' },
      { speaker: 'Candidate', text: 'Within a week, easy.', time: '15:48' },
      { speaker: 'AI', text: 'And salary expectations?', time: '15:49' },
      { speaker: 'Candidate', text: '£12 to £14.', time: '15:49' },
      { speaker: 'AI', text: 'Thanks James. We\'ll pass your details on to the employer.', time: '15:50' },
    ],
    interviews: [],
  },
  {
    id: '6', initials: 'RO', color: '#14b8a6', name: 'Rachel O\'Brien',
    role: 'Warehouse Associate', experience: '3yr experience', location: 'Manchester',
    languages: ['English', 'Polish'], score: 88, status: 'Shortlisted',
    availability: 'Available immediately', certifications: ['Forklift Licence'],
    employmentStatus: 'Available', notes: 'Excellent attitude. Forklift experience strong.',
    job: 'Forklift Operator', jobId: '2', addedAt: '1 hr ago', salaryExpectation: '£13–15/hr',
    screeningSummary: {
      experience: '3 years in warehousing with a focus on forklift operations.',
      availability: 'Available immediately.',
      certifications: 'Valid Forklift Licence.',
      languages: 'English and Polish — useful for diverse team environments.',
      salaryExpectations: '£13–15/hr.',
      strengths: ['Strong forklift background', 'Immediate availability', 'Bilingual', 'Positive attitude noted in screening'],
      concerns: ['3 years may be on the lower end for a senior forklift role'],
    },
    transcript: [
      { speaker: 'AI', text: 'Hi Rachel, calling about the Forklift Operator role. Can you chat now?', time: '08:30' },
      { speaker: 'Candidate', text: 'Yes, absolutely.', time: '08:30' },
      { speaker: 'AI', text: 'How many years of forklift experience do you have?', time: '08:31' },
      { speaker: 'Candidate', text: 'About 3 years, mainly counterbalance and some reach truck.', time: '08:31' },
      { speaker: 'AI', text: 'Is your forklift licence still valid?', time: '08:32' },
      { speaker: 'Candidate', text: 'Yes, renewed 6 months ago.', time: '08:32' },
      { speaker: 'AI', text: 'Are you available to start immediately?', time: '08:33' },
      { speaker: 'Candidate', text: 'Yes, I finished my last contract last week.', time: '08:33' },
      { speaker: 'AI', text: 'What languages do you speak?', time: '08:34' },
      { speaker: 'Candidate', text: 'English and Polish.', time: '08:34' },
      { speaker: 'AI', text: 'Great. Salary expectations?', time: '08:35' },
      { speaker: 'Candidate', text: '£13 to £15 an hour.', time: '08:35' },
      { speaker: 'AI', text: 'Excellent match. We\'ll share your profile with the employer today.', time: '08:36' },
    ],
    interviews: [
      { id: 'i2', date: '14 Jun 2026', time: '2:00 PM', type: 'Video', status: 'Upcoming', notes: 'Video interview with operations manager.' },
      { id: 'i3', date: '5 Jun 2026', time: '10:00 AM', type: 'Phone', status: 'Completed', notes: 'Initial screen completed. Positive outcome.' },
    ],
  },
];

// ─── Synthesised candidates (Sarah "finds" these on area commands) ──────────

const SYNTH_NAMES = [
  { name: 'Tomasz Nowak',  initials: 'TN', color: '#0ea5e9', languages: ['English', 'Polish'] },
  { name: 'Priya Patel',   initials: 'PP', color: '#f97316', languages: ['English', 'Gujarati'] },
  { name: 'Daniel Hughes', initials: 'DH', color: '#84cc16', languages: ['English'] },
  { name: 'Amara Okafor',  initials: 'AO', color: '#a855f7', languages: ['English'] },
  { name: 'Liam Carter',   initials: 'LC', color: '#ef4444', languages: ['English'] },
  { name: 'Sofia Reyes',   initials: 'SR', color: '#6366f1', languages: ['English', 'Spanish'] },
];

let synthSeq = 0;

function synthCandidates(area: string, job: Job, n: number): Candidate[] {
  const place = area.trim().replace(/\b\w/g, ch => ch.toUpperCase());
  return Array.from({ length: n }, (_, i) => {
    const t = SYNTH_NAMES[synthSeq % SYNTH_NAMES.length];
    const id = `synth-${synthSeq++}`;
    const years = 2 + ((synthSeq + i) % 5);
    const score = 86 - i * 4;
    return {
      id, initials: t.initials, color: t.color, name: t.name,
      role: job.title, experience: `${years}yr experience`, location: place,
      languages: t.languages, score, status: 'Qualified' as const,
      availability: 'Available immediately', certifications: [],
      employmentStatus: 'Available', notes: `Sourced by Sarah from the ${place} talent pool.`,
      job: job.title, jobId: job.id, addedAt: 'just now', salaryExpectation: '£12–14/hr',
      screeningSummary: {
        experience: `${years} years in similar frontline roles around ${place}.`,
        availability: 'Available immediately. Flexible on shifts.',
        certifications: 'None held.',
        languages: t.languages.join(' and ') + '.',
        salaryExpectations: '£12–14/hr.',
        strengths: ['Immediate availability', `Local to ${place}`, 'Screened by Sarah moments ago'],
        concerns: ['Full screening summary pending review'],
      },
      transcript: [
        { speaker: 'AI' as const, text: `Hi ${t.name.split(' ')[0]}, calling about a ${job.title} role near ${place}. Is now a good time?`, time: 'now' },
        { speaker: 'Candidate' as const, text: 'Yes, perfect — go ahead.', time: 'now' },
      ],
      interviews: [],
    };
  });
}

// ─── Status styling ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Qualified:   { bg: '#f0fdf4', text: '#15803d' },
  Available:   { bg: '#eff6ff', text: '#1d4ed8' },
  Review:      { bg: '#fffbeb', text: '#b45309' },
  Interview:   { bg: '#faf5ff', text: '#7e22ce' },
  Shortlisted: { bg: '#eff6ff', text: '#1d4ed8' },
  Rejected:    { bg: '#fef2f2', text: '#b91c1c' },
};

// ─── Agentic layer: command center, activity feed, notifications ────────────

const AGENT_CSS = `
@keyframes ggFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes ggToastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@keyframes ggBlink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes ggDrawer{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
@keyframes ggPanel{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.gg-anim{animation:none!important}}
`;

interface Toast { id: number; title: string; body: string }

const EXAMPLE_COMMANDS = [
  'Call top 10 matched candidates and confirm availability',
  'Give me candidates in Salford',
  'Schedule AI interviews for the top 10 matched',
  'Reactivate qualified candidates from the last 30 days',
];

// ─── Command intents: each command type gets its own task plan ──────────────

type ActionKind = 'call' | 'interview' | 'sms';

interface AgentPlan {
  steps: string[];
  // Fires as the plan starts — opens the live action panel for phone/SMS work.
  start?: () => void;
  // Runs when the plan completes. Applies side effects (e.g. filtering the
  // candidate list) and returns what Sarah reports back.
  finish: () => { result: string; toast: Omit<Toast, 'id'> };
}

const GENERIC_RESULTS = [
  { summary: 'Availability confirmed for 8 candidates. 2 interviews scheduled.', toast: { title: 'Availability confirmed', body: '8 candidates confirmed availability for this week.' } },
  { summary: '15 new workers found and added to your talent pool. 6 match this role.', toast: { title: 'New qualified candidates found', body: '6 new matches added to your campaign.' } },
];
let genericIdx = 0;

function buildPlan(cmd: string, onShowArea: (area: string) => number, onAction: (kind: ActionKind) => void): AgentPlan {
  const c = cmd.toLowerCase();
  const areaMatch = c.match(/(?:in|from|near|around)\s+([a-z][a-z\s'-]*?)(?:\s+area)?\s*[.!]?$/i);

  // "Give me candidates in Salford" — actually changes the list
  if (areaMatch && /candidate|worker|people|staff/.test(c)) {
    const area = areaMatch[1].trim().replace(/\b\w/g, ch => ch.toUpperCase());
    return {
      steps: ['Thinking…', `Searching talent pools in ${area}…`, 'Checking worker communities…', 'Screening availability…', 'Ranking by match score…'],
      finish: () => {
        const n = onShowArea(area);
        return {
          result: `Found ${n} candidates in ${area} — your matched list is now showing them.`,
          toast: { title: `Candidates found in ${area}`, body: `${n} local workers matched and added to your list.` },
        };
      },
    };
  }

  // "Schedule AI interviews for availability on top 10 matched"
  if (/interview|schedul/.test(c)) {
    return {
      steps: ['Thinking…', 'Picking top 10 by match score…', 'Calling to confirm availability…', 'Running AI interviews…', 'Booking time slots…'],
      start: () => onAction('interview'),
      finish: () => ({
        result: 'AI interviews run with your top 10 matched — 7 passed and are booked for this week.',
        toast: { title: 'Interviews scheduled', body: '7 AI interviews completed and booked with top matched candidates.' },
      }),
    };
  }

  // "Reactivate qualified candidates" / "text workers about the role"
  if (/reactivat|re-engage|previous|\bsms\b|\btext/.test(c)) {
    return {
      steps: ['Thinking…', 'Searching past qualified candidates…', 'Sending SMS re-engagement…', 'Tracking replies…', 'Updating your pipeline…'],
      start: () => onAction('sms'),
      finish: () => ({
        result: '8 previous candidates reactivated — 3 already responded and want this role.',
        toast: { title: 'Workers reactivated', body: '8 qualified workers re-engaged via SMS and voice.' },
      }),
    };
  }

  // "Call top 10 matched candidates and confirm availability"
  if (/\bcall|ring|phone/.test(c)) {
    return {
      steps: ['Thinking…', 'Selecting top matched candidates…', 'Calling workers…', 'Confirming availability…', 'Generating summary…'],
      start: () => onAction('call'),
      finish: () => ({
        result: 'Called your top 10 matched candidates — 8 confirmed availability for this week.',
        toast: { title: 'Calls completed', body: '8 of 10 candidates confirmed availability. Summaries ready.' },
      }),
    };
  }

  // "Find more Spanish-speaking warehouse workers"
  if (/find|more|source|search/.test(c)) {
    return {
      steps: ['Thinking…', 'Scanning the worker network…', 'Matching to your role…', 'Screening top prospects…', 'Ranking results…'],
      finish: () => ({
        result: '15 new workers found — 6 strong matches added to your talent pool.',
        toast: { title: 'New workers found', body: '6 strong matches added to your campaign.' },
      }),
    };
  }

  // Anything else: Sarah still gets it done
  const res = GENERIC_RESULTS[genericIdx++ % GENERIC_RESULTS.length];
  return {
    steps: ['Thinking…', 'Finding candidates…', 'Calling workers…', 'Collecting availability…', 'Generating summary…'],
    finish: () => ({ result: res.summary, toast: res.toast }),
  };
}

// ─── ActionPanel: live view of Sarah calling / interviewing / texting ────────

const PANEL_META: Record<ActionKind, { title: string; sub: string; active: string; icon: React.ReactNode }> = {
  call:      { title: 'Calling candidates',  sub: 'Confirming availability by phone',   active: 'On call…',        icon: <PhoneCall className="w-4 h-4" /> },
  interview: { title: 'AI interviews',       sub: 'Screening your top matched workers', active: 'Interviewing…',   icon: <Calendar className="w-4 h-4" /> },
  sms:       { title: 'SMS re-engagement',   sub: 'Re-activating qualified workers',    active: 'Sending…',        icon: <MessageSquare className="w-4 h-4" /> },
};

const PANEL_OUTCOMES: Record<ActionKind, string[]> = {
  call:      ['Available ✓', 'Available ✓', 'Voicemail', 'Available ✓', 'Available ✓', 'Available ✓'],
  interview: ['Passed · Thu 10:00', 'Passed · Fri 14:30', 'Needs review', 'Passed · Thu 11:30', 'Passed · Mon 09:00', 'Passed · Tue 15:00'],
  sms:       ['Replied “YES”', 'Delivered ✓', 'Replied “YES”', 'Delivered ✓', 'Replied “interested”', 'Delivered ✓'],
};

function panelLines(kind: ActionKind, c: Candidate): { who: 'sarah' | 'cand'; text: string }[] {
  const first = c.name.split(' ')[0];
  if (kind === 'call') return [
    { who: 'sarah', text: `Hi ${first}, it's Sarah from GigGrab — still available for the ${c.role} role this week?` },
    { who: 'cand',  text: 'Yes — I can start straight away.' },
  ];
  if (kind === 'interview') return [
    { who: 'sarah', text: `Walk me through your recent ${c.role.toLowerCase()} experience.` },
    { who: 'cand',  text: `${c.experience.replace('yr', ' years')}, mostly nights — happy to do weekends too.` },
  ];
  return [
    { who: 'sarah', text: `SMS → ${first}: “New ${c.role} role near ${c.location} — interested? Reply YES”` },
    { who: 'cand',  text: 'YES — when can I start?' },
  ];
}

function ActionPanel({ kind, candidates, onClose }: {
  kind: ActionKind;
  candidates: Candidate[];
  onClose: () => void;
}) {
  const meta = PANEL_META[kind];
  const items = candidates.slice(0, 6);
  // Each candidate takes two ticks: line 1 of the exchange, then line 2 + outcome.
  const [p, setP] = useState(0);
  const total = items.length * 2;

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setInterval(() => {
      setP(prev => {
        if (prev >= total) { clearInterval(t); return prev; }
        return prev + 1;
      });
    }, reduced ? 150 : 1300);
    return () => clearInterval(t);
  }, [total]);

  const activeIdx = Math.floor(p / 2);
  const allDone = p >= total;
  const doneCount = Math.min(activeIdx, items.length);
  const active = !allDone ? items[activeIdx] : null;
  const lines = active ? panelLines(kind, active).slice(0, (p % 2) + 1) : [];

  return (
    <aside className="w-80 shrink-0 bg-white border-l border-gray-100 flex flex-col min-h-0 gg-anim" style={{ animation: 'ggPanel .25s both' }}>
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] border border-[#a7f3d0] text-[#059669] flex items-center justify-center shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{meta.title}</span>
            {!allDone && (
              <span className="flex items-center gap-1 text-xs text-[#059669]" style={{ fontWeight: 700 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] gg-anim" style={{ animation: 'ggBlink 1.2s infinite' }} />
                LIVE
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{meta.sub}</div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-600 shrink-0 mt-0.5" aria-label="Close panel">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Candidate queue */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {items.map((c, i) => {
          const isDone = i < activeIdx || allDone;
          const isActive = !allDone && i === activeIdx;
          const outcome = PANEL_OUTCOMES[kind][i % PANEL_OUTCOMES[kind].length];
          const muted = outcome === 'Voicemail' || outcome === 'Delivered ✓' || outcome === 'Needs review';
          return (
            <div key={c.id} className={`rounded-xl border px-3 py-2.5 transition-colors ${isActive ? 'border-[#a7f3d0] bg-[#f0fdf4]/60' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c.color, fontSize: '0.65rem', fontWeight: 700 }}>{c.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="text-xs text-gray-400" style={{ fontSize: '0.68rem' }}>{c.score}% match · {c.location}</div>
                </div>
                {isDone ? (
                  <span className={`text-xs rounded-full px-2 py-0.5 shrink-0 ${muted ? 'bg-gray-100 text-gray-500' : 'bg-[#f0fdf4] text-[#15803d]'}`} style={{ fontWeight: 600, fontSize: '0.66rem' }}>
                    {outcome}
                  </span>
                ) : isActive ? (
                  <span className="flex items-center gap-1.5 text-xs text-[#b45309] bg-amber-50 rounded-full px-2 py-0.5 shrink-0" style={{ fontWeight: 600, fontSize: '0.66rem' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 gg-anim" style={{ animation: 'ggBlink 1s infinite' }} />
                    {meta.active}
                  </span>
                ) : (
                  <span className="text-xs text-gray-300 shrink-0" style={{ fontSize: '0.66rem', fontWeight: 500 }}>Queued</span>
                )}
              </div>

              {/* Live exchange for the active candidate */}
              {isActive && lines.length > 0 && (
                <div className="mt-2.5 space-y-1.5 pl-9">
                  {lines.map((l, li) => (
                    <div
                      key={li}
                      className="text-xs leading-relaxed px-2.5 py-1.5 gg-anim"
                      style={{
                        animation: 'ggFadeUp .3s both',
                        backgroundColor: l.who === 'sarah' ? '#f9fafb' : '#f0fdf4',
                        color: '#374151',
                        borderRadius: l.who === 'sarah' ? '4px 10px 10px 10px' : '10px 4px 10px 10px',
                        marginLeft: l.who === 'cand' ? '16px' : 0,
                        marginRight: l.who === 'sarah' ? '16px' : 0,
                      }}
                    >
                      {l.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        {allDone ? (
          <div className="flex items-center gap-2 text-xs text-[#15803d] bg-[#f0fdf4] border border-[#a7f3d0] rounded-xl px-3 py-2.5 gg-anim" style={{ fontWeight: 600, animation: 'ggFadeUp .3s both' }}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            Done — {items.length}/{items.length} contacted. Results are in your pipeline.
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span style={{ fontWeight: 500 }}>{doneCount} of {items.length} complete</span>
            <span className="flex items-center gap-1.5 text-[#059669]" style={{ fontWeight: 600 }}>
              <Bot className="w-3.5 h-3.5" />
              Sarah is working
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── ImportPanel: Sarah pulls jobs from a careers page / job post link ──────

interface PulledJob { title: string; location: string; salary: string; workerReach: number }

const IMPORT_RESULTS: PulledJob[] = [
  { title: 'Picker / Packer',  location: 'Manchester, UK', salary: '£11–13/hr', workerReach: 580 },
  { title: 'Delivery Driver',  location: 'Salford, UK',    salary: '£13–15/hr', workerReach: 320 },
  { title: 'Cleaner',          location: 'Manchester, UK', salary: '£11–12/hr', workerReach: 420 },
  { title: 'Security Officer', location: 'Trafford, UK',   salary: '£12–14/hr', workerReach: 190 },
  { title: 'Kitchen Porter',   location: 'Manchester, UK', salary: '£11/hr',    workerReach: 260 },
];

let importSeq = 10;

const IMPORT_STEPS = [
  'Opening the page…',
  'Scanning for job posts…',
  'Reading descriptions…',
  'Extracting pay, shifts & location…',
  'Ranking by fill difficulty…',
];

function ImportPanel({ onClose, onImport }: {
  onClose: () => void;
  onImport: (jobs: PulledJob[]) => void;
}) {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<'input' | 'pulling' | 'select' | 'done'>('input');
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set(IMPORT_RESULTS.map((_, i) => i)));

  const step = Math.min(tick, IMPORT_STEPS.length - 1);
  const revealed = Math.max(0, Math.min(tick - 1, IMPORT_RESULTS.length));

  const pull = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setPhase('pulling');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 120 : 950;
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      setTick(t);
      if (t >= IMPORT_RESULTS.length + 2) { clearInterval(iv); setPhase('select'); }
    }, ms);
  };

  const toggle = (i: number) =>
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const confirm = () => {
    onImport(IMPORT_RESULTS.filter((_, i) => selected.has(i)));
    setPhase('done');
  };

  return (
    <aside className="w-80 shrink-0 bg-white border-l border-gray-100 flex flex-col min-h-0 gg-anim" style={{ animation: 'ggPanel .25s both' }}>
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] border border-[#a7f3d0] text-[#059669] flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Import jobs</span>
            {phase === 'pulling' && (
              <span className="flex items-center gap-1 text-xs text-[#059669]" style={{ fontWeight: 700 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] gg-anim" style={{ animation: 'ggBlink 1.2s infinite' }} />
                LIVE
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Careers page or job post link</div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-600 shrink-0 mt-0.5" aria-label="Close panel">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {phase === 'input' && (
          <form onSubmit={pull} className="gg-in">
            <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>Paste a link</label>
            <input
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="company.com/careers or job post URL"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#10b981] transition-colors mb-3"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              type="submit"
              disabled={!url.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-white rounded-xl py-2.5 text-sm transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Bot className="w-4 h-4" />
              Pull jobs
            </button>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Sarah reads the page, extracts every open role with pay, shifts and
              location — then you pick which ones to launch.
            </p>
          </form>
        )}

        {phase !== 'input' && (
          <>
            {/* Live steps while pulling */}
            {phase === 'pulling' && (
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <span className="w-4 h-4 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin shrink-0" />
                <span key={step} className="text-sm text-gray-800 gg-anim" style={{ fontWeight: 600, animation: 'ggFadeUp .25s both' }}>
                  {IMPORT_STEPS[step]}
                </span>
              </div>
            )}
            {phase === 'select' && (
              <div className="text-sm text-gray-800 mb-3 px-1 gg-anim" style={{ fontWeight: 600, animation: 'ggFadeUp .25s both' }}>
                Found {IMPORT_RESULTS.length} open roles — pick which to launch.
              </div>
            )}
            {phase === 'done' && (
              <div className="flex items-center gap-2 text-xs text-[#15803d] bg-[#f0fdf4] border border-[#a7f3d0] rounded-xl px-3 py-2.5 mb-3 gg-anim" style={{ fontWeight: 600, animation: 'ggFadeUp .3s both' }}>
                <CheckCircle className="w-4 h-4 shrink-0" />
                {selected.size} job{selected.size !== 1 ? 's' : ''} imported. Sarah is sizing the worker pool for each.
              </div>
            )}

            {/* Pulled jobs appear one by one */}
            <div className="space-y-1.5">
              {IMPORT_RESULTS.slice(0, phase === 'pulling' ? revealed : IMPORT_RESULTS.length).map((j, i) => (
                <div
                  key={j.title}
                  onClick={phase === 'select' ? () => toggle(i) : undefined}
                  className={`rounded-xl border px-3 py-2.5 gg-anim transition-colors ${
                    phase === 'select' ? 'cursor-pointer' : ''
                  } ${phase !== 'pulling' && selected.has(i) ? 'border-[#a7f3d0] bg-[#f0fdf4]/50' : 'border-gray-100'}`}
                  style={{ animation: 'ggFadeUp .3s both' }}
                >
                  <div className="flex items-center gap-2.5">
                    {phase === 'pulling' ? (
                      <span className="w-4 h-4 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 gg-anim" style={{ animation: 'ggFadeUp .2s both' }}>
                        <CheckCircle className="w-3 h-3" />
                      </span>
                    ) : (
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selected.has(i) ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selected.has(i) && <CheckCircle className="w-3 h-3" />}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{j.title}</div>
                      <div className="text-xs text-gray-400" style={{ fontSize: '0.68rem' }}>{j.location} · {j.salary}</div>
                    </div>
                    {phase === 'pulling' && (
                      <span className="text-xs text-[#059669] shrink-0" style={{ fontSize: '0.66rem', fontWeight: 600 }}>pulled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        {phase === 'select' && (
          <button
            onClick={confirm}
            disabled={selected.size === 0}
            className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-white rounded-xl py-2.5 text-sm transition-colors"
            style={{ fontWeight: 700 }}
          >
            Add {selected.size} job{selected.size !== 1 ? 's' : ''} to campaigns
          </button>
        )}
        {phase === 'done' && (
          <button
            onClick={onClose}
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-2.5 text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            Close
          </button>
        )}
        {(phase === 'input' || phase === 'pulling') && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span style={{ fontWeight: 500 }}>{phase === 'pulling' ? `${revealed} of ${IMPORT_RESULTS.length} pulled` : 'Indeed, LinkedIn, careers pages'}</span>
            <span className="flex items-center gap-1.5 text-[#059669]" style={{ fontWeight: 600 }}>
              <Bot className="w-3.5 h-3.5" />
              {phase === 'pulling' ? 'Sarah is reading' : 'Sarah is ready'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

function AgentDock({ onToast, onShowArea, onAction }: {
  onToast: (t: Omit<Toast, 'id'>) => void;
  onShowArea: (area: string) => number;
  onAction: (kind: ActionKind) => void;
}) {
  const [command, setCommand] = useState('');
  const [running, setRunning] = useState<{ cmd: string; step: number; steps: string[] } | null>(null);
  const [history, setHistory] = useState<{ id: number; cmd: string; result: string }[]>([]);

  const run = (text: string) => {
    const cmd = text.trim();
    if (!cmd || running) return;
    const plan = buildPlan(cmd, onShowArea, onAction);
    setCommand('');
    setRunning({ cmd, step: 0, steps: plan.steps });
    plan.start?.();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = reduced ? 120 : 850;
    let s = 0;
    const t = setInterval(() => {
      s += 1;
      if (s < plan.steps.length) { setRunning(r => (r ? { ...r, step: s } : r)); return; }
      clearInterval(t);
      const { result, toast } = plan.finish();
      setHistory(prev => [...prev, { id: Date.now(), cmd, result }].slice(-3));
      setRunning(null);
      onToast(toast);
    }, tick);
  };

  return (
    <div className="shrink-0 pt-2 pb-5">
      {/* Sarah working / completed tasks — in place, above the bar */}
      {(history.length > 0 || running) && (
        <div className="space-y-2 mb-2.5">
          {history.map(h => (
            <div key={h.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-2.5 gg-anim" style={{ animation: 'ggFadeUp .3s both' }}>
              <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 truncate">“{h.cmd}”</div>
                <div className="text-sm text-gray-800 mt-0.5 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                  <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  {h.result}
                </div>
              </div>
              <button onClick={() => setHistory(prev => prev.filter(x => x.id !== h.id))} className="text-gray-300 hover:text-gray-500 shrink-0" aria-label="Dismiss">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {running && (
            <div className="bg-white border border-[#a7f3d0] rounded-xl px-4 py-3 gg-anim" style={{ animation: 'ggFadeUp .3s both' }}>
              <div className="text-xs text-gray-400 truncate mb-1.5">“{running.cmd}”</div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin shrink-0" />
                <div className="flex-1">
                  <div key={running.step} className="text-sm text-gray-800 gg-anim" style={{ fontWeight: 600, animation: 'ggFadeUp .25s both' }}>
                    {running.steps[running.step]}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {running.steps.map((_, i) => (
                      <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= running.step ? '#10b981' : '#e5e7eb' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example commands */}
      {!running && history.length === 0 && (
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {EXAMPLE_COMMANDS.map(c => (
            <button
              key={c}
              onClick={() => run(c)}
              className="text-xs text-gray-500 bg-white border border-gray-200 hover:border-[#10b981] hover:text-[#059669] rounded-full px-3 py-1 transition-colors"
              style={{ fontWeight: 500 }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Chat bar */}
      <form onSubmit={e => { e.preventDefault(); run(command); }}>
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-2 transition-colors focus-within:border-[#10b981] focus-within:shadow-md">
          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 relative">
            <Bot className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] border-2 border-white gg-anim" style={{ animation: 'ggBlink 1.4s infinite' }} />
          </div>
          <input
            value={command}
            onChange={e => setCommand(e.target.value)}
            disabled={!!running}
            placeholder={running ? 'Sarah is working…' : 'Tell Sarah what you need…'}
            className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50 min-w-0"
            style={{ fontFamily: 'inherit' }}
          />
          <button
            type="submit"
            disabled={!!running || !command.trim()}
            className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-30 text-white rounded-full px-4 py-2 text-xs transition-colors shrink-0"
            style={{ fontWeight: 700 }}
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-16 right-5 z-50 space-y-2 w-80">
      {toasts.map(t => (
        <div key={t.id} className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 flex items-start gap-2.5 gg-anim" style={{ animation: 'ggToastIn .3s both' }}>
          <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-900" style={{ fontWeight: 700 }}>{t.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t.body}</div>
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-gray-300 hover:text-gray-500 shrink-0"><XCircle className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [view, setView]                       = useState<View>('dashboard');
  const [jobs, setJobs]                       = useState<Job[]>(INITIAL_JOBS);
  const [candidatePool, setCandidatePool]     = useState<Candidate[]>(CANDIDATES);
  const [selectedJobId, setSelectedJobId]     = useState('1');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusFilter, setStatusFilter]       = useState('All');
  const [search, setSearch]                   = useState('');
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [toasts, setToasts]                   = useState<Toast[]>([]);

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 6000);
  };

  // Sarah works in the background: surface a completed task shortly after load
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => pushToast({
      title: 'New qualified candidate found',
      body: 'Maria Santos — 87% match for Warehouse Associate.',
    }), 12000);
    return () => clearTimeout(t);
  }, []);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const updateJob = (id: string, patch: Partial<Job>) =>
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));

  const openProfile = (c: Candidate) => {
    setSelectedCandidate(c);
    setView('profile');
  };

  const addImportedJobs = (pulled: PulledJob[]) => {
    setJobs(prev => [...prev, ...pulled.map(p => ({
      id: `imp-${importSeq++}`, title: p.title, location: p.location,
      status: 'Active' as const, promotion: 'FREE' as const,
      budget: 0, totalSpend: 0, candidates: 0, qualified: 0,
      awaitingReview: 0, interviews: 0, daysToFill: 14,
      postedAt: 'just now', salary: p.salary,
      imported: true, workerReach: p.workerReach,
    }))]);
    setView('jobs');
    pushToast({
      title: `${pulled.length} job${pulled.length !== 1 ? 's' : ''} imported`,
      body: 'Start a campaign for any role to reach workers now.',
    });
  };

  const jobCandidates = candidatePool.filter(c => c.jobId === selectedJobId);
  const filteredCandidates = jobCandidates.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Agent effect: surface candidates for an area the user asked about.
  // Sarah "finds" new local workers if the pool doesn't have enough there yet.
  const showAreaCandidates = (area: string): number => {
    const norm = area.trim().toLowerCase();
    const existing = jobCandidates.filter(c => c.location.toLowerCase().includes(norm));
    let added: Candidate[] = [];
    if (existing.length < 3) added = synthCandidates(area, selectedJob, 3 - existing.length);
    if (added.length) setCandidatePool(prev => [...prev, ...added]);
    setStatusFilter('All');
    setSearch(area.trim());
    return existing.length + added.length;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{AGENT_CSS}</style>
      <ToastStack toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-2.5">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>GigGrab</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[#059669]" style={{ fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] gg-anim" style={{ animation: 'ggBlink 1.4s infinite' }} />
            Sarah on duty
          </span>
          <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500" style={{ fontWeight: 600 }}>M</div>
        </div>
      </header>

      {/* ── Nav drawer (pops out on click) ───────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/25" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white shadow-2xl flex flex-col gg-anim" style={{ animation: 'ggDrawer .2s both' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>GigGrab</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close menu">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 py-4">
              <button
                onClick={() => navigate('/post-job')}
                className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg py-2 text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                Post a new job
              </button>
            </div>

            <nav className="flex-1 px-2">
              {[
                { id: 'dashboard',  icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
                { id: 'jobs',       icon: <Briefcase className="w-4 h-4" />,       label: 'Campaigns' },
                { id: 'candidates', icon: <Users className="w-4 h-4" />,           label: 'Candidates' },
                { id: 'settings',   icon: <Settings className="w-4 h-4" />,        label: 'Settings' },
              ].map(item => {
                const active = view === item.id || (view === 'profile' && item.id === 'candidates');
                return (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id as View); setSelectedCandidate(null); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5"
                    style={{
                      fontWeight: active ? 600 : 400,
                      backgroundColor: active ? '#f0fdf4' : 'transparent',
                      color: active ? '#10b981' : '#6b7280',
                    }}
                  >
                    <span className={active ? 'text-[#10b981]' : 'text-gray-400'}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="px-3 pb-4 border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500" style={{ fontWeight: 600 }}>M</div>
                <span className="text-xs text-gray-500 truncate" style={{ fontWeight: 500 }}>M&S Logistics Ltd</span>
              </div>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
                Visit Help Center
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className={`flex-1 min-h-0 flex flex-col min-w-0 ${view === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {view === 'dashboard' && (
          <DashboardView
            jobs={jobs}
            selectedJob={selectedJob}
            onSelectJob={id => { setSelectedJobId(id); setStatusFilter('All'); setSearch(''); }}
            candidates={filteredCandidates}
            search={search} onSearch={setSearch}
            statusFilter={statusFilter} onStatusFilter={setStatusFilter}
            onOpenCandidate={openProfile}
            onToast={pushToast}
            onShowArea={showAreaCandidates}
            onImportJobs={addImportedJobs}
          />
        )}
        {view === 'jobs' && (
          <JobsView
            jobs={jobs}
            onToggleStatus={id => updateJob(id, { status: jobs.find(j => j.id === id)?.status === 'Active' ? 'Paused' : 'Active' })}
            onSelectJob={id => { setSelectedJobId(id); setView('dashboard'); }}
            onStartCampaign={() => navigate('/choose-plan')}
          />
        )}
        {view === 'candidates' && (
          <CandidatesView
            candidates={candidatePool}
            statusFilter={statusFilter} onStatusFilter={setStatusFilter}
            search={search} onSearch={setSearch}
            onOpenCandidate={openProfile}
          />
        )}
        {view === 'profile' && selectedCandidate && (
          <ProfileView
            candidate={selectedCandidate}
            onBack={() => setView('candidates')}
            onStatusChange={(id, status) => {
              /* in a real app: update candidates state */
            }}
          />
        )}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

// ─── Dashboard view ──────────────────────────────────────────────────────────

function DashboardView({ jobs, selectedJob, onSelectJob, candidates, search, onSearch, statusFilter, onStatusFilter, onOpenCandidate, onToast, onShowArea, onImportJobs }: {
  jobs: Job[];
  selectedJob: Job;
  onSelectJob: (id: string) => void;
  candidates: Candidate[];
  search: string; onSearch: (s: string) => void;
  statusFilter: string; onStatusFilter: (s: string) => void;
  onOpenCandidate: (c: Candidate) => void;
  onToast: (t: Omit<Toast, 'id'>) => void;
  onShowArea: (area: string) => number;
  onImportJobs: (jobs: PulledJob[]) => void;
}) {
  const matched = [...candidates].sort((a, b) => b.score - a.score);
  const [action, setAction] = useState<{ kind: ActionKind; id: number } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex-1 min-h-0 flex w-full overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col max-w-3xl mx-auto px-6 min-w-0">
      {/* Greeting + import */}
      <div className="pt-5 pb-3 shrink-0 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-gray-900 mb-0.5" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Good morning, Michael 👋</h1>
          <p className="text-sm text-gray-400">Sarah is working on {jobs.filter(j => j.status === 'Active').length} active campaigns — tell her what you need below.</p>
        </div>
        <button
          onClick={() => { setAction(null); setImportOpen(true); }}
          className="flex items-center gap-1.5 border border-gray-200 hover:border-[#10b981] hover:text-[#059669] bg-white text-gray-600 rounded-lg px-3.5 py-2 text-xs transition-colors shrink-0 mt-1"
          style={{ fontWeight: 600 }}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Import jobs
        </button>
      </div>

      {/* Campaign chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 shrink-0">
        {jobs.map(job => {
          const active = job.id === selectedJob.id;
          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs whitespace-nowrap transition-all shrink-0"
              style={{
                backgroundColor: active ? '#f0fdf4' : '#fff',
                borderColor: active ? '#10b981' : '#e5e7eb',
                color: active ? '#059669' : '#6b7280',
                fontWeight: active ? 700 : 500,
              }}
            >
              {job.title}
              <span style={{ color: active ? '#15803d' : '#9ca3af', fontWeight: 600 }}>{job.qualified}</span>
            </button>
          );
        })}
      </div>

      {/* Matched candidates */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <span className="text-gray-900" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Matched candidates
            <span className="text-gray-300 ml-1.5" style={{ fontWeight: 500 }}>{matched.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#10b981] w-36 transition-colors" style={{ fontFamily: 'inherit' }} />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => onStatusFilter(e.target.value)} className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg outline-none bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
                {['All', 'Qualified', 'Available', 'Review', 'Interview', 'Shortlisted'].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matched.length === 0
            ? <div className="py-16 text-center text-sm text-gray-400">No candidates match your filters.</div>
            : matched.map((c, i) => <CandidateRow key={c.id} candidate={c} index={i} onClick={() => onOpenCandidate(c)} last={i === matched.length - 1} />)
          }
        </div>
      </div>

        {/* ── Agentic command bar ── */}
        <AgentDock
          onToast={onToast}
          onShowArea={onShowArea}
          onAction={kind => { setImportOpen(false); setAction({ kind, id: Date.now() }); }}
        />
      </div>

      {/* ── Live action panel (calls / interviews / SMS) ── */}
      {action && !importOpen && (
        <ActionPanel
          key={action.id}
          kind={action.kind}
          candidates={matched.length ? matched : candidates}
          onClose={() => setAction(null)}
        />
      )}

      {/* ── Job import panel ── */}
      {importOpen && (
        <ImportPanel
          onClose={() => setImportOpen(false)}
          onImport={onImportJobs}
        />
      )}
    </div>
  );
}

// ─── Candidate row ───────────────────────────────────────────────────────────

function CandidateRow({ candidate: c, onClick, last, index = 0 }: { candidate: Candidate; onClick: () => void; last: boolean; index?: number }) {
  const s = STATUS_STYLE[c.status] || STATUS_STYLE.Review;
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors gg-in ${last ? '' : 'border-b border-gray-100'}`} style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0" style={{ backgroundColor: c.color, fontWeight: 700 }}>{c.initials}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>{c.name}</span>
          {c.badge && <span className="text-xs text-[#10b981] bg-[#f0fdf4] px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>{c.badge}</span>}
        </div>
        <div className="text-xs text-gray-500 mb-0.5">{c.role} · {c.experience}</div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />{c.location}
          <span>·</span>
          <Globe className="w-3 h-3" />{c.languages.join(', ')}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-0.5">{c.score}% match</div>
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: s.bg, color: s.text, fontWeight: 600 }}>{c.status}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
}

// ─── Profile view ─────────────────────────────────────────────────────────────

function ProfileView({ candidate: c, onBack, onStatusChange }: {
  candidate: Candidate;
  onBack: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [tab, setTab]           = useState<ProfileTab>('summary');
  const [status, setStatus]     = useState(c.status);
  const [interviews, setInterviews] = useState<Interview[]>(c.interviews);
  const [showScheduler, setShowScheduler] = useState(false);
  const [newInterview, setNewInterview]   = useState({ date: '', time: '', type: 'Phone' as const, notes: '' });

  const s = STATUS_STYLE[status] || STATUS_STYLE.Review;

  const scheduleInterview = () => {
    if (!newInterview.date || !newInterview.time) return;
    const interview: Interview = {
      id: `i${Date.now()}`,
      date: newInterview.date,
      time: newInterview.time,
      type: newInterview.type,
      status: 'Upcoming',
      notes: newInterview.notes,
    };
    setInterviews(prev => [...prev, interview]);
    setStatus('Interview');
    setShowScheduler(false);
    setNewInterview({ date: '', time: '', type: 'Phone', notes: '' });
    setTab('interviews');
  };

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'summary',    label: 'Screening Summary' },
    { id: 'transcript', label: 'Transcript' },
    { id: 'interviews', label: `Interviews${interviews.length ? ` (${interviews.length})` : ''}` },
    { id: 'profile',    label: 'Profile' },
  ];

  return (
    <div className="flex-1 px-8 py-7">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-5 transition-colors" style={{ fontWeight: 500 }}>
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_210px] gap-5">
        {/* Left */}
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c.color, fontSize: '1.1rem', fontWeight: 700 }}>{c.initials}</div>
              <div className="flex-1">
                <div className="text-gray-900 mb-0.5" style={{ fontSize: '1.15rem', fontWeight: 700 }}>{c.name}</div>
                <div className="text-sm text-gray-400 mb-2">{c.role} · {c.job}</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: s.bg, color: s.text, fontWeight: 600 }}>{status}</span>
                  <span className="text-xs text-gray-400">Match score: <span style={{ fontWeight: 700, color: '#10b981' }}>{c.score}/100</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="px-5 py-3 text-xs transition-colors border-b-2"
                  style={{
                    fontWeight: tab === t.id ? 700 : 500,
                    borderBottomColor: tab === t.id ? '#10b981' : 'transparent',
                    color: tab === t.id ? '#10b981' : '#6b7280',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5">
              {/* ── Screening Summary ── */}
              {tab === 'summary' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs text-[#059669] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span style={{ fontWeight: 600 }}>AI-generated screening summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Experience',          value: c.screeningSummary.experience },
                      { label: 'Availability',         value: c.screeningSummary.availability },
                      { label: 'Certifications',       value: c.screeningSummary.certifications },
                      { label: 'Languages',            value: c.screeningSummary.languages },
                      { label: 'Salary Expectations',  value: c.screeningSummary.salaryExpectations },
                    ].map(({ label, value }) => (
                      <div key={label} className={label === 'Experience' ? 'col-span-2' : ''}>
                        <div className="text-xs text-gray-400 mb-1">{label}</div>
                        <div className="text-sm text-gray-700 leading-relaxed" style={{ fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-[#15803d] mb-2" style={{ fontWeight: 700 }}>Key Strengths</div>
                      <ul className="space-y-1.5">
                        {c.screeningSummary.strengths.map(s => (
                          <li key={s} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-[#b45309] mb-2" style={{ fontWeight: 700 }}>Potential Concerns</div>
                      <ul className="space-y-1.5">
                        {c.screeningSummary.concerns.map(concern => (
                          <li key={concern} className="flex items-start gap-2 text-xs text-gray-600">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Transcript ── */}
              {tab === 'transcript' && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>AI screening call · {c.transcript.length} exchanges</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {c.transcript.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.speaker === 'Candidate' ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                          style={{ backgroundColor: msg.speaker === 'AI' ? '#10b981' : c.color, fontWeight: 700 }}
                        >
                          {msg.speaker === 'AI' ? 'AI' : c.initials}
                        </div>
                        <div className={`max-w-[78%] ${msg.speaker === 'Candidate' ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className="text-xs text-gray-400 mb-1 px-1" style={{ fontWeight: 500 }}>
                            {msg.speaker === 'AI' ? 'GigGrab AI' : c.name} · {msg.time}
                          </div>
                          <div
                            className="rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                            style={{
                              backgroundColor: msg.speaker === 'AI' ? '#f9fafb' : '#f0fdf4',
                              color: '#374151',
                              borderRadius: msg.speaker === 'AI' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Interviews ── */}
              {tab === 'interviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500" style={{ fontWeight: 600 }}>Interview History</span>
                    <button
                      onClick={() => setShowScheduler(true)}
                      className="inline-flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-3 py-1.5 text-xs transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Interview
                    </button>
                  </div>

                  {interviews.length === 0 && !showScheduler && (
                    <div className="py-10 text-center text-sm text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                      No interviews scheduled yet.
                    </div>
                  )}

                  {interviews.map(iv => (
                    <div key={iv.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${iv.status === 'Upcoming' ? 'bg-[#10b981]' : iv.status === 'Completed' ? 'bg-gray-400' : 'bg-red-400'}`} />
                        <div>
                          <div className="text-sm text-gray-900 mb-0.5" style={{ fontWeight: 600 }}>{iv.type} Interview</div>
                          <div className="text-xs text-gray-500 mb-1">{iv.date} at {iv.time}</div>
                          {iv.notes && <div className="text-xs text-gray-400">{iv.notes}</div>}
                        </div>
                      </div>
                      <span className="text-xs rounded-full px-2 py-0.5" style={{
                        backgroundColor: iv.status === 'Upcoming' ? '#f0fdf4' : iv.status === 'Completed' ? '#f3f4f6' : '#fef2f2',
                        color: iv.status === 'Upcoming' ? '#15803d' : iv.status === 'Completed' ? '#6b7280' : '#b91c1c',
                        fontWeight: 600,
                      }}>
                        {iv.status}
                      </span>
                    </div>
                  ))}

                  {/* Scheduler form */}
                  {showScheduler && (
                    <div className="border border-[#a7f3d0] bg-[#f0fdf4] rounded-xl p-4 space-y-3">
                      <div className="text-xs text-gray-700 mb-1" style={{ fontWeight: 700 }}>New Interview</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Date</label>
                          <input type="date" value={newInterview.date} onChange={e => setNewInterview(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#10b981]" style={{ fontFamily: 'inherit' }} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Time</label>
                          <input type="time" value={newInterview.time} onChange={e => setNewInterview(p => ({ ...p, time: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#10b981]" style={{ fontFamily: 'inherit' }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Type</label>
                        <select value={newInterview.type} onChange={e => setNewInterview(p => ({ ...p, type: e.target.value as any }))} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none bg-white" style={{ fontFamily: 'inherit' }}>
                          {['Phone', 'Video', 'In-person'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
                        <input value={newInterview.notes} onChange={e => setNewInterview(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Meet at reception, ask about FLT experience…" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#10b981]" style={{ fontFamily: 'inherit' }} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setShowScheduler(false)} className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50" style={{ fontWeight: 500 }}>Cancel</button>
                        <button onClick={scheduleInterview} className="flex-1 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs transition-colors" style={{ fontWeight: 600 }}>Confirm</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Profile details ── */}
              {tab === 'profile' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    { label: 'Availability',      value: c.availability },
                    { label: 'Location',           value: c.location },
                    { label: 'Experience',         value: c.experience },
                    { label: 'Employment Status',  value: c.employmentStatus },
                    { label: 'Languages',          value: c.languages.join(', ') },
                    { label: 'Certifications',     value: c.certifications.join(', ') || 'None listed' },
                    { label: 'Salary Expectation', value: c.salaryExpectation },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                      <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right actions panel */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-4">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide" style={{ fontWeight: 600 }}>Actions</div>
            <div className="space-y-2">
              <button onClick={() => setTab('interviews')} className="w-full flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg px-3 py-2 text-xs transition-colors" style={{ fontWeight: 500 }}>
                <Calendar className="w-3.5 h-3.5" />
                Schedule Interview
              </button>
              <button onClick={() => { setStatus('Shortlisted'); }} className="w-full flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg px-3 py-2 text-xs transition-colors" style={{ fontWeight: 500 }}>
                <Star className="w-3.5 h-3.5" />
                Shortlist
              </button>
              <button className="w-full flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-3 py-2 text-xs transition-colors" style={{ fontWeight: 600 }}>
                <CheckCircle className="w-3.5 h-3.5" />
                Mark as Hired
              </button>
              <button onClick={() => setStatus('Rejected')} className="w-full flex items-center gap-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg px-3 py-2 text-xs transition-colors" style={{ fontWeight: 500 }}>
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-4">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide" style={{ fontWeight: 600 }}>Contact</div>
            <button className="w-full flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg px-3 py-2 text-xs transition-colors" style={{ fontWeight: 500 }}>
              <Phone className="w-3.5 h-3.5" />
              Request Contact Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Jobs view ───────────────────────────────────────────────────────────────

function JobsView({ jobs, onToggleStatus, onSelectJob, onStartCampaign }: {
  jobs: Job[];
  onToggleStatus: (id: string) => void;
  onSelectJob: (id: string) => void;
  onStartCampaign: (job: Job) => void;
}) {
  const [filter, setFilter] = useState('All');
  const importedJobs = jobs.filter(j => j.imported);
  const activeJobs = jobs.filter(j => !j.imported);
  const filtered = filter === 'All' ? activeJobs : activeJobs.filter(j => j.status === filter);

  return (
    <div className="flex-1 px-8 py-7 overflow-y-auto">
      {/* Imported jobs — ready to launch */}
      {importedJobs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-gray-900" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ready to launch</h2>
            <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-amber-50 text-amber-700" style={{ fontWeight: 600 }}>{importedJobs.length} imported</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Jobs imported by Sarah — set a budget to start reaching workers.</p>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {importedJobs.map(job => (
              <div key={job.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors gg-in">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{job.title}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1.5">{job.location} · {job.salary}</div>
                  {job.workerReach && (
                    <div className="flex gap-4 text-xs">
                      <span style={{ color: '#15803d', fontWeight: 700 }}>~{job.workerReach.toLocaleString()} workers available</span>
                      <span className="text-gray-400">Set a budget to launch</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onStartCampaign(job)}
                    className="text-xs text-white bg-[#10b981] hover:bg-[#059669] px-4 py-1.5 rounded-lg transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Start Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active campaigns */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-0.5" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Campaigns</h1>
            <p className="text-sm text-gray-400">{activeJobs.length} hiring campaigns</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Active', 'Paused', 'Closed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ fontWeight: 600, backgroundColor: filter === f ? '#10b981' : 'white', color: filter === f ? 'white' : '#6b7280', border: filter === f ? 'none' : '1px solid #e5e7eb' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {filtered.map(job => (
            <div key={job.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{job.title}</span>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: job.status === 'Active' ? '#f0fdf4' : job.status === 'Paused' ? '#fef9c3' : '#f3f4f6', color: job.status === 'Active' ? '#15803d' : job.status === 'Paused' ? '#92400e' : '#6b7280', fontWeight: 600 }}>{job.status}</span>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-purple-50 text-purple-700" style={{ fontWeight: 600 }}>{job.promotion}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1.5">{job.location} · {job.salary} · £{job.budget}/day</div>
                <div className="flex gap-4 text-xs">
                  <span style={{ color: '#15803d', fontWeight: 700 }}>{job.qualified} qualified</span>
                  <span className="text-gray-400">{job.awaitingReview} awaiting review</span>
                  <span className="text-gray-400">{job.candidates} total</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onSelectJob(job.id)} className="text-xs text-[#10b981] border border-[#a7f3d0] hover:bg-[#f0fdf4] px-3 py-1.5 rounded-lg transition-colors" style={{ fontWeight: 600 }}>View</button>
                <button onClick={() => onToggleStatus(job.id)} className="text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors" style={{ fontWeight: 500 }}>{job.status === 'Active' ? 'Pause' : 'Resume'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Candidates view ─────────────────────────────────────────────────────────

function CandidatesView({ candidates, statusFilter, onStatusFilter, search, onSearch, onOpenCandidate }: {
  candidates: Candidate[]; statusFilter: string; onStatusFilter: (s: string) => void;
  search: string; onSearch: (s: string) => void; onOpenCandidate: (c: Candidate) => void;
}) {
  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === 'All' || c.status === statusFilter);
  });

  return (
    <div className="flex-1 px-8 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-0.5" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Candidates</h1>
          <p className="text-sm text-gray-400">{filtered.length} candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#10b981] w-44" style={{ fontFamily: 'inherit' }} />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => onStatusFilter(e.target.value)} className="appearance-none pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
              {['All', 'Qualified', 'Available', 'Review', 'Interview', 'Shortlisted'].map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100">
        {filtered.map((c, i) => <CandidateRow key={c.id} candidate={c} index={i} onClick={() => onOpenCandidate(c)} last={i === filtered.length - 1} />)}
        {filtered.length === 0 && <div className="py-16 text-center text-sm text-gray-400">No candidates match your filters.</div>}
      </div>
    </div>
  );
}

// ─── Settings view ────────────────────────────────────────────────────────────

function SettingsView() {
  const [activeSection, setActiveSection] = useState('account');
  const sections = [
    { id: 'account',       icon: <User className="w-4 h-4" />,       label: 'Account' },
    { id: 'billing',       icon: <CreditCard className="w-4 h-4" />, label: 'Billing' },
    { id: 'team',          icon: <Users className="w-4 h-4" />,       label: 'Team' },
    { id: 'notifications', icon: <Bell className="w-4 h-4" />,        label: 'Notifications' },
  ];

  return (
    <div className="flex-1 px-8 py-7">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-0.5" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Settings</h1>
        <p className="text-sm text-gray-400">Manage your account, billing, and team.</p>
      </div>
      <div className="grid grid-cols-[180px_1fr] gap-6">
        {/* Settings nav */}
        <div className="space-y-0.5">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors" style={{ fontWeight: activeSection === s.id ? 600 : 400, backgroundColor: activeSection === s.id ? '#f0fdf4' : 'transparent', color: activeSection === s.id ? '#10b981' : '#6b7280' }}>
              <span className={activeSection === s.id ? 'text-[#10b981]' : 'text-gray-400'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="bg-white rounded-xl border border-gray-100 px-8 py-6">
          {activeSection === 'account' && (
            <div className="space-y-6 max-w-lg">
              <div className="text-gray-900 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>Account Settings</div>
              {[
                { label: 'Company Name',    value: 'M&S Logistics Ltd',       type: 'text' },
                { label: 'Industry',        value: 'Warehousing & Logistics',  type: 'text' },
                { label: 'Contact Name',    value: 'Michael Thompson',         type: 'text' },
                { label: 'Email Address',   value: 'michael@mslogistics.co.uk', type: 'email' },
                { label: 'Phone Number',    value: '+44 7700 900123',          type: 'tel' },
                { label: 'Company Address', value: 'Manchester, UK',           type: 'text' },
              ].map(({ label, value, type }) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
                  <input type={type} defaultValue={value} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#10b981] transition-colors" style={{ fontFamily: 'inherit' }} />
                </div>
              ))}
              <button className="bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-5 py-2 text-sm transition-colors" style={{ fontWeight: 600 }}>Save Changes</button>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-6 max-w-lg">
              <div className="text-gray-900 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>Billing</div>
              <div className="bg-[#f0fdf4] border border-[#a7f3d0] rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700" style={{ fontWeight: 700 }}>Current Plan</span>
                  <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5" style={{ fontWeight: 600 }}>PREMIUM</span>
                </div>
                <div className="text-xs text-gray-500">Pay-as-you-go · No monthly commitment</div>
                <div className="mt-3 text-xs text-gray-500">Active jobs: <span style={{ fontWeight: 600, color: '#374151' }}>3</span> · Total daily budget: <span style={{ fontWeight: 600, color: '#374151' }}>£107/day</span></div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>Payment Method</div>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>Visa ending in 4242</div>
                    <div className="text-xs text-gray-400">Expires 04/28</div>
                  </div>
                  <button className="ml-auto text-xs text-[#10b981] hover:underline" style={{ fontWeight: 600 }}>Update</button>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>Recent Invoices</div>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {[
                    { date: '01 Jun 2026', amount: '£1,295', status: 'Paid' },
                    { date: '01 May 2026', amount: '£980',   status: 'Paid' },
                    { date: '01 Apr 2026', amount: '£760',   status: 'Paid' },
                  ].map(inv => (
                    <div key={inv.date} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-gray-600">{inv.date}</span>
                      <span className="text-gray-900" style={{ fontWeight: 600 }}>{inv.amount}</span>
                      <span className="text-xs text-[#15803d] bg-[#f0fdf4] px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{inv.status}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-700 hover:underline">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 700 }}>Team Members</span>
                <button className="inline-flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-3 py-1.5 text-xs transition-colors" style={{ fontWeight: 600 }}>
                  <Plus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </div>
              {[
                { name: 'Michael Thompson', email: 'michael@mslogistics.co.uk', role: 'Admin',           initials: 'MT', color: '#10b981' },
                { name: 'Laura Davies',     email: 'laura@mslogistics.co.uk',   role: 'Hiring Manager',  initials: 'LD', color: '#6366f1' },
                { name: 'James Patel',      email: 'james@mslogistics.co.uk',   role: 'Recruiter',       initials: 'JP', color: '#f59e0b' },
              ].map(member => (
                <div key={member.email} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: member.color, fontWeight: 700 }}>{member.initials}</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{member.name}</div>
                    <div className="text-xs text-gray-400">{member.email}</div>
                  </div>
                  <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-2 py-0.5" style={{ fontWeight: 500 }}>{member.role}</span>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6 max-w-lg">
              <div className="text-gray-900 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</div>
              {[
                { section: 'Email Notifications', items: [
                  { label: 'New qualified candidate',    description: 'When a candidate meets your requirements', on: true },
                  { label: 'Candidate awaiting review',  description: 'Daily digest of candidates needing review',  on: true },
                  { label: 'Interview reminder',         description: '24 hours before a scheduled interview',       on: true },
                  { label: 'Budget alert',               description: 'When daily spend exceeds 80% of budget',      on: false },
                ]},
                { section: 'SMS Notifications', items: [
                  { label: 'High-score candidate',       description: 'Instant alert for candidates scoring 90+',   on: true },
                  { label: 'Interview confirmation',     description: 'When a candidate confirms an interview',      on: false },
                ]},
              ].map(({ section, items }) => (
                <div key={section}>
                  <div className="text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>{section}</div>
                  <div className="space-y-3">
                    {items.map(item => (
                      <NotificationToggle key={item.label} label={item.label} description={item.description} defaultOn={item.on} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function NotificationToggle({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
      <div>
        <div className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="w-10 h-5.5 rounded-full transition-colors shrink-0 ml-4 relative"
        style={{ backgroundColor: on ? '#10b981' : '#e5e7eb', minWidth: '2.5rem', height: '1.375rem' }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-all"
          style={{ width: '1rem', height: '1rem', left: on ? '1.25rem' : '0.25rem' }}
        />
      </button>
    </div>
  );
}
