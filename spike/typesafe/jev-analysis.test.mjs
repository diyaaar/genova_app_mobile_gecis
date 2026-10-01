import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertPacket, validateResponse, requestMetadata } from './jev-analysis.mjs';

const packet = () => ({ model: 'jev-1.13.0', state: 'synthetic input', questions: {
  q: { type: 'choice', instructions: 'Which fits?', criteria: { fit: 'Fits', unknown: 'Not enough evidence' } },
} });
const response = () => ({ model: 'jev-1.13.0', usage: { input_tokens: 10, output_tokens: 5 },
  answers: { q: { type: 'choice', choice: 'fit', confidence: 0.8, probabilities: { fit: 0.9, unknown: 0.1 } } } });

test('retained provenance hashes public text but omits whole source documents', () => {
  const p = packet(); p.state = { introduction: 'Public prose one', coding_agents: 'Public prose two', project: 'redacted facts' };
  const metadata = requestMetadata(p);
  assert.equal(metadata.publicDocuments.length, 2);
  assert.deepEqual(metadata.state, { project: 'redacted facts' });
  assert.equal(JSON.stringify(metadata).includes('Public prose'), false);
  assert.match(metadata.requestSha256, /^[a-f0-9]{64}$/);
});

test('valid exact pilot packet and typed response pass without provider calls', () => {
  assert.doesNotThrow(() => assertPacket(packet()));
  assert.doesNotThrow(() => validateResponse(packet(), response()));
});
test('request model, byte bound, count and credential-like text fail closed', () => {
  const wrongModel = packet(); wrongModel.model = 'jev-latest'; assert.throws(() => assertPacket(wrongModel));
  const huge = packet(); huge.state = 'a'.repeat(24_001); assert.throws(() => assertPacket(huge));
  const count = packet(); for (let i = 0; i < 17; i++) count.questions[i] = count.questions.q;
  assert.throws(() => assertPacket(count));
  const secret = packet(); secret.state = 'apikey_' + 'a'.repeat(32) + '_' + 'b'.repeat(64);
  assert.throws(() => assertPacket(secret));
});
test('response must include exact question ids, model and integer usage', () => {
  for (const mutate of [r => { r.model = 'other'; }, r => { delete r.answers.q; },
    r => { r.usage.input_tokens = -1; }, r => { r.usage.output_tokens = 0.5; }]) {
    const r = response(); mutate(r); assert.throws(() => validateResponse(packet(), r));
  }
});
test('unknown labels, malformed probabilities and nonfinite/out-of-range confidence are rejected', () => {
  for (const mutate of [a => { a.choice = 'invented'; }, a => { a.confidence = NaN; },
    a => { a.confidence = 2; }, a => { a.probabilities.fit = 0.5; },
    a => { a.probabilities.unknown = -0.1; }]) {
    const r = response(); mutate(r.answers.q); assert.throws(() => validateResponse(packet(), r));
  }
});
