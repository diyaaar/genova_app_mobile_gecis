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
  ('50000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','090 Song',true),
  ('50000000-0000-4000-8000-000000000091','20000000-0000-4000-8000-000000000091','090 B Song',true);
insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,drive_file_id,mime_type) values
  ('51000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','50000000-0000-4000-8000-000000000090','score.pdf','sheet','legacy_repertoire','application/pdf'),
  ('51000000-0000-4000-8000-000000000091','20000000-0000-4000-8000-000000000091','50000000-0000-4000-8000-000000000091','b-score.pdf','sheet','legacy_repertoire','application/pdf');
insert into public.song_assignments(choir_id,song_id,member_id,assigned_by,part_name) values
  ('20000000-0000-4000-8000-000000000090','50000000-0000-4000-8000-000000000090',
   '30000000-0000-4000-8000-000000000092','30000000-0000-4000-8000-000000000090','Soprano'),
  ('20000000-0000-4000-8000-000000000091','50000000-0000-4000-8000-000000000091',
   '30000000-0000-4000-8000-000000000091','30000000-0000-4000-8000-000000000091','Alto');
insert into public.assignments(id,choir_id,title,description,created_by,is_active,is_locked) values
  ('60000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090','090 Task','Synthetic','30000000-0000-4000-8000-000000000090',true,false);
insert into public.assignment_submissions(
  id,choir_id,assignment_id,member_id,drive_file_id,file_name,mime_type,
  reviewer_audio_drive_file_id,reviewer_audio_file_name,reviewer_audio_mime_type
) values (
  '61000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '60000000-0000-4000-8000-000000000090','30000000-0000-4000-8000-000000000092',
  'legacy_submission','take.wav','audio/wav',
  'legacy_review','review.wav','audio/wav'
);

insert into public.assignment_submission_private_notes(
  submission_id,choir_id,assignment_id,member_id,reviewer_audio_drive_file_id,
  reviewer_audio_file_name,reviewer_audio_mime_type
) values ('61000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '60000000-0000-4000-8000-000000000090','30000000-0000-4000-8000-000000000092',
  'legacy_review','review.wav','audio/wav');
insert into public.repertoire_song_comments(
  id,choir_id,song_id,content_html,created_by,target_voice_group,
  audio_drive_file_id,audio_file_name,audio_mime_type
) values ('70000000-0000-4000-8000-000000000090','20000000-0000-4000-8000-000000000090',
  '50000000-0000-4000-8000-000000000090','<p>090 legacy</p>',
  '30000000-0000-4000-8000-000000000090','Soprano','legacy_comment','comment.wav','audio/wav');

-- Every behavior assertion invokes the real public RPC AS service_role, not as owner.
create function pg_temp.expect_legacy(
  alias text, allowed boolean, actor uuid default '10000000-0000-4000-8000-000000000090',
  session_id uuid default '11000000-0000-4000-8000-000000000090',
  choir uuid default '20000000-0000-4000-8000-000000000090',
  kind text default null, resource uuid default null
) returns void language plpgsql security invoker as $assert$
declare got jsonb; original_role text:=current_user;
begin
  set local role service_role;
  if current_user<>'service_role' then raise exception 'Legacy caller switch failed'; end if;
  got:=public.resolve_legacy_file_090(actor,session_id,choir,alias,kind,resource);
  execute format('set local role %I',original_role);
  if (got is not null) is distinct from allowed then
    raise exception 'Legacy alias % expected %',alias,allowed;
  end if;
end;
$assert$;

do $test$
declare role_name text; alias text; original_role text:=current_user;
begin
  foreach role_name in array array['anon','authenticated'] loop
    execute format('set local role %I',role_name);
    if current_user<>role_name then raise exception 'Legacy caller identity failed'; end if;
    begin
      perform public.resolve_legacy_file_090(
        '10000000-0000-4000-8000-000000000090','11000000-0000-4000-8000-000000000090',
        '20000000-0000-4000-8000-000000000090','legacy_repertoire');
      raise exception 'Legacy % unexpectedly executed RPC',role_name;
    exception when insufficient_privilege then null; end;
    execute format('set local role %I',original_role);
  end loop;
  foreach alias in array array['legacy_repertoire','legacy_submission','legacy_review','legacy_comment'] loop
    perform pg_temp.expect_legacy(alias,true);
    perform pg_temp.expect_legacy(alias,false,choir=>'20000000-0000-4000-8000-000000000091');
    perform pg_temp.expect_legacy(alias,false,session_id=>'11000000-0000-4000-8000-000000000091');
    perform pg_temp.expect_legacy(alias,false,actor=>'10000000-0000-4000-8000-000000000091');
  end loop;
  perform pg_temp.expect_legacy('missing',false);
  perform pg_temp.expect_legacy('legacy_repertoire',true,
    session_id=>'11000000-0000-4000-8000-000000000091',choir=>'20000000-0000-4000-8000-000000000091',
    kind=>'repertoire',resource=>'51000000-0000-4000-8000-000000000091');
  perform pg_temp.expect_legacy('legacy_repertoire',false,kind=>'repertoire',
    resource=>'51000000-0000-4000-8000-000000000091');
  update public.repertoire_song_comments set audio_drive_file_id='legacy_repertoire'
    where id='70000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_repertoire',false);
  update public.repertoire_song_comments set audio_drive_file_id='legacy_comment'
    where id='70000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_repertoire',false,kind=>'submission',
    resource=>'51000000-0000-4000-8000-000000000090');
  perform pg_temp.expect_legacy('legacy_repertoire',true,kind=>'repertoire',
    resource=>'51000000-0000-4000-8000-000000000090');
  -- Public/private mirrored review is ONE public resource, not an ambiguity.
  perform pg_temp.expect_legacy('legacy_review',true,kind=>'review',
    resource=>'61000000-0000-4000-8000-000000000090');
  perform pg_temp.expect_legacy('legacy_review',false,kind=>'private-review',
    resource=>'61000000-0000-4000-8000-000000000090');
  foreach alias in array array['legacy_repertoire','legacy_submission','legacy_review','legacy_comment'] loop
    perform pg_temp.expect_legacy(alias,true,
      actor=>'10000000-0000-4000-8000-000000000091',session_id=>'11000000-0000-4000-8000-000000000092');
  end loop;
  -- Unexpected stale public metadata must not defeat the explicit hidden flag.
  update public.assignment_submissions set is_reviewer_note_hidden=true
    where id='61000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_review',false,
    actor=>'10000000-0000-4000-8000-000000000091',session_id=>'11000000-0000-4000-8000-000000000092');
  update public.assignment_submissions set is_reviewer_note_hidden=true,
    reviewer_audio_drive_file_id=null,reviewer_audio_file_name=null,reviewer_audio_mime_type=null
    where id='61000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_review',false,kind=>'review',
    resource=>'61000000-0000-4000-8000-000000000090');
  perform pg_temp.expect_legacy('legacy_review',true,kind=>'private-review',
    resource=>'61000000-0000-4000-8000-000000000090');
  perform pg_temp.expect_legacy('legacy_review',false,
    actor=>'10000000-0000-4000-8000-000000000091',session_id=>'11000000-0000-4000-8000-000000000092');
  update public.repertoire_song_comments set is_hidden=true where audio_drive_file_id='legacy_comment';
  perform pg_temp.expect_legacy('legacy_comment',false,
    actor=>'10000000-0000-4000-8000-000000000091',session_id=>'11000000-0000-4000-8000-000000000092');
  perform pg_temp.expect_legacy('legacy_comment',true);
  update public.repertoire set is_visible=false where id='50000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_repertoire',false,
    actor=>'10000000-0000-4000-8000-000000000091',session_id=>'11000000-0000-4000-8000-000000000092');
  delete from public.choir_member_roles where member_id='30000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_review',false);
  perform pg_temp.expect_legacy('legacy_submission',false);
  -- Grant section leadership, only within current voice scope.
  insert into public.roles(id,choir_id,name) values(
    '40000000-0000-4000-8000-000000000091','20000000-0000-4000-8000-000000000090','Partisyon Şefi');
  insert into public.choir_member_roles(choir_id,member_id,role_id) values(
    '20000000-0000-4000-8000-000000000090','30000000-0000-4000-8000-000000000090','40000000-0000-4000-8000-000000000091');
  perform pg_temp.expect_legacy('legacy_submission',false);
  update public.choir_members set voice_group='Soprano' where id='30000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_submission',true);
  perform pg_temp.expect_legacy('legacy_review',true);
  -- Storage must be tied to the actual assignment/member prefix, not any trusted-looking URI.
  update public.assignment_submissions set drive_download_link=
    'storage://assignment-submissions/60000000-0000-4000-8000-000000000090/30000000-0000-4000-8000-000000000092/take.wav';
  perform pg_temp.expect_legacy('legacy_submission',true);
  update public.assignment_submissions set drive_download_link='storage://assignment-submissions/other-tenant/file.wav';
  perform pg_temp.expect_legacy('legacy_submission',false);
  update public.assignment_submissions set drive_download_link=null;
  update public.assignment_submissions set drive_file_id='replaced_submission';
  perform pg_temp.expect_legacy('legacy_submission',false,kind=>'submission',
    resource=>'61000000-0000-4000-8000-000000000090');
  perform pg_temp.expect_legacy('replaced_submission',true);
  update public.assignment_submissions set drive_file_id='legacy_submission';
  update public.repertoire_song_comments set is_hidden=false where audio_drive_file_id='legacy_comment';
  perform pg_temp.expect_legacy('legacy_comment',true);
  delete from public.repertoire_song_comments where audio_drive_file_id='legacy_comment';
  perform pg_temp.expect_legacy('legacy_comment',false);
  -- Explicit selection change revokes an existing A ticket, independent of membership count.
  update genova_005.active_choir_sessions set choir_id='20000000-0000-4000-8000-000000000091'
    where session_id='11000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_submission',false);
  update genova_005.active_choir_sessions set choir_id='20000000-0000-4000-8000-000000000090'
    where session_id='11000000-0000-4000-8000-000000000090';
  update public.choir_members set is_active=false where id='30000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_submission',false);
  update public.choir_members set is_active=true where id='30000000-0000-4000-8000-000000000090';
  update auth.sessions set not_after=now()-interval '1 minute' where id='11000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_submission',false);
  update auth.sessions set not_after=null where id='11000000-0000-4000-8000-000000000090';
  delete from auth.sessions where id='11000000-0000-4000-8000-000000000090';
  perform pg_temp.expect_legacy('legacy_submission',false);
  raise notice '090 LEGACY actual callers/tenant/session/roles/visibility/storage PASS';
end;
$test$;
rollback;
