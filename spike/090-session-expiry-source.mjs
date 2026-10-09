// Immutable server child evidence, no runtime/deploy/fixture overlays.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const source='bbc301c62ffb58a533b19d7cf904518be274aae7';
const parentPath='docs/reports/090/2026-10-09-p3-client-convergence-source.json';
const proofPath='docs/reports/090/2026-10-09-p3-session-expiry-v3.json';
const output='docs/reports/090/2026-10-09-p3-server-convergence-source.json';
const baseline='supabase/migrations/20260930080046_private_file_ticket_authority_090.sql';
const delta='supabase/migrations/20261009190611_private_file_session_expiry_090.sql';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const git=(...args)=>execFileSync('git',args,{stdio:['ignore','pipe','pipe'],maxBuffer:32*1024*1024});
const read=file=>git('show',`${source}:${file}`);
const pin=file=>({path:file,sha256:hash(read(file)),bytes:read(file).length});
const parent=JSON.parse(fs.readFileSync(parentPath)),proof=JSON.parse(fs.readFileSync(proofPath));
assert.equal(proof.status,'LOCAL_SYNTHETIC_SERVER_EXPIRY_PASS_NOT_RELEASE');
assert(proof.resources.ownedRuntimeRemoved&&proof.resources.peakKiB<proof.resources.capKiB);
assert.equal(proof.http.families,5);assert.equal(proof.http.reads,85);
assert(proof.http.providerZeroOnDenial&&proof.forwardGuardNegatives.length===6);
for(const p of parent.pins){assert.equal(hash(read(p.path)),p.sha256,'Parent source drift');assert.equal(hash(fs.readFileSync(p.path)),p.sha256,'Working parent drift');}
for(const p of proof.pins){assert.equal(hash(read(p.path)),p.sha256,'Proof source drift');assert.equal(hash(fs.readFileSync(p.path)),p.sha256,'Working proof drift');}
const body=text=>text.split('as $fn$')[1].split('$fn$;')[0];
assert.equal(body(read(delta).toString()).replace('\n      and (s.not_after is null or s.not_after > statement_timestamp())',''),
  body(read(baseline).toString()),'Unexpected private authority body change');
const tests=['supabase/tests/090_private_file_ticket_authority.sql','supabase/tests/090_legacy_file_authority.sql',
  'supabase/test-support/090_session_expiry_fixture.sql','supabase/test-support/090_http_session_expiry.ts',
  'supabase/test-support/090_session_expiry_runner.mjs','supabase/test-support/090_connected_private_file_families.ts',
  'supabase/test-support/090_http_families.ts','supabase/migrations/20260903214901_tenant_schema_003.sql',
  'supabase/migrations/20260923193000_private_r2_chat_media_060.sql'];
for(const file of tests)assert.equal(hash(fs.readFileSync(file)),hash(read(file)),'Auxiliary source drift');
const allowed=[delta,...tests.filter(file=>!parent.pins.some(p=>p.path===file)&&!file.endsWith('090_legacy_file_authority.sql')&&!file.endsWith('090_http_families.ts'))].sort();
assert.deepEqual(git('diff','--name-only',parent.source,source,'--','app','components','hooks','lib','store','public','scripts','apps/mobile','supabase')
  .toString().trim().split('\n').sort(),allowed,'Unexpected product/test delta');
const result={date:'2026-10-09',candidateId:'GENOVA-BETA-20261003-P1-SERVER-090-20261009',source,
  status:'LOCAL_SOURCE_CONVERGENCE_ONLY_REHEARSAL_PLATFORMS_REVIEW_OPEN',
  sourceTree:git('rev-parse',`${source}^{tree}`).toString().trim(),
  parent:{path:parentPath,sha256:hash(fs.readFileSync(parentPath)),source:parent.source,candidateId:parent.candidateId},
  immutableParents:parent.immutableAcceptanceParents,
  pins:[...parent.pins,pin(delta)],parentPinsUnchanged:parent.pins.length,
  forwardDelta:{...pin(delta),requires:baseline,baselineSha256:hash(read(baseline)),
    changedBody:'Only null/future Auth not_after at statement_timestamp; exact preceding body/wrapper/owner/ACL/config guarded',
    orderedBefore:'All newly promoted v2 readers, client activation or distribution; not an automatic migration replay instruction'},
  auxiliarySourcePins:tests.map(pin),runtimeProof:{path:proofPath,sha256:hash(fs.readFileSync(proofPath)),
    fiveFamilyReads:85,denials45:proof.http.observations.filter(row=>row.status===401||row.status===403).length,
    sourcePinsVerified:true,scope:proof.boundary},
  closureComparison:{parentClientPinsUnchanged:613,unchangedEdgeClosures:20,unchangedPageApiEntries:46,
    unchangedNativeAndSharedAnnotation:true,addedPublicRpcNames:0,bodyPredicateOnly:true},
  construction:'Read exact committed child without historical profile/backport overlays. Apply only reviewed exact ordered deltas after separate recovery/rehearsal/release authority.',
  remaining:['Managed Auth/PostgREST/RLS and exact restored-state ordered mixed-client/cache/old-web rehearsal',
    'Current exact package agent-owned Android+iOS reacceptance','Independent package review',
    'Separately authorized hosted DB/Edge/web rollout/provider flags/copy/distribution/store acceptance'],
  helperSha256:hash(fs.readFileSync(import.meta.filename)),
  boundary:'Not fullP3, hosted/server deployment, real-provider, native/platform or commercial release acceptance; historicalP1/P2 unchanged.'};
const serialized=JSON.stringify(result,null,2)+'\n';assert(Buffer.byteLength(serialized)<256*1024);
assert(!/apikey_[a-f0-9]{20}|eyJ[A-Za-z0-9_-]+\./u.test(serialized));
if(process.argv[2]==='--write')fs.writeFileSync(output,serialized,{flag:'wx'});
else{assert.equal(process.argv[2],'--verify');assert.equal(fs.readFileSync(output,'utf8'),serialized);}
console.log(JSON.stringify({source,pins:result.pins.length,auxiliaryPins:tests.length,bodyPredicateOnly:true,
  reads:85,denials:result.runtimeProof.denials45,parentPinsUnchanged:613,bytes:Buffer.byteLength(serialized)}));
