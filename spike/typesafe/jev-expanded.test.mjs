import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPackets, buildFollowUps, buildCodeSearch, searchLabels, assertExpandedPacket, validateExpandedResponse, lexicalBaseline } from './jev-expanded.mjs';
import { assertPacket } from './jev-analysis.mjs';
import { evidenceCases, productCases, triageCases } from './jev-expanded-cases.mjs';

test('fixed six packets respect count/model/byte guards', () => {
  const stages = buildPackets(); assert.equal(stages.length, 6);
  assert.deepEqual(stages.map(s => Object.keys(s.packet.questions).length), [10, 10, 10, 10, 8, 6]);
  for (const { packet } of stages) assert.doesNotThrow(() => assertPacket(packet));
});
test('offline labels never enter model packet; each evidence question targets its own pair', () => {
  for (const { packet } of buildPackets()) assert.equal(JSON.stringify(packet).includes('"expected"'), false);
  const p = buildPackets()[1].packet;
  assert.match(p.questions.e11.instructions, /source_material\[0\]/);
  assert.match(p.questions.e20.instructions, /source_material\[9\]/);
});
test('unique frozen ids, three evidence outcomes and absence/ambiguity controls', () => {
  const all = [...evidenceCases, ...productCases, ...triageCases];
  assert.equal(new Set(all.map(c => c.id)).size, all.length);
  assert.equal(evidenceCases.length, 20);
  assert.deepEqual([...new Set(evidenceCases.map(c => c.expected))].sort(), ['contradicts', 'insufficient', 'supports']);
  for (const c of productCases) assert.ok(c.expected in c.candidates);
  assert.equal(productCases.find(c => c.id === 'p04').expected, 'no_match');
});
test('comparison baseline is deterministic, including its known negation weakness', () => {
  assert.equal(lexicalBaseline({ claim: 'native iOS audio passed', evidence: 'native iOS audio has not passed' }), 'supports');
  assert.equal(lexicalBaseline({ claim: 'hosted release', evidence: 'synthetic fixture' }), 'insufficient');
});

test('fixed comparison uses same product cases, explicit authority order and separate Noul support dimension', () => {
  const followup = buildFollowUps(); assert.equal(followup.length, 3);
  assert.deepEqual(Object.keys(followup[0].packet.questions), productCases.map(c => c.id));
  assert.match(followup[1].packet.state.authoritative_order, /NEXT ready local/);
  for (const { packet } of followup) assert.doesNotThrow(() => assertExpandedPacket(packet));
  for (const { packet } of followup) assert.equal(JSON.stringify(packet).includes('"expected"'), false);
});

test('typed Noul response validates exact envelope and rejects NaN/range/missing/unknown types', () => {
  const p = buildFollowUps()[2].packet;
  const result = { model: p.model, usage: { input_tokens: 1, output_tokens: 1 },
    answers: Object.fromEntries(Object.keys(p.questions).map(id => [id, { type: 'noul', noul: 0.5 }])) };
  assert.doesNotThrow(() => validateExpandedResponse(p, result));
  for (const v of [NaN, -0.1, 1.1]) {
    const r = structuredClone(result); r.answers.e01.noul = v;
    assert.throws(() => validateExpandedResponse(p, r));
  }
  const missing = structuredClone(result); delete missing.answers.e01;
  assert.throws(() => validateExpandedResponse(p, missing));
  const wrong = structuredClone(p); wrong.questions.e01.type = 'score';
  assert.throws(() => assertExpandedPacket(wrong));
});

test('code search is seven bounded verbatim candidates with two absence controls, labels offline', async () => {
  const [{ packet }] = await buildCodeSearch(); assertExpandedPacket(packet);
  assert.equal(packet.state.source_candidates.length, 7);
  assert.equal(Object.keys(packet.questions).length, 9);
  assert.equal(JSON.stringify(packet).includes('"expected"'), false);
  for (const c of packet.state.source_candidates) {
    assert.equal(c.text.split('\n').length, c.last - c.first + 1);
    assert.match(c.sourceSha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(searchLabels.s08, 'no_match'); assert.equal(searchLabels.s09, 'no_match');
});
