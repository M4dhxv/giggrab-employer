import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

const MAX_ATTEMPTS = 5;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  try {
    const { token, candidate_id, otp } = await req.json();
    if (!candidate_id || !otp) return err('candidate_id, otp required');

    let db: ReturnType<typeof adminClient>;
    if (token) {
      const r = await resolveCandidate(token);
      if (r.error || !r.candidate) return err(r.error ?? 'Not found', 404);
      if (r.candidate.id !== candidate_id) return err('Token mismatch', 403);
      db = r.db;
    } else {
      // Tokenless testing flow — verify by candidate_id (created in fc-request-otp).
      db = adminClient();
    }

    const { data: pv } = await db
      .from('fc_phone_verifications')
      .select('*')
      .eq('candidate_id', candidate_id)
      .single();

    if (!pv) return err('No OTP requested', 400);
    if (pv.verified) return json({ success: true, verified: true });
    if (pv.attempts >= MAX_ATTEMPTS) return err('Too many attempts — request a new code', 429);

    const hash = await sha256(otp + candidate_id + pv.otp_salt);
    const matched = hash === pv.otp_hash;
    const newAttempts = pv.attempts + 1;

    if (matched) {
      await db.from('fc_phone_verifications').update({
        verified: true,
        verified_at: new Date().toISOString(),
        attempts: newAttempts,
        otp_hash: null,
        otp_salt: null,
      }).eq('candidate_id', candidate_id);

      await logEvent(db, candidate_id, 'OTP Verified', { phone: pv.phone });
      return json({ success: true, verified: true });
    }

    await db.from('fc_phone_verifications').update({ attempts: newAttempts }).eq('candidate_id', candidate_id);
    const remaining = MAX_ATTEMPTS - newAttempts;
    return json({ success: false, verified: false, remaining_attempts: remaining }, 400);
  } catch (e) {
    console.error('fc-verify-otp:', e);
    return err('Internal error', 500);
  }
});
