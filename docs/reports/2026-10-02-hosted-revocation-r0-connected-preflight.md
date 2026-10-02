# 090 — connected R0 metadata completion

Date: 2 October 2026, connector observations collected by13:38 UTC. Entry main/ef33e21,
primary sole writer; only unrelated `supabase/.temp/cli-latest` dirty and excluded.
Outcome: **R0 METADATA COMPLETE; RELEASE NO-GO; ready to request separate R1 authority**.
This supersedes the earlier connector/catalog/version/alias gaps in the
[partial R0 assessment](2026-10-02-hosted-revocation-r0-preflight.md), not its history,
flag observations, scope deviation or required later gates. Whole090 remains IN PROGRESS.
Source remains [bdf34b8 manifest](090/2026-10-02-hosted-revocation-source-manifest.json)
and the [approval packet](2026-10-02-hosted-revocation-approval-packet.md).
[Selected catalog and reproducible queries](090/2026-10-02-hosted-revocation-r0-connected-metadata.json)
contain no user rows, file bodies, credential values or credential digests.

## Start check and scope

Owner connected Supabase after the approved R0-only checkpoint. Read handoff/active/090,
packet, delivery controls and relevant migration/shared-site sources; followed the Supabase
skill's exact-project and secret-handling boundaries. No other project enumeration/fallback.
Three actions: verify connection and remaining metadata; compare pinned migration/shared-site
requirements; record evidence/limits and locally commit scoped docs. Allowed records only.
Entry free19860684KiB, document-only peak/environment/cleanup N/A. No new runtime/download,
build, dependency, inference, credential/config/account/security setting or sibling-tree change.
No Auth/user/table data queries, mutation RPC, backup export, DDL/DML, provider/Edge writes,
CI/push/deploy or spending. Catalog SQL used explicit READ ONLY transactions and ROLLBACK.
No subagent or independent review. Prior local product gates are dated, not rerun here.

## Verified metadata

- `get_project` now succeeds: exact ref/id `hievmwwctjjlhmssoxsu`, org
  `urpuzollmvvdkayavnhd`, genesinovachoir's Project, ACTIVE_HEALTHY,
  ap-northeast-1, database17.6.1.063 / server17.6. This resolves prior access denial.
- Complete migration list has68 entries, latest `20260925083611 private_r2_activation_065`.
  Exact078/090 versions are absent. Both `genova_078`/`genova_090` namespaces and the
  exact `private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)` signature are absent.
- Six installed extensions: pgcrypto1.3, pg_stat_statements1.11, **supabase_vault0.3.1**,
  pg_net0.19.5, uuid-ossp1.1, plpgsql1.0. Vault was not shown in the earlier UI list;
  this fresh connector result supersedes that list's completeness. No extension/custom
  operator upgrades. No custom operators outside pg_catalog/information_schema found.
  Actual managed-extension/ACL restore behavior remains an R1 test, not a catalog PASS.
- Seven relevant full function definitions/owners/search paths/ACLs captured. All definitions
  use an empty search_path. The three shared005 helpers lack an active-membership predicate.
  `set_active_choir` retains verified-session/upsert ownership checks and authenticated-only
  EXECUTE, but its membership check omits is_active. No helper was invoked.
- Session prerequisites and version/read helpers exist. Eighteen relevant relations and their
  columns/ACL/RLS were inspected. All47 selected078/090 column/type comparisons
  across14 relations match; session primary keys and membership cascade also exist. This is
  bounded structural evidence, not successful SQL application, data validity or a restore.
- `genova_005` schema/table access is owner-only; session helper is invoker/owner-only.
  `can_read_chat_media_060` is service-only, explicit active-actor/tenant/room/version scoped.
  Ordinary anon/authenticated roles have no BYPASSRLS; service_role does. No ACL modified.
- Dependency scan:329 pg_depend edges (37 defaults,292 policies); textual helper references
  in208 policies on41 public tables. These are edges/references, not329 distinct objects.
  SQL function-body/dynamic dependencies are not exhaustively tracked by pg_depend.
- Five exact Edge readers are ACTIVE, version1, verify_jwt=false. Their IDs, exact update
  timestamps and provider `ezbr_sha256` values are captured in JSON. A bundle hash is not
  equivalent to a local individual-module hash; version1 alone does not prove ticket format
  or online authorization behavior. No code-body download or endpoint invocation here.
- Fresh signed-in Vercel sibling Production Deployment is Ready, source
  `00be08678b0fc597b082e3e6255d6abef2e849e8`, deployment `GrXZ7J1KJtbimbqGZpNS2ZU6H6Jb`,
  displayed domain www.genesinovachoir.com and Visit alias genovasite.vercel.app. This agrees
  with earlier GitHub metadata. No public member data or form submission inspected.
  App a13f696 Ready and legacy/false secret flags remain earlier same-day R0 observations,
  not newly repeated here. No secret-name/digest extraction repeated.

## Findings and required treatment

| Severity | Evidence / relevant source | Why / next fix or test |
|---|---|---|
| CRITICAL before security release | Live current_choir_id/current_choir_member_id/set_active_choir definitions omit is_active; pinned `supabase/migrations/20260928140000_active_membership_revocation_078.sql` repairs them | Inactive membership may still resolve/select a choir and feed downstream policies. Shared POST/new-request authority is not the accepted active-only contract. Rehearse exact078 on fresh copy with active/inactive/multiple sessions and both sites, then separately approve deployment. Catalog proves missing predicate, not a performed live exploit. |
| CRITICAL before accepting next-request revocation | Live090 namespace/authority absent; five reader artifacts remain version1; pinned `supabase/migrations/20260930080046_private_file_ticket_authority_090.sql` and five closures | Current hosted release cannot be credited with proposed090 acceptance. Apply nothing yet: fresh recovery, exact service-only privileges, old-client compatibility and staged DB→Edge→client acceptance are required. JWT gateway false is intentional for handler Auth; it alone is not a vulnerability. |
| IMPORTANT shared-site compatibility | public.public_choir_members is security_invoker=true, owner postgres; underlying choir_members has tenant restrictive policy and no anon SELECT permissive policy. Dirty sibling `src/hooks/useChoirMembers.js` anonymously reads this view/nested roles and falls back to mock data on error | Anonymous directory has no independent approved public-tenant contract. Catalog/source predict filtered/failed public reads; neither real rows nor production UI were queried. This is an existing condition, not a regression from unapplied078. R1 must test exact production source in isolated synthetic context. Any eventual fix needs explicitly approved public fields and tenant scope; never disable security_invoker or widen global anon SELECT to hide the error. |
| IMPORTANT recovery | Six extensions including Vault and pg_net; managed owners/default ACL and Auth/session relations | Prior five-extension UI list is insufficient to plan restore. R1 must preserve/rehearse managed extension/role/ACL behavior; do not export Vault secret values, clone superuser credentials or strip privileges to obtain a false green. Define backup coverage/exclusions and recovery limitations before export. |
| GOOD, bounded | Empty search_path for examined helpers; session owner check; private005 ACL; service-only060; anonymous contact/subscriber/collab insert policies have validators/no SELECT policies | Preserve these safeguards. Broad relation grants do not alone prove anonymous row reads where RLS denies them. No claim about every unexamined function/policy or contact abuse protection. |

The shared directory finding is not authority to modify the sibling application. Its local
checkout is dirty and not automatically identical to deployed00be086. Exact production-source
comparison and synthetic directory/contact/subscriber/collab rehearsal belong to R1. Direct
choir_members writes also have restrictive006 false policies; broad permissive policies alone
must not be described as proven direct-write access.

## Evidence matrix

| Criterion | Required now? | Status | 2 October method / limit |
|---|---|---|---|
| Exact Genesinova connector identity | Yes | PASS | get_project exact ref/org; no credential/account changes |
| Server / complete installed-extension / custom-operator metadata | Yes | PASS | Connector/version and read-only catalog; six extensions; restore not tested |
| Exact ledger /078/090 namespace and authority presence | Yes | PASS |68 migrations plus to_regnamespace/to_regprocedure; absent proposal verified |
| Relevant helper definitions / ACL / roles / shared view and policies | Yes | PASS | Fixed seven-function allowlist, shared relations and208 policy-reference scan; not exhaustive access proof |
| Referenced prerequisites and session constraints | Yes | PASS |18 relation catalogs;47 selected source column/type comparisons; primary-key/cascade metadata |
| Five reader IDs / versions / bundle hashes / gateway JWT | Yes | PASS | list_edge_functions metadata; no code/behavior assertion |
| Secret names / eight non-secret flags | Yes | PASS, earlier same-day | Earlier R0 allowlisted result retained; no new credential/digest extraction |
| App production revision | Yes | PASS, earlier same-day | Earlier GitHub/Vercel a13f696; no product smoke repeated |
| Sibling current production alias / shared catalog impact assessment | Yes | PASS metadata | Fresh Vercel Ready00be086 + catalog/source; functional compatibility remains R1 |
| Fresh backup, actual isolated restore, exact SQL, old-client/both-site tests | Later required R1 | NOT RUN | No export/restore or runtime authorized by R0 |
| R2–R5 release / hosted synthetic isolation / clients / phone / activation | Later required | NOT RUN | No writes, provider activation, push/CI or device claim |
| Local links / JSON / pinned hashes / redaction / diff / scoped ownership | Delivery | PASS |408 local links/6 anchors,15 pinned files,10 owned files, credential-format scan0hits; self-review not independent review |

## Next bounded approval

Request R1 only: fresh logical recovery artifact from this exact shared DB, stored privately
locally with0600 access and a declared schema/data/Auth/Storage/Vault coverage matrix; isolated
restore and exact078→090 rehearsal, service-only ACL/active-membership/session denials, current
production web/sibling plus old-client compatibility using synthetic fixtures. Real backup rows
must never be printed into chat, committed, sent to Jev or another remote environment. No hosted
row changes, Edge deploy, provider writes or client promotion. Supabase-managed secret material
needs explicit exclusions and a reviewed restore strategy; Storage object bodies are not a
logical SQL backup. Existing068 recovery evidence cannot replace fresh proof.

Before allocation/export, record installed tools, usable connection mechanism without exposing
credentials, backup scope/size estimate, one-heavy-process cap and free-space floor10GiB. Keep
one protected recovery artifact and one disposable restore; no automatic recreation of cleaned
VMs/toolchains, no unbounded new Docker downloads. If export/restore is unavailable or size
cannot fit, report the concrete prerequisite instead of relaxing the gate.

R0 is an assessment gate: a verified missing proposal is expected release work, not a failed
metadata read. R1 can be requested, **R2 cannot proceed** until recovery/compatibility PASS and
its exact scope is approved. Source drift needs a renewed manifest; no rollback to oldv1 as
an accepted security fallback. Documentation rollback is a scoped Git revert; live unchanged.
New Jev inference cost$0; Codex/account billing unavailable.

Local delivery checks: scoped link/anchor and JSON/status contract PASS; all15 proposal file
hashes/byte counts equal pinned Git and working source; git diff --check PASS. No code/lockfile/
sibling-tree edits or product gates run. Final measured free19829644KiB above10GiB floor,
no new runtime/build/evidence binary retained. Unrelated CLI marker remains excluded.
