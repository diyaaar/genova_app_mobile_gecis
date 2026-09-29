-- Runs against persistent synthetic fixture, all changes here roll back.
begin;
create function pg_temp.assert_087(ok boolean,label text) returns void language plpgsql as $$
begin if ok is not true then raise exception '087: %',label; end if; end $$;
create function pg_temp.refuse_087(statement text,code text) returns void language plpgsql as $$
begin
  begin execute statement; exception when others then if sqlstate=code then return; end if; raise; end;
  raise exception '087 expected SQLSTATE %',code;
end $$;
create function pg_temp.login_087(uid text default '87000000-0000-4000-8000-000000000001',sid text default '87000000-0000-4000-8000-000000000011')
returns void language sql as $$
 select set_config('request.jwt.claim.sub',uid,true);
 select set_config('request.jwt.claims',json_build_object('sub',uid,'role','authenticated','session_id',sid)::text,true);
$$;
create function pg_temp.profile_digest_087() returns text language sql as $$
 select md5(coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'')) from public.profile_change_requests x
 where choir_id in ('a8700000-0000-4000-8000-000000000001','b8700000-0000-4000-8000-000000000001');
$$;
create temp table results_087(label text primary key,data jsonb);
grant all on results_087 to authenticated;
set local role authenticated;
select pg_temp.login_087();
select pg_temp.refuse_087($s$select genova_087.normalize_changes('{}')$s$,'42501');
select pg_temp.refuse_087($s$insert into public.profile_change_requests(choir_id,member_id,changes_json)
 values('a8700000-0000-4000-8000-000000000001','a8700000-0000-4000-8000-000000000002','{"phone":"bypass"}')$s$,'42501');
select pg_temp.login_087('87000000-0000-4000-8000-000000000001','87000000-0000-4000-8000-000000000099');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"unselected"}',null)$s$,'42501');
select pg_temp.login_087('87000000-0000-4000-8000-000000000002','87000000-0000-4000-8000-000000000011');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"stolen session"}',null)$s$,'28000');
select pg_temp.login_087();
insert into results_087 values('created',public.submit_profile_change_request(
 'a8700000-0000-4000-8000-000000000001','{"about_text":"  new A  ","phone":15,"unknown":"discard"}','  note  '));
select pg_temp.assert_087((select data->>'mode'='created' from results_087 where label='created'),'create result');
-- Exact retry updates same ID, while unchanged member fields are removed from the request.
insert into results_087 values('updated',public.submit_profile_change_request(
 'a8700000-0000-4000-8000-000000000001','{"about_text":"other A","email":null}',null));
select pg_temp.assert_087((select data->>'mode'='updated' and data->>'id'=
 (select data->>'id' from results_087 where label='created') from results_087 where label='updated'),'merge same changed keys');
select pg_temp.assert_087(public.submit_profile_change_request(
 'a8700000-0000-4000-8000-000000000001','{"about_text":"before A"}',null)='{"mode":"unchanged"}'::jsonb,'unchanged');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('b8700000-0000-4000-8000-000000000001','{"about_text":"wrong"}',null)$s$,'PT409');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"school_id":"b8700000-0000-4000-8000-000000000004"}',null)$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"department_id":"b8700000-0000-4000-8000-000000000005"}',null)$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"favorite_song_id":"b8700000-0000-4000-8000-000000000006"}',null)$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"school_id":"bad"}',null)$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"unknown":"x","phone":15}',null)$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"x"}',repeat('n',1201))$s$,'22023');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"x"}',repeat(chr(128512),601))$s$,'22023');
select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001',
 '{"school_id":"a8700000-0000-4000-8000-000000000004","department_id":"a8700000-0000-4000-8000-000000000005","favorite_song_id":"a8700000-0000-4000-8000-000000000006"}',null);
select public.set_active_choir('b8700000-0000-4000-8000-000000000001');
select public.submit_profile_change_request('b8700000-0000-4000-8000-000000000001','{"about_text":"new B"}',null);
select pg_temp.login_087('87000000-0000-4000-8000-000000000001',null);
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"x"}',null)$s$,'28000');
select pg_temp.login_087('87000000-0000-4000-8000-000000000002','87000000-0000-4000-8000-000000000013');
select pg_temp.assert_087(public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"phone":"singleton"}',null)->>'mode'='created','single fallback');
reset role;
select pg_temp.assert_087((select count(*)=1 from genova_005.active_choir_sessions
 where session_id='87000000-0000-4000-8000-000000000013'),'fallback materialized');
select pg_temp.assert_087((select count(*)=1 from public.profile_change_requests
 where member_id='a8700000-0000-4000-8000-000000000002' and changes_json='{"about_text":"other A"}'::jsonb
 and previous_values_json='{"about_text":"before A"}'::jsonb),'exact own snapshot and normalization');
select pg_temp.assert_087(genova_087.normalize_changes(jsonb_build_object('phone',chr(160)||'x'||chr(65279),'email',' ','about_text',null))=
 '{"phone":"x","email":null,"about_text":null}'::jsonb,'JS whitespace/null equivalence');
update public.choir_members set is_active=false where id='b8700000-0000-4000-8000-000000000002';
insert into results_087 values('digest',to_jsonb(pg_temp.profile_digest_087()));
set local role authenticated;
select pg_temp.login_087();
select pg_temp.refuse_087($s$select public.submit_profile_change_request('b8700000-0000-4000-8000-000000000001','{"about_text":"revoked"}',null)$s$,'42501');
reset role;
select pg_temp.assert_087(to_jsonb(pg_temp.profile_digest_087())=(select data from results_087 where label='digest'),'revocation no data change');

-- Synthetic old duplicates: failure deleting duplicate must also roll back prior update.
insert into public.profile_change_requests(choir_id,member_id,changes_json) values
 ('a8700000-0000-4000-8000-000000000001','a8700000-0000-4000-8000-000000000002','{"about_text":"duplicate"}');
create function pg_temp.fail_delete_087() returns trigger language plpgsql as $$
begin if old.choir_id='a8700000-0000-4000-8000-000000000001' then raise exception 'forced duplicate failure' using errcode='X8701'; end if; return old; end $$;
create trigger fixture_087_fail_delete before delete on public.profile_change_requests for each row execute function pg_temp.fail_delete_087();
update results_087 set data=to_jsonb(pg_temp.profile_digest_087()) where label='digest';
set local role authenticated;
select pg_temp.login_087();
select public.set_active_choir('a8700000-0000-4000-8000-000000000001');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"about_text":"must roll back"}',null)$s$,'X8701');
reset role;
select pg_temp.assert_087(to_jsonb(pg_temp.profile_digest_087())=(select data from results_087 where label='digest'),'update/delete failure fully rolls back');
drop trigger fixture_087_fail_delete on public.profile_change_requests;
set local role authenticated;
select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"about_text":"merged"}',null);
reset role;
select pg_temp.assert_087((select count(*)=1 from public.profile_change_requests
 where member_id='a8700000-0000-4000-8000-000000000002' and changes_json ? 'about_text'),'duplicates removed atomically');

-- First-choice context creation must also roll back if the later request insert fails.
create function pg_temp.fail_insert_087() returns trigger language plpgsql as $$
begin if new.changes_json->>'about_text'='forced insert' then raise exception 'forced insert failure' using errcode='X8702'; end if; return new; end $$;
create trigger fixture_087_fail_insert before insert on public.profile_change_requests for each row execute function pg_temp.fail_insert_087();
update results_087 set data=to_jsonb(pg_temp.profile_digest_087()) where label='digest';
set local role authenticated;
select pg_temp.login_087('87000000-0000-4000-8000-000000000002','87000000-0000-4000-8000-000000000014');
select pg_temp.refuse_087($s$select public.submit_profile_change_request('a8700000-0000-4000-8000-000000000001','{"about_text":"forced insert"}',null)$s$,'X8702');
reset role;
select pg_temp.assert_087(to_jsonb(pg_temp.profile_digest_087())=(select data from results_087 where label='digest'),'insert failure profile rollback');
select pg_temp.assert_087(not exists(select 1 from genova_005.active_choir_sessions
 where session_id='87000000-0000-4000-8000-000000000014'),'insert failure context rollback');
rollback;
