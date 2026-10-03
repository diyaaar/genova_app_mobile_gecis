# P3 — Compatible, reviewed and recoverable release package

[Previous P2](02-ios.md) · [State](checkpoint.md) · Next: [P4](04-storage.md)

## Contract

One outcome: an exact actionable release package with independently reviewed
compatibility and demonstrated recovery, before any candidate promotion. Entry:
P1 manifest + accepted latest iOS/Android boundaries. Use 090/R1 and the existing
[R2 release runbook](../private-r2-release-runbook.md), not a second deployment system.

Read [R1's failed compatibility boundary and backup limits](../reports/2026-10-02-hosted-revocation-r1-recovery-rehearsal.md),
the candidate browser/profile reports, [WF-013](../briefs/WF-013-multi-tenant-remediation-plan.md)
and the current runbook. DB/Edge inspection uses the correct project's approved
connector and applicable skills. Do not inspect or change the detached sibling site.

## Ordered work

1. Trace all exposed beta routes to exact backend dependencies. Audit browser-only
   APIs in shared/native paths and minimum backports. Verify old-open tab, refreshed
   web, installed old mobile, new mobile and mixed web/Edge versions. Preserve the
   signature-only legacy-reader defect as a regression; updating Edge alone failed.
2. Refresh exact target/read-only preflight and prepare a fresh protected backup
   and isolated restore under applicable authority. Prove ordered migrations and
   old/new client negative tests against the recovered state. Inventory exclusions
   (Vault/queues/object bytes/settings/Auth) and cover each required recovery layer.
3. Arrange an actually independent review of the precise manifest/diff, then rehearse
   rollout/forward repair with failure checkpoints. If no independent reviewer is
   available, record NOT RUN and the missing review; self-review/Jev is not a substitute.
   Hand the concrete package and exact remaining authority to P4.

## Required release rows

| Gate | Required evidence |
|---|---|
| Compatibility | Actual Next route/middleware + Edge/Auth/RLS integration, all five file families, current/old clients, stale URLs and session/role/member changes |
| Database | Exact ordered SQL hashes; fresh restore, roles/grants/policies and negative tenant tests; incompatible down paths prohibited |
| Recovery | Backup timestamp/target/access protections; restore result; per-layer data/object/config recovery and explicitly bounded loss window |
| Application order | Expand compatible DB → compatible Edge → repaired web/readers → supported mobile → activation; any necessary intermediate version separately tested |
| Revocation | Existing URL's next online GET/HEAD denied after authority loss, across old/new clients; already downloaded/in-flight bytes excluded honestly |
| Review | Named independent reviewer/run, exact candidate hash, findings addressed or release-blocking; self-review retained separately |
| Dependency/security | Exact lockfile triage, secret/config and authorization negatives; actual Auth/REST/private-file response cache headers and native CFNetwork persistence (P2 fixture-only no-store is not provider proof); unresolved relevant risk explicit, no blanket suppression |
| Operation packet | Each write's target/project/account, revision, data/resource scope, cost, automatic deployment effects, check and recovery/stop command |

A restore that omits object bytes cannot claim file recovery. Git revert does not
restore rows, roles, files or installed binaries. Do not restore actorless tickets
or the known inactive-membership defect as a convenient rollback.

## Acceptance and handoff

Use required PASS/FAIL/NOT RUN rows in the owning brief. P3 closes when package-level
review/rehearsal gates pass and every external step is executable or explicitly
awaiting its target-specific authority. **Actual deployment tests remain P4**, not
falsely PASS here. Preserve prior permissions; ask only for missing scope with the
completed packet. No generic “approve everything” request substitutes for that match.

If dependencies change the candidate, return its affected scope to P1/P2 without
rerunning unrelated checks. If a deployed stage later fails, stop dependent rollout,
execute only the rehearsed authorized recovery and reopen this gate as needed.
Output: one reviewed manifest/runbook/recovery/evidence set; no bulk push of local main.
