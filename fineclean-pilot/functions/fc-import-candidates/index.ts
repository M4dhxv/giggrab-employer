import { preflight, json, err } from '../_shared/cors.ts';
import { requireAdminKey } from '../_shared/validate.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

interface CandidateRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  phone_type?: string;
  city?: string;
  postcode?: string;
  source?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (!requireAdminKey(req)) return err('Unauthorized', 401);

  try {
    const { candidates, employer_slug, job_id } = await req.json() as {
      candidates: CandidateRow[];
      employer_slug?: string;
      job_id?: string;
    };

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return err('candidates array required');
    }

    const db = adminClient();
    const slug = employer_slug ?? 'fineclean';

    const { data: employer } = await db
      .from('fc_employers')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!employer) return err(`Employer '${slug}' not found`, 404);

    let resolvedJobId = job_id ?? null;
    if (!resolvedJobId) {
      const { data: job } = await db
        .from('fc_jobs')
        .select('id')
        .eq('employer_id', employer.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      resolvedJobId = job?.id ?? null;
    }

    const rows = candidates.map((c) => ({
      employer_id: employer.id,
      job_id: resolvedJobId,
      first_name: c.first_name.trim(),
      last_name: c.last_name.trim(),
      email: c.email.trim().toLowerCase(),
      phone: c.phone?.trim() ?? null,
      phone_type: c.phone_type?.trim() ?? null,
      city: c.city?.trim() ?? null,
      postcode: c.postcode?.trim() ?? null,
      source: c.source?.trim() ?? null,
      notes: c.notes?.trim() ?? null,
    }));

    let imported = 0;
    let skipped = 0;
    const importedIds: string[] = [];

    for (const row of rows) {
      const { data, error } = await db
        .from('fc_candidates')
        .insert(row)
        .select('id')
        .single();

      if (error) {
        console.warn(`Skipped ${row.email}: ${error.message}`);
        skipped++;
        continue;
      }

      await logEvent(db, data.id, 'Application Imported', {
        source: row.source,
        employer_slug: slug,
      });

      importedIds.push(data.id);
      imported++;
    }

    return json({ success: true, imported, skipped, ids: importedIds });
  } catch (e) {
    console.error('fc-import-candidates:', e);
    return err('Internal error', 500);
  }
});
