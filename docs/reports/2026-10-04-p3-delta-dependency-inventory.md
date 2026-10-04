# P3 — missing SQL delta prerequisites and source security gap

Date: 4 October 2026. Entry `main/ee7be6f`; primary sole writer.
Candidate **GENOVA-BETA-20261003-P1**, frozen product
`c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0` unchanged.
[Owning card](../briefs/090-private-file-ticket-revocation-contract.md#4-october-continuation--missing-sql-delta-dependency-inventory)
→ [checkpoint](../teslim-rehberi/checkpoint.md) → [P3](../teslim-rehberi/03-release-package.md).

## Outcome and evidence boundary

**PROGRESS / catalog dependency inventory complete; original P3 entry goal NOT
COMPLETE.** Ten absent source migration IDs now have actual catalog prerequisite/
collision observations, not just ledger absence. Five preliminary starts and five
ordered missing prerequisites are distinguished. A new candidate source/test gap
must enter the minimum convergent repair. No product or hosted mutation occurred.

The [machine record](090/2026-10-04-p3-delta-preflight.json) was acquired at
`2026-10-04T10:01:13.042Z` using the existing named `supabase-genesinova` MCP:
project `hievmwwctjjlhmssoxsu`, role `supabase_read_only_user`, transaction read-only.
It retains query/helper/manifest/prior-observation/source hashes and only catalog
names, grants, booleans and definition digests. It does not query application/Auth
rows, execute migration preflight DO blocks or locks, export logs or retain bodies.
Source-only tests and reclassification use captured metadata, not another hosted
acquisition. The [prior reconciliation](2026-10-04-p3-hosted-reconciliation.md)
remains the served web / current SQL / deployed Edge identity authority.

All 15 relevant applied ledger rows have NULL statements. Historical applied SQL
checksum equality remains **UNAVAILABLE / NOT VERIFIED**, required under the
original card. Current object hashes do not recreate historical DDL. Do not rewrite
the ledger, invent statements, waive the row or mark the full inventory goal complete.

## Exact source delta inventory

All ten source paths/hashes are in the machine record and immutable P1 manifest.
Numbers below refer to those exact migrations, not every file in the directory.
“Observed” means selected catalog conditions only, never permission to apply.

| Source ID | Current selected catalog guards | Ordered prerequisite / still unrun |
|---|---|---|
| 024 annotation snapshot/revision | Observed: private namespace/RPC/revision absent, one updater, required tables exist | Data song/file/choir join integrity; actual revision/conflict/RLS behavior; lock/rewrite impact. Source locks annotations and queries rows, so its full preflight has NOT run |
| 046 private chat Realtime | Observed: namespace/policy names absent; messages RLS enabled; topic/helpers/tables/publication exist | Actual private Broadcast/Presence role/room/tenant negatives and provider settings NOT RUN |
| 048 ordered chat read | NOT READY: genova_046 absent; index/read RPC absent; messages already published | 046 first; pagination/index locks/room-read negatives NOT RUN |
| 078 active membership/session selection | Observed: namespace absent, 005 session table/helper and three selection functions exist | Actual revoked/multi-membership/same-user/concurrent selection; retained consumer behavior NOT RUN |
| 079 status RPC privileges | Observed: 043/function exist; namespace absent; source ACL provenance predicate true | Actual anon/authenticated/service invocation negatives and recovery of grants NOT RUN. Effective grants are not themselves data-exposure proof |
| 082 atomic repertoire assignment | NOT READY: genova_078 absent; assignment RPC absent | 078 first; role/RLS/expected-set/concurrent-write negatives NOT RUN |
| 087 atomic profile submission | NOT READY: genova_078 absent; private namespace/submission RPC absent | 078 first; schema/data/merge/same-user-session tests NOT RUN |
| 088 atomic profile review | NOT READY: genova_078 and 087 normalizer absent; review RPC absent | 078 and 087 first; role loss/request race/schema tests NOT RUN |
| 090 actor private-file authority | Selected formal guards observed: 090 namespace absent; Auth/session/version tables and 060 helper exist | No formal 078 source guard; **package security sequence requires accepted 078 first**. New Auth lifetime gap below; actual five-family existing-ticket GET/HEAD negatives NOT RUN |
| 090 legacy file authority | NOT READY: genova_090 absent; resolver absent | 090 actor creates required schema first. Source has no preflight DO; full function dependencies/collision/storage/old Next relay tests still required |

The three chat tables (`chat_messages`, `chat_reactions`, `chat_message_status`)
are already in `supabase_realtime`. There are **zero current realtime.messages
policies**; publication membership does not establish 046 private-channel access.
046 conditionally adds publication tables: do not introduce redundant publication
changes. Existing annotation updater and tenant-link triggers are enabled; their
definition digests are retained. `genova_005.active_choir_sessions` has RLS disabled
but private grants must be assessed separately; this metadata alone is not exposure.

## Newly discovered candidate security/test gap

**IMPORTANT / release-blocking negative test, not a confirmed live exploit.**
[090 actor source](../../supabase/migrations/20260930080046_private_file_ticket_authority_090.sql:28)
joins `auth.sessions` by actor/session and active membership but has **no not_after
predicate**. [090 legacy source](../../supabase/migrations/20261002154343_legacy_file_authority_090.sql:13)
explicitly rejects a past `not_after`. The current Auth catalog confirms this column
exists. [Signed v2 verification](../../supabase/functions/_shared/private-file-ticket-v2.ts:76)
checks the ticket's `expiresAt`; [service authority](../../supabase/functions/_shared/private-file-authority.ts:8)
delegates to the actor RPC. Signed ticket lifetime and Auth session lifetime are
different conditions.

Supabase documents that expired sessions need not immediately disappear from
`auth.sessions`; cleanup is progressive. Thus row existence is not, by itself,
evidence of time-box validity. This is an inference about a retained non-NULL past
not_after row and a still-valid file ticket, **not a claim that time-boxing is enabled
on this project**. [Official session semantics](https://supabase.com/docs/guides/auth/sessions).
No Auth setting, paid plan or real session was changed or inspected.

[Actor SQL tests](../../supabase/tests/090_private_file_ticket_authority.sql:195)
cover session deletion, but contain no not_after negative.
[Legacy tests](../../supabase/tests/090_legacy_file_authority.sql:184) cover both
expiration and deletion. Prior signed-ticket-expiry tests do not fill the actor gap.
Frozen candidate should not be promoted unchanged on the strength of those passes.

Next source convergence card must reproduce on synthetic isolated DB: future/null
not_after positive controls, past not_after denial with session row retained, all
five families through actual GET/HEAD with provider calls zero; distinguish ticket
expiry, session deletion, role/member revocation and A→B selection. Only a reproduced
failure and narrow repair with actual security acceptance may close this gap.
This pass adds an inventory regression exposing the gap, **not a fix/security PASS**.

## Minimum convergence and future execution order

1. Prepare a single narrow full-source convergence card: native consent-before-HEAD
   and safe log sinks from the prior report, plus the actor lifetime negative above.
   Preserve existing embedded cache/offline/file-label guards. No implementation in
   this inventory; any source change must issue explicit new pins and invalidate
   only affected acceptance, retaining immutable P1/P2 history.
2. Rehearse on a freshly authorized protected current-state clone. Keep independent
   delta branches explicit: 024 annotation; 046→048 chat; 079 ACL; 078→082 and
   078→087→088 assignments/profile. For the private reader package: accepted 078,
   then repaired 090 actor→090 legacy, then exact five readers + legacy Edge,
   repaired web/native, and only later storage activation. Recheck every guard after
   each delta; catalog-ready observations are neither runtime nor apply approval.
3. Review the exact compatible package independently and present operation scope
   before writes. Include absent link-preview/account-recovery, drive-manager-v2
   source/JWT difference, retained four Edge consumers and all exposed native/
   permanent-WebView/browser routes from the existing full entry matrix. Do not
   deploy only five readers or blindly publish main/all migration files.

Recovery prerequisites remain those in [R1](2026-10-02-hosted-revocation-r1-recovery-rehearsal.md)
and the [single runbook](../private-r2-release-runbook.md): fresh target/cutoff/RPO,
protected encrypted destination, digest/provenance, isolated restore of schema/data/
roles/ACL/RLS/triggers/publications, synthetic current/old/mixed-client authorization
and concurrency, object bytes/config exclusions, exact provider/flags/secret mapping,
disk/resource floor, lock limits, stop/forward repair and actual restore test. Git
revert is not data recovery. Do not reintroduce actorless v1 URLs or the 078 defect.
No new backup/export/restore/data access/hosted mutation is authorized by this record.
All mobile QA stays agent-owned; no owner manual test steps.

## Acceptance and retained resources

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Actual ten-delta selected catalog prerequisite inventory | yes, this continuation | PASS observations | Fixed SELECT through named read-only MCP, machine record; full source/data guards NOT RUN |
| Source order/security sequencing and remaining gates | yes | PASS inventory | Table and recovery map above; no permission/runtime claim |
| Metadata classifier/redaction/source-gap regression | yes | PASS 6 new + 10 existing = 16 focused tests | Source/synthetic metadata only; source-gap assertion is not authorization acceptance |
| Product source identity | yes | PASS 610 frozen pins / P1 and P3 byte-equivalent verification | No source change, no product gate inflation |
| Local links/diff/exact credential scan and scoped commit | yes | PASS at accompanying 090 checkpoint | CLI marker preserved/excluded; no secret retained |
| Historical applied SQL checksum equality | yes, original goal | UNAVAILABLE / NOT VERIFIED | 15 NULL statements; cannot close original goal |
| Actual migration/data/lock/old-new-mixed/Auth/RLS/provider/cache tests; recovery and independent review | required P3 package | NOT RUN | Dated acceptance remains dated; no live/security/release acceptance |

Resource preflight free **21,270,084 KiB**, >10 GiB floor. Estimated additional
retained metadata <256 KiB; one lightweight acquisition process, no source bundle,
install/build/runtime/copy. New machine record **15,989 bytes**, retain as small
essential metadata evidence. No large owned output or service created; prior unknown
browser ZIP not searched/removed. Final free space is recorded in the owning card.
No paid AI call: TypeSafe skill keeps exact catalog/Auth decisions deterministic;
Jev **0 calls / $0 new inference**, not independent review. This is progress toward
the full original goal, not a narrower replacement or whole-goal completion.
