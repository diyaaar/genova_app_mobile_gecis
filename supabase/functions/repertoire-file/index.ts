import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import { AwsClient } from 'npm:aws4fetch@1.0.20';
import { resolveSupabasePublicKey } from '../create-choir/create-choir-core.ts';
import {
  createRepertoireFileHandler,
  type RepertoireStorageMode,
} from './handler.ts';
import { fetchR2Object, parseR2Jurisdiction } from './r2.ts';
import { fetchStorageObject } from './storage.ts';
import { authorizePrivateFileTicket } from '../_shared/private-file-authority.ts';
import {
  createPrivateFileTicketV2,
  sessionIdFromVerifiedAccessToken,
  verifyPrivateFileTicketV2,
} from '../_shared/private-file-ticket-v2.ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILE_FIELDS = 'id, choir_id, drive_file_id, drive_download_link, file_name, mime_type';
const LOCATION_FIELDS = 'repertoire_file_id, choir_id, provider, bucket, object_key, content_length, mime_type, sha256_hex, verified_at, is_active';

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function storageMode(): RepertoireStorageMode {
  const value = Deno.env.get('REPERTOIRE_STORAGE_MODE') || 'legacy';
  if (value === 'legacy' || value === 'mixed' || value === 'r2-required') return value;
  throw new Error('Invalid REPERTOIRE_STORAGE_MODE');
}

const REPERTOIRE_STORAGE_MODE = storageMode();

function makeUserClient(authorization: string) {
  const url = requiredEnv('SUPABASE_URL');
  const key = resolveSupabasePublicKey(
    Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'),
    Deno.env.get('SUPABASE_ANON_KEY'),
  );
  if (!key) throw new Error('Missing public key');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
}

function makeAdminClient() {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const handler = createRepertoireFileHandler({
  async authorize({ authorization, accessToken, fileId }) {
    const client = makeUserClient(authorization);
    const { data: userData, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !userData.user) throw new Error('Unauthorized');

    const { data: activeChoirId, error: choirError } = await client.rpc('current_choir_id');
    if (choirError) throw new Error('Active choir lookup failed');
    if (typeof activeChoirId !== 'string' || !UUID_PATTERN.test(activeChoirId)) {
      return null;
    }
    const { data: file, error: fileError } = await client
      .from('repertoire_files')
      .select(FILE_FIELDS)
      .eq('id', fileId)
      .maybeSingle();
    if (fileError) throw new Error('File authorization lookup failed');
    if (!file) return null;
    return {
      choirId: activeChoirId,
      file,
      actorId: userData.user.id,
      sessionId: sessionIdFromVerifiedAccessToken(accessToken, userData.user.id),
    };
  },
  authorizeTicket(ticket) {
    return authorizePrivateFileTicket(makeAdminClient(), ticket);
  },
  async loadTicketFile({ fileId, choirId }) {
    const { data, error } = await makeAdminClient()
      .from('repertoire_files')
      .select(FILE_FIELDS)
      .eq('id', fileId)
      .eq('choir_id', choirId)
      .maybeSingle();
    if (error) throw new Error('Ticket file lookup failed');
    return data;
  },
  async loadR2Location({ fileId, choirId }) {
    const { data, error } = await makeAdminClient()
      .from('repertoire_file_storage_locations')
      .select(LOCATION_FIELDS)
      .eq('repertoire_file_id', fileId)
      .eq('choir_id', choirId)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw new Error('R2 location lookup failed');
    return data;
  },
  createTicket(input) {
    return createPrivateFileTicketV2('repertoire-file', input, requiredEnv('SUPABASE_SERVICE_ROLE_KEY'));
  },
  verifyTicket(token) {
    return verifyPrivateFileTicketV2('repertoire-file', token, requiredEnv('SUPABASE_SERVICE_ROLE_KEY'));
  },
  fetchDrive(driveFileId) {
    const url = new URL('https://drive.google.com/uc');
    url.searchParams.set('export', 'download');
    url.searchParams.set('id', driveFileId);
    return fetch(url, { redirect: 'follow', cache: 'no-store' });
  },
  async fetchStorage(bucket, path) {
    return fetchStorageObject({
      supabaseUrl: requiredEnv('SUPABASE_URL'),
      serviceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      bucket,
      path,
    });
  },
  async fetchR2({ location, method, range }) {
    const accountId = requiredEnv('R2_ACCOUNT_ID');
    const bucket = requiredEnv('R2_BUCKET');
    const jurisdiction = parseR2Jurisdiction(Deno.env.get('R2_JURISDICTION'));
    if (jurisdiction === null) throw new Error('Invalid R2 jurisdiction');
    if (location.bucket !== bucket) throw new Error('R2 bucket mismatch');
    const expectedPrefix = `choirs/${location.choir_id}/repertoire/${location.repertoire_file_id}/`;
    if (!location.object_key.startsWith(expectedPrefix) || location.object_key === expectedPrefix) {
      throw new Error('R2 object key mismatch');
    }
    const client = new AwsClient({
      service: 's3',
      region: 'auto',
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    });
    return fetchR2Object({
      accountId,
      jurisdiction,
      bucket,
      objectKey: location.object_key,
      method,
      range: range ?? undefined,
      signedFetch: (input, init) => client.fetch(input, init),
      testEndpoint: Deno.env.get('R2_TEST_ENDPOINT'),
      allowInsecureLoopback: Deno.env.get('R2_ALLOW_INSECURE_LOOPBACK') === 'true',
    });
  },
  storageMode: REPERTOIRE_STORAGE_MODE,
});

// The isolated connected-runtime harness binds only to loopback; hosted Edge keeps its default bind.
const localBind = Deno.env.get('GENOVA_TEST_LOOPBACK_ONLY') === '1';
Deno.serve(localBind ? { hostname: '127.0.0.1' } : {}, handler);
