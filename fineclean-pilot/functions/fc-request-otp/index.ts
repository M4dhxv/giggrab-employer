import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { logEvent } from '../_shared/db.ts';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateOtp(): string {
  return (crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000).toString();
}

async function sendSms(phone: string, otp: string) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_FROM_NUMBER');

  if (!sid || !token || !from) {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return;
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: from,
        Body: `Your GigGrab screening code is ${otp}. Valid for 10 minutes.`,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twilio error: ${body}`);
  }
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  try {
    const { token, candidate_id, phone } = await req.json();
    if (!token || !candidate_id || !phone) return err('token, candidate_id, phone required');

    const { candidate, db, error } = await resolveCandidate(token);
    if (error || !candidate) return err(error ?? 'Not found', 404);
    if (candidate.id !== candidate_id) return err('Token mismatch', 403);

    const { data: existing } = await db
      .from('fc_phone_verifications')
      .select('*')
      .eq('candidate_id', candidate_id)
      .single();

    if (existing?.verified) return json({ success: true, already_verified: true });

    if (existing?.last_otp_sent_at) {
      const elapsed = Date.now() - new Date(existing.last_otp_sent_at).getTime();
      if (elapsed < 60_000) return err('Please wait before requesting another code', 429);
    }

    const otp = generateOtp();
    const salt = crypto.randomUUID();
    const hash = await sha256(otp + candidate_id + salt);

    await db.from('fc_phone_verifications').upsert({
      candidate_id,
      phone,
      otp_hash: hash,
      otp_salt: salt,
      attempts: 0,
      verified: false,
      last_otp_sent_at: new Date().toISOString(),
    }, { onConflict: 'candidate_id' });

    await sendSms(phone, otp);
    await logEvent(db, candidate_id, 'OTP Requested', { phone });

    return json({ success: true });
  } catch (e) {
    console.error('fc-request-otp:', e);
    return err('Internal error', 500);
  }
});
