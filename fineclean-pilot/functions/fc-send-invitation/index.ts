import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

// ─────────────────────────────────────────────────────────────────────────────
// FineClean Candidate Journey — email templates (verbatim copy + exact order).
//
// Send rules:
//   From:  Sarah <sarah@giggrab.io>   (RESEND_FROM)
//   CC:    careers@fineclean.com      (FC_EMAIL_CC, "" to disable)
//   Format: plain text, single FineClean logo, mobile-friendly, footer unsubscribe.
//   Send window (Tue–Thu 10–11am) is enforced by the scheduler, not here.
//
// Each template returns an ORDERED list of items, reproduced exactly as written.
// A plain string is one line/paragraph ("\n" = line break within it); a Cta
// object renders the [bracketed] action inline where it appears in the flow.
// ─────────────────────────────────────────────────────────────────────────────

const FROM = Deno.env.get('RESEND_FROM') ?? 'Sarah <sarah@giggrab.io>';
const CC = Deno.env.get('FC_EMAIL_CC') ?? 'careers@fineclean.com';
const UNSUBSCRIBE_URL =
  Deno.env.get('FC_UNSUBSCRIBE_URL') ?? 'mailto:careers@fineclean.com?subject=Unsubscribe';
// FineClean wordmark — hosted in the app's public/ (served at the domain root).
const LOGO_URL = Deno.env.get('FC_LOGO_URL') ?? 'https://giggrab.io/fineclean-logo.jpeg';

interface Vars {
  firstName: string;
  link: string;
  role: string;
  location: string;
  pay: string;
  date?: string;
  time?: string;
  phoneNumber?: string;
  interviewer?: string;
  platform?: string;
  meetingLink?: string;
  bookingUrl?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
}

interface Cta {
  label: string;
  url: string;
}

type Item = string | Cta;

interface Built {
  subject: string;
  body: Item[];
}

// ── Presentation ─────────────────────────────────────────────────────────────
// Plain text: one text logo, left-aligned lines exactly as written, a simple
// underlined action link. No cards, no marketing chrome.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function action(cta: Cta): string {
  return `<a href="${cta.url}" style="color:#059669;font-weight:600;text-decoration:underline">${esc(cta.label)}</a>`;
}

function render(b: Built): string {
  const lines = b.body
    .map((item) =>
      typeof item === 'string'
        ? `<p style="margin:0 0 14px">${esc(item).replace(/\n/g, '<br>')}</p>`
        : `<p style="margin:0 0 14px">${action(item)}</p>`,
    )
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="left" style="padding:28px 20px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="font-size:15px;line-height:1.6;color:#1f2937">
${lines}
  </td></tr>
  <tr><td style="padding:28px 0 0 0;border-top:1px solid #eef0f2">
    <img src="${LOGO_URL}" alt="FineClean" width="120" style="display:block;width:120px;max-width:50%;height:auto;border:0;margin:16px 0 10px" />
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5"><a href="${UNSUBSCRIBE_URL}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── Templates (verbatim) ─────────────────────────────────────────────────────

const TEMPLATES: Record<string, (v: Vars) => Built> = {
  // 1A — Existing FineClean database candidates.
  existing_invitation: (v) => ({
    subject: `${v.firstName}, FINECLEAN Application Update`,
    body: [
      `Hi ${v.firstName},`,
      `Thank you for expressing an interest in working with us at FINECLEAN.`,
      `We currently have industrial cleaning roles available and would like to invite you to the 1st stage of our recruitment process so we can learn more about you and your experience.`,
      `Before moving to the first stage of the process we will need you to complete a short application form. This should take around 2 minutes and will help us confirm your suitability before progressing your application.`,
      `Please complete the form within the next 48 hours to be considered for a role.`,
      `Kind regards,\nFINECLEAN Recruitment Team`,
      `Please complete the form within the next 48 hours to keep your application active.`,
      { label: 'Continue Application', url: v.link },
      `If you have any questions, please don't hesitate to email me back.`,
      `Sarah\nFINECLEAN Recruitment`,
    ],
  }),

  // 1B — Indeed applicants.
  indeed_invitation: (v) => ({
    subject: `${v.firstName}, next step for your FINECLEAN application`,
    body: [
      `Hi ${v.firstName},`,
      `Thank you for applying for our Industrial Cleaning role at FINECLEAN via Indeed.`,
      `We would like to invite you to the 1st stage of our recruitment process so we can learn more about you and your experience.`,
      `The first step is to complete a short application form. This should take around 2 minutes and will help us confirm your suitability before progressing your application.`,
      `Please complete the form within the next 48 hours to keep your application active.`,
      { label: 'Continue Application', url: v.link },
      `If you have any questions, simply reply to this email.`,
      `Sarah\nFINECLEAN Recruitment`,
    ],
  }),

  // 2 — Reminder (48h later, form not completed).
  reminder: (v) => ({
    subject: `${v.firstName}, your FineClean application`,
    body: [
      `Hi ${v.firstName},`,
      `Just a quick reminder to complete the next step of your FINECLEAN application.`,
      `The short application form only takes around 2 minutes.`,
      `Please complete it within the next 24 hours to keep your application active.`,
      { label: 'Continue Application', url: v.link },
      `Sarah\nFINECLEAN Recruitment`,
    ],
  }),

  // 3 — Final reminder (24h later, still not completed).
  final_reminder: (v) => ({
    subject: `Final reminder: your FINECLEAN application`,
    body: [
      `Hi ${v.firstName},`,
      `This is the final reminder to complete our short application form.`,
      `Your application will be withdrawn today if the form isn't completed.`,
      { label: 'Continue Application', url: v.link },
      `If you're no longer looking for a new role, no problem let us know. We'll keep your details on file for future opportunities.`,
      `Sarah\nFINECLEAN Recruitment`,
    ],
  }),

  // 4 — Screening interview invitation (immediately after pre-qual form).
  screening_invitation: (v) => ({
    subject: `Congratulations ${v.firstName} — you've made it to the next stage`,
    body: [
      `Hi ${v.firstName},`,
      `Great news, you have successfully completed the first stage of our recruitment process and have been selected to progress to the next stage.`,
      `The next step is a short interview with me. I will ask you a few questions about your experience, availability and the type of cleaning work you are looking for.`,
      `It is also an opportunity for us to share more information about the role you have applied for and assess your suitability.`,
      `The interview should take around 10 minutes.`,
      `Please start your interview within the next 48 hours to make sure you don't miss out.`,
      `We look forward to hearing from you!`,
      `Kind regards,\nFINECLEAN Recruitment Team`,
      { label: 'Start Screening Interview', url: v.link },
      `If you have any questions, please reply to this email.`,
      `I look forward to speaking with you.`,
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 5 — Screening interview reminder (24h before scheduled call).
  screening_reminder: (v) => ({
    subject: `Your FineClean screening interview is tomorrow at ${v.time ?? '[time]'}`,
    body: [
      `Hi ${v.firstName},`,
      `Just a reminder that your screening interview is tomorrow.`,
      `Date: ${v.date ?? '[date]'}\nTime: ${v.time ?? '[time]'}\nPhone: ${v.phoneNumber ?? '[phoneNumber]'}`,
      `I'll call you on this number.`,
      ...(v.rescheduleUrl ? [{ label: 'Reschedule', url: v.rescheduleUrl }] : []),
      ...(v.cancelUrl ? [{ label: 'Cancel', url: v.cancelUrl }] : []),
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 6 — Thank you (immediately after the screening interview).
  thank_you: (v) => ({
    subject: `Thanks for your time today`,
    body: [
      `Hi ${v.firstName},`,
      `Thank you for taking the time to speak with me today.`,
      `I've shared your interview notes with the hiring manager.`,
      `I'll be in touch as soon as I have an update.`,
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 7 — Hiring-manager interview invitation (candidate shortlisted).
  hm_interview_invitation: (v) => ({
    subject: `Congratulations ${v.firstName} — you're through to the next stage`,
    body: [
      `Hi ${v.firstName},`,
      `Congratulations!`,
      `Following your interview, the hiring manager would like to invite you to the final stage of our recruitment process.`,
      `The next step is a 30-minute interview with the hiring manager. This is an opportunity to discuss your experience in more detail and learn more about the role.`,
      `Please book your interview within the next 48 hours.`,
      { label: 'Book Interview', url: v.bookingUrl ?? v.link },
      `Congratulations again, and we look forward to meeting you.`,
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 8 — Interview confirmation (immediately after booking).
  interview_confirmation: (v) => ({
    subject: `Your FineClean interview is confirmed`,
    body: [
      `Hi ${v.firstName},`,
      `Your interview with FINECLEAN has been confirmed.`,
      `Role: ${v.role}, ${v.location} & ${v.pay}\n` +
        `Date: ${v.date ?? '[date]'}\nTime: ${v.time ?? '[time]'}\n` +
        `Interviewer: ${v.interviewer ?? '[interviewer]'}\n` +
        `Platform: ${v.platform ?? '[Microsoft Teams / Google Meet / Zoom]'}\n` +
        `Meeting Link: ${v.meetingLink ?? '[meetingLink]'}`,
      `The interview will take approximately 30 minutes.`,
      `If you need to make any changes, you can do so below.`,
      ...(v.rescheduleUrl ? [{ label: 'Reschedule', url: v.rescheduleUrl }] : []),
      ...(v.cancelUrl ? [{ label: 'Cancel', url: v.cancelUrl }] : []),
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 9 — Rejection.
  rejection: (v) => ({
    subject: `Update on your FINECLEAN application`,
    body: [
      `Hi ${v.firstName},`,
      `Thank you for taking the time to apply and complete our recruitment process.`,
      `After careful consideration, we've decided not to move forward with your application on this occasion.`,
      `We appreciate your interest in FINECLEAN and will keep your details on file should another suitable opportunity become available.`,
      `We wish you every success in your job search.`,
      `Sarah\nFineClean Recruitment`,
    ],
  }),

  // 10 — Offer.
  offer: (v) => ({
    subject: `Congratulations! Welcome to FineClean`,
    body: [
      `Hi ${v.firstName},`,
      `Congratulations!`,
      `We're delighted to offer you a position with FINECLEAN.`,
      `Our team will contact you shortly with your start date, onboarding information and employment paperwork.`,
      `We look forward to welcoming you to the FineClean team.`,
      `Congratulations once again.`,
      `Sarah\nFineClean Recruitment`,
    ],
  }),
};

// Back-compat: the old default key `invitation` maps to the Indeed invite.
TEMPLATES.invitation = TEMPLATES.indeed_invitation;

const INVITE_TEMPLATES = new Set(['invitation', 'existing_invitation', 'indeed_invitation']);

const EVENT_NAME: Record<string, string> = {
  invitation: 'Invitation Sent',
  existing_invitation: 'Invitation Sent',
  indeed_invitation: 'Invitation Sent',
  reminder: 'Reminder Sent',
  final_reminder: 'Final Reminder Sent',
  screening_invitation: 'Screening Invitation Sent',
  screening_reminder: 'Screening Reminder Sent',
  thank_you: 'Thank You Sent',
  hm_interview_invitation: 'HM Interview Invitation Sent',
  interview_confirmation: 'Interview Confirmation Sent',
  rejection: 'Rejection Sent',
  offer: 'Offer Sent',
};

async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) {
    console.log(`[DEV] Email to ${to}${CC ? ` (cc ${CC})` : ''}: ${subject}`);
    return 'dev-mock-id';
  }

  const payload: Record<string, unknown> = { from: FROM, to: [to], subject, html };
  if (CC) payload.cc = [CC];

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
    const { candidate_id, template = 'invitation', data = {} } = await req.json() as {
      candidate_id: string;
      template?: string;
      data?: Partial<Vars>;
    };

    if (!candidate_id) return err('candidate_id required');
    const build = TEMPLATES[template];
    if (!build) return err(`Unknown template: ${template}`);

    const db = adminClient();
    const { data: candidate } = await db
      .from('fc_candidates')
      .select('*, fc_employers(name), fc_jobs(title, location)')
      .eq('id', candidate_id)
      .single();

    if (!candidate) return err('Candidate not found', 404);
    if (!candidate.is_active) return err('Candidate is inactive', 409);

    const appUrl = Deno.env.get('FC_APP_URL') ?? 'https://giggrab.io';
    const link = `${appUrl}/form?token=${candidate.invitation_token}`;

    const vars: Vars = {
      firstName: candidate.first_name,
      link,
      role: data.role ?? candidate.fc_jobs?.title ?? 'Industrial Cleaner',
      location: data.location ?? candidate.fc_jobs?.location ?? 'Worcester',
      pay: data.pay ?? '£13.65/hour',
      date: data.date,
      time: data.time,
      phoneNumber: data.phoneNumber ?? candidate.phone ?? undefined,
      interviewer: data.interviewer,
      platform: data.platform,
      meetingLink: data.meetingLink,
      bookingUrl: data.bookingUrl,
      rescheduleUrl: data.rescheduleUrl,
      cancelUrl: data.cancelUrl,
    };

    const built = build(vars);
    const subject = built.subject;
    const html = render(built);

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

    if (INVITE_TEMPLATES.has(template)) {
      await db.from('fc_candidates')
        .update({ current_status: candidate.current_status === 'imported' ? 'invited' : candidate.current_status })
        .eq('id', candidate_id);
    }

    await logEvent(db, candidate_id, EVENT_NAME[template] ?? 'Email Sent', { template, resend_id: resendId });

    return json({ success: true, resend_id: resendId, email_tracking_id: emailRow.id });
  } catch (e) {
    console.error('fc-send-invitation:', e);
    return err('Internal error', 500);
  }
});
