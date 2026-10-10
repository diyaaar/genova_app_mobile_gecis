// Local ingress/provider fixture; AUTH/REST/RPC/Edge decisions never mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {createServer as httpServer,request as httpRequest} from 'node:http';
import {createServer as httpsServer} from 'node:https';
import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
import {pdf,wave} from './090-managed-media.mjs';
assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);assert(['--run-approved','--run-after-read-guard','--run-dedicated-tunnel','--run-current-sdk-cors','--run-ca-leaf','--run-legacy-case','--run-signed-legacy','--run-initial-final'].includes(process.argv[2]));
const ROOT='/Users/alidiyarduran/Antigravity/genovakorist',prefix=`managed-${ATTEMPT}`;
const freshFinal=process.argv[2]==='--run-initial-final';if(freshFinal)assert.equal(ATTEMPT,'20261010-managed-final');
const signedLegacy=process.argv[2]==='--run-signed-legacy'||freshFinal,legacyCase=!freshFinal&&(process.argv[2]==='--run-legacy-case'||signedLegacy),leaf=freshFinal||process.argv[2]==='--run-ca-leaf'||legacyCase;
const retry=!freshFinal&&process.argv[2]!=='--run-approved',suffix=freshFinal?'-final':signedLegacy?'-v7':legacyCase?'-v6':leaf?'-v5':process.argv[2]==='--run-current-sdk-cors'?'-v4':process.argv[2]==='--run-dedicated-tunnel'?'-v3':retry?'-v2':'';
if(retry)for(const name of ['legacy-file','repertoire-file']){
  const error=readPrivate(prefix+'-'+name+'.log').toString();
  assert(error.includes('Requires read access to "'+ROOT+'/lib/server/drive-file-content.ts"'),'Only observed local source permission repair');
}
if(suffix==='-v3'){
  const prior=JSON.parse(readPrivate(prefix+'-transport-result-v2.json'));assert.equal(prior.closed,true);assert.equal(prior.metrics.auth,0);assert.equal(prior.metrics.provider,0);
}
if(suffix==='-v4')assert.equal(JSON.parse(readPrivate(prefix+'-transport-result-v3.json')).closed,true);
if(leaf){if(!freshFinal)assert.equal(JSON.parse(readPrivate(prefix+'-transport-result-v4.json')).closed,true);assert.equal(JSON.parse(readPrivate(prefix+'-tls-v2.json')).serverLeafCA,false);}
if(legacyCase){assert.equal(JSON.parse(readPrivate(prefix+'-transport-result-v5.json')).closed,true);assert.equal(JSON.parse(readPrivate(prefix+'-fixture.json')).oldR2OnlyStatus,'FAIL_REPRODUCED_NOT_WAIVED');}
if(signedLegacy&&!freshFinal)assert.equal(JSON.parse(readPrivate(prefix+'-transport-result-v6.json')).closed,true);
const owner=JSON.parse(readPrivate('runtime-ownership.json')),config=JSON.parse(readPrivate(prefix+'-config.json'));
const startup=JSON.parse(readPrivate(prefix+'-startup-pass.json'));assert.equal(startup.status,'REAL_AUTH_REST_HEALTH_STARTUP_INVARIANTS_PASS');
const cert=path.join(DIR,prefix+(leaf?'-tls-ca.crt':'-tls.crt'));const processes=[],servers=[],logs=[];
const metrics={auth:0,rest:0,legacy:0,repertoire:0,provider:0,outside:0,requests:[]};let peak=measureRuntime(owner).allocatedKiB,finished=false;
const sig=(key,data)=>createHmac('sha256',key).update(data).digest();
function signed(req,url){
  const text=req.headers.authorization||'',match=text.match(/^AWS4-HMAC-SHA256 Credential=090LOCALACCESSKEY\/(\d{8}\/auto\/s3\/aws4_request), SignedHeaders=([^,]+), Signature=([a-f0-9]{64})$/u);
  assert(match,'Real signed S3 transport required');const names=match[2].split(';');
  const headers=names.map(n=>n+':'+String(req.headers[n]||'').trim().replace(/\s+/gu,' ')).join('\n')+'\n';
  const canonical=[req.method,url.pathname,'',headers,match[2],req.headers['x-amz-content-sha256']||'UNSIGNED-PAYLOAD'].join('\n');
  const date=req.headers['x-amz-date'];assert(typeof date==='string'&&date.startsWith(match[1].slice(0,8)));
  const string=['AWS4-HMAC-SHA256',date,match[1],createHash('sha256').update(canonical).digest('hex')].join('\n');
  const key=sig(sig(sig(sig('AWS4'+'090-local-loopback-signing-key',match[1].slice(0,8)),'auto'),'s3'),'aws4_request');
  assert(timingSafeEqual(sig(key,string),Buffer.from(match[3],'hex')),'S3 signature mismatch');
}
function fork(program,args,env,name){const fd=fs.openSync(path.join(DIR,prefix+'-'+name+suffix+'.log'),'wx',0o600);logs.push(fd);
  const child=spawn(program,args,{cwd:ROOT,env,stdio:['ignore',fd,fd]});processes.push(child);return child;}
async function listen(server,port){servers.push(server);await new Promise((resolve,reject)=>server.once('error',reject).listen(port,'127.0.0.1',resolve));}
async function close(){if(finished)return;finished=true;clearInterval(monitor);clearTimeout(deadline);
  for(const server of servers){server.closeAllConnections();await new Promise(r=>server.close(r));}
  for(const child of processes)if(child.exitCode===null)child.kill('SIGTERM');
  for(const fd of logs)fs.closeSync(fd);
  fs.writeFileSync(path.join(DIR,prefix+'-transport-result'+suffix+'.json'),JSON.stringify({recordedAt:new Date().toISOString(),attempt:ATTEMPT,metrics,peakAllocatedKiB:peak,
    onlyProviderBytesSynthetic:true,authRestAuthorityMocked:false,globalTrustChanged:false,closed:true},null,2)+'\n',{flag:'wx',mode:0o600});
  console.log('LOCAL_TRANSPORT_CLOSED');process.exitCode=0;
}
const monitor=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{void close();}},2000);
const deadline=setTimeout(()=>void close(),20*60*1000);
process.on('SIGTERM',()=>void close());process.on('SIGINT',()=>void close());
try{
  const sshConfig='/Volumes/g090p3/lima/g090p3/ssh.config';assert(fs.existsSync(sshConfig));
  for(const port of [19999,19300,18092,18443,18441,18442]){
    const result=(()=>{try{return execFileSync('/usr/sbin/lsof',['-nP','-iTCP:'+port,'-sTCP:LISTEN'],{encoding:'utf8'});}catch{return '';}})();assert.equal(result,'','Preexisting listener refused');}
  for(const e of Object.values(startup.internalEndpoints))assert(/^172\.18\.0\.\d+$/u.test(e.ip)&&[9999,3000].includes(e.port));
  fork('/usr/bin/ssh',['-F',sshConfig,'-N','-o','ControlMaster=no','-o','ControlPath=none','-o','ExitOnForwardFailure=yes','-L',`127.0.0.1:19999:${startup.internalEndpoints.auth.ip}:9999`,
    '-L',`127.0.0.1:19300:${startup.internalEndpoints.rest.ip}:3000`,'lima-g090p3'],{PATH:process.env.PATH,HOME:process.env.HOME},'ssh-tunnel');
  const provider=httpServer((req,res)=>{try{
    const url=new URL(req.url,'http://127.0.0.1:18092');assert.equal(url.search,'');assert(['GET','HEAD'].includes(req.method));
    const fixture=JSON.parse(readPrivate(prefix+'-fixture.json'));
    const key=decodeURIComponent(url.pathname);let body,mime;if(signedLegacy)signed(req,url);
    if(['/legacy/090-managed-score','/legacy/090-managed-legacy-score'].includes(key)){body=pdf();mime='application/pdf';}
    else if(['/legacy/090-managed-audio','/legacy/090-managed-legacy-audio'].includes(key)){body=wave();mime='audio/wav';}
    else{if(!signedLegacy)signed(req,url);const item=fixture.files.find(f=>key==='/genova-private/'+f.key);assert(item,'Non-fixture provider object');body=item.mime==='application/pdf'?pdf():wave();mime=item.mime;}
    metrics.provider++;const m=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/u);
    const start=m?Number(m[1]):0,end=m?(m[2]?Math.min(Number(m[2]),body.length-1):body.length-1):body.length-1;
    if(start>end||start>=body.length){res.writeHead(416,{'Content-Range':'bytes */'+body.length});res.end();return;}
    const bytes=body.subarray(start,end+1);res.writeHead(m?206:200,{'Content-Type':mime,'Content-Length':String(bytes.length),'Accept-Ranges':'bytes',
      ...(m?{'Content-Range':`bytes ${start}-${end}/${body.length}`}:{})});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(500);res.end('Synthetic provider refused');}});await listen(provider,18092);
  const ingress=httpsServer({key:readPrivate(prefix+(leaf?'-tls-leaf.key':'-tls.key')),
    cert:leaf?Buffer.concat([readPrivate(prefix+'-tls-leaf.crt'),readPrivate(prefix+'-tls-ca.crt')]):readPrivate(prefix+'-tls.crt')},(req,res)=>{
    const url=new URL(req.url,config.api);if(url.pathname==='/_test/metrics'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(metrics));return;}
    const allowedOrigin=req.headers.origin==='http://127.0.0.1:18197';
    if(allowedOrigin){res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Access-Control-Allow-Headers','authorization,apikey,content-type,x-client-info,x-supabase-api-version,accept-profile,content-profile,prefer,range');
      res.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Access-Control-Expose-Headers','Content-Range,Content-Length,Content-Type');}
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
    let port,requestPath,kind;
    if(url.pathname.startsWith('/auth/v1/')){port=19999;requestPath=url.pathname.slice('/auth/v1'.length)+url.search;kind='auth';}
    else if(url.pathname.startsWith('/rest/v1/')){port=19300;requestPath=url.pathname.slice('/rest/v1'.length)+url.search;kind='rest';}
    else if(url.pathname==='/functions/v1/legacy-file'){port=18441;requestPath='/'+url.search;kind='legacy';}
    else if(url.pathname==='/functions/v1/repertoire-file'){port=18442;requestPath='/'+url.search;kind='repertoire';}
    else{metrics.outside++;res.writeHead(404);res.end();return;}
    metrics[kind]++;const entry={method:req.method,path:url.pathname,status:null};metrics.requests.push(entry);
    const upstream=httpRequest({hostname:'127.0.0.1',port,path:requestPath,method:req.method,headers:{...req.headers,host:'127.0.0.1:'+port}},r=>{
      entry.status=r.statusCode;for(const[k,v]of Object.entries(r.headers))if(v!==undefined&&!k.startsWith('access-control-'))res.setHeader(k,v);
      res.writeHead(r.statusCode);r.pipe(res);});upstream.on('error',()=>{entry.status=502;if(!res.headersSent)res.writeHead(502);res.end();});req.pipe(upstream);
  });await listen(ingress,18443);
  const env={PATH:process.env.PATH,HOME:process.env.HOME,SUPABASE_URL:config.api,SUPABASE_ANON_KEY:config.anon,SUPABASE_SERVICE_ROLE_KEY:config.service,
    GENOVA_TEST_LOOPBACK_ONLY:'1',R2_TEST_ENDPOINT:'http://127.0.0.1:18092',R2_ALLOW_INSECURE_LOOPBACK:'true',R2_ACCOUNT_ID:'00000000000000000000000000000000',
    R2_BUCKET:'genova-private',R2_ACCESS_KEY_ID:'090LOCALACCESSKEY',R2_SECRET_ACCESS_KEY:'090-local-loopback-signing-key',REPERTOIRE_STORAGE_MODE:'mixed'};
  for(const [name,port]of [['legacy-file',18441],['repertoire-file',18442]])fork('/opt/homebrew/bin/deno',['run','--cached-only','--no-check','--cert',cert,
    '--allow-env','--allow-read='+ROOT+'/supabase/functions,'+ROOT+'/lib/server,'+ROOT+'/spike/090-managed-edge-bootstrap.ts',
    '--allow-net=127.0.0.1:18443,127.0.0.1:18092,127.0.0.1:'+port,'spike/090-managed-edge-bootstrap.ts'],
    {...env,GENOVA_090_EDGE_PUBLIC_ENDPOINT:config.api+'/functions/v1/'+name,GENOVA_090_EDGE_PORT:String(port)},name);
  console.log('LOCAL_TLS_TRANSPORT_STARTED; real service health and synthetic fixture next.');
  const input=createInterface({input:process.stdin});for await(const line of input){assert.equal(line,'close','Only close command accepted');input.close();await close();break;}
}catch{console.error('Local transport failed; details private');await close();process.exitCode=1;}
