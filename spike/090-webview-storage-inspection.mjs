// One bounded, owned Android fixture inspection. No hosted target, tokens or UI mutation.
import assert from 'node:assert/strict';
const endpoint = 'http://127.0.0.1:9222';
const targets = await (await fetch(endpoint + '/json')).json();
const matching = targets.filter(target => target.type === 'page'
  && target.url.startsWith('http://127.0.0.1:31090/koristler/'));
assert.equal(matching.length, 1, 'Expected exact active synthetic chorister WebView');
const socket = new URL(matching[0].webSocketDebuggerUrl);
assert.equal(socket.protocol, 'ws:'); assert.equal(socket.hostname, '127.0.0.1');
assert.equal(socket.port, '9222'); assert(socket.pathname.startsWith('/devtools/page/'));
const expression = `(async () => {
  if (location.origin !== 'http://127.0.0.1:31090') throw Error('Wrong inspection origin');
  const result = {};
  for (const name of ['localStorage', 'sessionStorage']) {
    try { result[name] = { count: window[name].length }; }
    catch (error) { result[name] = { blocked: error.name }; }
  }
  result.indexedDB = { count: (await indexedDB.databases()).length };
  const names = await caches.keys();
  let privateEntries = 0;
  for (const name of names) for (const request of await (await caches.open(name)).keys()) {
    if (/drive-file|repertoire-file|assignment-file|private|ticket|token=/.test(request.url)) privateEntries++;
  }
  result.cacheStorage = { count: names.length, privateEntries };
  result.serviceWorkers = { count: (await navigator.serviceWorker.getRegistrations()).length };
  return result;
})()`;
const ws = new WebSocket(socket);
try {
  const result = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Bounded inspection timeout')), 10_000);
    ws.addEventListener('error', () => { clearTimeout(timer); reject(Error('Owned socket unavailable')); });
    ws.addEventListener('open', () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate',
      params: { expression, awaitPromise: true, returnByValue: true } })));
    ws.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      if (data.id !== 1) return;
      clearTimeout(timer);
      if (data.error || data.result?.exceptionDetails) reject(Error('Runtime storage inspection failed'));
      else resolve(data.result.result.value);
    });
  });
  for (const name of ['localStorage', 'sessionStorage']) {
    assert(result[name].count === 0 || result[name].blocked === 'SecurityError', 'Browser key persistence');
  }
  assert.equal(result.indexedDB.count, 0); assert.equal(result.cacheStorage.count, 0);
  assert.equal(result.cacheStorage.privateEntries, 0); assert.equal(result.serviceWorkers.count, 0);
  console.log(JSON.stringify({ status: 'PASS_ACTIVE_BROWSER_STORAGE', result }));
} finally { ws.close(); }
