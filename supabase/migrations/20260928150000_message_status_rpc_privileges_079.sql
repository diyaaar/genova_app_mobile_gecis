-- 079: explicit grant repair, not a rewrite of applied 043 or global default privileges.
begin;
do $preflight$
begin
  if to_regnamespace('genova_079') is not null then raise exception '079 refused: already applied'; end if;
  if to_regnamespace('genova_043') is null
    or to_regprocedure('public.mark_chat_message_status(uuid,text)') is null then
    raise exception '079 refused: 043 prerequisite missing';
  end if;
  -- Preserve exact ACL provenance for down; unknown delegated grants require manual review.
  if exists(select 1 from pg_proc p, lateral aclexplode(p.proacl) a
    where p.oid='public.mark_chat_message_status(uuid,text)'::regprocedure
      and (a.grantor<>p.proowner or a.grantee not in
        (0,p.proowner,'anon'::regrole::oid,'authenticated'::regrole::oid,'service_role'::regrole::oid)))
    or exists(select 1 from pg_proc p
    where p.oid='public.mark_chat_message_status(uuid,text)'::regprocedure and p.proacl is null) then
    raise exception '079 refused: unexpected ACL provenance';
  end if;
end
$preflight$;
create schema genova_079;
revoke all on schema genova_079 from public, anon, authenticated, service_role;
create table genova_079.prior_status_acl as
select p.proacl as acl, p.proowner as owner_id
from pg_proc p where p.oid='public.mark_chat_message_status(uuid,text)'::regprocedure;
revoke all on genova_079.prior_status_acl from public, anon, authenticated, service_role;

-- REVOKE PUBLIC alone does not remove per-role grants from Supabase's creator defaults.
revoke all on function public.mark_chat_message_status(uuid,text) from public, anon, authenticated, service_role;
grant execute on function public.mark_chat_message_status(uuid,text) to authenticated;
commit;
