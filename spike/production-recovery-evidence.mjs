// Final safe evidence projection; private row bodies/credentials never exported.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {hash,moduleClosure} from '../supabase/test-support/090_candidate_source.mjs';
import {requireCompleteMatrix,READERS} from './090-five-family-contract.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-BJF2Dc';
const attempt='20261014-fresh-recovery',prefix=`managed-${attempt}`;
const read=name=>{const file=path.join(DIR,name),s=fs.lstatSync(file);assert(s.isFile()&&!s.isSymbolicLink()&&(s.mode&511)===384);return JSON.parse(fs.readFileSync(file));};
const restore=read(`restore-summary-${attempt}.json`),deltas=read(`compatibility-${attempt}-deltas.json`),tests=read(`compatibility-${attempt}-tests.json`);
assert.equal(restore.status,'CURRENT_STATE_SELECTED_FIDELITY_PASS');assert.deepEqual(restore.differences,{});
assert.equal(deltas.observations.length,11);assert.equal(tests.observations.length,10);
const matrix=read(prefix+'-matrix-v1.json'),browser=read(prefix+'-browser-current.json'),transport=read(prefix+'-transport-result-matrix.json');
assert.equal(requireCompleteMatrix(matrix.observations),219);assert.equal(browser.status,'CURRENT_CANDIDATE_REAL_BROWSER_PASS');assert(browser.childrenExited&&transport.childrenExited&&transport.closed);
assert.deepEqual(browser.errors,[]);assert.deepEqual(browser.outside,[]);
const cleanup=read(`runtime-cleanup-${attempt}.json`),secrets=read(prefix+'-cleanup.json');assert.equal(cleanup.status,'OWNED_FINAL_RUNTIME_REMOVED');assert(secrets.listenersAbsent);
const source=read(prefix+'-current-web-source-v2.json'),build=read(prefix+'-current-web-build-v2.json');assert.equal(build.exitCode,0);assert.equal(build.resourceStop,false);
for(const p of source.pins)assert.equal(hash(fs.readFileSync(p.path)),p.sha256);
const helpers=moduleClosure(['spike/production-recovery-evidence.mjs','spike/production-current-web.mjs','spike/090-five-family-edge.ts',
  'spike/production-edge-recovery.mjs','spike/production-config-recovery.mjs','spike/090-five-family-matrix.mjs','spike/090-five-family-fixture.mjs',
  'spike/090-five-family-transport.mjs','spike/090-five-family-cleanup.mjs','spike/090-p3-runtime-volume.mjs','spike/090-p3-runtime-command.mjs',
  'spike/090-p3-runtime-cleanup.mjs','spike/090-managed-api-setup.mjs','spike/090-managed-services.mjs','spike/090-managed-final-invariants.mjs','spike/090-managed-tls.mjs']);
const pin=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:hash(b)};};
const manifest={attempt,productCommit:source.productCommit,entryCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  product:source.pins,readerClosure:moduleClosure(READERS.map(r=>r.entrypoint)),helpers:[...helpers.files,...['spike/production-current-browser.mjs','spike/090-managed-next-fetch.mjs'].map(pin)],
  browserDynamicDependency:'Pinned source bundles createPrivateFileTicketV2 from the reader closure in memory solely to create an expired test ticket; no downloaded dynamic code.',
  runtimeConfigs:['spike/090-p3-managed-web-lima.yaml','spike/090-p3-docker-classic.json','spike/090-p3-guest-provision.sh'].map(pin),
  boundary:'Post-run final helper identities; dated intermediate failed build/runtime receipts remain private and are not relabelled. Product sources exact to release candidate.'};
const out='docs/reports/production-2026-10-14';
fs.writeFileSync(out+'/source.json',JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
const result={recordedAt:new Date().toISOString(),attempt,sourceManifestSha256:hash(fs.readFileSync(out+'/source.json')),restore,deltas,tests,
 matrix:{status:matrix.status,observations:matrix.observations,media:matrix.media,events:matrix.events,retainedTicketLifetimeChecked:matrix.retainedTicketLifetimeChecked,streamBoundary:matrix.streamBoundary},
 browser:{status:browser.status,productCommit:browser.productCommit,scenarios:browser.scenarios,errors:browser.errors,outside:browser.outside,completedAt:browser.completedAt,childrenExited:browser.childrenExited},
 transport:{auth:transport.metrics.auth,rest:transport.metrics.rest,provider:transport.metrics.provider,outside:transport.metrics.outside,closed:transport.closed,childrenExited:transport.childrenExited},
 build,finalInvariants:read(prefix+'-final-invariants-v2.json'),cleanup,secrets,
 status:'FRESH_RESTORE_SQL_FIVE_FAMILY_CURRENT_BROWSER_LOCAL_PASS',
 boundary:'Real local fresh logical recovery/Auth/PostgREST/RLS/current Edge/Next/browser. Signed provider bytes synthetic. Config/source archives are custody proof, not provider restore. No live mutation/push/deploy/native/store/commercial acceptance; self-review only.'};
fs.writeFileSync(out+'/recovery-evidence.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,catalogGroups:Object.keys(restore.catalogCounts).length,tables:restore.dataTables,rows:restore.restoredRows,http:matrix.observations.length,browserPasses:browser.scenarios.filter(s=>s.status==='PASS').length,cleanup:secrets.status}));
