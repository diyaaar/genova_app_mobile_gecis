// Only the owned Next acceptance child can redirect this fixed synthetic origin.
// No production configuration, credential, or remote fallback is introduced.
import assert from 'node:assert/strict';
const root = '/Users/alidiyarduran/Antigravity/genovakorist';
assert.equal(process.env.GENOVA_090_OWNED_NEXT, 'synthetic-loopback-only');
assert([root+'/spike/090-runtime/baseline',root+'/spike/090-runtime/candidate'].includes(process.cwd()));
const original = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.origin === 'https://example.supabase.co' && url.pathname === '/functions/v1/legacy-file') {
    url.protocol = 'http:';url.host = '127.0.0.1:18198';
    return original(input instanceof Request ? new Request(url,input) : url,init);
  }
  assert.equal(url.origin,'http://127.0.0.1:18198','No external Next fixture fallback');
  return original(input,init);
};
