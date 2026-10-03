// One advisory claim-boundary review; no private rows/logs/full repository/chat export.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { metadata } from './conversation-audit.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');
const out = 'docs/reports/090/p3-inventory-review';
const provenance = ['docs/reports/090/2026-10-03-p3-entry-inventory.json',
  'hooks/useProtectedDriveFileUrl.ts', 'lib/drive-file-url.ts',
  'components/assignments/SubmissionFileLink.tsx', 'lib/repertuvar/cache.ts',
  'lib/repertuvar/offline.ts', 'components/FloatingMiniPlayer.tsx',
  'components/repertuvar/RepertoireWorkspace.tsx',
  'supabase/test-support/090_candidate_native_interactive.mjs',
  'supabase/test-support/090_legacy_release_contract.test.mjs',
  'supabase/test-support/090_legacy_client_recovery.test.mjs',
].map(file => ({ file, sha256: sha(fs.readFileSync(file)) }));
const q = (instructions, criteria) => ({ type: 'choice', instructions, criteria });
const packet = { model: 'jev-1.13.0', state: {
  purpose: 'Review proposed evidence interpretation and next bounded work for P3 compatible release inventory. Typed advice only; cannot authorize release, grant access, verify unseen systems or replace independent review.',
  facts: {
    sources: '610 frozen product hashes still match. P2 agent iOS acceptance is exact426-file profile fixture plus157native/5server, not full source. Full candidate exposes native chat/repertoire and four permanent WebViews.',
    web: 'Correct signed-in Vercel visible Production Deployment Ready/main/source a13f696; remote main also a13f696. Exact deployment ID retained locally. Actual HTTP/Auth flow not exercised. Fresh deterministic tests of actual a13f696 code with synthetic signature/provider responses show old GET and HEAD200, provider2, current-authority0; old loader retains denied URL and old audio falls back to direct raw URL. Five passing tests assert those failures; not production-security PASS.',
    db: 'Correct Supabase production visible migration ledger has15 of25 candidate forward IDs;10 not visible including new actor/legacy authority and profile/privilege fixes. No SQL body/catalog/ACL/policy checked. Manual DDL could exist without ledger rows; absence is not proof of absent definitions. Mandatory correct-project Supabase connector unavailable; cannot substitute another connector or browser SQL.',
    edge: 'Correct visible Supabase list has21slugs; candidate20. legacy-file, link-preview and account-recovery-006 not visible. Four retained extras not deleted. Relative age and Deployments1 count are NOT numeric version or source checksum. Exact deployed versions/config/source unknown.',
    hook: 'Full current useProtectedDriveFileUrl.ts useEffect calls getOnlineAuthorizedPrivateFileUrl(loadTicketUrl) unconditionally at line143. Actual helper performs HEAD probe. P2 fixture helper withDeferredNativeProbe instead checks isEmbeddedRuntimeActive and skips probe there until native owns consent/read. Source-confirmed mismatch; not yet reproduced on full candidate device. Existing hook unit mock turns helper into load-only and cannot establish actual HEAD behavior.',
    presentGuards: 'Current cache.ts and offline.ts already check isEmbeddedRuntimeActive;18fresh capability/embedded tests PASS. Current SubmissionFileLink already emits data-genova-file-name/mime-type, via different refactored component. Must not blindly reapply old fixture overlay.',
    logs: 'Full player source console.error interpolates audio element el.src in MiniPlayer211 and Workspace842. Protected URL could contain capability token; no secret values exported or actual token leakage observed.',
  },
  proposed: 'Preserve local P2 acceptance but block inference to full release. Record missing full embedded hook convergence, redact raw URL logs before promotion, retain already-present cache/offline/file-label behavior and test it. Complete exact correct-project SQL/Edge metadata then protected restore/full actual Next/Auth/RLS old-new-mixed five-family and cache-header/native persistence rehearsal. No live writes/deploy/bulk main push during inventory.',
  controls: { bad: 'All5 old-source tests pass, so production already enforces revocation and can be activated.', good: 'Visible ledger/slugs justify specific gaps and further read-only verification, not exact catalog/source equivalence.' }, provenance,
}, questions: {
  fixture: q('Does the supplied P2 evidence establish full-source pre-consent HEAD0?', { no: 'No: source differs; preserve scoped P2 and require full-source convergence/retest', yes: 'Yes: same project is enough', unknown: 'Cannot determine' }),
  ledger: q('What claim does visible migration-ledger absence support?', { metadata_gap: 'Not in observed ledger; actual definitions and SQL checksums unverified', absent_definition: 'Definitely absent from live DB', equivalent: 'Candidate and live are equivalent', unknown: 'Cannot determine' }),
  next: q('Which bounded next path best addresses supplied evidence without exceeding authority?', { converge_and_verify: 'Exact current-target verification plus narrow full-source hook/log convergence before compatibility/recovery review', activate: 'Activate storage now', repeat_p2: 'Repeat unchanged426-file P2 fixture and accept full product', unrelated: 'Start unrelated feature', unknown: 'No fit/insufficient facts' }),
  bad_control: q('Is the assertion in state.controls.bad supported?', { reject: 'Reject: tests assert unsafe old behavior, not safety', supported: 'Supported', unknown: 'Cannot tell' }),
  good_control: q('Is the assertion in state.controls.good supported?', { supported: 'Supported with stated limits', reject: 'Not supported', unknown: 'Cannot tell' }),
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
assert.deepEqual(Object.keys(result.answers).sort(), Object.keys(packet.questions).sort());
for (const [id, question] of Object.entries(packet.questions)) {
  const answer = result.answers[id]; assert(answer?.type === 'choice' && Object.hasOwn(question.criteria, answer.choice));
  assert.deepEqual(Object.keys(answer.probabilities).sort(), Object.keys(question.criteria).sort());
  assert(Object.values(answer.probabilities).every(p => Number.isFinite(p) && p >= 0 && p <= 1));
  assert(Number.isFinite(answer.confidence) && answer.confidence >= 0 && answer.confidence <= 1);
  assert(Math.abs(Object.values(answer.probabilities).reduce((sum, p) => sum + p, 0) - 1) < .02);
}
assert(Number.isInteger(result.usage?.input_tokens) && Number.isInteger(result.usage?.output_tokens));
const record = { date: new Date().toISOString(), requestSha256: sha(body), ...result, estimatedUsd: result.usage.input_tokens * .042 / 1e6, pricing: 'https://docs.typesafe.ai/models; estimate not invoice', retries: 0 };
assert(record.estimatedUsd <= .02);
fs.writeFileSync(out + '/response.json', JSON.stringify(record, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ model: record.model, answers: record.answers, usage: record.usage, estimatedUsd: record.estimatedUsd }));
