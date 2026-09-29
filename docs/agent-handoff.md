# Genova — agent handoff

Updated 29 September 2026 after [087](briefs/087-authority-safe-profile-submit.md).
This is a short current-state index. Detailed historical acceptance remains in briefs and
[progress](../memory-bank/progress.md), not duplicated here. Verify recorded state before reuse.

## Read first

[AGENTS](../AGENTS.md) → [active context](../memory-bank/activeContext.md) → current brief →
[execution controls](mobil-teslim-plani.md#bounded-execution-and-resource-controls).
Use [guide](gecis-rehberi.md), [work cycle](ai-calisma-duzeni.md), relevant
[decisions](../KARARLAR.md) and [MIGRATION](../MIGRATION.md). Profile remains permanent WebView.

## Current outcome / next action

Owner resumes local implementation of [WF-013](briefs/WF-013-multi-tenant-remediation-plan.md),
with operator-assisted v1 choir creation confirmed. [WF-012 audit](briefs/WF-012-commercial-multi-tenant-audit.md)
and [report](reports/2026-09-28-commercial-multi-tenant-audit.md) remain the dated pre-fix baseline.
087 scope `ae677c3`, product/test `9581ad7` is locally accepted: profile submit now uses one
authenticated-only, JWT/session/member-locked DB RPC instead of split service-key writes.
Actual PG17 A/B/context/reference/normalization/snapshot/merge/forced rollback/ACL/down-reapply
and six observed concurrency matrices pass. Fresh LOCAL backup/restore equality and source
preservation pass. Root 101 suites/1004 tests/build; focused 3/32; original 005/083 SQL pass.
Revoked submit maps to 403, stale context to 409; missing RPC to 503, with no unsafe fallback.

Post-087 browser/Auth/REST/provider/device/hosted rollout NOT RUN. [086](briefs/086-two-choir-real-web-acceptance.md)
real local browser result is historical, not new-route acceptance. Chef approval/merge remains
split and unsafe under races; other direct/service writers do not share the new RPC lock.
WF-013 step 5 remains PARTIAL. Next proposed single outcome: authority-safe atomic chef
review/approval, including role/target/request concurrency and rollback proof; brief first.

Earlier local acceptance is preserved: [078](briefs/078-active-membership-revocation.md) active
authority, [079](briefs/079-message-status-rpc-privileges.md) creator-independent grants,
[080](briefs/080-safe-link-preview.md) SSRF bounds, [081](briefs/081-local-secret-file-permissions.md)
local modes, [082](briefs/082-atomic-repertoire-assignments.md) atomic assignments,
[083](briefs/083-new-choir-profile-reference-isolation.md)/[084](briefs/084-stale-choir-create-guards.md)
profile/create context guards and [085](briefs/085-two-choir-connected-backend-acceptance.md)
connected SQL/transport. None implies hosted remediation or full commercial readiness.
F12 creator/history/CI/rotation and legacy account risks remain open; file modes are not rotation.

## Ownership / resources / release authority

Only unrelated `supabase/.temp/cli-latest` remains unstaged; preserve it. Stage owned paths only.
087 target DB/test backends/private backup scratch removed; build 466 MiB/coverage/check log
recoverably in Trash. Free 34,144,992 KiB measured after cleanup; Trash retains blocks.
No VM/service runtime created in 087. Original `genova_068_test_restore`, retained 068 backup,
required private copy manifests/journals and dependencies are preserved; never purge them as caches.
One result/one heavy process, >=10 GiB floor, two-failure causal reassessment; no blind rebuilds.
Local scoped code/tests/commits/owned cleanup authorized. Hosted DB/Edge/provider, credentials,
real accounts/email/data, spending, CI/push/deploy, hardware/distribution stay separately gated.
Shared DB also serves sibling website; future schema release needs current hosted backup/restore,
both-project impact and exact DB → web/client order. Git revert is not data recovery.
087 RPC must precede web rollout and remain available through web rollback.
Local service-role configuration was recorded stale in 069; do not use it as live Auth proof.
For account work verify the actual profile; 070 verified `genesinova.choir@gmail.com`, not `chori`.

## Preserved product destination / storage queue

Same product, Android-first usable beta → complete feature/release scope → both-store acceptance.
Keep Supabase; private R2 is Drive-exit direction, not a Railway rewrite. Prefer <=$5/month;
five free members then additional-member billing; manual web invoicing, self-service later.
Prices/period/seat counting, deletion/retention/last-chef policy and release accounts stay undecided.
Follow [delivery queue](mobil-teslim-plani.md#controlled-execution-queue--24-september-2026)
and [WF-009](briefs/WF-009-controlled-delivery-execution-queue.md), not another tiny chat feature.
[WF-011](briefs/WF-011-release-candidate-source-preflight.md)/066–069 contain dated candidate/
CI/Preview/dormant-hosted evidence; no current remote/live revision verified here. Never bulk-push
the local divergence merely to obtain release evidence.
[070](briefs/070-real-inventory-metadata-preparation.md) records private inventory/manifest;
[071–076 copies](briefs/076-repertoire-mp3-r2-batch-2.md) record 42 verified objects / 60,969,062
bytes, 49 MP3 / 192,361,428 bytes still pending. 077 not run. Copies are not activation/cutover;
each remaining real-data/provider action needs exact approval. Public Drive links, bearer/offline
revocation semantics, unsupported avatar and full private-file client integration remain open.
004 hardware and 010 live refusals, native write/sync/offline/chat/C4/C5, store/privacy/lifecycle
and full two-platform obligations remain in the objective. Do not mark the full goal complete
at beta, planning or local acceptance. Canonical objective: [delivery plan](mobil-teslim-plani.md#revised-goal-text).
