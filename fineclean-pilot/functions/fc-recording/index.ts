// fc-recording — streams a call's Twilio recording to the /admin dashboard.
// Twilio media URLs require Basic auth (account SID + token), which a browser
// <audio> tag can't send, so we proxy: GET ?session_id=..&key=ADMIN_KEY →
// verify the admin key → look up recording_url → fetch from Twilio with auth →
// stream back as audio/mpeg. Deploy --no-verify-jwt (admin-key gated).
import { adminClient } from '../_shared/db.ts';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id') ?? '';
  const key = url.searchParams.get('key') ?? req.headers.get('x-admin-key') ?? '';

  const adminSecret = Deno.env.get('FC_ADMIN_SECRET');
  if (!adminSecret || key !== adminSecret) return new Response('Unauthorized', { status: 401 });
  if (!sessionId) return new Response('session_id required', { status: 400 });

  const db = adminClient();
  const { data: sess } = await db
    .from('fc_screening_sessions')
    .select('recording_url')
    .eq('id', sessionId)
    .single();

  const recUrl = sess?.recording_url as string | undefined;
  if (!recUrl) return new Response('No recording', { status: 404 });

  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const tok = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!sid || !tok) return new Response('Twilio not configured', { status: 500 });

  const tw = await fetch(recUrl, {
    headers: { Authorization: 'Basic ' + btoa(`${sid}:${tok}`) },
  });
  if (!tw.ok) return new Response('Recording fetch failed', { status: 502 });

  return new Response(tw.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
