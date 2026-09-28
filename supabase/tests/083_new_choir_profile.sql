-- LOCAL PG17 CLONE ONLY. Two genuinely new 007 choirs; every fixture rolls back.
begin;
create temporary table fixture_083_choirs(label text primary key, choir_id uuid, founder_member_id uuid)
  on commit drop;
grant select, insert on fixture_083_choirs to authenticated;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
  email_confirmed_at,created_at,updated_at) values
 ('83000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','operator-083@example.invalid','',now(),now(),now()),
 ('83000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','founder-a-083@example.invalid','',now(),now(),now()),
 ('83000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','founder-b-083@example.invalid','',now(),now(),now()),
 ('83000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','shared-083@example.invalid','',now(),now(),now());
insert into genova_007.platform_operators(auth_user_id)
 values('83000000-0000-4000-8000-000000000001');

set role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"83000000-0000-4000-8000-000000000001","role":"authenticated","session_id":"83000000-0000-4000-8000-000000000011"}',true);
select set_config('request.jwt.claim.sub','83000000-0000-4000-8000-000000000001',true);
insert into fixture_083_choirs(label,choir_id,founder_member_id)
 select 'A',choir_id,member_id from public.create_operator_choir(
   'Fixture Choir Alpha','fixture-083-alpha','83000000-0000-4000-8000-000000000002','Founder','Alpha');
insert into fixture_083_choirs(label,choir_id,founder_member_id)
 select 'B',choir_id,member_id from public.create_operator_choir(
   'Fixture Choir Beta','fixture-083-beta','83000000-0000-4000-8000-000000000003','Founder','Beta');

set role postgres;
select set_config('request.jwt.claims','',true);
select set_config('request.jwt.claim.sub','',true);
do $setup$
declare a uuid := (select choir_id from fixture_083_choirs where label='A');
        b uuid := (select choir_id from fixture_083_choirs where label='B');
begin
  if a is null or b is null or a=b then raise exception '083: operator creation failed'; end if;
  if exists(select 1 from public.schools where choir_id in (a,b))
    or exists(select 1 from public.departments where choir_id in (a,b)) then
    raise exception '083: new choir unexpectedly has reference catalog';
  end if;
  insert into public.schools(id,choir_id,name) values
    ('a8100000-0000-4000-8000-000000000001',a,'Alpha School'),
    ('b8100000-0000-4000-8000-000000000001',b,'Beta School');
  insert into public.departments(id,choir_id,name) values
    ('a8200000-0000-4000-8000-000000000001',a,'Alpha Department'),
    ('b8200000-0000-4000-8000-000000000001',b,'Beta Department');
  insert into public.choir_members(id,choir_id,auth_user_id,email,first_name,last_name,
    voice_group,join_date,is_active) values
    ('a8300000-0000-4000-8000-000000000001',a,'83000000-0000-4000-8000-000000000004',
      'shared-083@example.invalid','Shared','Member','Alto',current_date,true),
    ('b8300000-0000-4000-8000-000000000001',b,'83000000-0000-4000-8000-000000000004',
      'shared-083@example.invalid','Shared','Member','Bass',current_date,true);
  insert into public.choir_member_roles(choir_id,member_id,role_id)
    select a,'a8300000-0000-4000-8000-000000000001',id from public.roles
      where choir_id=a and name='Korist';
  insert into public.choir_member_roles(choir_id,member_id,role_id)
    select b,'b8300000-0000-4000-8000-000000000001',id from public.roles
      where choir_id=b and name='Korist';
  insert into public.profile_change_requests(id,choir_id,member_id,changes_json,
    previous_values_json,status) values
    ('a8400000-0000-4000-8000-000000000001',a,
      'a8300000-0000-4000-8000-000000000001',
      '{"school_id":"a8100000-0000-4000-8000-000000000001","department_id":"a8200000-0000-4000-8000-000000000001"}',
      '{}','pending'),
    ('b8400000-0000-4000-8000-000000000001',b,
      'b8300000-0000-4000-8000-000000000001',
      '{"school_id":"b8100000-0000-4000-8000-000000000001","department_id":"b8200000-0000-4000-8000-000000000001"}',
      '{}','pending');
end $setup$;

set role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"83000000-0000-4000-8000-000000000004","role":"authenticated","session_id":"83000000-0000-4000-8000-000000000012"}',true);
select set_config('request.jwt.claim.sub','83000000-0000-4000-8000-000000000004',true);
do $unselected$
begin
  if public.current_choir_id() is not null
    or (select count(*) from public.schools)<>0
    or (select count(*) from public.departments)<>0 then
    raise exception '083: multi-choir account saw references without selection';
  end if;
end $unselected$;
select public.set_active_choir((select choir_id from fixture_083_choirs where label='A'));
do $alpha$
begin
  if (select array_agg(id) from public.schools) <> array['a8100000-0000-4000-8000-000000000001'::uuid]
    or (select array_agg(id) from public.departments) <> array['a8200000-0000-4000-8000-000000000001'::uuid]
    or (select array_agg(id) from public.profile_change_requests)
      <> array['a8400000-0000-4000-8000-000000000001'::uuid] then
    raise exception '083: Alpha reference/request isolation failed';
  end if;
end $alpha$;
select public.set_active_choir((select choir_id from fixture_083_choirs where label='B'));
do $beta$
begin
  if (select array_agg(id) from public.schools) <> array['b8100000-0000-4000-8000-000000000001'::uuid]
    or (select array_agg(id) from public.departments) <> array['b8200000-0000-4000-8000-000000000001'::uuid]
    or (select array_agg(id) from public.profile_change_requests)
      <> array['b8400000-0000-4000-8000-000000000001'::uuid] then
    raise exception '083: Beta reference/request isolation failed';
  end if;
end $beta$;

set role postgres;
do $approval$
declare a uuid := (select choir_id from fixture_083_choirs where label='A');
        b uuid := (select choir_id from fixture_083_choirs where label='B');
begin
  update public.choir_members set school_id='a8100000-0000-4000-8000-000000000001',
    department_id='a8200000-0000-4000-8000-000000000001'
    where id='a8300000-0000-4000-8000-000000000001' and choir_id=a;
  update public.choir_members set school_id='b8100000-0000-4000-8000-000000000001',
    department_id='b8200000-0000-4000-8000-000000000001'
    where id='b8300000-0000-4000-8000-000000000001' and choir_id=b;
  update public.profile_change_requests set status='approved',reviewed_at=now(),
    reviewed_by=(select founder_member_id from fixture_083_choirs where label='A')
    where id='a8400000-0000-4000-8000-000000000001' and choir_id=a;
  update public.profile_change_requests set status='approved',reviewed_at=now(),
    reviewed_by=(select founder_member_id from fixture_083_choirs where label='B')
    where id='b8400000-0000-4000-8000-000000000001' and choir_id=b;
  if (select count(*) from public.profile_change_requests where status='approved' and choir_id in (a,b))<>2
    then raise exception '083: own-choir approvals did not persist'; end if;
  begin
    update public.choir_members set school_id='b8100000-0000-4000-8000-000000000001'
      where id='a8300000-0000-4000-8000-000000000001';
    raise exception '083: cross-choir school accepted' using errcode='X8301';
  exception when sqlstate '23514' then null; end;
  begin
    update public.choir_members set department_id='a8200000-0000-4000-8000-000000000001'
      where id='b8300000-0000-4000-8000-000000000001';
    raise exception '083: cross-choir department accepted' using errcode='X8302';
  exception when sqlstate '23514' then null; end;
  begin
    insert into public.profile_change_requests(choir_id,member_id,changes_json,status)
      values(a,'b8300000-0000-4000-8000-000000000001','{}','pending');
    raise exception '083: cross-choir request member accepted' using errcode='X8303';
  exception when sqlstate '23514' then null; end;
end $approval$;

set role authenticated;
do $revocation$
begin
  if (select count(*) from public.schools)<>1 then
    raise exception '083: Beta selection lost unexpectedly'; end if;
end $revocation$;
set role postgres;
update public.choir_members set is_active=false
  where id='b8300000-0000-4000-8000-000000000001';
set role authenticated;
do $inactive$
begin
  if public.current_choir_id() is not null or (select count(*) from public.schools)<>0
    or (select count(*) from public.profile_change_requests)<>0 then
    raise exception '083: inactive selected membership retained profile access';
  end if;
end $inactive$;
rollback;
