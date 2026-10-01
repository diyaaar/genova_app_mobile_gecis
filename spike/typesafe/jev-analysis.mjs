import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { performance } from 'node:perf_hooks';

const OUTPUT = 'docs/reports/jev-analysis';
const RAW = 'spike/typesafe/build/requests';
const MODEL = 'jev-1.13.0';
const PRICE_PER_MILLION = 0.042;
const sha = value => createHash('sha256').update(value).digest('hex');
const choice = (instructions, criteria) => ({ type: 'choice', instructions, criteria });

/** Keep public-document provenance, not entire third-party pages, in Git evidence. */
export function requestMetadata(packet) {
  const { introduction, coding_agents, ...projectState } = packet.state;
  return { model: packet.model, requestSha256: sha(JSON.stringify(packet)),
    requestBytes: Buffer.byteLength(JSON.stringify(packet)),
    publicDocuments: [
      ...(introduction ? [{ url: 'https://docs.typesafe.ai/introduction.md', sha256: sha(introduction) }] : []),
      ...(coding_agents ? [{ url: 'https://docs.typesafe.ai/introduction/coding-agents.md', sha256: sha(coding_agents) }] : []),
    ], state: projectState, questions: packet.questions,
    limit: 'Public document bodies are not retained in this record. Original hash/URL identify fetched version; current upstream can change.' };
}
const expected = {
  output: 'typed_judgments', repository: 'prepared_context', code: 'coding_agent',
  analysis: 'atomic_questions', relevance: 'choice', proof: 'execution_required',
};
const candidates = {
  migration_parity: 'Compare one web behavior description with its native counterpart and decide whether an invariant is preserved; humans supply source excerpts and run tests.',
  evidence_match: 'Select which dated source/test excerpt supports a brief acceptance claim, with unsupported/no-match choices; do not declare a test passed.',
  failure_triage: 'Route redacted test failure text to a likely owner/layer, including unknown; an engineer reproduces and confirms the diagnosis.',
  documentation_drift: 'Flag narrative contradictions between dated briefs, current source summaries and the approved migration plan; current source/owner decides.',
  authorized_search: 'Rank textual repertoire or help-document candidates already fetched under deterministic tenant authorization; no new data access.',
  repertoire_matching: 'Select a likely equivalent work/title/composer from code-prepared candidate metadata; deterministic normalization handles exact matches; ambiguous merges need human approval.',
  access_authority: 'Replace DB Auth/RLS/role/membership checks with a model confidence judgment that directly grants Choir B file access to a Choir A actor.',
  binary_validation: 'Ask Jev itself to inspect PDF pixels, singer audio, stylus pressure or actual native rendering without preprocessing or platform tests.',
};

export function assertPacket(packet) {
  const serialized = JSON.stringify(packet);
  if (Buffer.byteLength(serialized) > 24_000 || Object.keys(packet.questions).length > 16 ||
      packet.model !== MODEL || /apikey_[a-f0-9]{20,}|Bearer\s+eyJ|-----BEGIN.*PRIVATE KEY/iu.test(serialized)) {
    throw new Error('Packet bound or redaction guard failed');
  }
  for (const q of Object.values(packet.questions)) {
    if (q.type !== 'choice' || typeof q.instructions !== 'string' || !q.criteria ||
        !Object.keys(q.criteria).length) throw new Error('Unsupported pilot question');
  }
}

export function validateResponse(packet, response) {
  if (response.model !== MODEL || !response.answers || !response.usage ||
      !Number.isInteger(response.usage.input_tokens) || response.usage.input_tokens < 0 ||
      !Number.isInteger(response.usage.output_tokens) || response.usage.output_tokens < 0 ||
      Object.keys(response.answers).sort().join() !== Object.keys(packet.questions).sort().join()) {
    throw new Error('Invalid response envelope');
  }
  for (const [id, q] of Object.entries(packet.questions)) {
    const a = response.answers[id]; const keys = Object.keys(q.criteria);
    const distribution = Object.values(a.probabilities ?? {});
    if (a.type !== 'choice' || !keys.includes(a.choice) || !Number.isFinite(a.confidence) ||
        a.confidence < 0 || a.confidence > 1 || keys.sort().join() !== Object.keys(a.probabilities ?? {}).sort().join() ||
        distribution.some(v => !Number.isFinite(v) || v < 0 || v > 1) ||
        Math.abs(distribution.reduce((sum, v) => sum + v, 0) - 1) > 0.02) {
      throw new Error('Invalid typed answer');
    }
  }
}

async function publicDoc(path) {
  const response = await fetch(`https://docs.typesafe.ai/${path}.md`, {
    signal: AbortSignal.timeout(15_000), redirect: 'error',
  });
  if (!response.ok) throw new Error('Public docs unavailable');
  const text = await response.text();
  if (Buffer.byteLength(text) > 16_000) throw new Error('Public doc exceeds pilot bound');
  return { url: `https://docs.typesafe.ai/${path}.md`, sha256: sha(text), text };
}

async function prepare() {
  const introduction = await publicDoc('introduction');
  const coding = await publicDoc('introduction/coding-agents');
  const stage1 = { model: MODEL, state: { introduction: introduction.text, coding_agents: coding.text },
    questions: {
      output: choice('According to the provided documentation, what does Jev output?', {
        typed_judgments: 'Typed choices/scores/probabilities.', generated_report: 'A free-form report or generated code.', unknown: 'Not established.' }),
      repository: choice('How can Jev examine repository behavior according to the documentation?', {
        prepared_context: 'Code or a coding agent supplies relevant evidence as state.', autonomous_tools: 'Jev itself browses the filesystem and runs shell tools.', unknown: 'Not established.' }),
      code: choice('Who writes and edits application code in the documented workflow?', {
        coding_agent: 'The external LLM coding agent or engineer.', jev_itself: 'Jev replaces the code-writing agent.', unknown: 'Not established.' }),
      analysis: choice('How should a broad migration analysis needing several independent judgments use Jev?', {
        atomic_questions: 'Separate narrow questions, then combine their results in code.', generated_essay: 'Ask Jev to generate one long reasoning essay.', unknown: 'Not established.' }),
      relevance: choice('Which documented primitive selects one relevant source candidate from a defined list?', {
        choice: 'Choice.', score: 'Score.', noul: 'Noul.', unknown: 'Not established.' }),
      proof: choice('Can a Jev decision that a test claim sounds supported replace actually executing the native test?', {
        execution_required: 'No; execution and its evidence remain external.', model_proof: 'Yes; model confidence proves the test ran.', unknown: 'Not established.' }),
    } };
  const paths = ['MIGRATION.md', 'AGENTS.md', 'docs/agent-handoff.md',
    'lib/choir-context-core.ts', 'lib/repertuvar/annotation-types.ts',
    'apps/mobile/src/repertoire/reader-gateway.ts', 'lib/korist-performance.ts',
    'app/(main)/koristler/[id]/page.tsx'];
  const refs = await Promise.all(paths.map(async path => ({ path, sha256: sha(await readFile(path)) })));
  const facts = {
    stack: 'Next.js/React/TypeScript web and React Native/Expo native product in one repository; Supabase Auth/Postgres/RLS/Edge/Realtime; private file migration away from Drive.',
    ownership: 'Auth/shell/repertoire/chat/homework/home are native targets. Announcements/choristers/profile/attendance are permanent WebView; do not rewrite them as native.',
    invariants: 'Platform-free TypeScript active-choir/annotation contracts are shared. Session/choir/member/role authority and file access stay deterministic in DB/Edge. No AI authorization.',
    evidence: 'Dated briefs distinguish local SQL/HTTP/Chrome/emulator checks from hosted/provider/physical-device/release gates; self-review is not independent review.',
    current_gap: 'The korist-performance submission select lacks current_file_version_id, while HomeworkCard prefers a legacy drive_web_view_link. This is a known integration follow-up, not model-discovered evidence.',
    owner_choice: 'React Native/Expo retained; Flutter is only a comparison alternative. Human architecture ownership unchanged.',
    scope: 'Development decision support first; no provider integration or sending choir/user data. Recommendations must survive source/test/human checks.',
  };
  const criteria = {
    candidate_selection: 'Useful semantic selection among code-prepared options; prototype with Choice and a no-match option.',
    evidence_verification: 'Useful bounded semantic consistency or claim verification; prototype with Noul per assertion and human/test confirmation.',
    graded_ranking: 'Useful graded semantic ranking; prototype with explicit Score dimensions and evaluate thresholds.',
    deterministic_only: 'Known exact rule, access authority, or non-text/platform verification; use deterministic code/tests, not Jev inference.',
    insufficient_evidence: 'Evidence is too limited or this candidate cannot usefully fit the supported primitives.',
  };
  const questions = {};
  for (const [id, description] of Object.entries(candidates)) {
    questions[id] = choice(`Given the documented capabilities, project facts and this candidate: ${description}\nWhich approach best fits this bounded task? Do not evaluate facts missing from the supplied state.`, criteria);
  }
  const stage2 = { model: MODEL, state: { introduction: introduction.text,
    project: facts, source_references: refs, candidates }, questions };
  assertPacket(stage1); assertPacket(stage2);
  await mkdir(OUTPUT, { recursive: true });
  await mkdir(RAW, { recursive: true });
  for (const [stage, packet] of [['stage1', stage1], ['stage2', stage2]]) {
    await writeFile(`${RAW}/${stage}.json`, JSON.stringify(packet, null, 2), { flag: 'wx' });
    await writeFile(`${OUTPUT}/2026-10-01-${stage}-request.json`, JSON.stringify(requestMetadata(packet), null, 2), { flag: 'wx' });
  }
  console.log(JSON.stringify({ status: 'PREPARED', model: MODEL,
    requestBytes: [stage1, stage2].map(p => Buffer.byteLength(JSON.stringify(p))),
    questions: [6, 8], maxEvaluationCalls: 2, autoRetries: 0, docs: [introduction.sha256, coding.sha256] }));
}

async function evaluate() {
  let key = process.env.TYPESAFE_API_KEY;
  if (!key) {
    if (!process.stdin.isTTY) throw new Error('Private environment or non-echoing key input required');
    const reader = createInterface({ input: process.stdin });
    key = (await reader.question('Private key input (no echo): ')).trim(); reader.close();
  }
  // Provider owns key validity; do not invent an undocumented exact prefix length.
  if (key.length > 256 || !/^apikey_[a-f0-9]{20,80}_[a-f0-9]{64}$/iu.test(key)) throw new Error('Invalid key shape');
  for (const stage of ['stage1', 'stage2']) {
    const packet = JSON.parse(await readFile(`${RAW}/${stage}.json`, 'utf8'));
    assertPacket(packet);
    // Reserve this stage before sending: even an interrupted/failed call cannot be
    // blindly repeated by rerunning the pilot. No key/header enters the ledger.
    await writeFile(`${OUTPUT}/2026-10-01-${stage}-attempt.json`, JSON.stringify({
      timestamp: new Date().toISOString(), model: MODEL, requestSha256: sha(JSON.stringify(packet)),
    }, null, 2), { flag: 'wx' });
    const started = performance.now();
    const response = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45_000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    });
    if (!response.ok) throw new Error(`Provider HTTP ${response.status}; no retry`);
    const text = await response.text();
    if (Buffer.byteLength(text) > 1_048_576) throw new Error('Response exceeds bound');
    const result = JSON.parse(text); validateResponse(packet, result);
    const evidence = { timestamp: new Date().toISOString(), requestSha256: sha(JSON.stringify(packet)),
      elapsedMs: Math.round(performance.now() - started), model: result.model,
      usage: result.usage, estimatedUsd: result.usage.input_tokens * PRICE_PER_MILLION / 1_000_000,
      answers: result.answers };
    await writeFile(`${OUTPUT}/2026-10-01-${stage}-response.json`, JSON.stringify(evidence, null, 2), { flag: 'wx' });
    console.log(JSON.stringify({ stage, ...evidence }));
    if (stage === 'stage1' && Object.entries(expected).some(([id, answer]) => result.answers[id].choice !== answer)) {
      throw new Error('Introduction control failure; stage2 not sent');
    }
    if (evidence.estimatedUsd > 0.005) throw new Error('Cost guard; stop after this call');
  }
  key = '';
}

if (process.argv[1]?.endsWith('/jev-analysis.mjs')) {
  const action = process.argv[2];
  (action === '--prepare' ? prepare() : action === '--evaluate' ? evaluate()
    : Promise.reject(new Error('Use --prepare or --evaluate'))).catch(error => {
    // Never print request headers, key, raw non-success provider body or nested cause.
    console.error(/^(Provider HTTP|Introduction control failure|Cost guard)/u.test(error.message)
      ? error.message : 'Pilot stopped safely; inspect local preparation/response schema');
    process.exitCode = 1;
  });
}
