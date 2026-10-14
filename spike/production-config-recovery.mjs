// Fixed-project GET-only recovery capture. Response bodies only in encrypted custody.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {encryptBuffer,decryptBuffer} from './090-p3-consistent-backup.mjs';
import {hash,REF} from './090-p3-hosted-inventory.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-BJF2Dc';
const output='docs/reports/production-2026-10-14/config-recovery.json';
const routes=['config/auth','postgrest','config/realtime','config/storage','secrets'];
async function main(){
  assert.equal(process.argv[2],'--capture-read-only');assert.equal(process.argv.length,3);
  assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
  assert(!fs.existsSync(output));assert.equal(fs.statSync(DIR).mode&511,448);
  const cfg=JSON.parse(fs.readFileSync('/Users/alidiyarduran/.gemini/antigravity/mcp_config.json'));
  const token=cfg.mcpServers?.['supabase-genesinova']?.env?.SUPABASE_ACCESS_TOKEN;assert(token);
  const keyFile=path.join(DIR,'artifact-key.bin');assert.equal(fs.statSync(keyFile).mode&511,384);
  const key=fs.readFileSync(keyFile),captures=[];
  try{
    for(const route of routes){
      const response=await fetch(`https://api.supabase.com/v1/projects/${REF}/${route}`,{method:'GET',headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(30000)});
      const bytes=Buffer.from(await response.arrayBuffer());assert(bytes.length<4*1024*1024);
      const row={route,httpStatus:response.status};
      if(response.ok){
        const parsed=JSON.parse(bytes),encrypted=encryptBuffer(bytes,key),name='config-recovery-20261014-'+route.replaceAll('/','-')+'.json.gcm';
        fs.writeFileSync(path.join(DIR,name),encrypted,{flag:'wx',mode:0o600});
        const decoded=decryptBuffer(fs.readFileSync(path.join(DIR,name)),key);assert(decoded.equals(bytes));decoded.fill(0);
        Object.assign(row,{status:'ENCRYPTED_CAPTURE_ROUNDTRIP_PASS',encryptedSha256:hash(encrypted),encryptedBytes:encrypted.length});
        if(route==='secrets'){assert(Array.isArray(parsed));row.secretCount=parsed.length;row.secretNames=parsed.map(s=>s.name).sort();row.secretValuesRecoverable=false;}
        else row.fieldCount=Object.keys(parsed).length;
      }else row.status='CAPTURE_UNAVAILABLE';
      bytes.fill(0);captures.push(row);
    }
  }finally{key.fill(0);}
  fs.writeFileSync(output,JSON.stringify({recordedAt:new Date().toISOString(),project:REF,captures,
    status:captures.every(c=>c.httpStatus===200)?'READ_ONLY_CONFIGURATION_ARCHIVES_VERIFIED':'PARTIAL_CONFIGURATION_ARCHIVES',
    boundary:'Exact GET responses encrypted and roundtrip checked; not restored to a new project. Masked/absent fields and Edge secret hashes cannot reconstruct secret values. No settings/keys changed, no email sent. Provider file bodies, hosting settings and offsite custody remain separate.'},null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({captures:captures.map(({route,httpStatus,status})=>({route,httpStatus,status}))}));
}
main().catch(()=>{console.error('Config capture failed; response bodies and credentials withheld.');process.exitCode=1;});
