'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

/** Keep a mounted creation form bound to its opening choir, not a later shared-session choice. */
export function useFormOriginChoir(open: boolean) {
  const { member, activeChoir } = useAuth();
  const [originChoirId, setOriginChoirId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setOriginChoirId(null);
    } else if (member?.choir_id && member.choir_id === activeChoir?.choir_id) {
      setOriginChoirId((previous) => previous ?? member.choir_id);
    }
  }, [open, member?.choir_id, activeChoir?.choir_id]);

  return {
    originChoirId,
    isOriginCurrent: open && originChoirId !== null
      && member?.choir_id === originChoirId
      && activeChoir?.choir_id === originChoirId,
  };
}
