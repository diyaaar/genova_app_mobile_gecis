// Actual independent PG17 backends and observed lock waits; no hosted/Auth/HTTP claim.
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
const db = process.env.GENOVA_088_DATABASE;
assert.equal(db, 'genova_088_test_roundtrip');
assert.equal(process.env.PGHOST, '127.0.0.1'); assert.equal(process.env.PGPORT, '5432');
const A = 'a8700000-0000-4000-8000-000000000001', B = 'b8700000-0000-4000-8000-000000000001';
const actor = 'a8800000-0000-4000-8000-000000000010', target = 'a8700000-0000-4000-8000-000000000002';
const uid = '88000000-0000-4000-8000-000000000003', sid = '88000000-0000-4000-8000-000000000031';
const rid = 'a8800000-0000-4000-8000-000000000007', role = 'a8800000-0000-4000-8000-000000000003';
const assignment = 'a8800000-0000-4000-8000-000000000011';
const env = { ...process.env, PGDATABASE: db, PGOPTIONS: '-c role=postgres -c statement_timeout=8000 -c lock_timeout=6000' };
const children: ChildProcess[] = [];
function q(sql: string, observe = false) {
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    env: observe ? { ...env, PGOPTIONS: '' } : env, encoding: 'utf8',
  }).trim();
}
function job(name: string, sql: string) {
  const child = spawn('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-c', sql], {
    env: { ...env, PGAPPNAME: name }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child); let out = '', err = '';
  child.stdout.on('data', x => { out += x; }); child.stderr.on('data', x => { err += x; });
  return new Promise<{ code: number | null; out: string; err: string }>((resolve, reject) => {
    child.on('error', reject); child.on('close', code => resolve({ code, out, err }));
  });
}
async function observed(name: string, state: 'hold' | 'blocked') {
  for (let i = 0; i < 60; i++) {
    const condition = state === 'hold' ? "wait_event='PgSleep'" : "wait_event_type='Lock'";
    if (q(`select exists(select 1 from pg_stat_activity where datname='${db}' and application_name='${name}' and ${condition})`, true) === 't') return;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`088 actual ${state} not observed for ${name}`);
}
const auth = (user = uid, session = sid) => `set role authenticated;set request.jwt.claim.sub='${user}';
 set request.jwt.claims='${JSON.stringify({ sub: user, role: 'authenticated', session_id: session })}';`;
const review = (action = 'approve') => `select public.review_profile_change_request('${rid}','${action}',null);`;
function reset() {
  q(`update public.choir_members set is_active=true,about_text='before A' where id in ('${target}','${actor}');
    update public.roles set name='Şef' where id='${role}';
    insert into public.choir_member_roles(id,choir_id,member_id,role_id) values('${assignment}','${A}','${actor}','${role}') on conflict do nothing;
    update genova_005.active_choir_sessions set choir_id='${A}' where auth_user_id='${uid}';
    delete from public.profile_change_requests where choir_id='${A}';
    insert into public.profile_change_requests(id,choir_id,member_id,changes_json) values('${rid}','${A}','${target}','{"about_text":"approved value"}');`);
}
function state() { return JSON.parse(q(`select jsonb_build_object('member',m.about_text,'status',r.status,'changes',r.changes_json)
  from public.choir_members m join public.profile_change_requests r on r.member_id=m.id where r.id='${rid}'`)); }
async function pair(label: string, firstSql: string, secondSql: string, refusal?: string) {
  const first = job(`088_${label}_first`, `begin;${firstSql}select pg_sleep(3);commit;`);
  await observed(`088_${label}_first`, 'hold');
  const second = job(`088_${label}_second`, `begin;${secondSql}commit;`);
  await observed(`088_${label}_second`, 'blocked');
  assert.equal((await first).code, 0);
  const result = await second;
  if (refusal) { assert.notEqual(result.code, 0); assert.match(result.err, new RegExp(refusal)); }
  else assert.equal(result.code, 0, result.err);
  console.log(`PASS actual competing ${label}: observed wait + exact outcome`);
  return result;
}
async function main() {
  try {
    reset();
    await pair('role_revoke_first', `delete from public.choir_member_roles where id='${assignment}';`, auth()+review(), '42501');
    assert.equal(state().status, 'pending'); assert.equal(state().member, 'before A');
    reset();
    await pair('review_before_role_revoke', auth()+review(), `delete from public.choir_member_roles where id='${assignment}';`);
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    reset();
    await pair('role_rename_first', `update public.roles set name='Korist' where id='${role}';`, auth()+review(), '42501');
    assert.equal(state().status, 'pending'); assert.equal(state().member, 'before A');
    reset();
    await pair('actor_revoke_first', `update public.choir_members set is_active=false where id='${actor}';`, auth()+review(), '42501');
    assert.equal(state().status, 'pending'); assert.equal(state().member, 'before A');
    reset();
    await pair('target_revoke_first', `update public.choir_members set is_active=false where id='${target}';`, auth()+review(), '22023');
    assert.equal(state().status, 'pending'); assert.equal(state().member, 'before A');
    reset();
    await pair('switch_first', auth()+`select public.set_active_choir('${B}');`, auth()+review(), 'PT409');
    assert.equal(state().status, 'pending'); assert.equal(state().member, 'before A');
    reset();
    await pair('review_before_switch', auth()+review(), auth()+`select public.set_active_choir('${B}');`);
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    reset();
    await pair('review_before_actor_revoke', auth()+review(), `update public.choir_members set is_active=false where id='${actor}';`);
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    reset();
    await pair('review_before_target_revoke', auth()+review(), `update public.choir_members set is_active=false where id='${target}';`);
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    reset();
    await pair('double_decision', auth()+review(), auth(uid,'88000000-0000-4000-8000-000000000032')+review('reject'), 'PT409');
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    reset();
    const submit = auth('87000000-0000-4000-8000-000000000001','87000000-0000-4000-8000-000000000011')
      +`select public.submit_profile_change_request('${A}','{"about_text":"latest draft"}',null);`;
    await pair('submit_before_review', submit, auth()+review());
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'latest draft');
    reset();
    const next = await pair('review_before_submit', auth()+review(), submit);
    assert.equal(JSON.parse(next.out).mode, 'created'); assert.notEqual(JSON.parse(next.out).id, rid);
    assert.equal(state().status, 'approved'); assert.equal(state().member, 'approved value');
    assert.equal(q(`select count(*) from public.profile_change_requests where choir_id='${A}' and status='pending' and changes_json='{"about_text":"latest draft"}'`), '1');
    // Restore the persistent fixture before unchanged 087 regression matrix.
    reset(); q(`delete from public.profile_change_requests where choir_id in ('${A}','${B}');`);
    console.log('PASS twelve competing matrices; fixture reset for original submit regression');
  } finally { for (const child of children) if (child.exitCode === null) child.kill('SIGTERM'); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : '088 concurrency failure'); process.exitCode = 1; });
