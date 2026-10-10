// Egress guard only; preserve real TLS/HTTP/Auth/REST/Edge responses unchanged.
const original=globalThis.fetch;
globalThis.fetch=(input,init)=>{
  const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
  if(!['https://127.0.0.1:18443','http://127.0.0.1:18197','http://127.0.0.1:18199','http://127.0.0.1:18200'].includes(url.origin))throw Error('Outside local Next egress refused');
  return original(input,init);
};
