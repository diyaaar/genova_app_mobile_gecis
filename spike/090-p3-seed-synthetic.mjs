// Synthetic installed-PG17 proof only: exact dropped positions/BETWEEN tree/
// publication roots. No real backup bytes/data or hosted target in this runtime.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {restoreDroppedSlots,restoreBetweenForm,publicationSeed} from './090-p3-recovery-seed.mjs';
import {catalogQueries,canonicalSettings} from './090-p3-recovery-queries.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
import {freeKiB} from './090-p3-consistent-backup.mjs';import {LIVE_STOP_KIB}from'./090-p3-resource-policy.mjs';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const OUTPUT='docs/reports/090/2026-10-09-p3-seed-synthetic.json',PG='/opt/homebrew/opt/postgresql@17/bin/',DB='genova_090_seed_test',PORT=58191,RESERVE=262144;
const env={PATH:process.env.PATH,LANG:'C',LC_ALL:'C'};let dir,result,stage='preflight';
function command(name,args,input){
  if(freeKiB()<LIVE_STOP_KIB)throw Error('Synthetic seed live floor refused');
  const r=spawnSync(PG+name,args,{env,input,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});
  if(r.status!==0){fs.appendFileSync(PARENT+'/seed-synthetic-errors-20261009.log',(r.stderr||'')+(r.stdout||''),{mode:0o600});throw Error('Synthetic seed PG command failed');}return r.stdout.trim();
}
function sql(text,db=DB){return command('psql',['-XAtq','-w','-h',dir,'-p',String(PORT),'-U','supabase_admin','-d',db,'-v','ON_ERROR_STOP=1'],"set statement_timeout='5s';"+canonicalSettings+text);}
const groups=['columns','droppedColumns','relations','constraints','publications','publicationRelations','publicationSchemas','publicationTables'];
function catalog(){return Object.fromEntries(groups.map(g=>[g,JSON.parse(sql(`select coalesce(jsonb_agg(q),'[]'::jsonb) from (${catalogQueries[g]})q;`))]));}
function reset(){sql(`drop database ${DB};create database ${DB} owner postgres template template0;`,'postgres');}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--verify-synthetic'||fs.existsSync(OUTPUT)||fs.existsSync(PARENT+'/seed-synthetic-errors-20261009.log'))throw Error('Synthetic seed scope/overwrite refused');
  if(fs.realpathSync(PARENT)!==PARENT||fs.lstatSync(PARENT).isSymbolicLink()||(fs.statSync(PARENT).mode&511)!==448)throw Error('Protected synthetic parent refused');
  const initialFreeKiB=freeKiB();if(initialFreeKiB-RESERVE<LIVE_STOP_KIB)throw Error('Synthetic seed reserve refused');
  dir=fs.mkdtempSync(PARENT+'/seed-pg-');fs.chmodSync(dir,0o700);if((dir+'/.s.PGSQL.'+PORT).length>=104)throw Error('Private seed socket path refused');
  fs.writeFileSync(dir+'/owner.json',JSON.stringify({owner:'090-synthetic-seed-only',directory:dir,realBackupData:false}),{flag:'wx',mode:0o600});
  stage='init';command('initdb',['-D',dir+'/data','-U','supabase_admin','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8','--no-instructions']);
  stage='start';command('pg_ctl',['start','-D',dir+'/data','-l',dir+'/server.log','-w','-t','10','-o',`-c listen_addresses='' -c unix_socket_directories='${dir}' -c unix_socket_permissions=0700 -c shared_buffers=16MB -c max_connections=10 -p ${PORT}`]);
  const identity=JSON.parse(sql("select jsonb_build_object('version',current_setting('server_version'),'listen',current_setting('listen_addresses'),'unixOnly',inet_server_addr() is null);",'postgres'));
  if(!/^17\./.test(identity.version)||identity.listen!==''||identity.unixOnly!==true)throw Error('Synthetic seed target refused');
  sql(`create role postgres nosuperuser;create database ${DB} owner postgres template template0;`,'postgres');
  stage='source-fixture';
  sql(`set role postgres;
    create table public.synthetic(id integer,unused text,object_key text,unused_two text,code text,
      constraint synthetic_check check(length(object_key) between 1 and 1024 and object_key <> ''));
    alter table public.synthetic drop column unused,drop column unused_two;
    create table public.synthetic_partitioned(id integer,unused text,object_key text) partition by range(id);
    alter table public.synthetic_partitioned drop column unused;
    create table public.synthetic_child partition of public.synthetic_partitioned for values from(0)to(100);
    create publication synthetic_pub for table public.synthetic,public.synthetic_partitioned with(publish='insert',publish_via_partition_root=false);
    reset role;`);
  const expected=catalog(),definition=expected.constraints.find(r=>r.name==='synthetic_check').definition;
  const dumped=`CREATE TABLE public.synthetic (\n    id integer,\n    object_key text,\n    code text,\n    CONSTRAINT synthetic_check ${definition}\n);
CREATE TABLE public.synthetic_partitioned (\n    id integer,\n    object_key text\n) PARTITION BY RANGE (id);
CREATE TABLE public.synthetic_child (\n    id integer,\n    object_key text\n);
ALTER TABLE public.synthetic OWNER TO postgres;
ALTER TABLE public.synthetic_partitioned OWNER TO postgres;
ALTER TABLE public.synthetic_child OWNER TO postgres;
ALTER TABLE public.synthetic_partitioned ATTACH PARTITION public.synthetic_child FOR VALUES FROM (0) TO (100);`;
  stage='unrepaired-negative';reset();sql(dumped);
  const raw=catalog();
  const checkMismatch=raw.constraints.find(r=>r.name==='synthetic_check').definition!==definition;
  if(!checkMismatch||raw.droppedColumns.length!==0)throw Error('Expected unmodified dump negative missing');
  stage='supported-seed';reset();const slots=restoreDroppedSlots(dumped,expected),between=restoreBetweenForm(slots.sql,expected),pubs=publicationSeed(expected);
  sql('begin;'+between.sql+'\n'+pubs.sql+'commit;');
  stage='exact-comparison';const actual=catalog();
  const comparisons=Object.fromEntries(groups.map(g=>[g,JSON.stringify(normalize(actual[g]))===JSON.stringify(normalize(expected[g]))]));
  if(Object.values(comparisons).some(v=>!v))throw Error('Synthetic exact seed metadata mismatch');
  stage='future-partition';sql('create table public.synthetic_future partition of public.synthetic_partitioned for values from(100)to(200);');
  const later=catalog(),futurePartitionCovered=later.publicationTables.some(r=>r.tablename==='synthetic_future');
  if(!futurePartitionCovered||later.publicationRelations.length!==expected.publicationRelations.length)throw Error('Synthetic root future behavior mismatch');
  const allocatedKiB=Number(execFileSync('du',['-sk',dir],{encoding:'utf8'}).split(/\s+/)[0]);if(allocatedKiB>RESERVE)throw Error('Synthetic seed peak refused');
  result={recordedAt:new Date().toISOString(),status:'SYNTHETIC_EXACT_RECOVERY_SEED_PASS_ONLY',version:identity.version,
    realBackupDataRead:false,network:{listenAddresses:'',privateUnixSocket:true,hostedConnections:0},
    rawDumpNegative:{constraintDefinitionDiffers:checkMismatch,droppedSlotsMissing:true},
    supported:{slotTables:slots.tables,droppedSlots:slots.slots,betweenForms:between.count,publications:pubs.publications,directRoots:pubs.roots},comparisons,
    futurePartitionCovered,directRootCountUnchanged:true,initialFreeKiB,allocatedKiB,reserveKiB:RESERVE,
    limits:'Actual nativePG17 synthetic table/constraint/publication catalog proof only; not full Supabase/private source restore/data/client/hosted/release acceptance. Exact comparator unchanged.'};
}
try{main();}catch{console.error('Synthetic seed verification failed at '+stage+'; details private, no recovery PASS.');process.exitCode=1;}
finally{
  if(dir&&fs.existsSync(dir+'/data/postmaster.pid')){const stop=spawnSync(PG+'pg_ctl',['stop','-D',dir+'/data','-m','fast','-w','-t','10'],{env,encoding:'utf8',timeout:20000,stdio:'pipe'});if(stop.status!==0){console.error('Owned synthetic seed stop failed; retain running target.');result=undefined;process.exitCode=1;}}
  if(dir&&!fs.existsSync(dir+'/data/postmaster.pid')){
    if(path.dirname(dir)!==PARENT||!/^seed-pg-[A-Za-z0-9]+$/.test(path.basename(dir))||fs.realpathSync(dir)!==dir)throw Error('Seed cleanup scope refused');
    const owner=JSON.parse(fs.readFileSync(dir+'/owner.json'));if(owner.owner!=='090-synthetic-seed-only'||owner.directory!==dir)throw Error('Seed cleanup ownership refused');
    fs.rmSync(dir,{recursive:true});
    if(result){result.cleanup={ownedClusterRemoved:!fs.existsSync(dir),finalFreeKiB:freeKiB()};result.helperSha256=Object.fromEntries(['spike/090-p3-seed-synthetic.mjs','spike/090-p3-recovery-seed.mjs','spike/090-p3-recovery-queries.mjs','spike/090-p3-offline-restore.mjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));}
  }
}
