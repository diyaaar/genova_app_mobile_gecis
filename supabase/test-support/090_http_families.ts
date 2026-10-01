// Test-only transport: execute actual index registration/query mappings against native SQL.
// Auth/POST/PostgREST are excluded; unknown requests fail closed, never fall back remotely.
import { createPrivateFileTicketV2 } from '../functions/_shared/private-file-ticket-v2.ts';

const choir = '20000000-0000-4000-8000-000000000090';
const assignment = '60000000-0000-4000-8000-000000000090';
const submission = '61000000-0000-4000-8000-000000000090';
const song = '50000000-0000-4000-8000-000000000090';
const comment = '70000000-0000-4000-8000-000000000090';
const room = '80000000-0000-4000-8000-000000000090';
const batch = '82000000-0000-4000-8000-000000000090';
const wav = new Uint8Array([
  82,73,70,70,40,0,0,0,87,65,86,69,102,109,116,32,
  16,0,0,0,1,0,1,0,64,31,0,0,128,62,0,0,2,0,16,0,
  100,97,116,97,4,0,0,0,0,0,1,0,
]);
const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));
export const familySpecs = [
  { family: 'assignment-file', table: 'assignment_submission_file_versions', file: '62000000-0000-4000-8000-000000000090',
    key: `choirs/${choir}/assignments/${assignment}/submissions/62000000-0000-4000-8000-000000000090/content`, bytes: wav, mime: 'audio/wav' },
  { family: 'assignment-review-file', table: 'assignment_review_audio_versions', file: '63000000-0000-4000-8000-000000000090',
    key: `choirs/${choir}/assignments/${assignment}/submissions/${submission}/reviews/63000000-0000-4000-8000-000000000090/content`, bytes: wav, mime: 'audio/wav' },
  { family: 'repertoire-comment-file', table: 'repertoire_comment_audio_versions', file: '71000000-0000-4000-8000-000000000090',
    key: `choirs/${choir}/repertoire/${song}/comments/${comment}/audio/71000000-0000-4000-8000-000000000090/content`, bytes: wav, mime: 'audio/wav' },
  { family: 'chat-media-file', table: 'chat_media_versions', file: '81000000-0000-4000-8000-000000000090',
    key: `choirs/${choir}/chat/${room}/room-avatar/${batch}/0/81000000-0000-4000-8000-000000000090/content`, bytes: png, mime: 'image/png' },
] as const;
export type FamilySpec = typeof familySpecs[number];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const allowedFields = new Set(['id','choir_id','submission_id','assignment_id','member_id','comment_id','song_id',
  'room_id','kind','batch_id','position','message_id','provider','bucket','object_key','content_length',
  'mime_type','sha256_hex','file_name','state','created_at']);
function require(condition: unknown): asserts condition { if (!condition) throw Error('090 transport refused unsupported request'); }

/** Strict request parser: whitelist complete RPC body/table/filter/projection before SQL. */
export async function sqlTransport(request: Request, service: string,
  sql: (statement: string, asService?: boolean) => Promise<string>, beforeAuthority: () => Promise<void>,
): Promise<Response> {
  const url = new URL(request.url);
  require(url.origin === 'http://127.0.0.1:18192');
  require(request.headers.get('apikey') === service && request.headers.get('authorization') === `Bearer ${service}`);
  if (url.pathname === '/rest/v1/rpc/private_file_ticket_authorized_090') {
    require(request.method === 'POST' && !url.search);
    const body = await request.json();
    require(body && Object.keys(body).sort().join(',') === 'p_actor_id,p_choir_id,p_family,p_file_id,p_session_id');
    for (const field of ['p_actor_id','p_session_id','p_choir_id','p_file_id']) require(UUID.test(body[field]));
    require(familySpecs.some(s => s.family === body.p_family));
    await beforeAuthority();
    const result = await sql(`select public.private_file_ticket_authorized_090('${body.p_actor_id}','${body.p_session_id}','${body.p_choir_id}','${body.p_family}','${body.p_file_id}')`, true);
    require(result === 't' || result === 'f');
    return Response.json(result === 't');
  }
  require(request.method === 'GET');
  const spec = familySpecs.find(s => url.pathname === `/rest/v1/${s.table}`); require(spec);
  const params = [...url.searchParams.keys()];
  const expected = spec.family === 'chat-media-file' ? ['choir_id','id','select','state'] : ['choir_id','id','select'];
  require(params.sort().join(',') === expected.sort().join(','));
  const id = url.searchParams.get('id')?.slice(3), tenant = url.searchParams.get('choir_id')?.slice(3);
  require(url.searchParams.get('id')?.startsWith('eq.') && UUID.test(id ?? ''));
  require(url.searchParams.get('choir_id')?.startsWith('eq.') && UUID.test(tenant ?? ''));
  const fields = (url.searchParams.get('select') ?? '').split(',');
  require(fields.length > 0 && fields.every(f => allowedFields.has(f)) && new Set(fields).size === fields.length);
  if (spec.family === 'chat-media-file') require(url.searchParams.get('state') === 'eq.active');
  const statement = `select coalesce(json_agg(t),'[]') from (select ${fields.join(',')} from public.${spec.table}
    where id='${id}' and choir_id='${tenant}' ${spec.family === 'chat-media-file' ? "and state='active'" : ''}) t`;
  return new Response(await sql(statement, true), { headers: { 'Content-Type': 'application/json' } });
}

export async function createActualFamilyReaders(options: {
  sql: (statement: string, asService?: boolean) => Promise<string>;
  beforeAuthority: () => Promise<void>; ticketSecret: string; access: string; secret: string;
}) {
  const service = options.ticketSecret;
  const env = { SUPABASE_URL: 'http://127.0.0.1:18192', SUPABASE_SERVICE_ROLE_KEY: service,
    R2_ACCOUNT_ID: '0123456789abcdef0123456789abcdef', R2_BUCKET: 'genova-private', R2_JURISDICTION: '',
    R2_ACCESS_KEY_ID: options.access, R2_SECRET_ACCESS_KEY: options.secret,
    R2_TEST_ENDPOINT: 'http://127.0.0.1:18191', R2_ALLOW_INSECURE_LOOPBACK: 'true' };
  const prior = Object.fromEntries(Object.keys(env).map(key => [key, Deno.env.get(key)]));
  for (const [key,value] of Object.entries(env)) Deno.env.set(key, value);
  const originalFetch = globalThis.fetch, originalServe = Deno.serve;
  const handlers = new Map<string, (request: Request) => Response | Promise<Response>>();
  type Handler = (request: Request) => Response | Promise<Response>;
  let captured: Handler | undefined;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init), origin = new URL(request.url).origin;
    if (origin === 'http://127.0.0.1:18192') return sqlTransport(request, service, options.sql, options.beforeAuthority);
    require(origin === 'http://127.0.0.1:18190' || origin === 'http://127.0.0.1:18191');
    return originalFetch(request);
  };
  Deno.serve = ((handler: unknown) => { require(typeof handler === 'function' && !captured);
    captured = handler as Handler; return {}; }) as typeof Deno.serve;
  try {
    // Literal imports are intentionally coupled to the four production entrypoints.
    const imports = [() => import('../functions/assignment-file/index.ts'),
      () => import('../functions/assignment-review-file/index.ts'),
      () => import('../functions/repertoire-comment-file/index.ts'),
      () => import('../functions/chat-media-file/index.ts')];
    for (let i=0;i<imports.length;i++) { captured=undefined; await imports[i](); require(captured); handlers.set(familySpecs[i].family,captured); }
  } catch (error) { globalThis.fetch = originalFetch; restoreEnv(); throw error; }
  finally { Deno.serve = originalServe; }
  function restoreEnv() { for (const [key,value] of Object.entries(prior)) value === undefined ? Deno.env.delete(key) : Deno.env.set(key,value); }
  return { handlers,
    ticket: (spec: FamilySpec) => createPrivateFileTicketV2(spec.family, { fileId: spec.file, choirId: choir,
      actorId: '10000000-0000-4000-8000-000000000090', sessionId: '11000000-0000-4000-8000-000000000090' }, service),
    cleanup() { globalThis.fetch=originalFetch; restoreEnv(); },
  };
}
