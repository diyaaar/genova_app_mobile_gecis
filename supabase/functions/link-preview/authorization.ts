import { PreviewError } from './policy.ts';
import type { PreviewActor } from './handler.ts';

export interface PreviewAuthClient {
  auth: { getUser(token: string): Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  rpc(name: string): PromiseLike<{ data: unknown; error: unknown }>;
}

/** Auth verification plus active RPC scope; the membership row binds both RPC results together.
 * Revocation observed during authorization fails closed. In-flight revocation is not atomic.
 */
export async function authorizePreview(client: Pick<PreviewAuthClient, 'auth' | 'rpc'> & {
  findActiveMember: (memberId: string, choirId: string, userId: string) => PromiseLike<{ data: unknown; error: unknown }>;
}, token: string): Promise<PreviewActor> {
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new PreviewError('unauthorized', 401);
  const { data: choirId, error: choirError } = await client.rpc('current_choir_id');
  const { data: memberId, error: memberError } = await client.rpc('current_choir_member_id');
  if (choirError || memberError || typeof choirId !== 'string' || typeof memberId !== 'string') throw new PreviewError('forbidden', 403);
  const membership = await client.findActiveMember(memberId, choirId, data.user.id);
  if (membership.error || !membership.data) throw new PreviewError('forbidden', 403);
  return { userId: data.user.id, choirId, memberId };
}
