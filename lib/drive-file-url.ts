import {supabase, type RepertoireFile} from '@/lib/supabase';
import {ProtectedFileRequestError} from '@/lib/repertuvar/protected-file-client';
async function requireCurrentWebAccess() {
  const {data,error}=await supabase.auth.getSession();
  if(error || !data.session?.access_token || !data.session.user?.id) throw new Error('Oturum bulunamadı.');
  return {accessToken:data.session.access_token,userId:data.session.user.id};
}
async function authenticatedWebFetch(input:RequestInfo | URL,init:RequestInit,access:{accessToken:string;userId:string}) {
  const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+access.accessToken);
  return fetch(input,{...init,headers});
}
interface CachedDriveUrl {
  url: string;
  expiresAt: number;
}

const driveUrlCache = new Map<string, CachedDriveUrl>();

const driveUrlLoads = new Map<string, { generation: number; promise: Promise<string> }>();

let cacheGeneration = 0;

let cacheIdentity: string | null = null;

let sessionRequestSequence = 0;

let lastResolvedSessionRequest = 0;

async function resolveCachedUrl(
  cacheKey: string,
  generation: number,
  load: () => Promise<CachedDriveUrl>,
): Promise<string> {
  if (generation !== cacheGeneration) throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
  const cached = driveUrlCache.get(cacheKey);
  if (cached && cached.expiresAt - Date.now() > 30_000) return cached.url;

  const existing = driveUrlLoads.get(cacheKey);
  if (existing?.generation === generation) return existing.promise;
  const promise = load().then((payload) => {
    // Tenant changes cancel all loads, including coalesced waiters. Ticket expiry
    // alone must not cancel another file's legitimate in-flight request.
    if (generation !== cacheGeneration) throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
    driveUrlCache.set(cacheKey, payload);
    return payload.url;
  });
  driveUrlLoads.set(cacheKey, { generation, promise });
  try {
    return await promise;
  } finally {
    if (driveUrlLoads.get(cacheKey)?.promise === promise) driveUrlLoads.delete(cacheKey);
  }
}

function invalidateProtectedFileUrl(url: string) {
  for (const [key, cached] of driveUrlCache) {
    if (cached.url === url) driveUrlCache.delete(key);
  }
}

function getCacheKey(
  userId: string,
  fileId: string,
  fileName: string | null | undefined,
  mimeType: string | null | undefined,
) {
  return `${userId}:${fileId}:${fileName ?? ''}:${mimeType ?? ''}`;
}

export function clearProtectedDriveFileUrlCache() {
  cacheGeneration += 1;
  driveUrlCache.clear();
  driveUrlLoads.clear();
  cacheIdentity = null;
}

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
        invalidateProtectedFileUrl(url);
        continue;
      }
      invalidateProtectedFileUrl(url);
      throw new ProtectedFileRequestError('Dosya bağlantısı kullanılamıyor.', response.status);
    } catch (error) {
      if (error instanceof ProtectedFileRequestError ||
        (error instanceof Error && error.name === 'AbortError')) throw error;
      if (attempt === 0) {
        invalidateProtectedFileUrl(url);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Dosya bağlantısı yenilenemedi.');
}

async function requireCurrentSession(generation: number) {
  const requestSequence = ++sessionRequestSequence;
  const access = await requireCurrentWebAccess();
  if (generation !== cacheGeneration) throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
  // Memory-only bearer identity prevents reuse across same-user sessions or refresh.
  // Tenant lifecycle clears on choir changes; the server also checks every new read.
  const identity = `${access.userId}:${access.accessToken}`;
  if (requestSequence < lastResolvedSessionRequest && cacheIdentity !== identity) {
    throw new Error('Koro oturumu değişti. Dosyayı yeniden açın.');
  }
  lastResolvedSessionRequest = Math.max(lastResolvedSessionRequest, requestSequence);
  if (cacheIdentity !== null && cacheIdentity !== identity) clearProtectedDriveFileUrlCache();
  cacheIdentity = identity;
  return access;
}

export async function getProtectedDriveFileUrl(file: Pick<RepertoireFile, 'drive_file_id' | 'file_name' | 'mime_type'>) {
  const generation = cacheGeneration;
  if (!file.drive_file_id) {
    return null;
  }

  const access = await requireCurrentSession(generation);
  const { userId } = access;

  const cacheKey = getCacheKey(userId, `legacy:${file.drive_file_id}`, file.file_name, file.mime_type);
  return resolveCachedUrl(cacheKey, cacheGeneration, async () => {
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
      throw new ProtectedFileRequestError((await response.text()) || 'Dosya erişim bağlantısı oluşturulamadı.', response.status);
    }
    return response.json() as Promise<CachedDriveUrl>;
  });
}
