import { canonicalizeBridgeFileRequestUrl } from '@shared/mobile-webview-bridge';

export const WEBVIEW_APP = 'http://127.0.0.1:31090';
export const WEBVIEW_FIXTURE = 'http://127.0.0.1:18092';
export const WEBVIEW_POLICY = { appOrigin: WEBVIEW_APP, protectedFileOrigins: [WEBVIEW_FIXTURE] };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function require090WebViewConfig(env: Record<string, string | undefined>) {
  const conflicts = ['EXPO_PUBLIC_GENOVA_033_ACCEPTANCE', 'EXPO_PUBLIC_GENOVA_093_ACCEPTANCE',
    'EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE', 'EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE',
    'EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO'];
  if (env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE !== '1' ||
      env.EXPO_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54491' ||
      conflicts.some(key => env[key] === '1') ||
      ![undefined, 'repertoire-file', 'assignment-file', 'legacy-next'].includes(env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY)) throw new Error('090 WebView local configuration refused');
  const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const claims = JSON.parse(atob(key.split('.')[1] ?? '')) as { iss?: string; role?: string };
  if (claims.iss !== 'supabase-demo' || claims.role !== 'anon') throw new Error('090 WebView local anon key required');
}

export interface WebViewMetadata {
  userId: string; choirA: string; choirB: string; targetMember: string;
  fileId: string; pdfSha256: string; legacyUrl: string;
}

export function validate090WebViewMetadata(input: unknown, family: 'repertoire-file' | 'assignment-file' | 'legacy-next' = 'repertoire-file'): WebViewMetadata {
  if (!input || typeof input !== 'object') throw new Error('Invalid local metadata');
  const value = input as Record<string, unknown>;
  const keys = ['userId', 'choirA', 'choirB', 'targetMember', 'fileId', 'pdfSha256', 'legacyUrl'];
  if (Object.keys(value).length !== keys.length || keys.some(key => typeof value[key] !== 'string')) {
    throw new Error('Invalid local metadata shape');
  }
  const data = value as unknown as WebViewMetadata;
  const canonical = canonicalizeBridgeFileRequestUrl(data.legacyUrl, WEBVIEW_POLICY);
  const url = canonical ? new URL(canonical) : null;
  if (![data.userId, data.choirA, data.choirB, data.targetMember, data.fileId].every(id => UUID.test(id)) ||
      data.choirA === data.choirB || !/^[0-9a-f]{64}$/.test(data.pdfSha256) ||
      !url) throw new Error('Invalid isolated metadata values');
  if (family === 'legacy-next') {
    if (data.legacyUrl !== url.href || url.origin !== WEBVIEW_APP || url.pathname !== `/api/drive-file/${data.fileId}`
      || [...url.searchParams.keys()].join(',') !== 'token'
      || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u.test(url.searchParams.get('token') ?? '')
      || (url.searchParams.get('token')?.length ?? 0) > 2048) throw new Error('Invalid isolated legacy URL');
  } else if (url.searchParams.get('fileId') !== data.fileId ||
      [...url.searchParams.keys()].sort().join(',') !== 'fileId,ticket' ||
      !url.searchParams.get('ticket') || url.pathname !== `/functions/v1/${family}` ||
      url.origin !== WEBVIEW_FIXTURE) throw new Error('Invalid isolated metadata values');
  return data;
}
