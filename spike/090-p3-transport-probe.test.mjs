import test from 'node:test';import assert from 'node:assert/strict';
import {sslRequest,classify,summarizeLocal,pgProbe} from './090-p3-transport-probe.mjs';
test('probe sends only the PG SSL negotiation packet, never startup/credential/query',()=>{
  const b=sslRequest();assert.equal(b.length,8);assert.equal(b.readInt32BE(0),8);assert.equal(b.readInt32BE(4),80877103);
  assert(!b.includes(Buffer.from('postgres')));
});
test('pre-auth outcomes distinguish connect, negotiation, SSL and unexpected replies',()=>{
  assert.equal(classify('TIMEOUT',false),'TCP_CONNECT_TIMEOUT');assert.equal(classify('TIMEOUT',true),'PG_NEGOTIATION_TIMEOUT');
  assert.equal(classify(null,true,'S'),'PRE_AUTH_PG_SSL_AVAILABLE');assert.equal(classify(null,true,'N'),'PRE_AUTH_PG_SSL_REFUSED');
  assert.equal(classify(null,true,'OTHER'),'UNEXPECTED_PRE_AUTH_REPLY');assert.equal(classify('ECONNREFUSED',false),'TCP_CONNECT_ERROR');
});
test('route/proxy summary exports flags, not credentials, local addresses or VPN labels',()=>{
  const r=summarizeLocal('HTTPEnable : 1\nHTTPProxy : private.example\nSOCKSEnable : 0','gateway: 192.0.2.1\ninterface: en0','(Connected) Owner private VPN',{HTTPS_PROXY:'https://user:password@private.example'});
  assert(r.systemProxy.http&&!r.systemProxy.socks);assert.equal(r.defaultInterface,'en0');assert.equal(r.vpnConnected,1);
  for(const text of ['192.0.2.1','private.example','password','Owner'])assert(!JSON.stringify(r).includes(text));
  assert.deepEqual(r.proxyEnvKeys,['HTTPS_PROXY']);
});
test('probe refuses unrecognized port/address before network access',async()=>{
  await assert.rejects(pgProbe({address:'example.com',family:4},5432));
  await assert.rejects(pgProbe({address:'192.0.2.1',family:4},443));
});
