# 071 — Single-object private R2 canary

**Status/date/writer:** READY FOR OWNER APPROVAL / 2026-09-27 / primary agent.

**Observable result and user need:** Copy exactly one 32,484-byte assignment-submission PDF from
its current private Google Drive object to its deterministic private `genova-private` EU R2 key,
independently re-read the destination, prove equal SHA-256 bytes and retain a private journal without
activating a mapping or changing any product behavior.

**Delivery focus:** Establish the first real data-plane proof after [070](070-real-inventory-metadata-preparation.md).
This is a one-object canary, not bulk copy, family activation, cutover or beta acceptance.

**Start evidence:** Git HEAD `4bdbecd` completed 070 with 91 exact candidates / 253,330,490 bytes
and one explicit unsupported avatar. The one-row canary manifest is mechanically selected as the
smallest eligible object from the accepted 070 manifest, is private outside Git, contains exactly
one `assignment-submission` PDF / 32,484 bytes and passes the accepted 062 validator. Its SHA-256 is
`6ebc14f727cf05c10344900422901a92927ca4c6d22c3d729536ea79f4e183d5`. Only the unrelated
`supabase/.temp/cli-latest` remains dirty.

**Current work card:** The local guard is complete at `bb56cb5`. Next, after explicit approval:
(1) create the narrowest available user-owned R2 S3 credential with Object Read & Write only for
`genova-private`, (2) fetch the exact canary Drive file into the private 071 directory, (3) run one
HEAD → conditional PUT → GET verification and persist one private journal. Stop on any mismatch,
redirect, unexpected existing object, credential scope issue or unavailable short expiry.

**Resources:** One 32,484-byte local source plus sub-64-KiB manifest/journal under
`/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-071` (`0700`, files `0600`).
No build, VM, simulator, bulk mirror or database clone. Retain the canary source/object/journal until
the copy evidence and later activation decision are accepted; deletion requires separate authority.

## Allowed paths and systems after approval

- The exact private one-row canary manifest and one exact Google Drive file identified by it.
- Connected Genesinova Google Drive raw download for that non-native PDF only. No folder crawl,
  second media object, permission/ACL change or source mutation.
- Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, EU Standard bucket
  `genova-private`, exact deterministic object key from the manifest.
- One user-owned Object Read & Write credential scoped only to that bucket. Prefer the shortest
  expiry the R2 dashboard exposes. If it offers no expiry control, stop before final creation and
  return for the owner choice; do not silently create another forever token.
- Runner `supabase/test-support/071_canary_copy.ts`, which accepts only the exact manifest hash,
  project/account/bucket/jurisdiction, one PDF and 32,484 bytes. Credentials enter one process
  environment only; never Git, chat, command output, a local env file or browser password storage.

## Sources and current provider rules

- [062 executor](062-bounded-private-r2-copy-executor.md), [064 manifest](064-private-r2-manifest-preparation.md),
  [070 evidence](070-real-inventory-metadata-preparation.md) and the
  [private R2 runbook](../private-r2-release-runbook.md).
- Current official [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/) supports
  bucket-scoped Object Read & Write S3 credentials and the jurisdiction-specific EU endpoint.
  Cloudflare shows the secret only once. Current official
  [token restrictions](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/)
  recommend TTL constraints; dashboard date restrictions are day-granular, while finer times need
  the API. No credential is created during preparation.

## Transition start check

- Read instructions/evidence: `AGENTS.md`, handoff, active context, delivery queue, 062/064/070,
  runbook and current official Cloudflare token documentation.
- One result and boundary: verify one private destination object. All hosted storage modes remain
  `legacy`; all write flags remain `false`; there is no database row, Edge secret/function, web,
  mobile or Drive source change.
- Authority: local guard/brief/private-manifest preparation is authorized and complete. The next
  action creates a provider credential, reads one real file body and writes one R2 object; it waits
  for the owner's explicit action-time approval. Credential revocation, object deletion, remaining
  90-object copy and activation are later checkpoints.
- Required checks: exact Google ID/metadata readback; source mode/size/hash; pre-write R2 HEAD;
  signed PUT only if absent; full signed GET; source/destination byte count and SHA-256 equality;
  one atomic `0600` journal; token non-persistence; source/R2/post-run state and secret scan.

## Stop, rollback and failure behavior

- A wrong account, profile, bucket, jurisdiction, manifest hash, source ID, MIME, size, object key,
  token scope or target confirmation stops before PUT.
- An existing destination is never overwritten. The accepted 062 core may adopt it only when a full
  GET equals the exact source; any mismatch is a hard refusal.
- A failed or uncertain PUT is journaled and stops. Do not retry blindly and do not delete the
  object. Resolve state with signed HEAD/GET and the immutable manifest first.
- Success preserves the verified object and journal for later reconciliation. Git revert cannot
  remove provider bytes. Revoking the temporary credential and deleting any provider object are
  separate externally consequential actions.

## Preparation evidence — 27 September 2026

- Private directory/manifest modes are `0700`/`0600`; the one-row manifest is 721 bytes, validates
  as project `hievmwwctjjlhmssoxsu`, bucket `genova-private`, one item and 32,484 total bytes.
- `bb56cb5` adds the exact-target runner. It hard-fixes project, account, EU jurisdiction, bucket,
  manifest SHA-256, family, MIME, byte limit and journal path; credentials are environment-only.
  It streams the local source into the accepted 062 copy core, performs independent destination
  GET hashing and prints only aggregate/hash evidence.
- Node syntax, ESLint, TypeScript and the pre-approval refusal pass. Full `pnpm check` passes lint,
  typecheck, 90 files / 797 tests, service-worker syntax and production build. Generated `.next`
  and coverage outputs were moved to Trash; 35,582,872 KiB remained free.

## Definition of done

- [x] Exact smallest canary and immutable private manifest are selected and locally validated.
- [x] Fail-closed single-object runner and pre-approval refusal are accepted locally.
- [ ] Owner approves the exact credential + real body read + one-object R2 write checkpoint.
- [ ] Source and destination full bytes/hash match and one private verified journal record exists.
- [ ] Credential handling, secret scan, provider/source stability and cleanup pass.
- [ ] Owner decides the later credential-revocation checkpoint if automatic expiry was unavailable.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact one-object canary selection and private inputs | yes | **PASS** | 2026-09-27, local private artifacts | One 32,484-byte assignment PDF; exact 070-derived manifest hash and 062 validation. No body read. |
| Exact-target guarded runner | yes | **PASS** | 2026-09-27, `bb56cb5`, local | Fixed account/EU/bucket/hash/family/MIME/bytes; no approval or credentials refuses before journal/network. |
| Local required gates and cleanup | yes | **PASS** | 2026-09-27, local | `pnpm check`: 90/797/build PASS; generated outputs trashed; unrelated marker unstaged. |
| Scoped provider credential and source body read | yes | NOT RUN | Owner action-time approval required | One exact Google PDF and bucket-only R2 credential; no persistent local storage. |
| R2 HEAD/PUT/GET, full-byte hash and private journal | yes | NOT RUN | Real EU R2 data plane | First real object; no DB mapping or product flag. |
| Activation, remaining copy, source ACL/delete, device/release | N/A — later authority | N/A | Not authorized in 071 | Still required before operational beta/full goal. |

Required FAIL or NOT RUN keeps 071 open. One verified canary does not authorize the remaining
manifest, mapping activation, client flags, source removal or beta distribution.
