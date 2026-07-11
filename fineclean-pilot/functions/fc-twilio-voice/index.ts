// fc-twilio-voice — TwiML endpoint Twilio fetches when the candidate picks up.
// Port of gig-grab's twilioVoice: returns <Connect><Stream> pointing at the
// Pipecat agent's WebSocket, passing sessionId/language/audience as <Parameter>
// children (Twilio strips query strings off the Stream URL, so params must be
// <Parameter> elements — they arrive in the agent's `start` frame).
//
// DEPLOY: this is a Twilio webhook, so it must be public (no Supabase JWT):
//   supabase functions deploy fc-twilio-voice --no-verify-jwt
//
// Env: AGENT_WS_URL = wss://<your-pipecat-host>/ws
import { adminClient } from '../_shared/db.ts';

function xml(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // Path is /fc-twilio-voice/<sessionId>. Grab the last non-empty segment.
  const segments = url.pathname.split('/').filter(Boolean);
  const sessionId = segments[segments.length - 1] ?? '';
  const language = url.searchParams.get('language') ?? 'en';

  if (!sessionId || sessionId === 'fc-twilio-voice') {
    return xml('<Response><Say>Missing session.</Say><Hangup/></Response>', 400);
  }

  const db = adminClient();
  const { data: session } = await db
    .from('fc_screening_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return xml('<Response><Say>Sorry, this session has expired. Goodbye.</Say><Hangup/></Response>');
  }

  const wsUrl = Deno.env.get('AGENT_WS_URL');
  if (!wsUrl) {
    return xml(
      '<Response><Say>Our AI recruiter is not available right now. Please try again shortly. Goodbye.</Say><Hangup/></Response>',
    );
  }

  // Mark in_progress here as a fallback; fc-twilio-status also does this
  // idempotently from Twilio's call-progress webhook.
  await db
    .from('fc_screening_sessions')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'scheduled');

  const twiml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response>` +
    `<Connect>` +
    `<Stream url="${wsUrl}">` +
    `<Parameter name="sessionId" value="${sessionId}"/>` +
    `<Parameter name="language" value="${language}"/>` +
    `<Parameter name="audience" value="worker"/>` +
    `</Stream>` +
    `</Connect>` +
    `</Response>`;

  return xml(twiml);
});
