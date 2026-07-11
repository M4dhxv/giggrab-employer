// FineClean API client — talks to the Supabase edge functions.
// Ported from fineclean-pilot/lib/api.ts. Candidate-facing functions are
// token-gated (the invitation token IS the auth), so we send the publishable
// key as apikey and pass the token in every body.

const BASE = import.meta.env.VITE_FC_API_BASE as string;
const KEY = import.meta.env.VITE_SUPABASE_KEY as string;

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CandidateLookup {
  candidate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string | null;
  current_status: string;
  is_active: boolean;
  employer_name: string | null;
  job_title: string | null;
}
export interface PrequalResponse { question: string; answer: string }
export interface PrequalResult {
  success: boolean;
  next_step: 'screening' | 'done';
  reason?: string;
  prequal_score?: number;
  prequal_band?: 'strong' | 'maybe' | 'weak';
}
export interface OtpResult { success: boolean; already_verified?: boolean }
export interface VerifyResult { success: boolean; verified: boolean; remaining_attempts?: number }
export interface ScreeningResult { success: boolean; session_id: string }

// ─── Candidate-facing API ─────────────────────────────────────────────────────
export const fc = {
  lookupCandidate: (token: string) =>
    post<CandidateLookup>('fc-candidate-lookup', { token }),

  submitPrequal: (
    token: string,
    candidate_id: string,
    responses: PrequalResponse[],
    completion_time_seconds?: number,
  ) => post<PrequalResult>('fc-submit-prequal', { token, candidate_id, responses, completion_time_seconds }),

  requestOtp: (token: string, candidate_id: string, phone: string) =>
    post<OtpResult>('fc-request-otp', { token, candidate_id, phone }),

  verifyOtp: (token: string, candidate_id: string, otp: string) =>
    post<VerifyResult>('fc-verify-otp', { token, candidate_id, otp }),

  requestScreening: (token: string, candidate_id: string) =>
    post<ScreeningResult>('fc-request-screening', { token, candidate_id }),
};
