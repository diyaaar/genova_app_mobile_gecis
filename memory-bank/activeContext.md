# Active context

Updated 27 September 2026. [WF-009](../docs/briefs/WF-009-controlled-delivery-execution-queue.md)
reconciles the execution queue after [WF-008's](../docs/briefs/WF-008-android-first-delivery-reset.md)
owner-approved reset; the [delivery plan](../docs/mobil-teslim-plani.md)
owns priorities, the objective and resource/test controls. [Handoff](../docs/agent-handoff.md)
is the short startup source. Historical acceptance remains in briefs and [progress](progress.md).

## Current outcome

Deliver the same production product Android-first: usable beta soon, then complete the full
roadmap and both-store readiness/release. The beta is neither a disposable demo nor final success.
065 is now locally accepted; the 053–060 release chain, deterministic inventory, verified manifest,
bounded copy executor and atomic activation/refusal transaction are ready locally.
[WF-011](../docs/briefs/WF-011-release-candidate-source-preflight.md) and
[066](../docs/briefs/066-node22-private-r2-cli-warning.md) fix candidate `e459bdd`; exact remote CI
and Vercel Preview pass. [067](../docs/briefs/067-cloudflare-r2-provider-bucket.md) activates R2
and fixes the empty private EU Standard bucket. [068](../docs/briefs/068-hosted-backup-isolated-r2-rehearsal.md)
now proves a fresh exact-project logical backup, isolated restore equality and the 061/063/065
schema rehearsal. 069 has since rolled and placed the bucket-only credential, applied the exact prerequisite plus
053–065 live chain and deployed all thirteen dormant functions with storage modes `legacy` and all
writes disabled. Dormant 503, invalid-ticket 401 and one authenticated legacy ranged `HEAD`
206/1-byte/application-octet-stream probe pass without a browser body. 069 is complete.
[070](../docs/briefs/070-real-inventory-metadata-preparation.md) completes the real read-only
control-plane gate: the private, audited 92-row retained-snapshot inventory reconciles 91 eligible
Google objects, preserves one unsupported room avatar and produces a capped 91-row /
253,330,490-byte private 064 manifest/report. Google access was metadata-only/online and returned no
refresh token. No media body, R2 request/object, hosted write or cutover occurred at 070; its
separately approved bounded canary is now completed by 071 below.
[071](../docs/briefs/071-single-object-r2-canary.md) now completes that first data-plane checkpoint:
after exact owner approval, one private 32,484-byte assignment PDF was fetched and copied to its
deterministic `genova-private` EU key; full destination GET matched SHA-256
`456be30791910b5cdc080ed82737ed8ef361660931774d03518368f4ee372b21`. The private one-row journal
is `verified` / `copied`. A bucket-only user credential had a 24-hour TTL and was cleared from the
single process and clipboard. No mapping, activation, flag, source mutation or second object ran.
[072](../docs/briefs/072-assignment-submission-r2-batch.md) now completes the rest of that family:
the exact remaining nine objects / 12,815,437 bytes (six PDF and three MP4) were fetched read-only
from Drive, copied to their deterministic private EU R2 keys and independently full-read. All nine
journal rows are `verified` / `copied`, with zero remaining. The 24-hour bucket-only user credential
was cleared from the process and clipboard. Together 071+072 verify all ten assignment-submission
objects / 12,847,921 bytes without mapping, activation, flags or source mutation.

## Latest owner choices

- Supabase DB/Auth/Realtime/Edge stay; private R2 is the selected preparation direction after the
  proposed storage separation. Railway hosting/database replacement is off the current path.
- Prefer total recurring infrastructure <=$5/month; no guaranteed bill or purchase authority.
- First five members per choir free; only additional members billable. No trial duration selected.
  Individual sales deferred from the first release; optional feature sales remain unspecified.
- Initial commercial administration/payment is on web; manual invoicing remains the v1 baseline.
  Mobile retains privacy/terms access, deletion entry and applicable store requirements.
- Android first for routine runtime and owner's phone test. Group iOS at integration/candidate
  acceptance, with earlier checks for platform-sensitive changes. Full release still needs both.
- Google Play account will be created; personal/company is undecided. Apple status unverified.
  Account-specific testing/review timelines are not under agent control.

## Exact work checkpoint

- [WF-010 local health report](../docs/reports/2026-09-25-proje-saglik-kontrolu.md): web and
  mobile gates pass; browser E2E lacks Chromium; live/device/release remain unverified.
- Last accepted candidate product/test is `e459bdd`/066; underlying 065 schema/test is `53c258f`.
- On 25 Sep GitHub `main` and Vercel Ready production remained `a13f696`, 177 commits / 546 files
  behind the candidate. Actions `36144388175` passed all three jobs and matching Vercel Preview is
  Ready. Follow [WF-011](../docs/briefs/WF-011-release-candidate-source-preflight.md) and the
  controlled queue before production; 067–069 later accepted provider/dormant hosted work only.
- 062 passes 38 focused manifest/stream/resume/refusal/batch cases and root 89 files/773 tests/build.
  Detailed evidence: [062](../docs/briefs/062-bounded-private-r2-copy-executor.md).
- 063 passes the six-family inventory/status/order/identity/privilege matrix and exact down/reapply
  on a disposable PG17 clone. [Evidence](../docs/briefs/063-private-r2-copy-inventory-contract.md).
- 064 passes 24 focused exact-input/metadata/status/private-path/atomic-output/refusal cases and the
  root 90 files/797 tests/build. [Evidence](../docs/briefs/064-private-r2-manifest-preparation.md).
- 065 passes exact snapshot/report/journal binding, atomic activation for six families/all accepted
  assignment owners, replay and stale/orphan/partial/target/role refusal on a disposable PG17 clone.
  [Evidence](../docs/briefs/065-private-r2-activation-reconciliation.md).
- [052](../docs/briefs/052-drive-exit-inventory.md) source inventory accepted; no files migrated.
  It maps uploads/reads/history/private audio/chat avatars/caches and three critical traps:
  Drive-folder catalogue filter, public-link creation, destructive replacement before history.
- Candidate branch/CI/Preview and R2 subscription/bucket provisioning are complete. Provider account
  `b642dee69121237ba20cc1a1bb50f1c5` has private `eu`/Standard bucket `genova-private` with public
  access disabled. 071 added one verified 32,484-byte canary and 072 added the remaining nine
  assignment objects; ten assignment objects / 12,847,921 bytes now have verified private copies.
  immediate overview aggregates remained stale and are not billing evidence. The original one-time
  bucket-only token values were lost; 069 rolled the token and placed current values only in the
  encrypted Supabase secret store. Browser memory was cleared afterward. The two chat images and
  79 repertoire objects, plus every activation/cutover step, remain separate approvals.
- 068 retained a mode-0600 1,317,637-byte logical dump and local `genova_068_test_restore`; hosted
  counts stayed stable and 7 schemas/74 base tables match. Runners 061/063/065 pass on disposable
  clones with the source unchanged. The owner-approved DB-password reset is stored only as the
  ignored mode-0600 `SUPABASE_DB_PASSWORD` entry in local `.env.local`; never reproduce its value.
- 069 live state: exact 16 migration ledger rows, thirteen `ACTIVE` version-1 functions and thirteen
  R2/mode secret names. Import-only bundling repair is `d64f092`; runner/resume are `25abd4c` and
  `359a383`. The local service-role key is stale; do not use it as hosted authentication evidence.
- 070 evidence: inventory fingerprint
  `8efe253fad57528a9ffc0a479a1cb47f7aeaa0c2e9f7af81c236a6c977c98afc`; manifest SHA-256
  `6fa331e06a091ecfa6e69a7c4f84771b656c197e1276390151d21cbb3b15e292`; runner `0340908`;
  metadata/manifest/report stay private outside Git. Exact R2 storage is 0.25333049 decimal GB;
  published free allowances make the incremental estimate `$0` only if other usage has not consumed
  them. 071 performed one small real-object PUT/GET but does not establish monthly total cost.
- 071 evidence: manifest SHA-256
  `6ebc14f727cf05c10344900422901a92927ca4c6d22c3d729536ea79f4e183d5`; source/destination SHA-256
  `456be30791910b5cdc080ed82737ed8ef361660931774d03518368f4ee372b21`; journal SHA-256
  `06ee363f39959498ba8dfe57060cc5ba2896302819858cd1c23b07b4ac1341cc`. Private directory/files
  remain `0700`/`0600`; no credential is retained locally.
- 072 evidence: runner `a3bcfde`; manifest SHA-256
  `0dd86de0c04acc0b81ced950f3283fd568c01bf1bf6f0820c0ff3c2ee5bf74c9`; 9 copied/verified,
  12,815,437 bytes, zero remaining; local/destination aggregate SHA-256
  `1bf0a0b3a02456fdb3797e24c530b8ef56d141d01744df2ce57ca487ca6eb995`; journal SHA-256
  `1dd893896b44d8e74fb8318a6fa9fe1f45ddcf19991fae87ec019b1182110262`. Private paths retain
  `0700`/`0600`; process variables and clipboard are clear; no credential is retained locally.
- User-owned `supabase/.temp/cli-latest` stays unstaged.
- Generated build/coverage output is removed; no VM/simulator/device output remains. About
  34.7 million KiB (~33.1 GiB) remains free after retaining 068 and 072 evidence. Cloudflare credentials
  must never enter chat or Git.

## Remaining requirements and authority

004 remains 25/27 with postponed hardware. 010 remains 6/7; revoked-link/wrong-account live UI
refusals remain unproved and deleted fixtures must not be silently recreated. 018 history remains.
033/C1 and 034–051 local acceptance is preserved, without upgrading it to hosted/device evidence.
023 annotation decisions, 036 transport, commercial prices/member counting, retention policy,
provider region/accounts and controlled deployment/migration remain actionable decision gates.
Native write/sync/offline, remaining chat/C4/C5, provider delivery, plan/lifecycle/security,
two-platform acceptance, stores and operations remain in the full objective.
Existing local-work/cleanup authority persists; external/data/credential/spending/publication/device
boundaries persist. Ask only for a genuinely blocking choice after preparing concrete work.
