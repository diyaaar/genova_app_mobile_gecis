-- Local/approved rollback only: restores historical grants, including the audited defect.
begin;
do $restore$
declare prior record; grant_row record; role_name text;
begin
  if to_regclass('genova_079.prior_status_acl') is null then raise exception '079 down refused: snapshot missing'; end if;
  if (select count(*) from genova_079.prior_status_acl) <> 1 then raise exception '079 down refused: snapshot incomplete'; end if;
  select * into strict prior from genova_079.prior_status_acl;
  if (select proowner from pg_proc where oid='public.mark_chat_message_status(uuid,text)'::regprocedure)
    is distinct from prior.owner_id then raise exception '079 down refused: owner changed'; end if;
  for grant_row in select distinct a.grantee from pg_proc p, lateral aclexplode(p.proacl) a
    where p.oid='public.mark_chat_message_status(uuid,text)'::regprocedure loop
    role_name := case when grant_row.grantee=0 then 'public' else quote_ident(pg_get_userbyid(grant_row.grantee)) end;
    execute 'revoke all on function public.mark_chat_message_status(uuid,text) from '||role_name;
  end loop;
  -- Original ACL item order is retained, as well as grant options/owner provenance.
  for grant_row in select a.* from unnest(prior.acl) with ordinality entry(item,position),
    lateral aclexplode(array[entry.item]) a order by entry.position loop
    role_name := case when grant_row.grantee=0 then 'public' else quote_ident(pg_get_userbyid(grant_row.grantee)) end;
    execute 'grant execute on function public.mark_chat_message_status(uuid,text) to '||role_name
      ||case when grant_row.is_grantable then ' with grant option' else '' end;
  end loop;
end
$restore$;
drop table genova_079.prior_status_acl;
drop schema genova_079;
commit;
