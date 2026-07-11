// fc-admin-dashboard — recruiter-facing read model. Gated by FC_ADMIN_SECRET
// (x-admin-key header). Returns every candidate with their tier-1 prequal
// score, screening sessions, transcripts, structured responses and AI summary
// in one shot for the /admin dashboard. Deploy --no-verify-jwt (admin-key gated).
import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient } from '../_shared/db.ts';

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const db = adminClient();
    const { data, error } = await db
      .from('fc_candidates')
      .select(`
        id, first_name, last_name, email, phone, current_status, is_active,
        prequal_score, prequal_band, created_at,
        fc_prequal_responses ( question, answer, submitted_at ),
        fc_screening_sessions (
          id, status, started_at, completed_at, duration_seconds, created_at,
          fc_transcript_messages ( speaker, message, sequence_number ),
          fc_candidate_structured_responses ( * ),
          fc_ai_summaries ( * )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    // Sort nested collections deterministically (PostgREST doesn't order embeds).
    for (const c of data ?? []) {
      const sessions = (c as Record<string, unknown>).fc_screening_sessions as
        | Array<Record<string, unknown>> | undefined;
      for (const s of sessions ?? []) {
        const turns = s.fc_transcript_messages as Array<{ sequence_number: number }> | undefined;
        turns?.sort((a, b) => a.sequence_number - b.sequence_number);
      }
      sessions?.sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)));
    }

    return json({ candidates: data ?? [] });
  } catch (e) {
    console.error('fc-admin-dashboard:', e);
    return err('Internal error', 500);
  }
});
