import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.112.4';
import type { PrivateFileTicketV2 } from './private-file-ticket-v2.ts';

/** One service-only SQL decision before metadata or provider access. Errors fail closed. */
export async function authorizePrivateFileTicket(
  client: SupabaseClient, ticket: PrivateFileTicketV2,
): Promise<boolean> {
  const { data, error } = await client.rpc('private_file_ticket_authorized_090', {
    p_actor_id: ticket.actorId,
    p_session_id: ticket.sessionId,
    p_choir_id: ticket.choirId,
    p_family: ticket.family,
    p_file_id: ticket.fileId,
  });
  if (error) throw new Error('Ticket authority lookup failed');
  return data === true;
}
