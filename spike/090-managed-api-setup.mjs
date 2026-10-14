// Attach real local GoTrue/PostgREST only AFTER full recovery + exact eleven SQL.
// Credentials never enter argv/stdout/repo. No role/RLS/grant relaxation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,createHmac} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
import {DIR,LIMA,CONTAINER,runtimeEnv,verifyClone,query,sql,DB,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {catalogQueries,dataDigestQuery} from './090-p3-recovery-queries.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
const AUTH='supabase/gotrue@sha256:93bfec0a41cfe3ed81d03c9c1c8807fd230b8ecea260cf999b8a7204ccc7d5cf';
const REST='postgrest/postgrest@sha256:77c56c839e49d5a037e93fd49de7822a65bcdeafc4b9e37338ead504e36ba307';
const prefix=`managed-${ATTEMPT}`,network='g090p3-internal';
assert(['20261010-managed-web','20261010-managed-final','20261010-managed-families','20261013-managed-families','20261014-fresh-recovery'].includes(ATTEMPT));assert.equal(process.argv.length,3);
const action=process.argv[2];assert(['--prepare-approved','--resume-network-approved','--verify-startup','--verify-startup-internal','--verify-initial-internal'].includes(action));
const owner=JSON.parse(readPrivate('runtime-ownership.json'));let peak=0;
const write=(name,value)=>fs.writeFileSync(path.join(DIR,prefix+'-'+name),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
function command(args,input){peak=Math.max(peak,measureRuntime(owner).allocatedKiB);
  const result=spawnSync(LIMA,['shell','g090p3',...args],{env:runtimeEnv,input,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  if(result.status!==0){write(action.slice(2)+'-failure.log',(result.stderr||'')+(result.stdout||''));throw Error('Managed setup failed; details private');}
  return result.stdout.trim();
}
const docker=(...args)=>command(['sudo','docker',...args]);
const fingerprint=()=>({catalog:Object.fromEntries(Object.entries(catalogQueries).map(([k,q])=>[k,normalize(query(q))])),data:query(dataDigestQuery)});
function attachAndStart(){
  const net=JSON.parse(docker('network','inspect',network))[0];assert.equal(net.Internal,true);assert.equal(net.Labels['genova.owner'],'090-P3-only');
  assert.equal(Object.keys(net.Containers||{}).length,0,'No preexisting network endpoints');
  const database=JSON.parse(docker('inspect',CONTAINER))[0];assert.deepEqual(Object.keys(database.NetworkSettings.Networks),['none']);
  // Docker rejects adding a bridge while the explicit private none endpoint
  // exists. Disconnect it first, then attach only the internal bridge.
  docker('network','disconnect','none',CONTAINER);
  docker('network','connect',network,CONTAINER);
  for(const [name,image,guestPort,hostPort,memory] of [['auth',AUTH,9999,19999,'192m'],['rest',REST,3000,19300,'128m']]){
    docker('run','-d','--name','genova090p3-'+name,'--network',network,'--memory',memory,'--memory-swap',memory,'--pids-limit','64',
      '--label','genova.owner=090-P3-only','-p',`127.0.0.1:${hostPort}:${guestPort}`,'--env-file','/tmp/'+prefix+'-'+name+'.env',image);
  }
}
function token(role,secret){const now=Math.floor(Date.now()/1000);
  const a=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),b=Buffer.from(JSON.stringify({iss:'090-local-managed',role,iat:now,exp:now+7200})).toString('base64url');
  return a+'.'+b+'.'+createHmac('sha256',secret).update(a+'.'+b).digest('base64url');
}
try{
  if(action==='--prepare-approved'){
    verifyClone();assert(!fs.existsSync(path.join(DIR,prefix+'-config.json')),'No config overwrite');
    const deltas=JSON.parse(readPrivate(`compatibility-${ATTEMPT}-deltas.json`));assert.equal(deltas.observations.length,11);assert.equal(deltas.status,'ACTUAL_ELEVEN_CLONE_DELTAS_PASS');
    const inspected=fs.readFileSync(path.join(DIR,prefix+'-inspect-auth-migrations.log'),'utf8');
    const versions=[...new Set([...inspected.matchAll(/\/(\d+)[^/\n]*\.sql/gu)].map(m=>m[1]))].sort();
    assert(versions.length>50,'Missing image migration inventory');
    const applied=query('select version from auth.schema_migrations order by version').map(r=>r.version);
    assert(versions.every(v=>applied.includes(v)),'Image would apply unreviewed Auth DDL');
    const roles=query("select rolname,rolcanlogin from pg_roles where rolname in ('supabase_auth_admin','authenticator') order by rolname");
    assert.equal(roles.length,2);assert(roles.every(r=>r.rolcanlogin),'Cannot weaken role flags for startup');
    const before=fingerprint();write('before-startup.json',before);
    const secret=randomBytes(48).toString('hex'),authPassword=randomBytes(24).toString('hex'),restPassword=randomBytes(24).toString('hex');
    const config={attempt:ATTEMPT,api:'https://127.0.0.1:18443',auth:'http://127.0.0.1:19999',rest:'http://127.0.0.1:19300',secret,
      anon:token('anon',secret),service:token('service_role',secret),authPassword,restPassword,authImage:AUTH,restImage:REST};write('config.json',config);
    sql(`alter role supabase_auth_admin password '${authPassword}';alter role authenticator password '${restPassword}';`);
    const auth={GOTRUE_API_HOST:'0.0.0.0',GOTRUE_API_PORT:'9999',API_EXTERNAL_URL:config.api,GOTRUE_DB_DRIVER:'postgres',
      GOTRUE_DB_DATABASE_URL:`postgres://supabase_auth_admin:${authPassword}@${CONTAINER}:5432/${DB}`,GOTRUE_SITE_URL:'http://127.0.0.1:18197',
      GOTRUE_DISABLE_SIGNUP:'true',GOTRUE_JWT_ADMIN_ROLES:'service_role',GOTRUE_JWT_AUD:'authenticated',GOTRUE_JWT_DEFAULT_GROUP_NAME:'authenticated',
      GOTRUE_JWT_EXP:'3600',GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_ISSUER:config.api+'/auth/v1',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',
      GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED:'false',GOTRUE_MAILER_AUTOCONFIRM:'true',GOTRUE_DB_MAX_POOL_SIZE:'4',GOTRUE_DB_ADVISOR_ENABLED:'false',
      GOTRUE_EXTERNAL_EMAIL_MAGIC_LINK_ENABLED:'false',GOTRUE_RATE_LIMIT_EMAIL_SENT:'0',GOTRUE_SMTP_HOST:'127.0.0.1',GOTRUE_SMTP_PORT:'1',
      GOTRUE_SMTP_ADMIN_EMAIL:'nobody@example.invalid',GOTRUE_LOG_LEVEL:'error'};
    const rest={PGRST_DB_URI:`postgres://authenticator:${restPassword}@${CONTAINER}:5432/${DB}`,PGRST_DB_SCHEMAS:'public',PGRST_DB_ANON_ROLE:'anon',
      PGRST_JWT_SECRET:secret,PGRST_DB_USE_LEGACY_GUCS:'false',PGRST_DB_POOL:'4',PGRST_DB_EXTRA_SEARCH_PATH:'public,extensions',PGRST_DB_MAX_ROWS:'1000'};
    for(const [name,env] of [['auth',auth],['rest',rest]]){const file=path.join(DIR,prefix+'-'+name+'.env');write(name+'.env',Object.entries(env).map(([k,v])=>k+'='+v).join('\n')+'\n');
      const result=spawnSync(LIMA,['copy',file,'g090p3:/tmp/'+prefix+'-'+name+'.env'],{env:runtimeEnv,encoding:'utf8',timeout:10000});assert.equal(result.status,0,'Private env copy failed');}
    assert.equal(docker('network','ls','--format=json').split('\n').filter(Boolean).map(l=>JSON.parse(l)).filter(n=>n.Name===network).length,0,'Owned network already exists');
    docker('network','create','--internal','--label','genova.owner=090-P3-only',network);
    attachAndStart();
    write('prepared.json',{recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:'REAL_API_CONTAINERS_CREATED_STARTUP_VERIFICATION_PENDING',
      authVersion:'2.196.0',restVersion:'14.13',imageMigrationVersions:versions.length,missingImageMigrations:0,localConnectionPasswordsOnly:true,internalNetwork:true,peakAllocatedKiB:peak});
    console.log('Real managed API containers created; startup invariant/health still NOT RUN.');
  }else if(action==='--resume-network-approved'){
    const observed=readPrivate(prefix+'-prepare-approved-failure.log').toString();
    assert.equal(observed.trim(),'Error response from daemon: container cannot be connected to multiple networks with one of the networks in private (none) mode');
    assert.deepEqual(fingerprint(),JSON.parse(readPrivate(prefix+'-before-startup.json')),'No mutation before causal network resume');
    assert.equal(docker('ps','-a','--filter','name=genova090p3-auth','--filter','name=genova090p3-rest','--format','{{.Names}}'),'','API containers must still be absent');
    attachAndStart();
    write('resumed-network.json',{recordedAt:new Date().toISOString(),attempt:ATTEMPT,cause:'Docker none endpoint excludes bridge attachment',
      databaseReset:false,retainedCatalogAndRowsUnchangedBeforeResume:true,internalNetworkOnly:true,peakAllocatedKiB:peak,startupVerification:'NOT RUN'});
    console.log('Causal local network transition completed; actual API startup proof still pending.');
  }else{
    if(action==='--verify-startup-internal')assert.equal(readPrivate(prefix+'-verify-startup-failure.log').toString().trim(),"wget: can't connect to remote host (127.0.0.1): Connection refused",'Only observed internal bridge publication failure');
    const before=JSON.parse(readPrivate(prefix+'-before-startup.json')),after=fingerprint();
    assert.deepEqual(after,before,'API startup changed schema/ACL/RLS/roles/retained rows');
    const net=JSON.parse(docker('network','inspect',network))[0];assert.equal(net.Internal,true);assert.equal(net.Labels['genova.owner'],'090-P3-only');
    const internalEndpoints={};
    for(const [name,image,port] of [['auth',AUTH,19999],['rest',REST,19300]]){
      const state=JSON.parse(docker('inspect','genova090p3-'+name))[0];assert(state.State.Running);assert.equal(state.Config.Image,image);
      assert.equal(state.Mounts.length,0);assert.deepEqual(Object.values(state.HostConfig.PortBindings).flat().map(p=>p.HostIp),['127.0.0.1']);
      const ip=state.NetworkSettings.Networks[network].IPAddress;assert(/^172\.18\.0\.\d+$/u.test(ip),'Fixed owned internal subnet required');
      assert.deepEqual(Object.keys(state.NetworkSettings.Networks),[network]);
      internalEndpoints[name]={ip,port:name==='auth'?9999:3000};
      const internal=action==='--verify-startup-internal'||action==='--verify-initial-internal';
      command(['wget','-q','-O','-',`http://${internal?ip:'127.0.0.1'}:${internal?internalEndpoints[name].port:port}/`+(name==='auth'?'health':'')]);
    }
    write('startup-pass.json',{recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:'REAL_AUTH_REST_HEALTH_STARTUP_INVARIANTS_PASS',catalogGroups:17,dataTables:101,
      imageMigrationDDL:0,retainedRowChanges:0,noGrantRoleRlsTriggerWeakening:true,portsLoopbackOnly:true,egressInternalNetworkOnly:true,internalEndpoints,peakAllocatedKiB:peak});
    console.log('PASS actual GoTrue/PostgREST health; all catalog/data invariants unchanged.');
  }
}catch(error){console.error(error instanceof assert.AssertionError?error.message.split('\n')[0]:'Managed API setup failed; details private');process.exitCode=1;}
