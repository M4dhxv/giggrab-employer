// fc-send-sms — short SMS nudge with the pre-qual form link. Admin-key gated.
// Reuses the Messaging Service pattern already proven for OTP (fc-request-otp):
// a Messaging Service sender pool lets Twilio route to the right sender per
// destination country, avoiding the US-number-can't-reach-+44 failure mode.
import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

async function sendSms(phone: string, body: string): Promise<string | null> {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const msgService = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
  const from = Deno.env.get('TWILIO_FROM_NUMBER');

  if (!sid || !token || (!msgService && !from)) {
    console.log(`[DEV] SMS to ${phone}: ${body}`);
    return 'dev-mock-sid';
  }

  const params = new URLSearchParams({ To: phone, Body: body });
  if (msgService) params.set('MessagingServiceSid', msgService);
  else params.set('From', from!);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!res.ok) throw new Error(`Twilio error: ${await res.text()}`);
  const data = await res.json();
  return data.sid ?? null;
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const { candidate_id } = await req.json() as { candidate_id?: string };
    if (!candidate_id) return err('candidate_id required');

    const db = adminClient();
    const { data: candidate } = await db
      .from('fc_candidates')
      .select('id, first_name, phone, is_active, invitation_token')
      .eq('id', candidate_id)
      .single();

    if (!candidate) return err('Candidate not found', 404);
    if (!candidate.is_active) return err('Candidate is inactive', 409);
    if (!candidate.phone) return err('Candidate has no phone number', 400);

    const appUrl = Deno.env.get('FC_APP_URL') ?? 'https://giggrab.io';
    const link = `${appUrl}/form?token=${candidate.invitation_token ?? ''}`;

    const body =
      `Hi ${candidate.first_name}, it's Sarah from FineClean recruitment. ` +
      `Please complete your short application here: ${link}`;

    const sid = await sendSms(candidate.phone, body);

    await logEvent(db, candidate_id, 'SMS Invitation Sent', { phone: candidate.phone, sid });

    return json({ success: true, sid });
  } catch (e) {
    console.error('fc-send-sms:', e);
    return err('Internal error', 500);
  }
});
