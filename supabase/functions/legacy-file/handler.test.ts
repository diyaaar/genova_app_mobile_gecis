// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLegacyFileHandler, type LegacyDependencies, type LegacyFileRecord } from './handler';
import { createLegacyTicket, verifyLegacyTicket } from './ticket';
import { createPrivateFileTicketV2 } from '../_shared/private-file-ticket-v2';

const identity = {
  actorId: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222',
  choirId: '33333333-3333-4333-8333-333333333333',
};
const initial: LegacyFileRecord = { kind: 'repertoire',
  resourceId: '44444444-4444-4444-8444-444444444444', choirId: identity.choirId,
  alias: 'legacy_file', fileName: 'Türkçe partisyon.pdf', mimeType: 'application/pdf', sourceLink: null };
const secret = 'synthetic-local-legacy-test-secret';
const origin = 'https://project.supabase.co/functions/v1/legacy-file';

describe('legacy-family live authority and provider contract', () => {
  let file: LegacyFileRecord | null;
  let deps: LegacyDependencies;
  let handler: ReturnType<typeof createLegacyFileHandler>;
  beforeEach(() => {
    file = { ...initial };
    deps = {
      authenticate: vi.fn(async () => identity), resolve: vi.fn(async () => file),
      createTicket: (input) => createLegacyTicket(input, secret),
      verifyTicket: (token) => verifyLegacyTicket(token, secret),
      fetchDrive: vi.fn(async () => new Response('abcdef', { headers: { 'Content-Type': 'application/pdf' } })),
      fetchStorage: vi.fn(async () => new Response('abcdef', { headers: { 'Content-Type': 'audio/mpeg' } })),
    };
    handler = createLegacyFileHandler(deps);
  });
  async function issue(body: unknown = { driveFileId: initial.alias, fileName: 'untrusted.html', mimeType: 'text/html' }) {
    return handler(new Request(origin, { method: 'POST', headers: { authorization: 'Bearer verified' }, body: JSON.stringify(body) }));
  }
  async function url() {
    const response = await issue();
    expect(response.status).toBe(200);
    return (await response.json()).url as string;
  }
  function providerCalls() {
    return vi.mocked(deps.fetchDrive).mock.calls.length + vi.mocked(deps.fetchStorage).mock.calls.length;
  }

  it.each(['repertoire', 'comment', 'submission', 'review', 'private-review'])('preserves non-versioned %s reads using trusted metadata', async (kind) => {
    file = { ...initial, kind };
    const link = await url();
    const response = await handler(new Request(link));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('abcdef');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-disposition')).toContain('UTF-8');
    expect(providerCalls()).toBe(1);
    expect(deps.resolve).toHaveBeenLastCalledWith(expect.objectContaining({ ...identity, alias: initial.alias, kind, resourceId: initial.resourceId }));
  });
  it.each(['GET', 'HEAD'])('rejects actorless/malformed tokens on %s before authority or provider', async (method) => {
    for (const token of ['old.actorless', 'abc', 'bad.bad.bad']) {
      const response = await handler(new Request(`${origin}?alias=legacy_file&ticket=${token}`, { method }));
      expect(response.status).toBe(401);
      if (method === 'HEAD') expect(await response.text()).toBe('');
    }
    expect(deps.resolve).not.toHaveBeenCalled();
    expect(providerCalls()).toBe(0);
  });
  it('refuses a valid existing five-family ticket', async () => {
    const ticket = await createPrivateFileTicketV2('repertoire-file', {
      ...identity, fileId: initial.resourceId }, secret);
    const response = await handler(new Request(`${origin}?alias=legacy_file&ticket=${ticket.token}`));
    expect(response.status).toBe(401);
    expect(providerCalls()).toBe(0);
  });
  it('checks current authority on BOTH reads after issuance and refuses committed revocation', async () => {
    const link = await url();
    expect((await handler(new Request(link, { method: 'HEAD' }))).status).toBe(200);
    file = null;
    expect((await handler(new Request(link))).status).toBe(403);
    expect((await handler(new Request(link, { method: 'HEAD' }))).status).toBe(403);
    expect(providerCalls()).toBe(1);
    expect(deps.resolve).toHaveBeenCalledTimes(4);
  });
  it.each(['choirId', 'resourceId', 'kind', 'alias', 'sourceLink', 'fileName', 'mimeType'])('denies changed %s before provider', async (key) => {
    const link = await url();
    file = { ...initial, [key]: 'replacement' };
    expect((await handler(new Request(link))).status).toBe(403);
    expect(providerCalls()).toBe(0);
  });
  it('fails closed on authority error, with no fallback read', async () => {
    const link = await url();
    vi.mocked(deps.resolve).mockRejectedValue(new Error('database unavailable'));
    expect((await handler(new Request(link))).status).toBe(503);
    expect(providerCalls()).toBe(0);
  });
  it('honors an already-authorized in-flight read but refuses the next request', async () => {
    const link = await url();
    let finish!: (response: Response) => void;
    vi.mocked(deps.fetchDrive).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const pending = handler(new Request(link));
    await vi.waitFor(() => expect(providerCalls()).toBe(1));
    file = null;
    expect((await handler(new Request(link))).status).toBe(403);
    finish(new Response('abcdef', { headers: { 'Content-Type': 'application/pdf' } }));
    expect((await pending).status).toBe(200);
    expect(providerCalls()).toBe(1);
  });
  it('preserves trusted Storage, Range/HEAD and invalid-range behavior', async () => {
    file = { ...initial, kind: 'submission', sourceLink: 'storage://assignment-submissions/assignment/member/file.mp3' };
    const link = await url();
    const response = await handler(new Request(link, { headers: { Range: 'bytes=1-3' } }));
    expect(response.status).toBe(206);
    expect(await response.text()).toBe('bcd');
    expect(response.headers.get('content-range')).toBe('bytes 1-3/6');
    const head = await handler(new Request(link, { method: 'HEAD', headers: { Range: 'bytes=-2' } }));
    expect(head.status).toBe(206);
    expect(head.headers.get('content-length')).toBe('2');
    expect(await head.text()).toBe('');
    const invalid = await handler(new Request(link, { headers: { Range: 'bytes=999-' } }));
    expect(invalid.status).toBe(416);
    expect(invalid.headers.get('content-range')).toBe('bytes */6');
    expect(deps.fetchDrive).not.toHaveBeenCalled();
    expect(deps.fetchStorage).toHaveBeenCalledWith('assignment-submissions', 'assignment/member/file.mp3');
  });
  it('rejects invalid request bodies, missing Auth, and denied issuance without minting', async () => {
    expect((await handler(new Request(origin, { method: 'POST' }))).status).toBe(401);
    for (const body of [null, [], { driveFileId: '../../etc' }, { driveFileId: 'x', extra: 'x'.repeat(4096) }]) {
      expect((await issue(body)).status).toBe(400);
    }
    file = null;
    expect((await issue()).status).toBe(403);
    vi.mocked(deps.authenticate).mockResolvedValue(null);
    expect((await issue()).status).toBe(401);
    expect(providerCalls()).toBe(0);
  });
  it('rejects active source metadata at issue and active upstream content at read', async () => {
    file = { ...initial, fileName: 'payload.svg' };
    expect((await issue()).status).toBe(415);
    file = { ...initial };
    const link = await url();
    vi.mocked(deps.fetchDrive).mockResolvedValue(new Response('<html/>', { headers: { 'Content-Type': 'text/html' } }));
    expect((await handler(new Request(link))).status).toBe(415);
  });
  it('rejects tampering, expiry and wrong signing keys', async () => {
    const link = new URL(await url());
    const token = link.searchParams.get('ticket')!;
    expect(await verifyLegacyTicket(token, 'different-key')).toBeNull();
    expect(await verifyLegacyTicket(`${token}x`, secret)).toBeNull();
    expect(await verifyLegacyTicket(token, secret, Date.now() + 3_600_001)).toBeNull();
    link.searchParams.set('alias', 'different');
    expect((await handler(new Request(link))).status).toBe(401);
    expect(providerCalls()).toBe(0);
  });
});
