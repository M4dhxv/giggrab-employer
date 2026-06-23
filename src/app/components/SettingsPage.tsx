import { useState } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, BarChart2, Users, Settings, Plus, Check, ChevronRight } from "lucide-react";
import { CreditCard } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const ATS_DATA = [
  { name: "Greenhouse", color: "#24a053", bg: "#e8f7ef", letter: "G" },
  { name: "Ashby",      color: "#6366f1", bg: "#eeeffd", letter: "A" },
  { name: "Lever",      color: "#1b7ee1", bg: "#e6f1fb", letter: "L" },
  { name: "Workday",    color: "#e85d04", bg: "#fef0e8", letter: "W" },
  { name: "Bullhorn",   color: "#c0392b", bg: "#fdecea", letter: "B" },
];

const BOARD_DATA = [
  { name: "Indeed",       color: "#003a9b", bg: "#e6eaf7", letter: "I" },
  { name: "LinkedIn",     color: "#0077b5", bg: "#e5f2fa", letter: "in" },
  { name: "ZipRecruiter", color: "#4a00d4", bg: "#ede5fb", letter: "Z" },
  { name: "Adzuna",       color: "#e85d04", bg: "#fef0e8", letter: "A" },
  { name: "Jooble",       color: "#1da462", bg: "#e8f7ef", letter: "J" },
];

const LANGUAGES = [
  "English","Spanish","French","German","Portuguese","Mandarin",
  "Arabic","Hindi","Polish","Italian","Dutch","Japanese",
  "Korean","Turkish","Romanian","Ukrainian","Russian","Swedish",
  "Norwegian","Danish","Finnish","Czech","Hungarian","Greek",
  "Thai","Vietnamese","Indonesian","Malay","Tagalog","Bengali","Urdu","Swahili",
];

const SETTINGS_TABS = ["ATS","Job Boards","Sarah Config","Screening Questions","Languages","Billing","Defaults"];

function SideNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { label: "Dashboard",  icon: <LayoutDashboard size={16} />, path: "/dashboard" },
    { label: "Campaigns",  icon: <BarChart2 size={16} />,       path: "/campaigns" },
    { label: "Candidates", icon: <Users size={16} />,           path: "/dashboard" },
    { label: "Settings",   icon: <Settings size={16} />,        path: "/settings"  },
  ];
  return (
    <div className="w-44 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col py-5">
      <div className="px-4 mb-5">
        <button onClick={() => navigate("/employer")} className="text-xl font-bold tracking-tight" style={{ color: GG }}>GigGrab</button>
      </div>
      <button onClick={() => navigate("/post-job")}
        className="mx-3 mb-5 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5"
        style={{ backgroundColor: GG }}>
        <Plus size={12} /> Post a Job
      </button>
      <nav className="flex-1 space-y-0.5 px-2">
        {items.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
            style={item.label === active ? { backgroundColor: GG_LIGHT, color: GG, fontWeight: 600 } : { color: "#6b7280" }}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>
      <div className="px-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: GG }}>N</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">NHS Logistics</p>
            <p className="text-xs text-gray-400">Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("ATS");

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SideNav active="Settings" />

      <div className="flex-1 flex overflow-hidden">
        {/* Settings sub-nav */}
        <div className="w-44 flex-shrink-0 border-r border-gray-100 bg-white py-6 px-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3">Settings</p>
          <div className="space-y-0.5">
            {SETTINGS_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors"
                style={tab === t ? { backgroundColor: GG_LIGHT, color: GG, fontWeight: 600 } : { color: "#6b7280" }}>
                {t}
                {tab === t && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{tab}</h1>

          {tab === "ATS" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Connect your ATS so Sarah can access and update candidate records automatically.</p>
              <div className="space-y-3">
                {ATS_DATA.map((ats) => (
                  <div key={ats.name} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black"
                        style={{ backgroundColor: ats.bg, color: ats.color }}>{ats.letter}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{ats.name}</p>
                        <p className="text-xs text-gray-400">Applicant Tracking System</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: GG }}>Connect</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Job Boards" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Connect job boards so Sarah can post and manage your listings automatically.</p>
              <div className="space-y-3">
                {BOARD_DATA.map((b) => (
                  <div key={b.name} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: b.bg, color: b.color }}>{b.letter}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-400">Job Board</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: GG }}>Connect</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Sarah Config" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Control how Sarah behaves during recruiting calls and candidate outreach.</p>
              <div className="space-y-4">
                {[
                  { label: "Screening Call Duration", desc: "Max minutes per screening call", val: "8 min" },
                  { label: "Follow-up Attempts", desc: "Number of callback attempts per candidate", val: "3" },
                  { label: "Callback Window", desc: "Hours Sarah will attempt to reach candidates", val: "9am – 7pm" },
                  { label: "Sarah's Tone", desc: "Communication style for candidate calls", val: "Professional" },
                  { label: "Shortlist Threshold", desc: "Minimum score to appear in shortlist", val: "70%" },
                ].map(({ label, desc, val }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 px-3 py-1.5 rounded-lg bg-gray-50">{val}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Screening Questions" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Manage the questions Sarah asks during candidate screening calls.</p>
              <div className="space-y-3 mb-4">
                {[
                  "Are you available to start within 2 weeks?",
                  "Do you have previous warehouse experience?",
                  "Are you comfortable working rotating shifts?",
                  "Do you have the right to work in the UK?",
                ].map((q, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700">{q}</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                      <button className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-sm font-medium" style={{ color: GG }}>
                <Plus size={16} /> Add screening question
              </button>
            </div>
          )}

          {tab === "Languages" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Enable the languages Sarah uses for candidate outreach. Sarah is fluent in all 32.</p>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <div key={lang} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 bg-white">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: GG }}>
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Billing" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Manage your billing information and view your usage.</p>
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-4">Current Usage</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Sarah Minutes Used", val: "1,240 min", sub: "this month" },
                    { label: "Advertising Spend",  val: "$1,350",    sub: "this month" },
                    { label: "Total Cost",         val: "$1,660",    sub: "this month" },
                  ].map(({ label, val, sub }) => (
                    <div key={label} className="rounded-xl p-3 bg-gray-50 text-center">
                      <p className="text-xl font-bold text-gray-900">{val}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Visa ending 4242</p>
                    <p className="text-xs text-gray-400">Expires 08/2027</p>
                  </div>
                  <button className="ml-auto text-sm font-medium" style={{ color: GG }}>Update</button>
                </div>
              </div>
            </div>
          )}

          {tab === "Defaults" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">Set default campaign settings and budget rules for new jobs.</p>
              <div className="space-y-3">
                {[
                  { label: "Default Daily Budget",    val: "$45/day" },
                  { label: "Default Sarah Minutes",   val: "200 min" },
                  { label: "Default Job Boards",      val: "Indeed, LinkedIn, ZipRecruiter" },
                  { label: "Auto-pause at spend limit", val: "$500/month" },
                  { label: "Budget increase approval", val: "Manual approval" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 px-3 py-1.5 rounded-lg bg-gray-50">{val}</span>
                      <button className="text-xs text-gray-400 hover:text-gray-600">Edit</button>
                    </div>
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
