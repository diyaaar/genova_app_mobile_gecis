// Genuine GoTrue accounts and fixture-only SQL; no source rows or grants changed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID, randomBytes, createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {DIR, readPrivate, sql, refuseFixtureCollisions} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {bytesFor} from './090-five-family-media.mjs';
assert(['20261013-managed-families','20261014-fresh-recovery'].includes(ATTEMPT));
assert.equal(process.argv[2], '--prepare-approved'); assert.equal(process.argv.length, 3);
const prefix = `managed-${ATTEMPT}`, file = path.join(DIR, prefix + '-fixture.json');
assert(!fs.existsSync(file));
const config = JSON.parse(readPrivate(prefix + '-config.json'));
const names = ['choirA','choirB','memberA','memberB','otherB','targetA','roleA','roleB','songA','score','audio',
  'assignment','submission','assignmentFile','reviewFile','ownSubmission','ownFile','ownReview',
  'comment','commentFile','openComment','openCommentFile','room','roomBatch','chatFile'];
const ids = Object.fromEntries(names.map(n => [n, randomUUID()]));
refuseFixtureCollisions(Object.values(ids).join(' '));
const a = ids.choirA, bucket = 'genova-private';
const item = (id, family, key, mime) => ({id, family, key, mime, bytes: bytesFor(mime).length,
  sha256: createHash('sha256').update(bytesFor(mime)).digest('hex')});
const files = [
  item(ids.score,'repertoire-file',`choirs/${a}/repertoire/${ids.score}/content`,'application/pdf'),
  item(ids.audio,'repertoire-file',`choirs/${a}/repertoire/${ids.audio}/content`,'audio/wav'),
  ...[['submission','assignmentFile','reviewFile'],['ownSubmission','ownFile','ownReview']].flatMap(([sub,take,review]) => [
    item(ids[take],'assignment-file',`choirs/${a}/assignments/${ids.assignment}/submissions/${ids[take]}/content`,'audio/wav'),
    item(ids[review],'assignment-review-file',`choirs/${a}/assignments/${ids.assignment}/submissions/${ids[sub]}/reviews/${ids[review]}/content`,'audio/wav'),
  ]),
  ...[['comment','commentFile'],['openComment','openCommentFile']].map(([comment,version]) =>
    item(ids[version],'repertoire-comment-file',`choirs/${a}/repertoire/${ids.songA}/comments/${ids[comment]}/audio/${ids[version]}/content`,'audio/wav')),
  item(ids.chatFile,'chat-media-file',`choirs/${a}/chat/${ids.room}/room-avatar/${ids.roomBatch}/0/${ids.chatFile}/content`,'image/png'),
];
const fixture = {attempt: ATTEMPT, ids, files, users: [], fixtureSqlCommitted: false};
const checkpoint = () => fs.writeFileSync(file, JSON.stringify(fixture,null,2)+'\n', {mode:0o600, flag:fs.existsSync(file)?'w':'wx'});
const sdk = key => createClient(config.api, key, {auth:{persistSession:false,autoRefreshToken:false}});
try {
  for (const role of ['shared','outsider']) {
    const email = `090-managed-${randomUUID()}@example.invalid`, password = randomBytes(24).toString('base64url');
    const result = await sdk(config.service).auth.admin.createUser({email,password,email_confirm:true});
    assert(!result.error && result.data.user, 'Synthetic real GoTrue account creation');
    fixture.users.push({role,id:result.data.user.id,email,password}); checkpoint();
  }
  const [actor, outsider] = fixture.users;
  const find = id => files.find(f => f.id === id);
  let statement = `begin;set role postgres;
    insert into public.choirs(id,slug,name) values ('${a}','090-matrix-a-${a}','090 Synthetic A'),
      ('${ids.choirB}','090-matrix-b-${ids.choirB}','090 Synthetic B');
    insert into public.roles(id,choir_id,name) values ('${ids.roleA}','${a}','Şef'),('${ids.roleB}','${ids.choirB}','Şef');
    insert into public.choir_members(id,choir_id,auth_user_id,first_name,last_name,voice_group,join_date) values
      ('${ids.memberA}','${a}','${actor.id}','090','Shared A','Alto',current_date),
      ('${ids.memberB}','${ids.choirB}','${actor.id}','090','Shared B','Alto',current_date),
      ('${ids.otherB}','${ids.choirB}','${outsider.id}','090','Other B','Alto',current_date),
      ('${ids.targetA}','${a}',null,'090','Target Bass','Bass',current_date);
    insert into public.choir_member_roles(choir_id,member_id,role_id) values ('${a}','${ids.memberA}','${ids.roleA}'),
      ('${ids.choirB}','${ids.memberB}','${ids.roleB}');
    insert into public.repertoire(id,choir_id,title,is_visible) values ('${ids.songA}','${a}','090 Matrix Song',true);
    insert into public.assignments(id,choir_id,title,description,created_by,is_active,is_locked) values
      ('${ids.assignment}','${a}','090 Matrix Assignment','Synthetic','${ids.memberA}',true,false);`;
  for (const id of [ids.score,ids.audio]) {
    const f = find(id), score = f.mime === 'application/pdf';
    statement += `insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,partition_label,drive_file_id,mime_type,file_size_bytes,uploaded_by)
      values ('${id}','${a}','${ids.songA}','090 Synthetic.${score?'pdf':'wav'}','${score?'sheet':'audio'}','Tutti','090-matrix-${id}','${f.mime}',${f.bytes},'${ids.memberA}');
      insert into public.repertoire_file_storage_locations(repertoire_file_id,choir_id,provider,bucket,object_key,content_length,mime_type,sha256_hex,verified_at,is_active)
      values ('${id}','${a}','r2','${bucket}','${f.key}',${f.bytes},'${f.mime}','${f.sha256}',now(),true);`;
  }
  for (const [sub,take,review,member] of [
    [ids.submission,ids.assignmentFile,ids.reviewFile,ids.targetA],
    [ids.ownSubmission,ids.ownFile,ids.ownReview,ids.memberA],
  ]) {
    const f = find(take), r = find(review);
    statement += `insert into public.assignment_submissions(id,choir_id,assignment_id,member_id,drive_file_id,file_name,mime_type,
        reviewer_audio_drive_file_id,reviewer_audio_file_name,reviewer_audio_mime_type)
      values ('${sub}','${a}','${ids.assignment}','${member}','r2_${take}','take.wav','audio/wav','r2_review_${review}','review.wav','audio/wav');
      insert into public.assignment_submission_file_versions(id,choir_id,submission_id,assignment_id,member_id,version_number,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name)
      values ('${take}','${a}','${sub}','${ids.assignment}','${member}',1,'r2','${bucket}','${f.key}',${f.bytes},'audio/wav','${f.sha256}','take.wav');
      insert into public.assignment_review_audio_versions(id,choir_id,submission_id,assignment_id,member_id,created_by,version_number,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name)
      values ('${review}','${a}','${sub}','${ids.assignment}','${member}','${ids.memberA}',1,'r2','${bucket}','${r.key}',${r.bytes},'audio/wav','${r.sha256}','review.wav');
      update public.assignment_submissions set current_file_version_id='${take}',reviewer_audio_file_version_id='${review}' where id='${sub}';`;
  }
  for (const [comment,version,hidden] of [[ids.comment,ids.commentFile,true],[ids.openComment,ids.openCommentFile,false]]) {
    const f = find(version);
    statement += `insert into public.repertoire_comment_audio_versions(id,choir_id,comment_id,song_id,created_by,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name)
      values ('${version}','${a}','${comment}','${ids.songA}','${ids.memberA}','r2','${bucket}','${f.key}',${f.bytes},'audio/wav','${f.sha256}','comment.wav');
      insert into public.repertoire_song_comments(id,choir_id,song_id,content_html,created_by,is_hidden,audio_drive_file_id,audio_file_name,audio_mime_type,audio_file_version_id)
      values ('${comment}','${a}','${ids.songA}','<p>090 synthetic</p>','${ids.memberA}',${hidden},'r2_comment_${version}','comment.wav','audio/wav','${version}');`;
  }
  const chat = find(ids.chatFile);
  statement += `insert into public.chat_rooms(id,choir_id,name,slug,type,created_by) values
      ('${ids.room}','${a}','090 Matrix Room','090-${ids.room}','custom','${ids.memberA}');
    insert into public.chat_room_members(choir_id,room_id,member_id,role) values ('${a}','${ids.room}','${ids.memberA}','admin');
    insert into public.chat_media_versions(id,choir_id,room_id,kind,batch_id,position,created_by,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name,state)
      values ('${ids.chatFile}','${a}','${ids.room}','room-avatar','${ids.roomBatch}',0,'${ids.memberA}','r2','${bucket}','${chat.key}',${chat.bytes},'image/png','${chat.sha256}','avatar.png','active');
    update public.chat_rooms set avatar_media_version_id='${ids.chatFile}',avatar_url='r2_chat_${ids.chatFile}' where id='${ids.room}';commit;`;
  sql(statement); fixture.fixtureSqlCommitted = true; checkpoint();
  console.log('PASS synthetic nine-file fixture committed; users created by genuine local GoTrue.');
} catch {
  fixture.failed = true; checkpoint(); console.error('Fixture preparation failed; private errors retained.'); process.exitCode = 1;
}
