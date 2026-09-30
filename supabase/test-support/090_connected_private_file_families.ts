// Four actual local Auth/RLS/Edge readers; object transport alone is signed loopback S3.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createClient } from '@supabase/supabase-js';

const API = 'http://127.0.0.1:54491';
const EDGE = 'http://127.0.0.1:8000';
const S3 = 'http://127.0.0.1:18092';
const BUCKET = 'genova-private';
const ACCESS = '090LOCALACCESSKEY';
const SECRET = '090-local-loopback-signing-key';
const families = [
  'assignment-file', 'assignment-review-file', 'repertoire-comment-file', 'chat-media-file',
] as const;
type Family = typeof families[number];

assert.equal(process.env.API_URL, API);
const database = new URL(process.env.DB_URL ?? '');
assert.equal(database.protocol, 'postgresql:');
assert.equal(database.hostname, '127.0.0.1');
assert.equal(database.port, '54492');
assert.equal(database.pathname, '/postgres');
const anon = process.env.ANON_KEY ?? '';
const service = process.env.SERVICE_ROLE_KEY ?? '';
for (const [key, role] of [[anon, 'anon'], [service, 'service_role']] as const) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()) as {
    iss: string; role: string;
  };
  assert.equal(claims.iss, 'supabase-demo');
  assert.equal(claims.role, role);
}
const admin = createClient(API, service, { auth: { persistSession: false, autoRefreshToken: false } });
const userClient = () => createClient(API, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const ids = {
  choirA: randomUUID(), choirB: randomUUID(), memberA: randomUUID(), memberB: randomUUID(),
  outsiderB: randomUUID(), roleA: randomUUID(), roleB: randomUUID(), songA: randomUUID(),
  assignment: randomUUID(), submission: randomUUID(), assignmentFile: randomUUID(),
  reviewFile: randomUUID(), comment: randomUUID(), commentFile: randomUUID(),
  room: randomUUID(), roomBatch: randomUUID(), chatFile: randomUUID(),
};
const wav = Buffer.concat([
  Buffer.from('RIFF'), Buffer.from([40, 0, 0, 0]), Buffer.from('WAVEfmt '),
  Buffer.from([16, 0, 0, 0, 1, 0, 1, 0, 64, 31, 0, 0, 128, 62, 0, 0, 2, 0, 16, 0]),
  Buffer.from('data'), Buffer.from([4, 0, 0, 0, 0, 0, 1, 0]),
]);
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
  'base64',
);
const cases: Record<Family, { fileId: string; key: string; bytes: Uint8Array; mime: string }> = {
  'assignment-file': {
    fileId: ids.assignmentFile,
    key: `choirs/${ids.choirA}/assignments/${ids.assignment}/submissions/${ids.assignmentFile}/content`,
    bytes: wav, mime: 'audio/wav',
  },
  'assignment-review-file': {
    fileId: ids.reviewFile,
    key: `choirs/${ids.choirA}/assignments/${ids.assignment}/submissions/${ids.submission}/reviews/${ids.reviewFile}/content`,
    bytes: wav, mime: 'audio/wav',
  },
  'repertoire-comment-file': {
    fileId: ids.commentFile,
    key: `choirs/${ids.choirA}/repertoire/${ids.songA}/comments/${ids.comment}/audio/${ids.commentFile}/content`,
    bytes: wav, mime: 'audio/wav',
  },
  'chat-media-file': {
    fileId: ids.chatFile,
    key: `choirs/${ids.choirA}/chat/${ids.room}/room-avatar/${ids.roomBatch}/0/${ids.chatFile}/content`,
    bytes: png, mime: 'image/png',
  },
};
const objects = new Map(Object.values(cases).map((item) => [`/${BUCKET}/${item.key}`, item]));
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
      response.writeHead(206, { 'Content-Type': item.mime, 'Content-Length': String(body.length),
        'Content-Range': `bytes ${start}-${end}/${item.bytes.length}` });
      response.end(request.method === 'HEAD' ? undefined : body); return;
    }
    response.writeHead(200, { 'Content-Type': item.mime, 'Content-Length': String(item.bytes.length) });
    response.end(request.method === 'HEAD' ? undefined : item.bytes);
  } catch { response.writeHead(500); response.end(); }
});

function sql(statement: string) {
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', statement], {
    env: { ...process.env, PGHOST: '127.0.0.1', PGPORT: '54492', PGDATABASE: 'postgres',
      PGUSER: decodeURIComponent(database.username), PGPASSWORD: decodeURIComponent(database.password) },
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function ok(error: unknown, stage: string): asserts error is null {
  if (error) throw new Error(`090 ${stage} failed; private details omitted`);
}
async function ready(edge: { exitCode: number | null }, family: Family) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (edge.exitCode !== null) throw new Error(`090 ${family} exited before ready`);
    try { if ((await fetch(EDGE, { method: 'OPTIONS' })).status === 204) return; }
    catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`090 ${family} did not become ready`);
}
async function ticket(fileId: string, accessToken: string) {
  const result = await fetch(EDGE, { method: 'POST', headers: {
    authorization: `Bearer ${accessToken}`, apikey: anon, 'content-type': 'application/json',
  }, body: JSON.stringify({ fileId }) });
  return { result, body: await result.text() };
}

async function main() {
  const first = await admin.auth.admin.createUser({ email: `shared-090-${randomUUID()}@example.invalid`,
    password: randomBytes(24).toString('base64url'), email_confirm: true });
  ok(first.error, 'create shared'); assert.ok(first.data.user);
  const second = await admin.auth.admin.createUser({ email: `other-090-${randomUUID()}@example.invalid`,
    password: randomBytes(24).toString('base64url'), email_confirm: true });
  ok(second.error, 'create outsider'); assert.ok(second.data.user);
  const userA = first.data.user.id, userB = second.data.user.id;
  const passwordA = randomBytes(24).toString('base64url');
  const passwordB = randomBytes(24).toString('base64url');
  ok((await admin.auth.admin.updateUserById(userA, { password: passwordA })).error, 'shared password');
  ok((await admin.auth.admin.updateUserById(userB, { password: passwordB })).error, 'outsider password');
  const a = ids.choirA, b = ids.choirB;
  sql(`begin;
    insert into public.choirs(id,slug,name) values
      ('${a}','090-a-${a}','090 synthetic A'),('${b}','090-b-${b}','090 synthetic B');
    insert into public.roles(id,choir_id,name) values
      ('${ids.roleA}','${a}','Şef'),('${ids.roleB}','${b}','Şef');
    insert into public.choir_members(id,choir_id,auth_user_id,first_name,last_name,voice_group,join_date) values
      ('${ids.memberA}','${a}','${userA}','Shared','A','Alto',current_date),
      ('${ids.memberB}','${b}','${userA}','Shared','B','Alto',current_date),
      ('${ids.outsiderB}','${b}','${userB}','Other','B','Alto',current_date);
    insert into public.choir_member_roles(choir_id,member_id,role_id) values
      ('${a}','${ids.memberA}','${ids.roleA}'),('${b}','${ids.memberB}','${ids.roleB}');
    insert into public.repertoire(id,choir_id,title,is_visible) values
      ('${ids.songA}','${a}','090 song',true);
    insert into public.assignments(id,choir_id,title,description,created_by,is_active,is_locked) values
      ('${ids.assignment}','${a}','090 assignment','Synthetic','${ids.memberA}',true,false);
    insert into public.assignment_submissions(id,choir_id,assignment_id,member_id,drive_file_id,file_name,mime_type,
      reviewer_audio_drive_file_id,reviewer_audio_file_name,reviewer_audio_mime_type) values
      ('${ids.submission}','${a}','${ids.assignment}','${ids.memberA}',
       'r2_${ids.assignmentFile}','take.wav','audio/wav',
       'r2_review_${ids.reviewFile}','review.wav','audio/wav');
    insert into public.assignment_submission_file_versions(id,choir_id,submission_id,assignment_id,member_id,
      version_number,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name) values
      ('${ids.assignmentFile}','${a}','${ids.submission}','${ids.assignment}','${ids.memberA}',
       1,'r2','${BUCKET}','${cases['assignment-file'].key}',${wav.length},'audio/wav','${hash(wav)}','take.wav');
    insert into public.assignment_review_audio_versions(id,choir_id,submission_id,assignment_id,member_id,
      created_by,version_number,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name) values
      ('${ids.reviewFile}','${a}','${ids.submission}','${ids.assignment}','${ids.memberA}',
       '${ids.memberA}',1,'r2','${BUCKET}','${cases['assignment-review-file'].key}',
       ${wav.length},'audio/wav','${hash(wav)}','review.wav');
    update public.assignment_submissions set current_file_version_id='${ids.assignmentFile}',
      reviewer_audio_file_version_id='${ids.reviewFile}' where id='${ids.submission}';
    insert into public.repertoire_comment_audio_versions(id,choir_id,comment_id,song_id,created_by,
      provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name) values
      ('${ids.commentFile}','${a}','${ids.comment}','${ids.songA}','${ids.memberA}',
       'r2','${BUCKET}','${cases['repertoire-comment-file'].key}',
       ${wav.length},'audio/wav','${hash(wav)}','comment.wav');
    insert into public.repertoire_song_comments(id,choir_id,song_id,content_html,created_by,
      audio_drive_file_id,audio_file_name,audio_mime_type,audio_file_version_id) values
      ('${ids.comment}','${a}','${ids.songA}','<p>090</p>','${ids.memberA}',
       'r2_comment_${ids.commentFile}','comment.wav','audio/wav','${ids.commentFile}');
    insert into public.chat_rooms(id,choir_id,name,slug,type,created_by) values
      ('${ids.room}','${a}','090 room','090-${ids.room}','custom','${ids.memberA}');
    insert into public.chat_room_members(choir_id,room_id,member_id,role) values
      ('${a}','${ids.room}','${ids.memberA}','admin');
    insert into public.chat_media_versions(id,choir_id,room_id,kind,batch_id,position,created_by,
      provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name,state) values
      ('${ids.chatFile}','${a}','${ids.room}','room-avatar','${ids.roomBatch}',0,'${ids.memberA}',
       'r2','${BUCKET}','${cases['chat-media-file'].key}',${png.length},'image/png','${hash(png)}',
       'avatar.png','active');
    update public.chat_rooms set avatar_media_version_id='${ids.chatFile}',
      avatar_url='r2_chat_${ids.chatFile}' where id='${ids.room}';
    commit;`);
  const shared = userClient(), outsider = userClient();
  ok((await shared.auth.signInWithPassword({ email: first.data.user.email!, password: passwordA })).error,
    'shared sign-in');
  ok((await outsider.auth.signInWithPassword({ email: second.data.user.email!, password: passwordB })).error,
    'outsider sign-in');
  const accessA = (await shared.auth.getSession()).data.session?.access_token;
  const accessB = (await outsider.auth.getSession()).data.session?.access_token;
  assert.ok(accessA); assert.ok(accessB);
  ok((await shared.rpc('set_active_choir', { p_choir_id: a })).error, 'select A');
  await new Promise<void>((resolve, reject) => provider.listen(18092, '127.0.0.1',
    () => resolve()).once('error', reject));
  try {
    for (const family of families) {
      const item = cases[family];
      const edge = spawn('deno', ['run', '--allow-env',
        '--allow-net=0.0.0.0:8000,127.0.0.1:54491,127.0.0.1:18092',
        `supabase/functions/${family}/index.ts`], { env: {
          ...process.env, SUPABASE_URL: API, SUPABASE_ANON_KEY: anon,
          SUPABASE_SERVICE_ROLE_KEY: service, R2_ACCOUNT_ID: '0123456789abcdef0123456789abcdef',
          R2_BUCKET: BUCKET, R2_ACCESS_KEY_ID: ACCESS, R2_SECRET_ACCESS_KEY: SECRET,
          R2_TEST_ENDPOINT: `${S3}/`, R2_ALLOW_INSECURE_LOOPBACK: 'true',
          GENOVA_TEST_LOOPBACK_ONLY: '1',
        }, stdio: ['ignore', 'pipe', 'pipe'] });
      let diagnostics = '';
      edge.stdout.on('data', (chunk) => { diagnostics += String(chunk); });
      edge.stderr.on('data', (chunk) => { diagnostics += String(chunk); });
      try {
        await ready(edge, family);
        const issued = await ticket(item.fileId, accessA);
        assert.equal(issued.result.status, 200, `${family} POST ${issued.result.status}`);
        const url = new URL((JSON.parse(issued.body) as { url: string }).url, EDGE);
        assert.equal(url.origin, EDGE);
        const full = await fetch(url);
        assert.equal(full.status, 200, `${family} GET`);
        assert.equal(full.headers.get('content-type'), item.mime);
        assert.equal(hash(new Uint8Array(await full.arrayBuffer())), hash(item.bytes));
        const range = await fetch(url, { headers: { range: 'bytes=5-17' } });
        assert.equal(range.status, 206, `${family} range`);
        assert.deepEqual(new Uint8Array(await range.arrayBuffer()),
          new Uint8Array(item.bytes.subarray(5, 18)));
        const head = await fetch(url, { method: 'HEAD', headers: { range: 'bytes=1-4' } });
        assert.equal(head.status, 206, `${family} HEAD`);
        assert.equal(head.headers.get('content-length'), '4');
        assert.equal((await head.arrayBuffer()).byteLength, 0);
        const beforeForeign = providerHits;
        assert.equal((await ticket(item.fileId, accessB)).result.status, 403, `${family} foreign POST`);
        assert.equal(providerHits, beforeForeign, `${family} foreign POST contacted provider`);
        ok((await shared.rpc('set_active_choir', { p_choir_id: b })).error, 'select B');
        assert.equal((await ticket(item.fileId, accessA)).result.status, 403,
          `${family} switched POST`);
        const beforeRevoked = providerHits;
        assert.equal((await fetch(url, { method: 'HEAD' })).status, 403,
          `${family} old HEAD after switch`);
        assert.equal((await fetch(url)).status, 403, `${family} old GET after switch`);
        assert.equal(providerHits, beforeRevoked, `${family} revoked GET/HEAD contacted provider`);
        ok((await shared.rpc('set_active_choir', { p_choir_id: a })).error, 'reselect A');
        console.log(`PASS 090 ${family} local Auth/RLS/Edge/S3 full/range/HEAD and old GET/HEAD refusal`);
      } catch (error) {
        if (diagnostics) process.stderr.write(diagnostics.replaceAll(service, '[redacted]'));
        throw error;
      } finally {
        edge.kill('SIGTERM');
        await Promise.race([new Promise((resolve) => edge.once('exit', resolve)),
          new Promise((resolve) => setTimeout(resolve, 2000))]);
      }
    }
  } finally { await new Promise<void>((resolve) => provider.close(() => resolve())); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
