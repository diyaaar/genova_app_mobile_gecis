// Actual local Auth/PostgREST/RLS and Deno entrypoint; only the S3-compatible object server is synthetic.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { createRepertoireFileTicket } from '../functions/repertoire-file/ticket';

const API = 'http://127.0.0.1:54491';
const EDGE = 'http://127.0.0.1:8000';
const S3 = 'http://127.0.0.1:18092';
const BUCKET = 'genova-private';
const ACCOUNT = '0123456789abcdef0123456789abcdef';
const ACCESS = '091LOCALACCESSKEY';
const SECRET = '091-local-loopback-signing-key';

assert.equal(process.env.API_URL, API);
const database = new URL(process.env.DB_URL ?? '');
assert.equal(database.protocol, 'postgresql:');
assert.equal(database.hostname, '127.0.0.1');
assert.equal(database.port, '54492');
assert.equal(database.pathname, '/postgres');
const anon = process.env.ANON_KEY ?? '';
const service = process.env.SERVICE_ROLE_KEY ?? '';
for (const [key, role] of [[anon, 'anon'], [service, 'service_role']] as const) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()) as { iss: string; role: string };
  assert.equal(claims.iss, 'supabase-demo');
  assert.equal(claims.role, role);
}
const admin = createClient(API, service, { auth: { persistSession: false, autoRefreshToken: false } });
const userClient = () => createClient(API, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const androidFixturePath = process.env.GENOVA_093_ANDROID_FIXTURE_PATH
  ? resolve(process.env.GENOVA_093_ANDROID_FIXTURE_PATH) : null;
if (androidFixturePath) {
  assert.equal(androidFixturePath, resolve('spike/093-runtime/.093-android-fixture.json'));
}
const ids = {
  choirA: randomUUID(), choirB: randomUUID(), songA: randomUUID(), songB: randomUUID(),
  fileA: randomUUID(), fileB: randomUUID(), memberA: randomUUID(), memberB: randomUUID(),
  outsiderB: randomUUID(), roleA: randomUUID(), roleB: randomUUID(), roleChorist: randomUUID(),
};
const assignmentA = randomUUID();
const pdf = new Uint8Array(readFileSync('apps/mobile/src/repertoire/__fixtures__/score_40p.pdf'));
assert.equal(pdf.byteLength, 65_905);
const wav = Buffer.concat([
  Buffer.from('RIFF'), Buffer.from([40, 0, 0, 0]), Buffer.from('WAVEfmt '),
  Buffer.from([16, 0, 0, 0, 1, 0, 1, 0, 64, 31, 0, 0, 128, 62, 0, 0, 2, 0, 16, 0]),
  Buffer.from('data'), Buffer.from([4, 0, 0, 0, 0, 0, 1, 0]),
]);
const objects = new Map<string, { bytes: Uint8Array; type: string }>([
  [`/${BUCKET}/choirs/${ids.choirA}/repertoire/${ids.fileA}/score.pdf`, { bytes: pdf, type: 'application/pdf' }],
  [`/${BUCKET}/choirs/${ids.choirB}/repertoire/${ids.fileB}/rehearsal.wav`, { bytes: wav, type: 'audio/wav' }],
]);
let providerHits = 0;
const provider = createServer((request, response) => {
  try {
    const url = new URL(request.url ?? '/', S3);
    assert.match(request.headers.authorization ?? '', /^AWS4-HMAC-SHA256 /);
    assert.ok(request.headers.authorization?.includes(`Credential=${ACCESS}/`));
    assert.equal(url.search, '');
    providerHits += 1;
    const item = objects.get(decodeURI(url.pathname));
    if (!item) { response.writeHead(404); response.end(); return; }
    const match = request.headers.range?.match(/^bytes=(\d+)-(\d+)$/);
    if (match) {
      const start = Number(match[1]), end = Number(match[2]);
      const body = item.bytes.subarray(start, end + 1);
      response.writeHead(206, { 'Content-Type': item.type, 'Content-Length': String(body.length),
        'Content-Range': `bytes ${start}-${end}/${item.bytes.length}` });
      response.end(request.method === 'HEAD' ? undefined : body); return;
    }
    response.writeHead(200, { 'Content-Type': item.type, 'Content-Length': String(item.bytes.length) });
    response.end(request.method === 'HEAD' ? undefined : item.bytes);
  } catch {
    response.writeHead(500); response.end();
  }
});

function sql(statement: string) {
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', statement], {
    env: { ...process.env, PGHOST: '127.0.0.1', PGPORT: '54492', PGDATABASE: 'postgres',
      PGUSER: decodeURIComponent(database.username), PGPASSWORD: decodeURIComponent(database.password) },
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
async function ready(edge: { exitCode: number | null }) {
  for (let i = 0; i < 50; i += 1) {
    if (edge.exitCode !== null) throw new Error('091 Deno exited before ready');
    try { if ((await fetch(EDGE, { method: 'OPTIONS' })).status === 204) return; } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('091 Deno did not become ready');
}
async function ticket(fileId: string, accessToken: string) {
  const result = await fetch(EDGE, { method: 'POST', headers: {
    authorization: `Bearer ${accessToken}`, apikey: anon, 'content-type': 'application/json',
  }, body: JSON.stringify({ fileId }) });
  return { result, body: await result.text() };
}
async function ownRead(fileId: string, bytes: Uint8Array, accessToken: string) {
  const issued = await ticket(fileId, accessToken);
  assert.equal(issued.result.status, 200, issued.body);
  const url = new URL((JSON.parse(issued.body) as { url: string }).url, EDGE);
  assert.equal(url.origin, EDGE);
  const full = await fetch(url);
  assert.equal(full.status, 200);
  assert.equal(hash(new Uint8Array(await full.arrayBuffer())), hash(bytes));
  assert.equal(full.headers.get('cache-control'), 'private, no-store');
  const range = await fetch(url, { headers: { range: 'bytes=5-17' } });
  assert.equal(range.status, 206);
  assert.deepEqual(new Uint8Array(await range.arrayBuffer()), new Uint8Array(bytes.subarray(5, 18)));
  const head = await fetch(url, { method: 'HEAD', headers: { range: 'bytes=1-4' } });
  assert.equal(head.status, 206);
  assert.equal(head.headers.get('content-length'), '4');
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  console.log(`PASS 091 local actual Auth/RLS + signed loopback object bytes=${bytes.length} sha256=${hash(bytes)}`);
  return url;
}
function ok(error: unknown, stage: string): asserts error is null {
  if (error) throw new Error(`091 ${stage} failed; private details omitted`);
}

async function main() {
  const first = await admin.auth.admin.createUser({ email: `shared-091-${randomUUID()}@example.invalid`,
    password: randomBytes(24).toString('base64url'), email_confirm: true });
  ok(first.error, 'create shared'); assert.ok(first.data.user);
  const second = await admin.auth.admin.createUser({ email: `other-091-${randomUUID()}@example.invalid`,
    password: randomBytes(24).toString('base64url'), email_confirm: true });
  ok(second.error, 'create outsider'); assert.ok(second.data.user);
  const userA = first.data.user.id, userB = second.data.user.id;
  // Passwords are supplied only to local Auth and never persisted in source/evidence.
  // Set fresh passwords via a second local admin operation so no output/log contains them.
  const passwordA = randomBytes(24).toString('base64url');
  const passwordB = randomBytes(24).toString('base64url');
  ok((await admin.auth.admin.updateUserById(userA, { password: passwordA })).error, 'shared password');
  ok((await admin.auth.admin.updateUserById(userB, { password: passwordB })).error, 'outsider password');
  sql(`begin;
    insert into public.choirs(id,slug,name) values
      ('${ids.choirA}','091-a-${ids.choirA}','091 synthetic choir A'),
      ('${ids.choirB}','091-b-${ids.choirB}','091 synthetic choir B');
    insert into public.roles(id,choir_id,name) values
      ('${ids.roleA}','${ids.choirA}','Şef'),('${ids.roleB}','${ids.choirB}','Şef'),
      ('${ids.roleChorist}','${ids.choirB}','Korist');
    insert into public.choir_members(id,choir_id,auth_user_id,first_name,last_name,join_date) values
      ('${ids.memberA}','${ids.choirA}','${userA}','Shared','A',current_date),
      ('${ids.memberB}','${ids.choirB}','${userA}','Shared','B',current_date),
      ('${ids.outsiderB}','${ids.choirB}','${userB}','Other','B',current_date);
    insert into public.choir_member_roles(choir_id,member_id,role_id) values
      ('${ids.choirA}','${ids.memberA}','${ids.roleA}'),
      ('${ids.choirB}','${ids.memberB}','${ids.roleB}'),
      ('${ids.choirB}','${ids.outsiderB}','${ids.roleChorist}');
    insert into public.repertoire(id,choir_id,title,drive_folder_id,is_visible) values
      ('${ids.songA}','${ids.choirA}','091 score','091-synthetic-no-provider',true),
      ('${ids.songB}','${ids.choirB}','091 audio','091-synthetic-no-provider',true);
    insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,drive_file_id,mime_type,file_size_bytes) values
      ('${ids.fileA}','${ids.choirA}','${ids.songA}','score.pdf','sheet','091-no-drive-a','application/pdf',${pdf.length}),
      ('${ids.fileB}','${ids.choirB}','${ids.songB}','rehearsal.wav','audio','091-no-drive-b','audio/wav',${wav.length});
    insert into public.song_assignments(id,choir_id,song_id,member_id,assigned_by,part_name) values
      ('${assignmentA}','${ids.choirA}','${ids.songA}','${ids.memberA}','${ids.memberA}','Alto');
    insert into public.repertoire_file_storage_locations
      (repertoire_file_id,choir_id,provider,bucket,object_key,content_length,mime_type,sha256_hex,verified_at,is_active) values
      ('${ids.fileA}','${ids.choirA}','r2','${BUCKET}','choirs/${ids.choirA}/repertoire/${ids.fileA}/score.pdf',${pdf.length},'application/pdf','${hash(pdf)}',now(),true),
      ('${ids.fileB}','${ids.choirB}','r2','${BUCKET}','choirs/${ids.choirB}/repertoire/${ids.fileB}/rehearsal.wav',${wav.length},'audio/wav','${hash(wav)}',now(),true);
    commit;`);
  const shared = userClient(), sharedSecondSession = userClient(), outsider = userClient();
  ok((await shared.auth.signInWithPassword({ email: first.data.user.email!, password: passwordA })).error, 'shared sign-in');
  ok((await sharedSecondSession.auth.signInWithPassword({ email: first.data.user.email!, password: passwordA })).error, 'second session sign-in');
  ok((await outsider.auth.signInWithPassword({ email: second.data.user.email!, password: passwordB })).error, 'outsider sign-in');
  const accessA = (await shared.auth.getSession()).data.session?.access_token;
  const accessB = (await outsider.auth.getSession()).data.session?.access_token;
  assert.ok(accessA); assert.ok(accessB);
  await new Promise<void>((resolve, reject) => provider.listen(18092, '127.0.0.1', () => resolve()).once('error', reject));
  const edge = spawn('deno', ['run', '--allow-env', '--allow-net=127.0.0.1:8000,127.0.0.1:54491,127.0.0.1:18092',
    'supabase/functions/repertoire-file/index.ts'], { env: {
      ...process.env, SUPABASE_URL: API, SUPABASE_ANON_KEY: anon,
      SUPABASE_SERVICE_ROLE_KEY: service, REPERTOIRE_STORAGE_MODE: 'r2-required',
      R2_ACCOUNT_ID: ACCOUNT, R2_BUCKET: BUCKET, R2_ACCESS_KEY_ID: ACCESS,
      R2_SECRET_ACCESS_KEY: SECRET, R2_TEST_ENDPOINT: `${S3}/`, R2_ALLOW_INSECURE_LOOPBACK: 'true',
      GENOVA_TEST_LOOPBACK_ONLY: '1',
    }, stdio: ['ignore', 'pipe', 'pipe'] });
  let diagnostics = '';
  edge.stdout.on('data', chunk => { diagnostics += String(chunk); });
  edge.stderr.on('data', chunk => { diagnostics += String(chunk); });
  try {
    await ready(edge);
    ok((await shared.rpc('set_active_choir', { p_choir_id: ids.choirA })).error, 'select A');
    ok((await sharedSecondSession.rpc('set_active_choir', { p_choir_id: ids.choirA })).error, 'second session select A');
    const oldA = await ownRead(ids.fileA, pdf, accessA);
    const legacy = await createRepertoireFileTicket({fileId:ids.fileA,choirId:ids.choirA},service);
    const legacyUrl = new URL(`?fileId=${ids.fileA}&ticket=${encodeURIComponent(legacy.token)}`,EDGE);
    assert.equal((await fetch(legacyUrl,{method:'HEAD'})).status,401,'v1 must be refused at read');
    const before = providerHits;
    assert.equal((await ticket(ids.fileB, accessA)).result.status, 403);
    assert.equal((await ticket(ids.fileA, accessB)).result.status, 403);
    assert.equal(providerHits, before, 'foreign ticket attempts contacted provider');
    if (androidFixturePath) {
      await mkdir(resolve('spike/093-runtime'), { recursive: true, mode: 0o700 });
      await writeFile(androidFixturePath, JSON.stringify({
        email: first.data.user.email, password: passwordA, choirA: ids.choirA,
        choirB: ids.choirB, fileId: ids.fileA, pdfSha256: hash(pdf),
      }), { mode: 0o600, flag: 'wx' });
      console.log('READY 093 synthetic Android fixture; send SIGTERM after runtime check');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('093 Android hold timed out')), 30 * 60_000);
        process.once('SIGTERM', () => { clearTimeout(timeout); resolve(); });
      });
      await unlink(androidFixturePath);
      console.log('PASS 093 Android hold ended; fixture secret removed');
    }
    ok((await shared.rpc('set_active_choir', { p_choir_id: ids.choirB })).error, 'select B');
    assert.equal((await ticket(ids.fileA, accessA)).result.status, 403);
    await ownRead(ids.fileB, wav, accessA);
    console.log('PASS 091 actual Auth/RLS A/B, foreign user and old-context POST refusals');
    const beforeRevokedRead = providerHits;
    assert.equal((await fetch(oldA, { method: 'HEAD' })).status, 403);
    assert.equal(providerHits,beforeRevokedRead,'revoked old A URL contacted provider');
    const secondAccess = (await sharedSecondSession.auth.getSession()).data.session?.access_token;
    assert.ok(secondAccess);
    const stillA = await ownRead(ids.fileA,pdf,secondAccess);
    console.log('PASS 090 same-session switch revokes old URL; separate Auth session stays A');
    ok((await shared.rpc('set_active_choir', { p_choir_id: ids.choirA })).error, 'reselect A');
    sql(`update public.choir_members set is_active=false where id='${ids.memberA}' and choir_id='${ids.choirA}';`);
    assert.equal((await ticket(ids.fileA, accessA)).result.status, 403);
    const beforeMembershipRead = providerHits;
    assert.equal((await fetch(stillA,{method:'HEAD'})).status,403);
    assert.equal(providerHits,beforeMembershipRead,'revoked membership read contacted provider');
    console.log('PASS 090 inactive membership refuses new and already-issued tickets');
  } catch (error) {
    if (diagnostics) process.stderr.write(diagnostics.replaceAll(service, '[redacted]'));
    throw error;
  } finally {
    if (androidFixturePath) await unlink(androidFixturePath).catch(() => {});
    edge.kill('SIGTERM');
    await Promise.race([new Promise(resolve => edge.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 2000))]);
    await new Promise<void>(resolve => provider.close(() => resolve()));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
