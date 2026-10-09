// Original peer controls on an exact same-container template copy; fixed Unix peer only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sql,query,verifyClone,readPrivate,DIR,DB} from './090-compatibility-sql-rehearsal.mjs';
import {canonicalSettings,catalogQueries,dataDigestQuery} from './090-p3-recovery-queries.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
const PEER='genova_090_p3_peer',SOURCE='supabase/tests/090_private_file_ticket_concurrency.sql';
const HASH='6f2923866a198c8b2046398be99248cdca35a6ac347e406edf9919b29d715eeb';
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
export function peerSource(source=fs.readFileSync(SOURCE,'utf8')){
  assert.equal(sha(source),HASH);assert.equal(source.split('genova_090_concurrency_test').length,3);
  let generated=source.replaceAll('genova_090_concurrency_test',PEER);
  const old="select dblink_connect('090_peer','dbname="+PEER+"');";
  assert.equal(generated.split(old).length,2);
  generated=generated.replace(old,"select dblink_connect('090_peer','host=/var/run/postgresql dbname="+PEER+" user=supabase_admin password=090-synthetic-local-only');");
  const marker='-- Membership removal does not race into a statement that started before commit.';
  assert.equal(generated.split(marker).length,2);
  const expiry=`-- A later statement in the same reader transaction must observe retained Auth expiry.
begin;
select dblink_exec('090_peer', 'update auth.sessions set not_after=statement_timestamp() where id=' ||
  quote_literal('11000000-0000-4000-8000-000000000093'));
do $expiry$
begin
  if not (transaction_timestamp() < (select not_after from auth.sessions
    where id='11000000-0000-4000-8000-000000000093')) then
    raise exception '090 peer expiry temporal ordering was not established';
  end if;
  if public.private_file_ticket_authorized_090('10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093','20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 later statement in long transaction retained expired authority';
  end if;
end
$expiry$;
rollback;
select dblink_exec('090_peer','update auth.sessions set not_after=null where id=' ||
  quote_literal('11000000-0000-4000-8000-000000000093'));
`;
  return generated.replace(marker,expiry+'\n'+marker);
}
const json=(text,database)=>JSON.parse(sql('begin read only;'+canonicalSettings+
  `select coalesce(jsonb_agg(q),'[]'::jsonb) from (${text})q;rollback;`,database));
function main(){
  assert.equal(process.argv[2],'--run-approved-peer');assert.equal(process.argv.length,3);
  verifyClone();const tests=JSON.parse(readPrivate('compatibility-20261009-compatibility-tests.json'));
  assert.equal(tests.observations.length,10);assert.equal(tests.status,'ACTUAL_TEN_SQL_CONTROLS_PASS_CONCURRENCY_OPEN');
  assert.equal(sql("select exists(select 1 from pg_database where datname='"+PEER+"');",'postgres'),'f');
  const mainData=query(dataDigestQuery);
  sql('create database '+PEER+' owner postgres template '+DB+';','postgres');
  for(const [group,text] of Object.entries(catalogQueries))assert.deepEqual(normalize(json(text,PEER)),normalize(query(text)),group+' peer template drift');
  assert.deepEqual(json(dataDigestQuery,PEER),mainData,'Peer full rows differ before fixtures');
  // dblink is an isolated test dependency only in the owned peer DB, never in main/live.
  sql('create extension dblink;',PEER);
  const source=peerSource();
  sql("set lock_timeout='2s';set statement_timeout='30s';"+source,PEER);
  assert.deepEqual(query(dataDigestQuery),mainData,'Main recovered copy changed by peer test');
  sql('drop database '+PEER+';','postgres');
  const result={recordedAt:new Date().toISOString(),status:'ACTUAL_RECOVERED_COPY_PEER_SQL_PASS_NOT_RELEASE',
    sourceSha256:HASH,executedSha256:sha(source),peerTemplateAll17CatalogGroupsAndFullRowsEqual:true,
    uncommittedAndPostCommitChoirRoleMembershipControls:true,longTransactionStatementTimeAuthExpiry:true,
    mainDataUnchanged:true,ownedPeerDatabaseRemoved:true,
    boundary:'Actual original repertoire-file peer controls and added retained-session temporal ordering only; not all-five concurrency, managed Auth/REST/HTTP/platform/release proof.'};
  fs.writeFileSync(DIR+'/compatibility-20261009-compatibility-peer.json',JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify(result));
}
if(process.argv[1]===fileURLToPath(import.meta.url))try{main();}catch{console.error('Recovered-copy peer rehearsal failed; private details retained, no automatic retry or acceptance.');process.exitCode=1;}
