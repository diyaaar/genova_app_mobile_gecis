import { describe, expect, it } from 'vitest';
import { assertLegacyWebViewReads, legacyWebViewEvidenceTarget } from './091_legacy_webview_fixture';
const env = { API_URL: 'http://127.0.0.1:54491', GENOVA_090_ANDROID_WEBVIEW: '1', GENOVA_090_LEGACY_WEBVIEW_PLATFORM: 'ios' };
const reads = [
  { method: 'GET', status: 401, providerDelta: 0 }, { method: 'GET', status: 401, providerDelta: 0 },
  { method: 'HEAD', status: 401, providerDelta: 0 }, { method: 'POST', status: 200, providerDelta: 0 },
  { method: 'GET', status: 200, providerDelta: 1 }, { method: 'HEAD', status: 403, providerDelta: 0 },
];
describe('legacy permanent WebView immutable iOS evidence', () => {
  it('retains unselected historical behavior and fixes one isolated iOS target', () => {
    expect(legacyWebViewEvidenceTarget({})).toBeNull();
    expect(legacyWebViewEvidenceTarget(env)).toEqual({ platform: 'ios', path: 'docs/reports/090/connected-ios-legacy-webview-http.json' });
  });
  it.each([
    { GENOVA_090_LEGACY_WEBVIEW_PLATFORM: 'android' }, { GENOVA_090_LEGACY_WEBVIEW_PLATFORM: '../ios' },
    { API_URL: 'https://example.com' }, { GENOVA_090_ANDROID_WEBVIEW: '0' },
    { GENOVA_090_ANDROID_ASSIGNMENT_WEBVIEW: '1' }, { GENOVA_090_CONNECTED_ANDROID_AUDIO: '1' },
    { GENOVA_090_ANDROID_PDF_RECOVERY: '1' }, { GENOVA_090_WEBVIEW_PLATFORM: 'ios' },
  ])('rejects hosted or ambiguous selection %#', patch => {
    expect(() => legacyWebViewEvidenceTarget({ ...env, ...patch })).toThrow();
  });
  it('requires denied baseline/body/HEAD, exactly one renewal/body and B refusal without storage', () => {
    expect(() => assertLegacyWebViewReads(reads)).not.toThrow();
    for (let index = 0; index < reads.length; index++) {
      expect(() => assertLegacyWebViewReads(reads.filter((_, i) => i !== index))).toThrow();
    }
    expect(() => assertLegacyWebViewReads([...reads, reads[3]])).toThrow();
    expect(() => assertLegacyWebViewReads(reads.map(row => row.status >= 400 ? { ...row, providerDelta: 1 } : row))).toThrow();
  });
});
