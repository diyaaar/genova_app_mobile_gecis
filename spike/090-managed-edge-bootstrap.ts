// Transport normalization only. Actual production index handles Auth/RPC/RLS/tickets.
import {AwsClient} from 'npm:aws4fetch@1.0.20';
const endpoint=Deno.env.get('GENOVA_090_EDGE_PUBLIC_ENDPOINT');
if(!endpoint||!/^https:\/\/127\.0\.0\.1:18443\/functions\/v1\/(legacy-file|repertoire-file)$/u.test(endpoint))throw Error('Fixed local Edge ingress required');
const originalFetch=globalThis.fetch.bind(globalThis);
globalThis.fetch=(input,init)=>{
  const value=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  const url=new URL(value);
  if(url.origin==='https://drive.google.com'&&url.pathname==='/uc'){
    // No real Drive object is fetched. Provider rejects any non-synthetic alias.
    const alias=url.searchParams.get('id')||'';
    if(!/^090-managed-(legacy-)?(score|audio)$/u.test(alias))throw Error('Non-fixture Drive alias refused');
    // Sign only the synthetic transport hop, not an Auth/tenant decision.
    const signer=new AwsClient({service:'s3',region:'auto',accessKeyId:Deno.env.get('R2_ACCESS_KEY_ID')||'',secretAccessKey:Deno.env.get('R2_SECRET_ACCESS_KEY')||''});
    return signer.fetch('http://127.0.0.1:18092/legacy/'+alias,init);
  }
  if(!['https://127.0.0.1:18443','http://127.0.0.1:18092'].includes(url.origin))throw Error('Outside Edge egress refused');
  return originalFetch(input,init);
};
const originalServe=Deno.serve.bind(Deno);
// A hosted gateway supplies the external URL. This local process receives HTTP
// internally, so normalize it to the fixed TLS ingress before the real handler.
const port=Number(Deno.env.get('GENOVA_090_EDGE_PORT'));
if(![18441,18442].includes(port))throw Error('Fixed local Edge port required');
Deno.serve=((options: Deno.ServeTcpOptions,handler: Deno.ServeHandler)=>originalServe({...options,hostname:'127.0.0.1',port},(request,info)=>{
  const canonical=new URL(endpoint);canonical.search=new URL(request.url).search;
  return handler(new Request(canonical,request),info);
})) as typeof Deno.serve;
await import(endpoint.endsWith('/legacy-file')?'../supabase/functions/legacy-file/index.ts':'../supabase/functions/repertoire-file/index.ts');
