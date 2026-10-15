import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { prepareTenantTransition } from './tenant-transition';

/** Also covers routes outside the PDF header, such as the persistent audio player. */
export function usePendingWriteNavigation() {
  const mounted = useRef(true);
  const busy = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return useCallback((navigate: () => void) => {
    if (busy.current) return;
    busy.current = true;
    void (async () => {
      let release: (() => void) | undefined;
      try {
        release = await prepareTenantTransition();
        if (mounted.current) navigate();
      } catch (error) {
        if (mounted.current) Alert.alert('Notlar kaydedilemedi', error instanceof Error ? error.message : 'Tekrar deneyin.');
      } finally {
        release?.();
        busy.current = false;
      }
    })();
  }, []);
}
