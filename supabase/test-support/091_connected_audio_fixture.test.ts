import { describe,it,expect,vi } from 'vitest';
import { writeFile } from 'node:fs/promises';
import { AwsClient } from 'aws4fetch';
import type { IncomingMessage,ServerResponse } from 'node:http';
import { assertLocalSignature,createConnectedAudioFixture,toneWav,connectedAudioEvidenceTarget } from './091_connected_audio_fixture';
const origin='http://127.0.0.1:18092';
vi.mock('node:fs/promises',async importOriginal=>{
  const actual=await importOriginal<typeof import('node:fs/promises')>();
  const writes={mkdir:vi.fn().mockResolvedValue(undefined),writeFile:vi.fn().mockResolvedValue(undefined)};
  return {...actual,...writes,default:{...actual,...writes}};
});
function request(method='POST',host='127.0.0.1:18092') {
  return {method,headers:{host}} as IncomingMessage;
}
function response() {
  const result={status:0,body:''};
  const out={setHeader(){},writeHead(status:number){result.status=status;},end(body?:string){result.body=body??'';}} as unknown as ServerResponse;
  return {out,result};
}
describe('connected audio fixture keeps credentials and evidence bounded',()=>{
  it('actual iOS evidence handler preserves full refusal matrix and writes only its own wx record',async()=>{
    const bytes=toneWav();let hits=0;
    const fixture=createConnectedAudioFixture('fixture',bytes,()=>hits,'ios');
    fixture.setFixture({password:'synthetic'});
    await fixture.handle(request(),response().out,new URL(`${origin}/090/audio-fixture`));
    const statuses=[200,200,200,403,401,401,200,200,403,403,403];
    const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async(_url,init)=>{
      const status=statuses.shift()!;
      if(init?.method==='POST')return new Response(JSON.stringify(status===200?{url:'http://127.0.0.1:8000/?fileId=fixture&ticket=synthetic'}:{}),{status});
      if(status<300)hits++;
      return new Response(init?.method==='HEAD'?null:status<300?new Uint8Array(bytes):null,{status,headers:{'content-type':'audio/wav'}});
    });
    try{
      for(let i=0;i<4;i++){
        const req=Object.assign(request(),{async *[Symbol.asyncIterator](){yield Buffer.from('{"fileId":"fixture"}');}});
        await fixture.handle(req,response().out,new URL(`${origin}/090/audio-ticket`));
      }
      for(const method of ['GET','HEAD','GET','GET','HEAD','GET','HEAD'])
        await fixture.handle(request(method),response().out,new URL(`${origin}/090/audio-read?fileId=fixture&ticket=synthetic`));
      await fixture.handle(request(),response().out,new URL(`${origin}/090/audio-evidence`));
      expect(fixture.finish()).toBeUndefined();
      const [target,body,options]=vi.mocked(writeFile).mock.calls.at(-1)!;
      expect(target).toBe('docs/reports/090/2026-10-01-connected-ios-audio-http.json');
      expect(options).toEqual({flag:'wx'});
      const evidence=JSON.parse(String(body));expect(evidence.platform).toBe('ios');
      expect(evidence.tickets).toEqual([200,200,200,403]);expect(evidence.boundary).toContain('not hosted/Android/physical');
      expect(evidence.reads.filter((r:{status:number})=>r.status>=400).every((r:{providerDelta:number})=>r.providerDelta===0)).toBe(true);
    }finally{fetchMock.mockRestore();}
  });
  it('keeps immutable Android evidence separate from an explicitly selected iOS run',()=>{
    expect(connectedAudioEvidenceTarget()).toEqual({platform:'android',path:'docs/reports/090/2026-10-01-connected-audio-http.json'});
    expect(connectedAudioEvidenceTarget('ios')).toEqual({platform:'ios',path:'docs/reports/090/2026-10-01-connected-ios-audio-http.json'});
    expect(()=>connectedAudioEvidenceTarget('web')).toThrow();
    expect(()=>connectedAudioEvidenceTarget('../other')).toThrow();
  });
  it('creates a decodable ten-second PCM fixture',()=>{
    const bytes=toneWav();expect(bytes.length).toBe(160044);expect(bytes.toString('ascii',0,4)).toBe('RIFF');
    expect(bytes.readUInt32LE(4)+8).toBe(bytes.length);expect(bytes.readUInt32LE(24)).toBe(8000);
    expect(bytes.readUInt32LE(40)/bytes.readUInt32LE(28)).toBe(10);expect(toneWav()).toEqual(bytes);
  });
  it.each(['GET','HEAD'])('checks complete real AWS4 %s and rejects tampering',async method=>{
    const url=new URL(`${origin}/genova-private/choirs/fixture/tone.wav`);
    const signed=await new AwsClient({accessKeyId:'local',secretAccessKey:'synthetic',region:'auto',service:'s3'}).sign(url.href,{method});
    const req={method,headers:Object.fromEntries(signed.headers)} as IncomingMessage;
    // Node supplies Host even when fetch Headers does not expose it.
    req.headers.host=url.host;
    expect(()=>assertLocalSignature(req,url,'local','synthetic')).not.toThrow();
    expect(()=>assertLocalSignature(req,new URL(url.href.replace('tone.wav','other.wav')),'local','synthetic')).toThrow();
    expect(()=>assertLocalSignature({...req,method:method==='GET'?'HEAD':'GET'} as IncomingMessage,url,'local','synthetic')).toThrow();
    expect(()=>assertLocalSignature(req,url,'local','wrong-secret')).toThrow();
  });
  it('consumes in-memory credentials exactly once and cannot accept absent runtime evidence',async()=>{
    const fixture=createConnectedAudioFixture('fixture',toneWav(),()=>0);fixture.setFixture({password:'synthetic'});
    const first=response();await fixture.handle(request(),first.out,new URL(`${origin}/090/audio-fixture`));
    expect(first.result.status).toBe(200);expect(first.result.body).toBe('{"password":"synthetic"}');
    const second=response();await fixture.handle(request(),second.out,new URL(`${origin}/090/audio-fixture`));expect(second.result.status).toBe(410);
    expect(()=>fixture.setFixture({password:'another'})).toThrow();
    await expect(fixture.handle(request(),response().out,new URL(`${origin}/090/audio-evidence`))).rejects.toThrow();
    expect(()=>fixture.finish()).toThrow();fixture.clear();
  });
  it.each([
    ['GET','127.0.0.1:18092','/090/audio-fixture'],['POST','example.com','/090/audio-fixture'],
    ['POST','127.0.0.1:18092','/090/audio-fixture?extra=1'],['HEAD','127.0.0.1:18092','/090/audio-read?fileId=other&ticket=synthetic'],
  ])('rejects foreign or malformed transport %#',async(method,host,path)=>{
    const fixture=createConnectedAudioFixture('fixture',toneWav(),()=>0);
    await expect(fixture.handle(request(method,host),response().out,new URL(`${origin}${path}`))).rejects.toThrow();
  });
});
