# 072 — Assignment-submission private R2 batch

**Status/date/writer:** IN PROGRESS / OWNER APPROVED / 2026-09-27 / primary agent.

**Observable result and user need:** Copy the nine remaining retained-snapshot
`assignment-submission` objects to their deterministic private `genova-private` EU R2 keys,
independently re-read every destination, prove full-byte SHA-256 equality and retain a private
append-only journal without activating mappings or changing product behavior.

**Delivery focus:** Expand [071's](071-single-object-r2-canary.md) one-object proof to the complete
remaining assignment-submission family slice. This closes the first bounded multi-object copy
checkpoint; family activation, other families, cutover and beta acceptance remain later gates.

**Start evidence:** Git HEAD `a8a9a8f` accepts 071. The accepted 070 manifest contains ten
assignment-submission objects. Excluding the verified 071 canary leaves exactly nine objects /
12,815,437 bytes: six PDFs / 6,290,964 bytes and three MP4 files / 6,524,473 bytes. The derived
private manifest SHA-256 is
`0dd86de0c04acc0b81ced950f3283fd568c01bf1bf6f0820c0ff3c2ee5bf74c9`. Only the unrelated
`supabase/.temp/cli-latest` is dirty.

**Current work card:** (1) accept the exact nine-row manifest and fail-closed batch runner;
(2) fetch exactly those nine Drive bodies and verify local MIME/size/private modes; (3) create one
24-hour user token limited to Object Read & Write on `genova-private`, run per-entry HEAD →
conditional PUT → full GET and accept only nine verified journal results. Exit with zero remaining;
stop at the first mismatch or scope failure.

**Resources:** Existing free space is about 35.2 million KiB. Expected retained source growth is
12,815,437 bytes plus a small manifest/journal; peak remains far above the 10 GiB floor. Owned
private path is `/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-072`
(`0700`) with `sources/` and files at `0600`. Retain manifest, exact sources and journal until the
later activation/reconciliation decision; no VM, simulator, database clone or mobile build.

## Allowed paths and systems

- `supabase/test-support/072_assignment_submission_batch.ts` — exact nine-object live runner.
- `docs/briefs/072-assignment-submission-r2-batch.md` plus the short handoff/active/progress and
  delivery-plan status records after acceptance.
- The exact private 072 directory outside Git, derived nine-row manifest and nine numbered source
  files. No item ID, filename, source URL or credential is written to tracked files or chat.
- Connected Genesinova Google Drive raw downloads for only the nine manifest IDs; metadata/body
  reads only, with no folder crawl, ACL/share change, rename, move or source deletion.
- Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, private EU Standard bucket
  `genova-private` and only the nine deterministic manifest keys.
- One user-owned 24-hour Object Read & Write credential restricted to `genova-private`, held in one
  process environment and cleared immediately after the bounded run.

## Sources and existing pattern

- [062 executor](062-bounded-private-r2-copy-executor.md), [070 manifest](070-real-inventory-metadata-preparation.md),
  [071 canary](071-single-object-r2-canary.md) and the
  [private R2 runbook](../private-r2-release-runbook.md).
- Current official [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/) for
  bucket-scoped S3 credentials and the EU endpoint. Use the shortest dashboard TTL established by
  071; do not grant general Wrangler OAuth permissions.
- Connected Google Drive raw fetch for stored non-native PDF/MP4 objects after exact metadata
  grounding. Never expose bearer download URLs or inline base64.

## Transition start check

- Read `AGENTS.md`, handoff, active context, delivery queue/resource controls, transition guide,
  work cycle, 062/070/071, the R2 runbook and applicable Cloudflare/Drive skills.
- One result: nine verified assignment-submission destination objects. Backend modes stay
  `legacy`; all write flags stay `false`; DB mappings, Edge secrets/functions, web/mobile and Drive
  sources do not change.
- Preserve manifest/order/key contracts, source bytes and existing canary. An existing destination
  is never overwritten; adoption is allowed only after full source/destination hash equality.
- User authority: the owner explicitly approved 072 after receiving the exact nine-item /
  12,815,437-byte checkpoint. This covers the exact Drive reads, one 24-hour bucket-only credential
  and nine bounded R2 writes/readbacks. It does not authorize activation, other families, deletion,
  deployment, DB/Edge changes or release.
- Required checks: immutable manifest hash/count/bytes/MIME mix; source metadata and local
  size/mode; fail-before-network without dual target confirmation; per-object HEAD/conditional
  PUT/full GET; nine verified journal rows; aggregate and journal hashes; credential non-persistence;
  full `pnpm check`; links/status/diff/secret scan and owned cleanup.

## Out of scope

- The already verified 071 canary, 79 repertoire files, two chat images and unsupported room avatar.
- Any DB mapping, family activation, `r2-preferred` / `r2-required`, write flag, Edge/web/mobile
  change, deployment, push, device/beta/store action or source permission/deletion.
- Deleting provider objects, revoking credentials before automatic expiry, bulk retry after failure
  or treating this copy checkpoint as Android beta/backend acceptance.

## Risk, stop and rollback

- Wrong account/profile/project, manifest hash, item count, MIME mix, byte total, source metadata,
  path/mode, bucket/jurisdiction, token scope or dual target confirmation stops before PUT.
- Runner caps the batch at nine items and 12,815,437 bytes. It journals and stops on the first
  failure. Do not continue blindly; resolve the exact destination with signed HEAD/GET and the
  immutable manifest before any resumed attempt.
- Existing destinations are read in full and either resumed/adopted only on exact equality or
  refused. No overwrite or automatic provider deletion exists.
- Git revert removes only the runner/records, not external bytes. Successful objects and private
  journal are deliberately retained for later reconciliation; any deletion is separately approved.

## Small implementation steps

1. Validate the derived private manifest, runner shape, source filename contract and no-approval
   refusal locally; run the required root gate and commit test-support separately from records.
2. Ground and download the exact nine Drive objects to numbered private files; prove count, MIME,
   byte totals and permissions without exposing private identifiers.
3. Create the approved 24-hour bucket-only credential, execute once, clear secrets, verify the
   nine-row journal/provider result and record/commit acceptance without activation.

## Definition of done

- [ ] Exact nine-row/12,815,437-byte/6-PDF+3-MP4 manifest and sources pass private-path checks.
- [ ] Runner refuses before network without dual exact-target approval and passes `pnpm check`.
- [ ] Nine entries are independently full-read and SHA-256 verified in R2; journal has zero
  unverified/failed entries and the runner reports zero remaining.
- [ ] Credential, clipboard, private modes, secret scan and retained-artifact checks pass.
- [ ] Source, DB/Edge/backend mode/flags/mappings and all out-of-scope families remain unchanged.
- [ ] Diff review, local links/status checks and separate code/document commits pass.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact derived batch manifest | yes | NOT RUN | 2026-09-27, private local artifact | Must bind nine remaining assignment objects, exact hash/count/bytes and 6 PDF + 3 MP4. |
| Fail-closed runner and required local gate | yes | NOT RUN | Local repository | Exact path/target/caps/source files; no approval or wrong input refuses before network; `pnpm check`. |
| Exact Drive metadata/body reads | yes | NOT RUN | Connected Genesinova Drive | Nine IDs only; no source mutation or leaked bearer URL. |
| R2 HEAD/conditional PUT/full GET and journal | yes | NOT RUN | Real Cloudflare EU R2 | Every item must be verified; first failure stops; no overwrite. |
| Credential and private-artifact hygiene | yes | NOT RUN | Chrome/process/private directory | 24-hour bucket-only token, process-only; clipboard/variables cleared; modes and scans pass. |
| Source/backend/mapping/flag stability | yes | NOT RUN | Drive + hosted boundaries | No ACL/body mutation, DB/Edge/mode/flag/mapping change. |
| Activation, other families, device/release | N/A — later authority | N/A | Not authorized in 072 | Remain required for the wider goal. |

Required FAIL or NOT RUN keeps 072 open. Nine copied objects do not authorize mapping activation,
other families, source removal, client flags, beta distribution or completion of the wider goal.
