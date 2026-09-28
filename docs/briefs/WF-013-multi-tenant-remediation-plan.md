# WF-013 — commercial multi-tenant remediation execution plan

Status: implementation requested 28 September 2026; main agent is the single writer.
Source: [WF-012 audit](WF-012-commercial-multi-tenant-audit.md) and
[findings](../reports/2026-09-28-commercial-multi-tenant-audit.md).
The owner now authorizes scoped local implementation/tests/commits; external operations remain gated.

## Ordered checkpoints

| Order | Observable outcome | Acceptance / authority |
|---|---|---|
| 1 / [078](078-active-membership-revocation.md), F01 | Inactive membership no longer authorizes a tenant | COMPLETE LOCALLY: actual SQL/SDK/component/state-machine matrices, web 804/mobile 290; live NOT RUN |
| 2 / [079](079-message-status-rpc-privileges.md), F03 | Exact message-status RPC privileges independent of migration creator | COMPLETE LOCALLY: postgres/default ACL and other local creator, original 043 matrix, exact down/reapply; live NOT RUN |
| 3 / [080](080-safe-link-preview.md), F06 | Bound URL-preview destinations and resource use | COMPLETE LOCALLY: public/all-DNS policy, numeric Host/TLS transport, bounded stream/deadline/admission, 104 cases + actual Deno matrix; root 908/mobile focused 6 pass; hosted NOT RUN |
| 3a / [081](081-local-secret-file-permissions.md), F12 | Restrict local secret-file access, then separate credential review | MODE HARDENING COMPLETE LOCALLY: 10 files 0600, workspace 0755, unchanged bytes/owner and 987-file selected scan; creator/history/CI/rotation policy remains OPEN; no provider rotation |
| 4 / [082](082-atomic-repertoire-assignments.md), F04 | Assignment replacement is atomic | COMPLETE LOCALLY: actual PG17 failed-insert/empty/stale/concurrent/A-B/role/down-reapply matrix and root 94/927/build; hosted release NOT RUN |
| 5 / F05, F13 | Two unrelated choirs work without original-choir constants | PARTIAL LOCALLY: [083](083-new-choir-profile-reference-isolation.md) removes original-choir profile choices and guards submit context; [084](084-stale-choir-create-guards.md) freezes opening choir for four create flows. [085](085-two-choir-connected-backend-acceptance.md) connects actual PG17 007 creation → 008 invitations → separate profile/catalog data → repertoire/atomic assignments and shared-session/role/revocation refusals, plus three representative route/SDK transport matrices. Catalog/profile bootstrap is privileged fixture setup; transport responses are simulated. In-flight authority/partial-write races, remaining mutation families, catalog administration and complete file/browser/device product flow remain open. |
| 6 / F02, F07 | Protected storage cutover and old public-link withdrawal | Preserve accepted 071–076 copies; uniform file-ticket revocation contract; copy/activation/legacy ACL writes each need exact external scope, backup/recovery and client verification |
| 7 / F08, F09 | Operable commercial lifecycle | Assisted onboarding/member-role administration; manual invoice/seat contract; choir vs account deletion/retention and last-chef rules |
| 8 / F10, F11 | Measured release readiness | Reproducible empty DB baseline and incremental migration tests in appropriate CI; 10 then 100 choir paging/load/quota checks; actual browser/device/release layers |
| 9 / F14 | Recover from definite draft rejection without trapping the user | Separate definitive failure from uncertain commit; safe reconcile/discard, never silently lose a pending upload |

Order 6 preparation can proceed after tenant authority; actual private-file release remains a
prerequisite for commercial availability, not an optional late security improvement.
Keep the Android-first/full-product destination and existing feature scope in the
[delivery plan](../mobil-teslim-plani.md); this plan inserts audit-backed repairs, not a rewrite.
Only one implementation outcome is active at a time. Create its brief before writing code.
Do not treat this table as acceptance of future unrun work.

## Owner decisions, at their dependent checkpoints

- Onboarding: owner explicitly confirmed operator-assisted v1 on 28 September in this turn;
  self-service is a later phase, consistent with decision #18.
  The current security fix needs neither new registration behavior nor live choir creation.
- Commercial seats: per-extra-member price, billing period, active/invited/paused seat treatment.
  Five free members and manual invoices remain authoritative; no invented prices.
- Retention/deletion: retention periods and last-chef/ownership transfer policy before executable deletion.
- Storage: old bearer-ticket/offline copies cannot be remotely erased; define revocation semantics
  before release. Existing public Drive links need separate withdrawal, not just copying to R2.
- Release/provider/hosted operations: present exact revision, target, scope, cost, backup/restore,
  rollout and rollback; ask for the concrete operation, not blanket future authority.

## Plan acceptance

| Criterion | Required? | Status | Evidence / boundary |
|---|---|---|---|
| Audit findings trace to bounded outcomes | Yes | PASS | F01–F14 mapped above; source report remains detailed authority |
| Existing product and approval boundaries preserved | Yes | PASS | No push/deploy/hosted writes/provider/user-account action authorized by this plan |
| Local links and diff consistency | Yes | PASS | Checked with final 078/079 handoff; no live acceptance implied |

No new environment, dependency installation or delegated writer is introduced by this document.
