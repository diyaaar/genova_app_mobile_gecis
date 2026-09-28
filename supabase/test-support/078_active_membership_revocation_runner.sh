#!/usr/bin/env bash
# LOCAL PG17 ONLY: synthetic fixtures, one new clone, postgres/default-ACL fidelity.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$REPO_ROOT"
SOURCE_DB="${GENOVA_078_SOURCE_DATABASE:-genova_068_test_restore}"
TARGET_DB="${PGDATABASE:-genova_078_test_local}"
PG_HOST="${PGHOST:-127.0.0.1}"; PG_PORT="${PGPORT:-5432}"
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[[ "$SOURCE_DB" =~ ^genova_(068|078_source)_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe source'
[[ "$TARGET_DB" =~ ^genova_078_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe target'
[ "$SOURCE_DB" != "$TARGET_DB" ] || refuse 'source equals target'
[ "$PG_HOST" = 127.0.0.1 ] || refuse 'loopback required'
[[ "$PG_PORT" =~ ^[0-9]+$ ]] || refuse 'invalid port'
export PGHOST="$PG_HOST" PGPORT="$PG_PORT"
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
q(){ PGOPTIONS='-c role=postgres' psql -X -d "$1" -v ON_ERROR_STOP=1 -Atq -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -d "$1" -v ON_ERROR_STOP=1 -q -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1');")" = t ]; }
functions(){ q "$1" "select md5(string_agg(concat_ws('|',pg_get_functiondef(p.oid),p.proacl::text,
  pg_get_userbyid(p.proowner),obj_description(p.oid,'pg_proc')),E'\n' order by p.oid::regprocedure::text))
  from pg_proc p where p.oid in ('public.current_choir_id()'::regprocedure,
    'public.current_choir_member_id()'::regprocedure,'public.set_active_choir(uuid)'::regprocedure);"; }
data(){ q "$1" "select md5(concat_ws('|',
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from auth.users r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choirs r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choir_members r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.roles r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choir_member_roles r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.repertoire r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by session_id)::text,'[]') from genova_005.active_choir_sessions r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.push_subscriptions r)));"; }
MIGRATION=supabase/migrations/20260928140000_active_membership_revocation_078.sql
TEST=supabase/tests/078_active_membership_revocation.sql
DOWN=supabase/rollback/078_active_membership_revocation_down.sql
owned=false
cleanup(){ if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb --force "$TARGET_DB"; fi; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17
  and to_regnamespace('genova_078') is null;")" = t ] || refuse 'wrong version/already migrated'
source_functions="$(functions "$SOURCE_DB")"; source_data="$(data "$SOURCE_DB")"
createdb -O postgres -T "$SOURCE_DB" "$TARGET_DB"; owned=true
[ "$(functions "$TARGET_DB")" = "$source_functions" ] && [ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'clone mismatch'
echo '078: isolated clone, postgres creator, restored default ACLs'
if before="$(file "$TARGET_DB" "$TEST" 2>&1)"; then refuse 'negative matrix unexpectedly passes before fix'; fi
[[ "$before" == *'inactive selected membership retains tenant authority'* ]] || refuse 'wrong red-before-green failure'
echo 'PASS reproduced inactive authority before repair'
file "$TARGET_DB" "$MIGRATION"
file "$TARGET_DB" "$TEST"
file "$TARGET_DB" supabase/tests/005_active_choir_isolation.sql
file "$TARGET_DB" supabase/tests/012_list_my_choirs_is_current.sql
[ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'forward/fixtures changed baseline rows'
fixed_functions="$(functions "$TARGET_DB")"
if file "$TARGET_DB" "$MIGRATION" >/dev/null 2>&1; then refuse 'repeat forward accepted'; fi
[ "$(functions "$TARGET_DB")" = "$fixed_functions" ] || refuse 'repeat forward changed authority'
echo 'PASS inactive read/write/role/selection/push refusals; active A/B/session/compatibility/repeat-forward matrix'
file "$TARGET_DB" "$DOWN"
[ "$(functions "$TARGET_DB")" = "$source_functions" ] || refuse 'down definitions/comments/owners/ACL mismatch'
[ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'down changed baseline rows'
q "$TARGET_DB" 'alter function genova_005.current_session_id() rename to missing_078_session_id;' >/dev/null
if prerequisite="$(file "$TARGET_DB" "$MIGRATION" 2>&1)"; then refuse 'missing prerequisite accepted'; fi
[[ "$prerequisite" == *'005 authority prerequisite missing'* ]] || refuse 'wrong prerequisite refusal'
q "$TARGET_DB" 'alter function genova_005.missing_078_session_id() rename to current_session_id;' >/dev/null
[ "$(functions "$TARGET_DB")" = "$source_functions" ] || refuse 'prerequisite refusal changed authority'
file "$TARGET_DB" "$MIGRATION"
file "$TARGET_DB" "$TEST"
[ "$(functions "$TARGET_DB")" = "$fixed_functions" ] || refuse 'reapply differs'
[ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'reapply changed baseline rows'
[ "$(functions "$SOURCE_DB")" = "$source_functions" ] && [ "$(data "$SOURCE_DB")" = "$source_data" ] || refuse 'source changed'
echo 'PASS exact down/reapply and unchanged source/target baseline'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'target remains'
echo 'PASS disposable clone removed'
