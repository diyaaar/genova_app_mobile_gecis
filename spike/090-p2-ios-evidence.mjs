// Read-only owned simulator inspection. Persist counts/hashes only, never values.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = process.cwd(), device = '57F560F5-1EE1-4C28-A925-2D614E7CFFDE';
const stage = process.argv[2];
if(stage==='gate-summary') {
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
 const log=fs.readFileSync(root+'/spike/090-runtime/p2-root-check.log');
 const text=log.toString().replace(/\u001b\[[0-9;]*m/gu,'');
 assert(text.includes('"command":"check-root","code":0'));
 assert(/Tests\s+1178 passed/u.test(text));
 const p1=fs.readFileSync(root+'/docs/reports/090/2026-10-03-p1-beta-candidate.json');
 const manifest=JSON.parse(p1);assert.equal(manifest.pins.length,610);
 for(const pin of manifest.pins)assert.equal(sha(fs.readFileSync(root+'/'+pin.path)),pin.sha256);
 const file=root+'/docs/reports/090/2026-10-03-ios-p2-source-gates.json';assert(!fs.existsSync(file));
 fs.writeFileSync(file,JSON.stringify({date:new Date().toISOString(),status:'PASS',candidateId:manifest.candidateId,productPins:610,
  p1ManifestSha256:sha(p1),root:{command:'node spike/090-p2-ios.mjs check-root -> pnpm check',status:'PASS',tests:1178,testFiles:114,
   logSha256:sha(log),lint:true,typecheck:true,coverage:true,serviceWorkerSyntax:true,nextBuild:true},
  boundary:'Fresh local source quality/build gates; synthetic public URL/key, no 090 runtime flags. Next reports dotenv filenames; no production app served, CI/push/deploy/DB/provider write or hosted integration claim.'},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:'PASS',productPins:610,rootTests:1178}));process.exit(0);
}
if(stage==='build-summary') {
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
 const runtime=root+'/spike/090-runtime';
 const builds=fs.readdirSync(runtime).filter(x=>/^p2-xcode-.*\.log$/u.test(x)).map(file=>{
  const bytes=fs.readFileSync(runtime+'/'+file), text=bytes.toString();
  return {file,bytes:bytes.length,sha256:sha(bytes),buildSucceeded:text.includes('** BUILD SUCCEEDED **'),testSucceeded:text.includes('** TEST SUCCEEDED **'),
   failed:text.includes('** TEST FAILED **')||text.includes('** BUILD FAILED **'),testCasePassed:text.includes("testInteractive]' passed (26.451 seconds)")};
 });
 const records=['interactive-http-v2','authority-http-v2','interactive-v2-disk','authority-v2-disk','normal-disk'];
 const evidence=records.map(name=>{const file='docs/reports/090/2026-10-03-ios-p2-'+name+'.json', bytes=fs.readFileSync(root+'/'+file),r=JSON.parse(bytes);
  assert(['PASS_HTTP_NATIVE','PASS','PASS_NO_DISK_CREDENTIAL_MATCH'].includes(r.status));
  for(const pin of [...r.nativeSourcePins??[],...r.serverSourcePins??[]])assert.equal(sha(fs.readFileSync(root+'/'+pin.path)),pin.sha256);
  return {file,sha256:sha(bytes),status:r.status};
 });
 const output=root+'/docs/reports/090/2026-10-03-ios-p2-build-summary.json';assert(!fs.existsSync(output));
 fs.writeFileSync(output,JSON.stringify({date:new Date().toISOString(),candidateId:'GENOVA-BETA-20261003-P1',device,builds,evidence,
  negativeControls:{initialHttpCache:{status:'FAIL',cachedResponses:8,jwtMatchesInWal:16,refreshMarkerInWal:true,origin:'Read-only owned app CFNetwork SQLite and byte-pattern scan; values never emitted; reset only after observation'},
   uiV1:'FAIL: generated XCTest target lacked PRODUCT_NAME',uiV2:'FAIL: actual share popover has dismissal region, not Close button; separately agent-completed CUA return/close/B',
   authorityBuildsV1V2:'NOT ACCEPTED: Metro retained interactive=true; CI disables reset and export:embed ignores RN --config forwarding; current CLI override hook isolates v3 transforms'},
  result:'PASS_P2_RUNTIME_COMPONENTS; final gates/cleanup/commits in paired English report',boundary:'Local synthetic iOS simulator only; no hosted, physical, recipient-delivery, full Next route or independent-review proof'},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({builds:builds.length,evidence:evidence.length,status:'PASS_P2_RUNTIME_COMPONENTS'}));
 process.exit(0);
}
assert(['interactive-v2','authority-v2','normal'].includes(stage));
const container = execFileSync('xcrun', ['simctl','get_app_container',device,'com.genesinovachoir.genova','data'],{encoding:'utf8'}).trim();
assert(container.includes('/CoreSimulator/Devices/'+device+'/data/Containers/Data/Application/'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const files = [], hits = [];
function walk(dir) {
 for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
  const full=path.join(dir,item.name); if(item.isDirectory())walk(full); else if(item.isFile()) {
   const bytes=fs.readFileSync(full), text=bytes.toString('latin1'), file=path.relative(container,full);
   const jwt=(text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gu)||[]).length;
   const refresh=text.includes('090-synthetic-native-refresh');
   files.push({file,bytes:bytes.length,sha256:sha(bytes)});if(jwt||refresh)hits.push({file,jwt,refresh});
  }
 }
}
walk(container);
const cache=container+'/Library/Caches/com.genesinovachoir.genova/Cache.db';
const cacheRows=fs.existsSync(cache)?Number(execFileSync('sqlite3',['-readonly',cache,'SELECT count(*) FROM cfurl_cache_response'],{encoding:'utf8'}).trim()):0;
const attachments = [];
for(const version of ['v2','v3']) {
 const dir=root+'/spike/090-runtime/p2-ui-attachments-'+version, manifest=dir+'/manifest.json';
 if(!fs.existsSync(manifest))continue;
 for(const test of JSON.parse(fs.readFileSync(manifest)))for(const item of test.attachments??[])if(item.exportedFileName.endsWith('.png')) {
  const bytes=fs.readFileSync(dir+'/'+item.exportedFileName);
  attachments.push({attempt:version,name:item.suggestedHumanReadableName,sha256:sha(bytes),bytes:bytes.length,timestamp:item.timestamp});
 }
}
const app=root+'/spike/090-p2-ios-native-build/Build/Products/Release-iphonesimulator/Genova.app';
const temporaryScreens=fs.readdirSync(root+'/spike/090-runtime').filter(x=>/^p2-.*\.png$/u.test(x)).map(name=>{
 const bytes=fs.readFileSync(root+'/spike/090-runtime/'+name); return {name,sha256:sha(bytes),bytes:bytes.length};
});
const plaintext=fs.readFileSync(root+'/spike/090-p2-ios-native-build/Build/Products/Release-iphonesimulator/main.jsbundle','utf8');
const record={date:new Date().toISOString(),stage,device,runtime:'iOS26.5',status:hits.length?'FAIL_PERSISTENT_CREDENTIALS':'PASS_NO_DISK_CREDENTIAL_MATCH',
 files,hits,cacheRows,webKitPersistentFiles:files.filter(x=>/WebsiteData|LocalStorage|IndexedDB|Cookies/u.test(x.file)).map(x=>x.file),
 ephemeralFiles:files.filter(x=>/genova-webview-files|090-synthetic\.pdf/u.test(x.file)).map(x=>x.file),
 app:{executableSha256:sha(fs.readFileSync(app+'/Genova')),jsSha256:sha(fs.readFileSync(app+'/main.jsbundle'))},attachments,temporaryScreens,
 bundleInspection:{plaintextSha256:sha(plaintext),interactiveTrue:plaintext.includes('var interactive = true;'),interactiveFalse:plaintext.includes('var interactive = false;'),
 testRuntimeMarkers:['090 WEBVIEW','Interactive B refusal/clear PASS','http://127.0.0.1:18092'].filter(x=>plaintext.includes(x)),normalAppEntry:/var App = require\(_dependencyMap\[1\]\)\.default;/u.test(plaintext)},
 boundary:'Owned task-only app data, including HTTP cache files, scanned without returning credential values. Native secure-store keychain intentionally excluded; no WK memory-store or hosted-header claim. Source + functional lease/teardown evidence paired separately.'};
const output=root+'/docs/reports/090/2026-10-03-ios-p2-'+stage+'-disk.json';assert(!fs.existsSync(output));fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({stage,status:record.status,files:files.length,cacheRows,hits,webKitPersistentFiles:record.webKitPersistentFiles,ephemeralFiles:record.ephemeralFiles,attachments:attachments.length}));
