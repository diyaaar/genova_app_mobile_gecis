// One bounded advisory call. No raw conversations, private data or deployment authority.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { metadata } from './conversation-audit.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');
const out = 'docs/reports/090/p3-entry-review';
const provenance = [
  'docs/teslim-rehberi/README.md', 'docs/teslim-rehberi/checkpoint.md',
  'docs/teslim-rehberi/03-release-package.md',
  'docs/reports/2026-10-03-ios-p2-private-file-acceptance.md',
  'docs/reports/090/2026-10-03-p1-beta-candidate.json',
  'docs/private-r2-release-runbook.md',
].map(file => ({ file, sha256: sha(fs.readFileSync(file)) }));
const q = (instructions, criteria) => ({ type: 'choice', instructions, criteria });
const packet = { model: 'jev-1.13.0', state: {
  direction: 'Owner asks to check completed progress against the existing linked delivery guide, then create the next logical step if sound. This turn is review/planning, not implementation or deployment.',
  guide: 'P1 exact source candidate -> P2 agent iOS local acceptance -> P3 compatible reviewed recoverable release packet -> P4 private storage activation -> P5 installed signed usable Android beta -> P6 preserved full commercial product -> P7 both stores. No new roadmap. Keep RN/Expo, Supabase, assisted first onboarding, permanent WebViews, five free seats, small existing-choir cohort then independent choir. No owner manual QA; no sibling website changes or old-note deletion.',
  verified: 'Current product matches all610 frozen SHA256 pins. P1 manifest rebuild byte-equivalent. P2 recorded current local simulator acceptance: actual consent cancel zero GET/HEAD/provider, PDF pages1/2 and exact65905B/hash, native share-dismiss/return/close/file removal, actual active choir A->B denies next GET/HEAD, authority expiry renewal and valid denials, disk scans zero credential matches. Five evidence file hashes replayed;157 native/5 server pins match. Product unchanged; earlier mobile465/focused26/root1178/build records retained, not rerun now. Owned runtimes removed. Independent review not performed.',
  gaps: 'Served web revision, applied SQL, deployed Edge/config, full actual Next/Auth/RLS five-family old/new-client compatibility, fresh restore/object recovery and independent package review remain open. P2 no-store repaired a synthetic fixture only; actual provider cache headers/persistence unverified. Profile fixture is not complete beta. No beta/store claim.',
  discrepancy: 'Runbook heading Current revocation release boundary -- 2 October says current local Next legacy route is signature-only and directs approval of R1/both-site rehearsal. Current Next routes delegate to repaired legacy adapter; local candidate reports exist. R1 backup/rehearsal already dated complete only for its declared layer. Detached sibling website excluded by owner. Preserve historical failure, update current runbook pointer; do not claim deployed repair.',
  proposed: 'P3 first bounded work card in existing090: reconcile frozen candidate plus minimal browser/profile repair with exact served web/applied SQL/deployed Edge/config observations and required old/new-client/five-family/cache-header test mapping. Unknown targets stay NOT RUN and block promotion. At most3 actions: exact gap inventory; minimum convergence/test map; scoped recovery/review/operation packet. No bulk push, live writes, installs, rebuilds or fresh data export during this planning check.',
  controls: { bad: 'P2 simulator PASS means production revocation is fixed and P4 activation may start without current target/restore/review.', good: 'P1/P2 local acceptance supports entering P3 inventory only; old and new clients plus actual target/recovery/review still require evidence.' },
  provenance,
}, questions: {
  next: q('Which proposed next step follows this guide and known evidence?', { p3_inventory: 'Bounded P3 exact version and compatibility-gap inventory before recovery/review/activation', beta_now: 'Distribute beta now', new_feature: 'Add unrelated feature', unknown: 'Insufficient evidence' }),
  readiness: q('What readiness statement is supported?', { local_only: 'P1 source and P2 local acceptance sound, release/product gates open', release_ready: 'Ready for production', invalid_p2: 'Missing hosted tests invalidates bounded local P2', unknown: 'Cannot tell' }),
  runbook: q('How should the runbook discrepancy be handled?', { refresh_pointer: 'Update current pointer while keeping dated signature-only failure and old packet historical; do not claim hosted repair', erase_failure: 'Delete historical failed evidence', deploy: 'Deploy Edge immediately', unknown: 'Cannot tell' }),
  bad_control: q('Evaluate state.controls.bad only: is its evidence boundary acceptable?', { reject: 'Reject: simulator cannot establish provider/recovery/review', accept: 'Accept', unknown: 'Unknown' }),
  good_control: q('Evaluate state.controls.good only: is its boundary honest?', { honest: 'Local evidence separate from release gates', conflated: 'Not separate', unknown: 'Unknown' }),
} };
const body = JSON.stringify(packet);
assert(Buffer.byteLength(body) < 32000);
assert(!/apikey_|eyJ[A-Za-z0-9_-]+\./u.test(body));
assert(!fs.existsSync(out), 'Immutable output already exists');
const keys = new Set();
for await (const line of createInterface({ input: fs.createReadStream(metadata('01a0f6aa-6fb1-7e20-9aed-0a49f5a6d109').rollout_path), crlfDelay: Infinity })) {
  let row; try { row = JSON.parse(line); } catch { continue; }
  if (row.type !== 'response_item' || row.payload?.type !== 'message' || row.payload?.role !== 'user') continue;
  for (const item of row.payload.content ?? []) for (const m of (item.text ?? '').matchAll(/apikey_[a-f0-9]{20,80}_[a-f0-9]{64}/giu)) keys.add(m[0]);
}
assert.equal(keys.size, 1);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(out + '/request.json', JSON.stringify({ date: new Date().toISOString(), requestSha256: sha(body), packet }, null, 2), { flag: 'wx', mode: 0o600 });
const response = await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000), headers: { Authorization: 'Bearer ' + [...keys][0], 'Content-Type': 'application/json' }, body });
keys.clear(); assert(response.ok, 'Provider HTTP ' + response.status);
const result = await response.json(); assert.equal(result.model, packet.model);
for (const [id, question] of Object.entries(packet.questions)) {
  const answer = result.answers?.[id]; assert(answer?.type === 'choice' && Object.hasOwn(question.criteria, answer.choice));
  assert.deepEqual(Object.keys(answer.probabilities).sort(), Object.keys(question.criteria).sort());
  assert(Object.values(answer.probabilities).every(p => Number.isFinite(p) && p >= 0 && p <= 1));
  assert(Math.abs(Object.values(answer.probabilities).reduce((sum, p) => sum + p, 0) - 1) < .02);
}
assert(Number.isInteger(result.usage?.input_tokens) && Number.isInteger(result.usage?.output_tokens));
const record = { date: new Date().toISOString(), requestSha256: sha(body), ...result, estimatedUsd: result.usage.input_tokens * .042 / 1e6, pricing: 'https://docs.typesafe.ai/models; estimate not invoice', retries: 0 };
assert(record.estimatedUsd <= .02);
fs.writeFileSync(out + '/response.json', JSON.stringify(record, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ model: record.model, answers: record.answers, usage: record.usage, estimatedUsd: record.estimatedUsd }));
