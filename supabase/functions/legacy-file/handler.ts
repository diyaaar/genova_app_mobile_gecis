import { isActiveDriveFileContent } from '../../../lib/server/drive-file-content.ts';
import { makeContentDisposition, parseRangeHeader } from '../repertoire-file/handler.ts';
import { legacySourceDigest, type LegacyTicket } from './ticket.ts';

export interface LegacyFileRecord {
  kind: string;
  resourceId: string;
  choirId: string;
  alias: string;
  fileName: string;
  mimeType: string | null;
  sourceLink: string | null;
}
export interface LegacyIdentity { actorId: string; sessionId: string; choirId: string }
export interface LegacyDependencies {
  authenticate(authorization: string, accessToken: string): Promise<LegacyIdentity | null>;
  resolve(input: LegacyIdentity & { alias: string; kind?: string; resourceId?: string }): Promise<LegacyFileRecord | null>;
  createTicket(input: Omit<LegacyTicket, 'version' | 'family' | 'expiresAt'>): Promise<{ token: string; expiresAt: number }>;
  verifyTicket(token: string): Promise<LegacyTicket | null>;
  fetchDrive(alias: string): Promise<Response>;
  fetchStorage(bucket: string, path: string): Promise<Response>;
}
const ALIAS = /^[A-Za-z0-9_-]{1,256}$/u;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, range, x-client-info',
  'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
  'Access-Control-Expose-Headers': 'content-length, content-range, content-type, content-disposition, accept-ranges',
};
function headers(type = 'text/plain; charset=utf-8') {
  return new Headers({ ...CORS, 'Content-Type': type, 'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
}
function failure(status: number) {
  return new Response(status === 401 ? 'Dosya oturumu geçersiz.' : 'Dosya erişimi kullanılamıyor.',
    { status, headers: headers() });
}
async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid-body');
  let text = '';
  let size = 0;
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) { await reader.cancel(); throw new Error('invalid-body'); }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode()) as Record<string, unknown>;
}
async function issue(request: Request, deps: LegacyDependencies) {
  const authorization = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/iu.exec(authorization);
  if (!match) return failure(401);
  let body: Record<string, unknown>;
  try { body = await readJson(request); } catch { return failure(400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || typeof body.driveFileId !== 'string' || !ALIAS.test(body.driveFileId)) return failure(400);
  try {
    const identity = await deps.authenticate(authorization, match[1]);
    if (!identity) return failure(401);
    const file = await deps.resolve({ ...identity, alias: body.driveFileId });
    if (!file || file.choirId !== identity.choirId || file.alias !== body.driveFileId) return failure(403);
    if (isActiveDriveFileContent({ fileName: file.fileName, mimeType: file.mimeType })) return failure(415);
    const ticket = await deps.createTicket({ ...identity, resourceId: file.resourceId,
      kind: file.kind, alias: file.alias, sourceDigest: await legacySourceDigest(file) });
    const url = new URL(request.url);
    url.search = '';
    url.searchParams.set('alias', file.alias);
    url.searchParams.set('ticket', ticket.token);
    return Response.json({ url: url.toString(), expiresAt: ticket.expiresAt },
      { headers: headers('application/json; charset=utf-8') });
  } catch { return failure(503); }
}
async function read(request: Request, deps: LegacyDependencies) {
  const url = new URL(request.url);
  const alias = url.searchParams.get('alias') ?? '';
  const token = url.searchParams.get('ticket') ?? '';
  if (!ALIAS.test(alias) || !token || token.length > 2048) return failure(401);
  const ticket = await deps.verifyTicket(token);
  if (!ticket || ticket.alias !== alias) return failure(401);
  // One SQL snapshot supplies authorization and current trusted metadata together.
  const file = await deps.resolve(ticket);
  if (!file || file.choirId !== ticket.choirId || file.resourceId !== ticket.resourceId
    || file.kind !== ticket.kind || file.alias !== alias
    || await legacySourceDigest(file) !== ticket.sourceDigest) return failure(403);
  if (isActiveDriveFileContent({ fileName: file.fileName, mimeType: file.mimeType })) return failure(415);
  const storage = file.sourceLink?.startsWith('storage://')
    ? /^storage:\/\/([^/]+)\/(.+)$/u.exec(file.sourceLink) : null;
  if (file.sourceLink?.startsWith('storage://') && !storage) return failure(502);
  const upstream = storage ? await deps.fetchStorage(storage[1], storage[2]) : await deps.fetchDrive(alias);
  if (!upstream.ok) { await upstream.body?.cancel(); return failure(502); }
  const type = upstream.headers.get('content-type')?.split(';', 1)[0]?.trim()
    || file.mimeType || 'application/octet-stream';
  if (isActiveDriveFileContent({ fileName: file.fileName, mimeType: type })) {
    await upstream.body?.cancel(); return failure(415);
  }
  const bytes = await upstream.arrayBuffer();
  const range = parseRangeHeader(request.headers.get('range'), bytes.byteLength);
  const output = headers(type);
  output.set('Accept-Ranges', 'bytes');
  output.set('Content-Disposition', makeContentDisposition(file.fileName));
  if (range.kind === 'invalid') {
    output.set('Content-Range', `bytes */${bytes.byteLength}`);
    return new Response(null, { status: 416, headers: output });
  }
  const content = range.kind === 'range' ? bytes.slice(range.start, range.end + 1) : bytes;
  if (range.kind === 'range') output.set('Content-Range', `bytes ${range.start}-${range.end}/${bytes.byteLength}`);
  output.set('Content-Length', String(content.byteLength));
  return new Response(request.method === 'HEAD' ? null : content,
    { status: range.kind === 'range' ? 206 : 200, headers: output });
}
/** Every new read checks live authority BEFORE fetching bytes. In-flight reads may complete. */
export function createLegacyFileHandler(deps: LegacyDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method === 'POST') return issue(request, deps);
    let response: Response;
    try {
      response = request.method === 'GET' || request.method === 'HEAD'
        ? await read(request, deps) : failure(405);
    } catch { response = failure(503); }
    return request.method === 'HEAD'
      ? new Response(null, { status: response.status, headers: response.headers }) : response;
  };
}
