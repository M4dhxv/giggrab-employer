import { useState } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, BarChart2, Users, Settings, Plus, Pause, Play, DollarSign } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const INITIAL_CAMPAIGNS = [
  { title: "Warehouse Associate", status: "active",  platforms: ["Indeed","LinkedIn","ZipRecruiter"], budget: 45, applicants: 387, screenings: 40, qualified: 12, cpl: 3.75 },
  { title: "Forklift Operator",   status: "active",  platforms: ["Indeed","ZipRecruiter"],           budget: 30, applicants: 210, screenings: 22, qualified: 6,  cpl: 5.00 },
  { title: "Night Shift Packer",  status: "paused",  platforms: ["Indeed","Adzuna"],                 budget: 20, applicants: 95,  screenings: 10, qualified: 3,  cpl: 6.67 },
];

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

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS.map(c => ({ ...c })));
  const [editing, setEditing] = useState<string | null>(null);

  function toggleStatus(title: string) {
    setCampaigns(cs => cs.map(c => c.title === title ? { ...c, status: c.status === "active" ? "paused" : "active" } : c));
  }

  const PLATFORM_COLORS = ["#003a9b","#0077b5","#4a00d4","#e85d04","#1da462"];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SideNav active="Campaigns" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your recruiting campaigns and budgets.</p>
          </div>
          <button onClick={() => navigate("/post-job")}
            className="px-4 py-2 text-xs text-white rounded-xl font-semibold"
            style={{ backgroundColor: GG }}>
            + New Campaign
          </button>
        </div>

        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900">{c.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={c.status === "active" ? { backgroundColor: GG_LIGHT, color: GG } : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                      {c.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.platforms.map(p => (
                      <span key={p} className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(c.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors">
                    {c.status === "active" ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
                  </button>
                  <button onClick={() => setEditing(editing === c.title ? null : c.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors">
                    <DollarSign size={12} /> Edit Budget
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-3">
                {[
                  { label: "Daily Budget", val: `$${c.budget}/day` },
                  { label: "Applicants",   val: c.applicants },
                  { label: "Screenings",   val: c.screenings },
                  { label: "Qualified",    val: c.qualified, hl: true },
                  { label: "Cost / Qual.", val: `$${c.cpl.toFixed(2)}` },
                ].map(({ label, val, hl }) => (
                  <div key={label} className="rounded-xl p-3 text-center"
                    style={hl ? { backgroundColor: GG_LIGHT } : { backgroundColor: "#f9fafb" }}>
                    <p className="text-sm font-bold" style={hl ? { color: GG } : { color: "#111827" }}>{val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 h-1.5 rounded-full overflow-hidden mb-1">
                {c.platforms.map((p, i) => (
                  <div key={p} className="flex-1 h-full" style={{ backgroundColor: PLATFORM_COLORS[i % PLATFORM_COLORS.length] }} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                {c.platforms.map((p, i) => (
                  <span key={p} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[i % PLATFORM_COLORS.length] }} />{p}
                  </span>
                ))}
              </div>

              {editing === c.title && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Edit daily budget — ${c.budget}/day</p>
                  <input type="range" min={10} max={200} step={5} defaultValue={c.budget}
                    onChange={(e) => setCampaigns(cs => cs.map(x => x.title === c.title ? { ...x, budget: +e.target.value } : x))}
                    className="w-full mb-3" style={{ accentColor: GG }} />
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)}
                      className="flex-1 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: GG }}>
                      Save Changes
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
