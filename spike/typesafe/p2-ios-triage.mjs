// One redacted semantic triage call; no raw logs, credentials, screenshots or chats.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { metadata } from './conversation-audit.mjs';
const hash = x => createHash('sha256').update(x).digest('hex');
const out = 'docs/reports/090/p2-jev-triage';
const q = (instructions, criteria) => ({ type: 'choice', instructions, criteria });
const questions = {
  investigation: q('Which next investigation best matches the observed credential persistence?', {
    fixture_then_retest: 'Task-only synthetic JSON has no cache headers; add no-store, reset only owned test app/keychain, repeat exact native flow and scan disk again before judging product',
    bypass: 'Replace SecureStore with in-memory auth and declare passed',
    product_proven: 'The hosted provider is already proved insecure; rewrite production authentication',
    unknown: 'Evidence does not support a next step' }),
  ui_failure: q('What does the failed UI test at share dismissal establish?', {
    selector: 'A driver expected a Close button but actual iOS popover exposes a dismiss region; actual PDF/share can be reviewed separately while preserving the failed attempt',
    pdf_empty: 'PDF is empty', share_broken: 'Sharing never opened', unknown: 'Cannot tell' }),
  authority: q('Can advisory confidence close an unrun persistence row?', { no: 'No, fresh observed negative and positive controls are required', yes: 'Yes', unknown: 'Unknown' }),
  bad_control: q('Evaluate only controls.bad: accept?', { reject: 'Reject: hosted headers and fresh runtime not proved', accept: 'Accept', unknown: 'Unknown' }),
  good_control: q('Evaluate only controls.good: is this evidence boundary honest?', { honest: 'Yes: local fixture proof separate from hosted and hardware', conflated: 'No', unknown: 'Unknown' }),
};
const packet = { model: 'jev-1.13.0', state: {
  observations: 'Frozen RN/Expo source on iOS26.5: actual cancel GET/HEAD/provider0; actual nonblank PDF pages1/2; iOS share sheet opened; agent dismissed actual popover, reader returned; close actual File.exists false; AuthStore A-to-B from active profile GET/HEAD403/provider0. Native HTTP result PASS. XCTest v1 target PRODUCT_NAME missing; v2 passed through pages/share but wrongly expected Close. CUA AX dismissal/close/B completed real flow. iOS app Cache.db-wal scan found 16 synthetic JWT signatures and synthetic refresh marker; SQL shows synthetic auth token POST response body and RPC request headers cached. The task-only fixture uses Response.json with no cache-control. This is not a live-provider observation. Product source unchanged. Proposed fixture-only no-store and fresh owned app/keychain rerun; persist failures. SecureStore remains real native keychain.',
  provenance: ['supabase/test-support/090_android_candidate.mjs', 'spike/090-p2-ios-ui.swift', 'docs/reports/090/2026-10-03-ios-p2-interactive-http-v1.json'],
  policy: 'Source/tests/actual observations authoritative; AI routes investigation only. No raw private logs or chats. No deployed provider, physical hardware, recipient or full Next-route claim.',
  controls: { bad: 'AI says likely fixture issue; therefore all P2 and hosted credential persistence PASS without retest.', good: 'Keep initial persistence FAIL; no-store fixture retest must show no token disk matches. Local simulator proof does not establish hosted cache headers or physical beta.' },
}, questions };
const body = JSON.stringify(packet); assert(Buffer.byteLength(body) < 60000); assert(!/apikey_|eyJ[A-Za-z0-9_-]+\./u.test(body));
assert(!fs.existsSync(out)); const keys = new Set();
for await (const line of createInterface({ input: fs.createReadStream(metadata('01a0f6aa-6fb1-7e20-9aed-0a49f5a6d109').rollout_path), crlfDelay: Infinity })) {
  let row; try { row = JSON.parse(line); } catch { continue; }
  if (row.type !== 'response_item' || row.payload?.type !== 'message' || row.payload?.role !== 'user') continue;
  for (const item of row.payload.content ?? []) for (const match of (item.text ?? '').matchAll(/apikey_[a-f0-9]{20,80}_[a-f0-9]{64}/giu)) keys.add(match[0]);
}
assert.equal(keys.size, 1); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(out + '/request.json', JSON.stringify({ date: new Date().toISOString(), requestSha256: hash(body), packet }, null, 2), { flag: 'wx', mode: 0o600 });
const response = await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000), headers: { Authorization: 'Bearer ' + [...keys][0], 'Content-Type': 'application/json' }, body }); keys.clear();
assert(response.ok, 'Provider HTTP ' + response.status); const result = await response.json(); assert.equal(result.model, packet.model);
for (const [id, question] of Object.entries(questions)) {
  const answer = result.answers?.[id]; assert(answer?.type === 'choice' && Object.hasOwn(question.criteria, answer.choice));
  assert.deepEqual(Object.keys(answer.probabilities).sort(), Object.keys(question.criteria).sort());
  assert(Object.values(answer.probabilities).every(p => Number.isFinite(p) && p >= 0 && p <= 1));
  assert(Math.abs(Object.values(answer.probabilities).reduce((n,p)=>n+p,0)-1) < .02);
}
assert(Number.isInteger(result.usage?.input_tokens) && Number.isInteger(result.usage?.output_tokens));
const record = { date: new Date().toISOString(), requestSha256: hash(body), ...result, estimatedUsd: result.usage.input_tokens * .042 / 1e6, pricing: 'https://docs.typesafe.ai/models; estimate not invoice', retries: 0 };
assert(record.estimatedUsd <= .02); fs.writeFileSync(out + '/response.json', JSON.stringify(record, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ model: record.model, answers: record.answers, usage: record.usage, estimatedUsd: record.estimatedUsd }));
