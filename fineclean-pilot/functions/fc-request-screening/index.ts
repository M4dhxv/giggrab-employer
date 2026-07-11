import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { logEvent } from '../_shared/db.ts';

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
    const { token, candidate_id } = await req.json();
    if (!token || !candidate_id) return err('token and candidate_id required');

    const { candidate, db, error } = await resolveCandidate(token);
    if (error || !candidate) return err(error ?? 'Not found', 404);
    if (candidate.id !== candidate_id) return err('Token mismatch', 403);
    if (!candidate.is_active) return err('Candidate is inactive', 409);

    const { data: pv } = await db
      .from('fc_phone_verifications')
      .select('verified, phone')
      .eq('candidate_id', candidate_id)
      .single();

    if (!pv?.verified) return err('Phone number not verified', 400);

    const { data: session, error: sessionErr } = await db
      .from('fc_screening_sessions')
      .insert({ candidate_id, scheduled_at: new Date().toISOString(), status: 'scheduled' })
      .select()
      .single();

    if (sessionErr || !session) throw sessionErr;

    let callId: string | null = null;
    try {
      callId = await triggerSarahCall(candidate_id, pv.phone, session.id);
    } catch (callErr) {
      console.error('Sarah call trigger failed:', callErr);
    }

    if (callId) {
      await db.from('fc_screening_sessions').update({ call_id: callId }).eq('id', session.id);
    }

    await db.from('fc_candidates').update({ current_status: 'screening_requested' }).eq('id', candidate_id);
    await logEvent(db, candidate_id, 'Sarah Call Requested', { session_id: session.id, call_id: callId });

    return json({ success: true, session_id: session.id });
  } catch (e) {
    console.error('fc-request-screening:', e);
    return err('Internal error', 500);
  }
});
