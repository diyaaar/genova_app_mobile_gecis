'use client';

import { useCallback, useEffect, useState } from 'react';
import { privateChatMediaVersionId } from '@/lib/chat-media';
import {
  clearProtectedDriveFileUrlCache, getOnlineAuthorizedPrivateFileUrl,
  getProtectedChatMediaFileUrl,
} from '@/lib/drive-file-url';
import { getDriveImageUrl } from '@/lib/drive';

export function useProtectedChatMediaUrl(value: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [bodyRetry, setBodyRetry] = useState(0);
  const versionId = privateChatMediaVersionId(value);

  useEffect(() => { setBodyRetry(0); }, [value]);

  useEffect(() => {
    let cancelled = false;
    if (!versionId) {
      setUrl(value ? getDriveImageUrl(value) ?? null : null);
      return () => { cancelled = true; };
    }
    setUrl(null);
    void getOnlineAuthorizedPrivateFileUrl(() => getProtectedChatMediaFileUrl(versionId, {
      file_name: 'room-avatar', mime_type: 'image/jpeg',
    })).then((next) => {
      if (!cancelled) setUrl(next);
    }).catch(() => {
      if (!cancelled) setUrl(null);
    });
    return () => { cancelled = true; };
  }, [value, versionId, bodyRetry]);

  const onBodyError = useCallback(() => {
    if (!versionId) return;
    setUrl(null);
    if (bodyRetry === 0) {
      clearProtectedDriveFileUrlCache();
      setBodyRetry(1);
    }
  }, [bodyRetry, versionId]);

  return { url, onBodyError };
}
