// Immutable identities for this run; no historical manifest is rewritten.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {moduleClosure,hash} from '../supabase/test-support/090_candidate_source.mjs';
import {READERS} from './090-five-family-contract.mjs';
const output='docs/reports/production-2026-10-13/five-family-source.json';
const pin=path=>{const bytes=fs.readFileSync(path);return {path,bytes:bytes.length,sha256:hash(bytes)};};
const packet=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-09-p3-compatibility-packet.json'));
for(const step of packet.steps)assert.deepEqual(pin(step.pin.path),step.pin);
const product=moduleClosure(READERS.map(r=>r.entrypoint));
const helpers=moduleClosure(['spike/090-five-family-source.mjs','spike/090-five-family-matrix.mjs',
  'spike/090-five-family-fixture.mjs','spike/090-five-family-transport.mjs','spike/090-five-family-edge.ts',
  'spike/090-five-family-cleanup.mjs','spike/090-p3-runtime-volume.mjs','spike/090-p3-runtime-command.mjs',
  'spike/090-p3-runtime-cleanup.mjs','spike/090-managed-services.mjs','spike/090-managed-api-setup.mjs',
  'spike/090-managed-tls.mjs','spike/090-managed-final-invariants.mjs']);
const pins=[...new Map([...product.files,...helpers.files,...packet.steps.map(s=>s.pin),
  ...['package.json','pnpm-lock.yaml','spike/090-p3-managed-web-lima.yaml','spike/090-p3-guest-provision.sh',
    'spike/090-p3-docker-classic.json'].map(pin)].map(p=>[p.path,p])).values()].sort((a,b)=>a.path.localeCompare(b.path));
const sourceBase=process.argv[2]==='--write'?execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim():JSON.parse(fs.readFileSync(output)).sourceBase;
assert(/^[a-f0-9]{40}$/u.test(sourceBase));
execFileSync('git',['cat-file','-e',sourceBase+'^{commit}']);
const result={attempt:'20261013-managed-families',sourceBase,
  pins,productExternal:product.external,helperExternal:helpers.external,
  boundary:'Current five-family backend closure and local helpers; not web/mobile/legacy runtime or deployment proof. Exact prior eleven SQL deltas retained.'};
const serialized=JSON.stringify(result,null,2)+'\n';
if(process.argv[2]==='--write')fs.writeFileSync(output,serialized,{flag:'wx'});
else {assert.equal(process.argv[2],'--verify');assert.equal(fs.readFileSync(output,'utf8'),serialized);}
console.log(JSON.stringify({pins:pins.length,productFiles:product.files.length,sql:packet.steps.length,status:'SOURCE_IDENTITY_ONLY'}));
