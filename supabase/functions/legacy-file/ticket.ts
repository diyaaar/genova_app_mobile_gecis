import type { LegacyFileRecord } from './handler.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const KINDS = new Set(['repertoire', 'comment', 'submission', 'review', 'private-review']);
export interface LegacyTicket {
  version: 2;
  family: 'legacy-file';
  actorId: string;
  sessionId: string;
  choirId: string;
  resourceId: string;
  kind: string;
  alias: string;
  sourceDigest: string;
  expiresAt: number;
}
function encode(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}
function decode(value: string) {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) throw new Error('Invalid encoding');
  const base = value.replaceAll('-', '+').replaceAll('_', '/');
  return Uint8Array.from(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
}
async function key(secret: string) {
  if (!secret) throw new Error('Missing ticket secret');
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function valid(ticket: LegacyTicket, now: number) {
  return ticket.version === 2 && ticket.family === 'legacy-file'
    && [ticket.actorId, ticket.sessionId, ticket.choirId, ticket.resourceId]
      .every((value) => typeof value === 'string' && UUID.test(value))
    && KINDS.has(ticket.kind) && typeof ticket.alias === 'string'
    && /^[A-Za-z0-9_-]{1,256}$/u.test(ticket.alias)
    && typeof ticket.sourceDigest === 'string' && /^[0-9a-f]{64}$/u.test(ticket.sourceDigest)
    && Number.isSafeInteger(ticket.expiresAt) && ticket.expiresAt > now;
}
/** Bind to current trusted metadata, so a replaced source cannot reuse an old URL. */
export async function legacySourceDigest(file: LegacyFileRecord) {
  const bytes = new TextEncoder().encode(JSON.stringify([
    file.kind, file.resourceId, file.choirId, file.alias,
    file.fileName, file.mimeType, file.sourceLink,
  ]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
export async function createLegacyTicket(
  input: Omit<LegacyTicket, 'version' | 'family' | 'expiresAt'>, secret: string, now = Date.now(),
) {
  const ticket: LegacyTicket = { ...input, version: 2, family: 'legacy-file', expiresAt: now + 3_600_000 };
  if (!valid(ticket, now)) throw new Error('Invalid ticket input');
  const body = encode(new TextEncoder().encode(JSON.stringify(ticket)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(body));
  return { token: `${body}.${encode(new Uint8Array(signature))}`, expiresAt: ticket.expiresAt };
}
export async function verifyLegacyTicket(token: string, secret: string, now = Date.now()): Promise<LegacyTicket | null> {
  if (token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  try {
    if (!await crypto.subtle.verify('HMAC', await key(secret), decode(parts[1]),
      new TextEncoder().encode(parts[0]))) return null;
    const ticket = JSON.parse(new TextDecoder().decode(decode(parts[0]))) as LegacyTicket;
    return ticket && valid(ticket, now) ? ticket : null;
  } catch { return null; }
}
