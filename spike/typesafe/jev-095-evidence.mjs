import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { assertPacket, validateResponse } from './jev-analysis.mjs';

const prefix = 'docs/reports/095/2026-10-01-jev';
const source = 'docs/reports/095/2026-10-01-browser.json';
const files = ['components/assignments/SubmissionFileLink.tsx', 'lib/korist-performance.ts',
  'tests/e2e/assignment-files.spec.ts', 'components/assignments/SubmissionFileLink.test.tsx'];
const sha = (text) => createHash('sha256').update(text).digest('hex');
export const expected = { version: 'supports', denial: 'supports', continuation: 'supports',
  identity: 'supports', legacy: 'supports', rls: 'contradicts', android: 'insufficient',
  hosted: 'contradicts', whole090: 'contradicts' };

export function buildPacket(browser, code, hashes) {
  if (browser.unexpected !== 0 || browser.passed !== 8 || browser.tests.length !== 8 ||
    browser.tests.some((test) => test.status !== 'expected') ||
    !code.includes('current_file_version_id') || !code.includes('isSwitchingChoir')) {
    throw Error('Actual passing browser/source evidence required');
  }
  const claims = {
    version: 'The current production chorist-detail web page chooses the immutable assignment version instead of its stale Drive link.',
    denial: 'The tested web UI exposes neither its private nor old Drive link when the synthetic online private HEAD returns403.',
    continuation: 'The tested chorist to assignment-detail continuation retains the version-backed link and native-bridge file metadata.',
    identity: 'The component uses source/actor/choir/member identity remounting and switching guards; focused mocked-boundary tests assert cancellation of late prior-context publication.',
    legacy: 'Legacy-only submissions still use their existing links, without issuing an unnecessary private-version request.',
    rls: 'These Chrome scenarios exercise genuine Supabase authentication and database row-level policies without intercepted responses.',
    android: 'This new assignment-version UI has passed the connected Android WebView Auth/RLS/Edge/private-byte integration.',
    hosted: 'This095 checkpoint deployed or modified live Supabase or Cloudflare storage.',
    whole090: 'The broader090 Android/iOS/hosted/release brief is complete and can close.',
  };
  const packet = { model: 'jev-1.13.0', state: { browser, sourceHashes: hashes, code,
    method: 'Actual local production Next build, installed Chrome with disposable profiles and desktop/mobile viewports. All remote HTTP intercepted with synthetic responses. Primary self-review and focused Vitest15/15 with actual hook but mocked Auth/ticket/cache boundaries. No actual database authorization proof or independent review.',
    limits: 'No new Android/iOS assignment runtime was run. Android connected assignment-version flow is the next090 checkpoint. No live schema/provider/deployment/account/data or external sharing.090 stays open; iOS and hosted/release gates remain pending.',
    policy: 'Jev is advisory only, never authorization or acceptance authority. Missing native observations mean unknown, not broken. Source/tests and primary engineering judgment own local acceptance.',
  }, questions: Object.fromEntries(Object.entries(claims).map(([id, claim]) => [id, {
    type: 'choice', instructions: `How does the supplied evidence relate to this exact claim: ${claim}`,
    criteria: { supports: 'The exact claim is established within its stated source/test scope.',
      contradicts: 'Explicit source, method or action contradicts the claim; an unrun test alone is not contradiction.',
      insufficient: 'The behavior has not been observed; missing runtime evidence does not establish opposite behavior.' },
  }])) };
  assertPacket(packet);
  return packet;
}

async function sourceState() {
  const raw = await readFile(source, 'utf8');
  const sources = await Promise.all(files.map(async (path) => ({ path, text: await readFile(path, 'utf8') })));
  const hashes = { browser: sha(raw), ...Object.fromEntries(sources.map(({ path, text }) => [path, sha(text)])) };
  // Supply the actual component and narrow projection; no whole-repository or secret upload.
  const component = sources[0].text;
  const projection = sources[1].text.split('\n').slice(576, 595).join('\n');
  return { browser: JSON.parse(raw), hashes, code: `${component}\nPerformance submission projection:\n${projection}` };
}

async function prepare() {
  const { browser, hashes, code } = await sourceState();
  const packet = buildPacket(browser, code, hashes);
  await writeFile(`${prefix}-request.json`, JSON.stringify({ packet, requestSha256: sha(JSON.stringify(packet)) }, null, 2), { flag: 'wx' });
  await writeFile(`${prefix}-labels.json`, JSON.stringify({ expected, labelOwner: 'Primary agent frozen before inference; not independent.' }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ status: 'PREPARED', questions: 9, bytes: Buffer.byteLength(JSON.stringify(packet)), maxCalls: 1, retries: 0 }));
}

async function evaluate() {
  if (new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }) !== '2026-10-01') throw Error('Today-only authority expired');
  const saved = JSON.parse(await readFile(`${prefix}-request.json`, 'utf8'));
  const { packet } = saved; assertPacket(packet);
  const current = await sourceState();
  if (sha(JSON.stringify(packet)) !== saved.requestSha256 || JSON.stringify(current.hashes) !== JSON.stringify(packet.state.sourceHashes)) throw Error('Evidence drift');
  if (!process.stdin.isTTY) throw Error('Non-echoing private TTY input required');
  // Reserve once before reading the secret or sending; uncertain attempts never retry.
  await writeFile(`${prefix}-attempt.json`, JSON.stringify({ timestamp: new Date().toISOString(), requestSha256: saved.requestSha256 }, null, 2), { flag: 'wx' });
  const reader = createInterface({ input: process.stdin });
  let key = (await reader.question('Private key input: ')).trim(); reader.close();
  if (!/^apikey_[a-f0-9]{20,80}_[a-f0-9]{64}$/iu.test(key)) throw Error('Secret shape');
  const started = performance.now();
  const response = await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', redirect: 'error',
    signal: AbortSignal.timeout(45_000), headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(packet) });
  key = '';
  if (!response.ok) throw Error('Provider failed; no retry');
  const raw = await response.text(); if (Buffer.byteLength(raw) > 1_048_576) throw Error('Response bound');
  const result = JSON.parse(raw); validateResponse(packet, result);
  const record = { timestamp: new Date().toISOString(), requestSha256: saved.requestSha256,
    elapsedMs: Math.round(performance.now() - started), model: result.model, usage: result.usage,
    estimatedUsd: result.usage.input_tokens * 0.042 / 1_000_000, answers: result.answers };
  await writeFile(`${prefix}-response.json`, JSON.stringify(record, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(record));
  if (record.estimatedUsd > 0.002) throw Error('Cost cap exceeded; stop');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (process.argv[2] === '--prepare' ? prepare() : process.argv[2] === '--evaluate' ? evaluate() : Promise.reject(Error('Action')))
    .catch(() => { console.error('095 Jev stopped safely; no retry or printed secrets'); process.exitCode = 1; });
}
