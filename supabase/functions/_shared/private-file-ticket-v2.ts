const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PrivateFileFamily = 'repertoire-file' | 'assignment-file'
  | 'assignment-review-file' | 'repertoire-comment-file' | 'chat-media-file';

export interface PrivateFileTicketV2 {
  version: 2;
  family: PrivateFileFamily;
  fileId: string;
  choirId: string;
  actorId: string;
  sessionId: string;
  expiresAt: number;
}

export type TicketIdentity = Pick<PrivateFileTicketV2,
  'fileId' | 'choirId' | 'actorId' | 'sessionId'>;

function encode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function decode(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return null;
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch { return null; }
}

async function hmacKey(secret: string) {
  if (!secret) throw new Error('Missing ticket secret');
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Issue a family-bound, actor- and Auth-session-bound URL token. No caller-provided identity. */
export async function createPrivateFileTicketV2(
  family: PrivateFileFamily, input: TicketIdentity, secret: string,
  ttlMs = family === 'chat-media-file' ? 60_000 : 60 * 60_000,
  now = Date.now(),
): Promise<{ token: string; expiresAt: number }> {
  if (Object.values(input).some((value) => !UUID.test(value)) ||
    !Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new Error('Invalid ticket input');
  const payload: PrivateFileTicketV2 = { version: 2, family, ...input, expiresAt: now + ttlMs };
  const encoded = encode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret),
    new TextEncoder().encode(encoded));
  return { token: `${encoded}.${encode(new Uint8Array(signature))}`, expiresAt: payload.expiresAt };
}

/** Strict v2 verification: old actorless/sessionless v1 tickets cannot be read. */
export async function verifyPrivateFileTicketV2(
  family: PrivateFileFamily, token: string, secret: string, now = Date.now(),
): Promise<PrivateFileTicketV2 | null> {
  const parts = token.split('.');
  if (parts.length !== 2 || token.length > 2048) return null;
  const body = decode(parts[0]);
  const signature = decode(parts[1]);
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret),
      signature, new TextEncoder().encode(parts[0]));
    if (!valid) return null;
    const value = JSON.parse(new TextDecoder().decode(body)) as Partial<PrivateFileTicketV2>;
    if (value.version !== 2 || value.family !== family ||
      !UUID.test(value.fileId ?? '') || !UUID.test(value.choirId ?? '') ||
      !UUID.test(value.actorId ?? '') || !UUID.test(value.sessionId ?? '') ||
      typeof value.expiresAt !== 'number' || !Number.isSafeInteger(value.expiresAt) ||
      value.expiresAt <= now) return null;
    return value as PrivateFileTicketV2;
  } catch { return null; }
}

/** Call only after Auth getUser(accessToken) succeeds; it binds the verified JWT to its session. */
export function sessionIdFromVerifiedAccessToken(accessToken: string, verifiedUserId: string): string {
  try {
    const encoded = accessToken.split('.')[1];
    if (!encoded) throw new Error('Missing JWT payload');
    const raw = decode(encoded);
    if (!raw) throw new Error('Invalid JWT payload');
    const claims = JSON.parse(new TextDecoder().decode(raw)) as Record<string, unknown>;
    if (claims.sub !== verifiedUserId || typeof claims.session_id !== 'string' ||
      !UUID.test(claims.session_id)) throw new Error('Invalid session claim');
    return claims.session_id;
  } catch { throw new Error('Unauthorized'); }
}
