import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

type Decision = 'shortlisted' | 'interview_invited' | 'offer_sent' | 'rejected' | 'hold';

const STATUS_MAP: Record<Decision, string> = {
  shortlisted: 'shortlisted',
  interview_invited: 'interview_invited',
  offer_sent: 'offer_sent',
  rejected: 'rejected',
  hold: 'recruiter_hold',
};

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const { candidate_id, session_id, decision, notes, recruiter_id } = await req.json() as {
      candidate_id: string;
      session_id?: string;
      decision: Decision;
      notes?: string;
      recruiter_id?: string;
    };

    if (!candidate_id || !decision) return err('candidate_id and decision required');

    const validDecisions: Decision[] = ['shortlisted', 'interview_invited', 'offer_sent', 'rejected', 'hold'];
    if (!validDecisions.includes(decision)) return err(`Invalid decision: ${decision}`);

    const db = adminClient();

    const { data: candidate } = await db
      .from('fc_candidates')
      .select('id, first_name, last_name, email')
      .eq('id', candidate_id)
      .single();

    if (!candidate) return err('Candidate not found', 404);

    const { data: decisionRow, error: insertErr } = await db
      .from('fc_recruiter_decisions')
      .insert({
        candidate_id,
        session_id: session_id ?? null,
        recruiter_id: recruiter_id ?? null,
        decision,
        notes: notes ?? null,
        shortlisted: decision === 'shortlisted',
        interview_invited: decision === 'interview_invited',
        offer_sent: decision === 'offer_sent',
        rejected: decision === 'rejected',
        decided_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertErr) throw insertErr;

    await db.from('fc_candidates').update({ current_status: STATUS_MAP[decision] }).eq('id', candidate_id);

    await logEvent(db, candidate_id, 'Recruiter Review', {
      decision,
      decision_id: decisionRow.id,
      recruiter_id: recruiter_id ?? null,
    });

    if (decision === 'rejected') {
      await db.from('fc_candidates').update({ is_active: false }).eq('id', candidate_id);
    }

    if (session_id) {
      const { data: session } = await db
        .from('fc_screening_sessions')
        .select('id')
        .eq('id', session_id)
        .eq('status', 'completed')
        .single();

      if (session) {
        const { data: structured } = await db
          .from('fc_candidate_structured_responses')
          .select('*')
          .eq('session_id', session_id)
          .single();

        const { data: aiSummary } = await db
          .from('fc_ai_summaries')
          .select('*')
          .eq('session_id', session_id)
          .single();

        const { data: transcript } = await db
          .from('fc_transcript_messages')
          .select('*')
          .eq('session_id', session_id)
          .order('sequence_number');

        await db.from('fc_fine_tuning_dataset').upsert({
          candidate_id,
          session_id,
          industry: 'cleaning',
          role: 'Cleaner / Housekeeper',
          transcript: transcript ?? [],
          structured_responses: structured ?? null,
          ai_summary: aiSummary ?? null,
          ai_recommendation: aiSummary?.recommendation ?? null,
          confidence_score: aiSummary?.confidence_score ?? null,
          recruiter_decision: decision,
        }, { onConflict: 'session_id' });
      }
    }

    return json({ success: true, decision_id: decisionRow.id });
  } catch (e) {
    console.error('fc-recruiter-review:', e);
    return err('Internal error', 500);
  }
});
