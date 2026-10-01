#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export PGHOST=127.0.0.1 PGPORT=5432
unset PGHOSTADDR PGSERVICE PGSERVICEFILE PGPASSFILE PGOPTIONS PGDATABASE PGUSER PGPASSWORD
SOURCE=genova_068_test_restore
TARGET=genova_090_http_overlap_test
SCRATCH=spike/090-runtime/http-overlap
owned=false
scratch_owned=false
refuse() { echo "REFUSED: $*" >&2; exit 2; }
q() { psql -X -Atq -v ON_ERROR_STOP=1 -d "$1" -c "$2"; }
exists() { [ "$(q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]; }
snapshot() {
  q "$SOURCE" "select jsonb_build_array(
    (select md5(coalesce(jsonb_agg(to_jsonb(t) order by id)::text,'[]')) from auth.users t),
    (select md5(coalesce(jsonb_agg(to_jsonb(t) order by id)::text,'[]')) from public.choirs t),
    (select md5(coalesce(jsonb_agg(to_jsonb(t) order by id)::text,'[]')) from public.choir_members t),
    (select md5(coalesce(jsonb_agg(to_jsonb(t) order by id)::text,'[]')) from public.repertoire t),
    (select md5(coalesce(jsonb_agg(to_jsonb(t) order by id)::text,'[]')) from public.repertoire_files t))"
}
cleanup() {
  if [ "$owned" = true ]; then dropdb --force "$TARGET"; owned=false; fi
  if [ "$scratch_owned" = true ] && [ -d "$SCRATCH" ] && [ ! -L "$SCRATCH" ]; then
    node --input-type=module -e 'import fs from "node:fs"; import path from "node:path"; const p=path.resolve("spike/090-runtime/http-overlap"); if(p!==process.cwd()+"/spike/090-runtime/http-overlap"||fs.lstatSync(p).isSymbolicLink())throw Error("unsafe");fs.rmSync(p,{recursive:true});'
    scratch_owned=false
  fi
}
trap cleanup EXIT
for binary in psql pg_dump createdb dropdb deno node; do command -v "$binary" >/dev/null || refuse "missing $binary"; done
exists "$SOURCE" || refuse missing-source
exists "$TARGET" && refuse target-exists
[ ! -e "$SCRATCH" ] || refuse scratch-exists
[ ! -L spike/090-runtime ] || refuse symlink-runtime-parent
for port in 18190 18191; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then refuse port-busy; fi
done
[ "$(q postgres "select current_setting('server_version_num') like '17%'")" = t ] || refuse wrong-pg
free=$(df -k . | awk 'NR==2{print $4}')
[ "$free" -gt 10690560 ] || refuse disk-floor
baseline=$(snapshot)
mkdir -p "$SCRATCH"
scratch_owned=true
PGOPTIONS='-c role=postgres' pg_dump --schema-only --no-owner --no-privileges -d "$SOURCE" >"$SCRATCH/schema.sql"
createdb -O postgres "$TARGET"; owned=true
PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 --single-transaction -d "$TARGET" -f "$SCRATCH/schema.sql" >"$SCRATCH/restore.log" 2>&1
chain=(
  20260909232000_repertoire_pdf_annotation_safe_save_024.sql
  20260919190000_chat_room_membership_authority_041.sql
  20260919193000_chat_social_membership_authority_042.sql
  20260919194500_chat_message_status_authority_043.sql
  20260919201500_chat_core_message_authority_044.sql
  20260919213000_chat_text_send_idempotency_045.sql
  20260920205054_private_r2_repertoire_read_053.sql
  20260922221500_private_r2_assignment_versions_057.sql
  20260516_assignment_review_audio.sql
  20260923103000_private_r2_assignment_review_audio_058.sql
  20260923170000_private_r2_repertoire_comment_audio_059.sql
  20260923193000_private_r2_chat_media_060.sql
  20260930080046_private_file_ticket_authority_090.sql
)
for migration in "${chain[@]}"; do
  PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET" -f "supabase/migrations/$migration" >>"$SCRATCH/migrations.log" 2>&1
done
PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET" -f supabase/tests/090_private_file_ticket_authority.sql >"$SCRATCH/matrix.log" 2>&1
echo 'PASS fresh five-family SQL matrix (ROLLBACK)'
# Derive only the existing synthetic setup, not source data or modified authority.
node --input-type=module -e 'import fs from "node:fs";const s=fs.readFileSync("supabase/tests/090_private_file_ticket_authority.sql","utf8");const p=s.split("do $test$")[0];if(!p.includes("begin;")||!p.includes("insert into auth.sessions"))throw Error("fixture changed");fs.writeFileSync("spike/090-runtime/http-overlap/fixture.sql",p+"\ncommit;\n");'
PGOPTIONS='-c role=postgres' psql -X -q -v ON_ERROR_STOP=1 -d "$TARGET" -f "$SCRATCH/fixture.sql" >"$SCRATCH/fixture.log" 2>&1
q "$TARGET" 'grant usage on schema public to service_role; grant select on public.repertoire_files,public.repertoire_file_storage_locations to service_role' >/dev/null
deno check --no-config --cached-only --node-modules-dir=none --no-lock supabase/test-support/090_http_overlap.ts
deno run --no-config --cached-only --node-modules-dir=none --no-lock \
  --allow-run=/opt/homebrew/opt/postgresql@17/bin/psql \
  --allow-env=PGHOST,PGPORT,PGDATABASE,PGUSER,PGPASSWORD,PGOPTIONS,PGSERVICE,PGSERVICEFILE,PGPASSFILE \
  --allow-read=apps/mobile/src/repertoire/__fixtures__/score_40p.pdf \
  --allow-write=docs/reports/090 \
  --allow-net=127.0.0.1:18190,127.0.0.1:18191 \
  supabase/test-support/090_http_overlap.ts
[ "$(snapshot)" = "$baseline" ] || refuse original-source-changed
echo 'PASS original068 five row hashes unchanged'
q "$SOURCE" 'select (select count(*) from auth.users),(select count(*) from public.choirs),(select count(*) from public.choir_members),(select count(*) from public.repertoire),(select count(*) from public.repertoire_files)'
cleanup
exists "$TARGET" && refuse target-remains
echo 'PASS owned database/scratch removed; no external provider cost'
