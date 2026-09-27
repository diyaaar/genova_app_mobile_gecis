# 074 — Repertoire PDF private R2 batch

**Status/date/writer:** COMPLETE / ACCEPTED / 2026-09-27 / primary agent.

**Observable result and user need:** Copy the ten retained-snapshot repertoire PDF objects to their
deterministic private `genova-private` EU R2 keys, independently re-read every destination, prove
full-byte SHA-256 equality and retain a private append-only journal without activating mappings or
changing product behavior.

**Delivery focus:** Establish the repertoire family with its complete, smallest natural PDF slice
after [073](073-chat-message-image-r2-batch.md), before the 69-object / 237,394,832-byte MP3 slice.
Repertoire activation, audio batches, avatar handling, cutover and beta acceptance remain later gates.

**Start evidence:** Git HEAD `d2cd422` accepts 073. The accepted 070 manifest contains exactly ten
`repertoire-file` PDF objects / 2,289,699 bytes. The derived private manifest SHA-256 is
`e84805ed62a4336f11462f766b4213084bb5a9be14fa65fd7a7b09f0097d0850`. Only the unrelated
`supabase/.temp/cli-latest` is dirty.

**Current work card:** (1) accept the exact ten-row manifest and fail-closed batch runner; (2) fetch
exactly those ten Drive bodies through the signed-in Genesi Nova Chrome profile and verify local
PDF signatures/size/private modes; (3) create one 24-hour user token limited to Object Read & Write
on `genova-private`, run per-entry HEAD → conditional PUT → full GET and accept only ten verified
journal results. Exit with zero remaining; stop at the first mismatch or scope failure.

**Resources:** Available space is 34,200,452 KiB. Expected retained source growth is 2,289,699 bytes
plus a small manifest/journal, leaving far more than the 10 GiB floor. Owned private path is
`/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-074` (`0700`) with
`sources/` and generated private files at `0600`. Retain manifest, exact sources and journal until
the later activation/reconciliation decision; no VM, simulator, database clone or mobile build.

## Allowed paths and systems

- `supabase/test-support/074_repertoire_pdf_batch.ts` — exact ten-object live runner.
- This brief plus the short handoff/active/progress and delivery-plan status records after acceptance.
- The exact private 074 directory outside Git, derived ten-row manifest and ten numbered source
  files. No item ID, filename, source URL or credential is written to tracked files or chat.
- Signed-in Genesinova Google Drive downloads for only the ten manifest IDs; reads only, with no
  folder crawl, ACL/share change, rename, move or source deletion.
- Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, private EU Standard bucket
  `genova-private` and only the ten deterministic manifest keys.
- One user-owned 24-hour Object Read & Write credential restricted to `genova-private`, held in one
  process environment and cleared immediately after the bounded run.

## Transition start check

- Read `AGENTS.md`, handoff, active context, delivery queue/resource controls, transition guide,
  073 and applicable Cloudflare guidance; verify current checkout and private artifacts.
- One result: ten verified repertoire-PDF destination objects. Backend modes stay `legacy`; all
  write flags stay `false`; DB mappings, Edge secrets/functions, web/mobile and Drive sources do
  not change.
- Preserve manifest/order/key contracts, source bytes and the existing twelve verified objects.
  An existing destination is never overwritten; adoption is allowed only after full
  source/destination hash equality.
- User authority: the owner explicitly approved 074 after receiving the exact ten-item /
  2,289,699-byte checkpoint. This covers the exact Drive reads, one 24-hour bucket-only credential
  and ten bounded R2 writes/readbacks. It does not authorize MP3 copy, activation, avatar handling,
  deletion, deployment, DB/Edge changes or release.
- Required checks: immutable manifest hash/count/bytes/MIME mix; source metadata and local
  size/signature/mode; fail-before-network without dual target confirmation; per-object
  HEAD/conditional PUT/full GET; ten verified journal rows; aggregate and journal hashes;
  credential non-persistence; full `pnpm check`; links/status/diff/secret scan and owned cleanup.

## Out of scope

- The twelve verified assignment/chat objects, 69 repertoire MP3 files and unsupported room avatar.
- Any DB mapping, family activation, `r2-preferred` / `r2-required`, write flag, Edge/web/mobile
  change, deployment, push, device/beta/store action or source permission/deletion.
- Deleting provider objects, revoking credentials before automatic expiry, bulk retry after failure
  or treating this copy checkpoint as Android beta/backend acceptance.

## Risk, stop and rollback

- Wrong account/profile/project, manifest hash, item count, MIME mix, byte total, source signature,
  path/mode, bucket/jurisdiction, token scope or dual target confirmation stops before PUT.
- Runner caps the batch at ten items and 2,289,699 bytes. It journals and stops on the first failure.
- Existing destinations are read in full and either resumed/adopted only on exact equality or
  refused. No overwrite or automatic provider deletion exists.
- Git revert removes only the runner/records, not external bytes. Successful objects and private
  journal are retained for later reconciliation; any deletion is separately approved.

## Definition of done

- [x] Exact ten-row/2,289,699-byte/10-PDF manifest and sources pass private-path checks.
- [x] Runner refuses before network without dual exact-target approval and passes `pnpm check`.
- [x] Ten entries are independently full-read and SHA-256 verified in R2; journal has zero
  unverified/failed entries and the runner reports zero remaining.
- [x] Credential, clipboard, private modes, secret scan and retained-artifact checks pass.
- [x] Source, DB/Edge/backend mode/flags/mappings and all out-of-scope families remain unchanged.
- [x] Diff review, local links/status checks and separate code/document commits pass.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact derived batch manifest | yes | PASS | 2026-09-27, private local artifact | Exactly 10 rows / 2,289,699 bytes / 10 `application/pdf`; manifest SHA-256 `e84805ed62a4336f11462f766b4213084bb5a9be14fa65fd7a7b09f0097d0850`. Ten numbered files match manifest sizes, `%PDF-` signatures and mode `0600`. |
| Fail-closed runner and required local gate | yes | PASS | Local repository at runner `b776a13` | Synthetic exact-size placeholders without dual target approval returned `target-confirmation-required` before network or journal creation. Targeted lint/typecheck and full `pnpm check` pass: 90 files / 797 tests, coverage/service-worker check and Next production build. Generated `.next`/coverage output was removed. |
| Exact Drive metadata/body reads | yes | PASS | Genesi Nova Chrome / `genesinova.choir@gmail.com` | Only the ten manifest URLs were opened and downloaded. Every body matched its expected length and PDF signature. No Drive share, ACL, rename, move, source write or deletion action ran. One delayed duplicate browser download was hash-equal to the already retained source and moved to Trash; it was not a manifest source or provider object. |
| R2 HEAD/conditional PUT/full GET and journal | yes | PASS | Real Cloudflare `genova-private` EU | Runner reported `batch-verified`: 10 processed / 2,289,699 bytes / 10 copied / 10 verified / zero remaining. All journal rows are attempt 1, `copied` and `verified`; aggregate source/destination SHA-256 `273612c8376ea0210e341dc99e7b9d1af20a4680c901aa8a6e24c142bb87deaa`; journal SHA-256 `e413cfd3b2d2e53d6b6168566a54bccfae14828091823ae60562ca78bc43f7c6`. |
| Credential and private-artifact hygiene | yes | PASS | Chrome/process/private directory | User token `genova-074-repertoire-pdfs` is limited to Object Read & Write on `genova-private | EU`, active Sep 27–28 only. Values lived in one shell process, were unset before exit and were not written to disk; clipboard is empty. Private directory/files retain `0700`/`0600`; token-value scans of private and tracked scopes are zero. |
| Source/backend/mapping/flag stability | yes | PASS | Drive + bounded runner boundary | The runner has no DB/Edge/mapping/flag path and no such call was made. Drive was read-only. Hosted modes/flags were not re-queried, so this is an execution-boundary claim rather than a fresh hosted-state acceptance. No audio/avatar/client/deployment action ran. |
| MP3, activation, avatar, device/release | N/A — later authority | N/A | Not authorized in 074 | Remain required for the wider goal. |

Required FAIL or NOT RUN keeps 074 open. Ten copied PDFs do not authorize MP3 copy, mapping
activation, avatar handling, source removal, client flags, beta distribution or completion of the
wider goal.

## Accepted result and next checkpoint

074 closes the complete repertoire-PDF slice. Together 071–074 now hold 22 verified private R2
objects / 15,935,658 bytes. The remaining eligible retained-snapshot copy set is 69 repertoire MP3
objects / 237,394,832 bytes; the unsupported room avatar remains excluded. The next proposed
checkpoint is the deterministic ten smallest remaining MP3 objects / 20,496,706 bytes under the
same read-only Drive, bucket-only 24-hour credential, no-overwrite and full-GET/SHA-256 controls.
It requires separate owner approval and does not include activation, mapping, flags or deletion.
