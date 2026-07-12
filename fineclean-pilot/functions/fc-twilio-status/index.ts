// fc-twilio-status — Twilio call-progress + recording-status webhook.
// Port of gig-grab's twilioStatus/applyTwilioStatus: maps CallStatus onto
// fc_screening_sessions, logs Sarah Call events, stores the recording URL,
// and — exactly once, on the completed transition — kicks off the post-call
// Claude extraction (fc-sarah-extract).
//
// DEPLOY: Twilio webhook → must be public:
//   supabase functions deploy fc-twilio-status --no-verify-jwt
// Signature verification below is what keeps it safe without a JWT.
//
// Env: TWILIO_AUTH_TOKEN (for signature check), SUPABASE_URL,
//      SUPABASE_SERVICE_ROLE_KEY, optional FUNCTIONS_BASE_URL,
//      optional FC_SKIP_TWILIO_SIGNATURE=1 (dev only).
import { adminClient, logEvent } from '../_shared/db.ts';

function functionsBase(): string {
  const explicit = Deno.env.get('FUNCTIONS_BASE_URL');
  if (explicit) return explicit.replace(/\/+$/, '');
  const supa = Deno.env.get('SUPABASE_URL') ?? '';
  return `${supa.replace(/\/+$/, '')}/functions/v1`;
}

// Twilio request signature: base64( HMAC-SHA1( authToken, fullUrl + sorted(k+v) ) )
async function verifyTwilioSignature(
  fullUrl: string,
  params: Record<string, string>,
  header: string | null,
): Promise<boolean> {
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (Deno.env.get('FC_SKIP_TWILIO_SIGNATURE') === '1') return true;
  if (!authToken || !header) return false;

  let data = fullUrl;
  for (const key of Object.keys(params).sort()) data += key + params[key];

  const keyBuf = new TextEncoder().encode(authToken);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === header;
}

// Twilio CallStatus -> fc_screening_sessions.status
// (CHECK allows: scheduled | in_progress | completed | failed | no_show)
const STATUS_MAP: Record<string, string> = {
  queued: 'scheduled',
  initiated: 'scheduled',
  ringing: 'scheduled',
  'in-progress': 'in_progress',
  completed: 'completed',
  busy: 'no_show',
  'no-answer': 'no_show',
  canceled: 'no_show',
  failed: 'failed',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok');

  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const sessionId = segments[segments.length - 1] ?? '';
  const isRecording = url.searchParams.get('recording') === '1';

  // Twilio posts application/x-www-form-urlencoded.
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  // Twilio signs the exact PUBLIC url it was configured to POST to — NOT the
  // internal Deno request url (Supabase's gateway rewrites host/path), so we
  // reconstruct the canonical url that fc-request-screening registered.
  const base = (Deno.env.get('FUNCTIONS_BASE_URL') ?? `${Deno.env.get('SUPABASE_URL')}/functions/v1`).replace(/\/+$/, '');
  const canonicalUrl = `${base}/fc-twilio-status/${sessionId}` + (isRecording ? '?recording=1' : '');

  const ok = await verifyTwilioSignature(canonicalUrl, params, req.headers.get('X-Twilio-Signature'));
  if (!ok) {
    console.warn(`[fc-twilio-status] bad signature session=${sessionId}`);
    return new Response('forbidden', { status: 403 });
  }

  if (!sessionId) return new Response('missing session', { status: 400 });

  const db = adminClient();

  // Recording-complete callback: just store the audio URL and return.
  if (isRecording) {
    const recordingUrl = params['RecordingUrl'];
    if (recordingUrl) {
      const mp3 = `${recordingUrl}.mp3`;
      await db
        .from('fc_screening_sessions')
        .update({ call_id: params['CallSid'] ?? undefined, recording_url: mp3 })
        .eq('id', sessionId);
      const { data: sess } = await db
        .from('fc_screening_sessions')
        .select('candidate_id')
        .eq('id', sessionId)
        .single();
      if (sess?.candidate_id) {
        await logEvent(db, sess.candidate_id, 'Sarah Call Recording', {
          session_id: sessionId,
          recording_url: mp3,
        });
      }
    }
    return new Response('ok');
  }

  // Call-progress callback.
  const callStatus = params['CallStatus'] ?? '';
  const mapped = STATUS_MAP[callStatus];
  if (!mapped) return new Response('ok'); // unknown/interim status — ignore

  const { data: sess } = await db
    .from('fc_screening_sessions')
    .select('candidate_id, status')
    .eq('id', sessionId)
    .single();
  if (!sess) return new Response('ok');

  // Idempotent terminal transition: only move into a terminal state once, so a
  // Twilio retry of `completed` can't re-fire the (paid) extraction.
  const terminal = mapped === 'completed' || mapped === 'failed' || mapped === 'no_show';
  const patch: Record<string, unknown> = { status: mapped };
  if (mapped === 'in_progress') patch.started_at = new Date().toISOString();
  if (terminal) patch.completed_at = new Date().toISOString();

  let query = db.from('fc_screening_sessions').update(patch).eq('id', sessionId);
  if (terminal) query = query.neq('status', mapped); // don't re-apply
  const { data: updated } = await query.select('id');
  const transitioned = (updated?.length ?? 0) > 0;

  if (mapped === 'in_progress' && sess.candidate_id) {
    await logEvent(db, sess.candidate_id, 'Sarah Call Started', { session_id: sessionId });
  }

  if (mapped === 'completed' && transitioned) {
    if (sess.candidate_id) {
      await logEvent(db, sess.candidate_id, 'Sarah Call Completed', { session_id: sessionId });
      await db.from('fc_candidates').update({ current_status: 'screening_completed' }).eq('id', sess.candidate_id);
    }
    // Fire-and-forget the post-call Claude extraction.
    try {
      await fetch(`${functionsBase()}/fc-sarah-extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (e) {
      console.error('[fc-twilio-status] extract trigger failed:', e);
    }
  }

  return new Response('ok');
});
