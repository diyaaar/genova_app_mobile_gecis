import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assess, redact, missingIds } from './090-p3-delta-preflight.mjs';
import { QUERIES, REF, hash } from './090-p3-hosted-inventory.mjs';

const read=path=>fs.readFileSync(path,'utf8');
const record=JSON.parse(read('docs/reports/090/2026-10-04-p3-delta-preflight.json'));
const ready=catalog=>assess(catalog).filter(row=>row.catalogReady).map(row=>row.id);
const mutated=change=>{const value=structuredClone(record.catalog);change(value);return value;};

test('captured catalog yields five preliminary starts, never execution acceptance',()=>{
  assert.equal(record.project,REF);
  assert.deepEqual(assess(record.catalog),record.assessment);
  assert.deepEqual(record.assessment.map(row=>row.id),missingIds);
  assert.deepEqual(ready(record.catalog),['024','046','078','079','090-actor']);
  assert(record.assessment.every(row=>row.unrun.length&&row.status.includes('NOT ')));
  assert.match(record.historicalStatementEquality,/UNAVAILABLE \/ NOT VERIFIED/);
  assert.equal(record.querySha256,hash(QUERIES.deltaDependencies));
  assert.equal(record.priorHostedSha256,hash(read('docs/reports/090/2026-10-04-p3-hosted-inventory.json')));
  for(const pin of record.missingSourcePins)assert.equal(hash(read(pin.path)),pin.sha256);
});

test('known schema prerequisites differ from package security ordering',()=>{
  const rows=Object.fromEntries(assess(record.catalog).map(row=>[row.id,row]));
  assert.deepEqual(rows['048'].dependsOn,['046']);
  assert.deepEqual(rows['082'].dependsOn,['078']);
  assert.deepEqual(rows['087'].dependsOn,['078']);
  assert.deepEqual(rows['088'].dependsOn,['078','087']);
  assert.deepEqual(rows['090-legacy'].dependsOn,['090-actor']);
  assert.deepEqual(rows['090-actor'].dependsOn,[]);
  assert.deepEqual(rows['090-actor'].releaseAfter,['078']);
  // Simulated metadata is not a claim that these migrations have run.
  const future=mutated(v=>{
    for(const n of v.namespaces)if(['genova_046','genova_078'].includes(n.name))n.exists=true;
    v.procedures.find(p=>p.name==='genova_087.normalize_changes(jsonb)').exists=true;
  });
  for(const id of ['048','082','088'])assert(ready(future).includes(id));
  assert(!ready(future).includes('090-legacy'));
});

test('RLS/publication/name collisions and ACL provenance fail preliminary guards',()=>{
  const cases=[
    ['046',v=>v.relations.find(r=>r.name==='realtime.messages').rls=false],
    ['046',v=>v.publication=null],
    ['046',v=>v.realtimePolicies=[{name:'046 room members receive chat signals'}]],
    ['024',v=>v.annotationUpdaterCount=2],
    ['024',v=>v.annotationRevision=[{name:'revision'}]],
    ['078',v=>v.procedures.find(p=>p.name==='public.set_active_choir(uuid)').exists=false],
    ['079',v=>v.statusAclProvenanceValid=false],
    ['090-actor',v=>v.namespaces.find(n=>n.name==='genova_090').exists=true],
  ];
  for(const [id,change] of cases)assert(!ready(mutated(change)).includes(id),id);
  assert.throws(()=>assess({}));
});

test('raw policy and trigger expressions are digested without mutating input',()=>{
  const raw={realtimePolicies:[{name:'synthetic',qual:'true',withCheck:null}],
    annotationTriggers:[{name:'synthetic',definition:'CREATE TRIGGER synthetic'}]};
  const result=redact(raw);
  assert.equal(result.realtimePolicies[0].qualSha256,hash('true'));
  assert.equal(result.realtimePolicies[0].withCheckSha256,null);
  assert.equal(result.annotationTriggers[0].definitionSha256,hash('CREATE TRIGGER synthetic'));
  assert(!('qual' in result.realtimePolicies[0]));
  assert(!('withCheck' in result.realtimePolicies[0]));
  assert(!('definition' in result.annotationTriggers[0]));
  assert.equal(raw.realtimePolicies[0].qual,'true');
});

test('new hosted query is catalog-only SELECT without locks or application-row reads',()=>{
  const query=QUERIES.deltaDependencies;
  assert(query.startsWith('select '));
  assert(!/\b(insert|update|delete|alter|create|drop|lock|do|pg_advisory\w*)\b/i.test(query));
  assert(!/\b(from|join)\s+(auth|public|genova_\d+)\./i.test(query));
  assert(!query.includes('auth.users'));
  assert(query.includes("to_regclass('auth.sessions')"));
  assert(!query.includes('select *'));
});

test('frozen sources reveal missing Auth lifetime negative, not a security pass',()=>{
  const actor=read('supabase/migrations/20260930080046_private_file_ticket_authority_090.sql');
  const legacy=read('supabase/migrations/20261002154343_legacy_file_authority_090.sql');
  const actorTests=read('supabase/tests/090_private_file_ticket_authority.sql');
  const legacyTests=read('supabase/tests/090_legacy_file_authority.sql');
  assert(actor.includes('from auth.sessions s'));
  assert(!actor.includes('not_after'));
  assert(legacy.includes('(s.not_after is null or s.not_after > now())'));
  assert(!actorTests.includes('not_after'));
  assert(legacyTests.includes("not_after=now()-interval '1 minute'"));
  assert(record.catalog.authSessionNotAfter);
  assert(assess(record.catalog).find(r=>r.id==='090-actor').unrun.includes('session not_after expiration source gap'));
});
