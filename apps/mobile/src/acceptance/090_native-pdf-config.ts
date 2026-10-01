const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PDF_FIXTURE_ORIGIN = 'http://127.0.0.1:18092';
export const PDF_EDGE = 'http://127.0.0.1:8000';

export function read090PdfConfig(env: Record<string, string | undefined>) {
  if (env.EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE !== '1' ||
      env.EXPO_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54491' ||
      !env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE === '1' ||
      env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE === '1') {
    throw new Error('090 PDF requires explicit isolated local Auth configuration.');
  }
  return { endpoint: PDF_EDGE, fixtureUrl: `${PDF_FIXTURE_ORIGIN}/090/android-fixture` };
}

export interface NativePdfFixture {
  email: string;
  password: string;
  choirA: string;
  choirB: string;
  fileId: string;
  pdfSha256: string;
  legacyUrl: string;
}

/** One-use runtime input; never read credentials from public build configuration. */
export function validate090PdfFixture(input: unknown): NativePdfFixture {
  if (!input || typeof input !== 'object') throw new Error('Invalid local PDF fixture.');
  const value = input as Record<string, unknown>;
  const keys = ['email', 'password', 'choirA', 'choirB', 'fileId', 'pdfSha256', 'legacyUrl'];
  if (Object.keys(value).length !== keys.length || keys.some(key => typeof value[key] !== 'string')) {
    throw new Error('Invalid local PDF fixture shape.');
  }
  const fixture = value as unknown as NativePdfFixture;
  const url = new URL(fixture.legacyUrl);
  if (!/^shared-091-[0-9a-f-]+@example\.invalid$/.test(fixture.email) ||
      !/^[A-Za-z0-9_-]{32}$/.test(fixture.password) ||
      ![fixture.choirA, fixture.choirB, fixture.fileId].every(id => UUID.test(id)) ||
      fixture.choirA === fixture.choirB || !/^[0-9a-f]{64}$/.test(fixture.pdfSha256) ||
      url.origin !== PDF_EDGE || url.pathname !== '/' || url.username || url.password || url.hash ||
      url.searchParams.get('fileId') !== fixture.fileId || !url.searchParams.get('ticket') ||
      [...url.searchParams.keys()].sort().join(',') !== 'fileId,ticket') {
    throw new Error('Invalid isolated PDF fixture values.');
  }
  return fixture;
}

/** Only the test observation relay changes transport; signed query bytes stay unchanged. */
export function observed090PdfUrl(input: string): string {
  const url = new URL(input);
  if (url.origin !== PDF_EDGE || url.pathname !== '/' || url.username || url.password || url.hash) {
    throw new Error('Unexpected PDF transport.');
  }
  return `${PDF_FIXTURE_ORIGIN}/090/read${url.search}`;
}
