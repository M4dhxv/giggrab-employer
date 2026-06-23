import { useState } from "react";
import { useNavigate } from "react-router";
import { usePostHog } from "@posthog/react";
import { Phone, Check, PhoneCall, ChevronDown } from "lucide-react";

const GG = "#3d8c62";
const GG_LIGHT = "#f0f8f4";

const LANGUAGES = [
  "English","Spanish","French","German","Portuguese","Mandarin",
  "Arabic","Hindi","Polish","Italian","Dutch","Japanese",
  "Korean","Turkish","Romanian","Ukrainian","Russian","Swedish",
  "Norwegian","Danish","Finnish","Czech","Hungarian","Greek",
  "Thai","Vietnamese","Indonesian","Malay","Tagalog","Bengali","Urdu","Swahili",
];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [phone, setPhone] = useState("+44 7700 900123");
  const [lang, setLang] = useState("English");

  function handleCall(e: React.FormEvent) {
    e.preventDefault();
    posthog?.capture("callback_requested", { language: lang });
    navigate("/connecting");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="flex items-center justify-center py-5 border-b border-gray-100">
        <button onClick={() => navigate("/employer")}
          className="text-xl font-bold tracking-tight" style={{ color: GG }}>
          GigGrab
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: GG_LIGHT }}>
              <PhoneCall size={28} style={{ color: GG }} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Request a callback from Sarah
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Drop your number and Sarah calls you back in seconds — she writes your job spec while you talk.
          </p>

          <form onSubmit={handleCall} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none text-gray-900 transition-colors"
                onFocus={(e) => (e.target.style.borderColor = GG)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Preferred language</label>
              <p className="text-xs text-gray-400 mb-1.5">Sarah speaks all 32, AI-powered</p>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none bg-white focus:outline-none text-gray-900 pr-9"
                >
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: GG }}>
              <Phone size={16} /> Call Me
            </button>
          </form>

          <div className="flex justify-center gap-5 mt-4 text-xs text-gray-400">
            {["Calls back in seconds", "32 languages", "Free call"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Check size={12} style={{ color: GG }} />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
