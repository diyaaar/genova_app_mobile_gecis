# 073 — Chat-message image private R2 batch

**Status/date/writer:** IN PROGRESS / OWNER APPROVED / 2026-09-27 / primary agent.

**Observable result and user need:** Copy the two retained-snapshot `chat-message-image` objects
to their deterministic private `genova-private` EU R2 keys, independently re-read both
destinations, prove full-byte SHA-256 equality and retain a private append-only journal without
activating mappings or changing product behavior.

**Delivery focus:** Close the smallest remaining copied-family gap after [072](072-assignment-submission-r2-batch.md),
before the much larger 79-object repertoire slice. Chat mapping activation, room avatar handling,
repertoire copy, cutover and beta acceptance remain later gates.

**Start evidence:** Git HEAD `a51d6ea` accepts 072. The accepted 070 manifest contains exactly two
`chat-message-image` objects / 798,038 bytes, both JPEG. The derived private manifest SHA-256 is
`e6c377a06773fd2f660f5ddc01e88acc51cb347468aa4a67207dba20884427e6`. Only the unrelated
`supabase/.temp/cli-latest` is dirty.

**Current work card:** (1) accept the exact two-row manifest and fail-closed batch runner; (2) fetch
exactly those two Drive bodies through the signed-in Genesi Nova Chrome profile and verify local
MIME/size/private modes; (3) create one 24-hour user token limited to Object Read & Write on
`genova-private`, run per-entry HEAD → conditional PUT → full GET and accept only two verified
journal results. Exit with zero remaining; stop at the first mismatch or scope failure.

**Resources:** Available space is 34,727,120 KiB. Expected retained source growth is 798,038 bytes
plus a small manifest/journal, leaving far more than the 10 GiB floor. Owned private path is
`/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-073` (`0700`) with
`sources/` and generated private files at `0600`. Retain manifest, exact sources and journal until
the later activation/reconciliation decision; no VM, simulator, database clone or mobile build.

## Allowed paths and systems

- `supabase/test-support/073_chat_message_image_batch.ts` — exact two-object live runner.
- This brief plus the short handoff/active/progress and delivery-plan status records after acceptance.
- The exact private 073 directory outside Git, derived two-row manifest and two numbered source
  files. No item ID, filename, source URL or credential is written to tracked files or chat.
- Signed-in Genesinova Google Drive downloads for only the two manifest IDs; reads only, with no
  folder crawl, ACL/share change, rename, move or source deletion.
- Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, private EU Standard bucket
  `genova-private` and only the two deterministic manifest keys.
- One user-owned 24-hour Object Read & Write credential restricted to `genova-private`, held in one
  process environment and cleared immediately after the bounded run.

## Transition start check

- Read `AGENTS.md`, handoff, active context, delivery queue/resource controls, transition guide,
  072 and applicable Cloudflare guidance; verify current checkout and private artifacts.
- One result: two verified chat-message-image destination objects. Backend modes stay `legacy`;
  all write flags stay `false`; DB mappings, Edge secrets/functions, web/mobile and Drive sources
  do not change.
- Preserve manifest/order/key contracts, source bytes and existing ten verified assignment objects.
  An existing destination is never overwritten; adoption is allowed only after full
  source/destination hash equality.
- User authority: the owner explicitly approved 073 after receiving the exact two-item /
  798,038-byte checkpoint. This covers the exact Drive reads, one 24-hour bucket-only credential and
  two bounded R2 writes/readbacks. It does not authorize activation, repertoire, avatar handling,
  deletion, deployment, DB/Edge changes or release.
- Required checks: immutable manifest hash/count/bytes/MIME mix; source metadata and local
  size/mode; fail-before-network without dual target confirmation; per-object HEAD/conditional
  PUT/full GET; two verified journal rows; aggregate and journal hashes; credential
  non-persistence; full `pnpm check`; links/status/diff/secret scan and owned cleanup.

## Out of scope

- The ten verified assignment objects, 79 repertoire files and unsupported room avatar.
- Any DB mapping, family activation, `r2-preferred` / `r2-required`, write flag, Edge/web/mobile
  change, deployment, push, device/beta/store action or source permission/deletion.
- Deleting provider objects, revoking credentials before automatic expiry, bulk retry after failure
  or treating this copy checkpoint as Android beta/backend acceptance.

## Risk, stop and rollback

- Wrong account/profile/project, manifest hash, item count, MIME mix, byte total, source metadata,
  path/mode, bucket/jurisdiction, token scope or dual target confirmation stops before PUT.
- Runner caps the batch at two items and 798,038 bytes. It journals and stops on the first failure.
- Existing destinations are read in full and either resumed/adopted only on exact equality or
  refused. No overwrite or automatic provider deletion exists.
- Git revert removes only the runner/records, not external bytes. Successful objects and private
  journal are retained for later reconciliation; any deletion is separately approved.

## Definition of done

- [ ] Exact two-row/798,038-byte/2-JPEG manifest and sources pass private-path checks.
- [ ] Runner refuses before network without dual exact-target approval and passes `pnpm check`.
- [ ] Two entries are independently full-read and SHA-256 verified in R2; journal has zero
  unverified/failed entries and the runner reports zero remaining.
- [ ] Credential, clipboard, private modes, secret scan and retained-artifact checks pass.
- [ ] Source, DB/Edge/backend mode/flags/mappings and all out-of-scope families remain unchanged.
- [ ] Diff review, local links/status checks and separate code/document commits pass.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact derived batch manifest | yes | NOT RUN | 2026-09-27, private local artifact | Must bind two chat images, exact hash/count/bytes and 2 JPEG. |
| Fail-closed runner and required local gate | yes | NOT RUN | Local repository | Exact path/target/caps/source files; no approval or wrong input refuses before network; `pnpm check`. |
| Exact Drive metadata/body reads | yes | NOT RUN | Genesi Nova Chrome / Genesinova Drive | Two IDs only; no source mutation or leaked download URL. |
| R2 HEAD/conditional PUT/full GET and journal | yes | NOT RUN | Real Cloudflare EU R2 | Every item must be verified; first failure stops; no overwrite. |
| Credential and private-artifact hygiene | yes | NOT RUN | Chrome/process/private directory | 24-hour bucket-only token, process-only; clipboard/variables cleared; modes and scans pass. |
| Source/backend/mapping/flag stability | yes | NOT RUN | Drive + bounded runner boundary | No ACL/body mutation, DB/Edge/mode/flag/mapping change. |
| Activation, repertoire/avatar, device/release | N/A — later authority | N/A | Not authorized in 073 | Remain required for the wider goal. |

Required FAIL or NOT RUN keeps 073 open. Two copied objects do not authorize mapping activation,
repertoire copy, avatar handling, source removal, client flags, beta distribution or completion of
the wider goal.
