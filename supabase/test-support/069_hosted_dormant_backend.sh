#!/usr/bin/env bash
# 069 — Exact dormant private-R2 hosted schema and Edge deployment.
#
# Modes:
#   local-rehearsal  — clone the retained 068 restore, apply the exact package, verify and remove.
#   hosted-migrate   — apply only the approved explicit package to the exact linked project.
#   hosted-verify    — read-only hosted ledger/schema/secret verification.
#   deploy-functions — deploy only the thirteen approved dormant Edge Functions, then verify.

set -euo pipefail
umask 077

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$REPO_ROOT"

MODE="${1:-}"
EXPECTED_REF="hievmwwctjjlhmssoxsu"
EXPECTED_POOLER="postgresql://postgres.${EXPECTED_REF}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
LOCAL_SOURCE="genova_068_test_restore"
LOCAL_TARGET="genova_069_test_hosted_package"
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
CREATEDB="/opt/homebrew/opt/postgresql@17/bin/createdb"
DROPDB="/opt/homebrew/opt/postgresql@17/bin/dropdb"
SUPABASE="$(command -v supabase || true)"

refuse() { echo "REFUSED: $*" >&2; exit 2; }
[ -x "$PSQL" ] || refuse "missing PostgreSQL 17 psql"
[ -x "$PG_DUMP" ] || refuse "missing PostgreSQL 17 pg_dump"
[ -x "$CREATEDB" ] || refuse "missing PostgreSQL 17 createdb"
[ -x "$DROPDB" ] || refuse "missing PostgreSQL 17 dropdb"
[ -x "$SUPABASE" ] || refuse "missing Supabase CLI"
[ "$(sed -n '1p' supabase/.temp/project-ref 2>/dev/null)" = "$EXPECTED_REF" ] \
  || refuse "linked project is not $EXPECTED_REF"
POOLER_URL="$(sed -n '1p' supabase/.temp/pooler-url 2>/dev/null)"
[ "$POOLER_URL" = "$EXPECTED_POOLER" ] || refuse "pooler target mismatch"

migrations=(
  "20260919183000|assignment_review_audio_069_prerequisite|supabase/migrations/20260516_assignment_review_audio.sql"
  "20260919190000|chat_room_membership_authority_041|supabase/migrations/20260919190000_chat_room_membership_authority_041.sql"
  "20260919193000|chat_social_membership_authority_042|supabase/migrations/20260919193000_chat_social_membership_authority_042.sql"
  "20260919194500|chat_message_status_authority_043|supabase/migrations/20260919194500_chat_message_status_authority_043.sql"
  "20260919201500|chat_core_message_authority_044|supabase/migrations/20260919201500_chat_core_message_authority_044.sql"
  "20260919213000|chat_text_send_idempotency_045|supabase/migrations/20260919213000_chat_text_send_idempotency_045.sql"
  "20260920205054|private_r2_repertoire_read_053|supabase/migrations/20260920205054_private_r2_repertoire_read_053.sql"
  "20260921185113|private_r2_repertoire_upload_054|supabase/migrations/20260921185113_private_r2_repertoire_upload_054.sql"
  "20260922071942|private_r2_repertoire_lifecycle_055|supabase/migrations/20260922071942_private_r2_repertoire_lifecycle_055.sql"
  "20260922171847|private_r2_repertoire_cover_056|supabase/migrations/20260922171847_private_r2_repertoire_cover_056.sql"
  "20260922221500|private_r2_assignment_versions_057|supabase/migrations/20260922221500_private_r2_assignment_versions_057.sql"
  "20260923103000|private_r2_assignment_review_audio_058|supabase/migrations/20260923103000_private_r2_assignment_review_audio_058.sql"
  "20260923170000|private_r2_repertoire_comment_audio_059|supabase/migrations/20260923170000_private_r2_repertoire_comment_audio_059.sql"
  "20260923193000|private_r2_chat_media_060|supabase/migrations/20260923193000_private_r2_chat_media_060.sql"
  "20260923194500|private_r2_copy_inventory_063|supabase/migrations/20260923194500_private_r2_copy_inventory_063.sql"
  "20260925083611|private_r2_activation_065|supabase/migrations/20260925083611_private_r2_activation_065.sql"
)

functions=(
  repertoire-file repertoire-upload repertoire-file-lifecycle
  assignment-file assignment-upload assignment-review-file assignment-review-upload
  repertoire-comment-file repertoire-comment-upload repertoire-comment-lifecycle
  chat-media-file chat-media-upload chat-media-lifecycle
)

for item in "${migrations[@]}"; do
  IFS='|' read -r version name file <<< "$item"
  [[ "$version" =~ ^[0-9]{14}$ ]] || refuse "invalid migration version: $version"
  [[ "$name" =~ ^[a-z0-9_]+$ ]] || refuse "invalid migration name: $name"
  [ -f "$file" ] || refuse "missing migration: $file"
done

local_q() {
  "$PSQL" -X -Atq -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 5432 -d "$1" -c "$2"
}
local_exists() {
  [ "$(local_q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]
}
schema_hash() {
  "$PG_DUMP" -h 127.0.0.1 -p 5432 -d "$1" --schema-only --no-owner --no-privileges |
    sed -E '/^\\(un)?restrict /d' | shasum -a 256 | awk '{print $1}'
}

TEMP_ROOT=""
LOCAL_CREATED=false
cleanup() {
  unset PGPASSWORD || true
  if [ "$LOCAL_CREATED" = true ] && local_exists "$LOCAL_TARGET"; then
    "$DROPDB" --force -h 127.0.0.1 -p 5432 "$LOCAL_TARGET" >/dev/null 2>&1 || true
  fi
  if [ -n "$TEMP_ROOT" ]; then
    case "$TEMP_ROOT" in
      /tmp/genova-069.*) rm -R "$TEMP_ROOT" ;;
      *) refuse "unsafe temporary path at cleanup" ;;
    esac
  fi
}
trap cleanup EXIT HUP INT TERM

make_wrapped_migration() {
  local version="$1" name="$2" source="$3" hash="$4" output="$5"
  GENOVA_069_VERSION="$version" GENOVA_069_NAME="$name" GENOVA_069_HASH="$hash" \
    GENOVA_069_SOURCE="$source" GENOVA_069_OUTPUT="$output" ruby <<'RUBY'
source = ENV.fetch('GENOVA_069_SOURCE')
output = ENV.fetch('GENOVA_069_OUTPUT')
version = ENV.fetch('GENOVA_069_VERSION')
name = ENV.fetch('GENOVA_069_NAME')
hash = ENV.fetch('GENOVA_069_HASH')
sql = File.binread(source)
ledger = <<~SQL
  insert into supabase_migrations.schema_migrations
    (version, statements, name, created_by, idempotency_key)
  values
    ('#{version}', null, '#{name}', 'codex-069-dormant-backend', '#{hash}');
SQL
if sql.match?(/^[ \t]*begin;[ \t]*$/i) && sql.match?(/^[ \t]*commit;[ \t]*\s*\z/i)
  sql = sql.sub(/^[ \t]*commit;[ \t]*\s*\z/i, "#{ledger}commit;\n")
else
  sql = "begin;\n#{sql}\n#{ledger}commit;\n"
end
File.binwrite(output, sql)
RUBY
}

verify_secrets() {
  local json
  json="$($SUPABASE secrets list --project-ref "$EXPECTED_REF" --output json)"
  GENOVA_069_SECRET_JSON="$json" ruby <<'RUBY'
require 'json'
require 'digest'
items = JSON.parse(ENV.fetch('GENOVA_069_SECRET_JSON'))
digests = items.to_h { |row| [row.fetch('name'), row.fetch('value')] }
expected = {
  'R2_ACCOUNT_ID' => 'b642dee69121237ba20cc1a1bb50f1c5',
  'R2_BUCKET' => 'genova-private',
  'R2_JURISDICTION' => 'eu',
  'REPERTOIRE_STORAGE_MODE' => 'legacy',
  'REPERTOIRE_R2_UPLOAD_ENABLED' => 'false',
  'ASSIGNMENT_STORAGE_MODE' => 'legacy',
  'ASSIGNMENT_R2_UPLOAD_ENABLED' => 'false',
  'ASSIGNMENT_REVIEW_R2_ENABLED' => 'false',
  'REPERTOIRE_COMMENT_R2_ENABLED' => 'false',
  'CHAT_STORAGE_MODE' => 'legacy',
  'CHAT_R2_MEDIA_ENABLED' => 'false'
}
expected.each do |name, value|
  abort "REFUSED: missing or mismatched secret #{name}" unless digests[name] == Digest::SHA256.hexdigest(value)
end
%w[R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY].each do |name|
  abort "REFUSED: missing credential secret #{name}" unless digests[name]&.match?(/\A[0-9a-f]{64}\z/)
end
puts 'PASS exact dormant secret names and non-secret digests'
RUBY
}

verify_database() {
  local kind="$1" target="$2" query result
  query="select string_agg(nspname,' ' order by nspname) from pg_namespace where nspname ~ '^genova_(041|042|043|044|045|053|054|055|057|058|059|060|063|065)$'"
  if [ "$kind" = local ]; then
    result="$(local_q "$target" "$query")"
  else
    result="$("$PSQL" -X -Atq -v ON_ERROR_STOP=1 "$target" -c "$query")"
  fi
  [ "$result" = "genova_041 genova_042 genova_043 genova_044 genova_045 genova_053 genova_054 genova_055 genova_057 genova_058 genova_059 genova_060 genova_063 genova_065" ] \
    || refuse "hosted schema chain mismatch: $result"

  local ledger_query="select count(*) from supabase_migrations.schema_migrations where created_by='codex-069-dormant-backend' and version in ('20260919183000','20260919190000','20260919193000','20260919194500','20260919201500','20260919213000','20260920205054','20260921185113','20260922071942','20260922171847','20260922221500','20260923103000','20260923170000','20260923193000','20260923194500','20260925083611')"
  if [ "$kind" = local ]; then
    result="$(local_q "$target" "$ledger_query")"
  else
    result="$("$PSQL" -X -Atq -v ON_ERROR_STOP=1 "$target" -c "$ledger_query")"
  fi
  [ "$result" = 16 ] || refuse "migration ledger count mismatch: $result"
  echo "PASS exact 069 schema chain and 16-entry ledger"
}

apply_package() {
  local kind="$1" target="$2"
  TEMP_ROOT="$(mktemp -d /tmp/genova-069.XXXXXX)"
  for item in "${migrations[@]}"; do
    IFS='|' read -r version name file <<< "$item"
    local hash wrapped already
    hash="$(shasum -a 256 "$file" | awk '{print $1}')"
    if [ "$kind" = local ]; then
      already="$(local_q "$target" "select count(*) from supabase_migrations.schema_migrations where version='$version'")"
    else
      already="$("$PSQL" -X -Atq -v ON_ERROR_STOP=1 "$target" -c "select count(*) from supabase_migrations.schema_migrations where version='$version'")"
    fi
    if [ "$already" = 1 ]; then
      echo "PASS already applied: $version $name"
      continue
    fi
    [ "$already" = 0 ] || refuse "duplicate ledger version: $version"
    wrapped="$TEMP_ROOT/${version}_${name}.sql"
    make_wrapped_migration "$version" "$name" "$file" "$hash" "$wrapped"
    if [ "$kind" = local ]; then
      PGOPTIONS='-c role=postgres' "$PSQL" -X -q -v ON_ERROR_STOP=1 \
        -h 127.0.0.1 -p 5432 -d "$target" -f "$wrapped" >/dev/null
    else
      PGOPTIONS='-c role=postgres' "$PSQL" -X -q -v ON_ERROR_STOP=1 "$target" \
        -f "$wrapped" >/dev/null
    fi
    echo "PASS applied: $version $name sha256=$hash"
  done
}

hosted_setup() {
  [ -n "${SUPABASE_DB_PASSWORD:-}" ] || refuse "SUPABASE_DB_PASSWORD environment variable is required"
  export PGPASSWORD="$SUPABASE_DB_PASSWORD"
  unset SUPABASE_DB_PASSWORD
  LIVE_URL="${POOLER_URL}?sslmode=require&connect_timeout=10&application_name=genova-069-dormant-backend"
}

case "$MODE" in
  local-rehearsal)
    local_exists "$LOCAL_SOURCE" || refuse "missing retained 068 restore"
    local_exists "$LOCAL_TARGET" && refuse "local rehearsal target already exists"
    source_hash="$(schema_hash "$LOCAL_SOURCE")"
    "$CREATEDB" -h 127.0.0.1 -p 5432 -T "$LOCAL_SOURCE" "$LOCAL_TARGET"
    LOCAL_CREATED=true
    local_q postgres "alter database \"$LOCAL_TARGET\" owner to postgres" >/dev/null
    local_q "$LOCAL_TARGET" 'grant usage on schema extensions to postgres' >/dev/null
    apply_package local "$LOCAL_TARGET"
    verify_database local "$LOCAL_TARGET"
    [ "$(schema_hash "$LOCAL_SOURCE")" = "$source_hash" ] || refuse "068 restore source changed"
    "$DROPDB" --force -h 127.0.0.1 -p 5432 "$LOCAL_TARGET"
    LOCAL_CREATED=false
    local_exists "$LOCAL_TARGET" && refuse "local rehearsal target remains"
    echo "PASS local wrapper rehearsal, source unchanged and target removed"
    ;;
  hosted-migrate)
    verify_secrets
    hosted_setup
    identity="$("$PSQL" -X -Atq -v ON_ERROR_STOP=1 "$LIVE_URL" -c "select current_database()||'|'||current_setting('server_version_num')||'|'||current_user||'|'||pg_is_in_recovery()")"
    case "$identity" in postgres\|17*\|postgres\|false) ;; *) refuse "unexpected hosted database identity" ;; esac
    apply_package hosted "$LIVE_URL"
    verify_database hosted "$LIVE_URL"
    echo "PASS hosted exact migration package"
    ;;
  hosted-verify)
    verify_secrets
    hosted_setup
    verify_database hosted "$LIVE_URL"
    ;;
  deploy-functions)
    verify_secrets
    hosted_setup
    verify_database hosted "$LIVE_URL"
    deploy_from="${GENOVA_069_DEPLOY_FROM:-${functions[0]}}"
    [[ " ${functions[*]} " = *" $deploy_from "* ]] || refuse "invalid deploy resume function: $deploy_from"
    deploying=false
    for function_name in "${functions[@]}"; do
      [ "$function_name" = "$deploy_from" ] && deploying=true
      [ "$deploying" = true ] || continue
      "$SUPABASE" functions deploy "$function_name" --project-ref "$EXPECTED_REF" \
        --use-api --no-verify-jwt
    done
    function_json="$($SUPABASE functions list --project-ref "$EXPECTED_REF")"
    GENOVA_069_FUNCTION_JSON="$function_json" GENOVA_069_FUNCTION_NAMES="${functions[*]}" ruby <<'RUBY'
require 'json'
rows = JSON.parse(ENV.fetch('GENOVA_069_FUNCTION_JSON'))
by_name = rows.to_h { |row| [row.fetch('slug'), row] }
ENV.fetch('GENOVA_069_FUNCTION_NAMES').split.each do |name|
  row = by_name[name]
  abort "REFUSED: function missing or inactive: #{name}" unless row && row['status'] == 'ACTIVE' && row['version'].to_i.positive? && row['verify_jwt'] == false
  puts "PASS function #{name} version=#{row['version']} ACTIVE verify_jwt=false"
end
RUBY
    ;;
  *)
    refuse "mode must be local-rehearsal, hosted-migrate, hosted-verify or deploy-functions"
    ;;
esac
