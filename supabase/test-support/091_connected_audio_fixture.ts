import assert from 'node:assert/strict';
import { createHash,createHmac } from 'node:crypto';
import type { IncomingMessage,ServerResponse } from 'node:http';
import { mkdir,writeFile } from 'node:fs/promises';

export function toneWav() {
  const out=Buffer.alloc(160044);out.write('RIFF');out.writeUInt32LE(160036,4);out.write('WAVEfmt ',8);
  out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(8000,24);
  out.writeUInt32LE(16000,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(160000,40);
  for(let i=0;i<80000;i++)out.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*440/8000)*4000),44+i*2);
  return out;
}
const hash=(data:Uint8Array|string)=>createHash('sha256').update(data).digest('hex');
/** Entire AWS4 canonical request checked, not merely an Authorization prefix. */
export function assertLocalSignature(request:IncomingMessage,url:URL,access:string,secret:string) {
  assert.equal(url.search,'');const m=request.headers.authorization?.match(/^AWS4-HMAC-SHA256 Credential=([^,]+), SignedHeaders=([^,]+), Signature=([a-f0-9]{64})$/);assert.ok(m);
  const [key,date,region,service,end]=m[1].split('/');assert.equal(key,access);assert.equal(region,'auto');assert.equal(service,'s3');assert.equal(end,'aws4_request');
  const canonicalHeaders=m[2].split(';').map(name=>{
    const value=request.headers[name];assert.equal(typeof value,'string');return `${name}:${String(value).trim().replace(/\s+/g,' ')}\n`;
  }).join('');
  const canonical=`${request.method}\n${url.pathname}\n\n${canonicalHeaders}\n${m[2]}\n${request.headers['x-amz-content-sha256']??hash('')}`;
  const hmac=(key:Buffer|string,value:string)=>createHmac('sha256',key).update(value).digest();
  const signing=hmac(hmac(hmac(hmac(`AWS4${secret}`,date),region),service),end);
  assert.equal(hmac(signing,`AWS4-HMAC-SHA256\n${request.headers['x-amz-date']}\n${date}/${region}/${service}/${end}\n${hash(canonical)}`).toString('hex'),m[3]);
}
/** Fixed trusted evidence targets; no caller-controlled path and no platform cross-acceptance. */
export function connectedAudioEvidenceTarget(platform:string='android',revision?:string) {
  assert.ok(platform==='android'||platform==='ios','Unsupported connected audio platform');
  if(revision!==undefined){
    assert.equal(revision,'player-id','Unsupported connected audio revision');
    assert.equal(platform,'android','Player-id regression target is Android-only');
    return {platform,path:'docs/reports/090/connected-android-audio-player-id-http.json'};
  }
  return {platform,path:platform==='ios'?'docs/reports/090/2026-10-01-connected-ios-audio-http.json':
    'docs/reports/090/2026-10-01-connected-audio-http.json'};
}
export function createConnectedAudioFixture(fileId:string,bytes:Uint8Array,providerHits:()=>number,platform:string='android',revision?:string) {
  const evidenceTarget=connectedAudioEvidenceTarget(platform,revision);
  let oneUse:string|null=null,consumed=false,accepted=false;
  const reads:{method:string;status:number;providerDelta:number;range:boolean;bytes:number}[]=[];
  const tickets:number[]=[];
  async function handle(request:IncomingMessage,response:ServerResponse,url:URL) {
    assert.equal(request.headers.host,'127.0.0.1:18092');response.setHeader('Cache-Control','no-store');
    if(url.pathname==='/090/audio-fixture') {
      assert.equal(request.method,'POST');assert.equal(url.search,'');
      if(!oneUse){response.writeHead(410);response.end();return;}
      const payload=oneUse;oneUse=null;consumed=true;response.writeHead(200,{'Content-Type':'application/json'});response.end(payload);return;
    }
    if(url.pathname==='/090/audio-evidence') {
      assert.equal(request.method,'POST');assert.equal(url.search,'');assert.equal(consumed,true);
      assert.deepEqual(tickets,[200,200,200,403]);
      assert.ok(reads.some(r=>r.method==='GET'&&r.status===401));
      assert.equal(reads.filter(r=>r.method==='HEAD'&&r.status===401).length,1);
      assert.ok(reads.filter(r=>r.method==='GET'&&r.status<300).length>=2);
      assert.ok(reads.some(r=>r.method==='GET'&&r.status===403));
      assert.ok(reads.filter(r=>r.method==='HEAD'&&r.status===403).length>=2);
      for(const r of reads)assert.equal(r.providerDelta,r.status>=400?0:1);
      const evidence={timestamp:new Date().toISOString(),result:'PASS',platform:evidenceTarget.platform,...(revision?{revision}:{}),tickets,reads,contentLength:bytes.length,sha256:hash(bytes),
        boundary:`Actual local Auth/RLS/PostgREST/Deno and ${platform==='ios'?'iOS':'Android'} Expo audio; declared signed-v1 URL/client-deadline/old-v2 injection and GET/HEAD/POST relay. Signature-verified synthetic loopback S3, not hosted/${platform==='ios'?'Android':'iOS'}/physical audibility/server expiry.`};
      await mkdir('docs/reports/090',{recursive:true});
      await writeFile(evidenceTarget.path,JSON.stringify(evidence,null,2),{flag:'wx'});
      accepted=true;response.writeHead(200);response.end();console.log(`PASS 090 connected ${platform} audio HTTP evidence retained; no secrets`);return;
    }
    const isTicket=url.pathname==='/090/audio-ticket';assert.ok(isTicket||url.pathname==='/090/audio-read');
    let body:Buffer|undefined;
    if(isTicket){assert.equal(request.method,'POST');assert.equal(url.search,'');const chunks:Buffer[]=[];let size=0;
      for await(const chunk of request){size+=Buffer.byteLength(chunk);assert.ok(size<=1024);chunks.push(Buffer.from(chunk));}
      body=Buffer.concat(chunks);assert.deepEqual(JSON.parse(body.toString()),{fileId});
    }else{assert.ok(request.method==='GET'||request.method==='HEAD');assert.equal(url.searchParams.get('fileId'),fileId);
      assert.deepEqual([...url.searchParams.keys()].sort(),['fileId','ticket']);}
    const before=providerHits();const actual=await fetch(`http://127.0.0.1:8000/${url.search}`,{
      method:request.method,redirect:'error',signal:AbortSignal.timeout(10000),
      headers:isTicket?{'Content-Type':'application/json',authorization:request.headers.authorization??''}:
        request.headers.range?{Range:request.headers.range}:{},body:body?.toString()});
    let received=new Uint8Array(await actual.arrayBuffer());
    if(isTicket){
      tickets.push(actual.status);
      if(actual.ok){
        const payload=JSON.parse(Buffer.from(received).toString());const issued=new URL(payload.url,'http://127.0.0.1:8000/');
        assert.equal(issued.origin,'http://127.0.0.1:8000');assert.equal(issued.pathname,'/');
        assert.equal(issued.searchParams.get('fileId'),fileId);
        assert.deepEqual([...issued.searchParams.keys()].sort(),['fileId','ticket']);
        assert.ok(issued.searchParams.get('ticket'));
        // The shared client requires ticket URL origin/path to match its POST endpoint.
        // Only the observation transport changes; the signed query is unchanged.
        payload.url=`http://127.0.0.1:18092/090/audio-ticket${issued.search}`;
        received=new TextEncoder().encode(JSON.stringify(payload));
      }
    }
    else {
      reads.push({method:request.method!,status:actual.status,providerDelta:providerHits()-before,range:Boolean(request.headers.range),bytes:received.length});
      assert.equal(providerHits()-before,actual.status>=400?0:1);
      if(actual.ok&&request.method!=='HEAD'){
        assert.equal(actual.headers.get('content-type'),'audio/wav');
        const range=actual.headers.get('content-range')?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
        if(range)assert.equal(Number(range[3]),bytes.length);
        const expected=range?bytes.subarray(Number(range[1]),Number(range[2])+1):bytes;
        assert.equal(hash(received),hash(expected));
      }
    }
    console.log(`090 connected audio ${request.method} ${actual.status} providerDelta=${providerHits()-before}${isTicket?' ticket':' body'}`);
    const headers=Object.fromEntries(actual.headers);delete headers['content-length'];
    response.writeHead(actual.status,headers);response.end(request.method==='HEAD'?undefined:received);
  }
  return {setFixture(payload:unknown){assert.equal(oneUse,null);assert.equal(consumed,false);oneUse=JSON.stringify(payload);},
    handle,finish(){assert.equal(consumed,true);assert.equal(oneUse,null);assert.equal(accepted,true);},clear(){oneUse=null;} };
}
