// Bounded offline analysis. This does not execute SQL or change acceptance gates.
// Keep source/actual catalogs and generated SQL private; export aggregate counts only.
import { normalize } from './090-p3-offline-restore.mjs';
export { requireRecoveryMetadata } from './090-p3-recovery-queries.mjs';

const families={functions:'X',schemas:'UC',relations:'arwdDxtm'};
const words={a:'INSERT',r:'SELECT',w:'UPDATE',d:'DELETE',D:'TRUNCATE',x:'REFERENCES',t:'TRIGGER',m:'MAINTAIN',X:'EXECUTE',U:'USAGE',C:'CREATE'};
const quote=name=>{if(!/^[a-z_][a-z_0-9]*$/.test(name))throw Error('Unsupported recovery identifier');return '"'+name+'"';};
const equal=(a,b)=>JSON.stringify(normalize(a))===JSON.stringify(normalize(b));
const ordered=items=>items.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));

// Deliberately refuse quoted/custom-role ACL encodings rather than split incorrectly.
// PG17 NULL means built-in acldefault, NOT ALTER DEFAULT PRIVILEGES.
export function aclEntries(row,family){
  const allowed=row.kind==='S'?'rwU':families[family];
  if(!allowed)throw Error('Unsupported ACL family');
  quote(row.owner);
  const text=row.acl===null?`{${row.owner}=${allowed}/${row.owner}${family==='functions'?`,=X/${row.owner}`:''}}`:row.acl;
  if(typeof text!=='string'||!text.startsWith('{')||!text.endsWith('}'))throw Error('Unsupported ACL representation');
  const entries=[];
  for(const item of text.slice(1,-1).split(',').filter(Boolean)){
    const match=item.match(/^([a-z_][a-z_0-9]*|)=([a-zA-Z*]*)\/([a-z_][a-z_0-9]*)$/);
    if(!match)throw Error('Unsupported ACL item');
    const [,grantee,rights,grantor]=match;
    for(let i=0;i<rights.length;i++){
      const privilege=rights[i];if(!allowed.includes(privilege))throw Error('Unexpected ACL privilege');
      const grantOption=rights[i+1]==='*';if(grantOption)i++;
      if(!grantee&&grantOption)throw Error('PUBLIC grant option refused');
      entries.push({grantee,grantor,privilege,grantOption});
    }
  }
  const result=ordered(entries);
  if(new Set(result.map(e=>JSON.stringify(e))).size!==result.length)throw Error('Duplicate ACL privilege');
  return result;
}
const identity=(row,family)=>JSON.stringify(family==='functions'?[row.schema,row.signature]:family==='schemas'?[row.name]:[row.schema,row.name]);
function keyed(rows,family){
  if(!Array.isArray(rows))throw Error('Missing catalog group');
  const map=new Map(rows.map(r=>[identity(r,family),r]));
  if(map.size!==rows.length)throw Error('Duplicate catalog identity');return map;
}
function target(row,family){
  if(family==='schemas')return `SCHEMA ${quote(row.name)}`;
  if(family==='relations'){
    if(!['r','p','v','m','S'].includes(row.kind))throw Error('Unsupported relation kind');
    return `${row.kind==='S'?'SEQUENCE':'TABLE'} ${quote(row.schema)}.${quote(row.name)}`;
  }
  // regprocedure arguments are types, never raw SQL statements or expressions.
  const match=row.signature.match(/^([a-z_][a-z_0-9]*\.)?([a-z_][a-z_0-9]*)\(([a-z_0-9 ,\[\].]*)\)$/);
  if(!match||match[2]!==row.name||(match[1]&&match[1]!==row.schema+'.'))throw Error('Unsupported routine target');
  const args=match[3]?match[3].split(',').map(x=>x.trim()):[];
  for(const type of args)if(!/^(?:[a-z_][a-z_0-9]*(?:\.[a-z_][a-z_0-9]*)?|double precision|timestamp(?: with(?:out)? time zone)?|time(?: with(?:out)? time zone)?)(?:\[\])?$/.test(type))throw Error('Unsupported routine argument');
  return `FUNCTION ${quote(row.schema)}.${quote(row.name)}(${args.join(',')})`;
}

// Exact captured ACL additions only. Refuse extra rights/changed owners/grantors;
// no REVOKE CASCADE, catalog UPDATE, or broad role/default-privilege mutation.
export function planAclAdditions(source,actual){
  const totals={changedObjects:0,defaultRepresentationOnly:0,permissionDifferences:0,grantStatements:0};
  const groups={},sql=[];
  for(const family of Object.keys(families)){
    const expected=keyed(source[family],family),observed=keyed(actual[family],family);
    if(expected.size!==observed.size||[...expected.keys()].some(k=>!observed.has(k)))throw Error('Catalog identity mismatch');
    const counts={changedObjects:0,defaultRepresentationOnly:0,permissionDifferences:0,grantStatements:0};
    for(const [id,s] of expected){
      const a=observed.get(id);
      if(!equal({...s,acl:null},{...a,acl:null}))throw Error('Non-ACL drift requires separate repair');
      if(equal({acl:s.acl},{acl:a.acl}))continue;
      if(s.acl===null)throw Error('NULL source ACL cannot be instantiated exactly with GRANT');
      const wanted=aclEntries(s,family),present=aclEntries(a,family);
      if(wanted.some(e=>e.grantor!==s.owner)||present.some(e=>e.grantor!==s.owner))throw Error('Delegated ACL provenance requires separate repair');
      // An actual grant-option upgrade is an extra privilege, not representation.
      if(present.some(p=>!wanted.some(w=>w.grantee===p.grantee&&w.grantor===p.grantor&&w.privilege===p.privilege&&(!p.grantOption||w.grantOption))))throw Error('Unexpected extra ACL privilege');
      const missing=wanted.filter(w=>!present.some(p=>equal(p,w)));
      if(!wanted.length)throw Error('Empty captured ACL requires separate repair');
      const changes=missing.length?missing:[wanted[0]]; // instantiate captured explicit defaults
      const object=target(s,family);
      // pg_database_owner cannot be SET ROLE. Its implicit member is the database owner.
      const executor=s.owner==='pg_database_owner'?'postgres':s.owner;
      sql.push(`SET ROLE ${quote(executor)};`);
      for(const e of changes)sql.push(`GRANT ${words[e.privilege]} ON ${object} TO ${e.grantee?quote(e.grantee):'PUBLIC'}${e.grantOption?' WITH GRANT OPTION':''};`);
      sql.push('RESET ROLE;');
      counts.changedObjects++;counts[missing.length?'permissionDifferences':'defaultRepresentationOnly']++;
      counts.grantStatements+=changes.length;
    }
    groups[family]=counts;for(const k of Object.keys(totals))totals[k]+=counts[k];
  }
  return {totals,groups,sql:sql.join('\n'),status:'PREPARED_ONLY_NOT_EXECUTED'};
}

export function columnLayoutEvidence(source,actual){
  const key=r=>JSON.stringify([r.table_schema,r.table_name,r.column_name]);
  const index=new Map(actual.map(r=>[key(r),r]));
  if(index.size!==actual.length||index.size!==source.length||new Set(source.map(key)).size!==source.length)throw Error('Column identity mismatch');
  let ordinalDifferences=0;const sourceTables=new Map(),actualTables=new Map();
  for(const r of source){
    const a=index.get(key(r));if(!a||!equal({...r,ordinal_position:0},{...a,ordinal_position:0}))throw Error('Logical column drift');
    if(!Number.isInteger(r.ordinal_position)||r.ordinal_position<1||!Number.isInteger(a.ordinal_position)||a.ordinal_position<1)throw Error('Invalid ordinal');
    if(r.ordinal_position!==a.ordinal_position)ordinalDifferences++;
    const table=JSON.stringify([r.table_schema,r.table_name]);
    for(const [map,value] of [[sourceTables,r],[actualTables,a]])map.set(table,[...(map.get(table)||[]),value]);
  }
  let tablesWithGaps=0,internalGaps=0;
  for(const [table,cols] of sourceTables){
    const s=[...cols].sort((a,b)=>a.ordinal_position-b.ordinal_position),a=actualTables.get(table).sort((a,b)=>a.ordinal_position-b.ordinal_position);
    if(s.some((r,i)=>r.column_name!==a[i].column_name))throw Error('Surviving column order drift');
    for(const items of [s,a])if(new Set(items.map(r=>r.ordinal_position)).size!==items.length)throw Error('Duplicate ordinal');
    const gaps=s.at(-1).ordinal_position-s.length;
    if(gaps){tablesWithGaps++;internalGaps+=gaps;}
  }
  return {ordinalDifferences,tablesWithGaps,internalGaps,survivingOrderMatches:true,otherCapturedColumnFieldsMatch:true,physicalEquality:'FAIL',droppedSlotCause:'NOT_PROVEN_WITHOUT_SAME_SNAPSHOT_PG_ATTRIBUTE'};
}
