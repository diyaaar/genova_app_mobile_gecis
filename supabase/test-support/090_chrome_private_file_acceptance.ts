// Installed Chrome + production Next UI + local Auth/RLS/Edge; two named faults only.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Page } from '@playwright/test';
import { createRepertoireFileTicket } from '../functions/repertoire-file/ticket';

const api = 'http://127.0.0.1:54491';
const edge = 'http://127.0.0.1:8000';
const app = 'http://127.0.0.1:31090';
const browserFileEndpoint = `${api}/functions/v1/repertoire-file`;
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL, api);
assert.equal(process.env.API_URL, api);
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
assert.equal(anon, process.env.ANON_KEY);
const service = process.env.SERVICE_ROLE_KEY ?? '';
for (const [key, role] of [[anon, 'anon'], [service, 'service_role']] as const) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()) as {
    iss: string; role: string;
  };
  assert.equal(claims.iss, 'supabase-demo');
  assert.equal(claims.role, role);
}
const fixturePath = resolve('spike/093-runtime/.093-android-fixture.json');
type Fixture = { email: string; password: string; choirA: string; choirB: string;
  fileId: string; pdfSha256: string };

async function pick(page: Page, choirId: string, fixture: Fixture) {
  await page.goto(`${app}/repertuvar`);
  const choirName = choirId === fixture.choirA
    ? '091 synthetic choir A' : '091 synthetic choir B';
  const gate = page.getByRole('button', { name: choirName, exact: true });
  const select = page.getByLabel('Aktif koroyu değiştir');
  await Promise.race([gate.waitFor({ state: 'visible' }), select.waitFor({ state: 'visible' })]);
  if (await gate.isVisible()) await gate.click();
  else if (await select.inputValue() !== choirId) await select.selectOption(choirId);
  await page.waitForFunction(id =>
    (document.querySelector('select[aria-label="Aktif koroyu değiştir"]') as HTMLSelectElement)?.value === id,
  choirId);
}

async function main() {
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as Fixture;
  for (const id of [fixture.choirA, fixture.choirB, fixture.fileId]) {
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f-]{27}$/i);
  }
  const legacy = await createRepertoireFileTicket({ fileId: fixture.fileId,
    choirId: fixture.choirA }, service);
  const legacyUrl = new URL(browserFileEndpoint);
  legacyUrl.searchParams.set('fileId', fixture.fileId);
  legacyUrl.searchParams.set('ticket', legacy.token);
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const counts = { post: 0, legacyInjected: 0, legacyHead401: 0, bodyInjected: 0,
    successfulBody: 0, oldHead403: 0 };
  const v2Urls: string[] = [];
  try {
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === api && url.pathname === '/functions/v1/repertoire-file') {
        if (request.method() === 'GET' && url.searchParams.get('fileId') === fixture.fileId &&
          counts.bodyInjected === 0) {
          counts.bodyInjected += 1;
          // Named fault: a ticket validated by HEAD but failing on its first PDF body GET.
          await route.fulfill({ status: 401, headers: {
            'access-control-allow-origin': '*', 'cache-control': 'private, no-store',
            'content-type': 'text/plain; charset=utf-8',
          }, body: 'synthetic body failure' });
          return;
        }
        // Transport relay only: each request reaches the actual local Deno entrypoint.
        const response = await route.fetch({ url: `${edge}${url.search}` });
        if (request.method() !== 'POST' || response.status() !== 200) {
          await route.fulfill({ response }); return;
        }
        counts.post += 1;
        const body = await response.json() as { url: string; expiresAt: number };
        const fileId = JSON.parse(request.postData() ?? '{}') as { fileId?: string };
        if (fileId.fileId === fixture.fileId && counts.legacyInjected === 0) {
          counts.legacyInjected += 1;
          // Named fault: a previously issued v1 ticket returned once by an old server.
          await route.fulfill({ response, json: { url: legacyUrl.toString(),
            expiresAt: legacy.expiresAt } });
          return;
        }
        // Direct Deno binds /: normalize only the local transport URL to the web endpoint.
        const actualUrl = new URL(body.url, edge);
        assert.equal(actualUrl.origin, edge);
        const browserUrl = `${browserFileEndpoint}${actualUrl.search}`;
        if (fileId.fileId === fixture.fileId) v2Urls.push(browserUrl);
        await route.fulfill({ response, json: { ...body, url: browserUrl } });
        return;
      }
      if ([app, api].includes(url.origin) || ['data:', 'blob:'].includes(url.protocol)) {
        await route.continue(); return;
      }
      await route.abort('blockedbyclient');
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    page.on('response', response => {
      const url = new URL(response.url());
      if (`${url.origin}${url.pathname}` !== browserFileEndpoint ||
        url.searchParams.get('fileId') !== fixture.fileId) return;
      if (response.request().method() === 'HEAD' && response.status() === 401) counts.legacyHead401 += 1;
      if (response.request().method() === 'GET' && response.status() === 200) counts.successfulBody += 1;
      if (response.request().method() === 'HEAD' && response.status() === 403) counts.oldHead403 += 1;
    });
    await page.goto(`${app}/login`);
    await page.getByLabel('E-posta').fill(fixture.email);
    await page.getByLabel('Şifre', { exact: true }).fill(fixture.password);
    await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
    await page.waitForURL(`${app}/`);
    await pick(page, fixture.choirA, fixture);
    await page.getByText('091 score', { exact: true }).first().click();
    const canvas = page.locator('canvas.react-pdf__Page__canvas').first();
    try {
      await canvas.waitFor({ state: 'visible', timeout: 30_000 });
    } catch (error) {
      const visibleText = (await page.locator('body').innerText()).slice(0, 1200);
      console.error(JSON.stringify({ stage: 'pdf-canvas', url: page.url(), counts,
        v2UrlCount: v2Urls.length, visibleText }));
      await page.screenshot({ path: 'spike/090-runtime/chrome-diagnostic.png' });
      throw error;
    }
    assert.equal(await canvas.evaluate(element => (element as HTMLCanvasElement).width > 0), true);
    assert.equal(counts.legacyInjected, 1);
    assert.ok(counts.legacyHead401 >= 1, 'actual legacy HEAD 401 was not observed');
    assert.equal(counts.bodyInjected, 1);
    assert.ok(counts.post >= 3, 'v1 and body failure did not each cause a bounded new ticket');
    assert.ok(counts.post <= 3, 'more than one retry per failure');
    assert.ok(counts.successfulBody >= 1, 'authorized PDF body did not reach Chrome');
    const oldUrl = v2Urls.at(-1);
    assert.ok(oldUrl);
    console.log('PASS 090 Chrome actual UI: v1 HEAD 401 -> v2, one PDF body failure -> one retry and canvas');

    await pick(page, fixture.choirB, fixture);
    await page.getByText('091 audio', { exact: true }).first().waitFor({ state: 'visible' });
    assert.equal(await page.getByText('091 score', { exact: true }).count(), 0,
      'A repertoire remained in B catalog');
    const oldStatus = await page.evaluate(async url => (await fetch(url, {
      method: 'HEAD', cache: 'no-store',
    })).status, oldUrl);
    assert.equal(oldStatus, 403);
    assert.ok(counts.oldHead403 >= 1);
    console.log('PASS 090 Chrome actual UI: B-only catalogue and already-issued A URL HEAD 403');
    console.log(`PASS 090 Chrome counters post=${counts.post} injected=v1:${counts.legacyInjected},body:${counts.bodyInjected} observed=legacy401:${counts.legacyHead401},body200:${counts.successfulBody},old403:${counts.oldHead403}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : '090 Chrome acceptance failed');
  process.exitCode = 1;
});
