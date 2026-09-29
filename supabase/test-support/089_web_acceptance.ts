// Real local-service/browser acceptance. No mock responses or hosted fallback.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { chromium, type Page } from '@playwright/test';

const root = resolve(process.cwd());
const runtime = resolve(process.env.GENOVA_089_RUNTIME ?? '');
assert.equal(runtime, resolve(root, 'spike/089-runtime'));
const api = process.env.NEXT_PUBLIC_SUPABASE_URL!;
assert.equal(new URL(api).origin, 'http://127.0.0.1:54391');
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
assert.equal(JSON.parse(Buffer.from(service.split('.')[1], 'base64url').toString()).role, 'service_role');
const app = 'http://127.0.0.1:31089';
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
  assert.equal(db.hostname, '127.0.0.1'); assert.equal(db.port, '54392');
  assert.equal(db.pathname, '/postgres');
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', statement], {
    env: { ...process.env, PGHOST: db.hostname, PGPORT: db.port,
      PGUSER: decodeURIComponent(db.username), PGPASSWORD: decodeURIComponent(db.password), PGDATABASE: 'postgres' },
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function ok(error: unknown, stage: string): asserts error is null {
  if (error) throw new Error(`089 ${stage} failed (private diagnostics omitted)`);
}
async function identity(label: string): Promise<Identity> {
  const email = `${label}-089@example.invalid`, password = randomBytes(24).toString('base64url');
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
    const name = `089 Independent Choir ${label}`;
    const created = await operatorClient.functions.invoke('create-choir', { body: {
      choirName: name, choirSlug: `fixture-089-${label.toLowerCase()}`, founderAuthUserId: founder.id,
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
    const school = await admin.from('schools').insert({ choir_id: id, name: `089 School ${label}` }).select('id').single();
    ok(school.error, 'school');
    const department = await admin.from('departments').insert({ choir_id: id, name: `089 Department ${label}` }).select('id').single();
    ok(department.error, 'department');
    // Synthetic readiness metadata only: no real Drive ID, file body or provider call.
    const song = await chef.from('repertoire').insert({ choir_id: id, title: `089 Song ${label}`,
      is_visible: true, drive_folder_id: `089-synthetic-no-provider-${label}` }).select('id').single();
    ok(song.error, 'song');
    return { id, founderMemberId: created.data.choir.memberId as string, name, token: invited.data.token as string,
      schoolId: school.data!.id as string, departmentId: department.data!.id as string, songId: song.data!.id as string };
  }
  const A = await choir('A', founderA), B = await choir('B', founderB);
  // Manual synthetic cross-choir chef setup, NOT administration UX acceptance.
  sql(`insert into public.choir_members(choir_id,auth_user_id,first_name,last_name,join_date,is_active)
    values('${B.id}','${founderA.id}','Cross','Chef',current_date,true);
    insert into public.choir_member_roles(choir_id,member_id,role_id)
    select '${B.id}',m.id,r.id from public.choir_members m join public.roles r on r.choir_id=m.choir_id
    where m.choir_id='${B.id}' and m.auth_user_id='${founderA.id}' and r.name='Şef';`);
  await writeFile(file, JSON.stringify({ operator, founderA, founderB, shared, wrong, A, B }), { mode: 0o600, flag: 'wx' });
  console.log('PASS actual Auth identities, 007 Edge fresh choirs and 008 Edge invitations; manual catalogs labeled');
}

async function authed(page: Page, path: string, body?: unknown) {
  return page.evaluate(async ({ api, anon, path, body }) => {
    const key = Object.keys(localStorage).find(k => k.endsWith('-auth-token'));
    if (!key) throw new Error('089 browser has no Auth session');
    const session = JSON.parse(localStorage.getItem(key)!);
    const token = session.access_token ?? session.currentSession?.access_token;
    if (!token) throw new Error('089 browser token missing');
    const base = path.startsWith('/api/') ? location.origin : api;
    const result = await fetch(`${base}${path}`, { method: body === undefined ? 'GET' : 'POST',
      headers: { apikey: anon, authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const text = await result.text();
    return { status: result.status, data: (() => { try { return JSON.parse(text); } catch { return null; } })() };
  }, { api, anon, path, body });
}
async function pick(page: Page, choir: Choir) {
  // TopBar/switcher is intentionally absent on profile routes. Use the real main UI.
  await page.goto(`${app}/repertuvar`);
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
  const contexts: import('@playwright/test').BrowserContext[] = [];
  async function pageFor() {
    const context = await browser.newContext(); contexts.push(context);
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return [app, api].includes(url.origin) || ['data:', 'blob:'].includes(url.protocol)
        ? route.continue() : route.abort('blockedbyclient');
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000); return page;
  }
  const shared = await pageFor(), chef = await pageFor(), otherChef = await pageFor();
  const summary: Record<string, string | number> = { browser: browser.version(), runtime: 'actual local Chrome/Auth/REST/RLS/Next/PG17', mocks: 0 };
  const snapshot = () => sql("select md5(jsonb_build_array((select jsonb_agg(to_jsonb(m) order by id) from public.choir_members m),(select jsonb_agg(to_jsonb(r) order by id) from public.profile_change_requests r))::text)");
  async function signIn(page: Page, person: Identity) {
    await page.goto(`${app}/login`);
    await page.getByLabel('E-posta').fill(person.email);
    await page.getByLabel('Şifre', { exact: true }).fill(person.password);
    await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
    await page.waitForURL(`${app}/`);
  }
  async function submit(page: Page, choir: Choir, value: string, catalog = false) {
    if (await page.getByLabel('Aktif koroyu değiştir').count()) await pick(page, choir);
    await page.goto(`${app}/profil/duzenle`);
    await page.getByLabel('Okul', { exact: true }).waitFor({ state: 'visible' });
    await page.waitForFunction(() => !(document.querySelector('select[aria-label="Okul"]') as HTMLSelectElement)?.disabled);
    await page.getByPlaceholder('Kendin hakkında kısa bir not...').fill(value);
    if (catalog) {
      const options = await page.getByLabel('Okul', { exact: true }).locator('option').evaluateAll(xs => xs.map(x => (x as HTMLOptionElement).value));
      assert.ok(options.includes(choir.schoolId)); assert.ok(!options.includes(choir === f.A ? f.B.schoolId : f.A.schoolId));
      await page.getByLabel('Okul', { exact: true }).selectOption(choir.schoolId);
      await page.getByLabel('Bölüm', { exact: true }).selectOption(choir.departmentId);
      await page.getByLabel('Favori Eser', { exact: true }).selectOption(choir.songId);
    }
    const sent = page.waitForResponse(r => r.url() === `${app}/api/profile-change-requests/submit` && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Değişiklikleri Onaya Gönder', exact: true }).click();
    const response = await sent; assert.equal(response.status(), 200);
    const data = await response.json(); assert.ok(data.id);
    assert.equal(sql(`select choir_id from public.profile_change_requests where id='${data.id}'`), choir.id);
    return data.id as string;
  }
  async function reviewUI(choir: Choir, rid: string, action: 'approve'|'reject', reason?: string) {
    await pick(chef, choir); await chef.goto(`${app}/profil/degisiklikler`);
    await chef.getByText('Profil Değişiklik Talepleri', { exact: true }).waitFor();
    await chef.getByRole('button', { name: new RegExp(`Shared ${choir === f.A ? 'A' : 'B'}.*değişiklik`) }).first().click();
    const fields = JSON.parse(sql(`select changes_json from public.profile_change_requests where id='${rid}'`));
    if (fields.school_id) {
      const letter = choir === f.A ? 'A' : 'B';
      await chef.getByText(`089 School ${letter}`, { exact: true }).waitFor();
      await chef.getByText(`089 Department ${letter}`, { exact: true }).waitFor();
      await chef.getByText(`089 Song ${letter}`, { exact: true }).waitFor();
      assert.equal(await chef.getByText(choir.schoolId, { exact: true }).count(), 0);
    }
    if (reason) await chef.getByPlaceholder('Reddetme nedenini belirt...').fill(reason);
    const sent = chef.waitForResponse(r => r.url() === `${app}/api/profile-change-requests/review` && r.request().method() === 'POST');
    await chef.getByRole('button', { name: action === 'approve' ? 'Onayla' : 'Reddet', exact: true }).click();
    const response = await sent; assert.equal(response.status(), 200);
    const data = await response.json(); assert.equal(data.id, rid); assert.equal(data.status, action === 'approve' ? 'approved' : 'rejected');
    assert.equal(data.reviewedBy, sql(`select id from public.choir_members where choir_id='${choir.id}' and auth_user_id='${f.founderA.id}'`));
    await chef.getByRole('button', { name: new RegExp(`Shared ${choir === f.A ? 'A' : 'B'}.*${action === 'approve' ? 'Onaylandı' : 'Reddedildi'}`) }).first().waitFor();
    return data;
  }
  async function profileShows(choir: Choir, value: string) {
    await pick(shared, choir); await shared.goto(`${app}/profil`);
    await shared.getByText(value, { exact: true }).waitFor();
    await shared.goto(`${app}/profil/duzenle`);
    await shared.getByPlaceholder('Kendin hakkında kısa bir not...').waitFor();
    await shared.waitForFunction(expected => (document.querySelector('textarea[placeholder="Kendin hakkında kısa bir not..."]') as HTMLTextAreaElement)?.value === expected, value);
    assert.equal(await shared.getByPlaceholder('Kendin hakkında kısa bir not...').inputValue(), value);
  }
  async function refused(page: Page, rid: string, status: number, action = 'approve') {
    const before = snapshot();
    const result = await authed(page, '/api/profile-change-requests/review', { requestId: rid, action });
    assert.equal(result.status, status); assert.equal(snapshot(), before);
  }
  try {
    await shared.goto(`${app}/invite#invite=${f.A.token}`);
    await shared.getByLabel('E-posta').fill(f.shared.email);
    await shared.getByLabel('Şifre', { exact: true }).fill(f.shared.password);
    await shared.getByRole('button', { name: 'Giriş yap', exact: true }).click();
    await shared.getByRole('button', { name: 'Daveti kabul et', exact: true }).click();
    await shared.waitForURL(`${app}/`);
    const memberA = sql(`select id from public.choir_members where choir_id='${f.A.id}' and auth_user_id='${f.shared.id}'`);
    await signIn(chef, f.founderA); await pick(chef, f.A);
    const early = await submit(shared, f.A, '089 approved A', true);
    assert.equal(sql(`select status from public.profile_change_requests where id='${early}'`), 'pending');
    assert.equal(sql(`select about_text is null from public.choir_members where id='${memberA}'`), 't');
    await reviewUI(f.A, early, 'approve');
    assert.equal(sql(`select about_text from public.choir_members where id='${memberA}'`), '089 approved A');
    console.log('PASS EARLY actual profile form -> pending RPC -> chef UI approval -> member + history');
    summary.earlyConnectedApproval = 'PASS';

    await shared.goto(`${app}/invite#invite=${f.B.token}`);
    await shared.getByRole('button', { name: 'Daveti kabul et', exact: true }).click(); await shared.waitForURL(`${app}/`);
    assert.equal(sql(`select count(*) from public.choir_members where auth_user_id='${f.shared.id}'`), '2');
    const memberB = sql(`select id from public.choir_members where choir_id='${f.B.id}' and auth_user_id='${f.shared.id}'`);
    await pick(shared, f.A); await profileShows(f.A, '089 approved A');
    await shared.goto(`${app}/profil/degisiklikler`);
    await shared.getByText('Onaylandı', { exact: true }).first().waitFor();
    const aReject = await submit(shared, f.A, '089 rejected A');
    await reviewUI(f.A, aReject, 'reject', '089 A reason');
    assert.equal(sql(`select about_text from public.choir_members where id='${memberA}'`), '089 approved A');
    assert.equal(sql(`select reject_reason from public.profile_change_requests where id='${aReject}'`), '089 A reason');
    await profileShows(f.A, '089 approved A');

    await pick(shared, f.B);
    const bApprove = await submit(shared, f.B, '089 approved B', true);
    await reviewUI(f.B, bApprove, 'approve');
    await profileShows(f.B, '089 approved B');
    const bReject = await submit(shared, f.B, '089 rejected B');
    await reviewUI(f.B, bReject, 'reject', '089 B reason');
    assert.equal(sql(`select about_text from public.choir_members where id='${memberB}'`), '089 approved B');
    await shared.goto(`${app}/profil/degisiklikler`);
    await shared.getByRole('button', { name: /değişiklik.*Reddedildi/ }).first().click();
    await shared.getByText('089 B reason', { exact: true }).waitFor();
    const bRows = await authed(shared, '/rest/v1/profile_change_requests?select=id,status');
    assert.equal(bRows.status, 200); assert.deepEqual(bRows.data.map((x:{id:string})=>x.id).sort(), [bApprove,bReject].sort());
    await pick(shared, f.A);
    const aRows = await authed(shared, '/rest/v1/profile_change_requests?select=id,status');
    assert.equal(aRows.status, 200); assert.deepEqual(aRows.data.map((x:{id:string})=>x.id).sort(), [early,aReject].sort());
    summary.ownABApproveRejectProfileHistory = 'PASS';
    console.log('PASS actual A/B form + chef approve/reject UI, member profiles/history and scoped reads');

    await signIn(otherChef, f.founderB);
    await refused(otherChef, early, 404);
    await pick(shared, f.A); await refused(shared, aReject, 403);
    await pick(chef, f.A); await refused(chef, early, 409);
    let before = snapshot();
    assert.equal((await authed(shared, '/api/profile-change-requests/submit', {
      expected_choir_id: f.A.id, changes: { school_id: f.B.schoolId },
    })).status, 400); assert.equal(snapshot(), before);
    summary.foreignNonChefFinalizedRefusals = 'PASS';

    // Hold real A form before dispatch; same authenticated session switches in another tab.
    await shared.goto(`${app}/profil/duzenle`);
    await shared.getByPlaceholder('Kendin hakkında kısa bir not...').fill('089 stale submit');
    let release!: () => void, seen!: () => void;
    let held = new Promise<void>(r => { release=r; }), observed = new Promise<void>(r => { seen=r; });
    await shared.route(`${app}/api/profile-change-requests/submit`, async route=>{seen();await held;await route.continue();});
    const staleResponse = shared.waitForResponse(r=>r.url()===`${app}/api/profile-change-requests/submit`&&r.request().method()==='POST');
    await shared.getByRole('button',{name:'Değişiklikleri Onaya Gönder',exact:true}).click();await observed;
    const sharedTab = await shared.context().newPage();await sharedTab.goto(`${app}/profil`);
    assert.equal((await authed(sharedTab,'/rest/v1/rpc/set_active_choir',{p_choir_id:f.B.id})).status,200);
    before=snapshot();release();assert.equal((await staleResponse).status(),409);assert.equal(snapshot(),before);
    await shared.unroute(`${app}/api/profile-change-requests/submit`);

    await shared.goto(`${app}/profil`); await pick(shared, f.A);
    const pending = await submit(shared,f.A,'089 authority draft');
    await pick(chef,f.A);await chef.goto(`${app}/profil/degisiklikler`);
    await chef.getByRole('button',{name:/Shared A.*değişiklik/}).first().click();
    held=new Promise<void>(r=>{release=r;});observed=new Promise<void>(r=>{seen=r;});
    await chef.route(`${app}/api/profile-change-requests/review`,async route=>{seen();await held;await route.continue();});
    const delayed=chef.waitForResponse(r=>r.url()===`${app}/api/profile-change-requests/review`&&r.request().method()==='POST');
    await chef.getByRole('button',{name:'Onayla',exact:true}).click();await observed;
    const chefTab=await chef.context().newPage();await chefTab.goto(`${app}/profil`);
    assert.equal((await authed(chefTab,'/rest/v1/rpc/set_active_choir',{p_choir_id:f.B.id})).status,200);
    before=snapshot();release();assert.equal((await delayed).status(),404);assert.equal(snapshot(),before);
    await chef.unroute(`${app}/api/profile-change-requests/review`);
    summary.sameSessionStaleSubmitReview = 'PASS';

    assert.equal((await authed(chefTab,'/rest/v1/rpc/set_active_choir',{p_choir_id:f.A.id})).status,200);
    const roleA=sql(`select id from public.roles where choir_id='${f.A.id}' and name='Şef'`);
    sql(`delete from public.choir_member_roles where member_id='${f.A.founderMemberId}' and role_id='${roleA}'`);
    await refused(chefTab,pending,403);
    sql(`insert into public.choir_member_roles(choir_id,member_id,role_id) values('${f.A.id}','${f.A.founderMemberId}','${roleA}')`);
    sql(`update public.choir_members set is_active=false where id='${f.A.founderMemberId}'`);
    const current=await authed(chefTab,'/rest/v1/rpc/current_choir_id',{});
    assert.equal(current.status,200);assert.equal(current.data,null);
    await refused(chefTab,pending,403);
    sql(`update public.choir_members set is_active=true where id='${f.A.founderMemberId}'`);
    sql(`update public.choir_members set is_active=false where id='${memberA}'`);
    await refused(chefTab,pending,400);
    before=snapshot();
    const inactiveSubmit=await authed(shared,'/api/profile-change-requests/submit',{
      expected_choir_id:f.A.id,changes:{about_text:'089 revoked submit'},
    });
    assert.equal(inactiveSubmit.status,403);assert.equal(snapshot(),before);
    const rejected=await authed(chefTab,'/api/profile-change-requests/review',{requestId:pending,action:'reject',rejectReason:'inactive'});
    assert.equal(rejected.status,200);
    assert.equal(sql(`select status from public.profile_change_requests where id='${pending}'`),'rejected');
    assert.equal(sql(`select about_text from public.choir_members where id='${memberA}'`),'089 approved A');
    summary.roleActorTargetRevocation = 'PASS';
    await writeFile(resolve(runtime,'browser-summary.json'),JSON.stringify(summary,null,2),{mode:0o600});
    console.log('PASS actual foreign/non-chef/finalized/stale/role/actor/target/refused-submit matrix');
  } finally { for(const context of contexts)await context.close();await browser.close(); }
}

async function main() {
  const action = process.argv[2];
  if (action === 'prepare') await prepare();
  else if (action === 'browser') await browserAcceptance();
  else if (action === 'inspect-labels') {
    const f = JSON.parse(await readFile(file,'utf8')) as Fixture;
    const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const context = await browser.newContext();
    await context.route('**/*',route=>[app,api].includes(new URL(route.request().url()).origin)?route.continue():route.abort('blockedbyclient'));
    try {
      const page=await context.newPage(); await page.goto(`${app}/login`);
      await page.getByLabel('E-posta').fill(f.founderA.email);await page.getByLabel('Şifre',{exact:true}).fill(f.founderA.password);
      await page.getByRole('button',{name:'Giriş Yap',exact:true}).click();await page.waitForURL(`${app}/`);
      await pick(page,f.A);await page.goto(`${app}/profil/degisiklikler`);
      await page.getByRole('button',{name:/Shared A.*Onaylandı/}).first().click();
      await page.getByText(f.A.schoolId,{exact:true}).waitFor();
      assert.equal(await page.getByText('089 School A',{exact:true}).count(),0);
      await page.getByText(f.A.departmentId,{exact:true}).waitFor();
      console.log('PASS RED actual chef history displays raw school/department UUIDs, not fresh choir catalog names');
    } finally {await context.close();await browser.close();}
  }
  else if (action === 'verify-reset') {
    const f = JSON.parse(await readFile(file, 'utf8')) as Fixture;
    const identities = [f.operator, f.founderA, f.founderB, f.shared, f.wrong];
    assert.ok(identities.every(x => x.email.endsWith('-089@example.invalid')));
    const users = await admin.auth.admin.listUsers(); ok(users.error, 'verify reset identities');
    assert.equal(users.data.users.length, 5);
    assert.deepEqual(users.data.users.map(x => x.id).sort(), identities.map(x => x.id).sort());
    assert.equal(sql(`select count(*)=2 and bool_and(id in ('${f.A.id}','${f.B.id}')) from public.choirs`), 't');
    console.log('PASS reset target contains exactly the five owned identities and two fixture choirs');
  }
  else if (action === 'cleanup-partial-auth') {
    assert.equal(sql('select count(*) from public.choirs'), '0');
    const users = await admin.auth.admin.listUsers(); ok(users.error, 'list partial fixture identities');
    const allowed = ['operator', 'founder-a', 'founder-b', 'shared', 'wrong'].map(x => `${x}-089@example.invalid`);
    assert.equal(users.data.users.length, 5);
    assert.ok(users.data.users.every(x => allowed.includes(x.email ?? '')));
    for (const user of users.data.users) ok((await admin.auth.admin.deleteUser(user.id)).error, 'remove partial Auth fixture');
    assert.equal(sql('select count(*) from auth.users'), '0');
    console.log('PASS exactly five partial synthetic Auth fixtures removed');
  }
  else throw new Error('089 prepare/browser action required');
}
main().catch(async (error: unknown) => {
  // Playwright errors can quote URLs/input arguments. Never print ephemeral secrets.
  let message = error instanceof Error ? error.message : '089 acceptance failed';
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
