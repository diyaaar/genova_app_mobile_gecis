#!/usr/bin/env bash
# Exact local PG17 backup/restore only. Never use linked/hosted credentials.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$ROOT"
SOURCE=genova_068_test_restore
TARGET=genova_087_test_roundtrip
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[ "${PGHOST:-127.0.0.1}" = 127.0.0.1 ] && [ "${PGPORT:-5432}" = 5432 ] || refuse 'exact loopback required'
export PGHOST=127.0.0.1 PGPORT=5432
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'disk floor'
umask 077
scratch="$(mktemp -d "$ROOT/spike/087-private-XXXXXX")"
owned=false
q(){ PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET" -f "$1"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
cleanup(){
  if [ "$owned" = true ] && exists "$TARGET"; then dropdb --force "$TARGET"; fi
  node -e 'const fs=require("fs"),p=require("path"),s=process.argv[1];if(p.dirname(s)!==p.join(process.cwd(),"spike")||!p.basename(s).startsWith("087-private-")||fs.lstatSync(s).isSymbolicLink())throw Error("wrong scratch");fs.rmSync(s,{recursive:true});' "$scratch"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
fingerprint(){ q "$1" "select case when count(h)=15 then md5(string_agg(n||':'||h,'|' order by n)) else 'INVALID' end
 from (select s||'.'||t n,md5((xpath('/table/row/value/text()',query_to_xml(format(
 'select coalesce(jsonb_agg(row_data order by row_data::text)::text,''[]'') value from (select to_jsonb(x) row_data from %I.%I x) rows',s,t),false,false,'')))[1]::text) h
 from (values ('auth','users'),('auth','sessions'),('public','choirs'),('public','roles'),('public','choir_members'),
 ('public','choir_member_roles'),('public','schools'),('public','departments'),('public','profile_change_requests'),
 ('public','repertoire'),('public','song_assignments'),('public','repertoire_cache_versions'),
 ('genova_005','active_choir_sessions'),('genova_007','platform_operators'),('genova_008','invitations')) tables(s,t)) hashes;"; }
functions(){ q "$1" "select md5(coalesce(jsonb_agg(jsonb_build_array(n.nspname,p.proname,
 pg_get_function_identity_arguments(p.oid),pg_get_functiondef(p.oid),pg_get_userbyid(p.proowner),p.proacl::text)
 order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid))::text,'')) from pg_proc p
 join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' or n.nspname like 'genova_%';"; }
table_authority(){ q "$1" "select md5(coalesce(jsonb_agg(jsonb_build_array(c.relname,c.relacl::text,c.relrowsecurity,
 pg_get_userbyid(c.relowner),pol.polname,pol.polcmd,pol.polpermissive,pol.polroles::text,
 pg_get_expr(pol.polqual,pol.polrelid),pg_get_expr(pol.polwithcheck,pol.polrelid))
 order by c.relname,pol.polname)::text,'')) from pg_class c join pg_namespace n on n.oid=c.relnamespace
 left join pg_policy pol on pol.polrelid=c.oid where n.nspname='public' and c.relkind='r';"; }
exists "$SOURCE" || refuse 'source absent'
exists "$TARGET" && refuse 'target exists, not owned'
[ "$(q "$SOURCE" "select current_setting('server_version_num')::int/10000=17 and to_regnamespace('genova_078') is null")" = t ] || refuse 'source revision'
baseline="$(fingerprint "$SOURCE")"; [[ "$baseline" =~ ^[a-f0-9]{32}$ ]] || refuse 'bad fingerprint'
source_functions="$(functions "$SOURCE")"; source_authority="$(table_authority "$SOURCE")"
PGOPTIONS='-c role=postgres' pg_dump -Fc -d "$SOURCE" >"$scratch/source.dump"
createdb -O postgres "$TARGET"; owned=true
# Same local cluster's existing role attributes; superuser restore preserves source owners/default ACLs.
PGOPTIONS='' pg_restore --exit-on-error -d "$TARGET" "$scratch/source.dump" >"$scratch/restore.log" 2>&1
[ "$(fingerprint "$TARGET")" = "$baseline" ] && [ "$(functions "$TARGET")" = "$source_functions" ] \
 && [ "$(table_authority "$TARGET")" = "$source_authority" ] || refuse 'backup restore mismatch'
echo 'PASS fresh LOCAL backup restore: 15-table data and function/owner/ACL/table-policy equality'
file supabase/migrations/20260928140000_active_membership_revocation_078.sql >/dev/null
file supabase/migrations/20260928175950_atomic_repertoire_assignments_082.sql >/dev/null
prior_functions="$(functions "$TARGET")"; prior_authority="$(table_authority "$TARGET")"
file supabase/tests/087_profile_submit_fixture.sql >/dev/null
# Old Next behavior: resolve active context, then service-role writes after revocation.
q "$TARGET" "begin;set role authenticated;set request.jwt.claim.sub='87000000-0000-4000-8000-000000000001';
 set request.jwt.claims='{\"sub\":\"87000000-0000-4000-8000-000000000001\",\"session_id\":\"87000000-0000-4000-8000-000000000011\"}';
 select public.current_choir_id();reset role;
 update public.choir_members set is_active=false where id='a8700000-0000-4000-8000-000000000002';
 set role service_role;insert into public.profile_change_requests(choir_id,member_id,changes_json)
 values('a8700000-0000-4000-8000-000000000001','a8700000-0000-4000-8000-000000000002','{\"about_text\":\"old privileged write\"}');
 reset role;select count(*) from public.profile_change_requests where changes_json->>'about_text'='old privileged write';rollback;" >"$scratch/old-write"
[ "$(tail -1 "$scratch/old-write")" = 1 ] || refuse 'old defect not reproduced'
echo 'PASS RED old service write persists after selected membership revocation (fixture rolled back)'
MIGRATION=supabase/migrations/20260929010000_atomic_profile_submit_087.sql
DOWN=supabase/rollback/087_atomic_profile_submit_down.sql
file "$MIGRATION" >/dev/null
[ "$(table_authority "$TARGET")" = "$prior_authority" ] || refuse 'old table authority changed'
[ "$(q "$TARGET" "select p.prosecdef and p.proconfig=array['search_path=\"\"'] and
 has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE')
 and not has_function_privilege('service_role',p.oid,'EXECUTE') and not has_function_privilege('public',p.oid,'EXECUTE')
 from pg_proc p where p.oid='public.submit_profile_change_request(uuid,jsonb,text)'::regprocedure")" = t ] || refuse 'unsafe RPC authority'
for denied in anon service_role; do
  if q "$TARGET" "set role $denied; select public.submit_profile_change_request(null,'{}',null)" >"$scratch/denied-$denied" 2>&1; then refuse "$denied execution"; fi
  rg -q 'permission denied for function submit_profile_change_request' "$scratch/denied-$denied" || refuse 'wrong denial'
done
file supabase/tests/087_atomic_profile_submit.sql >"$scratch/matrix.log" 2>&1
echo 'PASS actual PG17 A/B/context/reference/normalization/snapshot/merge/rollback matrix and ACL denials'
if file "$MIGRATION" >"$scratch/repeat.log" 2>&1; then refuse 'repeat migration accepted'; fi
file "$DOWN" >/dev/null
[ "$(functions "$TARGET")" = "$prior_functions" ] && [ "$(table_authority "$TARGET")" = "$prior_authority" ] || refuse 'down changed old schema authority'
file "$MIGRATION" >/dev/null
file supabase/tests/087_atomic_profile_submit.sql >"$scratch/reapply.log" 2>&1
echo 'PASS exact new-function down, original authority preservation and reapply'
GENOVA_087_DATABASE="$TARGET" GENOVA_087_SCRATCH="$scratch" pnpm exec tsx supabase/test-support/087_profile_concurrency.ts
file supabase/tests/005_active_choir_isolation.sql >"$scratch/regression-005.log" 2>&1
file supabase/tests/083_new_choir_profile.sql >"$scratch/regression-083.log" 2>&1
echo 'PASS existing 005 context and 083 profile/reference regressions after new transaction'
[ "$(fingerprint "$SOURCE")" = "$baseline" ] && [ "$(functions "$SOURCE")" = "$source_functions" ] \
 && [ "$(table_authority "$SOURCE")" = "$source_authority" ] || refuse 'source changed'
dropdb --force "$TARGET"; owned=false
exists "$TARGET" && refuse 'owned target remains'
echo 'PASS source unchanged, exact local target removed; private backup/logs removed on exit'
