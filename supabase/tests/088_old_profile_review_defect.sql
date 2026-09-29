-- Reproduce actual former service-write ordering; all fixture changes roll back.
begin;
create function pg_temp.old_member_failure_088() returns trigger language plpgsql as $$
begin if new.id='a8700000-0000-4000-8000-000000000002' then raise exception 'member failure' using errcode='X8802'; end if; return new; end $$;
create function pg_temp.old_reset_failure_088() returns trigger language plpgsql as $$
begin if old.id='a8800000-0000-4000-8000-000000000007' and new.status='pending' then raise exception 'reset failure' using errcode='X8803'; end if; return new; end $$;
create trigger fixture_088_old_member before update on public.choir_members for each row execute function pg_temp.old_member_failure_088();
create trigger fixture_088_old_reset before update on public.profile_change_requests for each row execute function pg_temp.old_reset_failure_088();
-- Simulate authority removed AFTER former precheck but BEFORE privileged write.
delete from public.choir_member_roles where id='a8800000-0000-4000-8000-000000000004';
set local role service_role;
update public.profile_change_requests set status='approved',reviewed_by='a8700000-0000-4000-8000-000000000003',reviewed_at=now()
 where id='a8800000-0000-4000-8000-000000000007';
do $$ begin
 begin update public.choir_members set about_text='new A' where id='a8700000-0000-4000-8000-000000000002';
 exception when sqlstate 'X8802' then null; end;
 begin update public.profile_change_requests set status='pending' where id='a8800000-0000-4000-8000-000000000007';
 exception when sqlstate 'X8803' then null; end;
end $$;
reset role;
do $$ begin
 if (select status from public.profile_change_requests where id='a8800000-0000-4000-8000-000000000007')<>'approved'
 or (select about_text from public.choir_members where id='a8700000-0000-4000-8000-000000000002')<>'before A'
 or exists(select 1 from public.choir_member_roles where id='a8800000-0000-4000-8000-000000000004') then
 raise exception '088 old half-decision/revoked role defect not reproduced'; end if;
end $$;
rollback;
