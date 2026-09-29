-- Real PG17 function/RLS/rollback matrix; transaction restores persistent fixtures.
begin;
create function pg_temp.assert_088(ok boolean,label text) returns void language plpgsql as $$
begin if ok is not true then raise exception '088: %',label; end if; end $$;
create function pg_temp.refuse_088(statement text,code text) returns void language plpgsql as $$
begin
 begin execute statement; exception when others then if sqlstate=code then return; end if; raise; end;
 raise exception '088 expected SQLSTATE %',code;
end $$;
create function pg_temp.login_088(uid text default '87000000-0000-4000-8000-000000000002',sid text default '88000000-0000-4000-8000-000000000021')
returns void language sql as $$
 select set_config('request.jwt.claim.sub',uid,true);
 select set_config('request.jwt.claims',json_build_object('sub',uid,'role','authenticated','session_id',sid)::text,true);
$$;
create function pg_temp.review_088(action text default 'approve',rid uuid default 'a8800000-0000-4000-8000-000000000007',reason text default null)
returns jsonb language sql as $$ select public.review_profile_change_request(rid,action,reason); $$;
create function pg_temp.reset_088(changes jsonb default '{"about_text":"new A"}') returns void language sql as $$
 update public.profile_change_requests set status='pending',reviewed_by=null,reviewed_at=null,reject_reason=null,changes_json=changes,
 previous_values_json='{}' where id='a8800000-0000-4000-8000-000000000007';
$$;
create temp table results_088(label text primary key,data jsonb);
grant all on results_088 to authenticated;
set local role authenticated;
select pg_temp.login_088();
select pg_temp.refuse_088($s$select pg_temp.review_088('approve','b8800000-0000-4000-8000-000000000007')$s$,'PT404');
select pg_temp.refuse_088($s$select pg_temp.review_088('wrong')$s$,'22023');
select pg_temp.refuse_088($s$select pg_temp.review_088('reject','a8800000-0000-4000-8000-000000000007',repeat('x',1201))$s$,'22023');
select pg_temp.refuse_088($s$select public.review_profile_change_request('a8800000-0000-4000-8000-000000000007','reject',repeat(chr(128512),601))$s$,'22023');
select pg_temp.login_088('87000000-0000-4000-8000-000000000002',null);
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'28000');
select pg_temp.login_088('87000000-0000-4000-8000-000000000002','87000000-0000-4000-8000-000000000011');
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'28000');
select pg_temp.login_088('87000000-0000-4000-8000-000000000001','88000000-0000-4000-8000-000000000099');
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'42501');
select pg_temp.login_088('87000000-0000-4000-8000-000000000001','87000000-0000-4000-8000-000000000011');
-- A member is chef ONLY in B; cannot import that role into A.
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'42501');
select public.set_active_choir('b8700000-0000-4000-8000-000000000001');
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'PT404');
insert into results_088 values('B',pg_temp.review_088('approve','b8800000-0000-4000-8000-000000000007'));
select pg_temp.login_088();
insert into results_088 values('A',pg_temp.review_088());
select pg_temp.refuse_088($s$select pg_temp.review_088('reject')$s$,'PT409');
reset role;
select pg_temp.assert_088((select data->>'status'='approved' and data->>'memberId'='a8700000-0000-4000-8000-000000000002'
 and data->>'reviewedBy'='a8700000-0000-4000-8000-000000000003' and data->>'reviewerName'='Single A'
 from results_088 where label='A'),'response authority');
select pg_temp.assert_088((select previous_values_json='{"about_text":"before A"}'::jsonb and reviewed_at is not null
 from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007'),'review snapshot');
select pg_temp.assert_088((select about_text='new A' from public.choir_members where id='a8700000-0000-4000-8000-000000000002')
 and (select about_text='new B' from public.choir_members where id='b8700000-0000-4000-8000-000000000002'),'A/B own only');

-- ALL 14 allowed fields, typed references/date, null and trim; member identity must not change.
select pg_temp.reset_088('{"email":" email@example.invalid ","phone":" 123 ","birth_date":"2000-01-02","school_id":"a8700000-0000-4000-8000-000000000004","department_id":"a8700000-0000-4000-8000-000000000005","favorite_song_id":"a8700000-0000-4000-8000-000000000006","about_text":" other ","linkedin_url":" link ","instagram_url":" insta ","youtube_url":null,"spotify_url":" spot ","tiktok_url":" tik ","x_url":" x ","photo_url":" photo ","auth_user_id":"forged","is_active":false}');
update public.choir_members set about_text='changed since submission' where id='a8700000-0000-4000-8000-000000000002';
set local role authenticated;
select pg_temp.login_088();
select pg_temp.review_088();
reset role;
select pg_temp.assert_088((select genova_087.normalize_changes(to_jsonb(m))=genova_087.normalize_changes(r.changes_json)
 and m.is_active and m.auth_user_id='87000000-0000-4000-8000-000000000001'
 and r.previous_values_json->>'about_text'='changed since submission'
 from public.choir_members m join public.profile_change_requests r on r.member_id=m.id
 where r.id='a8800000-0000-4000-8000-000000000007'),'14 fields, typed update and fresh snapshot');
select pg_temp.reset_088('{"about_text":"should not apply"}');
set local role authenticated;
select pg_temp.review_088('reject','a8800000-0000-4000-8000-000000000007','  reason  ');
reset role;
select pg_temp.assert_088((select about_text='other' from public.choir_members where id='a8700000-0000-4000-8000-000000000002')
 and (select status='rejected' and reject_reason='reason' and previous_values_json='{"about_text":"other"}'::jsonb
 from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007'),'reject no member mutation');

-- Invalid/foreign/missing references and corrupt drafts fail closed; rejection still available.
do $$ declare payload jsonb; begin
 foreach payload in array array['{"school_id":"b8700000-0000-4000-8000-000000000004"}'::jsonb,
 '{"department_id":"b8700000-0000-4000-8000-000000000005"}',
 '{"favorite_song_id":"b8700000-0000-4000-8000-000000000006"}',
 '{"school_id":"a8700000-0000-4000-8000-000000000099"}','{"school_id":"bad"}',
 '[]','{"unknown":"x","phone":15}'] loop
 perform pg_temp.reset_088(payload); set local role authenticated;
 perform pg_temp.refuse_088('select pg_temp.review_088()','22023'); reset role;
 if (select status from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007')<>'pending' then raise exception 'invalid draft mutated'; end if;
 end loop;
end $$;
select pg_temp.reset_088('{"birth_date":"not-a-date"}');
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'22007');
select pg_temp.review_088('reject');
reset role;

select pg_temp.reset_088();
update public.choir_members set is_active=false where id='a8700000-0000-4000-8000-000000000002';
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'22023');
select pg_temp.review_088('reject');
reset role;
update public.choir_members set is_active=true where id='a8700000-0000-4000-8000-000000000002';
select pg_temp.reset_088();
update public.choir_members set is_active=false where id='a8700000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'42501');
reset role;
update public.choir_members set is_active=true where id='a8700000-0000-4000-8000-000000000003';
update public.roles set name='Partisyon Şefi' where id='a8800000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'42501');
reset role;
update public.roles set name=chr(160)||' ŞEF '||chr(65279) where id='a8800000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.review_088('reject');
reset role;
update public.roles set name='Şef' where id='a8800000-0000-4000-8000-000000000003';

-- Older overlap blocks approve AND reject; disjoint/equal timestamps retain old behavior.
select pg_temp.reset_088();
insert into public.profile_change_requests(id,choir_id,member_id,changes_json,created_at) values
 ('a8800000-0000-4000-8000-000000000008','a8700000-0000-4000-8000-000000000001','a8700000-0000-4000-8000-000000000002','{"about_text":"older"}','2026-09-28T01:00:00Z');
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'PT409');
select pg_temp.refuse_088($s$select pg_temp.review_088('reject')$s$,'PT409');
reset role;
update public.profile_change_requests set changes_json='{"phone":"disjoint"}' where id='a8800000-0000-4000-8000-000000000008';
set local role authenticated;
select pg_temp.review_088('reject');
reset role;
select pg_temp.reset_088();
update public.profile_change_requests set changes_json='{"about_text":"equal"}',created_at='2026-09-29T01:00:00Z' where id='a8800000-0000-4000-8000-000000000008';
set local role authenticated;
select pg_temp.review_088('reject');
reset role;
delete from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000008';

-- Trigger failure AFTER approved member UPDATE must roll back member and decision.
select pg_temp.reset_088('{"about_text":"must roll back"}');
insert into results_088 values('before', (select to_jsonb(m) from public.choir_members m where id='a8700000-0000-4000-8000-000000000002'));
create function pg_temp.fail_decision_088() returns trigger language plpgsql as $$
begin if new.id='a8800000-0000-4000-8000-000000000007' then raise exception 'forced post-member failure' using errcode='X8801'; end if; return new; end $$;
create trigger fixture_088_fail_decision before update on public.profile_change_requests for each row execute function pg_temp.fail_decision_088();
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'X8801');
reset role;
select pg_temp.assert_088((select to_jsonb(m)=(select data from results_088 where label='before') from public.choir_members m where id='a8700000-0000-4000-8000-000000000002')
 and (select status='pending' and reviewed_by is null and previous_values_json='{}'::jsonb from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007'),'atomic post-member rollback');
-- The materialized first-choice session must roll back too.
set local role authenticated;
select pg_temp.login_088('87000000-0000-4000-8000-000000000002','88000000-0000-4000-8000-000000000022');
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'X8801');
reset role;
select pg_temp.assert_088(not exists(select 1 from genova_005.active_choir_sessions where session_id='88000000-0000-4000-8000-000000000022'),'failed decision first-choice rollback');
drop trigger fixture_088_fail_decision on public.profile_change_requests;
-- A BEFORE trigger that silently skips either UPDATE must never commit half a decision.
create function pg_temp.skip_update_088() returns trigger language plpgsql as $$ begin return null; end $$;
create trigger fixture_088_skip_member before update on public.choir_members for each row execute function pg_temp.skip_update_088();
set local role authenticated;
select pg_temp.login_088();
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'40001');
reset role;
drop trigger fixture_088_skip_member on public.choir_members;
create trigger fixture_088_skip_decision before update on public.profile_change_requests for each row execute function pg_temp.skip_update_088();
set local role authenticated;
select pg_temp.refuse_088($s$select pg_temp.review_088()$s$,'40001');
reset role;
select pg_temp.assert_088((select to_jsonb(m)=(select data from results_088 where label='before') from public.choir_members m where id='a8700000-0000-4000-8000-000000000002')
 and (select status='pending' and reviewed_by is null from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007'),'skipped-update atomic rollback');
rollback;
