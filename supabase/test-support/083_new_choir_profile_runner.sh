#!/usr/bin/env bash
# LOCAL PG17 ONLY. Synthetic two-choir profile flow against a disposable restore clone.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$ROOT"
SOURCE_DB="${GENOVA_083_SOURCE_DATABASE:-genova_068_test_restore}"
TARGET_DB="${GENOVA_083_TARGET_DATABASE:-genova_083_test_roundtrip}"
PG_HOST="${PGHOST:-127.0.0.1}"; PG_PORT="${PGPORT:-5432}"
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[ "$SOURCE_DB" = genova_068_test_restore ] || refuse 'unexpected source'
[[ "$TARGET_DB" =~ ^genova_083_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe target'
[ "$SOURCE_DB" != "$TARGET_DB" ] && [ "$PG_HOST" = 127.0.0.1 ] || refuse 'loopback and separate target required'
[[ "$PG_PORT" =~ ^[0-9]+$ ]] || refuse 'invalid port'
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'disk below 10 GiB floor'
export PGHOST="$PG_HOST" PGPORT="$PG_PORT"
q(){ PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$1" -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
fingerprint(){ q "$1" "select md5(concat_ws('|',
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from auth.users x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choirs x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choir_members x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.roles x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choir_member_roles x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.schools x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.departments x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.profile_change_requests x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by session_id)::text,'[]') from genova_005.active_choir_sessions x)));"; }
owned=false
cleanup(){ if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb --force "$TARGET_DB"; fi; return 0; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17
  and to_regnamespace('genova_007') is not null and to_regnamespace('genova_078') is null
  and to_regprocedure('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])') is null")" = t ] || refuse 'wrong source revision'
source_data="$(fingerprint "$SOURCE_DB")"
createdb -O postgres -T "$SOURCE_DB" "$TARGET_DB"; owned=true
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'clone data differs'
file "$TARGET_DB" supabase/migrations/20260928140000_active_membership_revocation_078.sql
file "$TARGET_DB" supabase/migrations/20260928175950_atomic_repertoire_assignments_082.sql
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'prerequisites changed baseline rows'
file "$TARGET_DB" supabase/tests/083_new_choir_profile.sql >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'synthetic transaction changed baseline rows'
file "$TARGET_DB" supabase/tests/005_active_choir_isolation.sql >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse '005 regression changed baseline rows'
[ "$(fingerprint "$SOURCE_DB")" = "$source_data" ] || refuse 'source changed'
echo 'PASS two operator-created choirs, empty catalog, A/B/shared-session RLS, own approval, foreign-ref and inactive refusal'
echo 'PASS 005 compatibility and unchanged source/target baseline'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'target remains'
echo 'PASS disposable clone removed'
