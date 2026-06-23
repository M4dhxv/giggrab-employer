import { useState } from "react";
import { useNavigate } from "react-router";
import { usePostHog } from "@posthog/react";
import { Check, Sparkles } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

function calcCapacity(totalBudget: number) {
  const expectedApplicants = Math.round(totalBudget * 3);
  const expectedScreenings = Math.round((Math.max(100, Math.round((expectedApplicants * 2) / 10) * 10)) / 8);
  const expectedQualified = Math.round(expectedScreenings * 0.35);
  return { expectedApplicants, expectedScreenings, expectedQualified };
}

export default function LaunchPage() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [agreed, setAgreed] = useState(false);

  // Read service data saved by ServicePage (graceful defaults if missing)
  let option: "A" | "B" = "B";
  let minutes = 300;
  let budgets: Record<string, number> = { Indeed: 20, LinkedIn: 15, ZipRecruiter: 10 };
  let activePlatforms: string[] = ["Indeed","LinkedIn","ZipRecruiter"];
  let sarahMin = 200;

  try {
    const raw = sessionStorage.getItem("gg_service");
    if (raw) {
      const d = JSON.parse(raw);
      option = d.option ?? "B";
      minutes = d.minutes ?? 300;
      budgets = d.budgets ?? budgets;
      activePlatforms = d.activePlatforms ?? activePlatforms;
      sarahMin = d.sarahMin ?? 200;
    }
  } catch {}

  const sarahCost = option === "A" ? minutes * 0.25 : sarahMin * 0.25;
  const adSpend = option === "B" ? activePlatforms.reduce((s, p) => s + (budgets[p] || 0), 0) : 0;
  const totalDaily = sarahCost + adSpend;
  const cap = option === "B" ? calcCapacity(adSpend) : null;
  const estApplicants = cap?.expectedApplicants ?? Math.round(minutes / 5) * 3;
  const estScreenings = option === "A" ? Math.round(minutes / 5) : Math.round(sarahMin / 8);
  const estQualified = Math.round(estScreenings * 0.35);

  function handleLaunch() {
    posthog?.capture("campaign_launched", { option, totalDailyCost: totalDaily });
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-4 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: GG_LIGHT }}>
              <Sparkles size={28} style={{ color: GG }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to launch</h1>
            <p className="text-gray-500 text-sm">Sarah starts recruiting the moment you launch.</p>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-2xl border border-gray-200 p-5 mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-4">Cost Breakdown</p>
            <div className="space-y-2">
              {option === "B" && activePlatforms.map((p) => (
                <div key={p} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{p} advertising</span>
                  <span className="font-medium text-gray-900">${budgets[p]}/day</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Sarah screening ({option === "A" ? minutes : sarahMin} min × $0.25)
                </span>
                <span className="font-medium text-gray-900">${sarahCost.toFixed(0)}/day</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 mt-2">
                <span className="font-semibold text-gray-900">Total daily cost</span>
                <span className="font-bold text-gray-900 text-base">${totalDaily.toFixed(0)}/day</span>
              </div>
            </div>
          </div>

          {/* Estimates */}
          <div className="rounded-2xl border border-gray-100 p-5 mb-5" style={{ backgroundColor: GG_LIGHT }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GG }}>Estimated Outcomes</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Applicants", val: estApplicants },
                { label: "Screenings", val: estScreenings },
                { label: "Qualified",  val: estQualified },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-2xl font-bold" style={{ color: GG }}>{val}</p>
                  <p className="text-xs mt-0.5" style={{ color: GG, opacity: 0.7 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ToS */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <button
              onClick={() => setAgreed(!agreed)}
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors"
              style={{ backgroundColor: agreed ? GG : "white", borderColor: agreed ? GG : "#d1d5db" }}>
              {agreed && <Check size={12} className="text-white" strokeWidth={3} />}
            </button>
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="underline" style={{ color: GG }}>GigGrab Terms of Service</span>
              {" "}and authorise Sarah to begin recruiting on my behalf.
            </span>
          </label>

          <button
            onClick={handleLaunch}
            disabled={!agreed}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: GG }}>
            Launch
          </button>
        </div>
      </div>
    </div>
  );
}
