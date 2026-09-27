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
refresh token. No media body, R2 request/object, hosted write or cutover occurred; the next external
gate is a separately approved bounded canary copy.
[071](../docs/briefs/071-single-object-r2-canary.md) has prepared that checkpoint without external
effects: one private 32,484-byte assignment-PDF manifest and exact-target runner `bb56cb5` pass the
local refusal plus full root gate. Creating a bucket-scoped credential, reading the real body and
writing/verifying the first R2 object remain NOT RUN pending explicit owner approval.

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
  `b642dee69121237ba20cc1a1bb50f1c5` has empty private `eu`/Standard bucket `genova-private` with
  public access disabled and observed R2 usage $0.00/0 B/0 operations. The original one-time
  bucket-only token values were lost; 069 rolled the token and placed current values only in the
  encrypted Supabase secret store. Browser memory was cleared afterward. Real inventory/object/
  copy/cutover steps remain separate approvals.
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
  them. No real R2 operation has yet tested that assumption.
- User-owned `supabase/.temp/cli-latest` stays unstaged.
- 064's build/coverage/temp output is removed; no VM/simulator/device/media output remains. About
  36.4 million KiB (~34.7 GiB) remains free after retaining 068 evidence. Cloudflare credentials
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
