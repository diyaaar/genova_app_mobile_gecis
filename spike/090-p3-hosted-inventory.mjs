// Internal, project-scoped READ-ONLY MCP inventory. Never prints/persists credentials
// or hosted source bodies. No management API/psql fallback, mutation, or retry.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

export const REF = 'hievmwwctjjlhmssoxsu';
const ENDPOINT = `https://mcp.supabase.com/mcp?project_ref=${REF}&read_only=true&features=database,functions`;
const CONFIG = '/Users/alidiyarduran/.gemini/antigravity/mcp_config.json';
export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export const QUERIES = {
  identity: "select current_database() as database, current_user as role, current_setting('transaction_read_only') as transaction_read_only, current_setting('server_version') as server_version",
  migrations: 'select version, name, statements from supabase_migrations.schema_migrations order by version',
  functions: `select n.nspname as schema, p.oid::regprocedure::text as signature, p.proname as name,
    pg_get_userbyid(p.proowner) as owner, p.prosecdef as security_definer, p.proconfig as config,
    p.proacl::text as acl, pg_get_functiondef(p.oid) as definition, p.prosrc as body,
    has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
    has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
    has_function_privilege('service_role',p.oid,'EXECUTE') as service_role_execute
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (n.nspname='public' or n.nspname ~ '^genova_[0-9]{3}$') and p.prokind='f' order by n.nspname,p.proname,p.oid::regprocedure::text`,
  relations: `select n.nspname as schema, c.relname as name, c.relkind as kind, pg_get_userbyid(c.relowner) as owner,
    c.relrowsecurity as rls, c.relforcerowsecurity as force_rls, c.relacl::text as acl
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where (n.nspname='public' or n.nspname ~ '^genova_[0-9]{3}$') and c.relkind in ('r','p','v','m') order by n.nspname,c.relname`,
  policies: "select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname='public' or schemaname ~ '^genova_[0-9]{3}$' order by schemaname,tablename,policyname",
  constraints: `select n.nspname as schema, c.relname as table_name, k.conname as name, k.contype as type,
    k.convalidated as validated, pg_get_constraintdef(k.oid) as definition
    from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' or n.nspname ~ '^genova_[0-9]{3}$' order by n.nspname,c.relname,k.conname`,
  columns: `select table_schema,table_name,column_name,ordinal_position,is_nullable,data_type,udt_name,column_default
    from information_schema.columns where table_schema='public' or table_schema ~ '^genova_[0-9]{3}$'
    order by table_schema,table_name,ordinal_position`,
  deltaDependencies: `select json_build_object(
    'namespaces',(select json_agg(json_build_object('name',v.name,'exists',n.oid is not null,
      'owner',pg_get_userbyid(n.nspowner),'acl',n.nspacl::text) order by v.name)
      from (values ('genova_024'),('genova_043'),('genova_046'),('genova_048'),('genova_005'),
        ('genova_078'),('genova_079'),('genova_087'),('genova_090'),('realtime')) v(name)
      left join pg_namespace n on n.nspname=v.name),
    'relations',(select json_agg(json_build_object('name',v.name,'exists',c.oid is not null,
      'kind',c.relkind,'rls',c.relrowsecurity,'owner',pg_get_userbyid(c.relowner)) order by v.name)
      from (values ('auth.sessions'),('genova_005.active_choir_sessions'),('public.repertoire_pdf_annotations'),
        ('public.repertoire_files'),('public.chat_rooms'),('public.chat_room_members'),('public.chat_messages'),
        ('public.chat_reactions'),('public.chat_message_status'),('realtime.messages'),('public.song_assignments'),
        ('public.profile_change_requests'),('public.assignment_submission_file_versions'),
        ('public.assignment_review_audio_versions'),('public.repertoire_comment_audio_versions'),
        ('public.idx_chat_messages_room_created_id_048')) v(name)
      left join pg_class c on c.oid=to_regclass(v.name)),
    'procedures',(select json_agg(json_build_object('name',v.name,'exists',p.oid is not null,
      'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text) order by v.name)
      from (values ('genova_005.current_session_id()'),('public.current_choir_id()'),
        ('public.current_choir_member_id()'),('public.current_chat_member_id()'),('public.set_active_choir(uuid)'),
        ('public.current_member_has_role(text)'),('realtime.topic()'),('public.mark_chat_message_status(uuid,text)'),
        ('public.mark_chat_room_read(uuid)'),('public.can_read_chat_media_060(uuid,uuid,uuid)'),
        ('public.save_repertoire_pdf_annotation_snapshot(uuid,integer,text,text,integer,jsonb,bigint)'),
        ('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])'),
        ('public.submit_profile_change_request(uuid,jsonb,text)'),('genova_087.normalize_changes(jsonb)'),
        ('public.review_profile_change_request(uuid,text,text)'),
        ('public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)'),
        ('public.resolve_legacy_file_090(uuid,uuid,uuid,text,text,uuid)')) v(name)
      left join pg_proc p on p.oid=to_regprocedure(v.name)),
    'realtimePolicies',(select json_agg(json_build_object('name',policyname,'roles',roles,'command',cmd,
      'permissive',permissive,'qual',qual,'withCheck',with_check) order by policyname)
      from pg_policies where schemaname='realtime' and tablename='messages'),
    'publication',(select json_agg(json_build_object('name',pubname,'allTables',puballtables,
      'owner',pg_get_userbyid(pubowner)) order by pubname) from pg_publication where pubname='supabase_realtime'),
    'publishedChatTables',(select json_agg(tablename order by tablename) from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public'
        and tablename in ('chat_messages','chat_reactions','chat_message_status')),
    'annotationTriggers',(select json_agg(json_build_object('name',t.tgname,'enabled',t.tgenabled,
      'procedure',t.tgfoid::regprocedure::text,'definition',pg_get_triggerdef(t.oid)) order by t.tgname)
      from pg_trigger t where t.tgrelid=to_regclass('public.repertoire_pdf_annotations') and not t.tgisinternal),
    'annotationUpdaterCount',(select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='set_repertoire_pdf_annotations_updated_fields'),
    'annotationRevision',(select json_agg(json_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull))
      from pg_attribute a where a.attrelid=to_regclass('public.repertoire_pdf_annotations') and a.attname='revision' and not a.attisdropped),
    'authSessionNotAfter',(select count(*)=1 from pg_attribute a where a.attrelid=to_regclass('auth.sessions') and a.attname='not_after' and not a.attisdropped),
    'statusAclProvenanceValid',(select p.proacl is not null and not exists(
      select 1 from aclexplode(p.proacl) a where a.grantor<>p.proowner or
        a.grantee not in (0,p.proowner,'anon'::regrole::oid,'authenticated'::regrole::oid,'service_role'::regrole::oid))
      from pg_proc p where p.oid=to_regprocedure('public.mark_chat_message_status(uuid,text)'))
    ) as inventory`,
};
// Conservative SQL token comparison, not a PostgreSQL parser or semantic proof.
// Dollar-quoted bodies are kept byte-exact; comments/spacing outside literals are
// ignored. Case is retained to prefer false differences over false equivalence.
export function sqlTokens(sql) {
  const tokens=[]; let i=0;
  while(i<sql.length) {
    const tail=sql.slice(i); let m;
    if((m=tail.match(/^\s+/))){i+=m[0].length;continue;}
    if(tail.startsWith('--')){const end=sql.indexOf('\n',i);i=end<0?sql.length:end+1;continue;}
    if(tail.startsWith('/*')){let depth=1;i+=2;while(i<sql.length&&depth){if(sql.startsWith('/*',i)){depth++;i+=2;}else if(sql.startsWith('*/',i)){depth--;i+=2;}else i++;}if(depth)throw Error('Unclosed SQL comment');continue;}
    if((m=tail.match(/^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/))){const end=sql.indexOf(m[0],i+m[0].length);if(end<0)throw Error('Unclosed SQL dollar literal');tokens.push(sql.slice(i,end+m[0].length));i=end+m[0].length;continue;}
    if(tail[0]==="'"||tail[0]==='"'){const q=tail[0],escaped=q==="'"&&tokens.at(-1)?.toLowerCase()==='e',start=i++;let closed=false;while(i<sql.length){if(escaped&&sql[i]==='\\'){i+=2;continue;}if(sql[i]===q){i++;if(sql[i]===q){i++;continue;}closed=true;break;}i++;}if(!closed)throw Error('Unclosed SQL literal');tokens.push(sql.slice(start,i));continue;}
    if((m=tail.match(/^[A-Za-z_][A-Za-z_0-9$]*|^\d+(?:\.\d+)?|^(?:::|->>|->|>=|<=|<>|!=|\|\|)/))){tokens.push(m[0]);i+=m[0].length;continue;}
    tokens.push(tail[0]);i++;
  }
  return tokens;
}
export function normalizedMigration(sql) {
  const tokens=sqlTokens(sql);
  if(tokens[0]?.toLowerCase()==='begin'&&tokens[1]===';')tokens.splice(0,2);
  if(tokens.at(-1)===';'&&tokens.at(-2)?.toLowerCase()==='commit')tokens.splice(-2);
  while(tokens.at(-1)===';')tokens.pop();
  return JSON.stringify(tokens);
}
export function sourceFunctions(files) {
  const found=new Map();
  for(const file of files){const sql=fs.readFileSync(file,'utf8');
    for(const match of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+([\w]+)\.([\w]+)\s*\(/gi)) {
      const tail=sql.slice(match.index); const literal=tail.match(/\bas\s+(\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$)/i);
      if(!literal)continue;const start=match.index+literal.index+literal[0].length,end=sql.indexOf(literal[1],start);
      if(end<0)throw Error('Source function literal not closed');
      found.set(`${match[1]}.${match[2]}`,{path:file,bodySha256:hash(sql.slice(start,end)),tokenSha256:hash(JSON.stringify(sqlTokens(sql.slice(start,end))))});
    }
  }
  return found;
}
export function canonicalEdgePath(file) {
  if(file.startsWith('supabase/functions/')||file.startsWith('lib/'))return file;
  if(file.startsWith('functions/'))return 'supabase/'+file;
  if(!file.includes('..')&&/^[a-z][a-z0-9-]+\//.test(file))return 'supabase/functions/'+file;
  throw Error('Unrecognized deployed source path');
}
export function runtimeClosure(entry, manifest) {
  const ts=createRequire(import.meta.url)('typescript'),known=new Set(manifest.pins.map(p=>p.path));
  const seen=new Set(),pending=[entry];
  while(pending.length){const file=pending.pop();if(seen.has(file))continue;seen.add(file);
    const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    function visit(node){let spec;
      if(ts.isImportDeclaration(node)) {
        const clause=node.importClause;
        const allType=clause?.isTypeOnly || (!clause?.name&&clause?.namedBindings&&ts.isNamedImports(clause.namedBindings)&&clause.namedBindings.elements.length>0&&clause.namedBindings.elements.every(e=>e.isTypeOnly));
        if(!allType)spec=node.moduleSpecifier.text;
      }else if(ts.isExportDeclaration(node)&&!node.isTypeOnly)spec=node.moduleSpecifier?.text;
      else if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))spec=node.arguments[0].text;
      if(spec?.startsWith('.')) {const base=path.posix.normalize(path.posix.join(path.posix.dirname(file),spec));
        const target=[base,base+'.ts',base+'.tsx',base+'/index.ts'].find(f=>known.has(f));
        if(!target)throw Error('Unresolved runtime import');pending.push(target);}
      ts.forEachChild(node,visit);
    }visit(ast);
  }
  return [...seen].sort();
}
export function reconcileSnapshot(result,manifest) {
  // Preserve acquisition digests; derive only from captured metadata + pinned local code.
  for(const row of result.sql) {
    const ledger=result.ledger.find(l=>l.version===row.id);
    if(ledger?.statementsJsonSha256===hash('null')) {
      row.storedTokenSha256=null;row.comparison='LEDGER_PRESENT_BODY_NOT_STORED';
      row.boundary='NULL statements proves historical SQL text/checksum is unavailable, not a SQL source difference';
    }
  }
  for(const edge of result.edges){if(!edge.files)continue;
    const entry=manifest.dependencyInventory.edge.find(e=>e.slug===edge.slug);
    edge.files=edge.files.map(f=>({...f,canonicalPath:canonicalEdgePath(f.path)}));
    if(new Set(edge.files.map(f=>f.canonicalPath)).size!==edge.files.length)throw Error('Duplicate canonical edge path');
    edge.pairs=entry.files.map(pin=>({path:pin.path,candidateSha256:pin.sha256,hostedSha256:edge.files.find(f=>f.canonicalPath===pin.path)?.sha256||null}));
    edge.unexpected=edge.files.filter(f=>!entry.files.some(p=>p.path===f.canonicalPath));
    const runtime=runtimeClosure(entry.entry,manifest);
    edge.runtimeFiles=runtime;
    edge.typeOnlySourceFiles=entry.files.filter(f=>!runtime.includes(f.path)).map(f=>f.path);
    edge.runtimeSourceStatus=runtime.every(file=>edge.pairs.find(p=>p.path===file)?.hostedSha256===edge.pairs.find(p=>p.path===file)?.candidateSha256)?'RUNTIME_SOURCE_MATCH':'RUNTIME_SOURCE_DIFFERENT';
    edge.sourceStatus=edge.pairs.every(p=>p.hostedSha256===p.candidateSha256)&&!edge.unexpected.length?'EXACT_CLOSURE_MATCH':edge.runtimeSourceStatus==='RUNTIME_SOURCE_MATCH'&&!edge.unexpected.length?'MATCH_WITH_TYPE_ONLY_OMISSIONS':'SOURCE_DIFFERENT';
    edge.jwtStatus=String(edge.verifyJwt)===edge.candidateVerifyJwt?'MATCH':'DIFFERENT';
  }
  const baseline=sourceFunctions(['supabase/migrations/20260905003154_multi_membership_active_choir_005.sql']);
  result.activeMembershipBaseline=['current_choir_id','current_choir_member_id','set_active_choir'].map(name=>({name,
    matches005BodyTokens:result.catalog.functions.find(f=>f.schema==='public'&&f.name===name)?.bodyTokenSha256===baseline.get('public.'+name)?.tokenSha256,
    desired078Match:result.sourceFunctionComparison.find(f=>f.name==='public.'+name)?.comparison}));
  result.reconciliation={at:new Date().toISOString(),helperSha256:hash(fs.readFileSync(import.meta.filename)),
    normalization:'Known MCP packaging path prefixes; runtime import AST excludes explicit type-only dependencies. Captured source bytes still hashed exactly. Source equality is not deployed runtime behavior.',
    historicalSqlBoundary:'All 15 relevant ledger rows have NULL statements. Exact applied historical SQL checksum cannot be recovered from this ledger; current catalog definitions/ACL/policy/constraint/column digests and 65 source-function comparisons provide current-state provenance, not historical equivalence.'};
  return result;
}
export function unwrap(value) {
  if (typeof value?.result === 'string') return decodeData({ content: [{ type: 'text', text: value.result }] });
  return value;
}
export function decodeRpc(raw) {
  try { return JSON.parse(raw); } catch {
    const events = raw.split('\n').filter(line => line.startsWith('data:')).map(line => JSON.parse(line.slice(5)));
    const result = events.find(event => event.result || event.error);
    if (!result) throw Error('MCP response format unavailable');
    return result;
  }
}
export function decodeData(result) {
  if (result.isError) throw Error('MCP tool refused (details withheld)');
  if (result.structuredContent) return unwrap(result.structuredContent);
  const text = result.structuredContent?.result || result.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || '';
  try { return unwrap(JSON.parse(text)); } catch {
    // Supabase SQL returns JSON inside an explicitly untrusted-data envelope.
    const match = text.match(/^<untrusted-data-[^>\n]+>\s*([\s\S]*?)\s*^<\/untrusted-data-[^>\n]+>/m);
    if (!match) throw Error('MCP data format unavailable (details withheld)');
    return JSON.parse(match[1]);
  }
}
export async function connect() {
  const configured = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).mcpServers?.['supabase-genesinova'];
  const token = configured?.env?.SUPABASE_ACCESS_TOKEN;
  if (!token || !configured.args?.some(arg => arg.includes('@supabase/mcp-server-supabase'))) throw Error('Existing named MCP credential unavailable');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  let sequence = 0;
  async function rpc(method, params, notification = false) {
    const response = await fetch(ENDPOINT, { method: 'POST', headers,
      body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: ++sequence }), method, params }),
      signal: AbortSignal.timeout(30000) });
    const session = response.headers.get('mcp-session-id');
    if (session) headers['Mcp-Session-Id'] = session;
    if (!response.ok) throw Error(`MCP HTTP ${response.status} (${method}, details withheld)`);
    const body = await response.text();
    if (Buffer.byteLength(body) > 16 * 1024 * 1024) throw Error('MCP response size limit');
    if (notification) return;
    const decoded = decodeRpc(body);
    if (decoded.error || !decoded.result) throw Error('MCP protocol refusal (details withheld)');
    return decoded.result;
  }
  const initialized = await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {},
    clientInfo: { name: 'genova-p3-readonly-inventory', version: '1.0.0' } });
  headers['MCP-Protocol-Version'] = initialized.protocolVersion;
  await rpc('notifications/initialized', {}, true);
  return { initialized, call: async (name, args = {}) => {
    if (!['execute_sql', 'list_migrations', 'list_edge_functions', 'get_edge_function'].includes(name)) throw Error('Tool outside inventory allowlist');
    if (name === 'execute_sql' && !Object.values(QUERIES).includes(args.query)) throw Error('Only exact approved catalog SELECT allowed');
    return decodeData(await rpc('tools/call', { name, arguments: args }));
  } };
}

async function probe() {
  const client = await connect();
  const identity = await client.call('execute_sql', { query: QUERIES.identity });
  console.log(JSON.stringify({ stage: 'identity', server: client.initialized.serverInfo, identity }));
  for (const name of ['list_migrations', 'list_edge_functions']) {
    const data = await client.call(name);
    const result = data.migrations || data.functions || data;
    console.log(JSON.stringify({ stage: name, shape: Array.isArray(result) ? 'array' : typeof result,
      count: Array.isArray(result) ? result.length : undefined,
      firstKeys: Object.keys(Array.isArray(result) ? result[0] || {} : result),
      entries: Array.isArray(result) ? result.map(row => ({ version: row.version, name: row.name, slug: row.slug, verify_jwt: row.verify_jwt, status: row.status })) : undefined }));
  }
}
async function shape() {
  const client = await connect();
  for (const [name,args] of [['execute_sql',{ query: QUERIES.migrations }],['get_edge_function',{ function_slug:'chat-media-file' }]]) {
    try {
      const result = await client.call(name,args);
      console.log(JSON.stringify({ stage:name, shape:Array.isArray(result)?'array':typeof result,
        count:Array.isArray(result)?result.length:undefined, keys:Object.keys(Array.isArray(result)?result[0]||{}:result),
        fileKeys:result.files?.map(f=>Object.keys(f)), paths:result.files?.map(f=>f.name||f.path),
        statementShape:Array.isArray(result)?typeof result[0]?.statements:undefined }));
    } catch (error) { console.log(JSON.stringify({ stage:name, error:error.message })); }
  }
}
async function inventory() {
  const output='docs/reports/090/2026-10-04-p3-hosted-inventory.json';
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||fs.existsSync(output))throw Error('Inventory root/output refused');
  const manifestPath='docs/reports/090/2026-10-03-p1-beta-candidate.json';
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  for(const pin of manifest.pins)if(hash(fs.readFileSync(pin.path))!==pin.sha256)throw Error('Candidate pin drift');
  const client=await connect();
  const identity=await client.call('execute_sql',{query:QUERIES.identity});
  if(identity.length!==1||identity[0].database!=='postgres'||identity[0].role!=='supabase_read_only_user'||identity[0].transaction_read_only!=='on')throw Error('Read-only identity refused');
  const result={candidate:manifest.candidateId,project:REF,startedAt:new Date().toISOString(),
    source:manifest.source,manifestSha256:hash(fs.readFileSync(manifestPath)),helperSha256:hash(fs.readFileSync(import.meta.filename)),
    connection:{name:'supabase-genesinova',transport:'documented hosted MCP HTTP, existing named local credential reused without persistence',
      readOnly:true,features:['database','functions'],server:client.initialized.serverInfo,identity:identity[0]},
    limits:'Catalog/source identity only; no private data rows/logs, source bodies, credentials or secret values retained. No writes/deploy/build/runtime/device/AI call. Not release/security behavior acceptance.'};
  const rows=await client.call('execute_sql',{query:QUERIES.migrations});
  const ledger=new Map(rows.map(r=>[r.version,r]));
  result.ledger=rows.map(r=>({version:r.version,name:r.name,statementCount:r.statements?.length||0,
    statementsJsonSha256:hash(JSON.stringify(r.statements)),joinedSqlSha256:hash((r.statements||[]).join('\n'))}));
  result.sql=manifest.sql.sourceUpgradeSequence.map(pin=>{
    const id=pin.path.match(/\/(\d{14})_/)[1],row=ledger.get(id),source=fs.readFileSync(pin.path,'utf8');
    const hosted=Array.isArray(row?.statements)?row.statements.map(s=>s.trim().endsWith(';')?s:s+';').join('\n'):null;
    return {...pin,id,ledgerStatus:row?'PRESENT':'ABSENT',
      sourceTokenSha256:hash(normalizedMigration(source)),
      storedTokenSha256:hosted===null?null:hash(normalizedMigration(hosted)),
      comparison:hosted===null?(row?'LEDGER_PRESENT_BODY_NOT_STORED':'NO_LEDGER_BODY'):normalizedMigration(source)===normalizedMigration(hosted)?'CONSERVATIVE_TOKEN_MATCH':'TOKEN_DIFFERENT'};
  });
  console.log(JSON.stringify({stage:'SQL ledger',rows:rows.length,present:result.sql.filter(r=>r.ledgerStatus==='PRESENT').length}));
  const catalog={};
  for(const name of ['functions','relations','policies','constraints','columns']) {
    const records=await client.call('execute_sql',{query:QUERIES[name]});
    catalog[name]=records.map(row=>{
      const value={...row};
      for(const key of ['definition','body','qual','with_check','column_default']) {
        if(key in value){value[key+'Sha256']=value[key]===null?null:hash(value[key]);
          if(key==='body'){try{value.bodyTokenSha256=hash(JSON.stringify(sqlTokens(value[key])));}catch{value.bodyTokenSha256=null;value.bodyTokenBoundary='UNSUPPORTED_BODY_SYNTAX; exact bytes hashed only';}}
          delete value[key];}
      }
      if(value.config)value.config=value.config.map(c=>c.startsWith('search_path=')?c:c.split('=')[0]+'=<value withheld>');
      return value;
    });
    console.log(JSON.stringify({stage:'catalog '+name,rows:records.length}));
  }
  result.catalog=catalog;
  const expected=sourceFunctions(manifest.sql.sourceUpgradeSequence.map(p=>p.path));
  result.sourceFunctionComparison=[...expected].map(([name,source])=>{
    const actual=catalog.functions.filter(r=>`${r.schema}.${r.name}`===name);
    return {name,...source,actual:actual.map(r=>({signature:r.signature,bodySha256:r.bodySha256,bodyTokenSha256:r.bodyTokenSha256})),
      comparison:actual.length===0?'MISSING':actual.some(r=>r.bodyTokenSha256===source.tokenSha256)?'BODY_TOKEN_MATCH':'BODY_DIFFERENT'};
  });
  result.rpc=manifest.dependencyInventory.rpcDefinitions.map(r=>({...r,actual:catalog.functions.filter(f=>f.schema==='public'&&f.name===r.name)}));
  const deployed=(await client.call('list_edge_functions')).functions;
  if(!Array.isArray(deployed))throw Error('Edge list shape refused');
  result.edgeMetadata=deployed.map(row=>({slug:row.slug,status:row.status,version:row.version,verifyJwt:row.verify_jwt,
    createdAt:row.created_at,updatedAt:row.updated_at,bundleSha256:row.ezbr_sha256,importMap:row.import_map}));
  result.edges=[];
  for(const entry of manifest.dependencyInventory.edge){
    const meta=deployed.find(r=>r.slug===entry.slug);
    if(!meta){result.edges.push({slug:entry.slug,status:'MISSING',candidate:entry});continue;}
    const fetched=await client.call('get_edge_function',{function_slug:entry.slug});
    if(fetched.slug!==entry.slug||fetched.version!==meta.version)throw Error('Edge identity changed during inventory');
    const files=fetched.files.map(file=>({path:file.name,bytes:Buffer.byteLength(file.content),sha256:hash(file.content)}));
    const pairs=entry.files.map(pin=>({path:pin.path,candidateSha256:pin.sha256,
      hostedSha256:files.find(f=>f.path===pin.path)?.sha256||null}));
    const unexpected=files.filter(f=>!entry.files.some(p=>p.path===f.path));
    const names=[...new Set(fetched.files.flatMap(f=>[...f.content.matchAll(/(?:Deno\.env\.get|process\.env\[)\(?["']([A-Z][A-Z_0-9]*)["']/g)].map(m=>m[1])))].sort();
    result.edges.push({slug:entry.slug,status:meta.status,version:meta.version,verifyJwt:meta.verify_jwt,
      candidateVerifyJwt:entry.verifyJwt,bundleSha256:meta.ezbr_sha256,
      sourceStatus:pairs.every(p=>p.hostedSha256===p.candidateSha256)&&unexpected.length===0?'EXACT_CLOSURE_MATCH':'SOURCE_DIFFERENT',
      files,pairs,unexpected,environmentNamesOnly:names});
    console.log(JSON.stringify({stage:'Edge source',slug:entry.slug,version:meta.version,status:result.edges.at(-1).sourceStatus}));
  }
  result.completedAt=new Date().toISOString();
  reconcileSnapshot(result,manifest);
  // Serialize only approved metadata/digests; raw fetched bodies are discarded.
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({output,bytes:fs.statSync(output).size,sqlCounts:result.sql.reduce((a,r)=>(a[r.comparison]=(a[r.comparison]||0)+1,a),{}),edgeCounts:result.edges.reduce((a,r)=>(a[r.sourceStatus||r.status]=(a[r.sourceStatus||r.status]||0)+1,a),{})}));
}
function reconcile() {
  const file='docs/reports/090/2026-10-04-p3-hosted-inventory.json';
  const result=JSON.parse(fs.readFileSync(file,'utf8'));
  if(result.project!==REF||result.reconciliation)throw Error('Unreconciled owned snapshot required');
  const manifest=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-p1-beta-candidate.json','utf8'));
  for(const pin of manifest.pins)if(hash(fs.readFileSync(pin.path))!==pin.sha256)throw Error('Candidate pin drift');
  const previousSha256=hash(fs.readFileSync(file));
  reconcileSnapshot(result,manifest);result.reconciliation.acquiredSnapshotSha256=previousSha256;
  fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({file,sql:result.sql.reduce((a,r)=>(a[r.comparison]=(a[r.comparison]||0)+1,a),{}),edges:result.edges.reduce((a,r)=>(a[r.sourceStatus||r.status]=(a[r.sourceStatus||r.status]||0)+1,a),{})}));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3 || !['--probe','--shape','--inventory','--reconcile'].includes(process.argv[2])) throw Error('Explicit inventory action required');
  Promise.resolve().then(()=>({'--probe':probe,'--shape':shape,'--inventory':inventory,'--reconcile':reconcile}[process.argv[2]])()).catch(() => { console.error('Inventory failed; details withheld. No automatic retry.'); process.exitCode = 1; });
}
