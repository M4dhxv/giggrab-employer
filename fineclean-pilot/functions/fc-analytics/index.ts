import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient } from '../_shared/db.ts';

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const employer_slug = url.searchParams.get('employer') ?? 'fineclean';

    const db = adminClient();

    const { data: employer } = await db
      .from('fc_employers')
      .select('id')
      .eq('slug', employer_slug)
      .single();

    if (!employer) return err('Employer not found', 404);

    const eid = employer.id;

    // ── Funnel counts ────────────────────────────────────────────────────────

    const { data: funnelRaw } = await db.rpc('fc_analytics_funnel', { p_employer_id: eid });

    // Fallback: query events directly if RPC not available
    const events = [
      'Application Imported',
      'Invitation Sent',
      'Invitation Opened',
      'Invitation Clicked',
      'Form Started',
      'Form Submitted',
      'Candidate Not Looking',
      'OTP Requested',
      'OTP Verified',
      'Sarah Call Requested',
      'Sarah Call Started',
      'Sarah Call Completed',
      'Recruiter Review',
      'Interview Invited',
      'Offer Sent',
      'Rejected',
    ];

    const eventCounts: Record<string, number> = {};

    for (const ev of events) {
      const { count } = await db
        .from('fc_candidate_events')
        .select('candidate_id', { count: 'exact', head: true })
        .eq('event_name', ev)
        .in(
          'candidate_id',
          (await db.from('fc_candidates').select('id').eq('employer_id', eid)).data?.map((r: { id: string }) => r.id) ?? [],
        );
      eventCounts[ev] = count ?? 0;
    }

    // ── Candidate status breakdown ─────────────────────────────────────────

    const { data: statusRows } = await db
      .from('fc_candidates')
      .select('current_status')
      .eq('employer_id', eid);

    const statusCounts: Record<string, number> = {};
    for (const r of statusRows ?? []) {
      statusCounts[r.current_status] = (statusCounts[r.current_status] ?? 0) + 1;
    }

    const total = statusRows?.length ?? 0;

    // ── Screening stats ────────────────────────────────────────────────────

    const { data: sessions } = await db
      .from('fc_screening_sessions')
      .select('status, duration_seconds, started_at, completed_at')
      .in(
        'candidate_id',
        statusRows?.map((r: { current_status: string; id?: string }) => r) ?? [],
      );

    const completedSessions = (sessions ?? []).filter((s: { status: string }) => s.status === 'completed');
    const avgDuration = completedSessions.length
      ? Math.round(
          completedSessions.reduce((sum: number, s: { duration_seconds: number | null }) => sum + (s.duration_seconds ?? 0), 0) /
          completedSessions.length,
        )
      : null;

    // ── Conversion rates ───────────────────────────────────────────────────

    const imported = eventCounts['Application Imported'] ?? 0;
    const rate = (num: number, den: number) =>
      den > 0 ? parseFloat(((num / den) * 100).toFixed(1)) : null;

    const funnel = {
      imported,
      invitation_sent: eventCounts['Invitation Sent'] ?? 0,
      invitation_opened: eventCounts['Invitation Opened'] ?? 0,
      invitation_clicked: eventCounts['Invitation Clicked'] ?? 0,
      form_started: eventCounts['Form Started'] ?? 0,
      form_submitted: eventCounts['Form Submitted'] ?? 0,
      not_looking: eventCounts['Candidate Not Looking'] ?? 0,
      otp_requested: eventCounts['OTP Requested'] ?? 0,
      otp_verified: eventCounts['OTP Verified'] ?? 0,
      screening_requested: eventCounts['Sarah Call Requested'] ?? 0,
      screening_started: eventCounts['Sarah Call Started'] ?? 0,
      screening_completed: eventCounts['Sarah Call Completed'] ?? 0,
      recruiter_review: eventCounts['Recruiter Review'] ?? 0,
      interview_invited: eventCounts['Interview Invited'] ?? 0,
      offer_sent: eventCounts['Offer Sent'] ?? 0,
      rejected: eventCounts['Rejected'] ?? 0,
    };

    const conversion = {
      invitation_open_rate: rate(funnel.invitation_opened, funnel.invitation_sent),
      invitation_click_rate: rate(funnel.invitation_clicked, funnel.invitation_sent),
      form_completion_rate: rate(funnel.form_submitted, funnel.form_started),
      not_looking_rate: rate(funnel.not_looking, funnel.form_submitted + funnel.not_looking),
      otp_verification_rate: rate(funnel.otp_verified, funnel.otp_requested),
      screening_completion_rate: rate(funnel.screening_completed, funnel.screening_requested),
      recruiter_pass_rate: rate(funnel.interview_invited, funnel.recruiter_review),
      offer_rate: rate(funnel.offer_sent, funnel.interview_invited),
    };

    return json({
      employer: employer_slug,
      total_candidates: total,
      funnel,
      conversion,
      status_breakdown: statusCounts,
      screening: {
        total_sessions: (sessions ?? []).length,
        completed: completedSessions.length,
        avg_duration_seconds: avgDuration,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('fc-analytics:', e);
    return err('Internal error', 500);
  }
});
