import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import { resolveSupabasePublicKey } from '../create-choir/create-choir-core.ts';
import { sessionIdFromVerifiedAccessToken } from '../_shared/private-file-ticket-v2.ts';
import { fetchStorageObject } from '../repertoire-file/storage.ts';
import { createLegacyFileHandler, type LegacyFileRecord } from './handler.ts';
import { createLegacyTicket, verifyLegacyTicket } from './ticket.ts';

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
function admin() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } });
}
const handler = createLegacyFileHandler({
  async authenticate(authorization, accessToken) {
    const key = resolveSupabasePublicKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'), Deno.env.get('SUPABASE_ANON_KEY'));
    if (!key) throw new Error('Missing public key');
    const client = createClient(env('SUPABASE_URL'), key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user) return null;
    const sessionId = sessionIdFromVerifiedAccessToken(accessToken, data.user.id);
    const choir = await client.rpc('current_choir_id');
    if (choir.error) throw new Error('Choir lookup failed');
    if (typeof choir.data !== 'string') return null;
    return { actorId: data.user.id, sessionId, choirId: choir.data };
  },
  async resolve(input) {
    const { data, error } = await admin().rpc('resolve_legacy_file_090', {
      p_actor_id: input.actorId, p_session_id: input.sessionId, p_choir_id: input.choirId,
      p_alias: input.alias, p_kind: input.kind ?? null, p_resource_id: input.resourceId ?? null,
    });
    if (error) throw new Error('Legacy authority lookup failed');
    return data as LegacyFileRecord | null;
  },
  createTicket: (input) => createLegacyTicket(input, env('SUPABASE_SERVICE_ROLE_KEY')),
  verifyTicket: (token) => verifyLegacyTicket(token, env('SUPABASE_SERVICE_ROLE_KEY')),
  fetchDrive(alias) {
    const url = new URL('https://drive.google.com/uc');
    url.searchParams.set('export', 'download');
    url.searchParams.set('id', alias);
    return fetch(url, { cache: 'no-store', redirect: 'follow', signal: AbortSignal.timeout(25_000) });
  },
  fetchStorage: (bucket, path) => fetchStorageObject({
    supabaseUrl: env('SUPABASE_URL'), serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'), bucket, path,
  }),
});
Deno.serve(Deno.env.get('GENOVA_TEST_LOOPBACK_ONLY') === '1' ? { hostname: '127.0.0.1' } : {}, handler);
