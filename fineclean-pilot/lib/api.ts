// FineClean Pilot — typed API client
// Drop this file into src/lib/api.ts

const BASE = import.meta.env.VITE_FC_API_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_KEY as string;

function headers() {
  return { 'Content-Type': 'application/json', apikey: ANON_KEY };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface PrequalResponse {
  question: string;
  answer: string;
}

export interface PrequalResult {
  success: boolean;
  next_step: 'screening' | 'done';
  reason?: string;
}

export interface OtpResult {
  success: boolean;
  already_verified?: boolean;
}

export interface VerifyResult {
  success: boolean;
  verified: boolean;
  remaining_attempts?: number;
}

export interface ScreeningResult {
  success: boolean;
  session_id: string;
}

// ─── Candidate-facing API ─────────────────────────────────────────────────────

export const fc = {
  lookupCandidate: (token: string) =>
    post<CandidateLookup>('fc-candidate-lookup', { token }),

  submitPrequal: (
    token: string,
    candidate_id: string,
    responses: PrequalResponse[],
    completion_time_seconds?: number,
  ) =>
    post<PrequalResult>('fc-submit-prequal', {
      token,
      candidate_id,
      responses,
      completion_time_seconds,
    }),

  requestOtp: (token: string, candidate_id: string, phone: string) =>
    post<OtpResult>('fc-request-otp', { token, candidate_id, phone }),

  verifyOtp: (token: string, candidate_id: string, otp: string) =>
    post<VerifyResult>('fc-verify-otp', { token, candidate_id, otp }),

  requestScreening: (token: string, candidate_id: string) =>
    post<ScreeningResult>('fc-request-screening', { token, candidate_id }),
};

// ─── Admin API (requires FC_ADMIN_SECRET header — server-side only) ───────────

export function adminApi(adminKey: string) {
  async function adminPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { ...headers(), 'x-admin-key': adminKey },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data as T;
  }

  async function adminGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE}/${path}`);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { headers: { ...headers(), 'x-admin-key': adminKey } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data as T;
  }

  return {
    importCandidates: (candidates: unknown[], employer_slug?: string, job_id?: string) =>
      adminPost('fc-import-candidates', { candidates, employer_slug, job_id }),

    sendInvitation: (candidate_id: string, template = 'invitation') =>
      adminPost('fc-send-invitation', { candidate_id, template }),

    recruiterReview: (
      candidate_id: string,
      decision: string,
      opts?: { session_id?: string; notes?: string; recruiter_id?: string },
    ) =>
      adminPost('fc-recruiter-review', { candidate_id, decision, ...opts }),

    analytics: (employer = 'fineclean') =>
      adminGet('fc-analytics', { employer }),

    exportFinetune: (outcome?: string, format?: string) =>
      adminGet('fc-export-finetune', {
        ...(outcome ? { outcome } : {}),
        ...(format ? { format } : {}),
      }),
  };
}
