# WF-013 — commercial multi-tenant remediation execution plan

Status: implementation requested 28 September 2026; main agent is the single writer.
Source: [WF-012 audit](WF-012-commercial-multi-tenant-audit.md) and
[findings](../reports/2026-09-28-commercial-multi-tenant-audit.md).
The owner now authorizes scoped local implementation/tests/commits; external operations remain gated.

## Ordered checkpoints

| Order | Observable outcome | Acceptance / authority |
|---|---|---|
| 1 / [078](078-active-membership-revocation.md) | Inactive membership no longer authorizes a tenant | Real local SQL read/write/role/RPC refusals; web/native fail-closed selection and cache teardown; no hosted changes |
| 2 / 079 | Exact message-status RPC privileges independent of migration creator | Forward-only grant repair; postgres and restored Supabase default ACLs; original 043 matrix; exact rollback/reapply; no applied history rewrite |
| 3 | Bound URL-preview destinations and resource use | Private/metadata/redirect refusals, bounded stream/deadline; no internal-network exploitation |
| 4 | Assignment replacement is atomic | Failure leaves prior state intact; concurrent/retry matrix; bounded DB transaction, not UI-only repair |
| 5 | Two unrelated choirs work without original-choir constants | Dynamic reference data, new-choir fixtures, single/multiple accounts, permission changes and cross-tenant refusals |
| 6 | Protected storage cutover and old public-link withdrawal | Preserve accepted 071–076 copies; remaining copy/activation/legacy ACL writes each need exact external scope, backup/recovery and client verification |
| 7 | Operable commercial lifecycle | Assisted onboarding/member-role administration; manual invoice/seat contract; choir vs account deletion/retention and last-chef rules |
| 8 | Measured release readiness | DB tests in appropriate CI; 10 then 100 choir load/quota checks; actual browser/device/release layers, no inferred acceptance |

Order 6 preparation can proceed after tenant authority; actual private-file release remains a
prerequisite for commercial availability, not an optional late security improvement.
Keep the Android-first/full-product destination and existing feature scope in the
[delivery plan](../mobil-teslim-plani.md); this plan inserts audit-backed repairs, not a rewrite.
Only one implementation outcome is active at a time. Create its brief before writing code.
Do not treat this table as acceptance of future unrun work.

## Owner decisions, at their dependent checkpoints

- Onboarding: retain decision #18 operator-assisted v1 unless the owner selects self-service.
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
| Local links and diff consistency | Yes | NOT RUN | Check with implementation handoff |

No new environment, dependency installation or delegated writer is introduced by this document.
