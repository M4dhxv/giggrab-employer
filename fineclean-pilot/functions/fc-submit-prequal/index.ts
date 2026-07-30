import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { logEvent } from '../_shared/db.ts';

interface PrequalResponse {
  question: string;
  answer: string;
}

// ─── Tier-1 rule-based score (0–100) ─────────────────────────────────────────
// Deterministic pre-qualification score for the FineClean Worcester Industrial
// Cleaner pilot. Tier 2 (the Sarah call) is AI-scored separately in
// fc-sarah-extract. Frontend sends these stable question keys:
//   still_looking | right_to_work | town | can_reach_worcester |
//   driving_licence | available_2_weeks
// Nothing here rejects: "still looking = No" is the only close, handled below.
// Right-to-work is verified on Sarah's call; a licence is a plus, not a gate.
function answerFor(responses: PrequalResponse[], key: string): string {
  const r = responses.find(
    (x) => x.question === key || x.question.toLowerCase().includes(key.replace(/_/g, ' ')),
  );
  return (r?.answer ?? '').trim();
}

function isYes(responses: PrequalResponse[], key: string): boolean {
  return answerFor(responses, key).toLowerCase() === 'yes';
}

function scorePrequal(responses: PrequalResponse[]): { score: number; band: string } {
  const availability = isYes(responses, 'available_2_weeks') ? 30 : 10; //  max 30
  const rightToWork = isYes(responses, 'right_to_work') ? 30 : 0; //         max 30
  const canReach = isYes(responses, 'can_reach_worcester') ? 25 : 5; //      max 25
  const licence = isYes(responses, 'driving_licence') ? 15 : 5; //           max 15 (a plus)
  const score = Math.min(100, availability + rightToWork + canReach + licence);
  const band = score >= 70 ? 'strong' : score >= 40 ? 'maybe' : 'weak';
  return { score, band };
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

    // Tier-1 rule-based score.
    const { score, band } = scorePrequal(responses);

    await db.from('fc_candidates').update({
      current_status: 'prequal_completed',
      prequal_score: score,
      prequal_band: band,
    }).eq('id', candidate_id);
    await logEvent(db, candidate_id, 'Form Submitted', {
      completion_time_seconds: completion_time_seconds ?? null,
      prequal_score: score,
      prequal_band: band,
    });

    return json({ success: true, next_step: 'screening', prequal_score: score, prequal_band: band });
  } catch (e) {
    console.error('fc-submit-prequal:', e);
    return err('Internal error', 500);
  }
});
