import { prepareTenantTransition, registerTenantTransition } from '../tenant-transition';
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePendingWriteNavigation } from '../use-pending-write-navigation';

it('releases earlier locks if a later writer fails and propagates the error', async () => {
  const release = jest.fn();
  registerTenantTransition(async () => release);
  registerTenantTransition(async () => { throw new Error('offline'); });
  await expect(prepareTenantTransition()).rejects.toThrow('offline');
  expect(release).toHaveBeenCalledTimes(1);
});

it('waits before external navigation, deduplicates taps and releases the writer', async () => {
  let resolve!: (release: () => void) => void;
  registerTenantTransition(() => new Promise((done) => { resolve = done; }));
  const release = jest.fn(); const navigate = jest.fn();
  const { result, unmount } = await renderHook(usePendingWriteNavigation);
  await act(() => { result.current(navigate); result.current(navigate); });
  expect(navigate).not.toHaveBeenCalled();
  await act(() => resolve(release));
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(release).toHaveBeenCalledTimes(1);
  await unmount();
});

it('preserves the route on failed save and ignores completion after forced unmount', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const unregister = registerTenantTransition(async () => { throw new Error('conflict'); });
  const navigate = jest.fn();
  const hook = await renderHook(usePendingWriteNavigation);
  await act(() => hook.result.current(navigate));
  expect(navigate).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith('Notlar kaydedilemedi', 'conflict');
  unregister();
  let resolve!: (release: () => void) => void;
  registerTenantTransition(() => new Promise((done) => { resolve = done; }));
  await act(() => hook.result.current(navigate));
  await hook.unmount();
  const release = jest.fn();
  await act(() => resolve(release));
  expect(navigate).not.toHaveBeenCalled();
  expect(release).toHaveBeenCalledTimes(1);
});
