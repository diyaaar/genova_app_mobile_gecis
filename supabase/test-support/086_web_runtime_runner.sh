#!/usr/bin/env bash
# Exact disposable runtime only. Never use the linked root project or hosted fallback.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
RUN="$ROOT/spike/086-runtime"
CTX=colima-genova086
PROJECT=genova-086-runtime
refuse(){ echo "REFUSED: $*" >&2; exit 2; }
cd "$ROOT"
[ -d "$RUN" ] && [ ! -L "$RUN" ] || refuse 'owned runtime missing'
[ "$(sed -n 's/^project_id = "\([^"]*\)"/\1/p' "$RUN/supabase/config.toml")" = "$PROJECT" ] || refuse 'wrong project'
[ ! -e "$RUN/supabase/.temp/project-ref" ] || refuse 'linked runtime'
[ "$(df -Pk "$ROOT" | awk 'NR==2{print $4}')" -gt 10485760 ] || refuse 'disk floor'
export DOCKER_CONTEXT="$CTX"
umask 077
source_q(){ PGHOST=127.0.0.1 PGPORT=5432 PGOPTIONS='-c role=postgres' psql -X -Atq -v ON_ERROR_STOP=1 -d genova_068_test_restore -c "$1"; }
snapshot(){ source_q "select md5(concat_ws('|',
  (select jsonb_agg(to_jsonb(x) order by id)::text from auth.users x),
  (select jsonb_agg(to_jsonb(x) order by id)::text from public.choirs x),
  (select jsonb_agg(to_jsonb(x) order by id)::text from public.choir_members x),
  (select jsonb_agg(to_jsonb(x) order by id)::text from public.repertoire x),
  (select jsonb_agg(to_jsonb(x) order by id)::text from genova_008.invitations x),
  (select jsonb_agg(to_jsonb(x) order by session_id)::text from genova_005.active_choir_sessions x)))"; }
load_env(){
  [ -f "$RUN/runtime.env" ] || refuse 'runtime environment missing'
  set -a; source "$RUN/runtime.env"; set +a
  [[ "$API_URL" = http://127.0.0.1:54381 || "$API_URL" = http://localhost:54381 ]] || refuse 'nonlocal API'
  [[ "$DB_URL" = postgresql://postgres:*@127.0.0.1:54382/postgres ]] || refuse 'nonlocal DB'
  export NEXT_PUBLIC_SUPABASE_URL="$API_URL" NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
  export GENOVA_086_RUNTIME="$RUN"
}
target_file(){ psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -f "$1"; }
case "${1:-}" in
  prepare)
    [ ! -e "$RUN/fixture.json" ] || refuse 'already prepared'
    cp supabase/test-support/086_runtime_config.toml "$RUN/supabase/config.toml"
    snapshot >"$RUN/source-baseline"
    # Only function sources; no config/secrets from the linked production workdir.
    rsync -a supabase/functions/create-choir "$RUN/supabase/functions/"
    rsync -a supabase/functions/choir-invitations "$RUN/supabase/functions/"
    set +e
    supabase start --workdir "$RUN" --exclude analytics,vector,studio,meta,realtime,storage,imgproxy,inbucket \
      >"$RUN/service-start.log" 2>&1
    start_status=$?
    set -e
    # CLI 2.107 wrapper reports partial-stack exit 3. Accept only after proving all
    # five requested containers and actual endpoints; never ignore arbitrary failures.
    [ "$start_status" = 0 ] || [ "$start_status" = 3 ] || refuse 'service startup failed'
    [ "$(docker ps --filter label=com.supabase.cli.project=genova-086-runtime --format '{{.Names}}' | wc -l | tr -d ' ')" = 5 ] || refuse 'missing service'
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:54381/auth/v1/health)" = 200 ] || refuse 'Auth health'
    # Colima automatic TCP forwarding must be disabled; dedicated ssh binds loopback.
    for port in 54381 54382; do
      addresses="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -Fn | sed -n 's/^n//p')"
      [ "$addresses" = "127.0.0.1:$port" ] || refuse 'non-loopback or missing listener'
    done
    supabase status --workdir "$RUN" -o env >"$RUN/runtime.env" 2>"$RUN/status.log"
    load_env
    [ "$(docker inspect --format '{{index .Config.Labels "com.supabase.cli.project"}}' supabase_db_genova-086-runtime)" = "$PROJECT" ] || refuse 'wrong DB container'
    [ "$(psql "$DB_URL" -X -Atq -c "select current_setting('server_version_num')::int/10000=17 and (select count(*)=0 from auth.users)")" = t ] || refuse 'wrong/nonempty target'
    PGHOST=127.0.0.1 PGPORT=5432 PGOPTIONS='-c role=postgres' pg_dump -d genova_068_test_restore \
      --schema-only --schema=public --schema='genova_*' >"$RUN/schema.sql"
    # Clear only these known task-local application schemas after a partial preparation.
    # Auth is verified empty above; original source and unrelated database schemas stay intact.
    psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 \
      -c 'drop schema if exists genova_078, genova_008, genova_007, genova_005, genova_003, public cascade;' \
      >"$RUN/schema-clear.log" 2>&1
    # The source includes defaults for supabase_admin. Local `postgres` cannot set
    # those defaults; restore with the disposable container's bootstrap superuser,
    # retaining the dump's explicit original owners and ACLs rather than broadening grants.
    docker exec -i supabase_db_genova-086-runtime psql -U supabase_admin -d postgres \
      -X -q -v ON_ERROR_STOP=1 <"$RUN/schema.sql" >"$RUN/schema-restore.log" 2>&1
    target_file supabase/migrations/20260928140000_active_membership_revocation_078.sql
    target_file supabase/migrations/20260928175950_atomic_repertoire_assignments_082.sql
    # Sibling website callback triggers are irrelevant here and must not reach its provider.
    psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -c '
      alter table public.collab_inquiries disable trigger trigger_notify_collab;
      alter table public.contact_messages disable trigger trigger_notify_contact;
      alter table public.subscribers disable trigger trigger_notify_subscribers;'
    psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -c "notify pgrst,'reload schema';"
    [ "$(snapshot)" = "$(<"$RUN/source-baseline")" ] || refuse 'source changed'
    pnpm exec tsx supabase/test-support/086_web_acceptance.ts prepare
    echo 'PASS local schema-only Auth/REST/Edge runtime and synthetic preparation'
    ;;
  build|check)
    load_env
    if [ "$1" = check ]; then pnpm check >"$RUN/full-check.log" 2>&1
    else pnpm build >"$RUN/web-build.log" 2>&1; fi
    node -e 'const c=require("crypto"); console.log(c.createHash("sha256").update(process.env.NEXT_PUBLIC_SUPABASE_URL+process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).digest("hex"))' >"$RUN/web-public-hash"
    echo 'PASS guarded production web build'
    ;;
  web)
    load_env
    exec pnpm exec next start --hostname 127.0.0.1 --port 31086
    ;;
  browser)
    load_env
    [ "$(node -e 'const c=require("crypto"); console.log(c.createHash("sha256").update(process.env.NEXT_PUBLIC_SUPABASE_URL+process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).digest("hex"))')" = "$(<"$RUN/web-public-hash")" ] || refuse 'web compiled for different public config'
    pnpm exec tsx supabase/test-support/086_web_acceptance.ts browser
    [ "$(snapshot)" = "$(<"$RUN/source-baseline")" ] || refuse 'source changed'
    ;;
  cleanup-partial-auth)
    load_env
    [ ! -e "$RUN/fixture.json" ] || refuse 'complete fixture exists'
    pnpm exec tsx supabase/test-support/086_web_acceptance.ts cleanup-partial-auth
    ;;
  reset-fixture)
    load_env
    [ "$(snapshot)" = "$(<"$RUN/source-baseline")" ] || refuse 'source changed'
    pnpm exec tsx supabase/test-support/086_web_acceptance.ts verify-reset
    supabase stop --workdir "$RUN" --no-backup >"$RUN/service-stop.log" 2>&1
    node -e 'const fs=require("fs"),p=require("path"); for(const n of ["fixture.json","preparation.json","runtime.env"]) fs.unlinkSync(p.join(process.env.GENOVA_086_RUNTIME,n));'
    echo 'PASS exact disposable fixture removed for a fresh single-use invitation run'
    ;;
  status)
    docker ps --format '{{.Names}}' --filter label=com.supabase.cli.project=genova-086-runtime
    df -k "$ROOT"
    du -sh "$RUN" /Users/alidiyarduran/.colima/genova086 /Users/alidiyarduran/.colima/_lima/colima-genova086 2>/dev/null || true
    ;;
  stop)
    [ ! -f "$RUN/source-baseline" ] || [ "$(snapshot)" = "$(<"$RUN/source-baseline")" ] || refuse 'source changed'
    supabase stop --workdir "$RUN" --no-backup >"$RUN/service-stop.log" 2>&1
    echo 'PASS task service containers/volumes stopped without backup'
    ;;
  *) refuse 'prepare/build/check/web/browser/status/stop/reset-fixture/cleanup-partial-auth required' ;;
esac
