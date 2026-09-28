// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import sanitizeHtml from 'sanitize-html';
import { createLinkPreviewHandler, createPreviewAdmission, createPreviewBudget, type PreviewActor } from './handler';
import { authorizePreview } from './authorization';
import { createPreviewParser } from './preview';
import { PreviewError } from './policy';

const actor: PreviewActor = { userId: '11111111-1111-4111-8111-111111111111',
  choirId: '22222222-2222-4222-8222-222222222222', memberId: '33333333-3333-4333-8333-333333333333' };
const other = { ...actor, choirId: '44444444-4444-4444-8444-444444444444' };
function request(body: unknown = { url: 'https://www.public-site.com' }, auth = 'Bearer fixture-token') {
  return new Request('https://edge.fixture.com/link-preview', { method: 'POST', headers: { authorization: auth }, body: JSON.stringify(body) });
}
function setup() {
  const authorize = vi.fn(async () => actor);
  const resolve = vi.fn(async () => [{ address: '8.8.8.8', family: 4 }]);
  const outbound = vi.fn(async () => new Response('<title>Works</title>', { headers: { 'content-type': 'text/html' } }));
  return { authorize, resolve, outbound, handler: createLinkPreviewHandler({ authorize, resolve, request: outbound, parse: createPreviewParser(sanitizeHtml) }) };
}
describe('080 preview handler boundary', () => {
  it('preserves schema and never forwards caller credentials to the target', async () => {
    const { handler, outbound } = setup();
    const response = await handler(request());
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ title: 'Works', domain: 'public-site.com', description: null, image: null });
    expect(Object.keys(outbound.mock.calls[0][0])).toEqual(['url', 'address', 'family']);
  });
  it.each(['', 'Bearer', 'Basic fixture', 'Bearer bad token'])('refuses missing/malformed auth %s', async token => {
    const { handler, authorize, outbound } = setup();
    expect((await handler(request(undefined, token))).status).toBe(401);
    expect(authorize).not.toHaveBeenCalled(); expect(outbound).not.toHaveBeenCalled();
  });
  it.each([{}, [], { url: 42 }, { url: 'https://www.public-site.com', choirId: actor.choirId }, { url: 'http://127.0.0.1' }])('rejects body before outbound %#', async body => {
    const { handler, outbound } = setup();
    expect((await handler(request(body))).status).toBe(400); expect(outbound).not.toHaveBeenCalled();
  });
  it('bounds actual inbound bytes', async () => {
    const { handler, authorize } = setup();
    expect((await handler(request({ url: 'a'.repeat(5000) }))).status).toBe(413);
    expect(authorize).not.toHaveBeenCalled();
  });
  it('returns 429 before another DNS/target request when actor allowance is spent', async () => {
    const { authorize, resolve, outbound } = setup();
    const handler = createLinkPreviewHandler({ authorize, resolve, request: outbound, parse: createPreviewParser(sanitizeHtml),
      reserve: createPreviewBudget(() => 0, { actor: 1, choir: 5, concurrent: 2, buckets: 10, worker: 5 }) });
    expect((await handler(request())).status).toBe(200);
    expect((await handler(request())).status).toBe(429);
    expect(resolve).toHaveBeenCalledTimes(1); expect(outbound).toHaveBeenCalledTimes(1);
  });
  it('denies unauthorized/inactive/invalid actors without DNS or network', async () => {
    for (const fail of [new PreviewError('unauthorized', 401), new PreviewError('forbidden', 403)]) {
      const { handler, authorize, resolve, outbound } = setup(); authorize.mockRejectedValue(fail);
      expect((await handler(request())).status).toBe(fail.status); expect(resolve).not.toHaveBeenCalled(); expect(outbound).not.toHaveBeenCalled();
    }
    const { handler, authorize, outbound } = setup(); authorize.mockResolvedValue({ ...actor, memberId: '' });
    expect((await handler(request())).status).toBe(403); expect(outbound).not.toHaveBeenCalled();
  });
  it('allows OPTIONS only and rejects GET', async () => {
    const { handler, outbound } = setup();
    expect((await handler(new Request('https://edge.fixture.com', { method: 'OPTIONS' }))).status).toBe(200);
    expect((await handler(new Request('https://edge.fixture.com'))).status).toBe(405); expect(outbound).not.toHaveBeenCalled();
  });
  it('redacts errors and releases reservations after failure', async () => {
    const { authorize, resolve } = setup(); const release = vi.fn();
    const handler = createLinkPreviewHandler({ authorize, resolve, reserve: () => release,
      request: async () => { throw new Error('sensitive-host-token'); }, parse: createPreviewParser(sanitizeHtml) });
    const response = await handler(request()); expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('sensitive'); expect(release).toHaveBeenCalledOnce();
  });
  it('honors caller abort during auth before any outbound', async () => {
    const { resolve, outbound } = setup(); const controller = new AbortController();
    const handler = createLinkPreviewHandler({ authorize: () => new Promise(() => {}), resolve,
      request: outbound, parse: createPreviewParser(sanitizeHtml) });
    const req = new Request(request(), { signal: controller.signal });
    const pending = handler(req); setTimeout(() => controller.abort(), 10);
    expect((await pending).status).toBe(504); expect(outbound).not.toHaveBeenCalled();
  });
  it('bounds slow authorization before an additional actor can start work', async () => {
    const { resolve, outbound } = setup(); const controller = new AbortController();
    const authorize = vi.fn(() => new Promise<PreviewActor>(() => {}));
    const handler = createLinkPreviewHandler({ authorize, resolve, request: outbound, parse: createPreviewParser(sanitizeHtml),
      admit: createPreviewAdmission(() => 0, { requests: 10, concurrent: 1 }) });
    const pending = handler(new Request(request(), { signal: controller.signal }));
    expect((await handler(request())).status).toBe(429);
    controller.abort(); expect((await pending).status).toBe(504);
    expect(authorize.mock.calls.length).toBeLessThanOrEqual(1); expect(outbound).not.toHaveBeenCalled();
  });
});
describe('080 verified active membership adapter', () => {
  function authClient() {
    return { auth: { getUser: vi.fn(async () => ({ data: { user: { id: actor.userId } }, error: null })) },
      rpc: vi.fn(async (name: string) => ({ data: name === 'current_choir_id' ? actor.choirId : actor.memberId, error: null })),
      findActiveMember: vi.fn(async () => ({ data: { id: actor.memberId }, error: null })) };
  }
  it('verifies auth then binds choir/member/user to one active membership', async () => {
    const client = authClient(); expect(await authorizePreview(client, 'token')).toEqual(actor);
    expect(client.auth.getUser).toHaveBeenCalledWith('token');
    expect(client.findActiveMember).toHaveBeenCalledWith(actor.memberId, actor.choirId, actor.userId);
  });
  it('stops after invalid auth or RPC errors', async () => {
    const client = authClient(); client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null } as never);
    await expect(authorizePreview(client, 'bad')).rejects.toThrow('unauthorized'); expect(client.rpc).not.toHaveBeenCalled();
    const revoked = authClient(); revoked.rpc.mockResolvedValue({ data: null, error: null } as never);
    await expect(authorizePreview(revoked, 'token')).rejects.toThrow('forbidden'); expect(revoked.findActiveMember).not.toHaveBeenCalled();
  });
  it('rejects absent/error membership, including inconsistent RPC context', async () => {
    for (const result of [{ data: null, error: null }, { data: { id: actor.memberId }, error: new Error('db') }]) {
      const client = authClient(); client.findActiveMember.mockResolvedValue(result as never);
      await expect(authorizePreview(client, 'token')).rejects.toThrow('forbidden');
    }
  });
});
describe('080 bounded warm-worker abuse guard', () => {
  it('caps admission globally without identity buckets, releases once and resets the window', () => {
    let time = 0; const admit = createPreviewAdmission(() => time, { requests: 2, concurrent: 1 });
    const release = admit(); expect(() => admit()).toThrow('rate-limit'); release(); release();
    admit()(); expect(() => admit()).toThrow('rate-limit');
    time = 60_001; expect(() => admit()()).not.toThrow();
  });
  it('keys actor limits by choir, shares choir caps, expires windows', () => {
    let time = 0; const reserve = createPreviewBudget(() => time, { actor: 1, choir: 2, concurrent: 2, buckets: 20, worker: 5 });
    reserve(actor)(); expect(() => reserve(actor)).toThrow('rate-limit'); reserve(other)();
    reserve({ ...actor, userId: other.choirId })(); expect(() => reserve({ ...actor, userId: actor.memberId })).toThrow('rate-limit');
    time = 60_001; expect(() => reserve(actor)()).not.toThrow();
  });
  it('bounds concurrent work and makes release idempotent', () => {
    const reserve = createPreviewBudget(() => 0, { actor: 10, choir: 10, concurrent: 1, buckets: 10, worker: 10 });
    const release = reserve(actor); expect(() => reserve(other)).toThrow('rate-limit'); release(); release();
    expect(() => reserve(other)()).not.toThrow();
  });
  it('fails closed on unique-key saturation and worker cap', () => {
    const reserve = createPreviewBudget(() => 0, { actor: 10, choir: 10, concurrent: 10, buckets: 3, worker: 10 });
    reserve(actor)(); expect(() => reserve(other)).toThrow('rate-limit');
    const worker = createPreviewBudget(() => 0, { actor: 10, choir: 10, concurrent: 10, buckets: 10, worker: 1 });
    worker(actor)(); expect(() => worker(other)).toThrow('rate-limit');
  });
});
