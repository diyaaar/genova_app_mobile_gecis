-- LOCAL DISPOSABLE PG17 ONLY. Real RPC/RLS; no HTTP/Auth mail/provider acceptance.
begin;
create temporary table identities_085(label text primary key, uid uuid default gen_random_uuid(),
  sid uuid default gen_random_uuid(), email text);
insert into identities_085(label,email) values
  ('operator','operator-085@example.invalid'),('founderA','founder-a-085@example.invalid'),
  ('founderB','founder-b-085@example.invalid'),('shared','shared-085@example.invalid'),
  ('wrong','wrong-085@example.invalid');
insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,created_at,updated_at)
  select uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    email,now(),now(),now() from identities_085;
insert into auth.sessions(id,user_id,created_at,updated_at)
  select sid,uid,now(),now() from identities_085;
insert into genova_007.platform_operators(auth_user_id)
  select uid from identities_085 where label='operator';
create temporary table choirs_085(label text primary key, choir_id uuid, founder_id uuid,
  song_id uuid default gen_random_uuid(), school_id uuid default gen_random_uuid(),
  department_id uuid default gen_random_uuid(), request_id uuid default gen_random_uuid());
create temporary table results_085(label text primary key, data jsonb);
create temporary table snapshots_085(label text primary key, digest text);
grant select on identities_085 to authenticated;
grant select,insert on choirs_085,results_085 to authenticated;

create function pg_temp.login_085(label text) returns void language plpgsql as $$
declare identity identities_085;
begin
  select * into strict identity from identities_085 i where i.label=$1;
  perform set_config('request.jwt.claims',json_build_object('sub',identity.uid,
    'role','authenticated','session_id',identity.sid)::text,true);
  perform set_config('request.jwt.claim.sub',identity.uid::text,true);
end;
$$;
create function pg_temp.assert_085(ok boolean, message text) returns void language plpgsql as $$
begin if ok is not true then raise exception '085: %',message; end if; end;
$$;
-- Execute a negative operation in a subtransaction. Unexpected success fails the test.
create function pg_temp.refuse_085(statement text, expected text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate=expected then return; end if;
    raise;
  end;
  raise exception '085: expected SQLSTATE %',expected;
end;
$$;
-- Called only as postgres to compare complete synthetic state across both tenants.
create function pg_temp.digest_085() returns text language sql as $$
  select md5(concat_ws('|',
    (select jsonb_agg(to_jsonb(x) order by id)::text from public.choir_members x
      where choir_id in (select choir_id from choirs_085)),
    (select jsonb_agg(to_jsonb(x) order by member_id,role_id)::text from public.choir_member_roles x
      where choir_id in (select choir_id from choirs_085)),
    (select jsonb_agg(to_jsonb(x) order by id)::text from public.profile_change_requests x
      where choir_id in (select choir_id from choirs_085)),
    (select jsonb_agg(to_jsonb(x) order by id)::text from public.repertoire x
      where choir_id in (select choir_id from choirs_085)),
    (select jsonb_agg(to_jsonb(x) order by song_id,member_id)::text from public.song_assignments x
      where choir_id in (select choir_id from choirs_085)),
    (select jsonb_agg(to_jsonb(x) order by id)::text from genova_008.invitations x
      where choir_id in (select choir_id from choirs_085))));
$$;

set local role authenticated;
select pg_temp.login_085('operator');
insert into choirs_085(label,choir_id,founder_id)
  select 'A',choir_id,member_id from public.create_operator_choir(
    'Independent Alpha 085','fixture-085-alpha',
    (select uid from identities_085 where label='founderA'),'Founder','Alpha');
insert into choirs_085(label,choir_id,founder_id)
  select 'B',choir_id,member_id from public.create_operator_choir(
    'Independent Beta 085','fixture-085-beta',
    (select uid from identities_085 where label='founderB'),'Founder','Beta');
reset role;
select pg_temp.assert_085((select count(distinct choir_id)=2 from choirs_085),'distinct fresh choirs');
select pg_temp.assert_085(not exists(select 1 from public.schools
  where choir_id in (select choir_id from choirs_085)),'catalog must start empty');

-- Production 008 commands, not direct member/role fixture inserts for the recipient.
set local role authenticated;
select pg_temp.login_085('founderA');
insert into results_085 values ('inviteA',public.choir_invitation_command('create',
  jsonb_build_object('choirId',(select choir_id from choirs_085 where label='A'),
    'email','shared-085@example.invalid','firstName','Shared','lastName','Alpha','voiceGroup','Alto')));
select pg_temp.login_085('founderB');
insert into results_085 values ('inviteB',public.choir_invitation_command('create',
  jsonb_build_object('choirId',(select choir_id from choirs_085 where label='B'),
    'email','shared-085@example.invalid','firstName','Shared','lastName','Beta','voiceGroup','Bass')));
select pg_temp.login_085('wrong');
select pg_temp.refuse_085(format('select public.choir_invitation_command(''accept'',%L::jsonb)',
  jsonb_build_object('token',(select data->>'token' from results_085 where label='inviteA'))),'22023');
select pg_temp.login_085('shared');
insert into results_085 values ('memberA',public.choir_invitation_command('accept',
  jsonb_build_object('token',(select data->>'token' from results_085 where label='inviteA'))));
insert into results_085 values ('memberB',public.choir_invitation_command('accept',
  jsonb_build_object('token',(select data->>'token' from results_085 where label='inviteB'))));
select pg_temp.refuse_085(format('select public.choir_invitation_command(''accept'',%L::jsonb)',
  jsonb_build_object('token',(select data->>'token' from results_085 where label='inviteB'))),'22023');
reset role;
select pg_temp.assert_085((select count(*)=2 from public.choir_members
  where auth_user_id=(select uid from identities_085 where label='shared')),'two invited memberships');
select pg_temp.assert_085((select count(*)=2 from public.choir_member_roles mr
  join public.roles r on r.id=mr.role_id where r.name='Korist'
    and mr.member_id in (select (data->>'memberId')::uuid from results_085 where label like 'member%')),
  'accepted role is Korist in each choir');
select pg_temp.assert_085(not exists(select 1 from genova_008.invitations i
  join results_085 r on i.token_hash=r.data->>'token'),'raw invitation token must not persist');

-- Manual/service-backed steps today: provision fresh catalogs and profile request rows.
insert into public.schools(id,choir_id,name) select school_id,choir_id,'Same School Name' from choirs_085;
insert into public.departments(id,choir_id,name)
  select department_id,choir_id,'Same Department Name' from choirs_085;
insert into public.profile_change_requests(id,choir_id,member_id,changes_json,previous_values_json,status)
  select c.request_id,c.choir_id,(r.data->>'memberId')::uuid,
    jsonb_build_object('school_id',c.school_id,'department_id',c.department_id), '{}','pending'
  from choirs_085 c join results_085 r on r.label='member'||c.label;
update public.choir_members m set school_id=c.school_id,department_id=c.department_id
  from choirs_085 c where m.choir_id=c.choir_id
    and m.auth_user_id=(select uid from identities_085 where label='shared');
select pg_temp.refuse_085(format('update public.choir_members set school_id=%L where id=%L',
  (select school_id from choirs_085 where label='B'),
  (select data->>'memberId' from results_085 where label='memberA')),'23514');

-- Founders use authenticated RLS insert and actual atomic assignment RPC.
set local role authenticated;
select pg_temp.login_085('founderA');
insert into public.repertoire(id,choir_id,title,is_visible)
  select song_id,choir_id,'Same Song Title',true from choirs_085 where label='A';
select * from public.replace_repertoire_assignments(
  (select song_id from choirs_085 where label='A'),'Alto',
  array[(select (data->>'memberId')::uuid from results_085 where label='memberA')],array[]::uuid[]);
select pg_temp.login_085('founderB');
insert into public.repertoire(id,choir_id,title,is_visible)
  select song_id,choir_id,'Same Song Title',true from choirs_085 where label='B';
select * from public.replace_repertoire_assignments(
  (select song_id from choirs_085 where label='B'),'Bass',
  array[(select (data->>'memberId')::uuid from results_085 where label='memberB')],array[]::uuid[]);
select pg_temp.assert_085((select added_member_ids=array[]::uuid[]
  from public.replace_repertoire_assignments((select song_id from choirs_085 where label='B'),'Bass',
    array[(select (data->>'memberId')::uuid from results_085 where label='memberB')],array[]::uuid[])),
  'B retry must be idempotent');

select pg_temp.login_085('shared');
select public.set_active_choir((select choir_id from choirs_085 where label='A'));
select pg_temp.assert_085((select array_agg(id) from public.repertoire)=
  array[(select song_id from choirs_085 where label='A')],'A repertoire read isolation');
select pg_temp.assert_085((select array_agg(id) from public.schools)=
  array[(select school_id from choirs_085 where label='A')],'A catalog read isolation');
select pg_temp.assert_085((select array_agg(id) from public.profile_change_requests)=
  array[(select request_id from choirs_085 where label='A')],'A profile request isolation');
select pg_temp.assert_085((select array_agg(member_id) from public.song_assignments)=
  array[(select (data->>'memberId')::uuid from results_085 where label='memberA')],'A assignment read');
select public.set_active_choir((select choir_id from choirs_085 where label='B'));
select pg_temp.assert_085((select array_agg(id) from public.repertoire)=
  array[(select song_id from choirs_085 where label='B')],'B repertoire read isolation');
select pg_temp.assert_085((select array_agg(id) from public.schools)=
  array[(select school_id from choirs_085 where label='B')],'B catalog read isolation');
select pg_temp.assert_085((select array_agg(id) from public.profile_change_requests)=
  array[(select request_id from choirs_085 where label='B')],'B profile request isolation');
select pg_temp.assert_085((select array_agg(member_id) from public.song_assignments)=
  array[(select (data->>'memberId')::uuid from results_085 where label='memberB')],'B assignment read');

-- Fixture-only role administration: promote shared member to chef in both choirs,
-- so wrong-object refusal cannot be attributed just to missing management permission.
reset role;
insert into public.choir_member_roles(choir_id,member_id,role_id)
  select c.choir_id,(r.data->>'memberId')::uuid,role.id from choirs_085 c
  join results_085 r on r.label='member'||c.label
  join public.roles role on role.choir_id=c.choir_id and role.name='Şef';
insert into snapshots_085 values('beforeForeign',pg_temp.digest_085());
set local role authenticated;
select pg_temp.assert_085(public.current_member_has_role('Şef'),'shared B chef positive control');
select pg_temp.refuse_085(format('select public.replace_repertoire_assignments(%L,''Alto'',%L::uuid[],%L::uuid[])',
  (select song_id from choirs_085 where label='A'),
  array[(select data->>'memberId' from results_085 where label='memberA')],
  array[(select data->>'memberId' from results_085 where label='memberA')]),'P0002');
select pg_temp.refuse_085(format('select public.replace_repertoire_assignments(%L,''Bass'',%L::uuid[],%L::uuid[])',
  (select song_id from choirs_085 where label='B'),
  array[(select data->>'memberId' from results_085 where label='memberA')],
  array[(select data->>'memberId' from results_085 where label='memberB')]),'22023');
do $$ declare changed integer;
begin
  update public.repertoire set title='WRONG CHOIR' where id=(select song_id from choirs_085 where label='A');
  get diagnostics changed=row_count;
  perform pg_temp.assert_085(changed=0,'old A update in B changed a row');
  delete from public.repertoire where id=(select song_id from choirs_085 where label='A');
  get diagnostics changed=row_count;
  perform pg_temp.assert_085(changed=0,'old A delete in B changed a row');
  update public.profile_change_requests set status='rejected'
    where id=(select request_id from choirs_085 where label='A');
  get diagnostics changed=row_count;
  perform pg_temp.assert_085(changed=0,'old A profile review in B changed a row');
end; $$;
select pg_temp.refuse_085(format('select public.choir_invitation_command(''list'',%L::jsonb)',
  jsonb_build_object('choirId',(select choir_id from choirs_085 where label='A'))),'42501');
reset role;
select pg_temp.assert_085(pg_temp.digest_085()=(select digest from snapshots_085 where label='beforeForeign'),
  'foreign/delayed requests changed either choir');

-- Removing only B chef authority must not inherit A's chef role.
delete from public.choir_member_roles mr using public.roles role
  where mr.role_id=role.id and role.name='Şef'
    and mr.member_id=(select (data->>'memberId')::uuid from results_085 where label='memberB');
insert into snapshots_085 values('afterDemotion',pg_temp.digest_085());
set local role authenticated;
select pg_temp.assert_085(not public.current_member_has_role('Şef'),'B inherited A chef role');
select pg_temp.refuse_085(format('select public.replace_repertoire_assignments(%L,''Bass'',%L::uuid[],%L::uuid[])',
  (select song_id from choirs_085 where label='B'),array[]::uuid[],
  array[(select data->>'memberId' from results_085 where label='memberB')]),'42501');
reset role;
select pg_temp.assert_085(pg_temp.digest_085()=(select digest from snapshots_085 where label='afterDemotion'),
  'demoted request changed either choir');
update public.choir_members set is_active=false
  where id=(select (data->>'memberId')::uuid from results_085 where label='memberB');
insert into snapshots_085 values('afterRevocation',pg_temp.digest_085());
set local role authenticated;
select pg_temp.assert_085(public.current_choir_id() is null,'revoked selected B fell back to active A');
select pg_temp.assert_085((select count(*) from public.repertoire)=0
  and (select count(*) from public.profile_change_requests)=0,'revoked B retained data access');
select pg_temp.refuse_085(format('select public.replace_repertoire_assignments(%L,''Alto'',%L::uuid[],%L::uuid[])',
  (select song_id from choirs_085 where label='A'),array[]::uuid[],
  array[(select data->>'memberId' from results_085 where label='memberA')]),'42501');
reset role;
select pg_temp.assert_085(pg_temp.digest_085()=(select digest from snapshots_085 where label='afterRevocation'),
  'revoked request changed either choir');
set local role authenticated;
select public.set_active_choir((select choir_id from choirs_085 where label='A'));
select pg_temp.assert_085(public.current_member_has_role('Şef'),'explicit reselect active A must work');
select pg_temp.assert_085((select count(*) from public.repertoire)=1,'explicit reselect A read');
reset role;
rollback;
