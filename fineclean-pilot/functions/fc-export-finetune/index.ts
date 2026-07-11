import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient } from '../_shared/db.ts';

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const outcome = url.searchParams.get('outcome');
    const format = url.searchParams.get('format') ?? 'json';

    const db = adminClient();

    let query = db
      .from('fc_fine_tuning_dataset')
      .select(`
        id,
        candidate_id,
        session_id,
        industry,
        role,
        transcript,
        structured_responses,
        ai_summary,
        ai_recommendation,
        confidence_score,
        recruiter_decision,
        final_hiring_outcome,
        created_at,
        fc_candidates(first_name, last_name, email, city, source)
      `)
      .order('created_at', { ascending: false });

    if (outcome) query = query.eq('final_hiring_outcome', outcome);

    const { data, error } = await query;
    if (error) throw error;

    if (format === 'jsonl') {
      const lines = (data ?? [])
        .map((row) => JSON.stringify(row))
        .join('\n');
      return new Response(lines, {
        headers: {
          ...cors,
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': 'attachment; filename="fc_finetune_dataset.jsonl"',
        },
      });
    }

    return json({
      total: data?.length ?? 0,
      filters: { outcome: outcome ?? 'all' },
      records: data ?? [],
      exported_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('fc-export-finetune:', e);
    return err('Internal error', 500);
  }
});
