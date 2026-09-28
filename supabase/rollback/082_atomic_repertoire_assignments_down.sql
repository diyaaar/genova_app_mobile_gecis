-- Explicit, isolated 082 rollback. This removes only the new RPC, not assignment rows.
begin;
do $preflight$
declare function_oid oid := to_regprocedure('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])');
begin
  if function_oid is null
    or not exists (
      select 1 from pg_proc p where p.oid=function_oid
        and p.prosecdef is false
        and has_function_privilege('authenticated',p.oid,'EXECUTE')
        and not has_function_privilege('anon',p.oid,'EXECUTE')
        and not has_function_privilege('service_role',p.oid,'EXECUTE')
        and not has_function_privilege('public',p.oid,'EXECUTE')
    ) then
    raise exception '082 down refused: function signature or security grants differ';
  end if;
end
$preflight$;
drop function public.replace_repertoire_assignments(uuid,text,uuid[],uuid[]);
commit;
