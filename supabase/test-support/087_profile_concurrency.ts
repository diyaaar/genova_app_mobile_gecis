// Real PG17 competing transactions; never HTTP/Auth/provider acceptance.
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sanitizeProfileChanges, PROFILE_CHANGE_KEYS } from '../../lib/profile-change-requests';
const db = process.env.GENOVA_087_DATABASE;
assert.equal(db, 'genova_087_test_roundtrip');
assert.equal(process.env.PGHOST, '127.0.0.1'); assert.equal(process.env.PGPORT, '5432');
const scratch = process.env.GENOVA_087_SCRATCH!;
assert.ok(resolve(scratch).startsWith(resolve(process.cwd(), 'spike/087-private-')));
const A = 'a8700000-0000-4000-8000-000000000001', B = 'b8700000-0000-4000-8000-000000000001';
const member = 'a8700000-0000-4000-8000-000000000002';
const shared = '87000000-0000-4000-8000-000000000001', single = '87000000-0000-4000-8000-000000000002';
const sid = '87000000-0000-4000-8000-000000000011';
const env = { ...process.env, PGDATABASE: db, PGOPTIONS: '-c role=postgres -c statement_timeout=8000 -c lock_timeout=6000' };
const children: ChildProcess[] = [];
function q(sql: string, inspectActivity = false) {
  // The local administrator observes other backends; product callers never gain stats privileges.
  return execFileSync('psql', ['-X', '-Atq', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    env: inspectActivity ? { ...env, PGOPTIONS: '' } : env, encoding: 'utf8',
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
  throw new Error(`087 real ${state} not observed for ${name}`);
}
const auth = (user = shared, session = sid) => `set role authenticated;set request.jwt.claim.sub='${user}';
 set request.jwt.claims='${JSON.stringify({ sub: user, role: 'authenticated', session_id: session })}';`;
const rpc = (text: string) => `select public.submit_profile_change_request('${A}','${JSON.stringify({ about_text: text })}',null);`;
function reset() {
  q(`update public.choir_members set is_active=true where id='${member}';
    update genova_005.active_choir_sessions set choir_id='${A}' where auth_user_id='${shared}';
    delete from public.profile_change_requests where choir_id in ('${A}','${B}');`);
}
function persisted(text: string) { return q(`select count(*) from public.profile_change_requests where choir_id='${A}' and changes_json->>'about_text'='${text}'`); }
async function main() {
  try {
    const whitespace = '\t\n\r\f\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
    const samples: unknown[] = [null, [], 42, {}, { unknown: 'discard', email: 15, phone: false },
      Object.fromEntries(PROFILE_CHANGE_KEYS.map(key => [key, `${whitespace}value${whitespace}`])),
      Object.fromEntries(PROFILE_CHANGE_KEYS.map(key => [key, null])), { phone: whitespace, about_text: '😀', email: { nested: 'no' } }];
    for (const sample of samples) {
      const raw = JSON.stringify(sample).replaceAll("'", "''");
      assert.deepEqual(JSON.parse(q(`select genova_087.normalize_changes('${raw}'::jsonb)`)), sanitizeProfileChanges(sample));
    }
    console.log('PASS actual SQL/TypeScript allowed-key, Unicode trim, type and null parity');
    reset();
    let first = job('087_revoke_first', `begin;update public.choir_members set is_active=false where id='${member}';select pg_sleep(3);commit;`);
    await observed('087_revoke_first', 'hold');
    let second = job('087_waiting_writer', `begin;${auth()}${rpc('must refuse revoked')}commit;`);
    await observed('087_waiting_writer', 'blocked');
    assert.equal((await first).code, 0);
    let result = await second; assert.notEqual(result.code, 0); assert.match(result.err, /42501/);
    assert.equal(persisted('must refuse revoked'), '0');
    console.log('PASS concurrent revoke-first: writer actually waits then refuses, no data');

    reset();
    first = job('087_writer_first', `begin;${auth()}${rpc('authorized before revoke')}select pg_sleep(3);commit;`);
    await observed('087_writer_first', 'hold');
    second = job('087_waiting_revoker', `update public.choir_members set is_active=false where id='${member}';`);
    await observed('087_waiting_revoker', 'blocked');
    assert.equal((await first).code, 0); assert.equal((await second).code, 0);
    assert.equal(persisted('authorized before revoke'), '1');
    console.log('PASS concurrent writer-first: revocation waits until authorized commit');

    reset();
    first = job('087_switch_first', `begin;${auth()}select public.set_active_choir('${B}');select pg_sleep(3);commit;`);
    await observed('087_switch_first', 'hold');
    second = job('087_switch_wait_writer', `begin;${auth()}${rpc('must refuse switched')}commit;`);
    await observed('087_switch_wait_writer', 'blocked');
    assert.equal((await first).code, 0); result = await second;
    assert.notEqual(result.code, 0); assert.match(result.err, /PT409/); assert.equal(persisted('must refuse switched'), '0');
    console.log('PASS concurrent switch-first: writer waits then refuses stale choir');

    reset();
    first = job('087_before_switch_writer', `begin;${auth()}${rpc('authorized before switch')}select pg_sleep(3);commit;`);
    await observed('087_before_switch_writer', 'hold');
    second = job('087_waiting_switch', `begin;${auth()}select public.set_active_choir('${B}');commit;`);
    await observed('087_waiting_switch', 'blocked');
    assert.equal((await first).code, 0); assert.equal((await second).code, 0); assert.equal(persisted('authorized before switch'), '1');
    console.log('PASS concurrent writer-first: same-session switch waits until A commit');

    reset();
    first = job('087_merge_first', `begin;${auth()}${rpc('first draft')}select pg_sleep(3);commit;`);
    await observed('087_merge_first', 'hold');
    second = job('087_merge_second', `begin;${auth(shared,'87000000-0000-4000-8000-000000000012')}${rpc('second draft')}commit;`);
    await observed('087_merge_second', 'blocked');
    const created = await first, updated = await second;
    assert.equal(created.code, 0); assert.equal(updated.code, 0);
    assert.equal(JSON.parse(created.out.trim()).id, JSON.parse(updated.out.trim()).id);
    assert.equal(JSON.parse(updated.out.trim()).mode, 'updated'); assert.equal(persisted('second draft'), '1');
    assert.equal(q(`select count(*) from public.profile_change_requests where member_id='${member}'`), '1');
    console.log('PASS distinct Auth sessions: concurrent same-key writes merge one pending request');

    reset();
    first = job('087_single_first', `begin;${auth(single,'87000000-0000-4000-8000-000000000021')}${rpc('single first')}select pg_sleep(3);commit;`);
    await observed('087_single_first', 'hold');
    second = job('087_single_second', `begin;${auth(single,'87000000-0000-4000-8000-000000000022')}${rpc('single second')}commit;`);
    await observed('087_single_second', 'blocked');
    assert.equal((await first).code, 0); assert.equal((await second).code, 0);
    assert.equal(q("select count(*) from public.profile_change_requests where member_id='a8700000-0000-4000-8000-000000000003'"), '1');
    assert.equal(persisted('single second'), '1');
    console.log('PASS two first-use singleton sessions: FK-compatible lock ordering, no duplicate');
    await writeFile(resolve(scratch,'concurrency-summary.json'), JSON.stringify({ actualWaits: 6, matrices: 6, status: 'PASS' }), { mode: 0o600 });
  } finally { for (const child of children) if (child.exitCode === null) child.kill('SIGTERM'); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : '087 concurrency failure'); process.exitCode = 1; });
