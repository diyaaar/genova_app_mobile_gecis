# 070 — Real snapshot inventory and metadata-only manifest preparation

**Status/date/writer:** IN PROGRESS — GOOGLE REAUTHENTICATION REQUIRED / 2026-09-27 / primary agent.

**Observable result and user need:** Produce a complete private 063 inventory from the retained,
verified production snapshot, reconcile every eligible legacy Drive reference against current
Google metadata, publish the 064 manifest/report outside the repository and calculate a bounded R2
cost estimate without downloading media bytes, writing an R2 object or changing hosted state.

**Delivery focus:** Close the last read-only control-plane gate before a separately approved canary
copy. This checkpoint proves what is eligible, missing, incompatible or unresolved and how much the
eligible set would store. It does not prove copied bytes or authorize any copy/cutover.

**Start evidence:** Git HEAD `466652e`; only user-owned `supabase/.temp/cli-latest` is dirty and must
remain unstaged. [068](068-hosted-backup-isolated-r2-rehearsal.md) retains the verified
`genova_068_test_restore` snapshot and external backup. [069](069-dormant-hosted-r2-backend.md)
accepts dormant hosted secrets/schema/functions and one authenticated legacy read, with all modes
`legacy` and all write flags `false`. Filesystem availability is 35,713,972 KiB (~34.1 GiB); the
retained 068 evidence uses 1,332 KiB.

**Current work card:** Observable result: one private, audited snapshot inventory plus metadata-only
manifest/report and current official R2 cost calculation. Next actions: (1) clone the retained
restore and export 063 once per exact choir, (2) audit and reconcile candidates using Google Drive
metadata only, (3) verify private artifacts, counts/caps/cost and remove the clone. Exit when every
required row below passes or a concrete provider/credential/data blocker is recorded.

**Resources:** One disposable PostgreSQL 17 clone estimated below 500 MiB; external private JSONL
and JSON artifacts capped below 64 MiB under
`/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-070` (directory `0700`, files
`0600`). No build, VM, simulator, media download or local mirror. Remove the clone after the last
export/audit; retain only the essential private artifacts until copy/cutover acceptance or owner
cleanup.

## Allowed paths and systems

- This brief and concise runbook/handoff/active/progress/plan indexes.
- If direct commands are insufficient, one narrow reproducible runner under
  `supabase/test-support/070_*`; no production schema/function/client change.
- Read-only clone of `genova_068_test_restore`, exact existing migrations required through 063 and
  the service-only `private_r2_copy_inventory_063` call.
- Current Google Drive `files.get` metadata only for 064 candidates: identifier, name, MIME, size
  and trashed state. No `alt=media`, body download, permission/ACL change or delete.
- Official current Cloudflare R2 pricing documentation for the estimate. No R2 API request is
  needed in this checkpoint.

## Sources and existing contracts

- [Transition guide](../gecis-rehberi.md), [work cycle](../ai-calisma-duzeni.md),
  [delivery controls](../mobil-teslim-plani.md#bounded-execution-and-resource-controls) and
  [private R2 runbook](../private-r2-release-runbook.md).
- [063 inventory contract](063-private-r2-copy-inventory-contract.md),
  [064 manifest contract](064-private-r2-manifest-preparation.md) and accepted operator commands
  `scripts/private-r2-manifest.ts` plus metadata adapter `scripts/private-r2-copy.ts`.
- [068 recovery evidence](068-hosted-backup-isolated-r2-rehearsal.md) and
  [069 dormant hosted evidence](069-dormant-hosted-r2-backend.md).

## Transition start check

- Read instructions/evidence: `AGENTS.md`, `docs/agent-handoff.md`,
  `memory-bank/activeContext.md`, this brief's sources above and the relevant 063/064 migration,
  CLI and Drive adapter.
- One result and boundary: backend/operator read-only preparation; no native/WebView/UI behavior,
  hosted schema, Edge deployment, client flag, R2 object or activation changes.
- Preserve current behavior/contracts: all storage modes stay `legacy`; all write enables stay
  `false`; 063 identities/statuses and 064 all-or-nothing validation remain exact; web/mobile keep
  serving existing sources.
- Authority/ownership: the owner explicitly approved real snapshot inventory, Google metadata-only
  access, private local artifacts and cost calculation. One primary writer. No copy, cutover,
  credential creation, permission edit, deployment, source mutation or spend authority.
- Required checks/rollback/open issues: snapshot source hash/count stability, exact 063 audit,
  metadata-only no-body evidence, 064 caps/private permissions/hash/report, official pricing,
  artifact secret scan, local links and `git diff --check`. Drop the disposable clone; deleting the
  retained private artifacts requires separate cleanup authority. Google OAuth refresh credentials
  are not present in the local env at start; exhaust an existing authorized metadata path before
  requesting any new persistent credential.

## Out of scope

- Any Google media byte read, Drive permission/ACL/source change, public-link creation or delete.
- R2 `PUT`/`GET`/`HEAD`/list, object copy, byte hash, journal, activation, storage-mode/server/client
  flag, web/main promotion, hosted DB/Edge write or rollback.
- OAuth/API credential creation or rotation without its own action-time confirmation.
- Android/iOS build, device/beta/store work, retention repair or product feature change.

## Risk, authority and rollback

- Raw inventory and manifest contain real private identifiers. Keep them outside Git with restrictive
  permissions; never print rows, names, IDs or credentials into chat/docs/log summaries. Report only
  aggregate counts, hashes and machine-readable status totals.
- Provider metadata drift or incomplete inventory blocks a copy; do not silently omit or relabel a
  row. Stop on wrong choir/bucket/fingerprint, unsafe output permissions, redirect, native Google
  document, stored-hint drift, cap breach or unexpected source-count/hash change.
- Snapshot work is recoverable by dropping the disposable clone. Metadata calls are read-only.
  Artifacts are evidence, never overwritten. No live rollback is needed because hosted/product/R2
  writes are forbidden.

## Small execution steps

1. Create a disposable clone, apply only the accepted prerequisite through 063 package and export
   one deterministic private JSONL inventory per exact choir; verify source clone unchanged.
2. Audit the snapshot, obtain provider metadata only through an existing authorized credential path
   and publish the 064 manifest/report atomically with explicit caps and fingerprint confirmation.
3. Verify counts/hashes/permissions/secret absence, calculate current official R2 storage and
   operation estimates, remove disposable resources and update evidence/indexes.

## Execution evidence — 27 September 2026

- Guarded runner `3225427` cloned `genova_068_test_restore`, applied the exact accepted prerequisite
  through 063 package and invoked the inventory only as `service_role`. The snapshot contains one
  choir. The export has 92 rows: 79 repertoire files, 10 assignment submissions, two chat images
  and one room avatar. Statuses are 89 `ready-for-provider-metadata`, two
  `needs-provider-metadata` and one explicit `unsupported-reference`.
- Inventory SHA-256 is `c32b4535be498362d1f53aaaa676cb307e9a1d27d4ce7120c64af259cfcc806a`;
  normalized 063 fingerprint is `8efe253fad57528a9ffc0a479a1cb47f7aeaa0c2e9f7af81c236a6c977c98afc`.
  Source dump hash stayed unchanged and the disposable database was removed.
- Private artifacts are under the declared `0700` directory: 80,900-byte inventory, 351-byte audit
  and an 11-folder private metadata target list, all `0600`. Targeted scans find no PEM key, JWT,
  OAuth token/client secret, password assignment or raw R2 credential. One generic 64-hex match in
  the audit is the expected non-secret inventory fingerprint.
- Stored hints cover 89/91 candidates and total 252,532,452 bytes (240.834 MiB); the two missing
  chat sizes are each bounded by the accepted 12 MiB upload limit. This gives a provisional upper
  bound of 277,698,276 bytes (264.834 MiB) before current-provider reconciliation.
- Current official [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) reports Standard storage at `$0.015/GB-month`, Class A at
  `$4.50/million`, Class B at `$0.36/million`, with monthly Standard free allowances of 10 GB-month,
  1 million Class A and 10 million Class B operations. The bounded 91-object set is therefore
  provisionally inside all R2 free allowances; exact calculation remains open until metadata.
- No local Drive OAuth client/refresh credential exists. The approved Genesinova Chrome profile
  reaches Google Drive but Google requires account re-verification with the existing passkey or
  another owner-controlled method. No new OAuth client, key or token was created.

## Definition of done

- [ ] Every exact choir has one valid 063 inventory with stable fingerprint and explicit statuses.
- [ ] Every eligible Drive reference has current metadata or an explicit unresolved/excluded result;
      no media body or R2 request occurred.
- [ ] 064 manifest/report are private, atomic, capped, hashed and preserve every excluded row.
- [ ] Current official R2 estimate is recorded with assumptions; it is not presented as a total
      infrastructure bill.
- [ ] Transition controls, artifact scan, links, diff and cleanup pass; no unrelated path is staged.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/scenario | Evidence and limits |
|---|---|---|---|---|
| Exact retained-snapshot 063 inventory for every choir | yes | **PASS** | 2026-09-27, `3225427`, local PostgreSQL 17 clone | One choir; 92 rows, stable hash/fingerprint, source unchanged, clone removed. No live DB read/write; raw identifiers stay private. |
| Metadata-only provider reconciliation | yes | NOT RUN | Existing authorized Google path | `files.get` fields only; no `alt=media` or permissions. |
| Private atomic 064 manifest/report and caps | yes | NOT RUN | External `0700`/`0600` paths | No R2 object or copy journal. |
| Current R2 cost estimate | yes | NOT RUN | Official Cloudflare documentation | R2 component only, not total hosting bill. |
| Source stability, secret scan, cleanup and document gates | yes | NOT RUN | Local | Self-review; no independent reviewer. |
| Copy/activation/client/device/release | N/A — later authority | N/A | Not authorized in 070 | Still required for beta/full goal. |

Required FAIL or NOT RUN keeps 070 open. A valid manifest is not copied content, cutover, Android
beta or full release.

**Delivery:** Keep code/test-support and documentation commits separate if a runner is required.
Report remaining unresolved rows and request the next external checkpoint only after 070 evidence is
accepted.
