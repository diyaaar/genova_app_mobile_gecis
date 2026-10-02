'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { clearProtectedDriveFileUrlCache, getOnlineAuthorizedPrivateFileUrl, getProtectedAssignmentFileUrl, getProtectedAssignmentReviewFileUrl, getProtectedDriveFileUrl, getProtectedRepertoireCommentFileUrl, getProtectedRepertoireFileUrl } from '@/lib/drive-file-url';
import { ProtectedFileRequestError } from '@/lib/repertuvar/protected-file-client';
import {
  buildRuntimeDriveFileVersion,
  cacheRuntimeDriveFile,
  clearProtectedDriveFileCaches,
  getOfflineDriveFileUrl,
  getRuntimeDriveFileCacheStatus,
  isRepertoireRuntimeCacheSupported,
} from '@/lib/repertuvar/offline';
import type { RepertoireFile } from '@/lib/supabase';

type DriveFileUrlInput = Pick<RepertoireFile, 'drive_file_id'> &
  Partial<Pick<RepertoireFile, 'id' | 'file_name' | 'mime_type' | 'updated_at' | 'file_size_bytes'>>;

export function useProtectedDriveFileUrl(
  file: DriveFileUrlInput | null | undefined,
  options: { repertoireFile?: boolean; assignmentFileVersionId?: string | null; assignmentReviewFileVersionId?: string | null; repertoireCommentFileVersionId?: string | null } = {},
) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState(false);
  const [isStaleLocal, setIsStaleLocal] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [bodyRetry, setBodyRetry] = useState(0);
  const bodyRetryRef = useRef<{ key: string; used: boolean }>({ key: '', used: false });
  const driveFileId = file?.drive_file_id;
  const repositoryFileId = file?.id;
  const fileName = file?.file_name;
  const mimeType = file?.mime_type;
  const updatedAt = file?.updated_at;
  const fileSizeBytes = file?.file_size_bytes;
  const fileKey = `${repositoryFileId ?? ''}:${driveFileId ?? ''}:${options.assignmentFileVersionId ?? ''}:${options.assignmentReviewFileVersionId ?? ''}:${options.repertoireCommentFileVersionId ?? ''}`;

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUrl() {
      if (!driveFileId) {
        setUrl(null);
        setError(null);
        setLoading(false);
        setIsLocal(false);
        setIsStaleLocal(false);
        return;
      }

      const fileDescriptor = {
        drive_file_id: driveFileId,
        file_name: fileName ?? '',
        mime_type: mimeType ?? null,
        updated_at: updatedAt,
        file_size_bytes: fileSizeBytes ?? null,
      };
      const runtimeVersion = buildRuntimeDriveFileVersion(fileDescriptor);
      const localUrl = getOfflineDriveFileUrl(fileDescriptor, runtimeVersion);
      // Review visibility can be revoked by a chef. Never let a previously visible
      // review bypass the live authorization check through the offline cache.
      const runtimeSupported = isRepertoireRuntimeCacheSupported() && !options.assignmentReviewFileVersionId && !options.repertoireCommentFileVersionId;

      try {
        setLoading(true);
        setError(null);
        setUrl(null);
        setIsLocal(false);
        setIsStaleLocal(false);

        // Non-versioned legacy files are private too. Cache freshness never proves
        // current access; only actually-offline viewing may select downloaded bytes.
        if (runtimeSupported && localUrl && !online) {
          try {
            const status = await getRuntimeDriveFileCacheStatus(driveFileId, runtimeVersion);
            if (!cancelled && status.cached) {
              setUrl(localUrl);
              setIsLocal(true);
              setIsStaleLocal(status.stale);
            }

            if (status.cached && (!status.stale || !online)) {
              return;
            }
          } catch {
            // Runtime cache is opportunistic; token flow remains the source of truth.
          }
        }

        if (!online) {
          if (!cancelled) {
            setUrl(null);
            setIsLocal(false);
            setIsStaleLocal(false);
            setError('Bu dosya local cachete bulunamadı ve internet bağlantısı yok.');
          }
          return;
        }

        if (options.repertoireFile && !repositoryFileId) {
          throw new Error('Dosya kimliği geçersiz.');
        }
        const loadTicketUrl = async () => options.repertoireCommentFileVersionId
          ? await getProtectedRepertoireCommentFileUrl(options.repertoireCommentFileVersionId, {
              file_name: fileName ?? '', mime_type: mimeType ?? null,
            })
          : options.assignmentReviewFileVersionId
          ? await getProtectedAssignmentReviewFileUrl(options.assignmentReviewFileVersionId, {
              file_name: fileName ?? '', mime_type: mimeType ?? null,
            })
          : options.assignmentFileVersionId
          ? await getProtectedAssignmentFileUrl(options.assignmentFileVersionId, {
              file_name: fileName ?? '', mime_type: mimeType ?? null,
            })
          : options.repertoireFile
          ? await getProtectedRepertoireFileUrl({
              id: repositoryFileId!,
              drive_file_id: driveFileId,
              file_name: fileName ?? '',
              mime_type: mimeType ?? null,
            })
          : getProtectedDriveFileUrl({
            drive_file_id: driveFileId,
            file_name: fileName ?? '',
            mime_type: mimeType ?? null,
          });
        const nextUrl = await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);

        if (cancelled) {
          return;
        }

        setUrl(nextUrl);
        setIsLocal(false);
        setIsStaleLocal(false);

        if (runtimeSupported && nextUrl && runtimeVersion) {
          void cacheRuntimeDriveFile({
            driveFileId,
            url: nextUrl,
            version: runtimeVersion,
            fileName: fileName ?? null,
            mimeType: mimeType ?? null,
          }).catch(() => {
            // Runtime cache failures should not block viewing the file.
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          const denied = loadError instanceof ProtectedFileRequestError &&
            (loadError.status === 401 || loadError.status === 403);
          if (denied) {
            clearProtectedDriveFileUrlCache();
            await clearProtectedDriveFileCaches().catch(() => {
              // Still fail closed in this view if offline cache cleanup is unavailable.
            });
          }
          if (cancelled) return;
          setUrl(null);
          setIsLocal(false);
          setIsStaleLocal(false);
          setError(loadError instanceof Error ? loadError.message : 'Dosya erişim bağlantısı oluşturulamadı.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUrl();

    return () => {
      cancelled = true;
    };
  }, [driveFileId, fileName, mimeType, options.assignmentFileVersionId, options.assignmentReviewFileVersionId, options.repertoireCommentFileVersionId, options.repertoireFile, repositoryFileId, updatedAt, fileSizeBytes, bodyRetry, online]);

  const onBodyError = useCallback(() => {
    if (!driveFileId || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    if (bodyRetryRef.current.key !== fileKey) bodyRetryRef.current = { key: fileKey, used: false };
    setUrl(null);
    if (!bodyRetryRef.current.used) {
      bodyRetryRef.current.used = true;
      clearProtectedDriveFileUrlCache();
      setBodyRetry((value) => value + 1);
    }
  }, [driveFileId, fileKey]);

  // Reconnect renders before the next effect; never expose the old offline source
  // during that render while its fresh online authority decision is still pending.
  return { url: isLocal && online ? null : url, loading, error, isLocal, isStaleLocal, onBodyError };
}
