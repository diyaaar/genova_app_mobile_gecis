// Read-only source digest comparison; fetched bodies remain in memory only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {connect,REF,hash,canonicalEdgePath,runtimeClosure} from './090-p3-hosted-inventory.mjs';
const candidate=JSON.parse(fs.readFileSync('docs/reports/production-2026-10-13/release-candidate.json'));
const client=await connect();
const raw=await client.call('list_edge_functions'),deployed=raw.functions||raw;
const observations=[];
for(const entry of candidate.edge){
  const meta=deployed.find(f=>f.slug===entry.slug);
  if(!meta){observations.push({slug:entry.slug,status:'MISSING',candidateVerifyJwt:entry.verifyJwt});continue;}
  const fetched=await client.call('get_edge_function',{function_slug:entry.slug});
  assert.equal(fetched.slug,entry.slug);assert.equal(fetched.version,meta.version);
  const files=fetched.files.map(f=>({path:canonicalEdgePath(f.name),bytes:Buffer.byteLength(f.content),sha256:hash(f.content)}));
  const runtime=runtimeClosure(`supabase/functions/${entry.slug}/index.ts`,{pins:entry.closure.files});
  const pairs=entry.closure.files.map(p=>({path:p.path,candidate:p.sha256,hosted:files.find(f=>f.path===p.path)?.sha256||null}));
  const unexpected=files.filter(f=>!entry.closure.files.some(p=>p.path===f.path));
  const runtimeMatch=runtime.every(path=>{const p=pairs.find(p=>p.path===path);return p?.hosted===p?.candidate;});
  observations.push({slug:entry.slug,status:meta.status,version:meta.version,verifyJwt:meta.verify_jwt,
    candidateVerifyJwt:entry.verifyJwt,importMap:meta.import_map,bundleSha256:meta.ezbr_sha256,
    comparison:pairs.every(p=>p.hosted===p.candidate)&&unexpected.length===0?'EXACT_CLOSURE_MATCH':
      runtimeMatch&&unexpected.length===0?'RUNTIME_MATCH_TYPE_ONLY_OMISSIONS':'SOURCE_DIFFERENT',
    pairs,unexpected});
  console.log(JSON.stringify({slug:entry.slug,status:observations.at(-1).comparison,version:meta.version}));
}
fs.writeFileSync('docs/reports/production-2026-10-13/edge-inventory.json',JSON.stringify({observedAt:new Date().toISOString(),project:REF,observations,
  boundary:'Current version/config/source digests only. No hosted invocation, user rows, raw bodies or secrets retained; no deployment or mutation.'},null,2)+'\n',{flag:'wx'});
