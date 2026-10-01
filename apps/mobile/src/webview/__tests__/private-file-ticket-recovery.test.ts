import { createPrivateFileTicketRecovery } from '../private-file-ticket-recovery';
import type { NativeWebViewLease } from '../../auth/types';

const issuer = 'https://tenant-service.supabase.co';
const id = '11111111-1111-4111-8111-111111111111';
const lease = { accessToken: 'fresh-native-token', choirId: 'A' } as NativeWebViewLease;
const url = (reader = 'repertoire-file') => `${issuer}/functions/v1/${reader}?fileId=${id}&ticket=old`;
function runtime(status = 401) {
  const getLease = jest.fn(async () => lease);
  const fetcher = jest.fn(async (_input: unknown, options?: RequestInit) => options?.method === 'HEAD'
    ? { status }
    : { ok: true, json: async () => ({ url: url().replace('ticket=old', 'ticket=new'), expiresAt: Date.now() + 60_000 }) });
  const recover = createPrivateFileTicketRecovery({ getIssuer: () => issuer, getLease,
    fetcher: fetcher as unknown as typeof fetch });
  return { getLease, fetcher, recover, input: { url: url(), signal: new AbortController().signal } };
}

it.each(['repertoire-file', 'assignment-file', 'assignment-review-file', 'repertoire-comment-file', 'chat-media-file'])(
  'renews %s once using current native lease and the same trusted endpoint', async reader => {
    const r = runtime();
    r.fetcher.mockImplementation(async (_input, options) => options?.method === 'HEAD' ? { status: 401 }
      : { ok: true, json: async () => ({ url: url(reader).replace('ticket=old', 'ticket=new'), expiresAt: Date.now() + 60_000 }) });
    await expect(r.recover({ ...r.input, url: url(reader) })).resolves.toContain('ticket=new');
    expect(r.getLease).toHaveBeenCalledWith({ forceRefresh: true });
    expect(r.fetcher).toHaveBeenCalledTimes(2);
    expect(r.fetcher.mock.calls[0]![1]).toEqual(expect.objectContaining({ method: 'HEAD', redirect: 'error' }));
    expect(r.fetcher.mock.calls[0]![1]?.headers).toBeUndefined();
    expect(r.fetcher.mock.calls[1]![1]).toEqual(expect.objectContaining({ method: 'POST', redirect: 'error',
      headers: { Authorization: 'Bearer fresh-native-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: id }) }));
  });

it.each([403, 404, 302, 500])('does not renew a confirmed %s verdict', async status => {
  const r = runtime(status);
  await expect(r.recover(r.input)).rejects.toThrow('denied');
  expect(r.fetcher).toHaveBeenCalledTimes(1);
  expect(r.getLease).not.toHaveBeenCalled();
});

it.each([
  url().replace(issuer, 'https://evil.invalid'),
  url().replace('/repertoire-file', '/drive-file'),
  url().replace('/repertoire-file', '/%72epertoire-file'),
  url() + '&fileId=' + id,
  url() + '&extra=1', url() + '#fragment',
  url().replace(id, 'not-uuid'), url().replace('ticket=old', 'ticket='),
  url().replace('https:', 'http:'), url().replace('https://', 'https://user:pass@'),
])('never probes or sends native credentials to malformed/untrusted input %#', async invalid => {
  const r = runtime();
  await expect(r.recover({ ...r.input, url: invalid })).rejects.toThrow();
  expect(r.fetcher).not.toHaveBeenCalled(); expect(r.getLease).not.toHaveBeenCalled();
});

it('refuses redirected issuance and never follows with credentials', async () => {
  const r = runtime();
  r.fetcher.mockRejectedValueOnce(new Error('HEAD transport'));
  r.fetcher.mockRejectedValueOnce(new Error('redirect refused'));
  await expect(r.recover(r.input)).rejects.toThrow('redirect refused');
  expect(r.fetcher.mock.calls[1]![1]?.redirect).toBe('error');
});

it('allows one authority attempt after an opaque body fault with HEAD200', async () => {
  const r = runtime(200);
  await expect(r.recover(r.input)).resolves.toContain('ticket=new');
  expect(r.fetcher).toHaveBeenCalledTimes(2);
});

it('tenant clear during lease lookup prevents issuance', async () => {
  const r = runtime(); const controller = new AbortController();
  r.getLease.mockImplementation(async () => { controller.abort(); return lease; });
  await expect(r.recover({ url: url(), signal: controller.signal })).rejects.toThrow('cleared');
  expect(r.fetcher).toHaveBeenCalledTimes(1);
});

it('cannot enable HTTP loopback recovery without an explicit local adapter', async () => {
  const r = runtime();
  const recovery = createPrivateFileTicketRecovery({ getIssuer: () => 'http://127.0.0.1:18092',
    getLease: r.getLease, fetcher: r.fetcher as unknown as typeof fetch });
  await expect(recovery({ ...r.input, url: url().replace(issuer, 'http://127.0.0.1:18092') })).rejects.toThrow();
  expect(r.getLease).not.toHaveBeenCalled(); expect(r.fetcher).not.toHaveBeenCalled();
});

it('new issuance denial remains final even after an old v1 HEAD401', async () => {
  const r = runtime();
  r.fetcher.mockResolvedValueOnce({ status: 401 });
  r.fetcher.mockResolvedValueOnce({ ok: false, status: 403, text: async () => 'denied' } as never);
  await expect(r.recover(r.input)).rejects.toMatchObject({ status: 403 });
  expect(r.getLease).toHaveBeenCalledTimes(1); expect(r.fetcher).toHaveBeenCalledTimes(2);
});
