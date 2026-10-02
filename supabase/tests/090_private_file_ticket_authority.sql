-- Disposable PG17 only: all synthetic rows and session mutations roll back.
begin;

insert into auth.users(id) values
  ('10000000-0000-4000-8000-000000000090'),
  ('10000000-0000-4000-8000-000000000091');
insert into auth.sessions(id,user_id) values
  ('11000000-0000-4000-8000-000000000090','10000000-0000-4000-8000-000000000090'),
  ('11000000-0000-4000-8000-000000000091','10000000-0000-4000-8000-000000000090'),
  ('11000000-0000-4000-8000-000000000092','10000000-0000-4000-8000-000000000091');
insert into public.choirs(id,slug,name) values
  ('20000000-0000-4000-8000-000000000090','090-a','090 A'),
  ('20000000-0000-4000-8000-000000000091','090-b','090 B');
insert into public.choir_members(id,choir_id,auth_user_id,first_name,last_name,voice_group,join_date) values
  ('30000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','10000000-0000-4000-8000-000000000090','Actor','A','Alto',current_date),
  ('30000000-0000-4000-8000-000000000091','20000000-0000-4000-8000-000000000091','10000000-0000-4000-8000-000000000090','Actor','B','Alto',current_date),
  ('30000000-0000-4000-8000-000000000092','20000000-0000-4000-8000-000000000090','10000000-0000-4000-8000-000000000091','Target','A','Soprano',current_date);
insert into public.roles(id,choir_id,name) values
  ('40000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','Şef');
insert into public.choir_member_roles(choir_id,member_id,role_id) values
  ('20000000-0000-4000-8000-000000000090','30000000-0000-4000-8000-000000000090','40000000-0000-4000-8000-000000000090');
insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id) values
  ('11000000-0000-4000-8000-000000000090','10000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090'),
  ('11000000-0000-4000-8000-000000000091','10000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000091'),
  ('11000000-0000-4000-8000-000000000092','10000000-0000-4000-8000-000000000091','20000000-0000-4000-8000-000000000090');

insert into public.repertoire(id,choir_id,title,is_visible) values
  ('50000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','090 Song',true);
insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,drive_file_id,mime_type) values
  ('51000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','50000000-0000-4000-8000-000000000090','score.pdf','sheet','090-local','application/pdf');
insert into public.song_assignments(choir_id,song_id,member_id,assigned_by,part_name) values
  ('20000000-0000-4000-8000-000000000090','50000000-0000-4000-8000-000000000090',
   '30000000-0000-4000-8000-000000000092','30000000-0000-4000-8000-000000000090','Soprano');
insert into public.assignments(id,choir_id,title,description,created_by,is_active,is_locked) values
  ('60000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','090 Task','Synthetic','30000000-0000-4000-8000-000000000090',true,false);
insert into public.assignment_submissions(
  id,choir_id,assignment_id,member_id,drive_file_id,file_name,mime_type,
  reviewer_audio_drive_file_id,reviewer_audio_file_name,reviewer_audio_mime_type
) values (
  '61000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '60000000-0000-4000-8000-000000000090','30000000-0000-4000-8000-000000000092',
  'r2_62000000-0000-4000-8000-000000000090','take.wav','audio/wav',
  'r2_review_63000000-0000-4000-8000-000000000090','review.wav','audio/wav'
);
insert into public.assignment_submission_file_versions(
  id,choir_id,submission_id,assignment_id,member_id,version_number,provider,bucket,
  object_key,content_length,mime_type,sha256_hex,file_name
) values (
  '62000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '61000000-0000-4000-8000-000000000090','60000000-0000-4000-8000-000000000090',
  '30000000-0000-4000-8000-000000000092',1,'r2','genova-private','090/assignment',16,
  'audio/wav',repeat('a',64),'take.wav'
);
insert into public.assignment_review_audio_versions(
  id,choir_id,submission_id,assignment_id,member_id,created_by,version_number,provider,
  bucket,object_key,content_length,mime_type,sha256_hex,file_name
) values (
  '63000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '61000000-0000-4000-8000-000000000090','60000000-0000-4000-8000-000000000090',
  '30000000-0000-4000-8000-000000000092','30000000-0000-4000-8000-000000000090',
  1,'r2','genova-private','090/review',16,'audio/wav',repeat('b',64),'review.wav'
);
update public.assignment_submissions set
  current_file_version_id='62000000-0000-4000-8000-000000000090',
  reviewer_audio_file_version_id='63000000-0000-4000-8000-000000000090'
where id='61000000-0000-4000-8000-000000000090';
insert into public.repertoire_comment_audio_versions(
  id,choir_id,comment_id,song_id,created_by,provider,bucket,object_key,
  content_length,mime_type,sha256_hex,file_name
) values (
  '71000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '70000000-0000-4000-8000-000000000090','50000000-0000-4000-8000-000000000090',
  '30000000-0000-4000-8000-000000000090','r2','genova-private','090/comment',16,
  'audio/wav',repeat('c',64),'comment.wav'
);
insert into public.repertoire_song_comments(
  id,choir_id,song_id,content_html,created_by,target_voice_group,
  audio_drive_file_id,audio_file_name,audio_mime_type,audio_file_version_id
) values (
  '70000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '50000000-0000-4000-8000-000000000090','<p>090</p>',
  '30000000-0000-4000-8000-000000000090','Soprano',
  'r2_comment_71000000-0000-4000-8000-000000000090','comment.wav','audio/wav',
  '71000000-0000-4000-8000-000000000090'
);
insert into public.chat_rooms(id,choir_id,name,slug,type,created_by) values
  ('80000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
   '090 Room','090-room','custom','30000000-0000-4000-8000-000000000090');
insert into public.chat_room_members(choir_id,room_id,member_id,role) values
  ('20000000-0000-4000-8000-000000000090','80000000-0000-4000-8000-000000000090',
   '30000000-0000-4000-8000-000000000090','admin');
insert into public.chat_media_versions(
  id,choir_id,room_id,kind,batch_id,position,created_by,provider,bucket,object_key,
  content_length,mime_type,sha256_hex,file_name,state
) values (
  '81000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '80000000-0000-4000-8000-000000000090','room-avatar',
  '82000000-0000-4000-8000-000000000090',0,'30000000-0000-4000-8000-000000000090',
  'r2','genova-private','090/avatar',16,'image/png',repeat('d',64),'avatar.png','active'
);
-- The private avatar alias is server-owned. Keep the 060 guard enabled and use
-- the same privileged writer identity that the production mutation uses.
set local role postgres;
update public.chat_rooms set avatar_media_version_id='81000000-0000-4000-8000-000000000090',
  avatar_url='r2_chat_81000000-0000-4000-8000-000000000090'
where id='80000000-0000-4000-8000-000000000090';
reset role;

do $test$
declare
  actor uuid:='10000000-0000-4000-8000-000000000090';
  session_a uuid:='11000000-0000-4000-8000-000000000090';
  session_b uuid:='11000000-0000-4000-8000-000000000091';
  target_actor uuid:='10000000-0000-4000-8000-000000000091';
  target_session uuid:='11000000-0000-4000-8000-000000000092';
  choir_a uuid:='20000000-0000-4000-8000-000000000090';
  choir_b uuid:='20000000-0000-4000-8000-000000000091';
  families text[]:=array['repertoire-file','assignment-file','assignment-review-file',
    'repertoire-comment-file','chat-media-file'];
  files uuid[]:=array[
    '51000000-0000-4000-8000-000000000090'::uuid,
    '62000000-0000-4000-8000-000000000090'::uuid,
    '63000000-0000-4000-8000-000000000090'::uuid,
    '71000000-0000-4000-8000-000000000090'::uuid,
    '81000000-0000-4000-8000-000000000090'::uuid];
  original_role text:=current_user;
  denied_role text;
begin
  if has_function_privilege('anon','public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)','EXECUTE')
    or has_function_privilege('authenticated','public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)','EXECUTE')
    or not has_function_privilege('service_role','public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)','EXECUTE') then
    raise exception '090 RPC privilege boundary failed';
  end if;
  -- Execute, rather than infer from ACL predicates. Do not catch a failed role
  -- switch as a successful RPC refusal. All five families must refuse both roles.
  foreach denied_role in array array['anon','authenticated'] loop
    execute format('set local role %I',denied_role);
    if current_user<>denied_role then
      raise exception '090 caller identity switch failed';
    end if;
    for i in 1..5 loop
      begin
        perform public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i]);
        raise exception '090 % unexpectedly executed % RPC',denied_role,families[i];
      exception when insufficient_privilege then
        null;
      end;
    end loop;
    execute format('set local role %I',original_role);
  end loop;
  set local role service_role;
  if current_user<>'service_role' then
    raise exception '090 service caller identity switch failed';
  end if;
  for i in 1..5 loop
    if not public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i])
      or public.private_file_ticket_authorized_090(actor,session_a,choir_b,families[i],files[i])
      or public.private_file_ticket_authorized_090(actor,session_b,choir_a,families[i],files[i])
      or public.private_file_ticket_authorized_090('10000000-0000-4000-8000-000000000091',session_a,choir_a,families[i],files[i]) then
      raise exception '090 family % crossed actor/session/choir',families[i];
    end if;
  end loop;
  if public.private_file_ticket_authorized_090(actor,session_a,choir_a,'unknown',files[1]) then
    raise exception '090 unknown family accepted';
  end if;
  execute format('set local role %I',original_role);
  raise notice '090 actual RPC callers PASS: service_role five-family allow/deny; anon/authenticated ten execution denials';

  if not public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[1],files[1])
    or not public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[2],files[2])
    or not public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[3],files[3])
    or not public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[4],files[4])
    or public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[5],files[5]) then
    raise exception '090 ordinary member family visibility matrix failed';
  end if;
  update public.repertoire set is_visible=false where id='50000000-0000-4000-8000-000000000090';
  if public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[1],files[1]) then
    raise exception '090 hidden song file stayed visible';
  end if;
  update public.repertoire set is_visible=true where id='50000000-0000-4000-8000-000000000090';
  update public.repertoire_song_comments set is_hidden=true
    where id='70000000-0000-4000-8000-000000000090';
  if public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[4],files[4]) then
    raise exception '090 hidden comment stayed visible';
  end if;
  update public.repertoire_song_comments set is_hidden=false
    where id='70000000-0000-4000-8000-000000000090';
  update public.assignment_submissions set is_reviewer_note_hidden=true
    where id='61000000-0000-4000-8000-000000000090';
  if public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[3],files[3]) then
    raise exception '090 hidden review stayed visible';
  end if;
  update public.assignment_submissions set is_reviewer_note_hidden=false
    where id='61000000-0000-4000-8000-000000000090';
  delete from auth.sessions where id=target_session;
  for i in 1..5 loop
    if public.private_file_ticket_authorized_090(target_actor,target_session,choir_a,families[i],files[i]) then
      raise exception '090 deleted Auth session retained %',families[i];
    end if;
  end loop;

  update genova_005.active_choir_sessions set choir_id=choir_b where session_id=session_a;
  for i in 1..5 loop
    if public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i]) then
      raise exception '090 switched session retained %',families[i];
    end if;
  end loop;
  update genova_005.active_choir_sessions set choir_id=choir_a where session_id=session_a;
  delete from public.choir_member_roles where member_id='30000000-0000-4000-8000-000000000090';
  for i in 1..4 loop
    if public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i]) then
      raise exception '090 removed role retained %',families[i];
    end if;
  end loop;
  -- The existing tenant-link trigger must reject a malformed cross-choir role.
  insert into public.roles(id,choir_id,name) values
    ('40000000-0000-4000-8000-000000000091',choir_b,'Şef');
  begin
    insert into public.choir_member_roles(choir_id,member_id,role_id) values
      (choir_a,'30000000-0000-4000-8000-000000000090',
        '40000000-0000-4000-8000-000000000091');
    raise exception '090 tenant-link trigger allowed a foreign-choir role';
  exception when check_violation then
    null;
  end;
  for i in 1..4 loop
    if public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i]) then
      raise exception '090 foreign-choir role elevated %',families[i];
    end if;
  end loop;
  if not public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[5],files[5]) then
    raise exception '090 room membership depended on unrelated choir role';
  end if;
  delete from public.chat_room_members where room_id='80000000-0000-4000-8000-000000000090';
  if public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[5],files[5]) then
    raise exception '090 removed room membership retained avatar';
  end if;
  update public.choir_members set is_active=false where id='30000000-0000-4000-8000-000000000090';
  for i in 1..5 loop
    if public.private_file_ticket_authorized_090(actor,session_a,choir_a,families[i],files[i]) then
      raise exception '090 inactive membership retained %',families[i];
    end if;
  end loop;
end;
$test$;

rollback;
