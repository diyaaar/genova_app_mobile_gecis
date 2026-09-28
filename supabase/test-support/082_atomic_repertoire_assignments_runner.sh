#!/usr/bin/env bash
# LOCAL PG17 ONLY. One disposable copy of the retained restore; no hosted access.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$ROOT"
SOURCE_DB="${GENOVA_082_SOURCE_DATABASE:-genova_068_test_restore}"
TARGET_DB="${GENOVA_082_TARGET_DATABASE:-genova_082_test_round2}"
PG_HOST="${PGHOST:-127.0.0.1}"; PG_PORT="${PGPORT:-5432}"
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[[ "$SOURCE_DB" =~ ^genova_068_test_restore$ ]] || refuse 'unexpected source'
[[ "$TARGET_DB" =~ ^genova_082_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe target'
[ "$SOURCE_DB" != "$TARGET_DB" ] && [ "$PG_HOST" = 127.0.0.1 ] || refuse 'loopback and separate target required'
[[ "$PG_PORT" =~ ^[0-9]+$ ]] || refuse 'invalid port'
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'free disk below 10 GiB'
export PGHOST="$PG_HOST" PGPORT="$PG_PORT"
q(){ PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$1" -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
fingerprint(){ q "$1" "select md5(concat_ws('|',
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from auth.users x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choirs x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choir_members x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.repertoire x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.song_assignments x)));"; }
MIGRATION=supabase/migrations/20260928175950_atomic_repertoire_assignments_082.sql
DOWN=supabase/rollback/082_atomic_repertoire_assignments_down.sql
FIXTURE=supabase/tests/082_atomic_repertoire_assignments_fixture.sql
TEST=supabase/tests/082_atomic_repertoire_assignments.sql
owned=false
scratch="$(mktemp -d)"
cleanup(){
  if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb --force "$TARGET_DB"; fi
  if [ -d "$scratch" ]; then rm -r "$scratch"; fi
  return 0
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17 and to_regnamespace('genova_078') is null")" = t ] || refuse 'source version/prerequisite mismatch'
source_data="$(fingerprint "$SOURCE_DB")"
createdb -O postgres -T "$SOURCE_DB" "$TARGET_DB"; owned=true
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'clone data differs'
if file "$TARGET_DB" "$MIGRATION" >"$scratch/missing-prerequisite" 2>&1; then refuse '082 accepted without 078'; fi
grep -q 'missing active-tenant prerequisite' "$scratch/missing-prerequisite" || refuse 'wrong prerequisite failure'
file "$TARGET_DB" supabase/migrations/20260928140000_active_membership_revocation_078.sql
file "$TARGET_DB" "$FIXTURE"

# Reproduce the old API's two-transaction delete/failed-insert data loss on synthetic rows.
q "$TARGET_DB" "delete from public.song_assignments where song_id='a2000000-0000-4000-8000-000000000001'" >/dev/null
if q "$TARGET_DB" "insert into public.song_assignments(song_id,member_id,choir_id,part_name) values
 ('a2000000-0000-4000-8000-000000000001','ffffffff-ffff-4fff-8fff-ffffffffffff',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Alto')" >"$scratch/old-write" 2>&1; then refuse 'synthetic invalid insert succeeded'; fi
[ "$(q "$TARGET_DB" "select count(*) from public.song_assignments where song_id='a2000000-0000-4000-8000-000000000001'")" = 0 ] || refuse 'old split-write failure not reproduced'
echo 'PASS old split delete/failed-insert loses synthetic assignment'
q "$TARGET_DB" "insert into public.song_assignments(song_id,member_id,choir_id,part_name,assigned_by) values
 ('a2000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Alto','a0000000-0000-4000-8000-000000000001')" >/dev/null

file "$TARGET_DB" "$MIGRATION"
[ "$(q "$TARGET_DB" "select p.prosecdef=false and has_function_privilege('authenticated',p.oid,'EXECUTE')
 and not has_function_privilege('anon',p.oid,'EXECUTE') and not has_function_privilege('service_role',p.oid,'EXECUTE')
 and not has_function_privilege('public',p.oid,'EXECUTE') from pg_proc p
 where p.oid='public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])'::regprocedure")" = t ] || refuse 'RPC grant/definer mismatch'
for denied_role in anon service_role; do
  if psql -X -Atq -v ON_ERROR_STOP=1 -d "$TARGET_DB" \
    -c "set role $denied_role" \
    -c "select * from public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001',null,array[]::uuid[],array[]::uuid[])" \
    >"$scratch/denied-$denied_role" 2>&1; then refuse "$denied_role executed RPC"; fi
  grep -q 'permission denied for function replace_repertoire_assignments' "$scratch/denied-$denied_role" || refuse "$denied_role failed for wrong reason"
done
psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET_DB" -f "$TEST"
if file "$TARGET_DB" "$MIGRATION" >"$scratch/repeat" 2>&1; then refuse 'repeat migration accepted'; fi
file "$TARGET_DB" "$DOWN"
[ "$(q "$TARGET_DB" "select to_regprocedure('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])') is null")" = t ] || refuse 'down left function'
file "$TARGET_DB" "$MIGRATION"
psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET_DB" -f "$TEST"
echo 'PASS role/tenant/input/rollback, exact down and reapply'

# First caller holds the song lock after saving; second must wait, then reject stale input.
PGOPTIONS='' psql -X -Atq -v ON_ERROR_STOP=1 -d "$TARGET_DB" \
  -c 'begin; set role authenticated; set request.jwt.claim.sub to '\''11111111-1111-4111-8111-111111111111'\''; set request.jwt.claims to '\''{"sub":"11111111-1111-4111-8111-111111111111"}'\'';' \
  -c "select * from public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001','Alto',array['a0000000-0000-4000-8000-000000000002'::uuid,'a0000000-0000-4000-8000-000000000003'::uuid],array['a0000000-0000-4000-8000-000000000002'::uuid])" \
  -c 'select pg_sleep(3)' -c 'commit' >"$scratch/first" 2>&1 &
first_pid=$!
for _ in {1..60}; do
  if [ "$(psql -X -Atq -d "$TARGET_DB" -c "select exists(select 1 from pg_stat_activity where datname='$TARGET_DB' and state='active' and query='select pg_sleep(3)')")" = t ]; then break; fi
  sleep 0.05
done
[ "$(psql -X -Atq -d "$TARGET_DB" -c "select exists(select 1 from pg_stat_activity where datname='$TARGET_DB' and state='active' and query='select pg_sleep(3)')")" = t ] || refuse 'first transaction never held lock'
if PGOPTIONS='' psql -X -Atq -v ON_ERROR_STOP=1 -d "$TARGET_DB" \
  -c 'set role authenticated; set request.jwt.claim.sub to '\''11111111-1111-4111-8111-111111111111'\''; set request.jwt.claims to '\''{"sub":"11111111-1111-4111-8111-111111111111"}'\'';' \
  -c "select * from public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001','Alto',array[]::uuid[],array['a0000000-0000-4000-8000-000000000002'::uuid])" \
  >"$scratch/second" 2>&1; then refuse 'concurrent stale writer accepted'; fi
wait "$first_pid" || refuse 'first writer failed'
grep -q 'Assignment set changed' "$scratch/second" || refuse 'concurrent writer failed for wrong reason'
[ "$(q "$TARGET_DB" "select array_agg(member_id order by member_id)=array['a0000000-0000-4000-8000-000000000002'::uuid,'a0000000-0000-4000-8000-000000000003'::uuid] from public.song_assignments where song_id='a2000000-0000-4000-8000-000000000001' and part_name='Alto'")" = t ] || refuse 'concurrent final rows wrong'
echo 'PASS concurrent stale writer rejected; winner rows exact'
[ "$(fingerprint "$SOURCE_DB")" = "$source_data" ] || refuse 'source data changed'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'owned target remains'
echo 'PASS source unchanged; disposable clone removed'
