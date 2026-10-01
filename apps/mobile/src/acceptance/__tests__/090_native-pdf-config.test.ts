import { observed090PdfUrl, read090PdfConfig, validate090PdfFixture } from '../090_native-pdf-config';

const env = { EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE: '1',
  EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-public-anon' };
const fixture = { email: 'shared-091-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa@example.invalid',
  password: 'a'.repeat(32), choirA: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  choirB: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', fileId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  pdfSha256: 'a'.repeat(64),
  legacyUrl: 'http://127.0.0.1:8000/?fileId=cccccccc-cccc-cccc-cccc-cccccccccccc&ticket=synthetic-signed-ticket' };

describe('090 native PDF isolated runtime input', () => {
  it('accepts explicit local public configuration without build credentials', () => {
    expect(read090PdfConfig(env)).toEqual({ endpoint: 'http://127.0.0.1:8000',
      fixtureUrl: 'http://127.0.0.1:18092/090/android-fixture' });
    expect(validate090PdfFixture(fixture)).toEqual(fixture);
  });
  it.each([
    { EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE: '0' },
    { EXPO_PUBLIC_SUPABASE_URL: 'https://example.com' },
    { EXPO_PUBLIC_SUPABASE_URL: 'http://user:secret@127.0.0.1:54491' },
    { EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491/?unexpected=1' },
    { EXPO_PUBLIC_SUPABASE_ANON_KEY: '' },
    { EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: '1' },
    { EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '1' },
  ])('refuses hosted/conflicting configuration %#', patch => {
    expect(() => read090PdfConfig({ ...env, ...patch })).toThrow();
  });
  it.each([
    { email: 'real@example.com' }, { password: '' }, { choirB: fixture.choirA },
    { fileId: 'unexpected' }, { pdfSha256: 'bad' }, { serviceKey: 'must-not-arrive' },
    { legacyUrl: fixture.legacyUrl.replace('127.0.0.1', 'example.com') },
    { legacyUrl: `${fixture.legacyUrl}&unexpected=1` },
    { legacyUrl: `${fixture.legacyUrl}#secret` },
  ])('rejects malformed/non-synthetic runtime metadata %#', patch => {
    expect(() => validate090PdfFixture({ ...fixture, ...patch })).toThrow();
  });
  it('observation relay preserves query bytes and refuses foreign origins', () => {
    const input = fixture.legacyUrl.replace('synthetic-signed-ticket', 'a%2Fb%3D');
    expect(observed090PdfUrl(input)).toBe(input.replace('http://127.0.0.1:8000/', 'http://127.0.0.1:18092/090/read'));
    expect(() => observed090PdfUrl(input.replace('127.0.0.1', 'example.com'))).toThrow();
    expect(() => observed090PdfUrl(input.replace(':8000/', ':8000/foreign'))).toThrow();
  });
});
