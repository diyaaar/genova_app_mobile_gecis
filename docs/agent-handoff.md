# Genova — agent handoff

Updated 28 September 2026 after [085](briefs/085-two-choir-connected-backend-acceptance.md),
[084](briefs/084-stale-choir-create-guards.md),
[083](briefs/083-new-choir-profile-reference-isolation.md),
[082](briefs/082-atomic-repertoire-assignments.md),
[081](briefs/081-local-secret-file-permissions.md),
[080](briefs/080-safe-link-preview.md),
[079](briefs/079-message-status-rpc-privileges.md),
[078](briefs/078-active-membership-revocation.md) and [WF-012](briefs/WF-012-commercial-multi-tenant-audit.md)
and [076](briefs/076-repertoire-mp3-r2-batch-2.md);
[WF-009](briefs/WF-009-controlled-delivery-execution-queue.md) owns the queue.
This is the current entry point; dated acceptance remains in individual briefs.

## Latest owner steering: audit-backed implementation

The owner now requested local implementation of the audit plan, and explicitly confirmed
operator-assisted first-version choir creation; self-service comes later. Follow
[WF-013](briefs/WF-013-multi-tenant-remediation-plan.md). 078 (`8692304`) locally repairs inactive
membership authority, shared active choices, privileged Next/Drive bootstrap and observed-context
cache teardown. Actual PG17 A/B/read/write/role/RPC/down/reapply matrices pass; root 90/804/build
and mobile 49/290 pass. 079 (`462573f`, final `2810a3d`) repairs 043 grants forward-only and passes
its original full matrix under postgres/restored defaults and the previous local creator, with
exact ACL/owner/body/comment down/reapply and delegated-grant refusal. No applied migration rewrite.
080 (`9708ab9`) locally secures URL previews: verified active member, public/all-DNS destination
policy, numeric Host/TLS identity-preserving connections, per-hop validation, bounded headers/bytes/
deadlines and pre-auth/outbound worker admission. 104 focused cases and actual installed Deno
loopback HTTP/TLS/parser/cancellation matrix pass; root 92/908/build and mobile typecheck/focused
2 suites/6 send tests pass. No web/mobile client source changed. Worker guards are not distributed
quotas; hosted Edge/DNS/Auth/gateway/browser/device compatibility remains unverified.
All three are local acceptance only: no push/deploy/hosted DB/Edge/provider/device/browser change.
Clones/fixtures removed, owned build/coverage recoverably in Trash; 34,945,696 KiB measured free
after 082 (Trash retains the disk blocks).
081 hardens the exact local files: ten ignored configs/backups now 0600 (nine narrowed, one
preserved), workspace container 0777 -> 0755; private byte/identity/mtime/owner-access comparisons
pass. Selected token/private-key scan matches zero in 987 tracked files, not a history/all-secrets
certification. No credential values/content/source changed; future creators/CI/history/rotation
remain open. Local POSIX modes are not portable Git changes. No new build/runtime ran.
082 (`e18a885` scope, `3fc2b23` code/test) locally replaces the split
service-key assignment write with an authenticated, tenant-aware invoker RPC and failed-load-safe
web modal. The disposable PG17 clone reproduces old loss, proves forced insert rollback,
active A/B/role/target/part/refusal, stale/retry, two-session locking, authenticated-only grants
and exact down/reapply. Root lint/typecheck/94 suites/927 tests/service-worker/build pass;
no mobile source changed. Sibling website tracked source has no assignment consumer, but shared DB
and unknown runtime consumers still require review. Hosted DB, real browser/provider/device,
push and release NOT RUN. Old browser tabs require refresh after the DB → web rollout;
all legacy direct-table writers do not participate in the RPC lock. See [082](briefs/082-atomic-repertoire-assignments.md).
083 (`4b4f999` scope, `fdb2dbb` code/test) locally removes original-choir school/department
UUIDs from the permanent WebView profile editor, loads reference choices for its active choir,
and rejects an old-tab profile request after same-session choir switch before privileged work.
Actual disposable PG17 tests created two unrelated choirs through 007, exercised a shared account,
own/foreign reference/approval and inactive refusal; source/baseline were unchanged. Root 96
suites/943 tests and build pass. The new choirs initially have empty reference catalogs; assisted
catalog provisioning and broader F05/F13 routes remain open. Browser/device/hosted/release NOT RUN.
084 (`237bbe1` scope, `54efa6b` code/test) locally binds four creation forms to their opening
choir. Announcement/rehearsal/assignment routes now require expected choir before service work;
legacy and private repertoire creation verify that origin and use an explicit choir ID. The
red rehearsal request test and actual PG17 unscoped song insert reproduce wrong-B creation;
fixed A/B refusal, same-choir controls, role/inactive-target and 8 form tests pass. Root 100
suites/971 tests/build pass. Clone removed; owned outputs recoverably trashed; 33,827,652 KiB free.
No schema/native source/live/provider/release changed. Full F13 is not closed; unrefreshed old
legacy repertoire clients and object-anchored flows remain unaccepted. See 084's inventory.
085 (`a480e5d` scope, `4d87e90` tests) accepts the bounded connected backend matrix:
actual PG17 007 fresh choirs → 008 invitations/shared Korist memberships → separate profile/
catalog data → repertoire/atomic assignments; old A object in B, foreign targets, B demotion
and selected-member revocation refused without changing fixture state. Catalog/profile/role
setup is explicitly privileged/manual fixture work. Three web route representatives use actual
tenant client/SDK with simulated HTTP, not a real REST/Auth service. Focused 3/62 and root
101/990/build pass. Final 15-table fingerprint was sensitivity-tested; source/clone unchanged,
clone removed, outputs recoverably trashed; 33,270,848 KiB free. No product source/schema/native/
live/provider change. In-flight authority and partial writes remain open; WF-013 step 5 is PARTIAL.
Only unrelated CLI marker stays dirty. Next owner checkpoint: measured minimal disposable local
service runtime and one real browser/server flow early, then the preserved two-choir product
matrix. Chrome is installed but Colima/local Auth/REST/Edge runtime is absent; obtain peak-size
evidence before downloads. No real-account fallback or equating mocks with browser/device proof.
Provider/account rotation needs separate authority. Public legacy media
(F02) and existing bearer/offline revocation (F07) remain open;
077 copy and all cutover/release operations remain separately gated.

## Historical audit baseline

The owner requested a comprehensive commercial multi-tenant audit and no implementation.
[Turkish report](reports/2026-09-28-commercial-multi-tenant-audit.md) records current source,
test results and an ordered remediation plan. Web 797/mobile 288 tests pass. Local SQL proves
an inactive membership retains reads/writes/roles; migration 043 fails its anonymous EXECUTE
assertion when applied as postgres with restored Supabase default ACLs, despite passing under
the normal runner's other local creator. Hosted grants were not reverified. Browser UI remains
NOT RUN because Chromium is missing. No product fix, hosted change or 077 copy ran.
That recommendation received implementation authority and local acceptance in 078/079 above;
the dated audit report is preserved as pre-fix evidence, not edited to claim live remediation.
Preserve 076 copy evidence and the complete delivery objective.

## Read and verify

1. Read [AGENTS](../AGENTS.md), [active context](../memory-bank/activeContext.md) and
   [the current delivery priority](mobil-teslim-plani.md#current-delivery-priority--23-september-2026).
2. Follow the [current queue](mobil-teslim-plani.md#controlled-execution-queue--24-september-2026):
   063 inventory → 064 manifest → 062 verified copy → 065 atomic activation are locally accepted;
   use the linked guide/work cycle.
3. Verify Git ownership, disk and active goal. Do not repeat accepted work or rebuild environments
   merely because the model/session changed.

## Current checkout and ownership

- Last accepted candidate product/test: `e459bdd` (066); underlying 065 schema/test is `53c258f`.
  068's guarded backup runner is accepted through `c550d81`; 070's real metadata manifest runner is
  `0340908`. Verify current HEAD. No unfinished product changes.
- Unrelated `supabase/.temp/cli-latest` remains unstaged. Stage only owned task paths.
- Final 051: mobile typecheck/49 suites/287 tests, root 65/602/build and sequential Android/iOS
  exports PASS. Star snapshot/toggle/panel, refusal and lifecycle accepted locally only.
- 062 locally passes manifest/journal binding, bounded streaming Drive→signed R2 copy, independent
  destination SHA-256, resume/adopt/refusal and batch limits; no real object was copied.
- 063 locally passes a deterministic six-family, service-only source inventory, honest gap/status
  classification, prerequisite/down/refusal and exact reapply; no hosted row was read or changed.
- 064 locally passes exact snapshot approval, metadata-only six-family reconciliation, private
  manifest/report publication and all failure/path/cap gates; no real inventory or provider ran.
- 065 locally binds the exact current snapshot/report/latest verified journal, atomically activates
  all six families and refuses stale/orphan/partial/conflicting requests; no hosted row changed.
- [WF-011](briefs/WF-011-release-candidate-source-preflight.md) and
  [066](briefs/066-node22-private-r2-cli-warning.md) fix repaired candidate `e459bdd`. GitHub `main`
  and Vercel Ready production remain `a13f696`; the 177-commit/546-file gap and DB → Edge →
  web/mobile order are recorded. Candidate CI run `36144388175` and matching Preview are green;
  067–069 later accepted provider plus dormant hosted work, while production promotion remains gated.
- [067](briefs/067-cloudflare-r2-provider-bucket.md) verifies Cloudflare account
  `b642dee69121237ba20cc1a1bb50f1c5`, active R2 and empty private EU Standard bucket
  `genova-private`; public access is disabled. The original one-time bucket-only token values were
  later lost and the token was rolled in 069; current values exist only in encrypted Supabase
  secrets. No object or client flag changed.
- [068](briefs/068-hosted-backup-isolated-r2-rehearsal.md) completes the exact-project hosted read,
  private logical backup, isolated PostgreSQL 17 restore and 061/063/065 rehearsal. The retained
  dump is 1,317,637 bytes with recorded SHA-256; 7 schemas/74 table counts match and disposable
  clones leave the restore unchanged. At that checkpoint hosted schema/functions/secrets, real
  inventory/copy and cutover were NOT RUN; 069 subsequently advanced only the dormant backend.
- [069](briefs/069-dormant-hosted-r2-backend.md) has deployed the owner-approved dormant backend:
  rolled bucket-only token, 13 encrypted secrets with `legacy`/all writes `false`, exact 16-entry
  prerequisite plus 053–065 live ledger and 13 `ACTIVE` version-1 functions. Dormant 503 and
  missing-ticket 401 matrices pass. An existing product session then issued one ticket and returned
  legacy ranged `HEAD` 206/1 byte/application-octet-stream without a browser body. No real R2
  object/inventory/copy/activation/client flag changed; 069 is complete.
- [070](briefs/070-real-inventory-metadata-preparation.md) completes the real read-only control-plane
  gate. A private 92-row retained-snapshot inventory reconciles all 91 eligible Google objects and
  preserves one unsupported room avatar explicitly. The exact private 064 manifest is 91 rows /
  253,330,490 bytes with recorded hashes and caps. Google access was metadata-only/online with no
  refresh token; no media body, R2 request/object, hosted write, flag or cutover occurred at 070.
  Its separately approved bounded canary is now completed by 071 below.
- [071](briefs/071-single-object-r2-canary.md) completes the first real data-plane proof. After exact
  owner approval, the smallest 32,484-byte assignment PDF was fetched once, copied to its
  deterministic private EU R2 key and independently re-read with matching SHA-256. A 24-hour
  user-owned Object Read & Write credential was limited to `genova-private`, held only in one
  process and cleared. The private one-row journal records `verified` / `copied`. No mapping,
  activation, flag, source mutation or remaining-object copy occurred.
- [072](briefs/072-assignment-submission-r2-batch.md) completes the remaining assignment-submission
  copy slice. Runner `a3bcfde` accepted exactly nine objects / 12,815,437 bytes (six PDF, three MP4)
  and every private EU R2 destination passed full GET/SHA-256 verification. The private journal has
  nine `verified` / `copied` rows and zero remaining. Its separate 24-hour bucket-only user token was
  process-only and cleared. Together 071+072 verify all ten assignment objects / 12,847,921 bytes;
  no mapping, activation, source mutation, flag or other-family copy occurred.
- [073](briefs/073-chat-message-image-r2-batch.md) completes the eligible chat-message-image copy
  slice. Runner `24ca373` accepted exactly two JPEG objects / 798,038 bytes and both private EU R2
  destinations passed full GET/SHA-256 verification. The private journal has two `verified` /
  `copied` rows and zero remaining. Its separate 24-hour bucket-only user token was process-only and
  cleared. Together 071–073 verify twelve objects / 13,645,959 bytes; no mapping, activation,
  source mutation, flag, repertoire or avatar copy occurred.
- [074](briefs/074-repertoire-pdf-r2-batch.md) completes the repertoire-PDF slice. Runner
  `b776a13` accepted exactly ten PDFs / 2,289,699 bytes and every deterministic private EU R2
  destination passed full GET/SHA-256 verification on attempt one. Aggregate SHA-256 is
  `273612c8376ea0210e341dc99e7b9d1af20a4680c901aa8a6e24c142bb87deaa`; the private journal has
  ten `verified` / `copied` rows and zero remaining. Its separate 24-hour bucket-only user token was
  process-only and cleared. Together 071–074 verify 22 objects / 15,935,658 bytes. The remaining
  eligible copy set is 69 repertoire MP3 objects / 237,394,832 bytes; mapping, activation, source
  mutation, flags, unsupported avatar handling and client/device work did not run.
- [075](briefs/075-repertoire-mp3-r2-batch-1.md) completes the first bounded repertoire-audio
  slice. Runner `bc5711a` accepted the deterministic ten smallest MP3 objects / 20,496,706 bytes;
  every private EU R2 destination passed full GET/SHA-256 verification on attempt one. Aggregate
  SHA-256 is `e7d9dc60dad01f0629c3cdf53919b7df06f3fcd8071a5ab3a2048fa02ad18068`;
  the private journal has ten `verified` / `copied` rows and zero remaining. Its separate 24-hour
  bucket-only user token was process-only and cleared. Together 071–075 verify 32 objects /
  36,432,364 bytes. The remaining eligible copy set is 59 repertoire MP3 objects / 216,898,126
  bytes; mapping, activation, source mutation, flags, unsupported avatar handling and client/device
  work did not run. The next bounded proposal is the next ten smallest remaining MP3s /
  24,536,698 bytes, subject to separate owner approval.
- [076](briefs/076-repertoire-mp3-r2-batch-2.md) completes the second bounded repertoire-audio
  slice. Runner `ee94973` accepted the next deterministic ten smallest remaining MP3 objects /
  24,536,698 bytes; every private EU R2 destination passed full GET/SHA-256 verification on attempt
  one. Aggregate SHA-256 is `fea2949255615390d570da5c9cf8d05c8303ad1d5c2c9fce54a752b060523d0b`;
  the private journal has ten `verified` / `copied` rows and zero remaining. Its separate 24-hour
  bucket-only user token was process-only and cleared. Together 071–076 verify 42 objects /
  60,969,062 bytes. The remaining eligible copy set is 49 repertoire MP3 objects / 192,361,428
  bytes; mapping, activation, source mutation, flags, unsupported avatar handling and client/device
  work did not run. The next bounded proposal is the next ten smallest remaining MP3s /
  27,472,242 bytes, subject to separate owner approval.

## Delivery decisions

- Same product, Android-first usable beta, then full preserved scope and both-store release.
  A few days is the owner's delivery target, not a verified final-product/store-publication date.
- Retain Supabase DB/Auth/Realtime/Edge; private R2 is the Drive-exit preparation target.
  Existing hosting stays. Railway migration is not on the current path.
- Prefer <=$5/month total recurring infrastructure. Actual usage must be checked; no new paid
  plan/provider operation is authorized by this budget preference.
- First five choir members free, additional members billable. Individual sales deferred.
  Initial invoicing remains manual/web; price, period and seat-count lifecycle remain undecided.
- Web onboarding/payment preference does not waive mobile privacy, deletion or store review.
- Now: protected storage/read integration -> operational Android beta -> complete features/
  release obligations -> stable two-platform acceptance -> approved distribution and operations.

## Acceptance and resources

- 25 Sep [health check](reports/2026-09-25-proje-saglik-kontrolu.md): root 90/797 and mobile
  49/288 passed locally; E2E UI could not launch without Chromium. No live/device acceptance.
- 018–051 have dated local evidence; 033/C1 is locally accepted, including owner password restore.
  Their boundaries are in their briefs, not inferred hosted/runtime acceptance.
- 004 remains 25/27 with hardware postponed; 010 remains 6/7 with two live-product refusals open.
  Do not recreate deleted fixtures without applicable authority.
- Native annotation choices in [023](briefs/023-annotation-write-contract-inventory.md),
  push transport in 036, retention, plan pricing/counting and release accounts remain open.
- Native chat still lacks accepted social/media/administration and some status/presence flows;
  C4/C5, native writing/sync/offline, release/lifecycle/security and stores remain outstanding.
- About 31.2 GiB is free after retaining 068 and 071–076 evidence. The single retained backup,
  `genova_068_test_restore` and exact private copy sources/journals are
  deliberate inputs to the next checkpoint; disposable test clones were removed. No VM, simulator
  or mobile build remains.
  Dark-theme room-info contrast is a recorded beta UI follow-up, not a storage failure.
- 052 found Drive-folder filters in both catalogues, public Drive ACL writes and destructive
  submission replacement before history capture; include these in the remaining write/cutover batch.
  Existing Storage migration runs toward Drive, not away. 063 makes the authorized snapshot
  deterministic, 064 removes hand-edited metadata/manifest preparation and 065 adds atomic
  activation/refusal; 070 has now run inventory/metadata/manifest against the real snapshot and
  Google metadata, 071 proves one exact real R2 canary, 072 completes the remaining nine-object
  assignment copy, 073 completes the two eligible chat images and 074 completes the ten repertoire
  PDFs, 075 adds the first ten repertoire MP3s and 076 adds the next ten with full-byte readback.
  The remaining 49 MP3 objects still require bounded copy; cutover remains real-data work. 067 fixes the
  empty private EU bucket and bucket-only token identity. 068 proves backup/restore and local schema
  rehearsal; 069 now accepts dormant secrets/schema/functions and authenticated legacy read. Real
  inventory is accepted; remaining objects and every mapping/cutover action remain separately gated.
- One active result/one heavy process; >=10 GiB free; reassess after two failed approaches.
  Focused repair and code review precede final heavy gates. Android is the default runtime;
  iOS runs at integration/candidate gates or earlier when a platform-sensitive change requires it.
  Keep existing required checks and distinguish test, runtime, hosted, device and release proof.

## Authority and continuity

Local scoped implementation/tests/commits and owned cleanup remain authorized. Hosted data/schema,
provider activation/cutover, credentials, real accounts/email, spending, push/deploy/remote CI,
hardware and distribution retain applicable approval boundaries. Prepare concrete work before
asking for the exact missing choice/authority. Historical account/token risks remain unresolved.
Do not mark the full goal complete at beta, planning or local-test acceptance.
The [revised objective](mobil-teslim-plani.md#revised-goal-text) is canonical; WF-008 records its receipt.
The earlier request typed `genesinova.chori@gmail.com`; 070 verified and used the signed-in profile
and repository identity `genesinova.choir@gmail.com`. Do not revert to the typo for account work.
