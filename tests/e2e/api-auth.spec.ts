import { expect, test } from '@playwright/test';

const protectedPostEndpoints = [
  '/api/announcements/delete',
  '/api/announcements/publish',
  '/api/announcements/update',
  '/api/assignment-submissions/delete',
  '/api/assignment-submissions/hide-review',
  '/api/assignment-submissions/migrate-storage',
  '/api/assignment-submissions/review',
  '/api/assignment-submissions/update-note',
  '/api/assignment-submissions/upload',
  '/api/assignment-submissions/withdraw',
  '/api/assignments/create',
  '/api/assignments/delete',
  '/api/assignments/lock',
  '/api/assignments/update',
  '/api/drive-file-token',
  '/api/profile-change-requests/review',
  '/api/profile-change-requests/submit',
  '/api/profile-photo',
  '/api/push/subscribe',
  '/api/push/unsubscribe',
  '/api/rehearsals/attendance/finalize-past',
  '/api/rehearsals/attendance/update',
  '/api/rehearsals/create',
  '/api/rehearsals/delete',
  '/api/rehearsals/update',
  '/api/repertoire/assignments/update',
];

test('every mutation endpoint rejects an anonymous request before changing state', async ({ request }) => {
  for (const endpoint of protectedPostEndpoints) {
    const response = await request.post(endpoint, {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status(), endpoint).toBe(401);
  }
});

test('the signed Drive adapter refuses missing or malformed credentials for GET and HEAD', async ({ request }) => {
  for (const url of ['/api/drive-file/file_123', '/api/drive-file/file%3Cbad%3E?token=body.signature',
    '/api/drive-file/file_123?token=not-a-token']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(url, { method });
      // The current Edge adapter intentionally uses the same refusal for invalid aliases and tokens.
      expect(response.status()).toBe(401);
      expect(response.headers()['cache-control']).toBe('private, no-store');
      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      expect(await response.text()).toBe(method === 'HEAD' ? '' : 'Dosya erişimi kullanılamıyor.');
    }
  }
});
