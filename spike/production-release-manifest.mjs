// Reviewable local release candidate identities; never deploys or writes to a provider.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {moduleClosure,hash} from '../supabase/test-support/090_candidate_source.mjs';
const output='docs/reports/production-2026-10-13/release-candidate.json';
const pin=path=>{const bytes=fs.readFileSync(path);return {path,bytes:bytes.length,sha256:hash(bytes)};};
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const productRevision='9d1f1a7';
const productCommit=git('rev-parse',productRevision);
const productPaths=git('ls-files','-z','app','components','hooks','lib','store','public','apps/mobile','supabase/functions').split('\0')
  .filter(p=>p&&!/(\.test\.|\.spec\.|__tests__|__mocks__|(^|\/)AGENTS\.md$|(^|\/)CLAUDE\.md$|\/README\.md$)/u.test(p));
const configs=['package.json','pnpm-lock.yaml','next.config.ts','tsconfig.json','postcss.config.mjs','supabase/config.toml'];
const files=[...new Set([...productPaths,...configs.filter(p=>fs.existsSync(p))])].sort();
const pins=files.map(pin);
for(const p of pins)assert.equal(hash(execFileSync('git',['show',`${productCommit}:${p.path}`])),p.sha256,'Uncommitted product drift: '+p.path);
const compatibility=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-09-p3-compatibility-packet.json'));
const database=compatibility.steps.map(({ordinal,pin:p,after})=>{assert.deepEqual(pin(p.path),p);return {ordinal,pin:p,after};});
const slugs=['repertoire-file','assignment-file','assignment-review-file','repertoire-comment-file','chat-media-file',
  'legacy-file','drive-manager-v2','link-preview','account-recovery-006'];
const config=fs.readFileSync('supabase/config.toml','utf8');
const edge=slugs.map(slug=>{
  const block=config.match(new RegExp('\\[functions\\.'+slug+'\\]([\\s\\S]*?)(?=\\n\\[|$)'));
  const flag=block?.[1].match(/verify_jwt\s*=\s*(true|false)/u);
  const closure=moduleClosure([`supabase/functions/${slug}/index.ts`]);
  return {slug,verifyJwt:flag?flag[1]==='true':null,effectiveVerifyJwt:flag?flag[1]==='true':true,gatewayConfiguration:flag?'EXPLICIT_LOCAL_CONFIG':'DOCUMENTED_DEFAULT_TRUE; drive-manager-v2 hosted true retained; link-preview new deployment uses default',closure};
});
const result={productCommit,remoteBaseline:'a13f696da8c731e9af2a2bce473d4f4ae4a81587',pins,database,edge,
  supportingEvidence:['docs/reports/production-2026-10-13/rpc-inventory.json',
    'docs/reports/production-2026-10-13/five-family-evidence.json',
    'docs/reports/2026-10-13-production-baseline.md','docs/reports/production-2026-10-13/edge-inventory.json'].map(pin),
  status:'LOCAL_CANDIDATE_IDENTIFIED_NOT_APPROVED_FOR_DEPLOYMENT',
  remaining:['Fresh protected hosted cutoff/recovery comparison','Nine-Edge source reconciliation complete; verify target has not changed immediately before release',
    'Release review; current review is self-review, not independent','Full current web/native/provider integration acceptance',
    'Concrete deployment authority and rollout/recovery execution'],
  boundary:'The eleven SQL paths and nine Edge slugs are the proposed service convergence scope, not a bulk migration/Edge deployment command. All other migration/functions remain unchanged. Product pins include current web/mobile scope; they do not declare missing native features finished. No secrets/provider settings included.'};
const serialized=JSON.stringify(result,null,2)+'\n';
if(process.argv[2]==='--write')fs.writeFileSync(output,serialized,{flag:'wx'});
else{assert.equal(process.argv[2],'--verify');assert.equal(fs.readFileSync(output,'utf8'),serialized);}
console.log(JSON.stringify({productCommit,productPins:pins.length,databaseDeltas:database.length,edgeFunctions:edge.length,status:result.status}));
