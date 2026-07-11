import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function logEvent(
  db: ReturnType<typeof adminClient>,
  candidateId: string,
  eventName: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await db.from('fc_candidate_events').insert({
    candidate_id: candidateId,
    event_name: eventName,
    metadata,
  });
  if (error) console.error(`logEvent(${eventName}):`, error.message);
}
