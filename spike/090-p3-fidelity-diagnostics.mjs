// Private comparison; only changed field names/counts leave this process.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { decryptBuffer } from './090-p3-consistent-backup.mjs';
import { normalize } from './090-p3-offline-restore.mjs';
import { catalogQueries,canonicalSettings } from './090-p3-recovery-queries.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
function main(){
const canonical=process.argv[2]==='--canonical-context';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length>(canonical?3:2))throw Error('Diagnostic scope refused');
const key=fs.readFileSync(DIR+'/artifact-key.bin'),body=decryptBuffer(fs.readFileSync(DIR+'/snapshot.json.gcm'),key);
const source=JSON.parse(body);body.fill(0);key.fill(0);
const env={...process.env,LIMA_HOME:'/Volumes/g090p3/lima',LIMA_SHELLENV_BLOCK:'*'};
function sql(text){return execFileSync('/opt/homebrew/bin/limactl',['shell','g090p3','sudo','docker','exec','-i','-e','PGPASSWORD=090-synthetic-local-only','genova090p3-db','psql','-XAtq','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','genova_090_p3_restore'],{input:text,env,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:20000}).trim();}
const result={searchPath:canonical?'public, extensions (explicit read-only comparison context)':sql("select current_setting('search_path');"),groups:{}};
for(const [group,query] of Object.entries(catalogQueries)){
  const actual=JSON.parse(sql('begin read only;'+canonicalSettings+(canonical?'set search_path=public,extensions;':'')+`select coalesce(jsonb_agg(q),'[]'::jsonb) from (${query}) q;rollback;`));
  fs.writeFileSync(DIR+(canonical?'/fidelity-canonical-actual-':'/fidelity-actual-')+group+'.json',JSON.stringify(actual),{flag:'wx',mode:0o600});
  const fields={};let changed=0;
  for(let i=0;i<Math.min(actual.length,source.catalog[group].length);i++){
    const a=actual[i],s=source.catalog[group][i];let different=false;
    for(const f of new Set([...Object.keys(a),...Object.keys(s)]))if(JSON.stringify(normalize({[f]:a[f]}))!==JSON.stringify(normalize({[f]:s[f]}))){fields[f]=(fields[f]||0)+1;different=true;}
    if(different)changed++;
  }
  result.groups[group]={changed,fields,sourceCount:source.catalog[group].length,actualCount:actual.length};
}
console.log(JSON.stringify(result));
fs.writeFileSync(DIR+(canonical?'/fidelity-canonical-diagnostic.json':'/fidelity-diagnostic.json'),JSON.stringify(result),{flag:'wx',mode:0o600});
}
try{main();}catch{console.error('Protected fidelity diagnostic failed; private details withheld.');process.exitCode=1;}
