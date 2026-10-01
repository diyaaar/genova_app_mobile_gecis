import { familySpecs, sqlTransport } from './090_http_families.ts';
const service = 'synthetic-test-service';
function request(path: string, method='GET', body?: unknown) {
  return new Request(`http://127.0.0.1:18192${path}`, { method,
    headers: { apikey: service, authorization: `Bearer ${service}` },
    ...(body ? { body: JSON.stringify(body) } : {}) });
}
function check(value: unknown) { if (!value) throw Error('transport test assertion'); }
Deno.test('exact RPC body preserves family and service SQL role, barrier precedes SQL', async () => {
  const order: string[]=[];
  const body={p_actor_id:'10000000-0000-4000-8000-000000000090',p_session_id:'11000000-0000-4000-8000-000000000090',
    p_choir_id:'20000000-0000-4000-8000-000000000090',p_family:'assignment-file',p_file_id:familySpecs[0].file};
  const response=await sqlTransport(request('/rest/v1/rpc/private_file_ticket_authorized_090','POST',body),service,
    async (statement,asService) => {order.push('sql');check(asService&&statement.includes("'assignment-file'"));return 'f';},
    async()=>{order.push('barrier');});
  check(await response.json()===false&&order.join(',')==='barrier,sql');
});
Deno.test('allowed scoped projection uses exact table and active chat filter', async()=>{
  const response=await sqlTransport(request(`/rest/v1/chat_media_versions?select=id,room_id,kind,batch_id,position&id=eq.${familySpecs[3].file}&choir_id=eq.20000000-0000-4000-8000-000000000090&state=eq.active`),service,
    async(statement,role)=>{check(role&&statement.includes("and state='active'")&&statement.includes('public.chat_media_versions'));return '[]';},async()=>{});
  check(JSON.stringify(await response.json())==='[]');
});
for(const [name,path] of Object.entries({
  auth:'/auth/v1/user',unknown_table:'/rest/v1/choir_members?select=id',
  missing_tenant:`/rest/v1/assignment_submission_file_versions?select=id&id=eq.${familySpecs[0].file}`,
  extra_filter:`/rest/v1/assignment_submission_file_versions?select=id&id=eq.${familySpecs[0].file}&choir_id=eq.20000000-0000-4000-8000-000000000090&limit=1`,
  expression:`/rest/v1/assignment_submission_file_versions?select=*&id=eq.${familySpecs[0].file}&choir_id=eq.20000000-0000-4000-8000-000000000090`,
  injection:`/rest/v1/assignment_submission_file_versions?select=id&id=eq.invalid%27;&choir_id=eq.20000000-0000-4000-8000-000000000090`,
  inactive_chat:`/rest/v1/chat_media_versions?select=id&id=eq.${familySpecs[3].file}&choir_id=eq.20000000-0000-4000-8000-000000000090&state=eq.inactive`,
  duplicate:`/rest/v1/assignment_submission_file_versions?select=id&select=id&id=eq.${familySpecs[0].file}&choir_id=eq.20000000-0000-4000-8000-000000000090`,
}))Deno.test(`unsupported ${name} refuses before SQL`,async()=>{
  let called=false,refused=false;try{await sqlTransport(request(path),service,async()=>{called=true;return '[]';},async()=>{});}catch{refused=true;}check(refused&&!called);
});
Deno.test('foreign origin or credentials refuse before SQL',async()=>{
  for(const r of [new Request('https://example.invalid/rest/v1/chat_media_versions'),
    new Request('http://127.0.0.1:18192/rest/v1/chat_media_versions')]){
    let refused=false;try{await sqlTransport(r,service,async()=>{throw Error('must not run');},async()=>{});}catch{refused=true;}check(refused);
  }
});
