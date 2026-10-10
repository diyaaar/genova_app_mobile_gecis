// Genuine local Auth users/password sessions; only synthetic local choir rows.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {DIR,readPrivate,sql,refuseFixtureCollisions} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {pdf,wave} from './090-managed-media.mjs';
assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);assert(['--prepare-approved','--resume-created-users-approved'].includes(process.argv[2]));
const resume=process.argv[2]==='--resume-created-users-approved';
const prefix=`managed-${ATTEMPT}`,file=path.join(DIR,prefix+'-fixture.json');assert.equal(fs.existsSync(file),resume);
const config=JSON.parse(readPrivate(prefix+'-config.json'));
const ids=resume?JSON.parse(readPrivate(prefix+'-fixture.json')).ids:Object.fromEntries(['choirA','choirB','memberA','memberB','otherB','roleA','roleB','songA','score','audio'].map(n=>[n,randomUUID()]));
const fixture=resume?JSON.parse(readPrivate(prefix+'-fixture.json')):{attempt:ATTEMPT,ids,users:[],files:[{id:ids.score,alias:'090-managed-score',mime:'application/pdf',bytes:pdf().length},
  {id:ids.audio,alias:'090-managed-audio',mime:'audio/wav',bytes:wave().length}].map(f=>({...f,key:`choirs/${ids.choirA}/repertoire/${f.id}/content`,sha256:createHash('sha256').update(f.mime==='application/pdf'?pdf():wave()).digest('hex')}))};
const checkpoint=()=>{fs.writeFileSync(file,JSON.stringify(fixture,null,2)+'\n',{mode:0o600,flag:fs.existsSync(file)?'w':'wx'});};
const client=key=>createClient(config.api,key,{auth:{persistSession:false,autoRefreshToken:false}});
const ok=(error,name)=>{if(error)throw Error('Real local '+name+' failed');};
try{
  // New Auth IDs legitimately exist before membership inserts; exclude only
  // those proven newly created accounts from the application-ID collision guard.
  refuseFixtureCollisions(Object.values(ids).join(' '));
  if(resume){assert.equal(fixture.attempt,ATTEMPT);assert.equal(fixture.failed,true);assert(!fixture.fixtureSqlCommitted);
    assert.deepEqual(fixture.users.map(u=>u.role),['shared','outsider']);
    for(const user of fixture.users){assert(/^090-managed-[0-9a-f-]+@example\.invalid$/u.test(user.email));
      const actual=await client(config.service).auth.admin.getUserById(user.id);ok(actual.error,'resume account identity');assert.equal(actual.data.user?.email,user.email);}
  }
  for(const role of resume?[]:['shared','outsider']){
    const email='090-managed-'+randomUUID()+'@example.invalid',password=randomBytes(24).toString('base64url');
    const created=await client(config.service).auth.admin.createUser({email,password,email_confirm:true});ok(created.error,'admin create');assert(created.data.user);
    fixture.users.push({role,id:created.data.user.id,email,password});checkpoint();
  }
  const [a,b]=fixture.users;
  const files=fixture.files.map(f=>`('${f.id}','${ids.choirA}','${ids.songA}','${f.mime==='application/pdf'?'090 Synthetic.pdf':'090 Synthetic.wav'}','${f.mime==='application/pdf'?'sheet':'audio'}','Tutti','${f.alias}',
    'https://drive.google.com/file/d/${f.alias}/view','${f.mime}',${f.bytes},'${ids.memberA}')`).join(',');
  const locations=fixture.files.map(f=>`('${f.id}','${ids.choirA}','r2','genova-private','${f.key}',${f.bytes},'${f.mime}','${f.sha256}',now(),true)`).join(',');
  const source=`begin;set role postgres;
    insert into public.choirs(id,slug,name) values ('${ids.choirA}','090-managed-a-${ids.choirA}','090 Sentetik Koro A'),('${ids.choirB}','090-managed-b-${ids.choirB}','090 Sentetik Koro B');
    insert into public.roles(id,choir_id,name) values ('${ids.roleA}','${ids.choirA}','Şef'),('${ids.roleB}','${ids.choirB}','Şef');
    insert into public.choir_members(id,choir_id,auth_user_id,first_name,last_name,voice_group,join_date) values
      ('${ids.memberA}','${ids.choirA}','${a.id}','090','Shared A','Alto',current_date),('${ids.memberB}','${ids.choirB}','${a.id}','090','Shared B','Alto',current_date),
      ('${ids.otherB}','${ids.choirB}','${b.id}','090','Other B','Alto',current_date);
    insert into public.choir_member_roles(choir_id,member_id,role_id) values ('${ids.choirA}','${ids.memberA}','${ids.roleA}'),('${ids.choirB}','${ids.memberB}','${ids.roleB}');
    insert into public.repertoire(id,choir_id,title,composer,is_visible) values ('${ids.songA}','${ids.choirA}','090 Sentetik Eser','Synthetic',true);
    insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,partition_label,drive_file_id,drive_web_view_link,mime_type,file_size_bytes,uploaded_by) values ${files};
    insert into public.repertoire_file_storage_locations(repertoire_file_id,choir_id,provider,bucket,object_key,content_length,mime_type,sha256_hex,verified_at,is_active) values ${locations};
    commit;`;
  sql(source);fixture.fixtureSqlCommitted=true;checkpoint();
  for(const user of fixture.users){const sdk=client(config.anon),signed=await sdk.auth.signInWithPassword({email:user.email,password:user.password});ok(signed.error,'password sign-in');
    assert(signed.data.session);const token=signed.data.session.access_token,claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));
    assert.equal(claims.sub,user.id);assert(claims.session_id);assert.equal(claims.role,'authenticated');
    const choirs=await sdk.rpc('list_my_choirs');ok(choirs.error,'real list_my_choirs');assert.deepEqual(choirs.data.map(c=>c.choir_id).sort(),(user.role==='shared'?[ids.choirA,ids.choirB]:[ids.choirB]).sort());
    ok((await sdk.rpc('set_active_choir',{p_choir_id:user.role==='shared'?ids.choirA:ids.choirB})).error,'real set_active_choir');
    const catalogue=await sdk.from('repertoire').select('id');ok(catalogue.error,'actual catalogue RLS');assert.deepEqual(catalogue.data.map(s=>s.id),user.role==='shared'?[ids.songA]:[]);
    ok((await sdk.auth.signOut()).error,'real sign-out');
  }
  fixture.apiPreparationPass=true;checkpoint();console.log('PASS genuine synthetic password sessions, choir-aware RPC, real catalogue RLS and sign-out.');
}catch(error){fixture.failed=true;checkpoint();console.error(error instanceof assert.AssertionError?error.message.split('\n')[0]:error.message);process.exitCode=1;}
