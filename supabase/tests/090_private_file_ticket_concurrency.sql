-- Run only against the named disposable clone of genova_068_test_restore.
-- The peer transaction overlaps each read; a new statement after peer COMMIT
-- must reject an already-issued ticket's authority identity.
do $preflight$
begin
  if current_database() <> 'genova_090_concurrency_test'
    or to_regprocedure('public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)') is null
    or to_regclass('auth.sessions') is null then
    raise exception '090 concurrency fixture requires the exact disposable database and migration';
  end if;
end
$preflight$;

create extension if not exists dblink;

insert into auth.users(id) values ('10000000-0000-4000-8000-000000000093');
insert into auth.sessions(id,user_id) values
  ('11000000-0000-4000-8000-000000000093','10000000-0000-4000-8000-000000000093');
insert into public.choirs(id,slug,name) values
  ('20000000-0000-4000-8000-000000000093','090-concurrent-a','090 concurrent A'),
  ('20000000-0000-4000-8000-000000000094','090-concurrent-b','090 concurrent B');
insert into public.choir_members(
  id,choir_id,auth_user_id,first_name,last_name,voice_group,join_date
) values
  ('30000000-0000-4000-8000-000000000093','20000000-0000-4000-8000-000000000093',
    '10000000-0000-4000-8000-000000000093','Concurrent','A','Alto',current_date),
  ('30000000-0000-4000-8000-000000000094','20000000-0000-4000-8000-000000000094',
    '10000000-0000-4000-8000-000000000093','Concurrent','B','Alto',current_date);
insert into public.roles(id,choir_id,name) values
  ('40000000-0000-4000-8000-000000000093','20000000-0000-4000-8000-000000000093','Şef');
insert into public.choir_member_roles(choir_id,member_id,role_id) values
  ('20000000-0000-4000-8000-000000000093','30000000-0000-4000-8000-000000000093',
    '40000000-0000-4000-8000-000000000093');
insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id) values
  ('11000000-0000-4000-8000-000000000093','10000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093');
insert into public.repertoire(id,choir_id,title,is_visible) values
  ('50000000-0000-4000-8000-000000000093','20000000-0000-4000-8000-000000000093',
    '090 concurrent score',true);
insert into public.repertoire_files(
  id,choir_id,song_id,file_name,file_type,drive_file_id,mime_type
) values (
  '51000000-0000-4000-8000-000000000093','20000000-0000-4000-8000-000000000093',
  '50000000-0000-4000-8000-000000000093','score.pdf','sheet','090-concurrent',
  'application/pdf'
);

select dblink_connect('090_peer','dbname=genova_090_concurrency_test');

do $check$
begin
  if not public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 initial A authorization missing';
  end if;
end
$check$;

-- A request that starts while the switch is uncommitted may still see A.
select dblink_exec('090_peer','begin');
select dblink_exec('090_peer',
  'update genova_005.active_choir_sessions set choir_id=' ||
  quote_literal('20000000-0000-4000-8000-000000000094') ||
  ' where session_id=' || quote_literal('11000000-0000-4000-8000-000000000093'));
do $check$
begin
  if not public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 uncommitted switch altered the visible snapshot';
  end if;
end
$check$;
select dblink_exec('090_peer','commit');
do $check$
begin
  if public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 post-commit switch retained A authority';
  end if;
end
$check$;

select dblink_exec('090_peer',
  'update genova_005.active_choir_sessions set choir_id=' ||
  quote_literal('20000000-0000-4000-8000-000000000093') ||
  ' where session_id=' || quote_literal('11000000-0000-4000-8000-000000000093'));

-- Role removal is likewise visible only after its transaction commits.
select dblink_exec('090_peer','begin');
select dblink_exec('090_peer',
  'delete from public.choir_member_roles where member_id=' ||
  quote_literal('30000000-0000-4000-8000-000000000093'));
do $check$
begin
  if not public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 uncommitted role removal altered the visible snapshot';
  end if;
end
$check$;
select dblink_exec('090_peer','commit');
do $check$
begin
  if public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 post-commit role removal retained A authority';
  end if;
end
$check$;

select dblink_exec('090_peer',
  'insert into public.choir_member_roles(choir_id,member_id,role_id) values (' ||
  quote_literal('20000000-0000-4000-8000-000000000093') || ',' ||
  quote_literal('30000000-0000-4000-8000-000000000093') || ',' ||
  quote_literal('40000000-0000-4000-8000-000000000093') || ')');

-- Membership removal does not race into a statement that started before commit.
select dblink_exec('090_peer','begin');
select dblink_exec('090_peer',
  'update public.choir_members set is_active=false where id=' ||
  quote_literal('30000000-0000-4000-8000-000000000093'));
do $check$
begin
  if not public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 uncommitted membership removal altered the visible snapshot';
  end if;
end
$check$;
select dblink_exec('090_peer','commit');
do $check$
begin
  if public.private_file_ticket_authorized_090(
    '10000000-0000-4000-8000-000000000093',
    '11000000-0000-4000-8000-000000000093',
    '20000000-0000-4000-8000-000000000093',
    'repertoire-file','51000000-0000-4000-8000-000000000093') then
    raise exception '090 post-commit membership removal retained A authority';
  end if;
end
$check$;

select dblink_disconnect('090_peer');
