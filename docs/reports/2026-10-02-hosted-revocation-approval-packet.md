# 090 — source-pinned hosted revocation approval packet

Subsequent authorized [R0 metadata assessment](2026-10-02-hosted-revocation-r0-preflight.md)
is PARTIAL/NO-GO. Its dated observations supersede the preparation's unrun metadata state
below, not its pinned source or R1–R5 authority. Remaining catalog/ACL/version/sibling gates
must pass before recovery/release progression; no hosted mutation occurred.

Date: 2 October 2026. Source: main/bdf34b80a239fe7a69188746e5543caf3b12cbf3.
Outcome: **PREPARATION COMPLETE; LIVE RELEASE NO-GO until the external gates below pass**.
Sole writer, scoped self-review, no independent review. This packet is a reviewed proposal,
not permission to run commands, mutate the shared database or deploy a client.

## One measurable outcome and plan

Make the next release decision concrete: exact proposed server package, compatibility,
backup/restore, rollback, hosted acceptance and separate approval scopes. It advances
[090](../briefs/090-private-file-ticket-revocation-contract.md) and the
[Android-first queue](../mobil-teslim-plani.md#controlled-execution-queue--24-september-2026),
not another unrelated feature. At most three actions: inspect dependencies/current local
evidence; pin the manifest and staged approval gates; verify records and commit locally.
Completion here means a validated packet, not hosted090, Drive-exit or usable-beta acceptance.

Read: AGENTS, handoff/active,090, transition guide/work cycle/template, delivery controls,
MIGRATION, decisions28–32,061/069/076/077/runbook, actual078/090 migrations and five readers.
Supabase skill guides restore/privilege gates; TypeSafe skill keeps authority and exact checks
deterministic, not model judgments. Current docs were retrieved; no inference/key use/APIcost$0.
Allowed writes: this report, its source manifest,090 work card, runbook/delivery status and
handoff/active/progress. No code, lockfile, sibling checkout, runtime, external operation or push.
Entry free19862280KiB, above10GiBfloor. Document-only resources N/A: no new VM/device/build,
database clone or download artifact; retain the existing068 source/backups and unrelated changes.

## Verified baseline and unknown live state

- [Local legacy-iOS acceptance](2026-10-02-ios-legacy-webview-acceptance.md)/bdf34b8 closes the
  latest native flow; historical Android/iOS PDF/audio/assignment and five-family records stay
  in090. Synthetic local Auth/RLS/Deno/storage and simulators do not prove hosted R2 or phones.
- [069](../briefs/069-dormant-hosted-r2-backend.md) records27September hosted prerequisites,
  16 transactional ledger entries through065 and13 dormant functions/v1. This is historical,
  **not a fresh statement that078/090 are absent or that flags still equal legacy/false**.
- Local cached origin/main=a13f696da8c731e9af2a2bce473d4f4ae4a81587. Against the pinned source,
  git rev-list reports320 commits and git diff reports849 files. No fetch, current remote,
  GitHub CI or Vercel production lookup in this pass. Do not push local main as this server patch.
- [076](../briefs/076-repertoire-mp3-r2-batch-2.md) historically proves42 private copies/
  60969062bytes. [077](../briefs/077-repertoire-mp3-r2-batch-3.md) proposes ten more/
  27472242bytes;49 MP3/192361428bytes remain in the retained snapshot. No fresh provider read,
  copy, activation, flag, Drive ACL or deletion is authorized by this packet.
- Generic Supabase connector tools are visible, but the designated supabase-genesinova server
  binding is not established here; repository .mcp.json is absent. No config/authentication
  workaround or other project's connector was used. Live metadata remains NOT RUN, not empty.

## Exact proposed server package

[Machine-checked source manifest](090/2026-10-02-hosted-revocation-source-manifest.json)
pins12 local modules,30 literal relative-import edges, five slugs, two migrations and gateway
config SHA256. External modules are exactly npm:@supabase/supabase-js@2.112.4 and
npm:aws4fetch@1.0.20. TypeScript AST traversal, not a fragile import-line regex, includes
the shared handler/provider helpers, create-choir key resolver and lib/server content filter.
Including a helper does **not** authorize deploying create-choir or an upload function.
The full config hash is source identity; only five named sections are outgoing configuration.
This is not a generated deploy bundle, hosted source equivalence or fresh Deno/runtime result.

| Ordered proposed change | Why / boundary |
| --- | --- |
| 078:20260928140000_active_membership_revocation_078.sql | Shared005 current_choir_id/current_choir_member_id/set_active_choir fail closed for inactive membership. Snapshot preserves prior definitions. Not a structural prerequisite of090 SQL, but required for consistent POST/new-request authority; explicit shared-site approval needed. |
| 090:20260930080046_private_file_ticket_authority_090.sql | Additive genova_090 helper/public invoker RPC, no source row rewrite. Requires auth.sessions,005 selection,057/058/059 version tables and060 chat read function. Never grant to anon/authenticated. |
| repertoire-file, assignment-file, assignment-review-file, repertoire-comment-file, chat-media-file | Deploy individually from the exact complete closure; record returned version/status/hash and verify_jwt=false. POST verifies real Auth; GET/HEAD verify strict v2 plus live service-only RPC before metadata/provider. |

The two SQL SHA256 values are3637722b0aa4822c6c4ac96789554d2eedce52410c552cc94f4471948cc705bb
and4f345d968fa6945aa746b4d00b7852c293047a984beabd79c4b7a64629c0ad86, respectively.
Recheck exact files at execution. If the catalog/ledger already contains a change, compare
definitions/ACL/hash and stop on mismatch; neither migration is blind-repeat safe.
069's16 entries are verify-only historical prerequisites, not permission to replay them.
No supabase db push --linked, migration repair/ledger editing, broad Edge deploy or new secrets.
No service-role rotation: it also signs tickets and affects sibling/live services; separate scope.

Full web/mobile promotion is a separate package. Local migrations024/046/048/079/082/087/088,
among others, are outside this narrow proposal and may be dependencies of today's full client.
Do not assume those are hosted, silently add them, or activate local-only features in production.
078's drive-manager-v2/client teardown adoption also remains a separately pinned consumer
release, not an implied sixth Edge deployment. Fresh exact-client dependency review is required.

## Compatibility and shared-database impact

Strict readers reject all legacy v1 URLs with401. Current signed v2 URL shape remains
?fileId=...&ticket=..., but opaque shape alone does not prove old-client recovery.401 may trigger
at most one fresh POST/download; confirmed403 must stop, never loop or revive a local copy.
Keep this distinction from already-streaming/offline bytes, which cannot be recalled.
Before strict-reader deploy, test the actual production web revision, cached/service-worker tab,
proposed preview, legacy/current assignment WebViews and installed mobile versions against the
new backend on an approved isolated rehearsal. Unsupported installed clients require an owner
support/update or maintenance-window choice, not a v1 grace silently contradicting decision32.
Compatible DB must precede caller code; if old production clients cannot tolerate strict Edge,
stop and prepare a compatible client transition or approved maintenance window first.

Sibling genesinovachoir local source was read only at9eac3f010294151e5e1088140076e1bd6ed3f299,
with extensive pre-existing dirty changes preserved. Source inspection found public_choir_members
read, contact/subscriber inserts and collab_inquiries insert; no named active-choir RPC/five-reader
reference in searched src/supabase paths. This is not proof of live view/RLS independence.
078 changes shared authority used by policies; fresh catalog/view/grant inspection and both-site
preview smoke tests are mandatory. Membership error UI uses a mock conductor fallback, so an
apparently populated sibling page is not proof of a successful DB response. Do not submit real
forms or alter that sibling tree. Hosted current schema and sibling production revision unknown.

## Staged external gates and exact authority

| Gate | Observable exit and proposed scope | Current state |
| --- | --- | --- |
| R0 metadata preflight | Verify exact hievmwwctjjlhmssoxsu/Genesinova connection; read only project identity, server version/extensions, migration ledger/catalog/ACL, five Edge versions/gateway config, secret names/non-secret flag digests, exact GitHub/Vercel and sibling release metadata. No user rows, file bodies, tokens/secret values or config changes. | NOT RUN; next bounded checkpoint, no live mutation approval requested |
| R1 recovery/rehearsal | Separately approve fresh hosted logical export/private0600 path and bounded disposable restore. Record snapshot/hash/schema/counts, managed role attributes, Auth/session scope and actual restore; rehearse078→090, service-only privileges and both-client baseline on that fresh copy; resource estimate before allocation. | NOT RUN;27Sept068 cannot substitute for a fresh backup |
| R2 shared DB plus five-reader release | Only after R0/R1 and compatibility: approve exact078→090 and five slugs/complete closure. Transactional SQL and matching ledger strategy must be reviewed before use; deploy versions individually and stop on first failure. Preserve provider/write/client flags; capture approved recovery artifact/version. | NOT RUN; no execution runner or live command run in this packet |
| R3 hosted isolated acceptance | Separately approve two task-only choirs, two Auth accounts and one synthetic file per family with exact manifest/byte cap, setup/cleanup snapshot and private fixture artifacts. Never revoke actual choir users or read their files for tests. Run matrix below and clean exact owned fixtures under preservation rules. | NOT RUN; fixture/object/user creation is an explicit live write |
| R4 exact compatible client release | Separate source/lockfile/migration/function manifest, current required local gates, approved candidate CI/preview, then individually approved web/main promotion and Android installed-device tests. Account/signing/distribution separate. No bulk320-commit push. | NOT RUN |
| R5 copy/activation/Drive-exit/beta | Resume077's separately approved bounded copies, then atomic065 reconciliation, family mixed/writer gates, r2-required and phone acceptance. Preserve all source bytes/ACL until separate authority. | NOT RUN; security release alone is not Drive-exit/beta |

R0 may inspect catalogs, never invoke a mutation RPC. Before each step recheck target/source and
authorization; if the source changes regenerate/review the packet, not just its date. No credentials
should be pasted into chat. Use the designated connector or an explicitly approved alternative.
No spending authority, account setup/change, outbound email or real-user session revocation here.

## Required later acceptance and failure controls

- For all five families: missing/forged/expired/wrong-family/v1 GET+HEAD401, valid v2 authorized
  full/range/HEAD200/206 and invalid range416; expected MIME/size/checksum/no-store.
- Same-session A→B, inactive membership, choir role and family visibility/assignment/chat-room
  revocation: next old GET/HEAD403. Separate Auth session still selected A remains authorized.
  New wrong-context POST403, RPC anon/authenticated denied and service-role allowed.
- For denied reads, prove no provider attempt with reliable request-correlated evidence. A global
  bucket counter or403 alone is insufficient; approve narrow diagnostics/audit coverage if existing
  logs cannot attribute provider requests. Never label unobservable providerDelta as0.
- Authority error/missing RPC must fail closed500/no body/no provider, not fallback to old tickets.
  Failure midway through five deployments stops clients; do not claim a uniform guarantee while
  some slugs still run v1. Check HTTP response behavior, not merely ACTIVE status.
- Request authorized before a revoke commit may finish. Test newly-started requests after commit;
  local HTTP overlap used explicit dependency adapters, not a hosted concurrency guarantee.
- Web/native PDF+audio seek/renewal and permanent WebView consent/share/cache isolation must pass
  on exact released client/server versions; ordinary pnpm check/export is not this evidence.

## Security-preserving stop and rollback

Stop on target/revision/ledger/hash drift, unexplained prerequisite, role/ACL mismatch, backup/restore
failure, sibling regression, unready old client, cross-choir read, partial deployment or budget breach.
Leave additive090 authority installed on failure; old clients need not call it. Do not drop the schema
while any v2 reader depends on it. There is no accepted090 down runner in this proposal.
Do not restore pre090 readers as an automatic rollback: that would re-enable v1/revoked URL access.
Use the last proven strict-v2 release or a separately approved fail-closed temporary read outage
while repairing forward. No outage switch/function has been implemented by this packet.
078 rollback SQL explicitly restores the old security defect and is isolated/explicit-approval only;
do not execute it on production as an ordinary rollback. Installed clients/DB/provider objects each
need separate recovery. Preserve all R2-only versions, copies and Drive sources; no blanket DB restore
over intervening writes. Snapshot/reconcile exact concurrent data under a reviewed recovery plan.

The [official backup guide](https://supabase.com/docs/guides/platform/backups) distinguishes DB
metadata from Storage object bytes and warns about custom-role passwords. Retain independent file
inventory/journals and role recovery evidence; logical SQL backup is not R2/Drive/Storage recovery.
The [25September PostgreSQL notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
adds extension/custom-operator restore checks; fresh R0 catalogs must determine applicability.
No forced provider upgrade, reindex or extension change is included. [TypeSafe System One](https://docs.typesafe.ai/concepts/system-one)
supplies typed probabilistic judgments, not proof; no model answer can waive a required gate.

## Preparation acceptance evidence

| Criterion | Required for this goal? | Result | Evidence / limit |
| --- | --- | --- | --- |
| Source/dirty ownership and local baseline | Yes | PASS | main/bdf34b8, only unrelated CLI marker before owned docs; source/lockfiles/sibling untouched; cached remote gap explicitly not live |
| Exact migrations/five-reader full source closure/config | Yes | PASS | Manifest AST12files/30edges, SHA256, two pinned npm specifiers, five explicit verify_jwt=false sections. First whitespace-only regex rejected commented config; corrected section-aware verification, no product/config change |
| Shared-site/client/rollback and staged authority | Yes | PASS | Source inspections and concrete R0–R5 proposal above; no claim of live compatibility or recovery |
| Local links/anchors/hash/evidence/status/credential/diff checks | Yes | PASS | Final validation recorded in090 work card; primary scoped self-review only |
| Owned resources and separate local docs commit | Yes | PASS | No runtime created; generated outputs stay absent, source/evidence unchanged and unrelated CLI marker excluded from commit |
| Hosted metadata/backup/schema/Edge/provider/client/device | No for preparation; REQUIRED later | NOT RUN | R0–R5 prohibit live GO until each applicable gate passes |

Preparation retrieval issues: web reader could not parse two Markdown pages; direct HTTPS retrieval
succeeded. One read-only Node invocation mixed require/top-level await and failed before reads;
corrected explicit ESM succeeded. No relaxed required test, environment rebuild or real-data access.
Document rollback is a scoped Git revert only. Next request: R0 metadata-only scope, not R2 deployment.

Final preparation checks2October PASS:386 local links and6 local anchors resolve; all15 hashed
source/config/migration files match byte counts, SHA256 and pinned Git blobs. Eight owned files
pass scoped credential-format review and diff/status consistency. No generated runtime restored;
final19850404KiB abovefloor. No pnpm check/native/DB/hosted gates rerun for document-only work.
Self-review confirmed approval scopes, security-preserving rollback and unknown live status;
it is not independent acceptance. Only these eight docs/evidence files enter the local090 commit.
