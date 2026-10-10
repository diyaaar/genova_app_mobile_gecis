// Redacted public receipt from protected execution records, never rows/tokens/env.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {DIR,readPrivate,IMAGE} from './090-compatibility-sql-rehearsal.mjs';
import {requireManagedCleanupOrder} from './090-managed-cleanup-order.mjs';
const attempt='20261010-managed-final',prior='20261010-managed-web',prefix='managed-'+attempt;
assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');assert.equal(process.argv.length,3);assert(['--write','--verify'].includes(process.argv[2]));
const sha=b=>createHash('sha256').update(b).digest('hex'),read=name=>JSON.parse(readPrivate(name));
const restore=read('restore-summary-'+attempt+'.json'),deltas=read('compatibility-'+attempt+'-deltas.json');
const startup=read(prefix+'-startup-pass.json'),current=read(prefix+'-browser-v9.json'),legacy=read('managed-'+prior+'-browser-v8.json');
const final=read(prefix+'-final-invariants-v2.json'),backendCleanup=read('runtime-cleanup-'+attempt+'.json'),cleanup=read(prefix+'-cleanup.json');
requireManagedCleanupOrder({current,legacy,invariants:final,currentMtime:fs.statSync(path.join(DIR,prefix+'-browser-v9.json')).mtimeMs,
  legacyMtime:fs.statSync(path.join(DIR,'managed-'+prior+'-browser-v8.json')).mtimeMs});
assert.equal(restore.status,'CURRENT_STATE_SELECTED_FIDELITY_PASS');assert.deepEqual(restore.differences,{});assert.equal(restore.dataTables,101);assert.equal(restore.restoredRows,2880);
assert.equal(deltas.status,'ACTUAL_ELEVEN_CLONE_DELTAS_PASS');assert.equal(deltas.observations.length,11);
assert.equal(startup.status,'REAL_AUTH_REST_HEALTH_STARTUP_INVARIANTS_PASS');assert.equal(startup.imageMigrationDDL,0);
assert.equal(current.status,'CURRENT_REAL_READ_FLOW_PASS_LEGACY_SUPPORT_OWNER_RETIRED');assert.equal(current.errors.length,0);assert.equal(current.outside.length,0);
assert.equal(backendCleanup.status,'OWNED_FINAL_RUNTIME_REMOVED');assert.equal(cleanup.status,'OWNED_WEB_BUILDS_AND_EPHEMERAL_TEST_SECRETS_REMOVED');
const owner=read('runtime-ownership-'+attempt+'.json');assert.equal(owner.capacityMiB,6144);assert(!fs.existsSync(owner.image)&&!fs.existsSync(owner.mount));
assert(!fs.existsSync('/Users/alidiyarduran/Antigravity/genovakorist/spike/090-runtime/managed-web'));
const sources=read(prefix+'-sources.json'),build=read(prefix+'-build-current.json'),transport=read(prefix+'-transport-result-final.json');
assert.equal(build.exitCode,0);assert.equal(build.resourceStop,false);assert.equal(transport.metrics.outside,0);assert.equal(transport.authRestAuthorityMocked,false);
const beforeRace=read('managed-'+prior+'-final-invariants.json');assert(!fs.existsSync(path.join(DIR,'managed-'+prior+'-final-invariants-v2.json')),'Original interrupted result must not be retrospectively filled');
const names=fs.readdirSync(DIR).filter(n=>n.includes(attempt)&&n.endsWith('.json'));
const peaks=names.flatMap(name=>{const r=read(name);return [r.peakAllocatedKiB,r.peakKiB].filter(Number.isFinite);});
const peak=Math.max(current.peakAllocatedKiB,...peaks);assert(peak<(6144-64)*1024);
const helperNames=[...fs.readdirSync('spike').filter(n=>/^090-managed-.*\.(mjs|ts)$/u.test(n)).map(n=>'spike/'+n),
  'spike/090-p3-managed-web-lima.yaml','spike/090-p3-resource-policy.mjs','spike/090-p3-resource-policy.test.mjs','spike/090-p3-runtime-command.mjs',
  'spike/090-p3-runtime-resources.mjs','spike/090-p3-runtime-volume.mjs','spike/090-p3-runtime-cleanup.mjs','spike/090-p3-offline-restore.mjs',
  'spike/090-compatibility-sql-rehearsal.mjs','spike/090-compatibility-retry-startup.mjs'].sort();
const result={date:'2026-10-10',status:'MANAGED_CURRENT_READ_CHECKPOINT_PASS_NOT_FULL_P3_OR_RELEASE',
  helperCommit:execFileSync('git',['log','-1','--format=%H','--','spike/090-managed-evidence.mjs'],{encoding:'utf8'}).trim(),productSource:sources.observations.current.source,
  immutable614:{path:'docs/reports/090/2026-10-09-p3-server-convergence-source.json',sha256:sha(fs.readFileSync('docs/reports/090/2026-10-09-p3-server-convergence-source.json')),pins:614},
  packet:{path:'docs/reports/090/2026-10-09-p3-compatibility-packet.json',sha256:deltas.packetSha256,applied:11},
  recovery:{attempt,retainedCutoff:read('summary.json').cutoff,plaintextSha256:restore.backupSha256,ciphertextSha256:final.sourceCiphertextSha256,
    beforeDeltas:{catalogGroups:17,catalogCounts:restore.catalogCounts,dataTables:101,rows:2880,actualFullPinnedImage:IMAGE,networkNone:true,mounts:0,ports:0},
    comparatorUnchanged:restore.exactComparatorUnchanged,afterManagedStartup:{groups:17,tables:101,changes:0},
    afterFinalBrowser:{recordedAt:final.recordedAt,catalogGroups:17,metadataChanges:0,dataBoundary:final.dataBoundary}},
  services:{auth:{version:'2.196.0',image:read(prefix+'-pull-auth.json').image},rest:{version:'14.13',image:read(prefix+'-pull-rest.json').image},
    deno:'2.9.6',supabaseSdk:'2.112.4',aws4fetch:'1.0.20',next:'15.5.25',authRestMocked:false,genuinePasswordSessions:true,imageStartupDDL:0,
    network:'Internal Docker bridge; direct dedicated SSH loopback forwards; scoped HTTPS ingress fixture, not hosted Kong/Envoy/Edge runtime',
    tls:'Separate local root CA/non-CA server leaf; Node/Deno trust this CA, browser SPKI limited to the leaf; global trust unchanged',
    provider:'Synthetic PDF/WAV only. All final provider hops verified using actual AWS4-HMAC signatures; no real Drive/R2/Storage bytes'},
  source:{currentFiles:sources.observations.current.pins.length,oldFiles:sources.observations.old.pins.length,oldSource:sources.observations.old.source,
    oldTransitivePackages:sources.oldTransitivePackages,oldTransitiveSnapshots:sources.oldTransitiveSnapshots,
    oldLockSha256:sources.oldLockSha256,installedLockSha256:sources.installedLockSha256,oldClosureInstalled:true,
    builds:{currentFinal:{status:'PASS',attempt,source:build.source},oldPrior:{status:'PASS',attempt:prior,source:read('managed-'+prior+'-build-old.json').source}},productionEnvCopied:false},
  browser:{current:{attempt,startedAt:current.recordedAt,completedAt:current.completedAt,scenarios:current.scenarios,errors:[],outside:[]},
    legacySecurity:{attempt:prior,pinnedHistoricalSameSource:true,freshlyRerun:false,scenarios:legacy.scenarios.filter(s=>s.status==='PASS')},
    legacyUnsupported:{r2OnlyCatalogue:'FAIL_REPRODUCED_NOT_WAIVED',offlineTransition:'FAIL_REPRODUCED_NOT_WAIVED',oldOpenBuffer:'Historical FAIL/previously downloaded-byte limitation retained'},
    ownerPolicy:{decision:36,quote:'şuan eski web sürümü uygulama kullanılmıyor o yüzden çok dert etmeye gerek yok doğru anladıysam.',
      basis:'Direct 10 October owner reply, not measured usage telemetry',interpretation:'Do not extend retired legacy web feature compatibility; supported current client must precede private-storage activation; preserve replay-denial controls',
      hostedDeploymentAuthorized:false,siblingWebsiteChanged:false}},
  resources:{finalCapMiB:6144,ownerMaximumMiB:6656,liveStopKiB:655360,preflightFreeKiB:owner.sourceFreeKiB,reserveKiB:owner.reserveKiB,
    observedFinalPeakKiB:peak,freeAfterCleanupKiB:cleanup.freeKiB,backendRemoved:true,webBuildsRemoved:true,ephemeralArtifactsRemoved:cleanup.ephemeralArtifactsRemoved,
    nodeModulesKept:cleanup.rootDependenciesPreserved,protectedBackupKeyKept:cleanup.protectedCustodyKeyRetained,noGlobalCacheDeletion:true,
    firstRejectedBrowserProfiles:'Initial rejected v1 used ambient Playwright temp location; accepted v8/v9 and final v9 explicitly counted all browser temp outputs. Do not claim initial transient profile peak was measured.'},
  originalFailure:{attempt:prior,afterMostTestsCataloguePassAt:beforeRace.recordedAt,finalAudit:'FAILED_INTERRUPTED_BY_PREMATURE_CLEANUP',
    earlierPassNotPromotedToLastAudit:true,errorPrivateAndPreserved:true,
    remedy:'Fresh faithful restore/eleven SQL/real services/current build/current complete browser under lower six-GiB cap, final catalogue fully awaited, cleanup prerequisite rejects missing or older audit'},
  focusedChecks:{unitTests:12,eslint:'PASS all scoped mjs with no-ignore',denoCheck:'PASS both typed bootstrap/smoke files cached-only',
    immutableServer614:'PASS',immutableElevenPacket:'PASS',diffCheck:'PASS',pnpmCheck:'NOT RUN: no product/shared dependency/build config changed; actual current production build passed',
    mobile:'NOT RUN in this scope',independentReview:'NOT RUN, self-review not equivalent'},
  jev:{paidCalls:0,newCostUsd:0,privateExport:false},
  remaining:['Actual managed Auth/RLS read and revocation matrix for all five families','Current matched Android+iOS acceptance',
    'Independent release-package review and fresh separately authorized hosted reconciliation/rollout','Current-client-first activation/storage/provider/beta/store gates'],
  helperPins:helperNames.map(file=>({path:file,sha256:sha(fs.readFileSync(file))})),
  boundary:'Current genuine managed read checkpoint only. Retained 9 October source is not a fresh 10 October hosted backup. No hosted writes/push/deploy/provider activation/native builds/real accounts/messages/owner QA/private AI export; no full P3 or production readiness.'};
const output='docs/reports/090/2026-10-10-p3-managed-read-compatibility.json',body=JSON.stringify(result,null,2)+'\n';assert(Buffer.byteLength(body)<64*1024);
assert(!/apikey_[a-f0-9]{20}|eyJ[A-Za-z0-9_-]+\./u.test(body),'Secret-shaped public data');
if(process.argv[2]==='--write')fs.writeFileSync(output,body,{flag:'wx'});else assert.equal(fs.readFileSync(output,'utf8'),body);
console.log(JSON.stringify({status:result.status,attempt,currentPasses:current.scenarios.filter(s=>s.status==='PASS').length,
  legacySecurityPasses:result.browser.legacySecurity.scenarios.length,observedPeakKiB:peak,helperPins:helperNames.length,bytes:Buffer.byteLength(body)}));
