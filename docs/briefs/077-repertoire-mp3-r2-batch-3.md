# 077 — next bounded repertoire MP3 private R2 copy

**Status/date/writer:** APPROVAL CHECKPOINT PREPARED, NOT EXECUTED / 29 September 2026 /
primary agent, single writer.

**One outcome if approved:** Copy exactly the next ten smallest not-yet-copied repertoire MP3
objects from the retained 070 snapshot to their preassigned private EU R2 keys; independently
full-read each destination and record SHA-256-verified append-only results. No mapping activation,
read-mode/flag change, public-link change or source deletion.

**Why now:** The [delivery queue](../mobil-teslim-plani.md#controlled-execution-queue--24-september-2026)
still has 49 eligible MP3 objects after [075](075-repertoire-mp3-r2-batch-1.md) and
[076](076-repertoire-mp3-r2-batch-2.md). The separate
[090 ticket decision](090-private-file-ticket-revocation-contract.md) is pending; it does not
prevent copying verified bytes, but it does prevent claiming safe activation/Android beta.
This is a concrete copy checkpoint, not a new product feature or permission to repeat all batches.

## Transition start check and exact selection

Read AGENTS, handoff/active context, migration guide, MIGRATION, decisions #28–31, delivery
execution controls, 070/075/076, copy runner, runbook and the Cloudflare R2 skill's storage
guidance. Current `main/033cb4b`; only unrelated `supabase/.temp/cli-latest` is dirty and must
remain unstaged. One writer. Web/native file IDs, private-read contract, old sources and all 42
previously accepted private copies remain unchanged. This brief's preparation is read-only and
does not reopen earlier real copy acceptance as fresh provider verification.

Retained private 070 `copy-manifest.jsonl` SHA-256 still equals
`6fa331e06a091ecfa6e69a7c4f84771b656c197e1276390151d21cbb3b15e292`.
The 075/076 batch manifests still equal their recorded hashes. Their ten-row journals each
contain matching `verified` destination records under the repository's own
`journalMatchesManifest` parser; the two batches are the exact first 20
`repertoire-file` / `audio/mpeg` rows sorted by `contentLength` ascending, then `itemId` ascending.
Read-only recomputation from these protected files yields 91 manifest rows, 69 MP3 candidates,
20 previously journal-verified MP3s, and 49 remaining / 192,361,428 bytes. The next ten total
**27,472,242 bytes**; item sizes range 2,641,083–2,780,134 bytes. Canonical ten-row JSONL
(`JSON.stringify(row)` per line plus a final newline) is 6,468 bytes, SHA-256
`44220f574e762155593267d33aaa2a45cc5fd6631c629b3c25bb68f44099e391`.
No private item ID, file name, Drive URL, key or credential is copied into this record.
This is retained-snapshot selection, not a current hosted DB/R2/Drive check. Eight retained
private manifest/journal/directory paths pass mode and non-symlink checks. A first read-only
checker invocation mixed CommonJS `require` with top-level `await` and refused before reading;
the corrected ESM import then verified all 20 journal/manifests without a data write.

At preparation, free space is 32,971,912 KiB (~31.4 GiB). Ten source bodies total ~26.2 MiB;
allow 100 MiB additional task-local source/journal/scratch allocation plus existing installed
browser and dependencies, still >10 GiB floor. Before an approved run, remeasure free space,
private path modes and current browser/provider/account target; stop if estimates or identity drift.
No new VM, simulator, dependency install or build is required for this preparation. Retain
private 070/075/076 sources/journals for later 065 reconciliation; do not clean them as caches.

## Owner approval gate and later bounded execution

Current authorization covers **selection preparation only**. Prior 076 approval explicitly
excluded later audio batches. Do not issue a Cloudflare token, fetch a Drive body, PUT/GET R2,
change hosted DB/Edge/flags, push/deploy or open a real device before the exact new authority.

If approved, allow only: the ten rows identified by the above manifest hash in the Genesi Nova
Google account; read those ten current Drive bodies after checking name/MIME/length and account;
write their predetermined keys into private EU Standard bucket `genova-private` under exact account
`b642dee69121237ba20cc1a1bb50f1c5` with one short-lived bucket-only Object Read & Write
credential; perform HEAD → conditional PUT only if absent → independent full GET/SHA-256 and
retain a mode-0600 journal/private sources outside Git. An existing key is adopted only after
full byte equality, never overwritten. Stop at first mismatch. The candidate execution path is
an exact new private `077` directory, not a reuse or mutation of 075/076 artifacts.

At action time, confirm the current provider/account/bucket region and costs with current
official information and the actual usage panel. Cloudflare skill guidance prevents assuming
old pricing or a zero/<=US$5 total bill from historical numbers. If source metadata, manifest,
target scope, byte cap or current account differs, stop and bring back a revised checkpoint.
No copied object becomes active without the separate current 063/064/062 → 065 reconciliation,
hosted backup/restore, sibling-site impact, role/Range/seek tests and release approval. Git
revert is not provider/data rollback; preserve successful private bytes and the journal.

## At most three next actions

1. Obtain exact owner approval for this ten-object / 27,472,242-byte copy and short-lived token.
2. After approval only, create a bounded `077` runner/manifest with pre-network target and hash
   guards, then read/copy/independently verify each object; no other family or candidate.
3. Run focused and required gates, inspect/redact evidence, retain private journal, clean only
   owned transient outputs and record an honest partial Drive-exit status.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Exact private retained-snapshot third-batch selection and 075/076 exclusion | Yes for preparation | PASS | 29 September read-only hash/count/journal/order verification above; not live R2 re-read |
| User authorizes exact ten current Drive reads, one scoped temporary token and R2 writes/readbacks | Yes for execution | NOT RUN | Earlier 076 authority excludes this batch |
| Fresh current source/target identity, size/MIME/signature and disk preflight | Yes for execution | NOT RUN | Must occur before network or artifact creation |
| Ten conditional copies/full destination GET+SHA-256 and private append-only journal | Yes for execution | NOT RUN | No token, source body or provider write in preparation |
| Required focused/full test, link/diff/redaction and owned cleanup | Yes for execution | NOT RUN | Document-only preparation checks are separate |
| DB mapping, flags, source ACL/delete, Edge/web/mobile deploy and Android beta | Later separate authority | NOT RUN | None implied by verified copies |

Required NOT RUN means 077 is pending, not complete. This preparation was self-reviewed only;
it is not independent provider audit. Document-only rollback is a Git revert of the record.
