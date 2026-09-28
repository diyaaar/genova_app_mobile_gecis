-- Actual local catalog and execution test; no hosted target or synthetic data persisted.
begin;
do $test$
declare refused boolean;
begin
  if not has_function_privilege('authenticated','public.mark_chat_message_status(uuid,text)','EXECUTE')
    or has_function_privilege('anon','public.mark_chat_message_status(uuid,text)','EXECUTE')
    or has_function_privilege('service_role','public.mark_chat_message_status(uuid,text)','EXECUTE')
    or exists(select 1 from pg_proc p, lateral aclexplode(p.proacl) a
      where p.oid='public.mark_chat_message_status(uuid,text)'::regprocedure and a.grantee=0) then
    raise exception '079: effective privilege boundary differs';
  end if;
  execute 'set local role anon';
  refused := false;
  begin perform public.mark_chat_message_status(gen_random_uuid(),'read');
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '079: anon executed user RPC'; end if;
  execute 'reset role';
  execute 'set local role service_role';
  refused := false;
  begin perform public.mark_chat_message_status(gen_random_uuid(),'read');
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '079: service role executed user RPC'; end if;
  execute 'reset role';
end
$test$;
rollback;
