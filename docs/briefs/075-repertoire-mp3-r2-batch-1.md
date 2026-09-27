# 075 — Repertoire MP3 private R2 batch 1

**Status/date/writer:** IN PROGRESS / OWNER APPROVED / 2026-09-28 / primary agent.

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

**Resources:** Available space is 33,674,288 KiB. Expected retained source growth is 20,496,706
bytes plus a small manifest/journal, leaving far more than the 10 GiB floor. Owned private path is
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

- [ ] Exact ten-row/20,496,706-byte/10-MP3 manifest and sources pass private-path checks.
- [ ] Runner refuses before network without dual exact-target approval and passes `pnpm check`.
- [ ] Ten entries are independently full-read and SHA-256 verified in R2; journal has zero
  unverified/failed entries and the runner reports zero remaining.
- [ ] Credential, clipboard, private modes, secret scan and retained-artifact checks pass.
- [ ] Source, DB/Edge/backend mode/flags/mappings and all out-of-scope items remain unchanged.
- [ ] Diff review, local links/status checks and separate code/document commits pass.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact derived batch manifest | yes | NOT RUN | 2026-09-28, private local artifact | Must bind the deterministic ten smallest repertoire MP3s, exact hash/count/bytes and MIME. |
| Fail-closed runner and required local gate | yes | NOT RUN | Local repository | Exact path/target/caps/source files; no approval or wrong input refuses before network; `pnpm check`. |
| Exact Drive metadata/body reads | yes | NOT RUN | Genesi Nova Chrome / Genesinova Drive | Ten IDs only; no source mutation, playback or leaked download URL. |
| R2 HEAD/conditional PUT/full GET and journal | yes | NOT RUN | Real Cloudflare EU R2 | Every item must be verified; first failure stops; no overwrite. |
| Credential and private-artifact hygiene | yes | NOT RUN | Chrome/process/private directory | 24-hour bucket-only token, process-only; clipboard/variables cleared; modes and scans pass. |
| Source/backend/mapping/flag stability | yes | NOT RUN | Drive + bounded runner boundary | No ACL/body mutation, DB/Edge/mode/flag/mapping change. |
| Later MP3s, activation, avatar, device/release | N/A — later authority | N/A | Not authorized in 075 | Remain required for the wider goal. |

Required FAIL or NOT RUN keeps 075 open. Ten copied MP3s do not authorize later audio batches,
mapping activation, avatar handling, source removal, client flags, beta distribution or completion
of the wider goal.
