import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { assertPacket,validateResponse } from './jev-analysis.mjs';
const source='docs/reports/090/2026-10-01-connected-audio-http.json';
const trace='docs/reports/090/2026-10-01-connected-audio-native.txt';
const prefix='docs/reports/090/2026-10-01-jev-connected-audio';
const sha=x=>createHash('sha256').update(x).digest('hex');
export const expected={connected:'supports',recovery:'supports',deadline:'supports',switch:'supports',
  authority:'contradicts',server_expiry:'contradicts',hosted:'contradicts',ios:'insufficient',
  load:'insufficient',close:'contradicts',invoice:'insufficient'};
export function buildAudioPacket(record,nativeTrace,sourceHashes){
  if(record.result!=='PASS'||record.tickets.join()!=='200,200,200,403'||record.contentLength!==160044||
    !/^[a-f0-9]{64}$/.test(record.sha256)||!nativeTrace.includes('ALL PASS connected local Android audio; not hosted/iOS/audibility'))throw Error('Actual connected evidence required');
  const denied=record.reads.filter(r=>r.status>=400),allowed=record.reads.filter(r=>r.status<300);
  if(!denied.some(r=>r.method==='GET'&&r.status===401)||!denied.some(r=>r.method==='GET'&&r.status===403)||
    denied.filter(r=>r.method==='HEAD'&&r.status===401).length!==1||
    denied.filter(r=>r.method==='HEAD'&&r.status===403).length<2||allowed.filter(r=>r.method==='GET').length<2||
    denied.some(r=>r.providerDelta!==0)||allowed.some(r=>r.providerDelta!==1))throw Error('Incomplete HTTP observations');
  const claims={
    connected:'This local checkpoint exercises the product AuthStore/SecureStore, real Auth/RLS/PostgREST/Deno ticket issuance and actual Android ExpoAudio with signature-verified synthetic object bytes.',
    recovery:'A declared valid signed-v1 source fault was refused by actual native GET401 and HEAD401, then exactly one fresh actual-authority POST renewed v2 and loaded the audio.',
    deadline:'A declared client-deadline fault exercised one actual-authority renewal and position-preserving playback, pause, seek and resume in Android.',
    switch:'Actual AuthStore selection of B clears the player; an earlier A v2 HEAD and native body/probe fail403 without provider access or another ticket POST.',
    authority:'Jev decides access grants at runtime instead of SQL authorization.',
    server_expiry:'The renewal test waited for the actual server-signed ticket expiration, with no injected client deadline.',
    hosted:'The signature-verified synthetic loopback object service is a live hosted Cloudflare R2 production deployment.',
    ios:'Integrated native iOS connected audio works.',
    load:'100 simultaneously active choir tenants have acceptable audio load performance.',
    close:'All mandatory090 gates are complete; the brief can close.',
    invoice:'An independently verified provider invoice total is available.',
  };
  const packet={model:'jev-1.13.0',state:{sourceHashes,http:record,nativeTrace,
    method:'Primary self-reviewed local tests, not independent review. Real synthetic Auth login and product AuthStore/SecureStore/RLS/POST/Deno. Actual Android API36 Release/ExpoAudio player. Relay normalizes POST ticket URL origin/path and forwards unchanged signed query to actual Deno; GET/HEAD observations verify bytes/signature and provider counts. Valid v1 substitution, client expiresAt fault, cached earlier v2 in B are intentional injections. No expiry clock shift.',
    known_opposites:'SQL/Auth/Deno decides access, not Jev. Server deadline was not awaited; client deadline was explicitly injected. Object service is synthetic local, not hosted Cloudflare R2.090 cannot close: native iOS and hosted/release gates are open.',
    unknowns:'Integrated native iOS, physical audibility/device, hosted provider/deploy,100-tenant load and invoice are unmeasured, not proven broken.',
    policy:'Advisory only. Exact tests/source and human engineering review own acceptance. Current audio gate may pass locally while090 remains open.'},
    questions:Object.fromEntries(Object.entries(claims).map(([id,claim])=>[id,{type:'choice',
      instructions:`How does the supplied evidence relate to this exact claim: ${claim}`,
      criteria:{supports:'The supplied observations directly establish the claim within its stated scope.',
        contradicts:'Observed facts or explicit implementation/method contradict the claim. An unrun gate alone is NOT contradiction.',
        insufficient:'This behavior or measured outcome is unknown/unrun. Missing observations do not prove opposite behavior.'}}]))};
  assertPacket(packet);return packet;
}
async function prepare(){
  const raw=await readFile(source,'utf8'),native=await readFile(trace,'utf8');
  const hashes={http:sha(raw),native:sha(native)},packet=buildAudioPacket(JSON.parse(raw),native,hashes);
  await writeFile(`${prefix}-request.json`,JSON.stringify({packet,sourceHashes:hashes,requestSha256:sha(JSON.stringify(packet))},null,2),{flag:'wx'});
  await writeFile(`${prefix}-labels.json`,JSON.stringify({expected,labelOwner:'Primary agent before inference, not independent review.'},null,2),{flag:'wx'});
  console.log(JSON.stringify({status:'PREPARED',questions:Object.keys(packet.questions).length,bytes:Buffer.byteLength(JSON.stringify(packet)),maxCalls:1,retries:0}));
}
async function evaluate(){
  const saved=JSON.parse(await readFile(`${prefix}-request.json`,'utf8'));const {packet}=saved;assertPacket(packet);
  if(sha(JSON.stringify(packet))!==saved.requestSha256||sha(await readFile(source))!==saved.sourceHashes.http||
    sha(await readFile(trace))!==saved.sourceHashes.native)throw Error('Evidence drift');
  await writeFile(`${prefix}-attempt.json`,JSON.stringify({timestamp:new Date().toISOString(),model:packet.model,requestSha256:saved.requestSha256},null,2),{flag:'wx'});
  if(!process.stdin.isTTY)throw Error('Private non-echoing input required');
  const reader=createInterface({input:process.stdin});let key=(await reader.question('Private key input: ')).trim();reader.close();
  if(!/^apikey_[a-f0-9]{20,80}_[a-f0-9]{64}$/iu.test(key))throw Error('Invalid secret shape');
  const started=performance.now();
  const response=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',redirect:'error',signal:AbortSignal.timeout(45000),
    headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(packet)});key='';
  if(!response.ok)throw Error(`Provider HTTP ${response.status}`);
  const raw=await response.text();if(Buffer.byteLength(raw)>1048576)throw Error('Response bound');
  const result=JSON.parse(raw);validateResponse(packet,result);
  const evidence={timestamp:new Date().toISOString(),requestSha256:saved.requestSha256,elapsedMs:Math.round(performance.now()-started),
    model:result.model,usage:result.usage,estimatedUsd:result.usage.input_tokens*0.042/1000000,answers:result.answers};
  await writeFile(`${prefix}-response.json`,JSON.stringify(evidence,null,2),{flag:'wx'});console.log(JSON.stringify(evidence));
  if(evidence.estimatedUsd>0.002)throw Error('Cost cap exceeded; stop');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  (process.argv[2]==='--prepare'?prepare():process.argv[2]==='--evaluate'?evaluate():Promise.reject(Error('Unknown action')))
    .catch(()=>{console.error('090 audio Jev stopped safely; no retry or printed secrets');process.exitCode=1;});
}
