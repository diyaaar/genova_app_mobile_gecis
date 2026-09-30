# Genova — agent handoff

Updated 30 September 2026 after [090](briefs/090-private-file-ticket-revocation-contract.md)
local implementation and synthetic acceptance. Hosted release and remaining 090 gates are open.
This is a short current-state index. Detailed historical acceptance remains in briefs and
[progress](../memory-bank/progress.md), not duplicated here. Verify recorded state before reuse.

## Read first

[AGENTS](../AGENTS.md) → [active context](../memory-bank/activeContext.md) → current brief →
[execution controls](mobil-teslim-plani.md#bounded-execution-and-resource-controls).
Use [guide](gecis-rehberi.md), [work cycle](ai-calisma-duzeni.md), relevant
[decisions](../KARARLAR.md) and [MIGRATION](../MIGRATION.md). Profile remains permanent WebView.

## Current outcome / next action

090 code/test `5f55c48` now locally binds all five private-file tickets to signed
actor/Auth-session/choir identity and a service-only, one-snapshot SQL access decision
on every GET/HEAD. Legacy v1 reads fail 401; active v2 URLs fail 403 after same-session
choir switch or membership/role/visibility loss. Web online cache checks and bounded
refresh/denial purge, native PDF/audio recovery and exact offline boundary are implemented.
Disposable PG17 five-family SQL matrix, real local Auth/RLS/Edge/signed loopback S3
repertoire HTTP and Android API 36 Release A PDF page 1/40 → B cache clear/new and
old A URL 403 pass. Root 106/1066/build, mobile 50/302, five Deno checks pass.
090 remains IN PROGRESS: the 30 September two-session SQL commit-boundary test
`70fd23e` passes on a disposable PG17 clone. The four other families' connected
HTTP Auth/Edge/signed-loopback-S3 test `9773958` also passes locally: exact
full/range/HEAD bytes and old URL GET/HEAD 403 after A→B, with no provider hit.
The real web browser, native stale-v1/audio runtime and a provider request
overlapping COMMIT remain NOT RUN. Fresh `pnpm check` passes 106/1066/build.
Next bounded local action is client runtime or in-flight acceptance; hosted
backup/rollout requires a separate checkpoint. See 090 for exact limits.

[093](briefs/093-android-private-r2-read-integration.md), source/test `c3e1b28`, locally accepts the Android
Release native private-PDF read through actual disposable Auth/PostgREST/RLS/PG17,
loopback Deno and signed loopback S3. A 65,905-byte PDF rendered page 1/40; A→B
cleared the private cache, B-only catalogue appeared and new A ticket under B refused
403. The run exposed and fixed an Expo hook-owned audio-player teardown crash;
mobile 50/299, root 103/1049/build and Android Release pass. [Visual and service
evidence](evidence/093-android-private-r2-read/README.md). Generated runtime/build
were cleaned; original source counts/schema unchanged. This is synthetic emulator
evidence, **not** hosted R2, physical-phone, Drive cutover or beta acceptance. At the
093 revision an old A URL remained usable after switch; 090's newer local v2 reader
now refuses it. Neither revision is hosted release evidence.

Owner resumes local implementation of [WF-013](briefs/WF-013-multi-tenant-remediation-plan.md),
with operator-assisted v1 choir creation confirmed. [WF-012 audit](briefs/WF-012-commercial-multi-tenant-audit.md)
and [report](reports/2026-09-28-commercial-multi-tenant-audit.md) remain the dated pre-fix baseline.
089 scope `6db0144`, product/test `a8df751` is locally accepted: actual installed Chrome/Next/
Auth/REST/RLS/PG17 two-choir profile submit → chef approve/reject → member/history passes with
087/088, zero response mocks. Actual UI names exposed original-choir review constants; removed
them in favor of referenced caller-RLS page-local labels and late-scope read guards. Six component
regressions, focused 4/72, full 103 suites/1042 tests/build pass. Real browser wrong-tenant/non-chef/
stale/finalized/role/inactive refusals preserve data; permission changes are pre-dispatch, not
new in-flight HTTP concurrency evidence. [Evidence](evidence/089-real-profile-review-web/README.md).
[087 submit](briefs/087-authority-safe-profile-submit.md)/[088 review](briefs/088-authority-safe-profile-review.md)
retain historical real PG concurrency/rollback/restore acceptance, not rerun in 089.

[091](briefs/091-connected-private-r2-read.md), historical test/config `f1e19f8`, joined actual local
Auth/PostgREST/RLS/PG17 and Deno repertoire-file with a signed **loopback S3** server: own
A PDF (65,905 B) and B WAV (48 B) full/ranged/HEAD bytes pass; wrong user/choir and revoked
membership cannot issue new tickets. At that historical revision an issued A URL still worked
after same-session B switch; 090's newer local v2 reader refuses it.
No hosted R2, current provider read, native client or device acceptance. 091 root 103/1042/build
passes; its VM/runtime/listeners were removed, source six-table digest preserved.
[092](briefs/092-stale-private-file-ticket-cache.md), code/test `b0fe523`, reproduces then
prevents a late web/WebView private-file ticket from returning/repopulating cache after tenant
clear across six URL families. Focused 16 and root 103/1049/build PASS. This is client hygiene,
not old-URL server revocation or a fresh browser/native/provider test; 090 remains open.

Manual synthetic catalogs/extra role and confirmed users do not accept operator-admin/signup/
mail UX. Other direct/service writers do not join these RPC locks; push/provider, hosted and
device layers NOT RUN. WF-013 step 5 remains PARTIAL. Active
[090](briefs/090-private-file-ticket-revocation-contract.md) is partial at the
**release/evidence** layer, not merely a policy proposal. Decision #32 and bounded
local implementation were approved; `5f55c48` is not hosted. Older actorless-ticket
descriptions elsewhere in this handoff are historical pre-090 baselines.

Earlier local acceptance is preserved: [078](briefs/078-active-membership-revocation.md) active
authority, [079](briefs/079-message-status-rpc-privileges.md) creator-independent grants,
[080](briefs/080-safe-link-preview.md) SSRF bounds, [081](briefs/081-local-secret-file-permissions.md)
local modes, [082](briefs/082-atomic-repertoire-assignments.md) atomic assignments,
[083](briefs/083-new-choir-profile-reference-isolation.md)/[084](briefs/084-stale-choir-create-guards.md)
profile/create context guards and [085](briefs/085-two-choir-connected-backend-acceptance.md)
connected SQL/transport. None implies hosted remediation or full commercial readiness.
F12 creator/history/CI/rotation and legacy account risks remain open; file modes are not rotation.

## Ownership / resources / release authority

After the 090 four-family evidence commit, only unrelated `supabase/.temp/cli-latest` should
remain unstaged; verify before reuse.
Stage owned paths only.
089, 091 and 090 services/volumes/tunnels/VMs/profiles/data/contexts and secret-bearing runtimes removed;
latest 090 HTTP runtime recoverably in Trash; current `.next`/coverage deleted. Free
24,445,848 KiB after cleanup; no task listeners or adb
device, default Docker context and 068 source row-count guard preserved. Original
`genova_068_test_restore`, retained 068 backup,
required private copy manifests/journals and dependencies are preserved; never purge them as caches.
One result/one heavy process, >=10 GiB floor, two-failure causal reassessment; no blind rebuilds.
Local scoped code/tests/commits/owned cleanup authorized. Hosted DB/Edge/provider, credentials,
real accounts/email/data, spending, CI/push/deploy, hardware/distribution stay separately gated.
Shared DB also serves sibling website; future schema release needs current hosted backup/restore,
both-project impact and exact DB → web/client order. Git revert is not data recovery.
087 helper/RPC → 088 RPC must precede web rollout and remain available through web rollback.
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
bytes, 49 MP3 / 192,361,428 bytes still pending. [077](briefs/077-repertoire-mp3-r2-batch-3.md)
prepares the next ten / 27,472,242-byte approval packet; no copy ran. Copies are not activation/cutover;
each remaining real-data/provider action needs exact approval. Public Drive links, bearer/offline
revocation semantics, unsupported avatar and full private-file client integration remain open.
004 hardware and 010 live refusals, native write/sync/offline/chat/C4/C5, store/privacy/lifecycle
and full two-platform obligations remain in the objective. Do not mark the full goal complete
at beta, planning or local acceptance. Canonical objective: [delivery plan](mobil-teslim-plani.md#revised-goal-text).
