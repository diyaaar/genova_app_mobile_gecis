// Reset only this proven-empty failed transaction in the exact owned offline
// container; retain its raw error. Not a generic database reset or data deletion.
import fs from'node:fs';import{execFileSync}from'node:child_process';
import{ATTEMPT}from'./090-p3-resource-policy.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const env={...process.env,LIMA_HOME:'/Volumes/g090p3/lima',LIMA_SHELLENV_BLOCK:'*'};
const archived=DIR+'/restore-failure-v1-replacement.log';
function command(args,input){return execFileSync('/opt/homebrew/bin/limactl',['shell','g090p3','sudo','docker',...args],{env,input,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:20000}).trim();}
function sql(text,db='genova_090_p3_restore'){return command(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only','genova090p3-db','psql','-XAtq','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d',db],text);}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--reset-proven-empty'||fs.existsSync(archived)||fs.existsSync(DIR+'/restore-summary.json'))throw Error('Reset exact scope refused');
  const owner=JSON.parse(fs.readFileSync(DIR+'/runtime-ownership.json')),target=JSON.parse(command(['inspect','genova090p3-db']))[0],error=fs.readFileSync(DIR+'/restore-failure.log','utf8');
  if(owner.attempt!==ATTEMPT||owner.owner!=='090-P3-only'||target.Config.Image!=='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00'||target.HostConfig.NetworkMode!=='none'||target.Mounts.length||Object.keys(target.HostConfig.PortBindings||{}).length)throw Error('Reset isolated ownership refused');
  if(!/unrestrict/i.test(error))throw Error('Expected replacement failure absent');
  const count=Number(sql("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not like 'pg_%' and n.nspname<>'information_schema';"));
  if(count!==0)throw Error('Nonempty failed database refused');
  sql('drop database genova_090_p3_restore;','postgres');fs.renameSync(DIR+'/restore-failure.log',archived);
  const result={recordedAt:new Date().toISOString(),status:'ONLY_PROVEN_EMPTY_SEED_FAILURE_RESET',userRelationsBeforeReset:count,network:'none',mounts:0,publishedPorts:0,privateErrorRetained:true,noAcceptedBackupDeleted:true};
  fs.writeFileSync(DIR+'/reset-seed-failure-v1.json',JSON.stringify(result),{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
}
try{main();}catch{console.error('Proven-empty reset refused; private details withheld, no automatic retry/data deletion.');process.exitCode=1;}
