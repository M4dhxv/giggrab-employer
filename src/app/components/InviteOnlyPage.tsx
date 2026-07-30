// FineClean candidate portal — shown for the home route and any non-candidate
// URL. This deployment is invite-only: candidates arrive via a tokened link in
// their FineClean email. No marketing pages, no redirects off-site.

import { Mail } from "lucide-react";
import { DualHeader } from "./CandidateFormPage";

const GG = "#10b981";
const GG_LIGHT = "#f0fdf4";

// Candidate support contact shown on this page — the same address Sarah's
// emails are sent from, so replies land in the right place.
const SUPPORT_EMAIL = "sarah@giggrab.io";

export default function InviteOnlyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <DualHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md gg-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: GG_LIGHT }}>
            <Mail size={26} style={{ color: GG }} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-3">
            Please follow your invite link
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            This is FineClean's application portal. To continue, please open the personal link
            in the email we sent you — that's the only way to access your application.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mt-4">
            If you're having any issues, reach out to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium" style={{ color: GG }}>
              {SUPPORT_EMAIL}
            </a>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>
    </div>
  );
}
