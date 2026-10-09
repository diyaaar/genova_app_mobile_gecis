// Pure 046 test adapter for a faithful isolated copy; never captures/applies/executes SQL.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const baselinePath='supabase/tests/046_private_chat_realtime.sql';
export const baselineSha256='d5e893eb6db9033b047a3e5247b7d02f622b634a623e77872c1699bb1844bd3e';
export const captureBefore046Sql=`select schemaname,tablename from pg_publication_tables
where pubname='supabase_realtime' order by schemaname,tablename;`;
const required=['chat_message_status','chat_messages','chat_reactions'];
const legacyClause=`  if (select count(*) from genova_046.prior_publication_tables) <> 1
    or not exists (select 1 from genova_046.prior_publication_tables where tablename='chat_messages') then
    raise exception '046: prior publication state was not retained';
  end if;`;
const hash=value=>createHash('sha256').update(value).digest('hex');
export function canonicalPublicationRows(rows){
  assert(Array.isArray(rows)&&rows.length<=256,'Bounded captured metadata required');
  const seen=new Set();
  return rows.map(row=>{
    assert(row&&typeof row==='object');assert.deepEqual(Object.keys(row).sort(),['schemaname','tablename']);
    for(const value of Object.values(row))assert(typeof value==='string'&&/^[A-Za-z_][A-Za-z0-9_]{0,62}$/u.test(value),'Unexpected identifier; refuse SQL interpolation');
    const key=row.schemaname+'.'+row.tablename;assert(!seen.has(key),'Duplicate publication row');seen.add(key);
    return {...row};
  }).sort((a,b)=>(a.schemaname+'.'+a.tablename).localeCompare(b.schemaname+'.'+b.tablename));
}
export function expectedPublicationState(before){
  const all=canonicalPublicationRows(before);
  const prior=all.filter(row=>row.schemaname==='public'&&required.includes(row.tablename));
  const after=[...all];
  for(const tablename of required)if(!prior.some(row=>row.tablename===tablename))after.push({schemaname:'public',tablename});
  return {prior,after:canonicalPublicationRows(after)};
}
export function assertPublicationState(before,retained,current){
  const expected=expectedPublicationState(before);
  assert.deepEqual(canonicalPublicationRows(retained),expected.prior,'Prior publication set drift');
  assert.deepEqual(canonicalPublicationRows(current),expected.after,'Current publication set drift');
}
function temporaryRows(name,rows){
  return `create temporary table ${name}(schemaname text not null,tablename text not null,
primary key(schemaname,tablename)) on commit drop;\n`+
  (rows.length?`insert into ${name}(schemaname,tablename) values\n`+
    rows.map(row=>`('${row.schemaname}','${row.tablename}')`).join(',\n')+';\n':'');
}
function refuseDifference(left,right,label){
  return `  if exists ((${left}) except all (${right}))
    or exists ((${right}) except all (${left})) then
    raise exception '${label}';
  end if;`;
}
/** Input must be captured before046 on the already fidelity-verified, exclusively owned
 * clone. This pure builder cannot certify its provenance or authorize execution.
 * Only the fixture-specific prior-state clause changes; role/tenant/policy tests survive.
 */
export function buildRealtimeCloneTest(before,source=fs.readFileSync(baselinePath,'utf8')){
  assert.equal(hash(source),baselineSha256,'Refuse changed historical test source');
  assert.equal(source.split(legacyClause).length,2,'Ambiguous fixture boundary');
  assert.equal(source.split('\nbegin;\n').length,2,'Ambiguous transaction boundary');
  const expected=expectedPublicationState(before);
  const check=refuseDifference('select schemaname,tablename from genova_046.prior_publication_tables',
    'select schemaname,tablename from pg_temp.expected_046_prior','046 clone: prior publication exact set changed')+'\n'+
    refuseDifference("select schemaname,tablename from pg_publication_tables where pubname='supabase_realtime'",
      'select schemaname,tablename from pg_temp.expected_046_after','046 clone: complete publication exact set changed');
  const setup=temporaryRows('expected_046_prior',expected.prior)+temporaryRows('expected_046_after',expected.after);
  const sql=source.replace(legacyClause,check).replace('\nbegin;\n','\nbegin;\n\n'+setup);
  assert(Buffer.byteLength(sql)<32*1024);
  assert.equal(sql.replace(check,legacyClause).replace('\nbegin;\n\n'+setup,'\nbegin;\n'),source,'Unexpected test rewrite');
  return {sql,sha256:hash(sql),sourceSha256:baselineSha256,before:canonicalPublicationRows(before),expected,
    boundary:'Generated source only. Actual faithfully restored SQL, provenance, RLS/managed Auth/provider verification NOT RUN.'};
}
