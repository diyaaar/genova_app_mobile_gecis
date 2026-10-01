import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { assertPacket, validateResponse } from './jev-analysis.mjs';

const DIR = 'docs/reports/090';
const SOURCE = `${DIR}/2026-10-01-http-overlap.json`;
const PREFIX = `${DIR}/2026-10-01-jev-overlap`;
const sha = x => createHash('sha256').update(x).digest('hex');
export const familyExpected = { all_families: 'supports', blanket_role: 'contradicts', room_revoke: 'supports',
  index_mapping: 'supports', full_auth: 'contradicts', stream: 'contradicts', native_audio: 'contradicts',
  load: 'insufficient', close_brief: 'contradicts', invoice: 'contradicts' };
export function buildFamiliesPacket(previous, current, sourceHashes) {
  if (previous.result !== 'PASS' || previous.family !== 'repertoire-file' || previous.results.length !== 4 ||
      current.result !== 'PASS' || current.family !== 'remaining-four' || current.results.length !== 16 ||
      current.providerFailures !== 0 || previous.providerFailures !== 0) throw Error('Actual family evidence required');
  const families = ['repertoire-file','assignment-file','assignment-review-file','repertoire-comment-file','chat-media-file'];
  const records = [...previous.results.map(r=>({...r,family:'repertoire-file'})),...current.results];
  for (const family of families) {
    const subset = records.filter(r=>r.family===family);
    const changes = ['choir_switch',family==='chat-media-file'?'room_membership_removed':'role_removal','membership_inactive','session_deleted'];
    if (subset.length!==4 || subset.map(r=>r.change).sort().join()!==changes.sort().join()) throw Error('Family coverage mismatch');
    for (const r of subset) {
      if (r.uncommitted.map(o=>o.status).join()!=='200,206,200' || r.uncommitted.some(o=>o.providerDelta!==1) ||
          [...r.afterCommit,r.heldBeforeSql,...r.streaming.freshDenials].length!==7 ||
          [...r.afterCommit,r.heldBeforeSql,...r.streaming.freshDenials].some(o=>o.status!==403||o.providerDelta!==0) ||
          r.streaming.firstBytesBeforeCommit!==32 || r.streaming.completedBytes<=32 || !/^[a-f0-9]{64}$/.test(r.streaming.sha256)) throw Error('Case failed observed boundary');
    }
  }
  if (current.independentGrants.length!==1 || current.independentGrants[0].family!=='chat-media-file' ||
      current.independentGrants[0].allowed.map(o=>o.status).join()!=='200,206,200' ||
      current.independentGrants[0].allowed.some(o=>o.providerDelta!==1)) throw Error('Independent chat grant missing');
  const claims={
    all_families:'The combined two local runs establish actual HTTP/COMMIT observations for all five private-file families under the explicitly declared SQL transport adapters.',
    blanket_role:'Removing the chef choir role must deny the next chat-media request even when independent room membership remains valid.',
    room_revoke:'Removing chat room membership after COMMIT denies new full GET, Range GET and HEAD without provider access.',
    index_mapping:'The remaining-four run executes the actual four production index registrations, metadata mappings and R2 object-key checks using a declared test-only Supabase-fetch/psql adapter.',
    full_auth:'These two overlap runs retested real Supabase Auth login, authenticated ticket POST issuance and actual PostgREST transport.',
    stream:'An already-streaming download finishing after COMMIT violates the approved next-online-request refusal contract.',
    native_audio:'The remaining-four HTTP evidence closes actual connected native Android audio Auth/R2 acceptance.',
    load:'These observations establish acceptable load performance for100 concurrently active choir tenants.',
    close_brief:'All mandatory090 gates are now complete and the entire brief can close.',
    invoice:'Returned token counts and the documented unit price establish an independently verified provider invoice total.',
  };
  const observation=o=>`${o.method}${o.range?'/Range':''}:${o.status}/provider${o.providerDelta}`;
  const packet={model:'jev-1.13.0',state:{sourceHashes,
    runs:[previous,current].map(r=>({timestamp:r.timestamp,boundary:r.boundary,provider:r.provider,hits:r.providerHits,failures:r.providerFailures})),
    observations:records.map(r=>({family:r.family,change:r.change,
      before:r.uncommitted.map(observation),after:r.afterCommit.map(observation),held:observation(r.heldBeforeSql),
      stream:{firstBytesBeforeCommit:r.streaming.firstBytesBeforeCommit,completedBytes:r.streaming.completedBytes,
        sha256:r.streaming.sha256,freshDenials:r.streaming.freshDenials.map(observation)}})),
    independent_chat_grant:current.independentGrants.map(r=>({family:r.family,change:r.change,afterRoleCommit:r.allowed.map(observation)})),
    method:'Actual HTTP with explicit peer COMMIT acknowledgements, before-SQL and first-byte stream barriers. Older repertoire handler dependency adapter; newer four literal production index imports capture Deno.serve, preserving real mappings/key checks; Supabase fetch requests strictly parsed then executed under service_role in nativePG17. Synthetic Auth rows/direct signed-v2 issuance, not real Auth/PostgREST/POST. These are primary self-reviewed tests, not independent review.',
    policy:'Refuse new online requests after loss of the applicable access grant; preserve independent chat-room membership despite unrelated choir-role loss. Already-streaming/offline bytes cannot be recalled. Model advises only; observed tests/source own acceptance.',
    limits:'Connected native audio, native iOS, hosted/provider/release remain NOT RUN. No load benchmark or verified invoice. Token/unit-price costs are estimates. Whole090 stays open.',
  },questions:Object.fromEntries(Object.entries(claims).map(([id,claim])=>[id,{type:'choice',instructions:`How does the supplied evidence relate to this claim: ${claim}`,
    criteria:{supports:'Evidence establishes the exact claim and scope.',contradicts:'Evidence explicitly opposes the claim or declares the relevant gate unrun.',insufficient:'Evidence does not establish the claim; invent no runtime, scale or invoice proof.'}}]))};
  assertPacket(packet);return packet;
}
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
const FAMILY_SOURCE = `${DIR}/2026-10-01-http-families-overlap.json`;
const FAMILY_PREFIX = `${DIR}/2026-10-01-jev-families-overlap`;
async function prepare(families = false) {
  const source = families ? FAMILY_SOURCE : SOURCE, prefix = families ? FAMILY_PREFIX : PREFIX;
  const text = await readFile(source, 'utf8');
  const prior = families ? await readFile(SOURCE, 'utf8') : null;
  const packet = families ? buildFamiliesPacket(JSON.parse(prior),JSON.parse(text),{previous:sha(prior),current:sha(text)}) : buildPacket(JSON.parse(text), sha(text));
  await mkdir(DIR, { recursive: true });
  await writeFile(`${prefix}-request.json`, JSON.stringify({ packet, requestSha256: sha(JSON.stringify(packet)), sourceSha256: sha(text), ...(families ? { previousSha256: sha(prior) } : {}) }, null, 2), { flag: 'wx' });
  await writeFile(`${prefix}-labels.json`, JSON.stringify({ expected: families ? familyExpected : expected, labelOwner: 'Primary agent before inference; not independent review.' }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ status: 'PREPARED', questions: Object.keys(packet.questions).length, bytes: Buffer.byteLength(JSON.stringify(packet)), maxCalls: 1, retries: 0 }));
}
async function evaluate(families = false) {
  const source = families ? FAMILY_SOURCE : SOURCE, prefix = families ? FAMILY_PREFIX : PREFIX;
  const saved = JSON.parse(await readFile(`${prefix}-request.json`, 'utf8')); const { packet } = saved;
  assertPacket(packet);
  if (sha(JSON.stringify(packet)) !== saved.requestSha256 || sha(await readFile(source)) !== saved.sourceSha256 ||
      (families && sha(await readFile(SOURCE)) !== saved.previousSha256)) throw Error('Evidence drift');
  // Reserve before requesting any secret or sending HTTP; a repeated/uncertain call must stop.
  await writeFile(`${prefix}-attempt.json`, JSON.stringify({ timestamp: new Date().toISOString(), model: packet.model, requestSha256: saved.requestSha256 }, null, 2), { flag: 'wx' });
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
  await writeFile(`${prefix}-response.json`, JSON.stringify(evidence, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(evidence));
  if (evidence.estimatedUsd > 0.002) throw Error('Advisory cap exceeded; no further call');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (process.argv[2] === '--prepare' ? prepare() : process.argv[2] === '--evaluate' ? evaluate() :
    process.argv[2] === '--prepare-families' ? prepare(true) : process.argv[2] === '--evaluate-families' ? evaluate(true) : Promise.reject(Error('Unknown action')))
    .catch(() => { console.error('090 Jev advisory stopped safely; no retries or secrets printed'); process.exitCode = 1; });
}
