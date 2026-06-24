import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check, Sparkles } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const DEFAULT_BUDGETS: Record<string, number> = {
  Indeed: 20, LinkedIn: 15, ZipRecruiter: 10, Adzuna: 5, Jooble: 5,
};

function calcCapacity(totalBudget: number) {
  const expectedApplicants = Math.round(totalBudget * 3);
  const recommendedMinutes = Math.max(100, Math.round((expectedApplicants * 2) / 10) * 10);
  const expectedScreenings = Math.round(recommendedMinutes / 8);
  const expectedQualified = Math.round(expectedScreenings * 0.35);
  return { expectedApplicants, recommendedMinutes, expectedScreenings, expectedQualified };
}

export default function ServicePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [minutes, setMinutes] = useState(300);
  const [budgets, setBudgets] = useState<Record<string, number>>({ ...DEFAULT_BUDGETS });
  const [activePlatforms, setActivePlatforms] = useState(new Set(["Indeed","LinkedIn","ZipRecruiter"]));
  const [sarahMin, setSarahMin] = useState(200);
  const [userAdjustedMin, setUserAdjustedMin] = useState(false);
  const [networkActive, setNetworkActive] = useState(false);
  const [networkBudget, setNetworkBudget] = useState(15);

  const totalBudget = [...activePlatforms].reduce((s, p) => s + (budgets[p] || 0), 0)
    + (networkActive ? networkBudget : 0);
  const cap = calcCapacity(totalBudget);

  useEffect(() => {
    if (!userAdjustedMin) setSarahMin(cap.recommendedMinutes);
  }, [totalBudget, userAdjustedMin, cap.recommendedMinutes]);

  const estScreeningsA = Math.round(minutes / 5);
  const estQualA = Math.round(estScreeningsA * 0.3);

  function togglePlatform(p: string, e: React.MouseEvent) {
    e.stopPropagation();
    setActivePlatforms((prev) => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }

  function handleContinue() {
    sessionStorage.setItem("gg_service", JSON.stringify({
      option: selected, minutes, budgets,
      activePlatforms: [...activePlatforms], sarahMin,
      networkActive, networkBudget,
    }));
    navigate("/launch");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-4 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How would you like to use Sarah?</h1>
        <p className="text-gray-500 text-sm mb-7">Choose your recruiting approach. You can combine both.</p>

        <div className="grid grid-cols-2 gap-5 mb-7">
          {/* Option A — Screen Existing */}
          <div
            onClick={() => setSelected(selected === "A" ? null : "A")}
            className="rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-sm"
            style={{ borderColor: selected === "A" ? GG : "#e5e7eb" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Option A</p>
                <h3 className="text-lg font-bold text-gray-900">Screen Existing Candidates</h3>
              </div>
              {selected === "A" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: GG }}>
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">Upload your ATS or CSV. Sarah calls and qualifies everyone automatically.</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {["ATS","CSV Upload","Existing Database"].map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{s}</span>
              ))}
            </div>
            <p className="text-2xl font-bold text-gray-900">$0.25<span className="text-base font-normal text-gray-400">/min</span></p>

            {selected === "A" && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Sarah Minutes</p>
                  <p className="text-sm font-bold text-gray-900">{minutes} min</p>
                </div>
                <input type="range" min={100} max={2000} step={50} value={minutes}
                  onChange={(e) => setMinutes(+e.target.value)}
                  className="w-full mb-4" style={{ accentColor: GG }} />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Est. Screenings", val: estScreeningsA },
                    { label: "Qualified", val: estQualA, hl: true },
                    { label: "Total Cost", val: `$${(minutes * 0.25).toFixed(0)}` },
                  ].map(({ label, val, hl }) => (
                    <div key={label} className="rounded-lg p-2.5"
                      style={hl ? { backgroundColor: GG_LIGHT } : { backgroundColor: "#f9fafb" }}>
                      <p className="text-lg font-bold" style={hl ? { color: GG } : { color: "#111827" }}>{val}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Option B — Distribution + Sarah */}
          <div
            onClick={() => setSelected(selected === "B" ? null : "B")}
            className="rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-sm"
            style={{ borderColor: selected === "B" ? GG : "#e5e7eb" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Option B</p>
                <h3 className="text-lg font-bold text-gray-900">Distribution + Sarah</h3>
              </div>
              {selected === "B" && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: GG }}>
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">Post across job boards and Sarah screens every inbound applicant.</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {["Indeed","LinkedIn","ZipRecruiter"].map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{s}</span>
              ))}
            </div>

            {selected === "B" && (
              <div className="mt-3 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Platform Budgets</p>
                {Object.keys(DEFAULT_BUDGETS).map((platform) => {
                  const active = activePlatforms.has(platform);
                  return (
                    <div key={platform}>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => togglePlatform(platform, e)}
                              className="w-4 h-4 rounded flex items-center justify-center border"
                              style={{ backgroundColor: active ? GG : "white", borderColor: active ? GG : "#d1d5db" }}>
                              {active && <Check size={10} className="text-white" strokeWidth={3} />}
                            </button>
                            <span className="text-sm text-gray-700">{platform}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">${budgets[platform]}/day</span>
                        </div>
                        {active && (
                          <input type="range" min={5} max={100} step={5} value={budgets[platform]}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              setBudgets((b) => ({ ...b, [platform]: +e.target.value }));
                              setUserAdjustedMin(false);
                            }}
                            className="w-full" style={{ accentColor: GG }} />
                        )}
                      </div>

                      {platform === "ZipRecruiter" && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setNetworkActive(a => !a); }}
                                className="w-4 h-4 rounded flex items-center justify-center border"
                                style={{ backgroundColor: networkActive ? GG : "white", borderColor: networkActive ? GG : "#d1d5db" }}>
                                {networkActive && <Check size={10} className="text-white" strokeWidth={3} />}
                              </button>
                              <span className="text-sm text-gray-700">Promote to Network</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: GG_LIGHT, color: GG }}>GigGrab</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">${networkBudget}/day</span>
                          </div>
                          {networkActive && (
                            <input type="range" min={5} max={100} step={5} value={networkBudget}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); setNetworkBudget(+e.target.value); setUserAdjustedMin(false); }}
                              className="w-full" style={{ accentColor: GG }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sarah Capacity Planner */}
        {selected === "B" && (
          <div className="rounded-2xl border border-gray-200 p-6 mb-7">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: GG }} />
                <p className="text-sm font-semibold text-gray-800">Sarah Capacity Planner</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: GG_LIGHT, color: GG }}>
                Auto-calculated
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Based on your <strong className="text-gray-700">${totalBudget}/day</strong> advertising budget, we estimate{" "}
              <strong className="text-gray-700">{cap.expectedApplicants} applicants/day</strong> and recommend{" "}
              <strong style={{ color: GG }}>{cap.recommendedMinutes} screening minutes</strong>.
            </p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Sarah Minutes</p>
              <div className="flex items-center gap-2">
                {!userAdjustedMin && <span className="text-xs text-gray-400">Recommended</span>}
                <p className="text-sm font-bold text-gray-900">
                  {sarahMin} min · <span className="text-gray-400 font-normal">${(sarahMin * 0.25).toFixed(0)}/day</span>
                </p>
              </div>
            </div>
            <input type="range" min={100} max={2000} step={50} value={sarahMin}
              onChange={(e) => { setSarahMin(+e.target.value); setUserAdjustedMin(true); }}
              className="w-full mb-5" style={{ accentColor: GG }} />
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Expected Applicants",  val: cap.expectedApplicants },
                { label: "Expected Screenings",  val: Math.round(sarahMin / 8) },
                { label: "Qualified Candidates", val: Math.round((sarahMin / 8) * 0.35), hl: true },
              ].map(({ label, val, hl }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={hl ? { backgroundColor: GG_LIGHT } : { backgroundColor: "#f9fafb" }}>
                  <p className="text-xl font-bold" style={hl ? { color: GG } : { color: "#111827" }}>{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="px-5 py-3 text-sm text-white rounded-xl font-semibold disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: GG }}>
            {selected ? "Continue to Launch →" : "Select an option to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
