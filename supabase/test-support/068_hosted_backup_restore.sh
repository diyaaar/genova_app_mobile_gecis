#!/usr/bin/env bash
# 068 — Read-only hosted logical backup and isolated PostgreSQL 17 restore.
#
# The only remote operations are SELECT/pg_dump against the exact linked project.
# The database password is read silently from an interactive terminal and exists only
# in this process. It is never written to disk or printed.

set -euo pipefail
umask 077

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$REPO_ROOT"

EXPECTED_REF="hievmwwctjjlhmssoxsu"
EXPECTED_POOLER="postgresql://postgres.${EXPECTED_REF}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
TARGET_DB="${GENOVA_068_TARGET_DB:-genova_068_test_restore}"
ARTIFACT_DIR="${GENOVA_068_ARTIFACT_DIR:-/Users/alidiyarduran/Documents/Codex/2026-09-26/genova-r2-checkpoint-068}"
PG_HOST="127.0.0.1"
PG_PORT="5432"

PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
CREATEDB="/opt/homebrew/opt/postgresql@17/bin/createdb"
DROPDB="/opt/homebrew/opt/postgresql@17/bin/dropdb"
RESTORE_PREP="supabase/test-support/restore-prep.sql"

refuse() { echo "REFUSED: $*" >&2; exit 2; }
for tool in "$PSQL" "$PG_DUMP" "$CREATEDB" "$DROPDB"; do
  [ -x "$tool" ] || refuse "missing PostgreSQL 17 tool: $tool"
done
[ -f "$RESTORE_PREP" ] || refuse "missing restore preparation"
[ "$TARGET_DB" = "genova_068_test_restore" ] || refuse "unsafe target database: $TARGET_DB"
[ "$ARTIFACT_DIR" = "/Users/alidiyarduran/Documents/Codex/2026-09-26/genova-r2-checkpoint-068" ] \
  || refuse "unexpected artifact directory"
[ "$(sed -n '1p' supabase/.temp/project-ref 2>/dev/null)" = "$EXPECTED_REF" ] \
  || refuse "linked project is not $EXPECTED_REF"
POOLER_URL="$(sed -n '1p' supabase/.temp/pooler-url 2>/dev/null)"
[ "$POOLER_URL" = "$EXPECTED_POOLER" ] || refuse "pooler target mismatch"
[ -t 0 ] || refuse "interactive terminal required for hidden password entry"

local_q() {
  "$PSQL" -X -Atq -v ON_ERROR_STOP=1 -h "$PG_HOST" -p "$PG_PORT" -d "$1" -c "$2"
}
exists() {
  [ "$(local_q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]
}

[ "$(local_q postgres "select current_setting('server_version_num') like '17%'")" = t ] \
  || refuse "local PostgreSQL 17 required"
exists "$TARGET_DB" && refuse "target database already exists: $TARGET_DB"

mkdir -p "$ARTIFACT_DIR"
chmod 700 "$ARTIFACT_DIR"
[ "$(stat -f '%Lp' "$ARTIFACT_DIR")" = 700 ] || refuse "artifact directory is not mode 0700"

STAMP="$(date -u '+%Y%m%dT%H%M%SZ')"
BACKUP="$ARTIFACT_DIR/genova_full_${STAMP}.sql"
PRE_COUNTS="$ARTIFACT_DIR/live_counts_before_${STAMP}.tsv"
POST_COUNTS="$ARTIFACT_DIR/live_counts_after_${STAMP}.tsv"
RESTORE_COUNTS="$ARTIFACT_DIR/restore_counts_${STAMP}.tsv"
LIVE_SCHEMAS="$ARTIFACT_DIR/live_schemas_${STAMP}.txt"
RESTORE_SCHEMAS="$ARTIFACT_DIR/restore_schemas_${STAMP}.txt"
ROLE_SQL="$ARTIFACT_DIR/live_role_attributes_${STAMP}.sql"
RESTORE_LOG="$ARTIFACT_DIR/restore_${STAMP}.log"
SUMMARY="$ARTIFACT_DIR/summary_${STAMP}.txt"

created=false
success=false
cleanup() {
  unset PGPASSWORD GENOVA_068_DB_PASSWORD || true
  if [ "$success" != true ] && [ "$created" = true ] && exists "$TARGET_DB"; then
    "$DROPDB" --force -h "$PG_HOST" -p "$PG_PORT" "$TARGET_DB" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT HUP INT TERM

printf 'Supabase database password for %s: ' "$EXPECTED_REF" >&2
IFS= read -r -s GENOVA_068_DB_PASSWORD
printf '\n' >&2
[ -n "$GENOVA_068_DB_PASSWORD" ] || refuse "empty database password"
export PGPASSWORD="$GENOVA_068_DB_PASSWORD"
unset GENOVA_068_DB_PASSWORD

LIVE_URL="${POOLER_URL}?sslmode=require&connect_timeout=10&application_name=genova-068-read-only"
live_q() {
  "$PSQL" -X -Atq -v ON_ERROR_STOP=1 "$LIVE_URL" -c "$1"
}

identity="$(live_q "select current_database() || '|' || current_setting('server_version_num') || '|' || current_user || '|' || pg_is_in_recovery()")"
case "$identity" in
  postgres\|17*\|postgres."$EXPECTED_REF"\|f) ;;
  *) refuse "unexpected live database identity" ;;
esac

SCHEMA_QUERY="select nspname from pg_namespace where nspname in ('auth','public','supabase_migrations') or nspname like 'genova\\_%' escape '\\' order by nspname"
COUNT_QUERY="select format('%I.%I',t.table_schema,t.table_name), (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint from information_schema.tables t where t.table_type='BASE TABLE' and (t.table_schema in ('auth','public','supabase_migrations') or t.table_schema like 'genova\\_%' escape '\\') order by 1"

live_q "$SCHEMA_QUERY" > "$LIVE_SCHEMAS"
[ -s "$LIVE_SCHEMAS" ] || refuse "live schema inventory is empty"
grep -qx auth "$LIVE_SCHEMAS" || refuse "auth schema missing"
grep -qx public "$LIVE_SCHEMAS" || refuse "public schema missing"
grep -qx supabase_migrations "$LIVE_SCHEMAS" || refuse "migration schema missing"

"$PSQL" -X -Atq -F $'\t' -v ON_ERROR_STOP=1 "$LIVE_URL" -c "$COUNT_QUERY" > "$PRE_COUNTS"
[ -s "$PRE_COUNTS" ] || refuse "live table counts are empty"

live_q "select format('alter role %I with %s %s %s %s %s %s %s %s;',rolname,case when rolsuper then 'superuser' else 'nosuperuser' end,case when rolinherit then 'inherit' else 'noinherit' end,case when rolcreaterole then 'createrole' else 'nocreaterole' end,case when rolcreatedb then 'createdb' else 'nocreatedb' end,case when rolcanlogin then 'login' else 'nologin' end,case when rolreplication then 'replication' else 'noreplication' end,case when rolbypassrls then 'bypassrls' else 'nobypassrls' end,case when rolconnlimit < 0 then 'connection limit -1' else 'connection limit '||rolconnlimit end) from pg_roles where rolname in ('postgres','anon','authenticated','service_role','authenticator','dashboard_user','pgbouncer','supabase_admin','supabase_auth_admin','supabase_storage_admin','supabase_realtime_admin','supabase_replication_admin','supabase_read_only_user') order by rolname" > "$ROLE_SQL"
[ "$(wc -l < "$ROLE_SQL" | tr -d ' ')" -eq 13 ] || refuse "unexpected live role inventory"

schema_args=()
while IFS= read -r schema; do
  case "$schema" in
    auth|public|supabase_migrations|genova_*) schema_args+=("--schema=$schema") ;;
    *) refuse "unsafe schema in inventory" ;;
  esac
done < "$LIVE_SCHEMAS"

"$PG_DUMP" "$LIVE_URL" "${schema_args[@]}" --file "$BACKUP"
chmod 600 "$BACKUP"
[ "$(stat -f '%Lp' "$BACKUP")" = 600 ] || refuse "backup is not mode 0600"
[ "$(stat -f '%z' "$BACKUP")" -gt 1000 ] || refuse "backup is unexpectedly small"

"$PSQL" -X -Atq -F $'\t' -v ON_ERROR_STOP=1 "$LIVE_URL" -c "$COUNT_QUERY" > "$POST_COUNTS"
diff -u "$PRE_COUNTS" "$POST_COUNTS" >/dev/null || refuse "live table counts changed during backup"

"$CREATEDB" -h "$PG_HOST" -p "$PG_PORT" "$TARGET_DB"
created=true
"$PSQL" -X -q -v ON_ERROR_STOP=1 -h "$PG_HOST" -p "$PG_PORT" -d "$TARGET_DB" \
  -f "$RESTORE_PREP" >/dev/null
"$PSQL" -X -q -v ON_ERROR_STOP=1 -h "$PG_HOST" -p "$PG_PORT" -d "$TARGET_DB" \
  -f "$ROLE_SQL" >/dev/null
local_q postgres "alter database \"$TARGET_DB\" owner to postgres" >/dev/null
local_q "$TARGET_DB" 'drop schema public cascade' >/dev/null

"$PSQL" -X -v ON_ERROR_STOP=1 -h "$PG_HOST" -p "$PG_PORT" -d "$TARGET_DB" \
  -f "$BACKUP" > "$RESTORE_LOG" 2>&1
chmod 600 "$RESTORE_LOG"

local_q "$TARGET_DB" "$SCHEMA_QUERY" > "$RESTORE_SCHEMAS"
diff -u "$LIVE_SCHEMAS" "$RESTORE_SCHEMAS" >/dev/null || refuse "restored schema inventory mismatch"
"$PSQL" -X -Atq -F $'\t' -v ON_ERROR_STOP=1 -h "$PG_HOST" -p "$PG_PORT" -d "$TARGET_DB" \
  -c "$COUNT_QUERY" > "$RESTORE_COUNTS"
diff -u "$POST_COUNTS" "$RESTORE_COUNTS" >/dev/null || refuse "restored table counts mismatch"

hash="$(shasum -a 256 "$BACKUP" | awk '{print $1}')"
bytes="$(stat -f '%z' "$BACKUP")"
lines="$(wc -l < "$BACKUP" | tr -d ' ')"
tables="$(wc -l < "$POST_COUNTS" | tr -d ' ')"
schemas="$(wc -l < "$LIVE_SCHEMAS" | tr -d ' ')"
{
  echo "project_ref=$EXPECTED_REF"
  echo "backup_file=$(basename "$BACKUP")"
  echo "sha256=$hash"
  echo "bytes=$bytes"
  echo "lines=$lines"
  echo "schemas=$schemas"
  echo "tables=$tables"
  echo "restore_database=$TARGET_DB"
  echo "source_counts_stable=true"
  echo "restore_counts_match=true"
  echo "completed_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
} > "$SUMMARY"
chmod 600 "$PRE_COUNTS" "$POST_COUNTS" "$RESTORE_COUNTS" "$LIVE_SCHEMAS" \
  "$RESTORE_SCHEMAS" "$ROLE_SQL" "$SUMMARY"

success=true
unset PGPASSWORD
echo "PASS exact hosted project and PostgreSQL 17 identity"
echo "PASS private logical dump: bytes=$bytes lines=$lines sha256=$hash"
echo "PASS live counts stable and local restore matches: schemas=$schemas tables=$tables"
echo "PASS retained isolated database: $TARGET_DB"
echo "PASS private evidence: $SUMMARY"
