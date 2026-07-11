import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { logEvent } from '../_shared/db.ts';

interface PrequalResponse {
  question: string;
  answer: string;
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  try {
    const { token, candidate_id, responses, completion_time_seconds } =
      await req.json() as {
        token: string;
        candidate_id: string;
        responses: PrequalResponse[];
        completion_time_seconds?: number;
      };

    if (!token || !candidate_id || !Array.isArray(responses)) {
      return err('token, candidate_id, and responses required');
    }

    const { candidate, db, error } = await resolveCandidate(token);
    if (error || !candidate) return err(error ?? 'Not found', 404);
    if (candidate.id !== candidate_id) return err('Token mismatch', 403);
    if (!candidate.is_active) return err('Candidate is inactive', 409);

    await logEvent(db, candidate_id, 'Form Started');

    const rows = responses.map((r) => ({
      candidate_id,
      question: r.question,
      answer: r.answer,
      submitted_at: new Date().toISOString(),
      completion_time_seconds: completion_time_seconds ?? null,
    }));

    const { error: insertErr } = await db.from('fc_prequal_responses').insert(rows);
    if (insertErr) throw insertErr;

    const stillLooking = responses.find((r) =>
      r.question.toLowerCase().includes('looking for work') ||
      r.question === 'still_looking'
    );

    if (stillLooking?.answer?.toLowerCase() === 'no') {
      await db.from('fc_candidates').update({
        current_status: 'not_looking',
        is_active: false,
      }).eq('id', candidate_id);

      await logEvent(db, candidate_id, 'Candidate Not Looking', {
        responses: responses.reduce((acc, r) => ({ ...acc, [r.question]: r.answer }), {}),
      });

      return json({ success: true, next_step: 'done', reason: 'not_looking' });
    }

    await db.from('fc_candidates').update({ current_status: 'prequal_completed' }).eq('id', candidate_id);
    await logEvent(db, candidate_id, 'Form Submitted', {
      completion_time_seconds: completion_time_seconds ?? null,
    });

    return json({ success: true, next_step: 'screening' });
  } catch (e) {
    console.error('fc-submit-prequal:', e);
    return err('Internal error', 500);
  }
});
