#!/usr/bin/env bash
# Exact local restore clone only; no hosted fallback, real account or provider operation.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$ROOT"
SOURCE_DB="${GENOVA_085_SOURCE_DATABASE:-genova_068_test_restore}"
TARGET_DB="${GENOVA_085_TARGET_DATABASE:-genova_085_test_connected}"
PG_HOST="${PGHOST:-127.0.0.1}"; PG_PORT="${PGPORT:-5432}"
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[ "$SOURCE_DB" = genova_068_test_restore ] || refuse 'unexpected source'
[ "$TARGET_DB" = genova_085_test_connected ] || refuse 'unexpected target'
[ "$PG_HOST" = 127.0.0.1 ] && [ "$PG_PORT" = 5432 ] || refuse 'exact loopback PG17 required'
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'disk below 10 GiB floor'
export PGHOST="$PG_HOST" PGPORT="$PG_PORT"
q(){ PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
file(){ PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$1" -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
# Covers every non-temporary table in the connected fixture, including auth/session,
# invitation/operator tables and trigger-managed catalog versions; never print row content.
fingerprint(){
  local digest
  digest="$(q "$1" "select case when count(row_hash)=15
    then md5(string_agg(table_name||':'||row_hash,'|' order by table_name)) else 'INVALID' end
  from (select s||'.'||t table_name,
    md5((xpath('/table/row/value/text()',query_to_xml(
      format('select coalesce(jsonb_agg(row_data order by row_data::text)::text,''[]'') as value
        from (select to_jsonb(x) row_data from %I.%I x) rows',s,t),false,false,'')))[1]::text) row_hash
    from (values ('auth','users'),('auth','sessions'),('public','choirs'),('public','roles'),
      ('public','choir_members'),('public','choir_member_roles'),('public','schools'),
      ('public','departments'),('public','profile_change_requests'),('public','repertoire'),
      ('public','song_assignments'),('public','repertoire_cache_versions'),
      ('genova_005','active_choir_sessions'),('genova_007','platform_operators'),
      ('genova_008','invitations')) tables(s,t)) hashes;")"
  [[ "$digest" =~ ^[a-f0-9]{32}$ ]] || refuse 'incomplete baseline fingerprint'
  printf '%s\n' "$digest"
}
owned=false
cleanup(){ if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb --force "$TARGET_DB"; fi; return 0; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists; not owned'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17
  and to_regnamespace('genova_007') is not null and to_regnamespace('genova_008') is not null
  and to_regnamespace('genova_078') is null
  and to_regprocedure('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])') is null")" = t ] || refuse 'wrong source revision'
source_data="$(fingerprint "$SOURCE_DB")"
createdb -O postgres -T "$SOURCE_DB" "$TARGET_DB"; owned=true
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'clone data differs'
file "$TARGET_DB" supabase/migrations/20260928140000_active_membership_revocation_078.sql
file "$TARGET_DB" supabase/migrations/20260928175950_atomic_repertoire_assignments_082.sql
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'prerequisites changed baseline rows'
# A clone-only synthetic row must alter the exact baseline fingerprint. A dedicated
# sentinel column is not enough: exercise the same full-table aggregation/extraction query.
probe_id="$(q "$TARGET_DB" "insert into public.choirs(slug,name)
  values('fixture-085-fingerprint-probe','Synthetic fingerprint probe') returning id")"
[ "$(fingerprint "$TARGET_DB")" != "$source_data" ] || refuse 'fingerprint missed inserted row'
q "$TARGET_DB" "delete from public.choirs where id='$probe_id' and slug='fixture-085-fingerprint-probe'" >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'fingerprint probe changed baseline'
file "$TARGET_DB" supabase/tests/085_two_choir_connected.sql >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'connected transaction changed baseline rows'
echo 'PASS 007 fresh choirs -> 008 invitations -> separate profiles/catalogs -> repertoire/atomic assignments'
echo 'PASS A/B reads, shared session switch, old object refusal, wrong recipient, role removal and revocation'
file "$TARGET_DB" supabase/tests/008_choir_invitations.sql >/dev/null
file "$TARGET_DB" supabase/tests/083_new_choir_profile.sql >/dev/null
file "$TARGET_DB" supabase/tests/084_stale_choir_create.sql >/dev/null
[ "$(fingerprint "$TARGET_DB")" = "$source_data" ] || refuse 'regressions changed baseline rows'
[ "$(fingerprint "$SOURCE_DB")" = "$source_data" ] || refuse 'source changed'
echo 'PASS 008/083/084 regressions and unchanged source/clone baseline'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'target remains'
echo 'PASS exact owned clone removed'
