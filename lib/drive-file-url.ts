import type { RepertoireFile } from '@/lib/supabase';
import { requestProtectedRepertoireFileTicket } from '@/lib/repertuvar/protected-file-client';
import { ProtectedFileRequestError } from '@/lib/repertuvar/protected-file-client';
import { authenticatedWebFetch, requireCurrentWebAccess } from '@/lib/web-auth-capability';

interface CachedDriveUrl {
  url: string;
  expiresAt: number;
}

const driveUrlCache = new Map<string, CachedDriveUrl>();
let cacheGeneration = 0;

async function resolveCachedUrl(
  cacheKey: string,
  generation: number,
  load: () => Promise<CachedDriveUrl>,
): Promise<string> {
  if (generation !== cacheGeneration) throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
  const cached = driveUrlCache.get(cacheKey);
  if (cached && cached.expiresAt - Date.now() > 30_000) return cached.url;

  const payload = await load();
  // Clearing the tenant must also invalidate requests that were already in flight.
  if (generation !== cacheGeneration) throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
  driveUrlCache.set(cacheKey, payload);
  return payload.url;
}

function getCacheKey(
  userId: string,
  fileId: string,
  fileName: string | null | undefined,
  mimeType: string | null | undefined,
) {
  return `${userId}:${fileId}:${fileName ?? ''}:${mimeType ?? ''}`;
}

function getEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error('Dosya servisi yapılandırılmamış.');
  return `${baseUrl.replace(/\/+$/u, '')}/functions/v1/repertoire-file`;
}

function getAssignmentEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error('Dosya servisi yapılandırılmamış.');
  return `${baseUrl.replace(/\/+$/u, '')}/functions/v1/assignment-file`;
}

function getAssignmentReviewEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error('Dosya servisi yapılandırılmamış.');
  return `${baseUrl.replace(/\/+$/u, '')}/functions/v1/assignment-review-file`;
}

function getRepertoireCommentEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error('Dosya servisi yapılandırılmamış.');
  return `${baseUrl.replace(/\/+$/u, '')}/functions/v1/repertoire-comment-file`;
}

function getChatMediaEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error('Dosya servisi yapılandırılmamış.');
  return `${baseUrl.replace(/\/+$/u, '')}/functions/v1/chat-media-file`;
}

export function clearProtectedDriveFileUrlCache() {
  cacheGeneration += 1;
  driveUrlCache.clear();
}

/** Online readers must not display a cached URL or local copy without a fresh HEAD decision.
 * One 401/transport retry permits old v1 URLs to acquire v2. A 403 never retries.
 */
export async function getOnlineAuthorizedPrivateFileUrl(
  loadUrl: () => Promise<string | null>,
  probe: typeof fetch = fetch,
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const url = await loadUrl();
    if (!url) return null;
    try {
      const response = await probe(url, { method: 'HEAD', cache: 'no-store' });
      if (response.ok) return url;
      if (response.status === 403) {
        clearProtectedDriveFileUrlCache();
        throw new ProtectedFileRequestError('Dosya erişim yetkisi sona erdi.', 403);
      }
      if (response.status === 401 && attempt === 0) {
        clearProtectedDriveFileUrlCache();
        continue;
      }
      clearProtectedDriveFileUrlCache();
      throw new ProtectedFileRequestError('Dosya bağlantısı kullanılamıyor.', response.status);
    } catch (error) {
      if (error instanceof ProtectedFileRequestError ||
        (error instanceof Error && error.name === 'AbortError')) throw error;
      if (attempt === 0) {
        clearProtectedDriveFileUrlCache();
        continue;
      }
      throw error;
    }
  }
  throw new Error('Dosya bağlantısı yenilenemedi.');
}

async function requireCurrentSession() {
  return requireCurrentWebAccess();
}

export async function getProtectedDriveFileUrl(file: Pick<RepertoireFile, 'drive_file_id' | 'file_name' | 'mime_type'>) {
  const generation = cacheGeneration;
  if (!file.drive_file_id) {
    return null;
  }

  const access = await requireCurrentSession();
  const { userId } = access;

  const cacheKey = getCacheKey(userId, `legacy:${file.drive_file_id}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, async () => {
    const response = await authenticatedWebFetch('/api/drive-file-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driveFileId: file.drive_file_id,
        fileName: file.file_name,
        mimeType: file.mime_type,
      }),
    }, access);
    if (!response.ok) {
      throw new Error((await response.text()) || 'Dosya erişim bağlantısı oluşturulamadı.');
    }
    return response.json() as Promise<CachedDriveUrl>;
  });
}

export async function getProtectedRepertoireFileUrl(
  file: Pick<RepertoireFile, 'id' | 'drive_file_id' | 'file_name' | 'mime_type'>,
) {
  const generation = cacheGeneration;
  if (!file.id || !file.drive_file_id) return null;
  const access = await requireCurrentSession();
  const { accessToken, userId } = access;
  const cacheKey = getCacheKey(userId, `repertoire:${file.id}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, () => requestProtectedRepertoireFileTicket({
    endpoint: getEndpoint(),
    accessToken,
    fileId: file.id,
    fetcher: (input, init) => authenticatedWebFetch(input, init, access),
  }));
}

export async function getProtectedAssignmentFileUrl(
  versionId: string,
  file: Pick<RepertoireFile, 'file_name' | 'mime_type'>,
) {
  const generation = cacheGeneration;
  const access = await requireCurrentSession();
  const cacheKey = getCacheKey(access.userId, `assignment:${versionId}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, () => requestProtectedRepertoireFileTicket({
    endpoint: getAssignmentEndpoint(), accessToken: access.accessToken, fileId: versionId,
    fetcher: (input, init) => authenticatedWebFetch(input, init, access),
  }));
}

export async function getProtectedAssignmentReviewFileUrl(
  versionId: string,
  file: Pick<RepertoireFile, 'file_name' | 'mime_type'>,
) {
  const generation = cacheGeneration;
  const access = await requireCurrentSession();
  const cacheKey = getCacheKey(access.userId, `assignment-review:${versionId}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, () => requestProtectedRepertoireFileTicket({
    endpoint: getAssignmentReviewEndpoint(), accessToken: access.accessToken, fileId: versionId,
    fetcher: (input, init) => authenticatedWebFetch(input, init, access),
  }));
}

export async function getProtectedRepertoireCommentFileUrl(
  versionId: string,
  file: Pick<RepertoireFile, 'file_name' | 'mime_type'>,
) {
  const generation = cacheGeneration;
  const access = await requireCurrentSession();
  const cacheKey = getCacheKey(access.userId, `repertoire-comment:${versionId}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, () => requestProtectedRepertoireFileTicket({
    endpoint: getRepertoireCommentEndpoint(), accessToken: access.accessToken, fileId: versionId,
    fetcher: (input, init) => authenticatedWebFetch(input, init, access),
  }));
}

export async function getProtectedChatMediaFileUrl(
  versionId: string,
  file: Pick<RepertoireFile, 'file_name' | 'mime_type'>,
) {
  const generation = cacheGeneration;
  const access = await requireCurrentSession();
  const cacheKey = getCacheKey(access.userId, `chat-media:${versionId}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, generation, () => requestProtectedRepertoireFileTicket({
    endpoint: getChatMediaEndpoint(), accessToken: access.accessToken, fileId: versionId,
    fetcher: (input, init) => authenticatedWebFetch(input, init, access),
  }));
}
