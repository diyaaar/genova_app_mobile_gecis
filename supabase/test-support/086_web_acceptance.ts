// Real local-service/browser acceptance. No mock responses or hosted fallback.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { chromium, type Page } from '@playwright/test';

const root = resolve(process.cwd());
const runtime = resolve(process.env.GENOVA_086_RUNTIME ?? '');
assert.equal(runtime, resolve(root, 'spike/086-runtime'));
const api = process.env.NEXT_PUBLIC_SUPABASE_URL!;
assert.equal(new URL(api).origin, 'http://127.0.0.1:54381');
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
assert.equal(JSON.parse(Buffer.from(service.split('.')[1], 'base64url').toString()).role, 'service_role');
const app = 'http://127.0.0.1:31086';
const admin = createClient(api, service, { auth: { persistSession: false, autoRefreshToken: false } });
const userClient = () => createClient(api, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const file = resolve(runtime, 'fixture.json');
type Identity = { id: string; email: string; password: string };
type Choir = { id: string; founderMemberId: string; name: string; token: string;
  schoolId: string; departmentId: string; songId: string };
type Fixture = { operator: Identity; founderA: Identity; founderB: Identity; shared: Identity;
  wrong: Identity; A: Choir; B: Choir };
function sql(statement: string) {
  // Connection URL stays in the private child environment, not command arguments/output.
  const db = new URL(process.env.DB_URL!);
  assert.equal(db.hostname, '127.0.0.1'); assert.equal(db.port, '54382');
  assert.equal(db.pathname, '/postgres');
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', statement], {
    env: { ...process.env, PGHOST: db.hostname, PGPORT: db.port,
      PGUSER: decodeURIComponent(db.username), PGPASSWORD: decodeURIComponent(db.password), PGDATABASE: 'postgres' },
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function ok(error: unknown, stage: string): asserts error is null {
  if (error) throw new Error(`086 ${stage} failed (private diagnostics omitted)`);
}
async function identity(label: string): Promise<Identity> {
  const email = `${label}-086@example.invalid`, password = randomBytes(24).toString('base64url');
  const result = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  ok(result.error, `create synthetic ${label}`); assert.ok(result.data.user);
  return { id: result.data.user.id, email, password };
}
async function login(client: SupabaseClient, value: Identity) {
  const result = await client.auth.signInWithPassword({ email: value.email, password: value.password });
  ok(result.error, 'synthetic sign-in'); assert.ok(result.data.session);
}
async function prepare() {
  const operator = await identity('operator'), founderA = await identity('founder-a');
  const founderB = await identity('founder-b'), shared = await identity('shared'), wrong = await identity('wrong');
  await writeFile(resolve(runtime, 'preparation.json'), JSON.stringify({ operator, founderA, founderB, shared, wrong }), { mode: 0o600 });
  sql(`insert into genova_007.platform_operators(auth_user_id) values('${operator.id}')`);
  const operatorClient = userClient(); await login(operatorClient, operator);
  async function choir(label: 'A' | 'B', founder: Identity): Promise<Choir> {
    const name = `086 Independent Choir ${label}`;
    const created = await operatorClient.functions.invoke('create-choir', { body: {
      choirName: name, choirSlug: `fixture-086-${label.toLowerCase()}`, founderAuthUserId: founder.id,
      founderFirstName: 'Founder', founderLastName: label,
    } });
    ok(created.error, `create choir ${label}`); assert.ok(created.data?.choir?.choirId);
    const id = created.data.choir.choirId as string;
    const chef = userClient(); await login(chef, founder);
    const invited = await chef.functions.invoke('choir-invitations', { body: {
      action: 'create', choirId: id, email: shared.email,
      firstName: 'Shared', lastName: label, voiceGroup: label === 'A' ? 'Alto' : 'Bass',
    } });
    ok(invited.error, `invite ${label}`); assert.equal(typeof invited.data?.token, 'string');
    // Catalog provisioning is explicitly manual/service fixture setup, not operator UI.
    const school = await admin.from('schools').insert({ choir_id: id, name: `086 School ${label}` }).select('id').single();
    ok(school.error, 'school');
    const department = await admin.from('departments').insert({ choir_id: id, name: `086 Department ${label}` }).select('id').single();
    ok(department.error, 'department');
    // Synthetic readiness metadata only: no real Drive ID, file body or provider call.
    const song = await chef.from('repertoire').insert({ choir_id: id, title: `086 Song ${label}`,
      is_visible: true, drive_folder_id: `086-synthetic-no-provider-${label}` }).select('id').single();
    ok(song.error, 'song');
    return { id, founderMemberId: created.data.choir.memberId as string, name, token: invited.data.token as string,
      schoolId: school.data!.id as string, departmentId: department.data!.id as string, songId: song.data!.id as string };
  }
  const A = await choir('A', founderA), B = await choir('B', founderB);
  await writeFile(file, JSON.stringify({ operator, founderA, founderB, shared, wrong, A, B }), { mode: 0o600, flag: 'wx' });
  console.log('PASS actual Auth identities, 007 Edge fresh choirs and 008 Edge invitations; manual catalogs labeled');
}

async function authed(page: Page, path: string, body?: unknown) {
  return page.evaluate(async ({ api, anon, path, body }) => {
    const key = Object.keys(localStorage).find(k => k.endsWith('-auth-token'));
    if (!key) throw new Error('086 browser has no Auth session');
    const session = JSON.parse(localStorage.getItem(key)!);
    const token = session.access_token ?? session.currentSession?.access_token;
    if (!token) throw new Error('086 browser token missing');
    const base = path.startsWith('/api/') ? location.origin : api;
    const result = await fetch(`${base}${path}`, { method: body === undefined ? 'GET' : 'POST',
      headers: { apikey: anon, authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const text = await result.text();
    return { status: result.status, data: (() => { try { return JSON.parse(text); } catch { return null; } })() };
  }, { api, anon, path, body });
}
async function pick(page: Page, choir: Choir) {
  const gate = page.getByRole('button', { name: choir.name, exact: true });
  const select = page.getByLabel('Aktif koroyu değiştir');
  await Promise.race([gate.waitFor({ state: 'visible' }), select.waitFor({ state: 'visible' })]);
  if (await gate.isVisible()) await gate.click();
  else if (await select.inputValue() !== choir.id) await select.selectOption(choir.id);
  await page.waitForFunction(id => (document.querySelector('select[aria-label="Aktif koroyu değiştir"]') as HTMLSelectElement)?.value === id, choir.id);
}
async function browserAcceptance() {
  const f = JSON.parse(await readFile(file, 'utf8')) as Fixture;
  const browser = await chromium.launch({ headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const context = await browser.newContext();
  // Only deny external destinations; no service response is fabricated.
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return [app, api].includes(url.origin) || ['data:', 'blob:'].includes(url.protocol)
      ? route.continue() : route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const summary: Record<string, string | number> = { browser: 'installed Chrome 153', runtime: 'local actual Auth/REST/Edge/Next', mocks: 0 };
  try {
    // First real client/server flow before the wider product matrix.
    await page.goto(`${app}/invite#invite=${f.A.token}`);
    await page.getByLabel('E-posta').fill(f.wrong.email);
    await page.getByLabel('Şifre', { exact: true }).fill(f.wrong.password);
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();
    const wrongResponse = page.waitForResponse(r => r.url() === `${api}/functions/v1/choir-invitations` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Daveti kabul et', exact: true }).click();
    assert.equal((await wrongResponse).status(), 400);
    assert.equal(sql(`select count(*) from public.choir_members where auth_user_id='${f.wrong.id}'`), '0');
    await page.getByRole('button', { name: 'Başka hesapla giriş yap', exact: true }).click();
    summary.wrongRecipient = 'PASS';
    await page.getByLabel('E-posta').fill(f.shared.email);
    await page.getByLabel('Şifre', { exact: true }).fill(f.shared.password);
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();
    await page.getByRole('button', { name: 'Daveti kabul et', exact: true }).click();
    await page.waitForURL(`${app}/`);
    // A single membership auto-selects; the switcher intentionally appears only for >=2.
    await page.waitForFunction(() => !document.body.textContent?.includes('Yükleniyor'));
    const firstCurrent = await authed(page, '/rest/v1/rpc/current_choir_id', {});
    assert.equal(firstCurrent.status, 200); assert.equal(firstCurrent.data, f.A.id);
    assert.equal(sql(`select count(*) from public.choir_members where auth_user_id='${f.shared.id}'`), '1');
    console.log('PASS EARLY real browser invitation -> Edge -> RPC membership -> selected choir');
    summary.firstInvitation = 'PASS';
    await page.goto(`${app}/invite#invite=${f.B.token}`);
    await page.getByRole('button', { name: 'Daveti kabul et', exact: true }).click();
    await page.waitForURL(`${app}/`);
    assert.equal(sql(`select count(*) from public.choir_members where auth_user_id='${f.shared.id}'`), '2');
    summary.secondInvitation = 'PASS';
    await pick(page, f.A);
    const memberA = sql(`select id from public.choir_members where auth_user_id='${f.shared.id}' and choir_id='${f.A.id}'`);
    const memberB = sql(`select id from public.choir_members where auth_user_id='${f.shared.id}' and choir_id='${f.B.id}'`);
    // Actual founder JWT/RPC; assignment targets were created by invitation, not fixtures.
    for (const [choir, founder, member, part] of [[f.A,f.founderA,memberA,'Alto'],[f.B,f.founderB,memberB,'Bass']] as const) {
      const client = userClient(); await login(client, founder);
      const assigned = await client.rpc('replace_repertoire_assignments', { p_song_id: choir.songId,
        p_part_name: part, p_member_ids: [member], p_expected_member_ids: [] });
      ok(assigned.error, 'assignment');
    }
    async function profile(choir: Choir, other: Choir) {
      await pick(page, choir); await page.goto(`${app}/profil/duzenle`);
      await page.getByLabel('Okul', { exact: true }).waitFor({ state: 'visible' });
      await page.waitForFunction(() => !(document.querySelector('select[aria-label="Okul"]') as HTMLSelectElement)?.disabled);
      const options = await page.getByLabel('Okul', { exact: true }).locator('option').evaluateAll(elements => elements.map(x => (x as HTMLOptionElement).value));
      assert.ok(options.includes(choir.schoolId)); assert.ok(!options.includes(other.schoolId));
      await page.getByLabel('Okul', { exact: true }).selectOption(choir.schoolId);
      await page.getByLabel('Bölüm', { exact: true }).selectOption(choir.departmentId);
      await page.getByPlaceholder('Kendin hakkında kısa bir not...').fill(`086 profile ${choir.name}`);
      const sent = page.waitForResponse(r => r.url() === `${app}/api/profile-change-requests/submit` && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Değişiklikleri Onaya Gönder', exact: true }).click();
      assert.equal((await sent).status(), 200);
      assert.equal(sql(`select count(*) from public.profile_change_requests where choir_id='${choir.id}' and changes_json->>'school_id'='${choir.schoolId}'`), '1');
      await page.goto(`${app}/repertuvar`);
      await page.getByText(`086 Song ${choir === f.A ? 'A' : 'B'}`, { exact: true }).first().waitFor();
      assert.equal(await page.getByText(`086 Song ${choir === f.A ? 'B' : 'A'}`, { exact: true }).count(), 0);
      const rows = await authed(page, '/rest/v1/song_assignments?select=member_id');
      assert.equal(rows.status, 200); assert.deepEqual(rows.data.map((x: { member_id: string }) => x.member_id), [choir === f.A ? memberA : memberB]);
    }
    await profile(f.A, f.B); await profile(f.B, f.A);
    summary.profileCatalogAssignmentAB = 'PASS';
    // Same Auth session across two real tabs; hold an actual A form request before send.
    await pick(page, f.A); await page.goto(`${app}/profil/duzenle`);
    await page.getByPlaceholder('Kendin hakkında kısa bir not...').fill('086 delayed must never persist');
    let release!: () => void, observed!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    const seen = new Promise<void>(resolve => { observed = resolve; });
    await page.route(`${app}/api/profile-change-requests/submit`, async route => { observed(); await held; await route.continue(); });
    const delayed = page.waitForResponse(r => r.url() === `${app}/api/profile-change-requests/submit` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Değişiklikleri Onaya Gönder', exact: true }).click(); await seen;
    const otherTab = await context.newPage(); await otherTab.goto(`${app}/profil`);
    const switched = await authed(otherTab, '/rest/v1/rpc/set_active_choir', { p_choir_id: f.B.id });
    release(); assert.equal(switched.status, 200); assert.equal((await delayed).status(), 409);
    assert.equal(sql("select count(*) from public.profile_change_requests where changes_json->>'about_text'='086 delayed must never persist'"), '0');
    await page.unroute(`${app}/api/profile-change-requests/submit`);
    summary.sameSessionDelayedProfile = 'PASS';
    const foreign = await authed(otherTab, '/rest/v1/repertoire?select=id');
    assert.equal(foreign.status, 200); assert.deepEqual(foreign.data.map((x: { id: string }) => x.id), [f.B.songId]);
    const profileSnapshot = () => sql("select md5(coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'')) from public.profile_change_requests x");
    const beforeRefusal = profileSnapshot();
    const changed = await authed(otherTab, '/api/profile-change-requests/submit', { expected_choir_id: f.B.id, changes: { school_id: f.A.schoolId } });
    assert.equal(changed.status, 400);
    assert.equal(profileSnapshot(), beforeRefusal);
    summary.foreignReference = 'PASS';
    sql(`update public.choir_members set is_active=false where id='${memberB}'`);
    const revoked = await authed(otherTab, '/rest/v1/rpc/current_choir_id', {});
    assert.equal(revoked.status, 200); assert.equal(revoked.data, null);
    const empty = await authed(otherTab, '/rest/v1/repertoire?select=id');
    assert.equal(empty.status, 200); assert.deepEqual(empty.data, []);
    const refusedWrite = await authed(otherTab, '/api/profile-change-requests/submit', {
      expected_choir_id: f.B.id, changes: { about_text: '086 revoked must never persist' },
    });
    // Current tenant-client missing-context error maps to 500, not a polished 401/403.
    // This verifies fail-closed data behavior only; retain the error-contract debt.
    assert.equal(refusedWrite.status, 500); assert.equal(profileSnapshot(), beforeRefusal);
    summary.selectedMembershipRevocation = 'PASS';
    summary.revocationErrorContract = 'FAIL-CLOSED 500; 401/403 UX debt remains';
    await writeFile(resolve(runtime, 'browser-summary.json'), JSON.stringify(summary, null, 2), { mode: 0o600 });
    console.log('PASS real two-choir invitation/profile/catalog/assignment and stale/foreign/revoked browser matrix');
  } finally { await context.close(); await browser.close(); }
}

async function main() {
  const action = process.argv[2];
  if (action === 'prepare') await prepare();
  else if (action === 'browser') await browserAcceptance();
  else if (action === 'verify-reset') {
    const f = JSON.parse(await readFile(file, 'utf8')) as Fixture;
    const identities = [f.operator, f.founderA, f.founderB, f.shared, f.wrong];
    assert.ok(identities.every(x => x.email.endsWith('-086@example.invalid')));
    const users = await admin.auth.admin.listUsers(); ok(users.error, 'verify reset identities');
    assert.equal(users.data.users.length, 5);
    assert.deepEqual(users.data.users.map(x => x.id).sort(), identities.map(x => x.id).sort());
    assert.equal(sql(`select count(*)=2 and bool_and(id in ('${f.A.id}','${f.B.id}')) from public.choirs`), 't');
    console.log('PASS reset target contains exactly the five owned identities and two fixture choirs');
  }
  else if (action === 'cleanup-partial-auth') {
    assert.equal(sql('select count(*) from public.choirs'), '0');
    const users = await admin.auth.admin.listUsers(); ok(users.error, 'list partial fixture identities');
    const allowed = ['operator', 'founder-a', 'founder-b', 'shared', 'wrong'].map(x => `${x}-086@example.invalid`);
    assert.equal(users.data.users.length, 5);
    assert.ok(users.data.users.every(x => allowed.includes(x.email ?? '')));
    for (const user of users.data.users) ok((await admin.auth.admin.deleteUser(user.id)).error, 'remove partial Auth fixture');
    assert.equal(sql('select count(*) from auth.users'), '0');
    console.log('PASS exactly five partial synthetic Auth fixtures removed');
  }
  else throw new Error('086 prepare/browser action required');
}
main().catch(async (error: unknown) => {
  // Playwright errors can quote URLs/input arguments. Never print ephemeral secrets.
  let message = error instanceof Error ? error.message : '086 acceptance failed';
  try {
    const secrets = JSON.parse(await readFile(file, 'utf8')) as Fixture;
    for (const value of [secrets.operator.password, secrets.founderA.password, secrets.founderB.password,
      secrets.shared.password, secrets.wrong.password, secrets.A.token, secrets.B.token]) {
      message = message.replaceAll(value, '[redacted]');
    }
  } catch { /* fixture may not exist after a failed preparation */ }
  console.error(message.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[JWT]').slice(0, 1200));
  process.exitCode = 1;
});
