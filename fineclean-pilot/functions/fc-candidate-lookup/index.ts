import { preflight, json, err } from '../_shared/cors.ts';
import { resolveCandidate } from '../_shared/validate.ts';
import { logEvent } from '../_shared/db.ts';

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  try {
    const { token } = await req.json();
    if (!token) return err('token required');

    const { candidate, db, error } = await resolveCandidate(token);
    if (error || !candidate) return err(error ?? 'Not found', 404);

    await logEvent(db, candidate.id, 'Invitation Clicked', { token });

    return json({
      candidate_id: candidate.id,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
      city: candidate.city,
      current_status: candidate.current_status,
      is_active: candidate.is_active,
      employer_name: candidate.fc_employers?.name ?? null,
      job_title: candidate.fc_jobs?.title ?? null,
    });
  } catch (e) {
    console.error('fc-candidate-lookup:', e);
    return err('Internal error', 500);
  }
});
