import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

const TEMPLATES = {
  invitation: {
    subject: (name: string) => `${name}, your FineClean Industrial Cleaner screening is ready`,
    html: (firstName: string, link: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <tr><td style="background:#10b981;padding:28px 40px">
    <p style="margin:0;color:white;font-size:13px;font-weight:600;letter-spacing:0.05em">GIGGRAB × FINECLEAN</p>
  </td></tr>
  <tr><td style="padding:40px">
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827">Hi ${firstName},</h1>
    <p style="margin:0 0 16px;color:#6b7280;line-height:1.6">Thanks for applying for our <strong>Industrial Cleaner</strong> role — varied, hands-on work across sites around Worcestershire, paying <strong>£13.65 per hour</strong>. As the next step, our recruitment assistant Sarah will give you a quick phone screening: about 10 minutes, and you can do it from anywhere.</p>
    <p style="margin:0 0 24px;color:#6b7280;line-height:1.6">First, tap below to confirm a few quick details — then Sarah will call you to talk through the role and your experience.</p>
    <p style="margin:0 0 32px;color:#9ca3af;font-size:13px;line-height:1.6">Before you start, it helps to have in mind your right-to-work situation, how you'd get to our Worcester meeting point, and your general availability.</p>
    <a href="${link}" style="display:inline-block;background:#10b981;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">Start My Screening →</a>
    <p style="margin:32px 0 0;color:#9ca3af;font-size:12px">This link is unique to you and expires in 30 days. If you have questions, reply to this email.</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
    <p style="margin:0;color:#9ca3af;font-size:11px">Powered by GigGrab · Sarah AI Hiring Platform</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  reminder: {
    subject: (name: string) => `${name}, your FineClean Industrial Cleaner screening is still open`,
    html: (firstName: string, link: string) => `
<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
<table width="560" style="margin:auto;background:white;border-radius:12px;border:1px solid #e5e7eb" cellpadding="0" cellspacing="0">
  <tr><td style="padding:40px">
    <h2 style="margin:0 0 16px;color:#111827">Quick reminder, ${firstName}</h2>
    <p style="color:#6b7280;line-height:1.6">You haven't finished your screening for our <strong>Industrial Cleaner</strong> role in Worcester yet. It only takes about 10 minutes — a few quick questions, then Sarah calls you straight away.</p>
    <a href="${link}" style="display:inline-block;margin-top:24px;background:#10b981;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">Complete My Screening →</a>
  </td></tr>
</table>
</body></html>`,
  },
  final_reminder: {
    subject: (name: string) => `Last chance: ${name}'s FineClean Industrial Cleaner screening expires soon`,
    html: (firstName: string, link: string) => `
<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
<table width="560" style="margin:auto;background:white;border-radius:12px;border:1px solid #e5e7eb" cellpadding="0" cellspacing="0">
  <tr><td style="padding:40px">
    <h2 style="margin:0 0 16px;color:#111827">${firstName}, your link expires in 48 hours</h2>
    <p style="color:#6b7280;line-height:1.6">This is the last reminder about your screening for the FineClean <strong>Industrial Cleaner</strong> role in Worcester (£13.65/hour). After 48 hours your link will expire.</p>
    <a href="${link}" style="display:inline-block;margin-top:24px;background:#10b981;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">Start Now →</a>
  </td></tr>
</table>
</body></html>`,
  },
};

async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) {
    console.log(`[DEV] Email to ${to}: ${subject}`);
    return 'dev-mock-id';
  }

  const from = Deno.env.get('RESEND_FROM') ?? 'GigGrab <screening@giggrab.io>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
  const { id } = await res.json();
  return id ?? null;
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const { candidate_id, template = 'invitation' } = await req.json() as {
      candidate_id: string;
      template?: keyof typeof TEMPLATES;
    };

    if (!candidate_id) return err('candidate_id required');
    if (!TEMPLATES[template]) return err(`Unknown template: ${template}`);

    const db = adminClient();
    const { data: candidate } = await db
      .from('fc_candidates')
      .select('*, fc_employers(name)')
      .eq('id', candidate_id)
      .single();

    if (!candidate) return err('Candidate not found', 404);
    if (!candidate.is_active) return err('Candidate is inactive', 409);

    const appUrl = Deno.env.get('FC_APP_URL') ?? 'https://giggrab.io';
    const link = `${appUrl}/form?token=${candidate.invitation_token}`;
    const tpl = TEMPLATES[template];
    const subject = tpl.subject(candidate.first_name);
    const html = tpl.html(candidate.first_name, link);

    const { data: emailRow, error: emailInsertErr } = await db
      .from('fc_email_tracking')
      .insert({ candidate_id, template, subject, sent_at: new Date().toISOString() })
      .select('id')
      .single();

    if (emailInsertErr) throw emailInsertErr;

    let resendId: string | null = null;
    try {
      resendId = await sendEmail(candidate.email, subject, html);
    } catch (sendErr) {
      console.error('Send email failed:', sendErr);
      return err('Failed to send email', 502);
    }

    await db.from('fc_email_tracking').update({ resend_id: resendId }).eq('id', emailRow.id);

    const eventName = template === 'invitation'
      ? 'Invitation Sent'
      : template === 'reminder'
        ? 'Reminder Sent'
        : 'Final Reminder Sent';

    await db.from('fc_candidates')
      .update({ current_status: candidate.current_status === 'imported' ? 'invited' : candidate.current_status })
      .eq('id', candidate_id);

    await logEvent(db, candidate_id, eventName, { template, resend_id: resendId });

    return json({ success: true, resend_id: resendId, email_tracking_id: emailRow.id });
  } catch (e) {
    console.error('fc-send-invitation:', e);
    return err('Internal error', 500);
  }
});
