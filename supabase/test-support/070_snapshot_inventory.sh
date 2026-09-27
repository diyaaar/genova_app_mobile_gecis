#!/usr/bin/env bash
# 070 — Export one deterministic private 063 inventory from the retained 068 snapshot.

set -euo pipefail
umask 077

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$REPO_ROOT"

SOURCE_DB="genova_068_test_restore"
TARGET_DB="genova_070_inventory"
EXPECTED_OUTPUT_DIR="/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-070"
OUTPUT_DIR="${GENOVA_070_OUTPUT_DIR:-$EXPECTED_OUTPUT_DIR}"
INVENTORY="$OUTPUT_DIR/inventory.jsonl"
AUDIT="$OUTPUT_DIR/inventory-audit.json"
METADATA="$OUTPUT_DIR/drive-metadata.json"
MANIFEST="$OUTPUT_DIR/copy-manifest.jsonl"
REPORT="$OUTPUT_DIR/manifest-report.json"
MODE="${1:-inventory}"
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
CREATEDB="/opt/homebrew/opt/postgresql@17/bin/createdb"
DROPDB="/opt/homebrew/opt/postgresql@17/bin/dropdb"
NODE="$(command -v node || true)"

refuse() { echo "REFUSED: $*" >&2; exit 2; }
[ "$MODE" = inventory ] || [ "$MODE" = prepare ] || refuse "usage: $0 [inventory|prepare]"
[ "$OUTPUT_DIR" = "$EXPECTED_OUTPUT_DIR" ] || refuse "unexpected output directory"

assert_private_file() {
  [ -f "$1" ] && [ ! -L "$1" ] || refuse "missing private file: $1"
  [ "$(stat -f '%Lp' "$1")" = 600 ] || refuse "private file must be mode 0600: $1"
}

if [ "$MODE" = prepare ]; then
  [ -x "$NODE" ] || refuse "missing executable: node"
  [ -d "$OUTPUT_DIR" ] && [ ! -L "$OUTPUT_DIR" ] || refuse "invalid output directory"
  [ "$(stat -f '%Lp' "$OUTPUT_DIR")" = 700 ] || refuse "output directory must be mode 0700"
  assert_private_file "$INVENTORY"
  assert_private_file "$AUDIT"
  assert_private_file "$METADATA"
  [ ! -e "$MANIFEST" ] && [ ! -e "$REPORT" ] || refuse "manifest outputs already exist"

  GENOVA_070_INVENTORY="$INVENTORY" GENOVA_070_METADATA="$METADATA" \
    GENOVA_070_MANIFEST="$MANIFEST" GENOVA_070_REPORT="$REPORT" \
    "$NODE" --experimental-strip-types --disable-warning=ExperimentalWarning \
    --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --input-type=module <<'NODE'
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { runManifestCli } from './scripts/private-r2-manifest.ts';
import { validateInventory } from './scripts/private-r2-manifest-core.ts';

const inventoryPath = process.env.GENOVA_070_INVENTORY;
const metadataPath = process.env.GENOVA_070_METADATA;
const manifestPath = process.env.GENOVA_070_MANIFEST;
const reportPath = process.env.GENOVA_070_REPORT;
if (!inventoryPath || !metadataPath || !manifestPath || !reportPath) throw new Error('missing-path');

const inventoryText = await readFile(inventoryPath, 'utf8');
const values = inventoryText.split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line));
const inventory = validateInventory(values);
const metadataText = await readFile(metadataPath, 'utf8');
const payload = JSON.parse(metadataText);
if (payload.schemaVersion !== 1
  || payload.scope !== 'https://www.googleapis.com/auth/drive.metadata.readonly'
  || !Array.isArray(payload.files) || payload.files.length !== 91) {
  throw new Error('invalid-metadata-envelope');
}

const byId = new Map();
for (const file of payload.files) {
  if (!file || typeof file !== 'object' || typeof file.id !== 'string' || !file.id
    || typeof file.name !== 'string' || !file.name || typeof file.mimeType !== 'string'
    || !file.mimeType || !/^\d+$/u.test(String(file.size)) || file.trashed !== false
    || byId.has(file.id)) throw new Error('invalid-metadata-row');
  byId.set(file.id, file);
}
const expectedIds = new Set(inventory.candidates.map((row) => row.legacy_file_id));
if (expectedIds.size !== 91 || expectedIds.size !== byId.size
  || [...expectedIds].some((id) => !id || !byId.has(id))
  || [...byId.keys()].some((id) => !expectedIds.has(id))) {
  throw new Error('metadata-candidate-set-mismatch');
}
const totalBytes = [...byId.values()].reduce((sum, file) => sum + Number(file.size), 0);
if (!Number.isSafeInteger(totalBytes) || totalBytes !== 253330490) {
  throw new Error('unexpected-metadata-total');
}

const exactApproval = `hievmwwctjjlhmssoxsu/${inventory.choirId}/${inventory.bucket}/${inventory.inventoryFingerprint}`;
const printed = [];
await runManifestCli([
  'prepare', '--inventory', inventoryPath, '--project-ref', 'hievmwwctjjlhmssoxsu',
  '--choir', inventory.choirId, '--bucket', inventory.bucket,
  '--manifest', manifestPath, '--report', reportPath,
  '--max-items', '91', '--max-total-bytes', '253330490',
  '--confirm-inventory', exactApproval,
], {
  env: { GENOVA_PRIVATE_R2_MANIFEST_APPROVED: exactApproval },
  metadata: {
    async getSourceMetadata(fileId) {
      const file = byId.get(fileId);
      if (!file) throw new Error('missing-provider-metadata');
      return {
        fileId,
        name: file.name,
        mimeType: file.mimeType,
        contentLength: Number(file.size),
        trashed: file.trashed,
        googleNative: file.mimeType.startsWith('application/vnd.google-apps.'),
      };
    },
  },
  now: () => new Date(payload.fetchedAt),
  print: (value) => printed.push(value),
});
const result = printed.at(-1);
if (!result || result.status !== 'manifest-prepared') throw new Error('manifest-not-prepared');
process.stdout.write(`${JSON.stringify({
  ...result,
  metadataSha256Hex: createHash('sha256').update(metadataText).digest('hex'),
  metadataItemCount: byId.size,
  providerReadMode: 'metadata-only',
})}\n`);
NODE
  assert_private_file "$MANIFEST"
  assert_private_file "$REPORT"
  exit 0
fi

for executable in "$PSQL" "$PG_DUMP" "$CREATEDB" "$DROPDB" "$NODE"; do
  [ -x "$executable" ] || refuse "missing executable: $executable"
done

migrations=(
  supabase/migrations/20260516_assignment_review_audio.sql
  supabase/migrations/20260919190000_chat_room_membership_authority_041.sql
  supabase/migrations/20260919193000_chat_social_membership_authority_042.sql
  supabase/migrations/20260919194500_chat_message_status_authority_043.sql
  supabase/migrations/20260919201500_chat_core_message_authority_044.sql
  supabase/migrations/20260919213000_chat_text_send_idempotency_045.sql
  supabase/migrations/20260920205054_private_r2_repertoire_read_053.sql
  supabase/migrations/20260921185113_private_r2_repertoire_upload_054.sql
  supabase/migrations/20260922071942_private_r2_repertoire_lifecycle_055.sql
  supabase/migrations/20260922171847_private_r2_repertoire_cover_056.sql
  supabase/migrations/20260922221500_private_r2_assignment_versions_057.sql
  supabase/migrations/20260923103000_private_r2_assignment_review_audio_058.sql
  supabase/migrations/20260923170000_private_r2_repertoire_comment_audio_059.sql
  supabase/migrations/20260923193000_private_r2_chat_media_060.sql
  supabase/migrations/20260923194500_private_r2_copy_inventory_063.sql
)
for migration in "${migrations[@]}"; do
  [ -f "$migration" ] || refuse "missing migration: $migration"
done

local_q() {
  "$PSQL" -X -Atq -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 5432 -d "$1" -c "$2"
}
local_exists() {
  [ "$(local_q postgres "select exists(select 1 from pg_database where datname='$1')")" = t ]
}
snapshot_hash() {
  "$PG_DUMP" -h 127.0.0.1 -p 5432 -d "$1" --no-owner --no-privileges |
    sed -E '/^\\(un)?restrict /d' | shasum -a 256 | awk '{print $1}'
}

CREATED=false
SUCCESS=false
cleanup() {
  if [ "$CREATED" = true ] && local_exists "$TARGET_DB"; then
    "$DROPDB" --force -h 127.0.0.1 -p 5432 "$TARGET_DB" >/dev/null 2>&1 || true
  fi
  if [ "$SUCCESS" != true ]; then
    rm -f "$INVENTORY" "$AUDIT"
  fi
}
trap cleanup EXIT HUP INT TERM

local_exists "$SOURCE_DB" || refuse "missing retained 068 restore"
local_exists "$TARGET_DB" && refuse "disposable target already exists"

if [ ! -e "$OUTPUT_DIR" ]; then
  mkdir -m 700 -p "$OUTPUT_DIR"
fi
[ -d "$OUTPUT_DIR" ] && [ ! -L "$OUTPUT_DIR" ] || refuse "invalid output directory"
[ "$(stat -f '%Lp' "$OUTPUT_DIR")" = 700 ] || refuse "output directory must be mode 0700"
[ ! -e "$INVENTORY" ] && [ ! -e "$AUDIT" ] || refuse "inventory outputs already exist"

source_hash="$(snapshot_hash "$SOURCE_DB")"
"$CREATEDB" -h 127.0.0.1 -p 5432 -T "$SOURCE_DB" "$TARGET_DB"
CREATED=true
local_q postgres "alter database \"$TARGET_DB\" owner to postgres" >/dev/null
local_q "$TARGET_DB" 'grant usage on schema extensions to postgres' >/dev/null

for migration in "${migrations[@]}"; do
  PGOPTIONS='-c role=postgres' "$PSQL" -X -q -v ON_ERROR_STOP=1 \
    -h 127.0.0.1 -p 5432 -d "$TARGET_DB" -f "$migration" >/dev/null
done

choir_count="$(local_q "$TARGET_DB" 'select count(*) from public.choirs')"
[ "$choir_count" = 1 ] || refuse "070 requires exactly one snapshot choir, found $choir_count"
choir_id="$(local_q "$TARGET_DB" 'select id from public.choirs order by id limit 1')"
[[ "$choir_id" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] \
  || refuse "invalid snapshot choir identity"

PGOPTIONS='-c role=service_role' "$PSQL" -X -Atq -v ON_ERROR_STOP=1 \
  -h 127.0.0.1 -p 5432 -d "$TARGET_DB" \
  -c "select row_to_json(i)::text from public.private_r2_copy_inventory_063('$choir_id'::uuid,'genova-private') i" \
  -o "$INVENTORY"
chmod 600 "$INVENTORY"
[ -s "$INVENTORY" ] || refuse "empty private inventory"

"$NODE" --experimental-strip-types --disable-warning=ExperimentalWarning \
  --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/private-r2-manifest.ts audit \
  --inventory "$INVENTORY" --project-ref hievmwwctjjlhmssoxsu \
  --choir "$choir_id" --bucket genova-private >"$AUDIT"
chmod 600 "$AUDIT"

[ "$(snapshot_hash "$SOURCE_DB")" = "$source_hash" ] || refuse "retained 068 snapshot changed"
"$DROPDB" --force -h 127.0.0.1 -p 5432 "$TARGET_DB"
CREATED=false
local_exists "$TARGET_DB" && refuse "disposable target remains"

SUCCESS=true
GENOVA_070_AUDIT="$AUDIT" GENOVA_070_INVENTORY="$INVENTORY" ruby <<'RUBY'
require 'json'
require 'digest'
audit = JSON.parse(File.read(ENV.fetch('GENOVA_070_AUDIT')))
abort 'REFUSED: invalid audit status' unless audit['status'] == 'valid-inventory'
puts JSON.generate(
  status: 'snapshot-inventory-ready',
  itemCount: audit.fetch('itemCount'),
  candidateCount: audit.fetch('candidateCount'),
  excludedCount: audit.fetch('excludedCount'),
  statusCounts: audit.fetch('statusCounts'),
  inventorySha256Hex: Digest::SHA256.file(ENV.fetch('GENOVA_070_INVENTORY')).hexdigest,
  inventoryFingerprint: audit.fetch('inventoryFingerprint'),
  sourceUnchanged: true,
  cloneRemoved: true,
)
RUBY
