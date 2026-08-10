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

// Named SMS bodies, same convention as fc-send-invitation's TEMPLATES.
// (name, link) -> body text.
const TEMPLATES: Record<string, (name: string, link: string) => string> = {
  // Short 2-line nudge — default.
  short: (name, link) =>
    `Hi ${name}, it's Sarah from FineClean recruitment. ` +
    `Please complete your short application here: ${link}`,

  // Condensed version of Email 1B (indeed_invitation) — approved wording.
  indeed_invitation: (name, link) =>
    `Hi ${name}, thank you for applying for our Industrial Cleaning role at FINECLEAN via Indeed. ` +
    `We'd like to invite you to the 1st stage of our recruitment process so we can learn more about you and your experience. ` +
    `Please complete a short application form (about 2 minutes) within 48 hours to keep your application active: ${link} ` +
    `Any questions, email sarah@giggrab.io. Sarah, FINECLEAN Recruitment`,
};

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const { candidate_id, template = 'short' } = await req.json() as {
      candidate_id?: string;
      template?: string;
    };
    if (!candidate_id) return err('candidate_id required');
    const build = TEMPLATES[template];
    if (!build) return err(`Unknown template: ${template}`);

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

    const body = build(candidate.first_name, link);
    const sid = await sendSms(candidate.phone, body);

    await logEvent(db, candidate_id, 'SMS Invitation Sent', { phone: candidate.phone, template, sid });

    return json({ success: true, sid });
  } catch (e) {
    console.error('fc-send-sms:', e);
    return err('Internal error', 500);
  }
});
