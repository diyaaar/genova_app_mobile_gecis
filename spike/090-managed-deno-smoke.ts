// Diagnostic real SDK/transport only; credentials and user tokens never output.
import {createClient} from 'npm:@supabase/supabase-js@2.112.4';
const dir='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const prefix='managed-20261010-managed-web';
const config=JSON.parse(await Deno.readTextFile(dir+'/'+prefix+'-config.json'));
const fixture=JSON.parse(await Deno.readTextFile(dir+'/'+prefix+'-fixture.json'));
if(config.api!=='https://127.0.0.1:18443')throw Error('Local only');
const safe=(error:unknown)=>{const e=error as {name?:string;message?:string;status?:number;code?:string;cause?:{code?:string}};return {name:e?.name,status:e?.status,code:e?.code,
  fetchFailure:!!e?.message?.includes('fetch'),certificate:!!e?.message?.match(/certificat|UnknownIssuer|issuer/iu),permission:!!e?.message?.includes('Requires'),cause:e?.cause?.code};};
const sdk=createClient(config.api,config.anon,{auth:{persistSession:false,autoRefreshToken:false}}),user=fixture.users.find((u:{role:string})=>u.role==='shared');
try{
  console.log(JSON.stringify({stage:'health',status:(await fetch(config.api+'/auth/v1/health')).status}));
  const signed=await sdk.auth.signInWithPassword({email:user.email,password:user.password});
  console.log(JSON.stringify({stage:'sign-in',error:signed.error?safe(signed.error):null,actualSession:!!signed.data.session}));
  if(!signed.data.session)Deno.exit(1);
  const found=await sdk.auth.getUser(signed.data.session.access_token);
  console.log(JSON.stringify({stage:'getUser',error:found.error?safe(found.error):null,correctActor:found.data.user?.id===user.id}));
  const rpc=await sdk.rpc('set_active_choir',{p_choir_id:fixture.ids.choirA});console.log(JSON.stringify({stage:'choir',error:rpc.error?safe(rpc.error):null}));
  const edge=await fetch(config.api+'/functions/v1/repertoire-file',{method:'POST',headers:{Authorization:'Bearer '+signed.data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({fileId:fixture.ids.score})});
  console.log(JSON.stringify({stage:'actual-Edge',status:edge.status}));await sdk.auth.signOut();
}catch(error){const message=error instanceof Error?error.message:'';
  // The first health request contains no token/body; report only its transport
  // class, never any subsequent credential-bearing request URL or body.
  console.log(JSON.stringify({stage:'caught',error:safe(error),transport:message.replace(/Bearer\s+\S+/giu,'Bearer [redacted]').replace(/([?&](?:ticket|token)=)[^&\s]+/gu,'$1[redacted]').slice(0,400)}));Deno.exit(1);}
