// Read-only, correct-project RPC presence inventory; no rows, definitions or secrets retained.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import {connect,QUERIES,REF,hash} from './090-p3-hosted-inventory.mjs';
const files=execFileSync('git',['ls-files','-z','app','components','hooks','lib','store','apps/mobile','supabase/functions'])
  .toString().split('\0').filter(f=>/\.(ts|tsx)$/u.test(f)&&!/(\.test\.|\.spec\.|__tests__|__mocks__|\/test-support\/)/u.test(f));
const names=new Map(),dynamic=[];
for(const path of files){
  const body=fs.readFileSync(path,'utf8'),source=ts.createSourceFile(path,body,ts.ScriptTarget.Latest,true);
  function walk(node){
    if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='rpc'){
      const arg=node.arguments[0],site={path,line:source.getLineAndCharacterOfPosition(node.getStart(source)).line+1,sourceSha256:hash(body)};
      if(arg&&ts.isStringLiteralLike(arg))names.set(arg.text,[...(names.get(arg.text)||[]),site]);
      else dynamic.push({...site,expression:arg?.getText(source)});
    }
    ts.forEachChild(node,walk);
  }
  walk(source);
}
// Source-reviewed finite dispatchers; preserve their hashes and re-review if this list drifts.
const finite={
  'apps/mobile/src/chat/supabase-chat-message-action-transport.ts':['edit_chat_message','delete_chat_message_for_everyone','hide_chat_message_for_self'],
  'supabase/functions/link-preview/index.ts':['current_choir_id','current_choir_member_id'],
  'supabase/functions/repertoire-upload/index.ts':['repertoire_cover_upload_056','repertoire_upload_054'],
};
for(const site of dynamic){
  const targets=finite[site.path];if(!targets)throw Error('Unreviewed dynamic RPC caller: '+site.path);
  for(const name of targets)names.set(name,[...(names.get(name)||[]),site]);
  site.reviewedTargets=targets;
}
const client=await connect(),identity=await client.call('execute_sql',{query:QUERIES.identity});
if(identity[0]?.role!=='supabase_read_only_user'||identity[0]?.transaction_read_only!=='on')throw Error('Read-only scope mismatch');
const catalog=await client.call('execute_sql',{query:QUERIES.functions});
const requirements=[...names].sort().map(([name,callers])=>({name,callers,
  deployedSignatures:catalog.filter(f=>f.schema==='public'&&f.name===name).map(f=>f.signature)}));
const result={observedAt:new Date().toISOString(),project:REF,identity,requirements,dynamic,
  missing:requirements.filter(r=>r.deployedSignatures.length===0).map(r=>r.name),
  boundary:'RPC name/signature presence and source caller mapping only. Does not prove compatible arguments, ACL/RLS/runtime behavior, deployed Edge body equality or release readiness.'};
fs.writeFileSync('docs/reports/production-2026-10-13/rpc-inventory.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({requirements:requirements.length,missing:result.missing,dynamicReviewed:dynamic.length}));
