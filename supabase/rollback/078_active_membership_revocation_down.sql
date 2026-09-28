-- Isolated/explicitly approved rollback only: this restores the old security defect.
begin;
do $restore$
declare prior record;
begin
  if to_regclass('genova_078.prior_functions') is null then raise exception '078 down refused: snapshot missing'; end if;
  if (select count(*) from genova_078.prior_functions) <> 3 then raise exception '078 down refused: incomplete snapshot'; end if;
  for prior in select * from genova_078.prior_functions order by signature loop
    execute prior.definition;
    execute format('comment on function %s is %L',prior.signature,prior.description);
  end loop;
end
$restore$;
drop table genova_078.prior_functions;
drop schema genova_078;
commit;
