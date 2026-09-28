#!/usr/bin/env bash
# LOCAL PG17 ONLY: 043 original test, exact creator/default-ACL fidelity, one disposable clone.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$REPO_ROOT"
SOURCE_DB="${GENOVA_079_SOURCE_DATABASE:-genova_068_test_restore}"
TARGET_DB="${PGDATABASE:-genova_079_test_local}"
PG_HOST="${PGHOST:-127.0.0.1}"; PG_PORT="${PGPORT:-5432}"
CREATOR="${GENOVA_079_CREATOR:-postgres}"
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
[[ "$SOURCE_DB" =~ ^genova_(068|079_source)_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe source'
[[ "$TARGET_DB" =~ ^genova_079_test[A-Za-z0-9_]*$ ]] || refuse 'unsafe target'
[ "$SOURCE_DB" != "$TARGET_DB" ] || refuse 'source equals target'
[ "$PG_HOST" = 127.0.0.1 ] || refuse 'loopback required'
[[ "$PG_PORT" =~ ^[0-9]+$ ]] || refuse 'invalid port'
# The second mode deliberately mirrors the original runner creator, with the verified local user.
[[ "$CREATOR" = postgres || "$CREATOR" = local ]] || refuse 'unsupported creator'
export PGHOST="$PG_HOST" PGPORT="$PG_PORT"
for binary in psql createdb dropdb; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
if [ "$CREATOR" = postgres ]; then CREATOR_OPTIONS='-c role=postgres'; else CREATOR_OPTIONS=''; fi
q(){ PGOPTIONS="$CREATOR_OPTIONS" psql -X -h "$PG_HOST" -p "$PG_PORT" -d "$1" -v ON_ERROR_STOP=1 -Atq -c "$2"; }
file(){ PGOPTIONS="$CREATOR_OPTIONS" psql -X -h "$PG_HOST" -p "$PG_PORT" -d "$1" -v ON_ERROR_STOP=1 -q -f "$2"; }
exists(){ [ "$(q postgres "select exists(select 1 from pg_database where datname='$1');")" = t ]; }
status_snapshot(){ q "$1" "select coalesce(md5(concat_ws('|',pg_get_functiondef(p.oid),p.proacl::text,
  pg_get_userbyid(p.proowner),obj_description(p.oid,'pg_proc'))),'absent')
  from (select to_regprocedure('public.mark_chat_message_status(uuid,text)') as id) f
  left join pg_proc p on p.oid=f.id;"; }
data(){ q "$1" "select md5(concat_ws('|',
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from auth.users r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choirs r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choir_members r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.roles r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.choir_member_roles r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.repertoire r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.chat_rooms r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.chat_room_members r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.chat_messages r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.chat_message_status r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by session_id)::text,'[]') from genova_005.active_choir_sessions r),
  (select coalesce(jsonb_agg(to_jsonb(r) order by id)::text,'[]') from public.push_subscriptions r)));"; }
MIGRATION=supabase/migrations/20260928150000_message_status_rpc_privileges_079.sql
DOWN=supabase/rollback/079_message_status_rpc_privileges_down.sql
TEST=supabase/tests/079_message_status_rpc_privileges.sql
OLD_TEST=supabase/tests/043_chat_message_status_authority.sql
owned=false
cleanup(){ if [ "$owned" = true ] && exists "$TARGET_DB"; then dropdb -h "$PG_HOST" -p "$PG_PORT" --force "$TARGET_DB"; fi; }
trap cleanup EXIT; trap 'exit 130' INT; trap 'exit 143' TERM
exists "$SOURCE_DB" || refuse 'source missing'
exists "$TARGET_DB" && refuse 'target already exists'
[ "$(q "$SOURCE_DB" "select current_setting('server_version_num')::int/10000=17
  and to_regnamespace('genova_043') is null and to_regnamespace('genova_079') is null;")" = t ] || refuse 'source prerequisites differ'
source_data="$(data "$SOURCE_DB")"; source_status="$(status_snapshot "$SOURCE_DB")"
if [ "$CREATOR" = postgres ]; then createdb -h "$PG_HOST" -p "$PG_PORT" -O postgres -T "$SOURCE_DB" "$TARGET_DB";
else createdb -h "$PG_HOST" -p "$PG_PORT" -T "$SOURCE_DB" "$TARGET_DB"; fi
owned=true
[ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'clone mismatch'
if missing="$(file "$TARGET_DB" "$MIGRATION" 2>&1)"; then refuse 'missing prerequisite accepted'; fi
[[ "$missing" == *'043 prerequisite missing'* ]] || refuse 'wrong prerequisite refusal'
for prerequisite in \
  supabase/migrations/20260919190000_chat_room_membership_authority_041.sql \
  supabase/migrations/20260919193000_chat_social_membership_authority_042.sql \
  supabase/migrations/20260919194500_chat_message_status_authority_043.sql \
  supabase/migrations/20260928140000_active_membership_revocation_078.sql; do
  file "$TARGET_DB" "$prerequisite"
done
prior_status="$(status_snapshot "$TARGET_DB")"
echo "079: isolated clone; migration creator=$CREATOR; original defaults unchanged"
if [ "$CREATOR" = postgres ]; then
  [ "$(q "$TARGET_DB" "select has_function_privilege('anon','public.mark_chat_message_status(uuid,text)','EXECUTE');")" = t ] || refuse 'Supabase default-ACL reproduction missing'
  if before="$(file "$TARGET_DB" "$OLD_TEST" 2>&1)"; then refuse '043 unexpectedly passes before grant repair'; fi
  [[ "$before" == *'043: RPC privilege boundary is wrong'* ]] || refuse 'wrong 043 failure'
  echo 'PASS reproduced original 043 grant failure under postgres/Supabase defaults'
else
  file "$TARGET_DB" "$OLD_TEST"
  echo 'PASS original local-creator 043 matrix (different default ACLs)'
fi
file "$TARGET_DB" "$MIGRATION"
for test in "$TEST" "$OLD_TEST" supabase/tests/078_active_membership_revocation.sql; do file "$TARGET_DB" "$test"; done
fixed_status="$(status_snapshot "$TARGET_DB")"
if file "$TARGET_DB" "$MIGRATION" >/dev/null 2>&1; then refuse 'repeat forward accepted'; fi
[ "$(status_snapshot "$TARGET_DB")" = "$fixed_status" ] || refuse 'repeat forward changed authority'
echo 'PASS exact effective grants, real anon/service refusals, original 043 behavior and 078 revocation'
file "$TARGET_DB" "$DOWN"
[ "$(status_snapshot "$TARGET_DB")" = "$prior_status" ] || refuse 'exact ACL/body/owner/comment down mismatch'
file "$TARGET_DB" "$MIGRATION"
file "$TARGET_DB" "$TEST"
file "$TARGET_DB" "$OLD_TEST"
[ "$(status_snapshot "$TARGET_DB")" = "$fixed_status" ] || refuse 'reapply differs'
[ "$(data "$TARGET_DB")" = "$source_data" ] || refuse 'target baseline changed'
[ "$(data "$SOURCE_DB")" = "$source_data" ] && [ "$(status_snapshot "$SOURCE_DB")" = "$source_status" ] || refuse 'source changed'
echo 'PASS exact down/reapply, unchanged source/target data and source status function'
cleanup; owned=false
exists "$TARGET_DB" && refuse 'target remains'
echo 'PASS disposable clone removed'
