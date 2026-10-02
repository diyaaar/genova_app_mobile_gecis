# Private R2 release runbook

Status: **DORMANT HOSTED BACKEND ACCEPTED27SEP;42 COPIES ACCEPTED THROUGH076; ACTIVATION OPEN**.
2October source review does not refresh hosted/provider state.070–076 own historical real
inventory/copy evidence;077 is an unexecuted next-ten approval packet.
Owner: release operator designated by the product owner. This is the single 053–065 release index;
individual briefs remain the acceptance authority for each local implementation.

## Current revocation release boundary — 2 October 2026

[090 approval packet](reports/2026-10-02-hosted-revocation-approval-packet.md) pins proposed
078→090 and only five reader closures to main/bdf34b8. Local web/Android/iOS PDF/audio/permanent
WebView recovery and old-ticket denial now have bounded evidence; hosted/current old-client,
sibling-site, fresh backup/restore and phone/release gates remain open. Next is R0 metadata-only
preflight on the designated Genesinova connection; no live write, bulk db push, five-reader
deployment, provider/copy/activation or main promotion is authorized by this runbook.
Historical order below remains the053–065 baseline, not permission to replay it.

## Candidate and immutable boundaries

- Candidate base: product commits `beb4842`, `9459732`, `dd21522`, `d7c960b`, `4049266`,
  `ce2b438`, `879d4ec`, `bfe994d`, release config `6acea76`, copy executor `e4a4c23`
  and service-only inventory contract `a69a936`, verified manifest preparation `792195b` plus
  atomic activation/reconciliation `53c258f`.
- Supabase project must resolve to `hievmwwctjjlhmssoxsu` immediately before every approved hosted
  step. A Git remote, local `.env` or old CLI link is not target proof.
- Supabase DB/Auth/Realtime/Edge and current web hosting remain. This runbook does not move them to
  Railway. One private R2 bucket serves the accepted families; no public bucket or custom domain.
- Preserve all Drive sources and every R2-only object/version through beta. Assignment retention is
  **retain all** until the owner approves a deletion duration and account/choir lifecycle policy.
- `R2_TEST_ENDPOINT` — forbidden in every hosted environment.
- `R2_ALLOW_INSECURE_LOOPBACK` — forbidden in every hosted environment.

## Source-control and deployment preflight — 25 September 2026

[WF-011](briefs/WF-011-release-candidate-source-preflight.md) fixes the repaired candidate at
`e459bdd`; [066](briefs/066-node22-private-r2-cli-warning.md) records the only candidate-CI repair.
Direct GitHub and signed-in Vercel inspection put remote `main` and current Ready production at
`a13f696`; the candidate is 177 linear commits ahead across 546 changed files. Candidate branch
`codex/release-2026-09-25`, GitHub Actions run `36144388175` and matching Vercel Preview are green.
The full DB → Edge → web/mobile order and fail-closed flags are recorded in WF-011. Production
promotion, client flags and installed mobile build remain separately authorized and evidenced
actions. The dormant hosted migration/function deployment is accepted in 069.

The [current execution queue](mobil-teslim-plani.md#controlled-execution-queue--24-september-2026)
records [065](briefs/065-private-r2-activation-reconciliation.md) as locally accepted. Do not attempt
stage 5 until the exact candidate is fixed and a real copy journal passes the same contract.

## Provider choice and provisioned bucket — 26 September 2026

Recommended initial choice: Cloudflare R2 **Standard** with the **EU jurisdiction**. The current
official pricing page lists 10 GB-month, one million Class A and ten million Class B operations in
the Standard monthly free tier, with free Internet egress; actual current bytes and traffic have not
been read, so neither a zero bill nor the owner's <=$5 total-infrastructure target is proven. EU is
recommended because it guarantees storage and processing inside the EU; Automatic/location hints
do not provide that guarantee. Jurisdiction cannot be changed after bucket creation.

The owner selected `EU jurisdiction` and approved the R2 usage subscription plus bucket creation.
[067](briefs/067-cloudflare-r2-provider-bucket.md) records the signed-in provider evidence:
Cloudflare account `b642dee69121237ba20cc1a1bb50f1c5`, empty private bucket
`genova-private`, jurisdiction `eu`, default class `Standard`, public access disabled, no custom
domain and no public development URL. At verification, billable R2 usage was `$0.00`, storage was
`0 B` and Class A/B operations were `0`; this does not prove the owner's total <=$5/month target.

The owner then confirmed persistent credential creation at action time. Account token
`genova-private-runtime` exists with Object Read & Write only for `genova-private (EU)`, no
bucket-admin/all-bucket scope, `Forever` TTL and no IP filter. When its original one-time page was
lost, the owner approved a token roll. Old values are invalid; new values moved only through browser
memory into the exact Supabase encrypted secret store and were cleared. No token value entered Git,
chat, terminal output or this runbook.

## Hosted read and isolated restore — 27 September 2026

[068](briefs/068-hosted-backup-isolated-r2-rehearsal.md) completes the recovery prerequisite on the
exact project. A fresh 1,317,637-byte logical dump is retained outside the repository with mode
0600 and recorded SHA-256; its 7 included schemas and 74 base-table counts match the stable hosted
source and retained local PostgreSQL 17 restore. Existing 061, 063 and 065 forward/refusal/down/
reapply runners pass against disposable clones of that restore, leaving the source unchanged.

This completes only the backup/restore and local schema-rehearsal portion of stage 2. Exporting the
real 063 inventory, 064 metadata reconciliation and cost measurement are still NOT RUN. Within 068,
no hosted schema/data/function/Edge secret, Google object, R2 object, client flag or deployment changed. The
owner-approved Supabase database-password reset restored operator access; its replacement exists
only in ignored mode-0600 local `.env.local` and is not reproduced here.

## Dormant hosted backend — 27 September 2026

[069](briefs/069-dormant-hosted-r2-backend.md) records the owner-approved hosted write. Thirteen
secret names are present; non-secret digests prove `legacy` storage modes and all R2 write enables
`false`. The exact prerequisite plus 053–065 package is applied as 16 individually transactional
migrations with matching ledger rows. All thirteen manifest functions are `ACTIVE`, version 1 and
`verify_jwt=false`; eight upload/lifecycle probes return exact dormant 503 results and five file
functions deny missing tickets with 401.

An existing product-user session issued one short-lived repertoire ticket. The legacy path returned
`206`, one ranged byte and `application/octet-stream` to a `HEAD` request; no browser body was
downloaded. The ignored local stale service-role key was not used. Do not treat this as a cutover or
R2-object acceptance. No real 063 inventory, R2 object, activation or client flag changed.

## Function gateway manifest

Every entry below is explicit in `supabase/config.toml` with `verify_jwt = false`. This does not make
the function public: the handler owns method-specific authentication. Upload/lifecycle POST or
DELETE requests verify the user bearer and server RPC authority; file POST verifies the bearer.
Historical27September ticket-only GET/HEAD differs by family: review/comment/chat tickets bind an actor and
recheck family-specific access, while repertoire/assignment tickets bind only file, choir and
expiry. None of the five rechecks the selected Auth session on GET/HEAD. The uniform online
revocation decision and implementation were then open. [090](briefs/090-private-file-ticket-revocation-contract.md)
now implements/accepts strict v2 plus service-only session/choir/family checks locally; hosted
version is unverified until R0 and release gates. Do not describe a historical deployed v1 URL
as immediately revocable or the local implementation as already hosted.

| Family | Function slugs |
|---|---|
| Repertoire | `repertoire-file`, `repertoire-upload`, `repertoire-file-lifecycle` |
| Assignment submission | `assignment-file`, `assignment-upload` |
| Assignment review | `assignment-review-file`, `assignment-review-upload` |
| Repertoire comment | `repertoire-comment-file`, `repertoire-comment-upload`, `repertoire-comment-lifecycle` |
| Chat | `chat-media-file`, `chat-media-upload`, `chat-media-lifecycle` |

Deploy individual slugs, not every function in the repository. Record returned function version and
status for each slug. A deploy success is not content acceptance; probe the actual hosted URL later.

## Schema order and reverse order

Forward, only after a fresh backup and demonstrated disposable restore:

1. `20260920205054_private_r2_repertoire_read_053.sql`
2. `20260921185113_private_r2_repertoire_upload_054.sql`
3. `20260922071942_private_r2_repertoire_lifecycle_055.sql`
4. `20260922171847_private_r2_repertoire_cover_056.sql`
5. `20260922221500_private_r2_assignment_versions_057.sql`
6. `20260923103000_private_r2_assignment_review_audio_058.sql`
7. `20260923170000_private_r2_repertoire_comment_audio_059.sql`
8. `20260923193000_private_r2_chat_media_060.sql`
9. `20260923194500_private_r2_copy_inventory_063.sql`
10. `20260925083611_private_r2_activation_065.sql`

Reverse order starts with `065_private_r2_activation_down.sql`, then
`063_private_r2_copy_inventory_down.sql`, then
`060_private_r2_chat_media_down.sql`,
`059_private_r2_repertoire_comment_audio_down.sql`,
`058_private_r2_assignment_review_audio_down.sql`,
`057_private_r2_assignment_versions_down.sql`,
`056_private_r2_repertoire_cover_down.sql`,
`055_private_r2_repertoire_lifecycle_down.sql`,
`054_private_r2_repertoire_upload_down.sql`, then
`053_private_r2_repertoire_read_down.sql`. Each down refusal is a stop, not an instruction to delete
rows. Never run a down after R2 writes without an exact preservation/copy-back plan.

## Server secrets and flags

Set values only in the verified Supabase project secret store; never paste values into Git, logs,
the brief or chat. Record names and provider token identity, not secret values.

| Name | Initial value / rule |
|---|---|
| `R2_ACCOUNT_ID` | Verified 32-hex Cloudflare account ID |
| `R2_BUCKET` | One exact lowercase private bucket name |
| `R2_ACCESS_KEY_ID` | Bucket-scoped Object Read & Write token ID |
| `R2_SECRET_ACCESS_KEY` | Corresponding one-time secret; never print after set |
| `R2_JURISDICTION` | `eu` for EU jurisdiction; omit for Automatic |
| `REPERTOIRE_STORAGE_MODE` | `legacy` at first deploy; later `mixed`; `r2-required` only after reconciliation |
| `REPERTOIRE_R2_UPLOAD_ENABLED` | `false` initially |
| `ASSIGNMENT_STORAGE_MODE` | `legacy` initially; later `mixed`; then `r2-required` |
| `ASSIGNMENT_R2_UPLOAD_ENABLED` | `false` initially |
| `ASSIGNMENT_REVIEW_R2_ENABLED` | `false` initially |
| `REPERTOIRE_COMMENT_R2_ENABLED` | `false` initially |
| `CHAT_STORAGE_MODE` | `legacy` initially; later `mixed`; then `r2-required` |
| `CHAT_R2_MEDIA_ENABLED` | `false` initially |

The hosted web build has a separate immutable environment. Keep all client flags false until schema,
functions, disabled probes, provider canary and the relevant family copy/write gate pass:
`NEXT_PUBLIC_REPERTOIRE_R2_UPLOAD_ENABLED`, `NEXT_PUBLIC_ASSIGNMENT_R2_UPLOAD_ENABLED`,
`NEXT_PUBLIC_ASSIGNMENT_REVIEW_R2_ENABLED`, `NEXT_PUBLIC_REPERTOIRE_COMMENT_R2_ENABLED`, and
`NEXT_PUBLIC_CHAT_R2_MEDIA_ENABLED`. Changing a `NEXT_PUBLIC_*` value requires a new web build; an
Edge secret update does not update already-built client code.

## Approved execution stages

Each numbered stage needs the authority named in its heading and stops on any failed required row.

1. **Provider authority:** account, EU choice, R2 subscription, private Standard bucket and the
   least-privilege token identity are accepted in 067. Preserve the open one-time credential page
   until separately authorized secure placement; never record secret values. Measure actual usage
   before claiming the owner's total monthly infrastructure target is met.
2. **Hosted read authority:** project resolution, current backup, isolated restore and 053–063 plus
   dormant 065 rehearsal are complete in 068. Next, query the 063 inventory from the approved
   restored snapshot, then run 064's metadata-only preparation without a bulk mirror. Produce a
   measured cost estimate before any hosted schema write.
3. **Hosted write authority:** secrets, exact additive migrations through 065, thirteen manifest
   functions, disabled-write probes, missing-ticket refusals and one authenticated legacy ranged
   read are complete in 069. Every client flag remains blocked until later family acceptance.
4. **Copy authority:** run a separately reviewed bounded copy executor. For every source slot record
   `choir_id`, family, source table/row/slot/version, legacy ID or recognized URL, destination bucket
   and object key, bytes, MIME, SHA-256, attempt/status and verification timestamp. Stream one file;
   never keep a local mirror. Missing, mismatched, unsupported and external URLs remain explicit.
5. **Cutover authority:** freeze or reconcile relevant writes; invoke 065 only with the exact current
   063 snapshot, matching 064 report and latest verified 062 journal; then switch one
   family to `mixed`, enable its server writer, deploy its client flag, and run authorized role/live
   UI acceptance. Reconcile before the next family. Chat and assignment are not canaries for each
   other because their authorization differs.
6. **R2-required authority:** only when every active recognized source is verified and no current
   first-party writer calls Drive. Switch reads to `r2-required`; prove Android beta flows and web
   compatibility. Keep Drive sources. Public ACL revocation and source deletion are separate steps.

### Bounded copy executor

[063](briefs/063-private-r2-copy-inventory-contract.md) supplies the read-only inventory input to
this stage. Run `private_r2_copy_inventory_063(choir_id,bucket)` only as `service_role`, once per
exact choir, on the approved restored snapshot or separately authorized hosted target. Never expose
it to a browser/mobile/admin client. Keep its raw result as a private external `0600` artifact.

The 063 result is not a 062 manifest. [064](briefs/064-private-r2-manifest-preparation.md) adds the
reviewed metadata-only preparation command. Both `ready-for-provider-metadata` and
`needs-provider-metadata` rows with valid Drive/key identities are candidates; the latter must get
all missing name/MIME/length values from current Google metadata. Every other accepted status stays
itemized in the sidecar report rather than disappearing. Object bytes remain unverified. Reconcile
`already-private` and `private-target-conflict`; resolve or explicitly retain missing, unsupported,
non-Drive, orphaned activation, unsupported-shape and unresolved private-alias rows. Never invent a
destination for an over-limit chat position. Snapshot/reconcile writes before treating the inventory
as current. Activation must reuse the deterministic IDs/keys from 063 or refuse.

Audit needs no Google credential or provider call. Use the exact external inventory path, choir and
approved bucket; record the printed fingerprint without copying row/file identifiers into docs:

```sh
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
  scripts/private-r2-manifest.ts audit \
  --inventory /absolute/private/path/inventory.jsonl \
  --project-ref hievmwwctjjlhmssoxsu \
  --choir <exact-choir-uuid> \
  --bucket <approved-private-bucket>
```

Preparation requires the existing Google OAuth refresh credentials plus
`GENOVA_PRIVATE_R2_MANIFEST_APPROVED` set in the operator's private environment. Its value and
`--confirm-inventory` must both exactly equal
`<project-ref>/<choir>/<bucket>/<inventory-fingerprint>`. Manifest and report must be two absent
absolute paths in the same private external directory. Set item/byte bounds to cover every candidate;
064 refuses partial output. The report is published first and the copy-driving manifest last:

```sh
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
  scripts/private-r2-manifest.ts prepare \
  --inventory /absolute/private/path/inventory.jsonl \
  --project-ref hievmwwctjjlhmssoxsu \
  --choir <exact-choir-uuid> \
  --bucket <approved-private-bucket> \
  --manifest /absolute/private/path/manifest.jsonl \
  --report /absolute/private/path/manifest-report.json \
  --max-items <all-candidate-count> \
  --max-total-bytes <explicit-total-byte-cap> \
  --confirm-inventory <exact-approval-value>
```

Review every excluded row and the report/manifest hash before allowing 062 validation. A valid 064
artifact proves metadata reconciliation only, not content bytes, R2 copy or database activation.

[062](briefs/062-bounded-private-r2-copy-executor.md) adds the reviewed local operator command
`scripts/private-r2-copy.ts`; it is not an Edge Function and it performs no database write. Raw
manifest and journal files contain live row/file identifiers, so an approved run keeps both as
absolute `0600` files outside the repository. The manifest is JSONL, one immutable item per line,
with version `1`, exact project/choir/family/source owner-row-slot-version/Drive ID, R2 bucket/key,
byte count, display file name, MIME and optional known SHA-256. Generate it only from the approved
inventory snapshot; do not hand-edit identities or infer unknown URLs.

Validation needs no provider secret:

```sh
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
  scripts/private-r2-copy.ts validate \
  --manifest /absolute/private/path/manifest.jsonl \
  --project-ref hievmwwctjjlhmssoxsu \
  --bucket <approved-private-bucket>
```

Execution additionally requires the existing Google OAuth refresh credentials, bucket-scoped R2
credentials, `R2_ACCOUNT_ID`, the approved `R2_JURISDICTION` (`eu` or omitted for Automatic), and
`GENOVA_PRIVATE_R2_COPY_APPROVED` set through the operator's private environment. Its value must
exactly equal the same `<project-ref>/<account-id>/<bucket>/<eu-or-auto>` supplied to
`--confirm-target`; never put secret values on the command line, in the manifest, journal or log.
Start with `--max-items 1` and `--max-total-bytes` equal to that canary's declared size, then widen
only from measured evidence. One failure is journaled and stops the batch.

The executor checks Drive metadata, refuses redirects and Google-native/trashed/drifted sources,
streams a single PUT with backpressure, then performs a separate R2 GET and compares actual length,
MIME and SHA-256. It never uses multipart ETag as a content checksum. Existing unjournaled objects
are adopted only when source/destination hashes match; mismatch is never overwritten. A previously
verified object that disappears is a stop. A matching private journal permits deterministic resume;
raw journal evidence must be redacted before any repository record. Database activation and source
cleanup remain later, separately approved stages.

## Stop and rollback

- Stop on wrong project/account/bucket/jurisdiction, unknown source ownership, missing bytes,
  checksum/MIME mismatch, redirect, object-key mismatch, cross-choir access, failed backup restore,
  migration/function error, client-before-server ordering, disk below 10 GiB or unapproved spend.
- Before client rollback, disable new R2 writes. Preserve R2-only rows and objects; do not run down
  scripts while their refusal guards fire. Restore the previous client/server modes only when every
  new version remains readable. Provider cleanup is exact-key and separately approved.
- Never revoke Drive ACLs or delete sources during copy/cutover acceptance. Git revert, function
  rollback, DB restore, object preservation and installed mobile-client compatibility are separate.

## Evidence record per external step

Record UTC time, operator, exact target, revision/function version/migration, before state, command or
dashboard action, redacted result, rollback state and next approval. Label backup, schema, Edge,
provider, copy, web, Android device and store evidence separately. A synthetic canary is not real-file
copy acceptance; a hosted HTTP 200 is not authorized content acceptance.
