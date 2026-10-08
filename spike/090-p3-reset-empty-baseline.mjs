// One proven failed transaction only; retain original raw error, never reset rows.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ATTEMPT, LIVE_STOP_KIB } from './090-p3-resource-policy.mjs';
import { freeKiB } from './090-p3-consistent-backup.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const owner=JSON.parse(fs.readFileSync(DIR+'/runtime-ownership.json'));
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--reset-failed-empty'||owner.attempt!==ATTEMPT||freeKiB()<LIVE_STOP_KIB)throw Error('Reset scope refused');
const env={...process.env,LIMA_HOME:'/Volumes/g090p3/lima',LIMA_SHELLENV_BLOCK:'*'};
function command(args){return execFileSync('/opt/homebrew/bin/limactl',['shell','g090p3','sudo','docker',...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:10000}).trim();}
function sql(database,text){return command(['exec','-e','PGPASSWORD=090-synthetic-local-only','genova090p3-db','psql','-XAtq','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d',database,'-c',text]);}
const target=JSON.parse(command(['inspect','genova090p3-db']))[0];
if(target.Config.Image!=='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00'||target.HostConfig.NetworkMode!=='none'||target.Mounts.length||Object.keys(target.HostConfig.PortBindings||{}).length)throw Error('Reset isolation refused');
const log=DIR+'/restore-failure.log',archive=DIR+'/restore-failure-'+ATTEMPT+'-v1.log';
if(fs.existsSync(archive)||!fs.readFileSync(log,'utf8').includes('parameter "supautils.privileged_extensions" cannot be changed now'))throw Error('Expected failed transaction refused');
if(sql('genova_090_p3_restore',"select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not like 'pg_%' and n.nspname<>'information_schema';")!=='0')throw Error('Nonempty baseline refused');
sql('postgres','drop database genova_090_p3_restore;');
fs.renameSync(log,archive);
console.log(JSON.stringify({status:'EMPTY_FAILED_BASELINE_RESET_ONLY',rawFailureRetained:true,sourceBackupUnchanged:true}));
