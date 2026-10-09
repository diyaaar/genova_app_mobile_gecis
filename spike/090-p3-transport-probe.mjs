// Fixed public endpoints only. Sends eight-byte PostgreSQL SSLRequest, NOT a
// startup/authentication packet, password, query, private data or export request.
import fs from 'node:fs';
import net from 'node:net';
import dns from 'node:dns/promises';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const OUTPUT='docs/reports/090/2026-10-09-p3-transport-probe.json';
export const POOLER='aws-1-ap-northeast-1.pooler.supabase.com';
export const PRIMARY='db.hievmwwctjjlhmssoxsu.supabase.co';
export function sslRequest(){const b=Buffer.alloc(8);b.writeInt32BE(8,0);b.writeInt32BE(80877103,4);return b;}
export function classify(error,connected,reply){
  if(reply==='S')return 'PRE_AUTH_PG_SSL_AVAILABLE';
  if(reply==='N')return 'PRE_AUTH_PG_SSL_REFUSED';
  if(reply)return 'UNEXPECTED_PRE_AUTH_REPLY';
  if(error==='TIMEOUT')return connected?'PG_NEGOTIATION_TIMEOUT':'TCP_CONNECT_TIMEOUT';
  return connected?'CONNECTED_NO_PG_REPLY':'TCP_CONNECT_ERROR';
}
const safeCommand=(name,args)=>{try{return execFileSync(name,args,{encoding:'utf8',timeout:5000,stdio:['ignore','pipe','pipe']});}catch{return '';}};
export function summarizeLocal(proxy,route,vpn,env){
  const enabled=k=>new RegExp('\\b'+k+'\\s*:\\s*1').test(proxy);
  return {systemProxy:{http:enabled('HTTPEnable'),https:enabled('HTTPSEnable'),socks:enabled('SOCKSEnable'),pac:enabled('ProxyAutoConfigEnable'),autoDiscovery:enabled('ProxyAutoDiscoveryEnable')},
    proxyEnvKeys:['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy','NO_PROXY','no_proxy'].filter(k=>!!env[k]),
    defaultInterface:route.match(/interface:\s*(\w+)/)?.[1]||null,vpnConnected:(vpn.match(/\(Connected\)/g)||[]).length,
    limits:'Configuration flags only; not an audit of every network extension/filter/router. Proxy values, device IP/MAC, gateways and VPN labels withheld.'};
}
export async function pgProbe(address,port){
  if(![5432,6543].includes(port)||![4,6].includes(address.family)||!net.isIP(address.address))throw Error('Public probe scope refused');
  return new Promise(resolve=>{
    const began=Date.now();let connected=false,done=false;const socket=net.createConnection({host:address.address,family:address.family,port});
    const finish=(error,reply)=>{if(done)return;done=true;clearTimeout(timer);socket.destroy();resolve({port,family:address.family,connected,classification:classify(error,connected,reply),error:error||null,elapsedMs:Date.now()-began,credentialBytesSent:0,queryBytesSent:0});};
    const timer=setTimeout(()=>finish('TIMEOUT'),6000);
    socket.once('connect',()=>{connected=true;socket.write(sslRequest());});
    socket.once('data',b=>finish(null,b.length===1?b.toString('ascii'):'OTHER'));
    socket.once('error',e=>finish(e.code||'NETWORK_ERROR'));
    socket.once('end',()=>finish('EOF'));
  });
}
async function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--probe-no-credentials'||fs.existsSync(OUTPUT))throw Error('Probe root/flag/output refused');
  const result={recordedAt:new Date().toISOString(),project:'hievmwwctjjlhmssoxsu',scope:'Public pre-auth transport only; no SQL/credential/export/runtime or settings change',
    local:summarizeLocal(safeCommand('/usr/sbin/scutil',['--proxy']),safeCommand('/sbin/route',['-n','get','default']),safeCommand('/usr/sbin/scutil',['--nc','list']),process.env),endpoints:[]};
  for(const host of [POOLER,PRIMARY]){
    let addresses;try{addresses=await dns.lookup(host,{all:true});}catch(e){result.endpoints.push({host,dnsError:e.code||'DNS_ERROR'});continue;}
    if(addresses.length>4)throw Error('DNS fanout exceeds bounded probe');
    const observations=await Promise.all(addresses.map(async address=>{
      const route=safeCommand('/sbin/route',['-n','get',address.address]);
      return {family:address.family,routeExists:/interface:/.test(route),interface:route.match(/interface:\s*(\w+)/)?.[1]||null,
        reject:/flags:.*REJECT/.test(route),blackhole:/flags:.*BLACKHOLE/.test(route),
        primary:await pgProbe(address,5432),diagnosticTransactionPort:host===POOLER?await pgProbe(address,6543):undefined};
    }));
    result.endpoints.push({host,dnsAddresses:addresses.length,observations});
  }
  try{const response=await fetch('https://mcp.supabase.com/mcp',{redirect:'error',signal:AbortSignal.timeout(6000)});result.publicHttpsControl={status:response.status,reachable:true,credentialsSent:false};await response.body?.cancel();}
  catch{result.publicHttpsControl={reachable:false,credentialsSent:false};}
  result.helperSha256=crypto.createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex');
  result.limits='A connected public transaction port is NOT an approved held-snapshot export replacement. Transport failure does not diagnose credentials, RLS, exact filter location, project health or recovery.';
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('Bounded transport observation failed; details withheld, no automatic retry.');process.exitCode=1;});
