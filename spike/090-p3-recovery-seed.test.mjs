import test from 'node:test';import assert from 'node:assert/strict';
import {tableBoundary,splitColumns,restoreDroppedSlots,restoreBetweenForm,publicationSeed} from './090-p3-recovery-seed.mjs';
const catalog=()=>({relations:[{schema:'public',name:'synthetic',kind:'p'}],columns:[{table_schema:'public',table_name:'synthetic',column_name:'id',ordinal_position:1},{table_schema:'public',table_name:'synthetic',column_name:'value',ordinal_position:3}],droppedColumns:[{schema:'public',table_name:'synthetic',position:2}],constraints:[],publications:[],publicationRelations:[],publicationSchemas:[]});
test('balanced table parser handles partition suffix, literals, dollar bodies and nested comments',()=>{
  const text="CREATE TABLE public.synthetic (\n id int, value text default ';),)', extra text default $v$);$v$ /* /* ) */ */\n) PARTITION BY RANGE (id);\nCREATE TABLE other (id int);";
  const b=tableBoundary(text,text.indexOf('('));assert.equal(text[b.close],')');assert(text.slice(b.close,b.end).includes('PARTITION BY'));
  assert.equal(splitColumns(text.slice(text.indexOf('(')+1,b.close)).length,3);
  assert.throws(()=>splitColumns("id text default 'unclosed"));assert.throws(()=>tableBoundary('(id int',0));
});
test('slot reconstruction adds/drops only source-captured gaps and preserves a partition suffix',()=>{
  const sql='CREATE TABLE public.synthetic (\n    id integer,\n    value text,\n    CONSTRAINT "synthetic check" CHECK (id > 0)\n) PARTITION BY RANGE (id);';
  const r=restoreDroppedSlots(sql,catalog());assert.equal(r.slots,1);assert.equal(r.tables,1);
  assert(r.sql.includes('"__g090_recovery_drop_2" text'));assert(r.sql.includes('PARTITION BY RANGE (id);\nALTER TABLE'));
  assert(r.sql.includes('CONSTRAINT "synthetic check" CHECK (id > 0)'));
  assert(!r.sql.includes('CASCADE')&&!r.sql.includes('UPDATE pg_'));
});
test('slot parser refuses missing, conflicting, duplicate or unsupported source boundaries',()=>{
  const sql='CREATE TABLE public.synthetic (\n    id integer,\n    value text\n);';
  assert.throws(()=>restoreDroppedSlots(sql+'\n'+sql,catalog()));
  const c=catalog();c.droppedColumns[0].position=1;assert.throws(()=>restoreDroppedSlots(sql,c));
  const d=catalog();d.columns[1].ordinal_position=4;assert.throws(()=>restoreDroppedSlots(sql,d));
  assert.throws(()=>restoreDroppedSlots(sql.replace('value text','other text'),catalog()));
});
test('BETWEEN reconstruction changes only exact captured declaration, no comparator normalization',()=>{
  const definition="CHECK ((((length(object_key) >= 1) AND (length(object_key) <= 1024)) AND (object_key ~ '^literal$'::text)))";
  const c={constraints:[{name:'synthetic_check',type:'c',definition}]};const sql='CREATE TABLE synthetic (object_key text, CONSTRAINT synthetic_check '+definition+');';
  const r=restoreBetweenForm(sql,c);assert.equal(r.count,1);assert(r.sql.includes('length(object_key) BETWEEN 1 AND 1024'));
  assert(r.sql.includes("object_key ~ '^literal$'::text"));assert.equal((r.sql.match(/CREATE TABLE/g)||[]).length,1);assert(r.sql.length<sql.length);
  assert.throws(()=>restoreBetweenForm(sql+sql,c));assert.throws(()=>restoreBetweenForm(sql.replace('1024','1025'),c));
});
test('publication seed uses direct roots/flags/owners; expanded children cannot become explicit roots',()=>{
  const c=catalog();c.publications=[{name:'synthetic_pub',owner:'postgres',all_tables:false,pubinsert:true,pubupdate:true,pubdelete:false,pubtruncate:false,pubviaroot:true}];
  c.publicationRelations=[{publication:'synthetic_pub',schema:'public',table_name:'synthetic',columns:null,row_filter:null}];c.publicationTables=[{tablename:'child_not_a_root'}];
  const p=publicationSeed(c);assert.equal(p.roots,1);assert(p.sql.includes('TABLE ONLY "public"."synthetic"'));assert(p.sql.includes("publish='insert,update'"));assert(!p.sql.includes('child_not_a_root'));
  for(const mutation of [{row_filter:'id > 0'},{columns:['id']}]){const d=structuredClone(c);Object.assign(d.publicationRelations[0],mutation);assert.throws(()=>publicationSeed(d));}
  assert.throws(()=>publicationSeed({...c,publicationSchemas:[{schema:'public'}]}));
});
