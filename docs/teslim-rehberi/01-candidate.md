# P1 — One reviewable release candidate

> Historical plan as of 13 October 2026. [AGENTS](../../AGENTS.md) supersedes
> procedural restrictions here; the old stage order is not a current assignment.
> Product requirements, dependencies and recorded acceptance gaps are retained for
> the new roadmap. See [checkpoint](checkpoint.md).

[Guide](README.md) · [State](checkpoint.md) · Next: [P2](02-ios.md)

## Contract

One outcome: an exact, internally consistent candidate manifest that another agent
can reconstruct without reading prior chats. Entry: WF-016 source audit and current
checkout. This is the decomposition of delivery queue source reconciliation, not a
bulk-main release or a requirement to rewrite working code. Own execution in 090's
candidate work card; use a new brief only for a genuinely distinct bounded repair.

Read [090](../briefs/090-private-file-ticket-revocation-contract.md),
[WF-013](../briefs/WF-013-multi-tenant-remediation-plan.md), the input reports in
[checkpoint](checkpoint.md), MIGRATION and exact relevant source. No conversation rescan.

## Ordered work

1. Verify repository/branch/HEAD/dirty ownership and read-only remote identity. Inspect
   candidate refs and manifests. Confirm the actual served web revision separately when
   available; do not substitute GitHub main for deployment proof. Record unknowns.
2. Construct one candidate ID under `docs/reports/090/` with the schema below. Map
   client calls to required SQL/Edge/functions/config. Separate minimal compatible
   promotions from unrelated accumulated work. No copy/worktree merely for cleanliness.
3. Review inclusion/omission and test provenance. Resolve contradictions locally;
   reuse unchanged accepted Android checks by hash. Hand one manifest to P2, and a
   dependency/old-client inventory to P3. Do not rename missing evidence as accepted.

## Mandatory manifest fields

| Section | Fields |
|---|---|
| Identity | candidate ID/date, checkout HEAD/tree, owned diff hash if any, exact component refs/trees; clean construction instructions |
| Components | web, embedded WebView, RN Android/iOS, shared contracts, ordered SQL file IDs/checksums, Edge function source/config identities, lockfiles/toolchain |
| Features | each current route/action → included in beta / retained for final / explicitly excluded by owner; dependencies and reason |
| Runtime boundary | native/WebView/Edge ownership; no new Next API for native logic; auth/choir/role and private-file contracts |
| Target | observed existing release and date, intended project/domain/build channel, unknown deployment facts explicitly marked |
| Evidence | exact source hashes, test date/environment, PASS/FAIL/NOT RUN, reuse rationale, invalidated checks |
| Release blockers | severity, exact failing/unrun criterion, owner plan/brief, next smallest action; no unrelated full-product feature as beta blocker |
| Recovery | preflight requirements, rollback/forward-repair pointers, old-client support and external authority status |

Multiple component SHAs may compose one candidate; do not falsely assign one SHA to
different tested trees. A later code/config change versions the manifest and reopens
affected evidence. A documentation-only commit need not invalidate product hashes.

## Acceptance and handoff

P1 is complete only when every mandatory component, exposed feature and dependency
is resolved to a source identity or an explicit later **environment** gate. An unknown
required source dependency blocks P1; missing hosted verification belongs to P3/P4.
Candidate source identity can be frozen while runtime acceptance remains pending.

Required evidence: refs/hashes verified, feature inventory reconciled, unchanged
Android pins matched, all known blockers assigned, local links and diff clean. Use
the existing brief's mandatory evidence table. Product tests are required only if
product code changes, not to validate this inventory. Self-review is labelled as such.

Output: manifest + acceptance record + code/document commit identities as applicable.
Update checkpoint to P2 only after acceptance. No push, deploy, DB or provider write.
Rollback affects owned planning changes only; no resetting others' work.
