// Owner-approved private logical recovery export. Exact linked target, read-only,
// held snapshot, streaming cap, encrypted bytes; no live restore or automatic retry.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { snapshotQuery, canonicalSettings, requireRecoveryMetadata } from './090-p3-recovery-queries.mjs';
import { connect, QUERIES, REF } from './090-p3-hosted-inventory.mjs';
import { MIN_FREE_KIB } from './090-p3-resource-policy.mjs';
const require=createRequire(import.meta.url);
const ROOT='/Users/alidiyarduran/Antigravity/genovakorist';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07';
const URL=`postgresql://postgres.${REF}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
const PG='/opt/homebrew/opt/postgresql@17/bin/';
export const MAX_BYTES=128*1024*1024;
const MAGIC=Buffer.from('G090GCM1');
export function allowedSchema(name){return ['auth','public','realtime','supabase_migrations','extensions','vault'].includes(name)||/^genova_[0-9]{3}$/.test(name);}
export function verifySnapshot(value){
  if(value.database!=='postgres'||value.user!=='postgres'||value.readOnly!=='on'||value.recovery!==false||!/^17\./.test(value.version)||
    !/^[0-9A-F-]+$/.test(value.snapshot)||!Array.isArray(value.schemas)||!value.schemas.every(allowedSchema)||
    !['auth','public','realtime','supabase_migrations'].every(s=>value.schemas.includes(s))||!Array.isArray(value.data)||
    !value.data.every(t=>Number.isSafeInteger(t.rows)&&t.rows>=0&&/^[a-f0-9]{64}$/.test(t.sha256))||!value.catalog?.roles?.length)throw Error('Snapshot scope refused');
  requireRecoveryMetadata(value);
}
export function dumpArgs(snapshot){
  verifySnapshot(snapshot);
  return [URL+'?sslmode=require&connect_timeout=10','--snapshot='+snapshot.snapshot,
    ...snapshot.schemas.map(s=>'--schema='+s),'--exclude-table-data=vault.*','--exclude-table-data=realtime.*','--exclude-table-data=net.*',
    '--lock-wait-timeout=5s','--format=plain'];
}
export class ByteGuard extends Transform{
  constructor(max=MAX_BYTES){super();this.max=max;this.bytes=0;this.tail=Buffer.alloc(0);this.hash=crypto.createHash('sha256');}
  _transform(chunk,_encoding,callback){
    this.bytes+=chunk.length;if(this.bytes>this.max){callback(Error('Private export streaming cap exceeded'));return;}
    this.hash.update(chunk);this.tail=Buffer.concat([this.tail,chunk]).subarray(-2048);callback(null,chunk);
  }
}
export function encryptBuffer(body,key){
  const nonce=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,nonce);
  return Buffer.concat([MAGIC,nonce,cipher.update(body),cipher.final(),cipher.getAuthTag()]);
}
export function decryptBuffer(body,key){
  if(body.length<36||!body.subarray(0,8).equals(MAGIC))throw Error('Private artifact format refused');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,body.subarray(8,20));
  decipher.setAuthTag(body.subarray(-16));return Buffer.concat([decipher.update(body.subarray(20,-16)),decipher.final()]);
}
function safeAncestors(dir){
  for(let current=dir;current!==path.dirname(current);current=path.dirname(current))if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('Private parent symlink refused');
}
function privateWrite(file,body){fs.writeFileSync(file,body,{flag:'wx',mode:0o600});}
export function completedSnapshotLine(text){
  const end=text.lastIndexOf('\n');if(end<0)return undefined;
  const body=text.slice(0,end).trim();if(!body.startsWith('{'))return undefined;
  let depth=0,inString=false,escaped=false;
  for(const character of body){
    if(inString){if(escaped)escaped=false;else if(character==='\\')escaped=true;else if(character==='"')inString=false;}
    else if(character==='"')inString=true;
    else if(character==='{'||character==='[')depth++;
    else if(character==='}'||character===']')depth--;
  }
  if(depth>0||inString)return undefined;
  return JSON.parse(body);
}
export function freeKiB(){return Number(execFileSync('df',['-k','.'],{encoding:'utf8'}).trim().split('\n')[1].trim().split(/\s+/)[3]);}
async function main(){
  const diskFloor=process.argv[2]==='--export-approved-below-10g'?MIN_FREE_KIB:10485760;
  if(process.cwd()!==ROOT||fs.readFileSync('supabase/.temp/project-ref','utf8').trim()!==REF||fs.readFileSync('supabase/.temp/pooler-url','utf8').trim()!==URL)throw Error('Exact linked project/root refused');
  if(freeKiB()-655360<diskFloor)throw Error('Export disk reserve refused');
  if(fs.lstatSync('.env.local').isSymbolicLink()||(fs.statSync('.env.local').mode&0o777)!==0o600)throw Error('Private credential file refused');
  const client=await connect(),identity=await client.call('execute_sql',{query:QUERIES.identity});
  if(identity.length!==1||identity[0].role!=='supabase_read_only_user'||identity[0].transaction_read_only!=='on')throw Error('Named MCP identity refused');
  const password=require('dotenv').parse(fs.readFileSync('.env.local')).SUPABASE_DB_PASSWORD;
  if(!password)throw Error('Existing exact credential missing');
  const env={PATH:process.env.PATH,PGPASSWORD:password,
    PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=60000 -c lock_timeout=5000 -c idle_in_transaction_session_timeout=300000'};
  safeAncestors(PARENT);fs.mkdirSync(PARENT,{recursive:true,mode:0o700});safeAncestors(PARENT);
  const dir=fs.mkdtempSync(path.join(PARENT,'genova-090-p3-'));fs.chmodSync(dir,0o700);
  const key=crypto.randomBytes(32);privateWrite(path.join(dir,'artifact-key.bin'),key);
  const log=fs.openSync(path.join(dir,'export-errors.log'),'wx',0o600);
  const holder=spawn(PG+'psql',['-X','-Atq','-w','-v','ON_ERROR_STOP=1',URL+'?sslmode=require&connect_timeout=10'],{env,stdio:['pipe','pipe',log]});
  let dump,timer,deadline,monitor,stage='snapshot-read';
  try{
    const ready=new Promise((resolve,reject)=>{
      let text='';timer=setTimeout(()=>reject(Error('Snapshot deadline')),90000);
      holder.on('error',()=>reject(Error('Snapshot spawn refused')));
      holder.on('exit',()=>reject(Error('Snapshot holder ended')));
      holder.stdout.on('data',chunk=>{
        text+=chunk.toString();if(Buffer.byteLength(text)>8*1024*1024){reject(Error('Private metadata cap'));return;}
        try{const value=completedSnapshotLine(text);if(value!==undefined)resolve(value);}
        catch{reject(Error('Private metadata format'));}
      });
    });
    holder.stdin.on('error',()=>{});
    holder.stdin.write('begin isolation level repeatable read read only;\n'+canonicalSettings+'\n'+snapshotQuery+';\n');
    const snapshot=await ready;clearTimeout(timer);stage='snapshot-verify';verifySnapshot(snapshot);
    privateWrite(path.join(dir,'snapshot.json.gcm'),encryptBuffer(Buffer.from(JSON.stringify(snapshot)),key));
    const file=path.join(dir,'database.sql.gcm'),nonce=crypto.randomBytes(12);
    privateWrite(file,Buffer.concat([MAGIC,nonce]));
    const guard=new ByteGuard(),cipher=crypto.createCipheriv('aes-256-gcm',key,nonce);
    stage='dump-stream';dump=spawn(PG+'pg_dump',dumpArgs(snapshot),{env,stdio:['ignore','pipe',log]});
    const exited=new Promise((resolve,reject)=>{dump.on('error',()=>reject(Error('Dump spawn refused')));dump.on('exit',resolve);});
    deadline=setTimeout(()=>dump.kill('SIGTERM'),120000);
    monitor=setInterval(()=>{if(freeKiB()<diskFloor||holder.exitCode!==null)dump.kill('SIGTERM');},1000);
    await pipeline(dump.stdout,guard,cipher,fs.createWriteStream(file,{flags:'a',mode:0o600}));
    const code=await exited;if(code!==0||holder.exitCode!==null||guard.bytes<1000||!guard.tail.includes(Buffer.from('PostgreSQL database dump complete')))throw Error('Dump/held snapshot completion refused');
    fs.appendFileSync(file,cipher.getAuthTag());
    stage='encryption-verify';const body=fs.readFileSync(file),decoded=decryptBuffer(body,key);
    const plaintextSha256=guard.hash.digest('hex');
    if(crypto.createHash('sha256').update(decoded).digest('hex')!==plaintextSha256)throw Error('Encrypted artifact roundtrip refused');
    decoded.fill(0);
    const summary={recordedAt:new Date().toISOString(),project:REF,cutoff:snapshot.cutoff,
      status:'CONSISTENT_PROTECTED_BACKUP_ONLY_RESTORE_NOT_RUN',directory:dir,
      plaintextBytes:guard.bytes,encryptedBytes:body.length,plaintextSha256,encryptedSha256:crypto.createHash('sha256').update(body).digest('hex'),
      schemas:snapshot.schemas.length,dataTables:snapshot.data.length,roles:snapshot.catalog.roles.length,memberships:snapshot.catalog.memberships.length,
      encryption:'AES-256-GCM with separately permission-restricted task key in same private directory; not off-site or independent key custody',
      coverage:'Auth/public/genova/migration data; Realtime/Vault/extension definitions; catalog/roles/memberships and per-table canonical JSONB SHA256 under same held snapshot',
      excluded:['Vault values','Realtime payloads','net queues/results','Storage metadata/object bytes','Drive/R2 objects','role passwords and external config/secrets'],
      fingerprintFormat:'sorted C-collated JSONB full row text; newline delimiter, duplicate rows retained; UTC/ISO dates/postgres intervals/float precision3/hex bytea; SHA256 of UTF8, empty table hashes empty bytes',
      limits:'No isolated restore/role execution/full managed platform/HTTP/source-repair acceptance. Sequence state is non-MVCC; publication catalogs captured but not independently restored. Private rows/bodies/digests not shared.'};
    privateWrite(path.join(dir,'summary.json'),Buffer.from(JSON.stringify(summary,null,2)+'\n'));
    console.log(JSON.stringify(summary));
  }catch{
    // Stage names only. Raw exceptions/SQL/row details must not become stdout.
    privateWrite(path.join(dir,'failure.json'),Buffer.from(JSON.stringify({stage,recordedAt:new Date().toISOString(),status:'FAILED_NOT_ACCEPTED'})+'\n'));
    throw Error('Protected export stage failed');
  }finally{
    clearTimeout(timer);clearTimeout(deadline);clearInterval(monitor);
    if(dump&&dump.exitCode===null)dump.kill('SIGTERM');
    holder.stdin.end('rollback;\n');holder.kill('SIGTERM');fs.closeSync(log);env.PGPASSWORD='';key.fill(0);
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.length!==3||!['--export-approved','--export-approved-below-10g'].includes(process.argv[2]))throw Error('Explicit approved export flag required');
  main().catch(()=>{console.error('Protected recovery export failed; details withheld/private log retained; no automatic retry.');process.exitCode=1;});
}
