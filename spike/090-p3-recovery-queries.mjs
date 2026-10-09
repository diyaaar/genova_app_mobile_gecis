// Held snapshot metadata/data-digest queries used only by the approved exporter.
// Never executed through a general hosted-query fallback; no DDL/DML/log export.
export const schemaPredicate="n.nspname in ('auth','public','realtime','extensions','vault','supabase_migrations') or n.nspname ~ '^genova_[0-9]{3}$'";
export const dataPredicate="t.table_schema in ('auth','public','supabase_migrations') or t.table_schema ~ '^genova_[0-9]{3}$'";
export const catalogQueries={
  functions:`select n.nspname as schema,p.oid::regprocedure::text as signature,p.proname as name,
    pg_get_userbyid(p.proowner) as owner,p.prosecdef as security_definer,p.proconfig as config,p.proacl::text as acl,
    pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (${schemaPredicate}) and p.prokind='f' order by n.nspname,p.oid::regprocedure::text`,
  schemas:`select n.nspname as name,pg_get_userbyid(n.nspowner) as owner,n.nspacl::text as acl
    from pg_namespace n where ${schemaPredicate} order by n.nspname`,
  relations:`select n.nspname as schema,c.relname as name,c.relkind as kind,pg_get_userbyid(c.relowner) as owner,
    c.relrowsecurity as rls,c.relforcerowsecurity as force_rls,c.relacl::text as acl
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where (${schemaPredicate}) and c.relkind in ('r','p','v','m','S') order by n.nspname,c.relname`,
  policies:`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies
    where schemaname in ('auth','public','realtime','extensions','vault','supabase_migrations') or schemaname ~ '^genova_[0-9]{3}$'
    order by schemaname,tablename,policyname`,
  constraints:`select n.nspname as schema,c.relname as table_name,k.conname as name,k.contype as type,k.convalidated as validated,
    pg_get_constraintdef(k.oid) as definition from pg_constraint k join pg_class c on c.oid=k.conrelid
    join pg_namespace n on n.oid=c.relnamespace where ${schemaPredicate} order by n.nspname,c.relname,k.conname`,
  columns:`select table_schema,table_name,column_name,ordinal_position,is_nullable,data_type,udt_name,column_default
    from information_schema.columns where table_schema in ('auth','public','realtime','extensions','vault','supabase_migrations')
    or table_schema ~ '^genova_[0-9]{3}$' order by table_schema,table_name,ordinal_position`,
  indexes:`select schemaname,tablename,indexname,tablespace,indexdef from pg_indexes
    where schemaname in ('auth','public','realtime','extensions','vault','supabase_migrations') or schemaname ~ '^genova_[0-9]{3}$'
    order by schemaname,tablename,indexname`,
  triggers:`select n.nspname as schema,c.relname as table_name,t.tgname as name,t.tgenabled as enabled,
    pg_get_triggerdef(t.oid) as definition from pg_trigger t join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace where (${schemaPredicate}) and not t.tgisinternal order by n.nspname,c.relname,t.tgname`,
  defaultAcls:`select pg_get_userbyid(d.defaclrole) as owner,coalesce(n.nspname,'') as schema,d.defaclobjtype as type,
    d.defaclacl::text as acl from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace
    where d.defaclnamespace=0 or (${schemaPredicate}) order by owner,schema,type`,
  roles:`select rolname as name,rolsuper as super,rolinherit as inherit,rolcreaterole as createrole,rolcreatedb as createdb,
    rolcanlogin as login,rolreplication as replication,rolbypassrls as bypassrls,rolconnlimit as connlimit
    from pg_roles where rolname !~ '^pg_' order by rolname`,
  memberships:`select pg_get_userbyid(roleid) as role,pg_get_userbyid(member) as member,
    pg_get_userbyid(grantor) as grantor,admin_option,inherit_option,set_option from pg_auth_members order by role,member,grantor`,
  extensions:`select e.extname as name,e.extversion as version,pg_get_userbyid(e.extowner) as owner,n.nspname as schema
    from pg_extension e join pg_namespace n on n.oid=e.extnamespace order by e.extname`,
  publications:`select pubname as name,pg_get_userbyid(pubowner) as owner,puballtables as all_tables,
    pubinsert,pubupdate,pubdelete,pubtruncate,pubviaroot from pg_publication order by pubname`,
  publicationTables:`select pubname,schemaname,tablename,attnames,rowfilter from pg_publication_tables order by pubname,schemaname,tablename`,
  // Direct membership is different from the expanded pg_publication_tables view.
  publicationRelations:`select p.pubname as publication,n.nspname as schema,c.relname as table_name,
    case when r.prattrs is null then null else array(select a.attname from unnest(r.prattrs::smallint[]) with ordinality u(attnum,position)
      join pg_attribute a on a.attrelid=r.prrelid and a.attnum=u.attnum order by u.position) end as columns,
    pg_get_expr(r.prqual,r.prrelid) as row_filter from pg_publication_rel r
    join pg_publication p on p.oid=r.prpubid join pg_class c on c.oid=r.prrelid
    join pg_namespace n on n.oid=c.relnamespace order by p.pubname,n.nspname,c.relname`,
  publicationSchemas:`select p.pubname as publication,n.nspname as schema from pg_publication_namespace pn
    join pg_publication p on p.oid=pn.pnpubid join pg_namespace n on n.oid=pn.pnnspid order by p.pubname,n.nspname`,
  droppedColumns:`select n.nspname as schema,c.relname as table_name,a.attnum as position from pg_attribute a
    join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace
    where (${schemaPredicate}) and c.relkind in ('r','p') and a.attnum>0 and a.attisdropped
    order by n.nspname,c.relname,a.attnum`,
};
export const dataDigestQuery=`select t.table_schema as schema,t.table_name as table_name,
  (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint as rows,
  (xpath('/row/digest/text()',query_to_xml(format(
    'select encode(sha256(convert_to(coalesce(string_agg(row_value,E''\\n'' order by row_value collate "C"),''''),''UTF8'')),''hex'') as digest from (select to_jsonb(x)::text as row_value from %I.%I x) data',
    t.table_schema,t.table_name),false,true,'')))[1]::text as sha256
  from information_schema.tables t where t.table_type='BASE TABLE' and (${dataPredicate}) order by t.table_schema,t.table_name`;
const aggregate=query=>`(select coalesce(json_agg(q),'[]'::json) from (${query}) q)`;
// JSONB normalizes multiline composite json_agg whitespace into one psql row.
export const snapshotQuery=`select jsonb_build_object(
  'database',current_database(),'user',current_user,'version',current_setting('server_version'),
  'readOnly',current_setting('transaction_read_only'),'recovery',pg_is_in_recovery(),
  'snapshot',pg_export_snapshot(),'cutoff',transaction_timestamp(),
  'comparisonContext',jsonb_build_object('searchPath',current_setting('search_path')),
  'schemas',(select json_agg(nspname order by nspname) from pg_namespace n where ${schemaPredicate}),
  'data',${aggregate(dataDigestQuery)},
  'catalog',json_build_object(${Object.entries(catalogQueries).map(([key,query])=>`'${key}',${aggregate(query)}`).join(',')}))`;
export const canonicalSettings="set time zone 'UTC'; set datestyle='ISO, YMD'; set intervalstyle='postgres'; set extra_float_digits=3; set bytea_output='hex'; set search_path=public,extensions;";

// Fail before allocating a restore target; a current supplemental catalog query
// cannot fill a historical same-snapshot gap.
export function requireRecoveryMetadata(source){
  for(const group of ['publicationRelations','publicationSchemas','droppedColumns'])if(!Array.isArray(source.catalog?.[group]))throw Error('Incomplete same-snapshot recovery metadata');
  if(source.comparisonContext?.searchPath!=='public, extensions')throw Error('Missing canonical snapshot context');
  return true;
}
