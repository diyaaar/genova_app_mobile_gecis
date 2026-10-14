// Read-only exact deployed sources/config, encrypted locally. Never deploys.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {connect,REF,hash} from './090-p3-hosted-inventory.mjs';
import {encryptBuffer,decryptBuffer} from './090-p3-consistent-backup.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-BJF2Dc';
const output='docs/reports/production-2026-10-14/edge-recovery.json';
let stage='scope';
async function main(){
  assert.equal(process.argv[2],'--capture-read-only');assert.equal(process.argv.length,3);
  assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
  assert(!fs.lstatSync(DIR).isSymbolicLink()&&(fs.statSync(DIR).mode&511)===448);
  const dest=path.join(DIR,'edge-recovery-20261014.json.gcm');assert(!fs.existsSync(dest)&&!fs.existsSync(output));
  const keyFile=path.join(DIR,'artifact-key.bin');assert.equal(fs.statSync(keyFile).mode&511,384);
  stage='connect';
  const client=await connect(),raw=await client.call('list_edge_functions'),functions=raw.functions||raw;
  assert(Array.isArray(functions)&&functions.length>0);
  const archived=[],pins=[];
  for(const metadata of functions){
    stage='fetch-'+metadata.slug;
    const fetched=await client.call('get_edge_function',{function_slug:metadata.slug});
    assert.equal(fetched.slug,metadata.slug);assert.equal(fetched.version,metadata.version);
    assert(fetched.files.length>0);
    stage='canonical-'+metadata.slug;
    const files=fetched.files.map(f=>({path:f.name,bytes:Buffer.byteLength(f.content),sha256:hash(f.content)}));
    assert.equal(new Set(files.map(f=>f.path)).size,files.length);
    archived.push({metadata,fetched});pins.push({slug:metadata.slug,version:metadata.version,verifyJwt:metadata.verify_jwt,bundleSha256:metadata.ezbr_sha256,files});
  }
  const end=await client.call('list_edge_functions');
  const identities=list=>list.map(f=>[f.slug,f.version,f.verify_jwt,f.ezbr_sha256,f.entrypoint_path,f.import_map_path]).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.deepEqual(identities(end.functions||end),identities(functions),'Hosted metadata changed during capture');
  const key=fs.readFileSync(keyFile),body=Buffer.from(JSON.stringify({project:REF,capturedAt:new Date().toISOString(),functions:archived}));
  const encrypted=encryptBuffer(body,key);fs.writeFileSync(dest,encrypted,{flag:'wx',mode:0o600});
  const restored=decryptBuffer(fs.readFileSync(dest),key);assert(restored.equals(body));
  const decoded=JSON.parse(restored);
  for(const [i,item]of decoded.functions.entries())for(const [j,file]of item.fetched.files.entries())assert.equal(hash(file.content),pins[i].files[j].sha256);
  const result={capturedAt:decoded.capturedAt,project:REF,functions:pins,encryptedBytes:encrypted.length,encryptedSha256:hash(encrypted),
    roundtripVerified:true,allFileHashesVerified:true,stableAcrossCapture:true,privateMode:'0600',
    status:'DEPLOYED_EDGE_SOURCE_CONFIG_RECOVERY_ARCHIVED_NOT_REDEPLOYED',
    boundary:'Encrypted deployed source/config archive verified locally. No redeployment, provider secrets, Auth/mail settings, Storage/R2/Drive objects, hosting environment or offsite custody. Prior insecure readers are archival evidence, not an approved security rollback.'};
  key.fill(0);body.fill(0);restored.fill(0);
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:result.status,functions:pins.length,encryptedBytes:encrypted.length,roundtripVerified:true}));
}
main().catch(error=>{fs.writeFileSync(path.join(DIR,'edge-recovery-error-20261014.log'),String(error.stack),{flag:'wx',mode:0o600});console.error('Protected Edge recovery capture failed at '+stage+'; details private.');process.exitCode=1;});
