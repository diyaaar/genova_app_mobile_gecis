import { describe, expect, it } from 'vitest';
import { createRepertoireFileTicket } from '../repertoire-file/ticket';
import {
  createPrivateFileTicketV2, sessionIdFromVerifiedAccessToken,
  verifyPrivateFileTicketV2, type PrivateFileFamily,
} from './private-file-ticket-v2';

const input = {
  fileId: '11111111-1111-4111-8111-111111111111',
  choirId: '22222222-2222-4222-8222-222222222222',
  actorId: '33333333-3333-4333-8333-333333333333',
  sessionId: '44444444-4444-4444-8444-444444444444',
};
const families: PrivateFileFamily[] = [
  'repertoire-file', 'assignment-file', 'assignment-review-file',
  'repertoire-comment-file', 'chat-media-file',
];

describe('private file ticket v2', () => {
  it.each(families)('binds %s to actor, Auth session, family and expiry', async (family) => {
    const ticket = await createPrivateFileTicketV2(family, input, 'secret', 1_000, 5_000);
    expect(await verifyPrivateFileTicketV2(family, ticket.token, 'secret', 5_999))
      .toEqual({ version: 2, family, ...input, expiresAt: 6_000 });
    expect(await verifyPrivateFileTicketV2(family, ticket.token, 'secret', 6_000)).toBeNull();
    expect(await verifyPrivateFileTicketV2(family, ticket.token, 'other-secret', 5_001)).toBeNull();
    expect(await verifyPrivateFileTicketV2(
      families.find((candidate) => candidate !== family)!, ticket.token, 'secret', 5_001,
    )).toBeNull();
  });

  it('rejects the old signed v1 token and tampering', async () => {
    const old = await createRepertoireFileTicket(input, 'secret', 1_000, 5_000);
    expect(await verifyPrivateFileTicketV2('repertoire-file', old.token, 'secret', 5_001)).toBeNull();
    const current = await createPrivateFileTicketV2('repertoire-file', input, 'secret', 1_000, 5_000);
    expect(await verifyPrivateFileTicketV2('repertoire-file', `${current.token}x`, 'secret', 5_001))
      .toBeNull();
  });

  it('requires the verified JWT subject to match a valid session claim', () => {
    const claims = (value: unknown) => `header.${btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')}.signature`;
    expect(sessionIdFromVerifiedAccessToken(claims({ sub: input.actorId, session_id: input.sessionId }), input.actorId))
      .toBe(input.sessionId);
    expect(() => sessionIdFromVerifiedAccessToken(claims({ sub: input.choirId, session_id: input.sessionId }), input.actorId))
      .toThrow('Unauthorized');
    expect(() => sessionIdFromVerifiedAccessToken(claims({ sub: input.actorId }), input.actorId))
      .toThrow('Unauthorized');
  });
});
