-- 078: forward-only repair of 005. Active membership is the shared tenant authority.
begin;
do $preflight$
begin
  if to_regnamespace('genova_078') is not null then raise exception '078 refused: already applied'; end if;
  if to_regclass('genova_005.active_choir_sessions') is null
    or to_regprocedure('genova_005.current_session_id()') is null
    or to_regprocedure('public.current_choir_id()') is null
    or to_regprocedure('public.current_choir_member_id()') is null
    or to_regprocedure('public.set_active_choir(uuid)') is null then
    raise exception '078 refused: 005 authority prerequisite missing';
  end if;
end
$preflight$;

create schema genova_078;
revoke all on schema genova_078 from public, anon, authenticated, service_role;
create table genova_078.prior_functions as
select p.oid::regprocedure::text as signature, pg_get_functiondef(p.oid) as definition,
  obj_description(p.oid,'pg_proc') as description
from pg_proc p
where p.oid in ('public.current_choir_id()'::regprocedure,
  'public.current_choir_member_id()'::regprocedure,'public.set_active_choir(uuid)'::regprocedure);
revoke all on genova_078.prior_functions from public, anon, authenticated, service_role;

create or replace function public.current_choir_id()
returns uuid language sql stable security definer set search_path = ''
as $function$
  with context as (
    select (select auth.uid()) as user_id, genova_005.current_session_id() as session_id
  ), choice as (
    select active.choir_id
    from genova_005.active_choir_sessions active, context
    where active.auth_user_id=context.user_id and active.session_id=context.session_id
  )
  select case when exists(select 1 from choice) then (
    -- A revoked choice is a locked context, not permission to silently enter another choir.
    select member.choir_id from public.choir_members member, context, choice
    where member.auth_user_id=context.user_id and member.choir_id=choice.choir_id
      and member.is_active is true
    limit 1
  ) else (
    select case when count(*)=1 then (array_agg(member.choir_id))[1] end
    from public.choir_members member, context
    where member.auth_user_id=context.user_id and member.is_active is true
  ) end;
$function$;
comment on function public.current_choir_id() is
  'Verified session choice requires an active membership; revoked choices fail closed. Only unselected sessions fall back to exactly one active membership.';

create or replace function public.current_choir_member_id()
returns uuid language sql stable security definer set search_path = ''
as $function$
  select member.id from public.choir_members member
  where member.auth_user_id=(select auth.uid())
    and member.choir_id=public.current_choir_id() and member.is_active is true
  limit 1;
$function$;
comment on function public.current_choir_member_id() is
  'Returns only the authenticated active membership inside the verified active choir.';

create or replace function public.set_active_choir(p_choir_id uuid)
returns uuid language plpgsql volatile security definer set search_path = ''
as $function$
declare
  caller_id uuid := (select auth.uid());
  caller_session_id uuid := genova_005.current_session_id();
begin
  if caller_id is null or caller_session_id is null then
    raise exception 'Geçerli kullanıcı oturumu bulunamadı.' using errcode='28000';
  end if;
  if not exists(select 1 from public.choir_members member
    where member.auth_user_id=caller_id and member.choir_id=p_choir_id and member.is_active is true) then
    raise exception 'Bu koro için aktif üyelik bulunamadı.' using errcode='42501';
  end if;
  insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id,selected_at)
    values(caller_session_id,caller_id,p_choir_id,now())
  on conflict(session_id) do update set choir_id=excluded.choir_id,selected_at=excluded.selected_at
    where genova_005.active_choir_sessions.auth_user_id=excluded.auth_user_id;
  if not found then raise exception 'Oturum başka bir kullanıcıyla eşleşiyor.' using errcode='42501'; end if;
  return p_choir_id;
end;
$function$;
comment on function public.set_active_choir(uuid) is
  'Selects an active caller membership for only the verified Supabase Auth session.';
-- CREATE OR REPLACE preserves existing function owners/ACLs. No default-ACL reliance/new RPC.
commit;
