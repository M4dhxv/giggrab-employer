import { useState, useEffect, useRef } from "react";
import {
  Phone, Check, ArrowRight, Plus, Mic,
  BarChart2, Users, PhoneCall, Activity, Bell, Settings,
  Star, Clock, Briefcase, RefreshCw, X,
  ChevronRight, MessageSquare, Search, LogOut, Building,
  Send, Hash, User, Zap, MoreHorizontal,
  MapPin, Calendar, FileText, CheckCircle, Menu,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

type OnboardStep =
  | "login"
  | "country"
  | "areacode"
  | "number"
  | "provisioning"
  | "ats-connect"
  | "ats-imported"
  | "screening"
  | "golive"
  | "dashboard";

type DashPage = "home" | "jobs" | "candidates" | "calllogs" | "settings";

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: string;
  running?: boolean;
};

// ─── Mock Data ────────────────────────────────────────────────

const COUNTRIES = [
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
];

const AREA_CODES: Record<string, { code: string; city: string }[]> = {
  GB: [
    { code: "020", city: "London" },
    { code: "0121", city: "Birmingham" },
    { code: "0161", city: "Manchester" },
    { code: "0113", city: "Leeds" },
    { code: "0117", city: "Bristol" },
    { code: "0141", city: "Glasgow" },
    { code: "0131", city: "Edinburgh" },
    { code: "0114", city: "Sheffield" },
  ],
  US: [
    { code: "212", city: "New York" },
    { code: "213", city: "Los Angeles" },
    { code: "312", city: "Chicago" },
    { code: "713", city: "Houston" },
    { code: "602", city: "Phoenix" },
  ],
  CA: [
    { code: "416", city: "Toronto" },
    { code: "604", city: "Vancouver" },
    { code: "514", city: "Montreal" },
  ],
  IE: [{ code: "01", city: "Dublin" }, { code: "021", city: "Cork" }],
  AU: [
    { code: "02", city: "Sydney" },
    { code: "03", city: "Melbourne" },
    { code: "07", city: "Brisbane" },
  ],
};

const generateNumbers = (areaCode: string): string[] => [
  `${areaCode} 8123 4567`,
  `${areaCode} 8123 4588`,
  `${areaCode} 8123 4621`,
  `${areaCode} 8123 4700`,
  `${areaCode} 8124 1234`,
  `${areaCode} 8124 5678`,
  `${areaCode} 8125 9000`,
];

const ATS_LIST = [
  { name: "Greenhouse", color: "#24B47E", desc: "Most popular ATS for growing teams" },
  { name: "Ashby", color: "#6366F1", desc: "Modern all-in-one recruiting platform" },
  { name: "Lever", color: "#2563EB", desc: "Talent acquisition at scale" },
  { name: "Workday", color: "#0075C9", desc: "Enterprise HR and recruiting" },
  { name: "Bullhorn", color: "#E63946", desc: "Staffing and recruitment CRM" },
  { name: "JobAdder", color: "#F97316", desc: "Recruitment software for agencies" },
];

const ATS_IMPORT: Record<string, {
  companyName: string; importedJobs: number; openRoles: number;
  candidateCount: number; locations: string[]; screeningQuestions: number;
  recruiters: number; hiringManagers: number;
}> = {
  Greenhouse: {
    companyName: "Acme Construction Ltd", importedJobs: 12, openRoles: 8,
    candidateCount: 234, locations: ["London", "Birmingham", "Manchester"],
    screeningQuestions: 6, recruiters: 3, hiringManagers: 5,
  },
  Ashby: {
    companyName: "Acme Construction Ltd", importedJobs: 9, openRoles: 6,
    candidateCount: 187, locations: ["London", "Leeds"],
    screeningQuestions: 4, recruiters: 2, hiringManagers: 4,
  },
};
const getImport = (ats: string | null) =>
  ats && ATS_IMPORT[ats] ? ATS_IMPORT[ats] : ATS_IMPORT["Greenhouse"];

const JOBS_DATA = [
  { id: 1, title: "Site Operative", location: "London", openings: 4, qualified: 6, interviewReady: 2, lastActivity: "2 mins ago", category: "Construction" },
  { id: 2, title: "Cleaning Operative", location: "Birmingham", openings: 3, qualified: 4, interviewReady: 1, lastActivity: "35 mins ago", category: "Facilities" },
  { id: 3, title: "Forklift Operator", location: "Manchester", openings: 2, qualified: 3, interviewReady: 1, lastActivity: "1 hr ago", category: "Logistics" },
  { id: 4, title: "General Labourer", location: "London", openings: 6, qualified: 8, interviewReady: 3, lastActivity: "2 hrs ago", category: "Construction" },
  { id: 5, title: "Warehouse Operative", location: "Leeds", openings: 5, qualified: 7, interviewReady: 2, lastActivity: "3 hrs ago", category: "Logistics" },
  { id: 6, title: "Security Guard", location: "Bristol", openings: 2, qualified: 2, interviewReady: 0, lastActivity: "Yesterday", category: "Security" },
];

const CANDIDATES_DATA = [
  { id: 1, name: "Marcus Okafor", initials: "MO", score: 94, job: "Site Operative", role: "Site Operative", availability: "Immediate", languages: ["English"], qualifications: ["CSCS Card", "Driving Licence"], lastInteraction: "2 mins ago", status: "interview-ready", color: "#16A34A",
    summary: "Marcus has 6 years on commercial groundworks sites and holds a valid CSCS card. He's immediately available, reliable on nights and weekends, and has managed small teams before.",
    scoreReasons: ["CSCS Card verified ✓", "Available immediately ✓", "6+ years relevant experience ✓", "Driving licence ✓", "Willing to work nights ✓"],
    gaps: ["No forklift licence (not required for this role)"],
    transcript: [
      { role: "sarah", text: "Hi Marcus, I'm Sarah calling about the Site Operative role in London. Do you have a few minutes?" },
      { role: "candidate", text: "Yes, go ahead." },
      { role: "sarah", text: "Great. Do you hold a valid CSCS card?" },
      { role: "candidate", text: "Yes, green labourer card, renewed last year." },
      { role: "sarah", text: "Perfect. Are you available to start immediately?" },
      { role: "candidate", text: "Yes I'm available from Monday." },
      { role: "sarah", text: "Excellent. Are you comfortable working nights and weekends?" },
      { role: "candidate", text: "Nights are fine, weekends occasionally." },
    ]
  },
  { id: 2, name: "Agnieszka Kowal", initials: "AK", score: 91, job: "Cleaning Operative", role: "Cleaning Operative", availability: "48 hrs", languages: ["Polish", "English"], qualifications: ["CSCS Card", "2+ Yrs"], lastInteraction: "14 mins ago", status: "qualified", color: "#15803D",
    summary: "Agnieszka brings 3 years of commercial cleaning experience and is bilingual in Polish and English. Available within 48 hours with her own transport.",
    scoreReasons: ["2+ years cleaning experience ✓", "Available within 48 hours ✓", "Bilingual ✓", "Own transport ✓"],
    gaps: ["Not immediately available (48 hrs)", "No DBS check on file"],
    transcript: [
      { role: "sarah", text: "Hi Agnieszka, I'm Sarah calling about the Cleaning Operative role in Birmingham. Do you have a moment?" },
      { role: "candidate", text: "Yes, of course." },
      { role: "sarah", text: "How long have you been working in commercial cleaning?" },
      { role: "candidate", text: "Three years. Offices and schools mainly." },
      { role: "sarah", text: "Do you have your own transport?" },
      { role: "candidate", text: "Yes, I have a car." },
    ]
  },
  { id: 3, name: "Deon Petersen", initials: "DP", score: 87, job: "Forklift Operator", role: "Forklift Operator", availability: "1 week", languages: ["English"], qualifications: ["CSCS Card", "Forklift"], lastInteraction: "1 hr ago", status: "qualified", color: "#166534",
    summary: "Deon holds a valid counterbalance forklift licence and has 4 years of warehouse logistics experience. Available in one week — slight delay on availability holds back a higher score.",
    scoreReasons: ["Forklift licence (counterbalance) ✓", "4 years warehouse experience ✓", "CSCS Card ✓"],
    gaps: ["Not immediately available (1 week notice)", "Reach truck licence not held"],
    transcript: [
      { role: "sarah", text: "Hi Deon, calling about the Forklift Operator role in Manchester. Do you hold a valid forklift licence?" },
      { role: "candidate", text: "Yes, counterbalance. Had it for four years." },
      { role: "sarah", text: "Great. When could you start?" },
      { role: "candidate", text: "I need to give a week's notice at my current place." },
      { role: "sarah", text: "Understood. Do you also hold a reach truck licence?" },
      { role: "candidate", text: "No, just counterbalance." },
    ]
  },
  { id: 4, name: "Maria Santos", initials: "MS", score: 82, job: "General Labourer", role: "General Labourer", availability: "Immediate", languages: ["Portuguese", "English"], qualifications: ["CSCS Card"], lastInteraction: "3 hrs ago", status: "qualified", color: "#4D7C0F",
    summary: "Maria is immediately available and trilingual. She holds a CSCS card but no driving licence, which limits site mobility slightly.",
    scoreReasons: ["CSCS Card ✓", "Available immediately ✓", "Bilingual Portuguese/English ✓"],
    gaps: ["No driving licence", "Less than 2 years experience"],
    transcript: [
      { role: "sarah", text: "Hi Maria, I'm Sarah calling about a General Labourer role in London. Do you have a CSCS card?" },
      { role: "candidate", text: "Yes, I have the green card." },
      { role: "sarah", text: "How much labouring experience do you have?" },
      { role: "candidate", text: "About 18 months on residential sites." },
      { role: "sarah", text: "Do you drive?" },
      { role: "candidate", text: "No, but I can get public transport easily." },
    ]
  },
  { id: 5, name: "Fatima Al-Hassan", initials: "FA", score: 88, job: "Warehouse Operative", role: "Warehouse Operative", availability: "Immediate", languages: ["Arabic", "English"], qualifications: ["CSCS Card", "Forklift"], lastInteraction: "5 hrs ago", status: "interview-ready", color: "#065F46",
    summary: "Fatima is an ideal match — forklift certified, immediately available, and bilingual. High score reflects strong alignment with all key criteria.",
    scoreReasons: ["Forklift licence ✓", "Available immediately ✓", "Bilingual Arabic/English ✓", "CSCS Card ✓"],
    gaps: ["Prefers day shifts only"],
    transcript: [
      { role: "sarah", text: "Hi Fatima, I'm calling about the Warehouse Operative role in Leeds. Do you have a forklift licence?" },
      { role: "candidate", text: "Yes, counterbalance and reach truck." },
      { role: "sarah", text: "Excellent. Are you available immediately?" },
      { role: "candidate", text: "Yes, I'm free now." },
      { role: "sarah", text: "Can you work shifts including evenings?" },
      { role: "candidate", text: "I prefer days but can do early evenings if needed." },
    ]
  },
  { id: 6, name: "James Thornton", initials: "JT", score: 74, job: "Site Operative", role: "Site Operative", availability: "2 weeks", languages: ["English"], qualifications: ["Driving Licence"], lastInteraction: "Yesterday", status: "screening", color: "#6B7280",
    summary: "James has driving licence and some site experience but is missing a CSCS card and is not available for two weeks. Currently still in screening.",
    scoreReasons: ["Driving licence ✓", "Willing to obtain CSCS card ✓"],
    gaps: ["No CSCS Card (critical requirement)", "2 weeks until available", "Limited site experience"],
    transcript: [
      { role: "sarah", text: "Hi James, calling about a Site Operative role in London. Do you have a CSCS card?" },
      { role: "candidate", text: "Not yet but I'm planning to get one." },
      { role: "sarah", text: "When could you start if offered the role?" },
      { role: "candidate", text: "About two weeks. I'm finishing another job." },
    ]
  },
  { id: 7, name: "Priya Sharma", initials: "PS", score: 79, job: "Cleaning Operative", role: "Cleaning Operative", availability: "3 days", languages: ["Hindi", "English"], qualifications: ["CSCS Card"], lastInteraction: "Yesterday", status: "qualified", color: "#7C3AED",
    summary: "Priya has solid cleaning experience and is trilingual, but slightly lower score due to 3-day delay on availability.",
    scoreReasons: ["CSCS Card ✓", "2+ years cleaning experience ✓", "Bilingual Hindi/English ✓"],
    gaps: ["Not immediately available (3 days)", "No commercial kitchen experience"],
    transcript: [
      { role: "sarah", text: "Hi Priya, calling about the Cleaning Operative role. How long have you been in the industry?" },
      { role: "candidate", text: "About two and a half years." },
      { role: "sarah", text: "Are you available to start soon?" },
      { role: "candidate", text: "I need three days to finish my current placement." },
    ]
  },
  { id: 8, name: "Tom Hughes", initials: "TH", score: 65, job: "General Labourer", role: "General Labourer", availability: "1 week", languages: ["English", "Welsh"], qualifications: [], lastInteraction: "2 days ago", status: "screening", color: "#B45309",
    summary: "Tom is in early screening. Missing CSCS card, limited experience, and not available for a week. Needs follow-up before advancing.",
    scoreReasons: ["Willing to work flexible hours ✓", "Local to the area ✓"],
    gaps: ["No CSCS Card", "No relevant qualifications", "Less than 6 months experience", "1 week until available"],
    transcript: [
      { role: "sarah", text: "Hi Tom, calling about a General Labourer role. Do you have any construction site experience?" },
      { role: "candidate", text: "A little. I did some work with a mate last summer." },
      { role: "sarah", text: "Do you have a CSCS card?" },
      { role: "candidate", text: "Not yet. Is that essential?" },
      { role: "sarah", text: "It is for this role. When could you start?" },
      { role: "candidate", text: "About a week, maybe two." },
    ]
  },
];

const CALL_LOGS_DATA = [
  { id: 1, caller: "+44 7700 900123", name: "Marcus Okafor", time: "09:14", date: "Today", duration: "4:32", type: "screening", outcome: "Qualified", status: "completed" },
  { id: 2, caller: "+44 7700 900456", name: "Unknown caller", time: "09:28", date: "Today", duration: "1:15", type: "incoming", outcome: "Voicemail", status: "missed" },
  { id: 3, caller: "+44 7700 900789", name: "Agnieszka Kowal", time: "09:45", date: "Today", duration: "6:18", type: "screening", outcome: "Qualified", status: "completed" },
  { id: 4, caller: "+44 7700 900111", name: "Unknown caller", time: "10:02", date: "Today", duration: "—", type: "incoming", outcome: "Not answered", status: "missed" },
  { id: 5, caller: "+44 7700 900222", name: "Deon Petersen", time: "10:30", date: "Today", duration: "5:44", type: "screening", outcome: "Qualified", status: "completed" },
  { id: 6, caller: "+44 7700 900333", name: "James Thornton", time: "11:05", date: "Today", duration: "3:22", type: "screening", outcome: "In Progress", status: "in-progress" },
  { id: 7, caller: "+44 7700 900444", name: "Maria Santos", time: "11:20", date: "Today", duration: "4:55", type: "screening", outcome: "Qualified", status: "completed" },
  { id: 8, caller: "+44 7700 900555", name: "Unknown caller", time: "08:33", date: "Yesterday", duration: "2:11", type: "incoming", outcome: "Voicemail", status: "missed" },
  { id: 9, caller: "+44 7700 900666", name: "Fatima Al-Hassan", time: "14:10", date: "Yesterday", duration: "5:02", type: "screening", outcome: "Qualified", status: "completed" },
  { id: 10, caller: "+44 7700 900777", name: "Priya Sharma", time: "15:45", date: "Yesterday", duration: "4:15", type: "screening", outcome: "Qualified", status: "completed" },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "a1", text: "Screened 14 candidates for Site Operative roles", time: "Just now", type: "screen" },
  { id: "a2", text: "Qualified 6 candidates — Marcus, Agnieszka, Deon +3", time: "12 mins ago", type: "qualify" },
  { id: "a3", text: "Scheduled 2 interviews for tomorrow 09:00", time: "1 hr ago", type: "schedule" },
  { id: "a4", text: "Reactivated 8 workers from the 2024 pipeline", time: "3 hrs ago", type: "reactivate" },
  { id: "a5", text: "Switched to Polish mid-call with Agnieszka Kowal", time: "5 hrs ago", type: "translate" },
];

const SARAH_ACTION_SEQUENCES: Record<string, { text: string; delay: number; running?: boolean }[]> = {
  "call-top": [
    { text: "Sarah is calling top 10 candidates…", delay: 0, running: true },
    { text: "Reached 8 of 10 candidates", delay: 2000 },
    { text: "Sarah is confirming availability…", delay: 3000, running: true },
    { text: "6 candidates confirmed available this week", delay: 5000 },
  ],
  "find-more": [
    { text: "Sarah is searching for candidates…", delay: 0, running: true },
    { text: "Searching job boards and talent pool…", delay: 1500, running: true },
    { text: "Found 23 new matching candidates", delay: 4000 },
    { text: "Adding 23 candidates to pipeline for review", delay: 5000 },
  ],
  "reactivate": [
    { text: "Sarah is reaching out to 47 previous candidates…", delay: 0, running: true },
    { text: "Sarah is confirming interest and availability…", delay: 2500, running: true },
    { text: "8 candidates responded and re-entered pipeline", delay: 5000 },
  ],
  "schedule": [
    { text: "Sarah is checking availability with qualified candidates…", delay: 0, running: true },
    { text: "Coordinating with hiring managers…", delay: 2000, running: true },
    { text: "4 interviews scheduled for this week", delay: 4500 },
  ],
};

// ─── Shared Helpers ───────────────────────────────────────────

const font = { fontFamily: "'Inter', system-ui, sans-serif" };

function GreenDot({ pulse = false }: { pulse?: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full bg-green-500 ${pulse ? "animate-pulse" : ""}`} />
  );
}

function Btn({
  children, onClick, disabled, variant = "primary", className = "", size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-3 text-base", lg: "px-7 py-4 text-lg" };
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:border-green-300 hover:bg-green-50",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ─── Onboarding Shell ─────────────────────────────────────────

const ONBOARD_STEPS = ["Hiring Number", "ATS Integration", "Screening", "Go Live"];
const STEP_INDICES: Partial<Record<OnboardStep, number>> = {
  country: 0, areacode: 0, number: 0,
  "ats-connect": 1, "ats-imported": 1,
  screening: 2,
  golive: 3,
};

function OnboardingShell({
  step, headline, tagline, features, children,
}: {
  step: OnboardStep;
  headline: string;
  tagline: string;
  features?: string[];
  children: React.ReactNode;
}) {
  const stepIdx = STEP_INDICES[step] ?? 0;

  return (
    <div className="min-h-screen flex" style={font}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[38%] bg-[#F0FDF4] border-r border-green-100 flex-col p-12">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md shadow-green-600/20">
            <Mic size={17} className="text-white" />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">Sarah</span>
        </div>

        <div className="my-auto py-12">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-4">
            Step {stepIdx + 1} of {ONBOARD_STEPS.length}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">{headline}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{tagline}</p>
          {features && (
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-green-700" />
                  </div>
                  <span className="text-base text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          {ONBOARD_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < stepIdx ? "bg-green-600 text-white" :
                i === stepIdx ? "border-2 border-green-600 text-green-600" :
                "border-2 border-gray-200 text-gray-400"
              }`}>
                {i < stepIdx ? <Check size={11} /> : i + 1}
              </div>
              <span className={`text-base font-medium ${
                i === stepIdx ? "text-gray-900" : i < stepIdx ? "text-green-700" : "text-gray-400"
              }`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-start justify-center pt-16 pb-16 px-10 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-[520px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── 1. Login ─────────────────────────────────────────────────

function LoginScreen({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="min-h-screen flex" style={font}>
      {/* Left — green value panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-green-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 80%, #fff 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">GigGrab Enterprise</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-5">
            Your own dedicated<br />AI hiring hotline.
          </h1>
          <p className="text-green-100 text-lg leading-relaxed mb-10 max-w-md">
            Sarah answers every candidate call, screens and qualifies in 32 languages, and delivers interview-ready shortlists — under your brand, 24/7.
          </p>
          <div className="space-y-4">
            {[
              { icon: <Phone size={16} />, text: "White-label number — candidates call your brand" },
              { icon: <Zap size={16} />, text: "ATS integration — Greenhouse, Ashby, Lever and more" },
              { icon: <Users size={16} />, text: "Multi-location hiring across all your sites" },
              { icon: <BarChart2 size={16} />, text: "Full call transcripts, scores and interview summaries" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-green-100 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 bg-white/10 rounded-2xl p-5 border border-white/20">
          <p className="text-white text-sm leading-relaxed italic mb-3">
            "We went from 40 hours of recruiter time per week to under 5. Sarah handles every inbound call and only escalates the ones worth our time."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xs">JR</div>
            <div>
              <div className="text-white text-xs font-semibold">James Richardson</div>
              <div className="text-green-200 text-xs">Head of Talent, Acme Construction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 justify-center mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/25">
              <Mic size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">GigGrab Enterprise</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome back</h2>
          <p className="text-lg text-gray-500 text-center mb-10">Sign in to your account</p>

          <div className="space-y-3">
            <button onClick={onNext} className="w-full flex items-center gap-3.5 bg-white border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-semibold text-gray-800 hover:border-green-400 hover:bg-green-50 transition-all">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button onClick={onNext} className="w-full flex items-center gap-3.5 bg-white border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-semibold text-gray-800 hover:border-green-400 hover:bg-green-50 transition-all">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z" /><path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" /><path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              Continue with Microsoft
            </button>
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-sm text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
            </div>
            {showEmail ? (
              <div className="space-y-3">
                <input type="email" placeholder="Work email address" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 transition-all" />
                <Btn onClick={onNext} className="w-full" size="lg">Continue <ArrowRight size={18} /></Btn>
              </div>
            ) : (
              <button onClick={() => setShowEmail(true)} className="w-full bg-gray-900 text-white rounded-xl px-5 py-4 text-base font-semibold hover:bg-green-700 transition-all">Continue with Email</button>
            )}
          </div>
          <p className="text-sm text-gray-400 text-center mt-8">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer text-gray-600">Terms</span> and{" "}
            <span className="underline cursor-pointer text-gray-600">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Country Select ────────────────────────────────────────

function CountryScreen({
  onSelect,
}: { onSelect: (country: typeof COUNTRIES[0]) => void }) {
  const [selected, setSelected] = useState<typeof COUNTRIES[0] | null>(null);

  return (
    <OnboardingShell
      step="country"
      headline="Where are you hiring?"
      tagline="Sarah will assign a local number for your hiring hotline."
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Select country</h2>
        <p className="text-lg text-gray-500 mb-8">Choose where your candidates are located.</p>

        <div className="grid grid-cols-1 gap-3 mb-8">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelected(c)}
              className={`flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all ${
                selected?.code === c.code
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              <span className="text-3xl">{c.flag}</span>
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900">{c.name}</div>
                <div className="text-sm text-gray-500">{c.dial} country code</div>
              </div>
              {selected?.code === c.code && (
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <Check size={13} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Btn onClick={() => selected && onSelect(selected)} disabled={!selected} className="w-full" size="lg">
          Continue <ArrowRight size={18} />
        </Btn>
      </div>
    </OnboardingShell>
  );
}

// ─── 3. Area Code Select ──────────────────────────────────────

function AreaCodeScreen({
  country,
  onSelect,
}: { country: typeof COUNTRIES[0]; onSelect: (code: string, city: string) => void }) {
  const [selected, setSelected] = useState<{ code: string; city: string } | null>(null);
  const [search, setSearch] = useState("");
  const codes = AREA_CODES[country.code] ?? AREA_CODES.GB;
  const filtered = codes.filter(
    (c) => c.code.includes(search) || c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OnboardingShell
      step="areacode"
      headline="Choose an area code"
      tagline="Pick the area code that best represents where you hire."
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Select area code</h2>
        <p className="text-lg text-gray-500 mb-6">
          {country.flag} {country.name} — choose your region.
        </p>

        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search city or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-8">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelected(c)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                selected?.code === c.code
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300"
              }`}
            >
              <div>
                <div className="text-base font-bold text-gray-900 font-mono">{c.code}</div>
                <div className="text-sm text-gray-500">{c.city}</div>
              </div>
              {selected?.code === c.code && (
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Btn
          onClick={() => selected && onSelect(selected.code, selected.city)}
          disabled={!selected}
          className="w-full"
          size="lg"
        >
          Continue <ArrowRight size={18} />
        </Btn>
      </div>
    </OnboardingShell>
  );
}

// ─── 4. Number Select ─────────────────────────────────────────

function NumberScreen({
  areaCode,
  city,
  onSelect,
}: { areaCode: string; city: string; onSelect: (number: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const numbers = generateNumbers(areaCode);

  return (
    <OnboardingShell
      step="number"
      headline="Choose your hiring number"
      tagline="This is the number workers will call to reach Sarah and enter your candidate pipeline."
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Choose your number</h2>
        <p className="text-lg text-gray-500 mb-6">
          Available {city} numbers ({areaCode}).
        </p>

        <div className="space-y-2.5 mb-8">
          {numbers.map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                selected === n
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300"
              }`}
            >
              <span className="text-xl font-bold tracking-widest text-gray-900 font-mono">{n}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === n ? "border-green-600 bg-green-600" : "border-gray-300"
              }`}>
                {selected === n && <Check size={12} className="text-white" />}
              </div>
            </button>
          ))}
        </div>

        <Btn
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="w-full"
          size="lg"
        >
          Confirm this number <ArrowRight size={18} />
        </Btn>
      </div>
    </OnboardingShell>
  );
}

// ─── 5. Provisioning ─────────────────────────────────────────

const PROVISION_STEPS = [
  "Provisioning number",
  "Activating Sarah",
  "Connecting workflows",
  "Preparing candidate intake",
];

function ProvisioningScreen({
  number,
  onDone,
}: { number: string; onDone: () => void }) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    PROVISION_STEPS.forEach((_, i) => {
      setTimeout(() => setDone((p) => [...p, i]), 1200 + i * 1400);
    });
    setTimeout(onDone, 1200 + PROVISION_STEPS.length * 1400 + 800);
  }, []);

  const allDone = done.length === PROVISION_STEPS.length;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10" style={font}>
      <div className="relative flex justify-center mb-12">
        <div className={`absolute w-40 h-40 rounded-full border-2 border-green-200 transition-all duration-700 ${allDone ? "scale-110 opacity-0" : "animate-ping opacity-30"}`} />
        <div className="w-28 h-28 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            allDone ? "bg-green-600 shadow-xl shadow-green-600/30" : "bg-green-100"
          }`}>
            {allDone
              ? <Check size={38} className="text-white" strokeWidth={3} />
              : <Mic size={34} className="text-green-600" />
            }
          </div>
        </div>
      </div>

      <div className="text-center max-w-md mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {allDone ? "Your hiring line is ready." : "Setting up your hiring line…"}
        </h1>
        <p className="text-xl text-gray-500">
          {allDone
            ? `${number} is live and ready to receive candidates.`
            : "This takes less than 30 seconds."}
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {PROVISION_STEPS.map((s, i) => {
          const isComplete = done.includes(i);
          const isActive = done.length === i;
          return (
            <div
              key={s}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
                isComplete ? "border-green-200 bg-green-50" :
                isActive ? "border-green-400 bg-white shadow-sm" :
                "border-gray-100 bg-white"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                isComplete ? "bg-green-600" : isActive ? "bg-white border-2 border-green-500" : "bg-gray-100"
              }`}>
                {isComplete
                  ? <Check size={15} className="text-white" strokeWidth={3} />
                  : isActive
                  ? <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                  : null
                }
              </div>
              <span className={`text-lg font-semibold transition-colors ${
                isComplete ? "text-green-800" : isActive ? "text-gray-900" : "text-gray-400"
              }`}>{s}</span>
              {isComplete && <span className="ml-auto text-sm font-semibold text-green-600">Done</span>}
              {isActive && <span className="ml-auto text-sm text-green-500">Working…</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 6. ATS Connect ──────────────────────────────────────────

function ATSConnectScreen({
  onConnect,
  onSkip,
}: { onConnect: (ats: string) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingShell
      step="ats-connect"
      headline="Connect your ATS"
      tagline="Import your jobs and candidates in seconds. Sarah uses this data to match the right people to the right roles automatically."
      features={[
        "Import open roles instantly",
        "Sync existing candidate history",
        "Bring in existing screening questions",
        "Keep ATS updated as Sarah qualifies candidates",
      ]}
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Connect your ATS</h2>
        <p className="text-lg text-gray-500 mb-8">
          Optional but recommended — takes less than 60 seconds.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {ATS_LIST.map((ats) => (
            <button
              key={ats.name}
              onClick={() => setSelected(ats.name === selected ? null : ats.name)}
              className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all ${
                selected === ats.name
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300"
              }`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold mb-3"
                style={{ backgroundColor: ats.color }}
              >
                {ats.name[0]}
              </div>
              <div className="text-base font-bold text-gray-900 mb-1">{ats.name}</div>
              <div className="text-sm text-gray-500 leading-snug">{ats.desc}</div>
              {selected === ats.name && (
                <div className="mt-2 flex items-center gap-1 text-green-700">
                  <Check size={13} />
                  <span className="text-sm font-semibold">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Btn
            onClick={() => selected && onConnect(selected)}
            disabled={!selected}
            className="w-full"
            size="lg"
          >
            Connect {selected ?? "ATS"} <ArrowRight size={18} />
          </Btn>
          <button
            onClick={onSkip}
            className="w-full text-center py-3 text-base font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
          >
            Skip for now <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}

// ─── 7. ATS Imported ─────────────────────────────────────────

function ATSImportedScreen({
  atsName,
  onNext,
}: { atsName: string; onNext: () => void }) {
  const data = getImport(atsName);

  const items = [
    { label: "Company Name", value: data.companyName, icon: <Building size={16} /> },
    { label: "Imported Jobs", value: `${data.importedJobs} roles`, icon: <Briefcase size={16} /> },
    { label: "Open Roles", value: `${data.openRoles} active`, icon: <Hash size={16} /> },
    { label: "Candidates", value: `${data.candidateCount} profiles`, icon: <Users size={16} /> },
    { label: "Locations", value: data.locations.join(", "), icon: <MapPin size={16} /> },
    { label: "Screening Questions", value: `${data.screeningQuestions} imported`, icon: <FileText size={16} /> },
    { label: "Recruiters", value: `${data.recruiters} team members`, icon: <User size={16} /> },
    { label: "Hiring Managers", value: `${data.hiringManagers} connected`, icon: <Star size={16} /> },
  ];

  return (
    <OnboardingShell
      step="ats-imported"
      headline="Import successful"
      tagline="Sarah now has everything she needs to start matching candidates to your open roles."
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Successfully imported</h2>
        </div>
        <p className="text-lg text-gray-500 mb-8">
          Here is what Sarah pulled in from{" "}
          <span className="font-semibold text-gray-800">{atsName}</span>.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {items.map((item) => (
            <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="text-base font-bold text-gray-900 leading-tight">{item.value}</div>
            </div>
          ))}
        </div>

        <Btn onClick={onNext} className="w-full" size="lg">
          Set up screening <ArrowRight size={18} />
        </Btn>
      </div>
    </OnboardingShell>
  );
}

// ─── 8. Screening Config ─────────────────────────────────────

const DEFAULT_QUESTIONS: Record<string, string[]> = {
  "Site Operative": [
    "Do you hold a valid CSCS card?",
    "Are you available for early morning starts (6am)?",
    "Do you have PPE (boots, hi-vis, hard hat)?",
    "Are you able to travel to site?",
  ],
  "Cleaning Operative": [
    "Do you have commercial cleaning experience?",
    "Are you available for night shifts?",
    "Do you have a DBS certificate?",
    "Can you use floor buffers and industrial equipment?",
  ],
  "Forklift Operator": [
    "Do you hold a valid counterbalance forklift licence?",
    "How many years of warehouse experience do you have?",
    "Are you available for weekend shifts?",
    "Do you have a valid driving licence?",
  ],
  "General Labourer": [
    "Are you available for immediate start?",
    "Are you comfortable with heavy lifting (25kg+)?",
    "Do you have your own transport?",
    "Any previous labouring or site experience?",
  ],
  "Warehouse Operative": [
    "Do you have at least 6 months warehouse experience?",
    "Are you available for rotating shifts?",
    "Can you operate a hand pallet truck?",
    "Do you have a valid right to work in the UK?",
  ],
  "Security Guard": [
    "Do you hold a valid SIA Door Supervisor or Security Guarding licence?",
    "Are you available for overnight and weekend shifts?",
    "Have you worked in retail or corporate security before?",
    "Do you have a valid first aid certificate?",
  ],
};

const CALL_LANGUAGES = [
  { code: "en-GB", label: "English (UK)" },
  { code: "en-US", label: "English (US)" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ur", label: "Urdu" },
  { code: "hi", label: "Hindi" },
  { code: "ro", label: "Romanian" },
];

function ScreeningScreen({ onNext }: { onNext: () => void }) {
  const [mode, setMode] = useState<"manual" | "sarah" | null>(null);

  // manual sub-steps: "job" → "questions"
  const [manualStep, setManualStep] = useState<"job" | "questions">("job");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQ, setNewQ] = useState("");

  // sarah sub-steps: "phone" → "confirm"
  const [sarahStep, setSarahStep] = useState<"phone" | "confirm">("phone");
  const [sarahPhone, setSarahPhone] = useState("");
  const [sarahLang, setSarahLang] = useState("en-GB");

  const jobNames = Object.keys(DEFAULT_QUESTIONS);

  const pickJob = (job: string) => {
    setSelectedJob(job);
    setQuestions(DEFAULT_QUESTIONS[job]);
    setManualStep("questions");
  };

  const canContinue = mode === "manual"
    ? manualStep === "questions"
    : mode === "sarah"
    ? sarahStep === "confirm"
    : false;

  return (
    <OnboardingShell
      step="screening"
      headline="Configure screening"
      tagline="Tell Sarah what to ask candidates. She handles every call, qualifies candidates, and surfaces only those who meet your criteria."
    >
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Set up screening</h2>
        <p className="text-lg text-gray-500 mb-8">How would you like to define your screening questions?</p>

        {/* ── Mode selection ── */}
        {!mode && (
          <div className="grid grid-cols-1 gap-4 mb-8">
            <button
              onClick={() => { setMode("manual"); setManualStep("job"); }}
              className="flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 text-left transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center flex-shrink-0 transition-all">
                <FileText size={22} className="text-gray-600 group-hover:text-green-700" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 mb-1">Add questions manually</div>
                <div className="text-base text-gray-500 leading-relaxed">Select a job and write your own screening questions per role.</div>
              </div>
            </button>

            <button
              onClick={() => { setMode("sarah"); setSarahStep("phone"); }}
              className="flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 text-left transition-all group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Recommended</div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center flex-shrink-0 transition-all">
                <Mic size={22} className="text-gray-600 group-hover:text-green-700" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 mb-1">Talk with Sarah</div>
                <div className="text-base text-gray-500 leading-relaxed">Sarah calls you, asks about each role, and builds screening criteria automatically.</div>
              </div>
            </button>
          </div>
        )}

        {/* ── Manual: job selector ── */}
        {mode === "manual" && manualStep === "job" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Select a job to configure</h3>
              <button onClick={() => setMode(null)} className="text-sm text-gray-500 hover:text-gray-900">← Back</button>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {jobNames.map((job) => (
                <button
                  key={job}
                  onClick={() => pickJob(job)}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={16} className="text-green-700" />
                    </div>
                    <span className="text-base font-semibold text-gray-900">{job}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Manual: questions editor ── */}
        {mode === "manual" && manualStep === "questions" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Screening questions</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedJob}</p>
              </div>
              <button onClick={() => setManualStep("job")} className="text-sm text-gray-500 hover:text-gray-900">← Change job</button>
            </div>
            <div className="space-y-2.5 mb-4">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="w-6 h-6 rounded-lg bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-base text-gray-800 flex-1 leading-snug">{q}</span>
                  <button onClick={() => setQuestions((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newQ.trim()) { setQuestions((p) => [...p, newQ.trim()]); setNewQ(""); } }}
                placeholder="Add a question…"
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-green-400 transition-all"
              />
              <button
                onClick={() => { if (newQ.trim()) { setQuestions((p) => [...p, newQ.trim()]); setNewQ(""); } }}
                className="bg-green-600 text-white rounded-xl px-4 py-3 hover:bg-green-700 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Sarah: phone + language ── */}
        {mode === "sarah" && sarahStep === "phone" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GreenDot pulse /> Sarah will call you
              </h3>
              <button onClick={() => setMode(null)} className="text-sm text-gray-500 hover:text-gray-900">← Back</button>
            </div>
            <p className="text-base text-gray-500 mb-6">
              Sarah calls you and asks about each role — requirements, qualifications, shifts. She then builds your screening criteria automatically.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your phone number</label>
                <input
                  type="tel"
                  value={sarahPhone}
                  onChange={(e) => setSarahPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-green-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Call language</label>
                <select
                  value={sarahLang}
                  onChange={(e) => setSarahLang(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-green-400 transition-all bg-white"
                >
                  {CALL_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => sarahPhone.trim() && setSarahStep("confirm")}
                disabled={!sarahPhone.trim()}
                className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Phone size={18} /> Call me now
              </button>
            </div>
          </div>
        )}

        {/* ── Sarah: confirm ── */}
        {mode === "sarah" && sarahStep === "confirm" && (
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mb-6 mx-auto shadow-xl shadow-green-600/25 relative">
              <Phone size={26} className="text-white" />
              <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sarah is calling you</h3>
              <p className="text-base text-gray-500">Calling <span className="font-semibold text-gray-800">{sarahPhone}</span> now. Pick up and describe your roles — she handles the rest.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              {["Sarah will ask about each open role", "She builds screening questions per job automatically", "You review and approve before going live"].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-green-800">
                  <div className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                  {s}
                </div>
              ))}
            </div>
            <button onClick={() => setSarahStep("phone")} className="w-full text-center py-3 text-sm text-gray-500 hover:text-gray-900 mt-3">
              ← Change number
            </button>
          </div>
        )}

        <Btn onClick={onNext} disabled={!canContinue} className="w-full" size="lg">
          {canContinue ? "Save and continue" : "Choose an option to continue"}
          <ArrowRight size={18} />
        </Btn>
      </div>
    </OnboardingShell>
  );
}

// ─── 9. Go Live ───────────────────────────────────────────────

function GoLiveScreen({
  number,
  atsName,
  onDone,
}: { number: string; atsName: string | null; onDone: () => void }) {
  const data = getImport(atsName);

  const summary = [
    { label: "Dedicated Number", value: number || "020 8123 4567", icon: <Phone size={18} /> },
    { label: "Connected ATS", value: atsName ?? "No ATS (manual)", icon: <Zap size={18} /> },
    { label: "Imported Jobs", value: atsName ? `${data.importedJobs} roles` : "Set up manually", icon: <Briefcase size={18} /> },
    { label: "Screening Configured", value: `${data.screeningQuestions} questions active`, icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10" style={font}>
      <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mb-8 shadow-2xl shadow-green-600/30">
        <Check size={44} className="text-white" strokeWidth={3} />
      </div>

      <div className="text-center max-w-lg mb-12">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-6">
          <GreenDot pulse />
          <span className="text-green-700 text-sm font-bold">Sarah is live</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Your hiring line<br />is ready.
        </h1>
        <p className="text-xl text-gray-500">
          Workers can now call, get screened by Sarah, and enter your pipeline — automatically, 24/7.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3 mb-10">
        {summary.map((item) => (
          <div key={item.label} className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-green-700">{item.label}</div>
              <div className="text-base font-bold text-gray-900">{item.value}</div>
            </div>
            <div className="ml-auto">
              <Check size={16} className="text-green-600" />
            </div>
          </div>
        ))}
      </div>

      <Btn onClick={onDone} size="lg" className="px-10">
        Go to dashboard <ArrowRight size={20} />
      </Btn>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────

const DASH_NAV = [
  { key: "home", label: "Dashboard", icon: <BarChart2 size={18} /> },
  { key: "jobs", label: "Jobs", icon: <Briefcase size={18} /> },
  { key: "candidates", label: "Candidates", icon: <Users size={18} /> },
  { key: "calllogs", label: "Call Logs", icon: <PhoneCall size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
];

function DashboardShell({
  activePage,
  onNav,
  phoneNumber,
  children,
}: {
  activePage: DashPage;
  onNav: (p: DashPage) => void;
  phoneNumber: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const Sidebar = () => (
    <aside className={`
      fixed sm:static inset-y-0 left-0 z-30
      w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0
      transition-transform duration-200
      ${mobileNavOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
    `}>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-md shadow-green-600/20">
              <Mic size={15} className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-base">Sarah</span>
          </div>
          <button className="sm:hidden p-1 text-gray-400 hover:text-gray-700" onClick={() => setMobileNavOpen(false)}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="mx-3 mt-4 p-3.5 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-1.5">
          <GreenDot pulse />
          <span className="text-green-700 text-sm font-bold">Sarah Active</span>
        </div>
        <div className="text-gray-600 text-sm font-mono">{phoneNumber || "020 8123 4567"}</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 mt-3">
        {DASH_NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => { onNav(item.key as DashPage); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium transition-all ${
              activePage === item.key
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-6 py-4 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors border-t border-gray-100">
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );

  return (
    <div className="h-screen flex bg-[#F9FAFB]" style={font}>
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 sm:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-7 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">
                {DASH_NAV.find((n) => n.key === activePage)?.label}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Mon, 16 June 2025 · Acme Construction Ltd</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
              AC
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Dashboard: Home ──────────────────────────────────────────

const ACTIVITY_META: Record<string, { cls: string; icon: React.ReactNode }> = {
  screen: { cls: "bg-blue-100 text-blue-600", icon: <PhoneCall size={13} /> },
  qualify: { cls: "bg-green-100 text-green-600", icon: <Check size={13} /> },
  schedule: { cls: "bg-purple-100 text-purple-600", icon: <Calendar size={13} /> },
  reactivate: { cls: "bg-amber-100 text-amber-600", icon: <RefreshCw size={13} /> },
  translate: { cls: "bg-gray-100 text-gray-600", icon: <MessageSquare size={13} /> },
  sarah: { cls: "bg-green-100 text-green-700", icon: <Mic size={13} /> },
};

function DashboardHome({ atsName }: { atsName: string | null }) {
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [running, setRunning] = useState<string | null>(null);

  const handleAction = (key: string) => {
    if (running) return;
    setRunning(key);
    const seq = SARAH_ACTION_SEQUENCES[key];
    const id = Date.now().toString();

    seq.forEach(({ text, delay, running: r }, i) => {
      setTimeout(() => {
        setActivity((prev) => {
          const filtered = prev.filter((a) => !a.running);
          const newItem: ActivityItem = { id: `${id}-${i}`, text, time: "Just now", type: "sarah", running: r };
          return [newItem, ...filtered];
        });
        if (!r) setRunning(null);
      }, delay);
    });
  };

  const ACTIONS = [
    { key: "call-top", label: "Call Top Candidates", icon: <PhoneCall size={15} /> },
    { key: "find-more", label: "Find More Candidates", icon: <Search size={15} /> },
    { key: "reactivate", label: "Reactivate Candidates", icon: <RefreshCw size={15} /> },
    { key: "schedule", label: "Schedule Interviews", icon: <Calendar size={15} /> },
  ];

  const statusMeta: Record<string, { label: string; cls: string }> = {
    "interview-ready": { label: "Interview Ready", cls: "bg-green-100 text-green-700" },
    qualified: { label: "Qualified", cls: "bg-blue-100 text-blue-700" },
    screening: { label: "Screening", cls: "bg-amber-100 text-amber-700" },
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Sarah Status", value: "Active", sub: "Hotline live · 24/7", icon: <Mic size={18} />, iconCls: "bg-green-100 text-green-600", trend: "Online" },
          { label: "Calls Today", value: "34", sub: "+12 from yesterday", icon: <PhoneCall size={18} />, iconCls: "bg-blue-100 text-blue-600", trend: "+54%" },
          { label: "Qualified Today", value: "6", sub: "of 14 screened", icon: <Users size={18} />, iconCls: "bg-purple-100 text-purple-600", trend: "43%" },
          { label: "Interview Ready", value: "2", sub: "Scheduled tomorrow", icon: <Star size={18} />, iconCls: "bg-amber-100 text-amber-600", trend: "↑ 2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconCls}`}>{s.icon}</div>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">{s.trend}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{s.value}</div>
            <div className="text-sm font-semibold text-gray-500">{s.label}</div>
            <div className="text-xs text-green-600 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              Candidate Pipeline
            </h2>
            <div className="flex items-center gap-1.5">
              {[{ label: "Best match" }, { label: "Interview ready" }, { label: "Recently qualified" }].map((f) => (
                <span key={f.label} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{f.label}</span>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {CANDIDATES_DATA.slice(0, 6).map((c) => {
              const sm = statusMeta[c.status];
              return (
                <div key={c.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-gray-900">{c.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sm.cls}`}>{sm.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{c.role}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{c.availability}</span>
                      <span>{c.languages.join(", ")}</span>
                      {c.qualifications.map((q) => (
                        <span key={q} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{q}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900">{c.score}<span className="text-xs text-gray-400 font-normal">%</span></div>
                    <div className="text-xs text-gray-400">{c.lastInteraction}</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900">Sarah Actions</h2>
            </div>
            <div className="p-3 space-y-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => handleAction(a.key)}
                  disabled={!!running}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${
                    running === a.key
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                  }`}
                >
                  {running === a.key
                    ? <div className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin flex-shrink-0" />
                    : <span className="flex-shrink-0">{a.icon}</span>
                  }
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
              <Activity size={14} className="text-green-600" />
              <h2 className="text-sm font-bold text-gray-900">Sarah Activity</h2>
            </div>
            <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
              {activity.map((item) => {
                const meta = ACTIVITY_META[item.type] ?? ACTIVITY_META.sarah;
                return (
                  <div key={item.id} className={`flex items-start gap-2.5 ${item.running ? "opacity-70" : ""}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.cls}`}>
                      {item.running
                        ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : meta.icon
                      }
                    </div>
                    <div>
                      <p className="text-xs text-gray-800 leading-snug font-medium">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {atsName && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-700">{atsName}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-semibold">Connected</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Last synced 2 minutes ago</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard: Jobs ─────────────────────────────────────────

function JobsPage() {
  const categories = [...new Set(JOBS_DATA.map((j) => j.category))];
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? JOBS_DATA : JOBS_DATA.filter((j) => j.category === filter);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
          <p className="text-base text-gray-500 mt-0.5">Imported from your ATS · {JOBS_DATA.length} roles</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === c ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{job.category}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                  <span className="flex items-center gap-1.5"><Hash size={14} />{job.openings} openings</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />Last activity {job.lastActivity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2">
                    <Users size={14} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">{job.qualified} qualified</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2">
                    <Star size={14} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">{job.interviewReady} interview ready</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3.5 py-2">
                    <span className="text-sm font-bold text-gray-600">{job.openings - job.interviewReady} still open</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard: Candidates ────────────────────────────────────

type Candidate = typeof CANDIDATES_DATA[number];

function CandidateDetail({ c, onClose }: { c: Candidate; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState<"summary" | "score" | "transcript">("summary");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>
            {c.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-900">{c.name}</span>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                {c.status === "interview-ready" ? "Interview Ready" : c.status === "qualified" ? "Qualified" : "Screening"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1"><Briefcase size={12} /><span className="font-semibold text-green-700">{c.job}</span></span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={12} />{c.availability}</span>
              <span>·</span>
              <span>{c.languages.join(", ")}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-gray-900">{c.score}<span className="text-base text-gray-400 font-normal">%</span></div>
            <div className="text-xs text-gray-400">match score</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 ml-1"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {(["summary", "score", "transcript"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDetailTab(t)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                detailTab === t ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t === "summary" ? "Interview Summary" : t === "score" ? "Score Breakdown" : "Call Transcript"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {detailTab === "summary" && (
            <div>
              <p className="text-base text-gray-700 leading-relaxed mb-5">{c.summary}</p>
              <div className="space-y-3">
                {c.qualifications.map((q) => (
                  <div key={q} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === "score" && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-green-700">{c.score}%</span>
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">Why {c.score}%?</div>
                  <div className="text-sm text-gray-500">Sarah scored this candidate based on your screening criteria.</div>
                </div>
              </div>

              <div className="mb-5">
                <div className="text-sm font-bold text-green-700 mb-2">What scored well</div>
                <div className="space-y-2">
                  {(c.scoreReasons ?? []).map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(c.gaps ?? []).length > 0 && (
                <div>
                  <div className="text-sm font-bold text-amber-600 mb-2">What they lack</div>
                  <div className="space-y-2">
                    {(c.gaps ?? []).map((g, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {detailTab === "transcript" && (
            <div className="space-y-3">
              {(c.transcript ?? []).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "sarah" && (
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Mic size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "candidate"
                      ? "bg-gray-100 text-gray-800 rounded-tr-sm"
                      : "bg-green-50 border border-green-200 text-gray-800 rounded-tl-sm"
                  }`}>
                    {msg.role === "sarah" && <div className="text-xs font-bold text-green-600 mb-1">Sarah</div>}
                    {msg.role === "candidate" && <div className="text-xs font-bold text-gray-500 mb-1">{c.name}</div>}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <Btn size="sm" className="flex-1">Book interview</Btn>
          <Btn variant="secondary" size="sm" className="flex-1">Send to hiring manager</Btn>
        </div>
      </div>
    </div>
  );
}

function CandidatesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const statusMeta: Record<string, { label: string; cls: string }> = {
    "interview-ready": { label: "Interview Ready", cls: "bg-green-100 text-green-700" },
    qualified: { label: "Qualified", cls: "bg-blue-100 text-blue-700" },
    screening: { label: "Screening", cls: "bg-amber-100 text-amber-700" },
  };

  const filtered = CANDIDATES_DATA.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.job.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6">
      {selected && <CandidateDetail c={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
          <p className="text-base text-gray-500 mt-0.5">{filtered.length} candidates in pipeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates…"
              className="border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full sm:w-52 focus:outline-none focus:border-green-400 transition-all"
            />
          </div>
          {["all", "interview-ready", "qualified", "screening"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === s ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              {s === "all" ? "All" : s === "interview-ready" ? "Interview Ready" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((c) => {
            const sm = statusMeta[c.status];
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: c.color }}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-gray-900">{c.name}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sm.cls}`}>{sm.label}</span>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Briefcase size={10} />{c.job}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={12} />{c.availability}</span>
                    <span>{c.languages.join(", ")}</span>
                    {c.qualifications.slice(0, 2).map((q) => (
                      <span key={q} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">{q}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{c.score}<span className="text-sm text-gray-400 font-normal">%</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.lastInteraction}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard: Call Logs ─────────────────────────────────────

function CallLogsPage() {
  const [filter, setFilter] = useState("all");

  const statusMeta: Record<string, { label: string; cls: string }> = {
    completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
    missed: { label: "Missed", cls: "bg-red-100 text-red-600" },
    "in-progress": { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
  };

  const typeMeta: Record<string, { label: string; cls: string }> = {
    screening: { label: "Screening", cls: "bg-blue-100 text-blue-700" },
    incoming: { label: "Incoming", cls: "bg-gray-100 text-gray-600" },
  };

  const filtered = filter === "all" ? CALL_LOGS_DATA : CALL_LOGS_DATA.filter((l) =>
    filter === "missed" ? l.status === "missed" :
    filter === "completed" ? l.status === "completed" :
    filter === "screening" ? l.type === "screening" : true
  );

  const stats = {
    total: CALL_LOGS_DATA.length,
    completed: CALL_LOGS_DATA.filter((l) => l.status === "completed").length,
    missed: CALL_LOGS_DATA.filter((l) => l.status === "missed").length,
    screening: CALL_LOGS_DATA.filter((l) => l.type === "screening").length,
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Call Logs</h2>
          <p className="text-base text-gray-500 mt-0.5">All calls handled by Sarah</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Calls", value: stats.total, cls: "bg-white" },
          { label: "Completed", value: stats.completed, cls: "bg-green-50" },
          { label: "Missed", value: stats.missed, cls: "bg-red-50" },
          { label: "Screenings", value: stats.screening, cls: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.cls} rounded-2xl border border-gray-200 p-4`}>
            <div className="text-3xl font-bold text-gray-900 mb-1">{s.value}</div>
            <div className="text-sm text-gray-500 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { key: "all", label: "All calls" },
          { key: "screening", label: "Screenings" },
          { key: "completed", label: "Completed" },
          { key: "missed", label: "Missed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.key ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Caller", "Date / Time", "Duration", "Type", "Outcome", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((log) => {
              const sm = statusMeta[log.status];
              const tm = typeMeta[log.type];
              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-gray-900">{log.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{log.caller}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-gray-700">{log.date}</div>
                    <div className="text-xs text-gray-400">{log.time}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-600">{log.duration}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tm.cls}`}>{tm.label}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{log.outcome}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sm.cls}`}>{sm.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard: Settings ─────────────────────────────────────

const SARAH_VOICES = [
  { id: "us-male", label: "American Male", flag: "🇺🇸" },
  { id: "us-female", label: "American Female", flag: "🇺🇸" },
  { id: "gb-male", label: "British Male", flag: "🇬🇧" },
  { id: "gb-female", label: "British Female", flag: "🇬🇧" },
  { id: "au-female", label: "Australian Female", flag: "🇦🇺" },
  { id: "au-male", label: "Australian Male", flag: "🇦🇺" },
  { id: "ie-female", label: "Irish Female", flag: "🇮🇪" },
  { id: "ca-female", label: "Canadian Female", flag: "🇨🇦" },
];

function SettingsPage({ phoneNumber, atsName }: { phoneNumber: string; atsName: string | null }) {
  const [tab, setTab] = useState<"hotline" | "ats" | "sarah" | "screening" | "team">("hotline");
  const [selectedVoice, setSelectedVoice] = useState("gb-female");

  // Screening tab state
  const jobNames = Object.keys(DEFAULT_QUESTIONS);
  const [screeningJob, setScreeningJob] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQ, setNewQ] = useState("");

  const TABS = [
    { key: "hotline", label: "Hiring Hotline", icon: <Phone size={15} /> },
    { key: "ats", label: "ATS Integration", icon: <Zap size={15} /> },
    { key: "sarah", label: "Sarah Config", icon: <Mic size={15} /> },
    { key: "screening", label: "Screening", icon: <FileText size={15} /> },
    { key: "team", label: "Team Members", icon: <Users size={15} /> },
  ];

  const TEAM = [
    { name: "Alex Chen", role: "Admin", email: "alex@acmeconstruction.co.uk", initials: "AC", color: "#16A34A" },
    { name: "Bryony Walsh", role: "Recruiter", email: "bryony@acmeconstruction.co.uk", initials: "BW", color: "#3B82F6" },
    { name: "Sam Okafor", role: "Hiring Manager", email: "sam@acmeconstruction.co.uk", initials: "SO", color: "#8B5CF6" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-base text-gray-500 mt-0.5">Manage your hiring hotline and Sarah configuration</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="sm:w-52 flex-shrink-0 flex sm:flex-col gap-1 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-shrink-0 sm:w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-left transition-all whitespace-nowrap ${
                tab === t.key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6">
          {tab === "hotline" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Hiring Hotline</h3>
              <div className="space-y-5">
                <div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="text-sm font-semibold text-green-700 mb-1">Active Number</div>
                  <div className="text-3xl font-bold text-gray-900 font-mono">{phoneNumber || "020 8123 4567"}</div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2"><GreenDot /> Live and accepting calls</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Country", value: "United Kingdom 🇬🇧" },
                    { label: "Area Code", value: "020 (London)" },
                    { label: "Call forwarding", value: "Sarah (AI)" },
                    { label: "Voicemail", value: "Enabled" },
                    { label: "Call recording", value: "Enabled" },
                    { label: "Transcription", value: "Enabled" },
                  ].map((f) => (
                    <div key={f.label} className="border border-gray-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-1">{f.label}</div>
                      <div className="text-sm font-bold text-gray-900">{f.value}</div>
                    </div>
                  ))}
                </div>
                <Btn variant="secondary" size="sm">Change number</Btn>
              </div>
            </div>
          )}

          {tab === "ats" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">ATS Integration</h3>
              {atsName ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {atsName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-900">{atsName}</div>
                      <div className="text-sm text-green-700 flex items-center gap-1.5 mt-1"><GreenDot />Connected · Last synced 2 minutes ago</div>
                    </div>
                    <Btn variant="secondary" size="sm">Disconnect</Btn>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Jobs synced", value: "12" },
                      { label: "Candidates synced", value: "234" },
                      { label: "Sync frequency", value: "Every 5 min" },
                    ].map((s) => (
                      <div key={s.label} className="border border-gray-200 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-1">{s.label}</div>
                        <div className="text-lg font-bold text-gray-900">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-3 text-5xl">🔗</div>
                  <p className="text-base text-gray-600 mb-4">No ATS connected</p>
                  <Btn size="sm">Connect an ATS</Btn>
                </div>
              )}
            </div>
          )}

          {tab === "sarah" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Sarah Configuration</h3>
              <div className="space-y-6">
                {/* Voice selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sarah's voice</label>
                  <p className="text-xs text-gray-500 mb-3">Choose the voice candidates hear when Sarah calls them.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SARAH_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                          selectedVoice === v.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:border-green-300"
                        }`}
                      >
                        <span className="text-xl">{v.flag}</span>
                        <span className={`text-xs font-semibold leading-tight ${selectedVoice === v.id ? "text-green-700" : "text-gray-700"}`}>{v.label}</span>
                        {selectedVoice === v.id && <span className="text-[10px] text-green-600 font-bold">Selected</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-4">
                  {[
                    { label: "Company name", value: "Acme Construction Ltd" },
                    { label: "Hiring locations", value: "London, Birmingham, Manchester" },
                    { label: "Languages Sarah speaks", value: "English, Polish, Portuguese" },
                    { label: "Business hours", value: "Mon–Fri 7am–7pm, Sat 8am–4pm" },
                    { label: "After-hours behaviour", value: "Take voicemail, call back next day" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                      <input defaultValue={f.value} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-green-400 transition-all" />
                    </div>
                  ))}
                </div>
                <Btn size="sm">Save changes</Btn>
              </div>
            </div>
          )}

          {tab === "screening" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Screening Questions</h3>
              <p className="text-sm text-gray-500 mb-5">Select a job to view and edit its screening questions.</p>

              {/* Job selector */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job</label>
                <div className="grid grid-cols-2 gap-2">
                  {jobNames.map((job) => (
                    <button
                      key={job}
                      onClick={() => {
                        setScreeningJob(job);
                        setQuestions([...DEFAULT_QUESTIONS[job]]);
                      }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        screeningJob === job
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                      }`}
                    >
                      <Briefcase size={15} className={screeningJob === job ? "text-green-600" : "text-gray-400"} />
                      <span className="text-sm font-semibold leading-tight">{job}</span>
                    </button>
                  ))}
                </div>
              </div>

              {screeningJob && (
                <>
                  <div className="space-y-2.5 mb-4">
                    {questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="w-6 h-6 rounded-lg bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-base text-gray-800 flex-1">{q}</span>
                        <button onClick={() => setQuestions((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newQ}
                      onChange={(e) => setNewQ(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newQ.trim()) { setQuestions((p) => [...p, newQ.trim()]); setNewQ(""); } }}
                      placeholder="Add a new question…"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-green-400 transition-all"
                    />
                    <button
                      onClick={() => { if (newQ.trim()) { setQuestions((p) => [...p, newQ.trim()]); setNewQ(""); } }}
                      className="bg-green-600 text-white rounded-xl px-4 py-3 hover:bg-green-700 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <Btn size="sm">Save questions for {screeningJob}</Btn>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "team" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                <Btn size="sm"><Plus size={14} />Add member</Btn>
              </div>
              <div className="space-y-3">
                {TEAM.map((member) => (
                  <div key={member.name} className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: member.color }}>
                      {member.initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{member.role}</span>
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root Export ─────────────────────────────────────────────

export default function EnterpriseOnboardingPage() {
  const [step, setStep] = useState<OnboardStep>("login");
  const [country, setCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [areaCode, setAreaCode] = useState<string>("");
  const [areaCity, setAreaCity] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [atsName, setAtsName] = useState<string | null>(null);
  const [dashPage, setDashPage] = useState<DashPage>("home");

  return (
    <>
      {step === "login" && (
        <LoginScreen onNext={() => setStep("country")} />
      )}
      {step === "country" && (
        <CountryScreen onSelect={(c) => { setCountry(c); setStep("areacode"); }} />
      )}
      {step === "areacode" && country && (
        <AreaCodeScreen
          country={country}
          onSelect={(code, city) => { setAreaCode(code); setAreaCity(city); setStep("number"); }}
        />
      )}
      {step === "number" && (
        <NumberScreen
          areaCode={areaCode}
          city={areaCity}
          onSelect={(n) => { setPhoneNumber(n); setStep("provisioning"); }}
        />
      )}
      {step === "provisioning" && (
        <ProvisioningScreen number={phoneNumber} onDone={() => setStep("ats-connect")} />
      )}
      {step === "ats-connect" && (
        <ATSConnectScreen
          onConnect={(ats) => { setAtsName(ats); setStep("ats-imported"); }}
          onSkip={() => setStep("screening")}
        />
      )}
      {step === "ats-imported" && (
        <ATSImportedScreen atsName={atsName ?? "Greenhouse"} onNext={() => setStep("screening")} />
      )}
      {step === "screening" && (
        <ScreeningScreen onNext={() => setStep("golive")} />
      )}
      {step === "golive" && (
        <GoLiveScreen number={phoneNumber} atsName={atsName} onDone={() => setStep("dashboard")} />
      )}
      {step === "dashboard" && (
        <DashboardShell activePage={dashPage} onNav={setDashPage} phoneNumber={phoneNumber}>
          {dashPage === "home" && <DashboardHome atsName={atsName} />}
          {dashPage === "jobs" && <JobsPage />}
          {dashPage === "candidates" && <CandidatesPage />}
          {dashPage === "calllogs" && <CallLogsPage />}
          {dashPage === "settings" && <SettingsPage phoneNumber={phoneNumber} atsName={atsName} />}
        </DashboardShell>
      )}
    </>
  );
}
