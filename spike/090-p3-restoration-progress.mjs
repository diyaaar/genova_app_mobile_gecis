// Strict redacted checkpoint. Data equality is not full recovery acceptance.
import fs from 'node:fs';
import crypto from 'node:crypto';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const OUTPUT='docs/reports/090/2026-10-09-p3-restoration-progress.json';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--record'||fs.existsSync(OUTPUT))throw Error('Checkpoint scope refused');
const backup=JSON.parse(fs.readFileSync(DIR+'/summary.json'));
const restore=JSON.parse(fs.readFileSync(DIR+'/restore-summary.json'));
const diagnostic=JSON.parse(fs.readFileSync(DIR+'/fidelity-canonical-diagnostic.json'));
if(backup.project!=='hievmwwctjjlhmssoxsu'||restore.backupSha256!==backup.plaintextSha256||restore.network!=='none'||restore.mounts||restore.publishedPorts)throw Error('Recovery identity refused');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const result={recordedAt:new Date().toISOString(),project:backup.project,status:'RESTORED_DATA_PASS_FULL_FIDELITY_FAIL_NOT_ACCEPTED',
  backup:{cutoff:backup.cutoff,completedAt:backup.recordedAt,plaintextSha256:backup.plaintextSha256,encryptedSha256:backup.encryptedSha256,dataTables:backup.dataTables},
  actualRestore:{completedAt:restore.recordedAt,database:restore.database,network:'none',mounts:0,publishedPorts:0,
    dataTables:restore.dataTables,restoredRows:restore.restoredRows,allCanonicalTableDataDigestsMatch:!restore.differences.data,
    catalogCounts:restore.catalogCounts,strictDifferenceGroups:Object.keys(restore.differences),status:restore.status},
  diagnostic:{readOnlyComparisonContext:diagnostic.searchPath,groups:diagnostic.groups,changesNoDataOrPrivileges:true,
    limits:'Canonical search path resolves formatting differences, not ACL/physical column slot/publication differences. Original strict failure remains authoritative.'},
  helperSha256:Object.fromEntries(['spike/090-p3-offline-restore.mjs','spike/090-p3-recovery-queries.mjs','spike/090-p3-fidelity-diagnostics.mjs','spike/090-p3-resource-policy.mjs'].map(f=>[f,hash(f)])),
  freshExport:{status:'FAILED_CONNECT_TIMEOUT_NO_BACKUP_CREATED',sameApprovedParent:true,failedDirectory:'genova-090-p3-kroZk3',noCredentialResetOrNetworkRestrictionChange:true},
  limits:'Actual7October logical snapshot restored9October, not a fresh9October row backup or full fidelity/release PASS. New direct SQL TCP export unavailable; managed settings/storage/Vault values/Realtime payloads/sequence consistency/client/runtime/independent review remain separate.',
  hostedWrites:0,newJevCalls:0,newInferenceCostUSD:0,ownerManualQA:false};
fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:OUTPUT,status:result.status,dataTables:result.actualRestore.dataTables,rows:result.actualRestore.restoredRows,dataDigestsMatch:result.actualRestore.allCanonicalTableDataDigestsMatch}));
