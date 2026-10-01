// Real HTTP + native PG17 through an explicit psql dependency adapter, not Auth/PostgREST.
import { AwsClient } from 'npm:aws4fetch@1.0.20';
import { createRepertoireFileHandler } from '../functions/repertoire-file/handler.ts';
import { createPrivateFileTicketV2, verifyPrivateFileTicketV2 } from '../functions/_shared/private-file-ticket-v2.ts';
import { fetchR2Object } from '../functions/repertoire-file/r2.ts';

const DB = 'genova_090_http_overlap_test';
const PSQL = '/opt/homebrew/opt/postgresql@17/bin/psql';
const EDGE = 'http://127.0.0.1:18190';
const OBJECT = 'http://127.0.0.1:18191';
const actor = '10000000-0000-4000-8000-000000000090';
const session = '11000000-0000-4000-8000-000000000090';
const choir = '20000000-0000-4000-8000-000000000090';
const otherChoir = '20000000-0000-4000-8000-000000000091';
const member = '30000000-0000-4000-8000-000000000090';
const role = '40000000-0000-4000-8000-000000000090';
const file = '51000000-0000-4000-8000-000000000090';
const bucket = 'genova-private';
const objectKey = `choirs/${choir}/repertoire/${file}/score.pdf`;
const access = '090OVERLAPLOCAL';
const secret = crypto.randomUUID();
const ticketSecret = crypto.randomUUID();
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const events: { sequence: number; phase: string; change: string }[] = [];
let change = 'initial', providerHits = 0;
const record = (phase: string) => events.push({ sequence: events.length + 1, phase, change });
function check(condition: unknown, stage: string): asserts condition {
  if (!condition) throw new Error(`090 overlap failed: ${stage}`);
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(r => { resolve = r; });
  return { promise, resolve };
}
async function bounded<T>(p: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([p, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('090 barrier timeout')), 5000); })]); }
  finally { clearTimeout(timer); }
}
async function sql(statement: string, asService = false): Promise<string> {
  const result = await new Deno.Command(PSQL, { args: ['-h', '127.0.0.1', '-p', '5432', '-d', DB,
    '-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', statement],
    clearEnv: true, env: { PGHOST: '127.0.0.1', PGPORT: '5432', PGDATABASE: DB, PGPASSWORD: '',
      PGOPTIONS: `-c role=${asService ? 'service_role' : 'postgres'} -c statement_timeout=5000` },
    stdout: 'piped', stderr: 'piped' }).output();
  check(result.success, 'SQL command (private details omitted)');
  return decoder.decode(result.stdout).trim();
}
check(await sql(`select current_database()='${DB}' and current_setting('server_version_num') like '17%'`) === 't', 'exact disposable database');
const bytes = await Deno.readFile('apps/mobile/src/repertoire/__fixtures__/score_40p.pdf');
check(bytes.length === 65905, 'fixture size');
const hash = async (value: Uint8Array | string) => {
  const input = typeof value === 'string' ? encoder.encode(value) : value;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(input)))).map(x => x.toString(16).padStart(2, '0')).join('');
};
const digest = await hash(bytes);
await sql(`insert into public.repertoire_file_storage_locations(repertoire_file_id,choir_id,provider,bucket,object_key,content_length,mime_type,sha256_hex,verified_at,is_active)
 values('${file}','${choir}','r2','${bucket}','${objectKey}',${bytes.length},'application/pdf','${digest}',clock_timestamp(),true)`);

// Persistent peer psql session: explicit acknowledgements, never timing sleeps.
const peer = new Deno.Command(PSQL, { args: ['-h', '127.0.0.1', '-p', '5432', '-d', DB,
  '-X', '-Atq', '-v', 'ON_ERROR_STOP=1'],
  clearEnv: true, env: { PGPASSWORD: '', PGOPTIONS: '-c role=postgres -c statement_timeout=5000' },
  stdin: 'piped', stdout: 'piped', stderr: 'piped' }).spawn();
const writer = peer.stdin.getWriter();
const acknowledgements = new Map<string, ReturnType<typeof deferred>>();
let counter = 0;
const stdoutDrain = (async () => {
  let pending = '';
  for await (const chunk of peer.stdout) {
    pending += decoder.decode(chunk, { stream: true });
    const lines = pending.split('\n'); pending = lines.pop()!;
    for (const line of lines) acknowledgements.get(line.trim())?.resolve();
  }
})();
const stderrDrain = (async () => { for await (const _chunk of peer.stderr) { /* no SQL/private output */ } })();
async function peerSql(statement: string) {
  const key = `090_ACK_${++counter}`;
  const done = deferred(); acknowledgements.set(key, done);
  await writer.write(encoder.encode(`${statement}; select '${key}';\n`));
  await bounded(done.promise); acknowledgements.delete(key);
}

let sqlGate: { reached: ReturnType<typeof deferred>; release: ReturnType<typeof deferred> } | null = null;
let streamGate: ReturnType<typeof deferred> | null = null;
let providerFailures = 0;
const hmac = async (key: Uint8Array | string, value: string) => {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? encoder.encode(key) : new Uint8Array(key),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, encoder.encode(value)));
};
async function verifySignature(request: Request) {
  const url = new URL(request.url);
  check(url.origin === OBJECT && url.pathname === `/${bucket}/${objectKey}` && !url.search, 'provider exact target');
  const m = request.headers.get('authorization')?.match(/^AWS4-HMAC-SHA256 Credential=([^,]+), SignedHeaders=([^,]+), Signature=([a-f0-9]{64})$/);
  check(m, 'AWS4 envelope');
  const [key, date, region, service, end] = m[1].split('/');
  check(key === access && region === 'auto' && service === 's3' && end === 'aws4_request', 'AWS4 scope');
  const headers = m[2].split(';').map(name => `${name}:${request.headers.get(name)?.trim().replace(/\s+/g, ' ') ?? ''}\n`).join('');
  const canonical = `${request.method}\n${url.pathname}\n\n${headers}\n${m[2]}\n${request.headers.get('x-amz-content-sha256') ?? await hash('')}`;
  const scope = `${date}/${region}/${service}/${end}`;
  const signingKey = await hmac(await hmac(await hmac(await hmac(`AWS4${secret}`, date), region), service), end);
  const signature = await hmac(signingKey, `AWS4-HMAC-SHA256\n${request.headers.get('x-amz-date')}\n${scope}\n${await hash(canonical)}`);
  check(Array.from(signature).map(x => x.toString(16).padStart(2, '0')).join('') === m[3], 'AWS4 full signature');
}
const providerAbort = new AbortController();
const edgeAbort = new AbortController();
const objectServer = Deno.serve({ hostname: '127.0.0.1', port: 18191, signal: providerAbort.signal, onListen() {} }, async request => {
  try {
    await verifySignature(request); providerHits++; record('provider-request-signed');
    const match = request.headers.get('range')?.match(/^bytes=(\d+)-(\d+)$/);
    const start = match ? Number(match[1]) : 0, end = match ? Number(match[2]) : bytes.length - 1;
    const data = bytes.subarray(start, end + 1);
    const headers = { 'Content-Type': 'application/pdf', 'Content-Length': String(data.length),
      ...(match ? { 'Content-Range': `bytes ${start}-${end}/${bytes.length}` } : {}) };
    const status = match ? 206 : 200;
    if (request.method === 'HEAD') return new Response(null, { status, headers });
    const held = streamGate;
    if (!held) return new Response(data, { status, headers });
    return new Response(new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(data.subarray(0, 32));
        await bounded(held.promise);
        controller.enqueue(data.subarray(32)); controller.close();
      },
    }), { status, headers });
  } catch { providerFailures++; return new Response('Synthetic provider validation failed', { status: 500 }); }
});
const aws = new AwsClient({ accessKeyId: access, secretAccessKey: secret, service: 's3', region: 'auto', retries: 0 });
const handler = createRepertoireFileHandler({
  storageMode: 'r2-required',
  authorize() { throw new Error('POST Auth/issuance excluded from this fixture'); },
  async authorizeTicket(t) {
    record('http-reached-authority-adapter');
    const held = sqlGate;
    if (held) { held.reached.resolve(); await bounded(held.release.promise); }
    for (const value of [t.actorId, t.sessionId, t.choirId, t.fileId]) check(/^[a-f0-9-]{36}$/.test(value), 'UUID interpolation');
    check(t.family === 'repertoire-file', 'family'); record('authority-sql-start');
    const result = await sql(`select public.private_file_ticket_authorized_090('${t.actorId}','${t.sessionId}','${t.choirId}','repertoire-file','${t.fileId}')`, true);
    record(result === 't' ? 'authority-allow' : 'authority-deny'); return result === 't';
  },
  async loadTicketFile({ fileId, choirId }) {
    return JSON.parse(await sql(`select row_to_json(f) from public.repertoire_files f where id='${fileId}' and choir_id='${choirId}'`, true) || 'null');
  },
  async loadR2Location({ fileId, choirId }) {
    return JSON.parse(await sql(`select row_to_json(l) from public.repertoire_file_storage_locations l where repertoire_file_id='${fileId}' and choir_id='${choirId}' and is_active`, true) || 'null');
  },
  createTicket(input) { return createPrivateFileTicketV2('repertoire-file', input, ticketSecret); },
  verifyTicket(token) { return verifyPrivateFileTicketV2('repertoire-file', token, ticketSecret); },
  fetchDrive() { throw new Error('No Drive fallback'); }, fetchStorage() { throw new Error('No storage fallback'); },
  fetchR2({ location, method, range }) {
    return fetchR2Object({ accountId: '0123456789abcdef0123456789abcdef', jurisdiction: '',
      bucket: location.bucket, objectKey: location.object_key, method, range: range ?? undefined,
      signedFetch: (input, options) => aws.fetch(input, options), testEndpoint: OBJECT, allowInsecureLoopback: true });
  },
});
const edgeServer = Deno.serve({ hostname: '127.0.0.1', port: 18190, signal: edgeAbort.signal, onListen() {} }, handler);
const issued = await createPrivateFileTicketV2('repertoire-file', { actorId: actor, sessionId: session, choirId: choir, fileId: file }, ticketSecret);
const url = `${EDGE}/?fileId=${file}&ticket=${issued.token}`;
type Observation = { method: string; range: boolean; status: number; providerDelta: number; bytes: number };
async function read(method = 'GET', range = false, denied = false): Promise<Observation> {
  const before = providerHits;
  const response = await fetch(url, { method, headers: range ? { Range: 'bytes=5-17' } : {}, signal: AbortSignal.timeout(5000) });
  const received = new Uint8Array(await response.arrayBuffer());
  const expected = denied ? 403 : range ? 206 : 200;
  check(response.status === expected, `HTTP${expected}`);
  check(providerHits - before === (denied ? 0 : 1), 'provider hit boundary');
  if (!denied) {
    check(response.headers.get('cache-control') === 'private, no-store', 'no-store');
    check(await hash(received) === await hash(method === 'HEAD' ? new Uint8Array() : range ? bytes.subarray(5, 18) : bytes), 'exact bytes');
  }
  return { method, range, status: response.status, providerDelta: providerHits - before, bytes: received.length };
}
const variants = [['GET', false], ['GET', true], ['HEAD', false]] as const;
const mutations: Record<string, string> = {
  choir_switch: `update genova_005.active_choir_sessions set choir_id='${otherChoir}' where session_id='${session}'`,
  role_removal: `delete from public.choir_member_roles where member_id='${member}' and role_id='${role}'`,
  membership_inactive: `update public.choir_members set is_active=false where id='${member}'`,
  session_deleted: `delete from auth.sessions where id='${session}'`,
};
async function reset() {
  await sql(`insert into auth.sessions(id,user_id) values('${session}','${actor}') on conflict(id) do nothing;
    update public.choir_members set is_active=true where id='${member}';
    insert into public.choir_member_roles(choir_id,member_id,role_id) values('${choir}','${member}','${role}') on conflict do nothing;
    insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id) values('${session}','${actor}','${choir}')
      on conflict(session_id) do update set choir_id=excluded.choir_id`);
}
const results: unknown[] = [];
try {
  for (const [kind, mutation] of Object.entries(mutations)) {
    change = kind; await reset();
    await peerSql(`begin; ${mutation}`); record('peer-uncommitted');
    const uncommitted: Observation[] = [];
    for (const [method, range] of variants) uncommitted.push(await read(method, range));
    await peerSql('commit'); record('peer-commit-ack');
    const afterCommit: Observation[] = [];
    for (const [method, range] of variants) afterCommit.push(await read(method, range, true));

    await reset(); await peerSql(`begin; ${mutation}`); record('peer-uncommitted-held-request');
    sqlGate = { reached: deferred(), release: deferred() };
    const waiting = read('GET', false, true);
    await bounded(sqlGate.reached.promise); record('request-held-before-sql');
    await peerSql('commit'); record('peer-commit-before-authority');
    sqlGate.release.resolve(); const heldBeforeSql = await waiting; sqlGate = null;

    await reset(); streamGate = deferred();
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    check(response.status === 200 && response.body, 'stream response');
    const reader = response.body.getReader();
    const first = await bounded(reader.read()); check(first.value && first.value.length > 0 && !first.done, 'actual first bytes');
    record('client-first-bytes-before-commit');
    await peerSql(`begin; ${mutation}; commit`); record('peer-commit-during-stream');
    const freshDenials: Observation[] = [];
    for (const [method, range] of variants) freshDenials.push(await read(method, range, true));
    streamGate.resolve(); streamGate = null;
    const chunks = [first.value];
    while (true) { const next = await bounded(reader.read()); if (next.done) break; chunks.push(next.value); }
    const full = new Uint8Array(chunks.reduce((sum, x) => sum + x.length, 0));
    let offset = 0; for (const c of chunks) { full.set(c, offset); offset += c.length; }
    check(await hash(full) === digest, 'already-streaming complete exact bytes'); record('existing-stream-completed');
    results.push({ change: kind, uncommitted, afterCommit, heldBeforeSql,
      streaming: { firstBytesBeforeCommit: first.value.length, completedBytes: full.length, sha256: digest, freshDenials } });
    console.log(`PASS ${kind}: uncommitted200/206/200; committed403/provider0; held HTTP denied; existing stream65905B survives`);
  }
  check(providerFailures === 0, 'provider signatures');
  await Deno.mkdir('docs/reports/090', { recursive: true });
  await Deno.writeTextFile('docs/reports/090/2026-10-01-http-overlap.json', JSON.stringify({
    timestamp: new Date().toISOString(), result: 'PASS', family: 'repertoire-file',
    boundary: 'Actual handler/R2 helper and HTTP, nativePG17/service_role SQL via explicit psql adapter. Synthetic session rows/direct signed-v2 fixture issuance, no Auth/PostgREST/entrypoint/hosted/native proof.',
    provider: 'AWS4 signature-verified loopback object service', providerHits, providerFailures, results, events,
  }, null, 2));
} finally {
  sqlGate?.release.resolve(); streamGate?.resolve();
  try { await writer.write(encoder.encode('rollback;\n\\q\n')); await writer.close(); } catch { /* exiting peer */ }
  await bounded(peer.status).catch(() => { peer.kill('SIGTERM'); });
  await Promise.all([stdoutDrain, stderrDrain]);
  edgeAbort.abort(); providerAbort.abort();
  await Promise.all([edgeServer.finished, objectServer.finished]);
}
