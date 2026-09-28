#!/usr/bin/env bash
# Loopback PG17 only. Reuse retained restore; drop only the exact clone created here.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$ROOT"
SOURCE_DB=genova_068_test_restore
TARGET_DB=genova_084_test_create
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[ "${PGHOST:-127.0.0.1}" = 127.0.0.1 ] || refuse 'loopback required'
export PGHOST=127.0.0.1 PGPORT="${PGPORT:-5432}"
[[ "$PGPORT" =~ ^[0-9]+$ ]] || refuse 'invalid port'
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'disk below 10 GiB floor'
q(){ PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$1" -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
fingerprint(){ q "$1" "select md5(concat_ws('|',
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from auth.users x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choirs x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choir_members x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.roles x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.choir_member_roles x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by id)::text,'[]') from public.repertoire x),
  (select coalesce(jsonb_agg(to_jsonb(x) order by session_id)::text,'[]') from genova_005.active_choir_sessions x)));"; }
owned=false
cleanup(){ if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb --force "$TARGET_DB"; fi; return 0; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17
  and to_regnamespace('genova_007') is not null and to_regnamespace('genova_078') is null")" = t ] || refuse 'wrong source revision'
baseline="$(fingerprint "$SOURCE_DB")"
createdb -O postgres -T "$SOURCE_DB" "$TARGET_DB"; owned=true
[ "$(fingerprint "$TARGET_DB")" = "$baseline" ] || refuse 'clone differs'
file "$TARGET_DB" supabase/migrations/20260928140000_active_membership_revocation_078.sql >/dev/null
file "$TARGET_DB" supabase/tests/084_stale_choir_create.sql >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$baseline" ] || refuse 'fixture changed baseline'
[ "$(fingerprint "$SOURCE_DB")" = "$baseline" ] || refuse 'source changed'
echo 'PASS actual unscoped wrong-choir baseline; explicit A refused in B; A/A and B/B create; revoked context refused'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'target remains'
echo 'PASS unchanged source/baseline and disposable clone removed'
