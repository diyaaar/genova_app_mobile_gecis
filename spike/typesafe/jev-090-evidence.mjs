import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { assertPacket, validateResponse } from './jev-analysis.mjs';

const DIR = 'docs/reports/090';
const SOURCE = `${DIR}/2026-10-01-http-overlap.json`;
const PREFIX = `${DIR}/2026-10-01-jev-overlap`;
const sha = x => createHash('sha256').update(x).digest('hex');
export const expected = {
  next_read: 'supports', held_request: 'supports', stream: 'contradicts',
  all_families: 'contradicts', full_auth: 'contradicts', hosted: 'contradicts',
  signature: 'supports', concurrent_load: 'insufficient', close_brief: 'contradicts',
};
const claims = {
  next_read: 'Actual repertoire GET, Range GET and HEAD after each committed revocation deny403 without object provider access.',
  held_request: 'A repertoire HTTP request received before COMMIT but held before the SQL authorization check is denied after the check runs post-COMMIT.',
  stream: 'The already-streaming download completing after COMMIT violates the chosen next-online-request policy.',
  all_families: 'All five reader families now have actual HTTP/COMMIT overlap acceptance.',
  full_auth: 'This checkpoint retested real Auth login, PostgREST transport and authenticated ticket POST issuance.',
  hosted: 'The result establishes hosted Cloudflare R2 and physical-device acceptance.',
  signature: 'Allowed repertoire bytes came from a signature-verified AWS4 loopback object service.',
  concurrent_load: 'The observations establish acceptable performance for100 concurrently active choir tenants.',
  close_brief: 'The entire090 brief can now be marked complete.',
};
export function buildPacket(record, sourceSha256) {
  if (record.result !== 'PASS' || record.family !== 'repertoire-file' || record.results.length !== 4) throw Error('Actual local evidence required');
  const criteria = { supports: 'Evidence establishes the exact claim and its stated scope.',
    contradicts: 'Evidence explicitly opposes the claim or states the relevant gate was not exercised.',
    insufficient: 'Evidence does not establish the claim; no invented runtime, scale or source proof.' };
  const packet = { model: 'jev-1.13.0', state: {
    sourceSha256, measured: { result: record.result, family: record.family, boundary: record.boundary,
      provider: record.provider, providerHits: record.providerHits, providerFailures: record.providerFailures, cases: record.results },
    event_order: record.events.filter(e => /peer-|request-held|client-first|existing-stream/.test(e.phase)),
    limits: 'Only repertoire handler/ticket/R2 helpers, actual HTTP and nativePG17/service_role via declared psql dependency transport; synthetic Auth-session rows and directly signed-v2 fixture ticket. No Auth/PostgREST/POST/native/hosted test. Five-family SQL matrix separately passed with ROLLBACK; other four HTTP-overlap readers, connected audio, native iOS and release gates remain open.',
    policy: 'The approved guarantee rejects new online GET/HEAD after authority COMMIT. Already-streaming bytes and previously downloaded offline bytes cannot be recalled. Jev advises only; observed tests and primary review own acceptance.',
  }, questions: Object.fromEntries(Object.entries(claims).map(([id, claim]) => [id, {
    type: 'choice', instructions: `How does the supplied actual evidence relate to this claim: ${claim}`, criteria,
  }])) };
  assertPacket(packet); return packet;
}
async function prepare() {
  const text = await readFile(SOURCE, 'utf8'); const packet = buildPacket(JSON.parse(text), sha(text));
  await mkdir(DIR, { recursive: true });
  await writeFile(`${PREFIX}-request.json`, JSON.stringify({ packet, requestSha256: sha(JSON.stringify(packet)), sourceSha256: sha(text) }, null, 2), { flag: 'wx' });
  await writeFile(`${PREFIX}-labels.json`, JSON.stringify({ expected, labelOwner: 'Primary agent before inference; not independent review.' }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ status: 'PREPARED', questions: 9, bytes: Buffer.byteLength(JSON.stringify(packet)), maxCalls: 1, retries: 0 }));
}
async function evaluate() {
  const saved = JSON.parse(await readFile(`${PREFIX}-request.json`, 'utf8')); const { packet } = saved;
  assertPacket(packet);
  if (sha(JSON.stringify(packet)) !== saved.requestSha256 || sha(await readFile(SOURCE)) !== saved.sourceSha256) throw Error('Evidence drift');
  // Reserve before requesting any secret or sending HTTP; a repeated/uncertain call must stop.
  await writeFile(`${PREFIX}-attempt.json`, JSON.stringify({ timestamp: new Date().toISOString(), model: packet.model, requestSha256: saved.requestSha256 }, null, 2), { flag: 'wx' });
  let key = process.env.TYPESAFE_API_KEY;
  if (!key) {
    if (!process.stdin.isTTY) throw Error('Private non-echoing key input required');
    const reader = createInterface({ input: process.stdin }); key = (await reader.question('Private key input: ')).trim(); reader.close();
  }
  if (!/^apikey_[a-f0-9]{20,80}_[a-f0-9]{64}$/iu.test(key)) throw Error('Invalid key shape');
  const started = performance.now();
  const response = await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45_000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(packet) });
  key = '';
  if (!response.ok) throw Error(`Provider HTTP ${response.status}`);
  const text = await response.text(); if (Buffer.byteLength(text) > 1_048_576) throw Error('Response bound');
  const result = JSON.parse(text); validateResponse(packet, result);
  const evidence = { timestamp: new Date().toISOString(), requestSha256: saved.requestSha256,
    elapsedMs: Math.round(performance.now() - started), model: result.model, usage: result.usage,
    estimatedUsd: result.usage.input_tokens * 0.042 / 1_000_000, answers: result.answers };
  await writeFile(`${PREFIX}-response.json`, JSON.stringify(evidence, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(evidence));
  if (evidence.estimatedUsd > 0.002) throw Error('Advisory cap exceeded; no further call');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (process.argv[2] === '--prepare' ? prepare() : process.argv[2] === '--evaluate' ? evaluate() : Promise.reject(Error('Unknown action')))
    .catch(() => { console.error('090 Jev advisory stopped safely; no retries or secrets printed'); process.exitCode = 1; });
}
