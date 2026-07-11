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

  requestScreening: (
    token: string,
    candidate_id: string,
    opts?: { first_name?: string; consent?: boolean },
  ) => post<ScreeningResult>('fc-request-screening', { token, candidate_id, ...opts }),
};

// ─── Admin dashboard ──────────────────────────────────────────────────────────
export interface AdminTranscriptMsg { speaker: 'sarah' | 'candidate'; message: string; sequence_number: number }
export interface AdminAiSummary {
  summary: string | null;
  strengths: string[] | null;
  concerns: string[] | null;
  missing_information: string[] | null;
  recommendation: 'shortlist' | 'interview' | 'reject' | 'hold' | null;
  confidence_score: number | null;
}
export interface AdminSession {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  fc_transcript_messages: AdminTranscriptMsg[];
  fc_candidate_structured_responses: Record<string, unknown>[];
  fc_ai_summaries: AdminAiSummary[];
}
export interface AdminCandidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  current_status: string;
  is_active: boolean;
  prequal_score: number | null;
  prequal_band: string | null;
  created_at: string;
  fc_prequal_responses: { question: string; answer: string }[];
  fc_screening_sessions: AdminSession[];
}

export async function fetchAdminDashboard(adminKey: string): Promise<AdminCandidate[]> {
  const res = await fetch(`${BASE}/fc-admin-dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, 'x-admin-key': adminKey },
    body: '{}',
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Wrong password');
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return (data as { candidates: AdminCandidate[] }).candidates;
}
