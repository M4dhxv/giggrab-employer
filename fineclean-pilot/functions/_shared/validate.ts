import { adminClient } from './db.ts';

export async function resolveCandidate(token: string) {
  const db = adminClient();
  const { data, error } = await db
    .from('fc_candidates')
    .select('*, fc_employers(name, slug), fc_jobs(title)')
    .eq('invitation_token', token)
    .single();

  if (error || !data) return { candidate: null, db, error: 'Invalid token' };
  if (new Date(data.invitation_token_expires_at) < new Date()) {
    return { candidate: null, db, error: 'Token expired' };
  }
  return { candidate: data, db, error: null };
}

export function requireAdminKey(req: Request): boolean {
  const adminSecret = Deno.env.get('FC_ADMIN_SECRET');
  if (!adminSecret) return false;
  const auth = req.headers.get('x-admin-key') ?? req.headers.get('authorization')?.replace('Bearer ', '');
  return auth === adminSecret;
}
