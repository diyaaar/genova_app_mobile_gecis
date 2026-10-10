// Normalize local ingress only; actual production entrypoint owns every decision.
import {READERS, readerAt} from './090-five-family-contract.mjs';
const endpoint = Deno.env.get('GENOVA_090_EDGE_PUBLIC_ENDPOINT');
const reader = readerAt(endpoint, Number(Deno.env.get('GENOVA_090_EDGE_PORT')));
const fetchActual = globalThis.fetch.bind(globalThis);
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  if (!['https://127.0.0.1:18443', 'http://127.0.0.1:18092'].includes(url.origin)) throw Error('Outside Edge egress refused');
  return fetchActual(input, init);
};
const serveActual = Deno.serve.bind(Deno);
Deno.serve = ((options: Deno.ServeTcpOptions | Deno.ServeHandler, handler?: Deno.ServeHandler) => {
  const actual = typeof options === 'function' ? options : handler;
  if (!actual) throw Error('Known TCP handler required');
  return serveActual(
  {...(typeof options === 'function' ? {} : options), hostname: '127.0.0.1', port: Number(reader.port)}, (request, info) => {
    const canonical = new URL(reader.endpoint); canonical.search = new URL(request.url).search;
    return actual(new Request(canonical, request), info);
  },
); }) as typeof Deno.serve;
// Closed imports: no request/environment value becomes an arbitrary import path.
const imports = [
  () => import('../supabase/functions/repertoire-file/index.ts'),
  () => import('../supabase/functions/assignment-file/index.ts'),
  () => import('../supabase/functions/assignment-review-file/index.ts'),
  () => import('../supabase/functions/repertoire-comment-file/index.ts'),
  () => import('../supabase/functions/chat-media-file/index.ts'),
];
await imports[READERS.indexOf(reader)]();
