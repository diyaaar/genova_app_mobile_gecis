import assert from 'node:assert/strict';

/** Opt-in immutable iOS evidence; preserves the historical unselected legacy fixture. */
export function legacyWebViewEvidenceTarget(env: Record<string, string | undefined>) {
  if (env.GENOVA_090_LEGACY_WEBVIEW_PLATFORM === undefined) return null;
  assert.equal(env.GENOVA_090_LEGACY_WEBVIEW_PLATFORM, 'ios', 'Only the pending iOS legacy gate is selected');
  assert.equal(env.GENOVA_090_ANDROID_WEBVIEW, '1');
  assert.equal(env.API_URL, 'http://127.0.0.1:54491');
  for (const flag of ['GENOVA_090_ANDROID_ASSIGNMENT_WEBVIEW', 'GENOVA_090_CONNECTED_ANDROID_AUDIO',
    'GENOVA_090_ANDROID_PDF_RECOVERY']) assert.notEqual(env[flag], '1', 'Legacy evidence requires one isolated consumer');
  assert.equal(env.GENOVA_090_WEBVIEW_PLATFORM, undefined, 'Assignment platform selector is not legacy authority');
  return { platform: 'ios', path: 'docs/reports/090/connected-ios-legacy-webview-http.json' };
}

/** The unchanged legacy Android matrix, now reusable for explicit iOS evidence. */
export function assertLegacyWebViewReads(reads: Array<{ method: string; status: number; providerDelta: number }>) {
  assert.ok(reads.filter(row => row.method === 'GET' && row.status === 401).length >= 2, 'baseline and repaired old body refusals missing');
  assert.equal(reads.filter(row => row.method === 'POST' && row.status === 200).length, 1, 'recovery must issue exactly one fresh ticket');
  assert.equal(reads.filter(row => row.method === 'HEAD' && row.status === 401).length, 1);
  assert.equal(reads.filter(row => row.method === 'GET' && row.status === 200).length, 1);
  assert.equal(reads.filter(row => row.method === 'HEAD' && row.status === 403).length, 1);
  for (const row of reads.filter(row => row.status >= 400)) assert.equal(row.providerDelta, 0);
}
