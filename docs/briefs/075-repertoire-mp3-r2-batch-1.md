# 075 — Repertoire MP3 private R2 batch 1

**Status/date/writer:** COMPLETE / ACCEPTED / 2026-09-28 / primary agent.

**Observable result and user need:** Copy the deterministic ten smallest retained-snapshot
repertoire MP3 objects to their private `genova-private` EU R2 keys, independently full-read every
destination, prove byte-for-byte SHA-256 equality and retain a private append-only journal without
activating mappings or changing product behavior.

**Delivery focus:** Start the remaining 69-object / 237,394,832-byte repertoire-audio slice after
[074](074-repertoire-pdf-r2-batch.md). This first bounded audio batch contains exactly ten objects /
20,496,706 bytes selected by `contentLength` ascending, then `itemId` ascending. Later audio batches,
repertoire activation, avatar handling, cutover and beta acceptance remain separate gates.

**Start evidence:** Git HEAD `c030e71` accepts 074. The accepted 070 manifest contains exactly 69
`repertoire-file` `audio/mpeg` objects / 237,394,832 bytes. The selected private manifest has ten
rows / 20,496,706 bytes and SHA-256
`ea5f9af4de34b2b157ff3580f0b36854286175e5212bb169273c8c03463aa643`. Only the unrelated
`supabase/.temp/cli-latest` is dirty.

**Current work card:** (1) accept the exact ten-row manifest and fail-closed runner; (2) fetch only
those ten Drive bodies through the signed-in Genesi Nova Chrome profile and verify local MP3
signature/size/private modes; (3) create one 24-hour user token limited to Object Read & Write on
`genova-private`, run per-entry HEAD → conditional PUT → full GET and accept only ten verified
journal results. Exit with zero remaining; stop at the first mismatch or scope failure.

**Resources:** Available space was 33,674,288 KiB before execution and is 33,239,648 KiB after
retaining the 20,496,706-byte source batch plus its small manifest/journal and completing the local
gate; both readings remain above the 10 GiB floor. Owned private path is
`/Users/alidiyarduran/Documents/Codex/2026-09-28/genova-r2-checkpoint-075` (`0700`) with
`sources/` and generated private files at `0600`. Retain manifest, exact sources and journal until
the later activation/reconciliation decision; no VM, simulator, database clone or mobile build.

## Allowed paths and systems

- `supabase/test-support/075_repertoire_mp3_batch_1.ts` — exact ten-object live runner.
- This brief plus the short handoff/active/progress and delivery-plan status records after acceptance.
- The exact private 075 directory outside Git, derived ten-row manifest and ten numbered source
  files. No item ID, filename, source URL or credential is written to tracked files or user updates.
- Signed-in Genesinova Google Drive downloads for only the ten manifest IDs; reads only, with no
  folder crawl, playback, ACL/share change, rename, move or source deletion.
- Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, private EU Standard bucket
  `genova-private` and only the ten deterministic manifest keys.
- One user-owned 24-hour Object Read & Write credential restricted to `genova-private`, held in one
  process environment and cleared immediately after the bounded run.

## Transition start check

- Read `AGENTS.md`, handoff, active context, delivery queue/resource controls, 074 and applicable
  Cloudflare guidance; verify current checkout and private artifacts.
- One result: ten verified repertoire-MP3 destination objects. Backend modes stay `legacy`; all
  write flags stay `false`; DB mappings, Edge secrets/functions, web/mobile and Drive sources do
  not change.
- Preserve manifest/order/key contracts, source bytes and the existing 22 verified objects. An
  existing destination is never overwritten; adoption is allowed only after full source/destination
  hash equality.
- User authority: the owner explicitly approved 075 after receiving the exact ten-item /
  20,496,706-byte checkpoint. This covers the exact Drive reads, one 24-hour bucket-only credential
  and ten bounded R2 writes/readbacks. It does not authorize later MP3 batches, activation, avatar
  handling, deletion, deployment, DB/Edge changes or release.
- Required checks: immutable manifest hash/count/bytes/MIME; source metadata and local
  size/signature/mode; fail-before-network without dual target confirmation; per-object
  HEAD/conditional PUT/full GET; ten verified journal rows; aggregate and journal hashes;
  credential non-persistence; full `pnpm check`; links/status/diff/secret scan and owned cleanup.

## Out of scope

- The 22 verified assignment/chat/repertoire-PDF objects, remaining 59 repertoire MP3 objects and
  unsupported room avatar.
- Any DB mapping, family activation, `r2-preferred` / `r2-required`, write flag, Edge/web/mobile
  change, deployment, push, audio playback, device/beta/store action or source permission/deletion.
- Deleting provider objects, revoking credentials before automatic expiry, bulk retry after failure
  or treating this copy checkpoint as Android beta/backend acceptance.

## Risk, stop and rollback

- Wrong account/profile/project, manifest hash, selection order, item count, MIME, byte total,
  source signature, path/mode, bucket/jurisdiction, token scope or dual target confirmation stops
  before PUT.
- Runner caps the batch at ten items and 20,496,706 bytes. It journals and stops on the first
  failure.
- Existing destinations are read in full and either resumed/adopted only on exact equality or
  refused. No overwrite or automatic provider deletion exists.
- Git revert removes only the runner/records, not external bytes. Successful objects and private
  journal are retained for later reconciliation; any deletion is separately approved.

## Definition of done

- [x] Exact ten-row/20,496,706-byte/10-MP3 manifest and sources pass private-path checks.
- [x] Runner refuses before network without dual exact-target approval and passes `pnpm check`.
- [x] Ten entries are independently full-read and SHA-256 verified in R2; journal has zero
  unverified/failed entries and the runner reports zero remaining.
- [x] Credential, clipboard, private modes, secret scan and retained-artifact checks pass.
- [x] Source, DB/Edge/backend mode/flags/mappings and all out-of-scope items remain unchanged.
- [x] Diff review, local links/status checks and separate code/document commits pass.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact derived batch manifest | yes | PASS | 2026-09-28, private local artifact | Deterministic `contentLength asc, itemId asc` selection is exactly ten `audio/mpeg` rows / 20,496,706 bytes. Manifest SHA-256 is `ea5f9af4de34b2b157ff3580f0b36854286175e5212bb169273c8c03463aa643`; all ten numbered sources match manifest sizes, MP3 signatures and `0600` modes. |
| Fail-closed runner and required local gate | yes | PASS | Local repository at `bc5711a` | Synthetic exact-size placeholders refused with `target-confirmation-required` before network or journal creation. Focused ESLint/typecheck pass; fresh `pnpm check` passes lint, typecheck, 90 files / 797 tests, coverage, service-worker syntax and the Next production build. Generated `.next` and `coverage` were removed. |
| Exact Drive metadata/body reads | yes | PASS | Genesi Nova Chrome / Genesinova Drive | The correct `genesinova.choir@gmail.com` profile was visibly verified for every preview. Exactly the ten manifest bodies were downloaded read-only; playback, rename, move, ACL/share change and source deletion did not occur. Download cleanup was hash-gated and retained only the numbered manifest sources. |
| R2 HEAD/conditional PUT/full GET and journal | yes | PASS | Real Cloudflare EU R2 | Runner reports `processed:10`, `bytes:20496706`, `remaining:0`, `verified:10`, `actions:{copied:10}`. All ten attempt-one journal rows are `verified` / `copied` after independent full GET. Aggregate SHA-256 is `e7d9dc60dad01f0629c3cdf53919b7df06f3fcd8071a5ab3a2048fa02ad18068`; journal SHA-256 is `2808a52e1bdc3e2e2ff4a917ad14b19f63e25dafcaae4bd6d75564ba649cf4c3`. |
| Credential and private-artifact hygiene | yes | PASS | Chrome/process/private directory | User token `genova-075-repertoire-mp3-1` is restricted to Object Read & Write on `genova-private | EU`, active Sep 28–29 only. Values lived in one shell process, were unset before exit and were not written to disk; clipboard is empty. Directory/files retain `0700`/`0600`; token-value scan is zero. |
| Source/backend/mapping/flag stability | yes | PASS | Drive + bounded runner boundary | The bounded runner has no DB/Edge/activation path. No source mutation, mapping, backend-mode/client-flag change, deployment, audio playback, avatar action or device/release action ran. Existing 22 verified objects were not selected or overwritten. Hosted modes/flags were not freshly queried, so this is an execution-boundary claim rather than a new hosted-state acceptance. |
| Later MP3s, activation, avatar, device/release | N/A — later authority | N/A | Not authorized in 075 | Remain required for the wider goal. |

075 closes only this ten-object copy checkpoint. Together 071–075, 32 objects / 36,432,364 bytes
now have verified private copies. The remaining eligible copy set is 59 repertoire MP3 objects /
216,898,126 bytes. Ten copied MP3s do not authorize later audio batches, mapping activation,
avatar handling, source removal, client flags, beta distribution or completion of the wider goal.
