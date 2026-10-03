import { require090WebViewConfig, validate090WebViewMetadata } from '../090_webview-config';

const env = { EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE: '1',
  EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: `header.${btoa(JSON.stringify({ iss: 'supabase-demo', role: 'anon' }))}.signature` };
const metadata = { userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  choirA: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', choirB: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  targetMember: 'dddddddd-dddd-dddd-dddd-dddddddddddd', fileId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  pdfSha256: 'a'.repeat(64), legacyUrl: 'http://127.0.0.1:18092/functions/v1/repertoire-file?fileId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee&ticket=synthetic_ticket' };

describe('090 actual WebView local guard', () => {
  it('accepts only synthetic local Auth and credential-free metadata', () => {
    expect(() => require090WebViewConfig(env)).not.toThrow();
    expect(validate090WebViewMetadata(metadata)).toEqual(metadata);
  });
  it('accepts an assignment version only under the explicitly selected assignment family', () => {
    expect(() => require090WebViewConfig({ ...env, EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY: 'assignment-file' })).not.toThrow();
    const assignment = { ...metadata, legacyUrl: metadata.legacyUrl.replace('repertoire-file', 'assignment-file') };
    expect(validate090WebViewMetadata(assignment, 'assignment-file')).toEqual(assignment);
    expect(() => validate090WebViewMetadata(assignment)).toThrow();
    expect(() => validate090WebViewMetadata(metadata, 'assignment-file')).toThrow();
  });
  it('admits legacy Next metadata only with explicit family and exact configured app URL', () => {
    expect(() => require090WebViewConfig({ ...env, EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY: 'legacy-next' })).not.toThrow();
    const legacy = { ...metadata, legacyUrl: `http://127.0.0.1:31090/api/drive-file/${metadata.fileId}?token=old.signature` };
    expect(validate090WebViewMetadata(legacy, 'legacy-next')).toEqual(legacy);
    expect(() => validate090WebViewMetadata(legacy)).toThrow();
    for (const url of [legacy.legacyUrl.replace('31090', '18092'), legacy.legacyUrl + '&extra=1',
      legacy.legacyUrl + '&token=duplicate.signature', legacy.legacyUrl + '#hash',
      legacy.legacyUrl.replace('old.signature', 'a.b.c'), legacy.legacyUrl.replace(metadata.fileId, 'different'),
      legacy.legacyUrl.replace('127.0.0.1', 'remote.invalid')]) {
      expect(() => validate090WebViewMetadata({ ...legacy, legacyUrl: url }, 'legacy-next')).toThrow();
    }
  });
  it.each([
    { EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE: '0' },
    { EXPO_PUBLIC_SUPABASE_URL: 'https://example.com' },
    { EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491/?secret=1' },
    { EXPO_PUBLIC_GENOVA_033_ACCEPTANCE: '1' }, { EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE: '1' },
    { EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO: '1' }, { EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY: 'chat-media-file' },
    { EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '1' }, { EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: '1' },
    { EXPO_PUBLIC_SUPABASE_ANON_KEY: 'not-a-local-JWT' },
    { EXPO_PUBLIC_SUPABASE_ANON_KEY: `h.${btoa(JSON.stringify({ iss: 'supabase-demo', role: 'service_role' }))}.s` },
  ])('refuses missing/hosted/privileged/conflicting configuration %#', patch => {
    expect(() => require090WebViewConfig({ ...env, ...patch })).toThrow();
  });
  it.each([
    { password: 'must not be metadata' }, { choirB: metadata.choirA }, { userId: 'invalid' },
    { pdfSha256: 'bad' }, { legacyUrl: metadata.legacyUrl.replace('127.0.0.1', 'example.com') },
    { legacyUrl: `${metadata.legacyUrl}&extra=1` },
  ])('refuses malformed/nonlocal fixture metadata %#', patch => {
    expect(() => validate090WebViewMetadata({ ...metadata, ...patch })).toThrow();
  });
});
