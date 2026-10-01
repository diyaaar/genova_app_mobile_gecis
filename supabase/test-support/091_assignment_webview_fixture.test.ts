import { describe, expect, it } from 'vitest';
import { assignmentWebViewMode, assignmentVersionSeed, assertAssignmentWebViewReads } from './091_assignment_webview_fixture';
const env = { GENOVA_090_ANDROID_ASSIGNMENT_WEBVIEW: '1', GENOVA_090_ANDROID_WEBVIEW: '1', API_URL: 'http://127.0.0.1:54491' };
const seed = { choirId: '11111111-1111-4111-8111-111111111111', assignmentId: '22222222-2222-4222-8222-222222222222',
  memberId: '33333333-3333-4333-8333-333333333333', submissionId: '44444444-4444-4444-8444-444444444444',
  versionId: '55555555-5555-4555-8555-555555555555', bucket: 'genova-private', bytes: 65905, sha256: 'a'.repeat(64) };
const reads = [{ method: 'POST', status: 200, providerDelta: 0 }, { method: 'HEAD', status: 200, providerDelta: 1 },
  { method: 'GET', status: 200, providerDelta: 1 }, { method: 'HEAD', status: 403, providerDelta: 0 },
  { method: 'GET', status: 403, providerDelta: 0 }];
describe('assignment-version fixture authority/evidence guards', () => {
  it('preserves the old consumer unless explicitly enabled', () => {
    expect(assignmentWebViewMode({})).toBe(false); expect(assignmentWebViewMode(env)).toBe(true);
  });
  it.each([{ GENOVA_090_ANDROID_WEBVIEW: '0' }, { API_URL: 'https://example.com' },
    { GENOVA_090_CONNECTED_ANDROID_AUDIO: '1' }, { GENOVA_090_ANDROID_PDF_RECOVERY: '1' }])('rejects ambiguous or hosted mode %#', patch => {
    expect(() => assignmentWebViewMode({ ...env, ...patch })).toThrow();
  });
  it('seeds immutable ownership/current pointer while retaining the stale URL negative control', () => {
    const result = assignmentVersionSeed(seed);
    expect(result.key).toBe(`choirs/${seed.choirId}/assignments/${seed.assignmentId}/submissions/${seed.versionId}/content`);
    expect(result.sql).toContain(`current_file_version_id='${seed.versionId}'`);
    expect(result.sql).not.toContain('drive_web_view_link');
  });
  it.each([{ choirId: "bad'" }, { sha256: 'bad' }, { bucket: "bad'" }, { bytes: 0 }])('refuses malformed synthetic SQL inputs %#', patch => {
    expect(() => assignmentVersionSeed({ ...seed, ...patch })).toThrow();
  });
  it('requires actual body/head and post-switch refusal without storage access', () => {
    expect(() => assertAssignmentWebViewReads(reads)).not.toThrow();
    expect(() => assertAssignmentWebViewReads(reads.slice(0, 3))).toThrow();
    expect(() => assertAssignmentWebViewReads([...reads, reads[0]])).toThrow();
    expect(() => assertAssignmentWebViewReads(reads.map(row => row.status === 403 ? { ...row, providerDelta: 1 } : row))).toThrow();
  });
});
