import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

// ─────────────────────────────────────────────────────────────────────────────
// FineClean Candidate Journey — email templates.
//
// Send rules (per the FineClean spec):
//   From:  Sarah <sarah@giggrab.io>         (override with RESEND_FROM)
//   CC:    careers@fineclean.com            (override with FC_EMAIL_CC, "" to disable)
//   Format: plain text, single FineClean logo, mobile-friendly, footer unsubscribe
//   Send window (Tue–Thu, 10–11am) is NOT enforced here — that belongs to
//   whatever SCHEDULES the send (a cron/queue). This function sends on demand.
//
// Each template is built from `vars` = candidate-derived fields (firstName, link)
// merged with an optional `data` object the caller passes for the richer
// later-stage emails (role, pay, date, time, interviewer, meetingLink, …).
// ─────────────────────────────────────────────────────────────────────────────

const FROM = Deno.env.get('RESEND_FROM') ?? 'Sarah <sarah@giggrab.io>';
const CC = Deno.env.get('FC_EMAIL_CC') ?? 'careers@fineclean.com';
const UNSUBSCRIBE_URL =
  Deno.env.get('FC_UNSUBSCRIBE_URL') ?? 'mailto:careers@fineclean.com?subject=Unsubscribe';

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

interface Built {
  subject: string;
  paragraphs: string[];
  ctas?: Cta[];
  // Sign-off lines (shown after a blank line, small + muted).
  signoff?: string[];
}

// ── Presentation ─────────────────────────────────────────────────────────────
// Plain-text feel: system font, single column, one text logo, one accent button.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function button(cta: Cta): string {
  return `<a href="${cta.url}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;font-size:15px;margin:4px 8px 4px 0">${esc(cta.label)}</a>`;
}

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <tr><td style="padding:24px 32px 8px 32px">
    <span style="font-size:18px;font-weight:800;letter-spacing:0.04em;color:#111827">FINE<span style="color:#10b981">CLEAN</span></span>
  </td></tr>
  <tr><td style="padding:8px 32px 28px 32px;color:#374151;font-size:15px;line-height:1.6">
${bodyHtml}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;line-height:1.5">FineClean Recruitment · powered by GigGrab</p>
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5"><a href="${UNSUBSCRIBE_URL}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function render(b: Built): string {
  const body = [
    ...b.paragraphs.map(
      (p) => `<p style="margin:0 0 16px">${p}</p>`,
    ),
    b.ctas && b.ctas.length ? `<p style="margin:8px 0 20px">${b.ctas.map(button).join('')}</p>` : '',
    b.signoff && b.signoff.length
      ? `<p style="margin:20px 0 0;color:#6b7280;font-size:14px;line-height:1.6">${b.signoff.map(esc).join('<br>')}</p>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  return shell(body);
}

// ── Templates ────────────────────────────────────────────────────────────────
// `v.firstName` and links are pre-escaped where interpolated as text.

const N = (v: Vars) => esc(v.firstName);

const TEMPLATES: Record<string, (v: Vars) => Built> = {
  // 1A — Existing FineClean database candidates.
  existing_invitation: (v) => ({
    subject: `${v.firstName}, FINECLEAN Application Update`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Thank you for expressing an interest in working with us at FINECLEAN.`,
      `We currently have a number of roles available and would like to invite you to the 1st stage of our recruitment process so we can learn more about you and your experience.`,
      `Before moving to the first stage of the process we will need you to complete a short application form. This should take around 2 minutes and will help us confirm your suitability before progressing your application.`,
      `Please complete the form within the next 48 hours to keep your application active.`,
    ],
    ctas: [{ label: 'Continue Application', url: v.link }],
    signoff: [`If you have any questions, please don't hesitate to email me back.`, ``, `Sarah`, `FINECLEAN Recruitment`],
  }),

  // 1B — Indeed applicants.
  indeed_invitation: (v) => ({
    subject: `${v.firstName}, next step for your FINECLEAN application`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Thank you for applying for our ${esc(v.role)} role in ${esc(v.location)} (${esc(v.pay)}) at FINECLEAN via Indeed.`,
      `We would like to invite you to the 1st stage of our recruitment process so we can learn more about you and your experience.`,
      `The first step is to complete a short application form. This should take around 2 minutes and will help us confirm your suitability before progressing your application.`,
      `Please complete the form within the next 48 hours to keep your application active.`,
    ],
    ctas: [{ label: 'Continue Application', url: v.link }],
    signoff: [`If you have any questions, simply reply to this email.`, ``, `Sarah`, `FINECLEAN Recruitment`],
  }),

  // 2 — Reminder (48h later, form not completed).
  reminder: (v) => ({
    subject: `${v.firstName}, your FineClean application`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Just a quick reminder to complete the next step of your FINECLEAN application.`,
      `The short application form only takes around 2 minutes.`,
      `Please complete it within the next 24 hours to keep your application active.`,
    ],
    ctas: [{ label: 'Continue Application', url: v.link }],
    signoff: [`Sarah`, `FINECLEAN Recruitment`],
  }),

  // 3 — Final reminder (24h later, still not completed).
  final_reminder: (v) => ({
    subject: `Final reminder: your FINECLEAN application`,
    paragraphs: [
      `Hi ${N(v)},`,
      `This is the final reminder to complete our short application form.`,
      `Your application will be withdrawn today if the form isn't completed.`,
      `If you're no longer looking for a new role, no problem — just let us know. We'll keep your details on file for future opportunities.`,
    ],
    ctas: [{ label: 'Continue Application', url: v.link }],
    signoff: [`Sarah`, `FINECLEAN Recruitment`],
  }),

  // 4 — Screening interview invitation (immediately after pre-qual form).
  screening_invitation: (v) => ({
    subject: `Congratulations ${v.firstName} — you've made it to the next stage`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Great news — you have successfully completed the first stage of our recruitment process and have been selected to progress to the next stage.`,
      `The next step is a short interview with me. I'll ask you a few questions about your experience, availability and the type of cleaning work you're looking for.`,
      `It's also an opportunity for us to share more information about the role you've applied for and assess your suitability.`,
      `The interview should take around 10 minutes.`,
      `Please start your interview within the next 48 hours to make sure you don't miss out.`,
      `We look forward to hearing from you!`,
    ],
    ctas: [{ label: 'Start Screening Interview', url: v.link }],
    signoff: [`If you have any questions, please reply to this email.`, `I look forward to speaking with you.`, ``, `Sarah`, `FineClean Recruitment`],
  }),

  // 5 — Screening interview reminder (24h before scheduled call).
  screening_reminder: (v) => ({
    subject: `Your FineClean screening interview is tomorrow at ${v.time ?? '[time]'}`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Just a reminder that your screening interview is tomorrow.`,
      `Date: ${esc(v.date ?? '[date]')}<br>Time: ${esc(v.time ?? '[time]')}<br>Phone: ${esc(v.phoneNumber ?? '[phone number]')}`,
      `I'll call you on this number.`,
    ],
    ctas: [
      ...(v.rescheduleUrl ? [{ label: 'Reschedule', url: v.rescheduleUrl }] : []),
      ...(v.cancelUrl ? [{ label: 'Cancel', url: v.cancelUrl }] : []),
    ],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),

  // 6 — Thank you (immediately after the screening interview).
  thank_you: (v) => ({
    subject: `Thanks for your time today`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Thank you for taking the time to speak with me today.`,
      `I've shared your interview notes with the hiring manager.`,
      `I'll be in touch as soon as I have an update.`,
    ],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),

  // 7 — Hiring-manager interview invitation (candidate shortlisted).
  hm_interview_invitation: (v) => ({
    subject: `Congratulations ${v.firstName} — you're through to the next stage`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Congratulations!`,
      `Following your interview, the hiring manager would like to invite you to the final stage of our recruitment process.`,
      `The next step is a 30-minute interview with the hiring manager. This is an opportunity to discuss your experience in more detail and learn more about the role.`,
      `Please book your interview within the next 48 hours.`,
      `Congratulations again, and we look forward to meeting you.`,
    ],
    ctas: [{ label: 'Book Interview', url: v.bookingUrl ?? v.link }],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),

  // 8 — Interview confirmation (immediately after booking).
  interview_confirmation: (v) => ({
    subject: `Your FineClean interview is confirmed`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Your interview with FINECLEAN has been confirmed.`,
      `Role: ${esc(v.role)}${v.location ? ` · ${esc(v.location)}` : ''}${v.pay ? ` · ${esc(v.pay)}` : ''}<br>` +
        `Date: ${esc(v.date ?? '[date]')}<br>Time: ${esc(v.time ?? '[time]')}<br>` +
        `Interviewer: ${esc(v.interviewer ?? '[interviewer]')}<br>` +
        `Platform: ${esc(v.platform ?? '[Microsoft Teams / Google Meet / Zoom]')}` +
        (v.meetingLink ? `<br>Meeting link: <a href="${v.meetingLink}" style="color:#10b981">${esc(v.meetingLink)}</a>` : ''),
      `The interview will take approximately 30 minutes.`,
      `If you need to make any changes, you can do so below.`,
    ],
    ctas: [
      ...(v.rescheduleUrl ? [{ label: 'Reschedule', url: v.rescheduleUrl }] : []),
      ...(v.cancelUrl ? [{ label: 'Cancel', url: v.cancelUrl }] : []),
    ],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),

  // 9 — Rejection.
  rejection: (v) => ({
    subject: `Update on your FINECLEAN application`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Thank you for taking the time to apply and complete our recruitment process.`,
      `After careful consideration, we've decided not to move forward with your application on this occasion.`,
      `We appreciate your interest in FINECLEAN and will keep your details on file should another suitable opportunity become available.`,
      `We wish you every success in your job search.`,
    ],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),

  // 10 — Offer.
  offer: (v) => ({
    subject: `Congratulations! Welcome to FineClean`,
    paragraphs: [
      `Hi ${N(v)},`,
      `Congratulations!`,
      `We're delighted to offer you a position with FINECLEAN.`,
      `Our team will contact you shortly with your start date, onboarding information and employment paperwork.`,
      `We look forward to welcoming you to the FineClean team.`,
      `Congratulations once again.`,
    ],
    signoff: [`Sarah`, `FineClean Recruitment`],
  }),
};

// Back-compat: the old default key `invitation` maps to the Indeed invite.
TEMPLATES.invitation = TEMPLATES.indeed_invitation;

// Which templates advance the candidate to "invited" on send.
const INVITE_TEMPLATES = new Set([
  'invitation', 'existing_invitation', 'indeed_invitation',
]);

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

    // Merge candidate/job defaults with any caller-supplied `data`.
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
