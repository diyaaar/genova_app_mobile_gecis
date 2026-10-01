import { expect, test, type Page } from '@playwright/test';

// This bounded fixture retains failure traces/screenshots, not video; no ffmpeg download.
test.use({ video: 'off' });

const choirId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const actorId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';
const versionId = '55555555-5555-4555-8555-555555555555';
const assignmentId = '66666666-6666-4666-8666-666666666666';
const endpoint = 'https://example.supabase.co/functions/v1/assignment-file';
const privateUrl = `${endpoint}?fileId=${versionId}&ticket=synthetic-095`;
const legacyUrl = 'https://drive.google.com/stale-095-file';

/** All remote HTTP is intercepted. This exercises production page/query/hook/UI, not Auth/RLS. */
async function installFixture(page: Page, mode: 'private' | 'denied' | 'legacy') {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const user = { id: '33333333-3333-4333-8333-333333333333', aud: 'authenticated', role: 'authenticated',
    email: 'fixture@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' };
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: 'authenticated', aud: 'authenticated',
    session_id: '44444444-4444-4444-8444-444444444444', exp: expiresAt })).toString('base64url');
  const session = { access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.fixture`, token_type: 'bearer',
    expires_at: expiresAt, expires_in: 3600, refresh_token: 'synthetic-refresh', user };
  await page.addInitScript((value) => localStorage.setItem('sb-example-auth-token', JSON.stringify(value)), session);
  const member = { id: actorId, choir_id: choirId, first_name: 'Test', last_name: 'Chef', voice_group: 'Alto',
    is_active: true, auth_user_id: user.id, email: user.email, join_date: '2026-01-01',
    schools: null, departments: null, repertoire: null };
  const target = { ...member, id: targetId, first_name: 'Synthetic', last_name: 'Chorist', auth_user_id: null };
  const counts = { tickets: 0, heads: 0, legacy: 0, projections: [] as string[], unexpected: [] as string[] };
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    const fulfill = (body: unknown, status = 200) => route.fulfill({ status,
      contentType: 'application/json', body: JSON.stringify(body) });
    if (url.origin === 'https://example.supabase.co') {
      if (url.pathname === '/auth/v1/user') return fulfill(user);
      if (url.pathname === '/functions/v1/assignment-file') {
        if (route.request().method() === 'POST') {
          expect(route.request().headers().authorization).toBe(`Bearer ${session.access_token}`);
          counts.tickets++;
          expect(route.request().postDataJSON()).toEqual({ fileId: versionId });
          return fulfill({ url: privateUrl, expiresAt: Date.now() + 60_000 });
        }
        expect(route.request().method()).toBe('HEAD');
        counts.heads++;
        return route.fulfill({ status: mode === 'denied' ? 403 : 200, body: '' });
      }
      if (url.pathname.startsWith('/rest/v1/')) {
        const table = url.pathname.split('/').pop();
        if (table === 'list_my_choirs') return fulfill([{ choir_id: choirId, member_id: actorId,
          choir_name: 'Synthetic Choir', choir_slug: 'synthetic', member_is_active: true, is_current: true }]);
        if (table === 'choir_members') return fulfill(url.searchParams.has('id')
          ? (url.searchParams.get('id') === `eq.${targetId}` ? target : member) : [member, target]);
        if (table === 'choir_member_roles') return fulfill([{ member_id: actorId, roles: { name: 'Şef' } }]);
        if (table === 'assignments') {
          const assignment = { id: assignmentId, title: 'Synthetic 095 homework', description: '',
            target_voice_group: 'Alto', deadline: '2099-10-01', is_active: true, created_at: '2026-10-01T00:00:00Z' };
          return fulfill(url.searchParams.has('id') ? assignment : [assignment]);
        }
        if (table === 'assignment_targets') return fulfill([{ assignment_id: assignmentId, member_id: targetId,
          choir_members: target }]);
        if (table === 'assignment_submissions') {
          const projection = url.searchParams.get('select') ?? '';
          counts.projections.push(projection);
          expect(projection.split(',').map((field) => field.trim())).toContain('current_file_version_id');
          return fulfill([{ id: '77777777-7777-4777-8777-777777777777', assignment_id: assignmentId,
            member_id: targetId, drive_file_id: mode === 'legacy' ? 'old-drive' : '',
            drive_web_view_link: legacyUrl, current_file_version_id: mode === 'legacy' ? null : versionId,
            file_name: 'synthetic-recording.wav', mime_type: 'audio/wav', status: 'pending',
            submitted_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' }]);
        }
        return fulfill([]);
      }
    }
    if (url.hostname === 'drive.google.com') counts.legacy++;
    counts.unexpected.push(`${route.request().method()} ${url.origin}${url.pathname}`);
    return route.abort('blockedbyclient');
  });
  return counts;
}

test('chorist page uses the immutable private version despite a stale Drive URL', async ({ page }) => {
  const counts = await installFixture(page, 'private');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/koristler/${targetId}`);
  const link = page.getByRole('link', { name: 'Dosyayı Aç' });
  await expect(link).toHaveAttribute('href', privateUrl);
  await expect(link).toHaveAttribute('data-genova-file-name', 'synthetic-recording.wav');
  await expect(link).toHaveAttribute('data-genova-mime-type', 'audio/wav');
  await expect(page.getByRole('link', { name: 'Ödevi Görüntüle' })).toHaveAttribute('href',
    `/odevler/${assignmentId}?mid=${targetId}&returnTo=%2Fkoristler%2F${targetId}`);
  expect(counts.tickets).toBe(1); expect(counts.heads).toBe(1);
  expect(counts.projections).toHaveLength(1);
  expect(counts.legacy).toBe(0); expect(counts.unexpected).toEqual([]); expect(errors).toEqual([]);
});

test('online private HEAD denial exposes no old Drive or private link', async ({ page }) => {
  const counts = await installFixture(page, 'denied');
  await page.goto(`/koristler/${targetId}`);
  await expect(page.getByText('Dosyaya erişilemiyor.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dosyayı Aç' })).toHaveCount(0);
  await expect(page.locator(`a[href="${legacyUrl}"]`)).toHaveCount(0);
  expect(counts.tickets).toBe(1); expect(counts.heads).toBe(1);
  expect(counts.legacy).toBe(0); expect(counts.unexpected).toEqual([]);
});

test('legacy-only submission still exposes its existing link without a private request', async ({ page }) => {
  const counts = await installFixture(page, 'legacy');
  await page.goto(`/koristler/${targetId}`);
  await expect(page.getByRole('link', { name: 'Dosyayı Aç' })).toHaveAttribute('href', legacyUrl);
  expect(counts.tickets).toBe(0); expect(counts.heads).toBe(0);
  expect(counts.legacy).toBe(0); expect(counts.unexpected).toEqual([]);
});

test('chorist to assignment-detail continuation keeps the private version and bridge metadata', async ({ page }) => {
  const counts = await installFixture(page, 'private');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/koristler/${targetId}`);
  await expect(page.getByRole('link', { name: 'Dosyayı Aç' })).toHaveAttribute('href', privateUrl);
  await page.getByRole('link', { name: 'Ödevi Görüntüle' }).click();
  await expect(page).toHaveURL(new RegExp(`/odevler/${assignmentId}\\?`));
  await expect(page.locator('a[data-genova-file-name="synthetic-recording.wav"]').first()).toHaveAttribute('href', privateUrl);
  await expect(page.locator(`a[href="${legacyUrl}"]`)).toHaveCount(0);
  expect(counts.heads).toBeGreaterThanOrEqual(2);
  expect(counts.legacy).toBe(0); expect(counts.unexpected).toEqual([]); expect(errors).toEqual([]);
});
