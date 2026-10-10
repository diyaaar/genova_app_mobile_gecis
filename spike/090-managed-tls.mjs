// Task-only TLS trust, no global trust-store/security change.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {X509Certificate,createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);assert(['--prepare-approved','--prepare-ca-leaf','--prepare-initial-ca-leaf'].includes(process.argv[2]));
const owner=JSON.parse(readPrivate('runtime-ownership.json'));measureRuntime(owner);
if(process.argv[2]!=='--prepare-approved'){
  const p=path.join(DIR,`managed-${ATTEMPT}-tls`);
  if(process.argv[2]==='--prepare-ca-leaf')assert(fs.existsSync(p+'.json'));
  else assert.equal(ATTEMPT,'20261010-managed-final');
  for(const suffix of ['-ca.key','-ca.crt','-leaf.key','-leaf.csr','-leaf.crt','-leaf.ext','-v2.json'])assert(!fs.existsSync(p+suffix),'No TLS retry artifact overwrite');
  process.umask(0o077);
  const run=args=>assert.equal(spawnSync('/opt/homebrew/bin/openssl',args,{encoding:'utf8',timeout:10000}).status,0,'CA/leaf generation failed');
  run(['req','-x509','-newkey','rsa:2048','-nodes','-days','2','-keyout',p+'-ca.key','-out',p+'-ca.crt','-subj','/CN=090 test root CA',
    '-addext','basicConstraints=critical,CA:TRUE','-addext','keyUsage=critical,keyCertSign,cRLSign']);
  run(['req','-new','-newkey','rsa:2048','-nodes','-keyout',p+'-leaf.key','-out',p+'-leaf.csr','-subj','/CN=090 managed loopback server']);
  fs.writeFileSync(p+'-leaf.ext','basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=IP:127.0.0.1,DNS:localhost\n',{flag:'wx',mode:0o600});
  run(['x509','-req','-in',p+'-leaf.csr','-CA',p+'-ca.crt','-CAkey',p+'-ca.key','-set_serial','90','-out',p+'-leaf.crt','-days','2','-sha256','-extfile',p+'-leaf.ext']);
  const x=new X509Certificate(fs.readFileSync(p+'-leaf.crt'));assert.equal(x.ca,false);assert.equal(new X509Certificate(fs.readFileSync(p+'-ca.crt')).ca,true);
  fs.writeFileSync(p+'-v2.json',JSON.stringify({attempt:ATTEMPT,serverLeafCA:false,separateTrustedRootCA:true,
    certificateSha256:createHash('sha256').update(fs.readFileSync(p+'-leaf.crt')).digest('hex'),spkiSha256Base64:createHash('sha256').update(x.publicKey.export({type:'spki',format:'der'})).digest('base64'),
    previousFailure:'Actual Deno rustls refused CA used as server end entity; no global TLS bypass',globalTrustChanged:false},null,2)+'\n',{flag:'wx',mode:0o600});
  console.log('PASS separate local CA and non-CA TLS server leaf; strict TLS remains enabled.');process.exit(0);
}
const prefix=path.join(DIR,`managed-${ATTEMPT}-tls`),key=prefix+'.key',cert=prefix+'.crt';
assert(!fs.existsSync(key)&&!fs.existsSync(cert),'Existing TLS artifacts refused');process.umask(0o077);
const result=spawnSync('/opt/homebrew/bin/openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','2',
  '-keyout',key,'-out',cert,'-subj','/CN=090 managed loopback test',
  '-addext','subjectAltName=IP:127.0.0.1,DNS:localhost','-addext','basicConstraints=critical,CA:TRUE'],{encoding:'utf8',timeout:10000});
assert.equal(result.status,0,'Task TLS generation failed');
assert.equal(fs.statSync(key).mode&511,384);assert.equal(fs.statSync(cert).mode&511,384);
const spki=new X509Certificate(fs.readFileSync(cert)).publicKey.export({type:'spki',format:'der'});
fs.writeFileSync(prefix+'.json',JSON.stringify({attempt:ATTEMPT,certificateSha256:createHash('sha256').update(fs.readFileSync(cert)).digest('hex'),
  spkiSha256Base64:createHash('sha256').update(spki).digest('base64'),globalTrustChanged:false,privateKeyInOutput:false},null,2)+'\n',{flag:'wx',mode:0o600});
console.log('PASS scoped local TLS certificate; global trust unchanged.');
