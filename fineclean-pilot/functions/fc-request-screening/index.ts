import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

// Base URL for our own edge functions, e.g. https://<ref>.supabase.co/functions/v1
// Derived from SUPABASE_URL so we don't need a second secret.
function functionsBase(): string {
  const explicit = Deno.env.get('FUNCTIONS_BASE_URL');
  if (explicit) return explicit.replace(/\/+$/, '');
  const supa = Deno.env.get('SUPABASE_URL') ?? '';
  return `${supa.replace(/\/+$/, '')}/functions/v1`;
}

/**
 * Place the outbound Twilio call — mirrors gig-grab's intake.ts. Twilio dials
 * the candidate; when they pick up it fetches fc-twilio-voice for TwiML, which
 * bridges the audio to the Pipecat agent's WebSocket. Call-progress + recording
 * events flow back to fc-twilio-status. Returns the Twilio CallSid (our call_id).
 */
async function triggerSarahCall(candidateId: string, phone: string, sessionId: string, language = 'en') {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!sid || !token || !from) {
    console.log(`[DEV] Twilio not configured — would call candidate=${candidateId} phone=${phone} session=${sessionId}`);
    return null;
  }

  const base = functionsBase();
  const body = new URLSearchParams();
  body.append('To', phone);
  body.append('From', from);
  body.append('Url', `${base}/fc-twilio-voice/${sessionId}?language=${encodeURIComponent(language)}`);
  body.append('StatusCallback', `${base}/fc-twilio-status/${sessionId}`);
  ['initiated', 'ringing', 'answered', 'completed'].forEach((e) => body.append('StatusCallbackEvent', e));
  body.append('Timeout', '30');
  body.append('Record', 'true');
  body.append('RecordingChannels', 'dual');
  body.append('RecordingStatusCallback', `${base}/fc-twilio-status/${sessionId}?recording=1`);
  body.append('RecordingStatusCallbackEvent', 'completed');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${sid}:${token}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!res.ok) {
    throw new Error(`Twilio call failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.sid ?? null; // CallSid
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  try {
    const { token, candidate_id, first_name, phone, consent } = await req.json();

    const cleanName = typeof first_name === 'string'
      ? first_name.replace(/[\r\n\t\0]/g, ' ').trim().slice(0, 60) : '';
    const cleanPhone = typeof phone === 'string' && /^\+[1-9]\d{6,14}$/.test(phone.trim())
      ? phone.trim() : '';

    let db: ReturnType<typeof adminClient>;
    let candidateId: string;

    if (token && candidate_id) {
      // Invitation flow.
      const r = await resolveCandidate(token);
      if (r.error || !r.candidate) return err(r.error ?? 'Not found', 404);
      if (r.candidate.id !== candidate_id) return err('Token mismatch', 403);
      if (!r.candidate.is_active) return err('Candidate is inactive', 409);
      db = r.db;
      candidateId = candidate_id;
      if (cleanName) await db.from('fc_candidates').update({ first_name: cleanName }).eq('id', candidateId);
    } else {
      // Tokenless testing flow — create the candidate on the fly.
      if (!cleanName) return err('first_name required');
      if (!cleanPhone) return err('valid phone required (E.164, e.g. +447700900123)');
      db = adminClient();
      const { data: emp } = await db.from('fc_employers').select('id').eq('slug', 'fineclean').single();
      if (!emp) return err('FineClean employer not found', 500);
      const { data: newC, error: cErr } = await db.from('fc_candidates').insert({
        employer_id: emp.id,
        first_name: cleanName,
        last_name: '',
        email: `test+${Date.now()}@fineclean.local`,
        phone: cleanPhone,
        source: 'self_serve_test',
        current_status: 'imported',
      }).select('id').single();
      if (cErr || !newC) throw cErr;
      candidateId = newC.id;
    }

    if (consent === true) {
      await logEvent(db, candidateId, 'Screening Consent Given', { at: new Date().toISOString() });
    }

    // Determine the number to dial. If one was supplied (no-OTP testing flow),
    // mark it verified and use it; else fall back to an OTP-verified number.
    let dialPhone: string;
    if (cleanPhone) {
      dialPhone = cleanPhone;
      await db.from('fc_phone_verifications').upsert(
        { candidate_id: candidateId, phone: dialPhone, verified: true, verified_at: new Date().toISOString() },
        { onConflict: 'candidate_id' },
      );
      await db.from('fc_candidates').update({ phone: dialPhone }).eq('id', candidateId);
    } else {
      const { data: pv } = await db.from('fc_phone_verifications')
        .select('verified, phone').eq('candidate_id', candidateId).single();
      if (!pv?.verified) return err('Phone number not verified', 400);
      dialPhone = pv.phone;
    }

    const { data: session, error: sessionErr } = await db
      .from('fc_screening_sessions')
      .insert({ candidate_id: candidateId, scheduled_at: new Date().toISOString(), status: 'scheduled' })
      .select()
      .single();
    if (sessionErr || !session) throw sessionErr;

    let callId: string | null = null;
    try {
      callId = await triggerSarahCall(candidateId, dialPhone, session.id);
    } catch (callErr) {
      console.error('Sarah call trigger failed:', callErr);
    }
    if (callId) await db.from('fc_screening_sessions').update({ call_id: callId }).eq('id', session.id);

    await db.from('fc_candidates').update({ current_status: 'screening_requested' }).eq('id', candidateId);
    await logEvent(db, candidateId, 'Sarah Call Requested', { session_id: session.id, call_id: callId });

    return json({ success: true, session_id: session.id });
  } catch (e) {
    console.error('fc-request-screening:', e);
    return err('Internal error', 500);
  }
});
