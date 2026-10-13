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
| 5 / F05, F13 | Two unrelated choirs work without original-choir constants | PARTIAL LOCALLY: [083](083-new-choir-profile-reference-isolation.md) removes original-choir profile choices/guards context; [084](084-stale-choir-create-guards.md) freezes four create forms; [085](085-two-choir-connected-backend-acceptance.md) connects actual 007/008/profile/catalog/repertoire SQL with representative simulated transports. [086](086-two-choir-real-web-acceptance.md) accepts actual local Chrome/Next/Auth/REST/RLS/Edge A/B invitations, pending profiles/catalogs/repertoire/assignment reads and delayed/foreign/pre-dispatch revocation refusals without response mocks (historical revoked submit 500). [087](087-authority-safe-profile-submit.md) now removes split service-key profile submission: authenticated-only transaction holds session/member authority, snapshots/merges/cleans atomically; six real PG concurrent matrices/rollback/ACL/down-reapply and root 1004 tests pass; submit inactive 403/context 409/missing RPC 503. [088](088-authority-safe-profile-review.md) removes split service-key chef approval/rejection: caller/session/active actor/own chef role-definition/target/request locks, atomic member + decision, review-time snapshot/own references and postcommit best-effort push. Actual PG17 rollback/ACL/down-reapply and 12 real competing matrices (including 087 ordering) plus root 1036 tests/build pass. [089](089-real-profile-review-web-acceptance.md) now accepts actual local Chrome/Next/Auth/REST/RLS/PG17 A/B form submit, chef approve/reject, member/history and wrong-tenant/non-chef/stale/finalized/role/inactive refusals without response mocks. Real RED led to removing original-choir review label constants/global song map; referenced RLS page-local names and late-read guards pass six component cases plus actual UI. Root 103 suites/1042 tests/build, focused 4/72 pass. Browser permission changes are pre-dispatch, not new in-flight HTTP concurrency proof. Catalog/readiness/extra-role bootstrap remains manual synthetic setup; operator administration, assignment modal/signup/mail remain unaccepted. Other in-flight/partial-write mutation races, direct/service writers, catalog administration, protected files and full device/product flow remain open. |
| 6 / F02, F07 | Protected storage cutover and old public-link withdrawal | Preserve accepted 071–076 copies. [091](091-connected-private-r2-read.md) historically exposed the old issued-URL gap; [092](092-stale-private-file-ticket-cache.md) fixes late cache publication, not server revocation. [090](090-private-file-ticket-revocation-contract.md) now has approved decision #32 and local v2 session/actor/choir authority: five-family SQL/HTTP, Android current-v2 PDF and Chrome recovery pass locally. Native PDF stale-v1, WebView, HTTP/COMMIT overlap and hosted rollout remain distinct gates. Copy/activation/legacy ACL writes still need exact external scope, backup/recovery and client verification. |
| 7 / F08, F09 | Operable commercial lifecycle | Assisted onboarding/member-role administration; manual invoice/seat contract; choir vs account deletion/retention and last-chef rules |
| 8 / F10, F11 | Measured release readiness | Reproducible empty DB baseline and incremental migration tests in appropriate CI; 10 then 100 choir paging/load/quota checks; actual browser/device/release layers |
| 9 / F14 | Recover from definite draft rejection without trapping the user | PARTIAL LOCALLY, 13 October: fresh definite rejection releases draft; uncertain retry identities and same-tab concurrency protected; actual form/service tests pass. Historical uncertain drafts still need safe reconciliation. [Evidence](../reports/2026-10-13-production-baseline.md) |

Order 6 preparation can proceed after tenant authority; actual private-file release remains a
prerequisite for commercial availability, not an optional late security improvement.
Keep the Android-first/full-product destination and existing feature scope in the
[delivery plan](../mobil-teslim-plani.md); this plan inserts audit-backed repairs, not a rewrite.
Only one implementation outcome is active at a time. Create its brief before writing code.
Do not treat this table as acceptance of future unrun work.

1 October check-up: [090](090-private-file-ticket-revocation-contract.md), source/test
`dc46c2a`, additionally passes actual Android synthetic audio 401 recovery/expiry
seek-resume/tenant clear and 403 refusal. This fixes a reproduced transient Expo error
loss; its unsigned synthetic ticket fixture is not connected Auth/R2/v1 acceptance.
Native PDF/WebView/HTTP-overlap and hosted gates remain open. The current step 6 pointer
now recognizes approved #32 rather than re-asking it. [General report](../reports/2026-10-01-project-checkup.md).

## Owner decisions, at their dependent checkpoints

- Onboarding: owner explicitly confirmed operator-assisted v1 on 28 September in this turn;
  self-service is a later phase, consistent with decision #18.
  The current security fix needs neither new registration behavior nor live choir creation.
- Commercial seats: per-extra-member price, billing period, active/invited/paused seat treatment.
  Five free members and manual invoices remain authoritative; no invented prices.
- Retention/deletion: retention periods and last-chef/ownership transfer policy before executable deletion.
- Storage: online revocation is decided in #32 and locally implemented in 090; finish its
  remaining acceptance and ordered hosted rollout. Already-streaming/offline bytes cannot be
  recalled. Existing public Drive links need separate withdrawal, not just copying to R2.
- Release/provider/hosted operations: present exact revision, target, scope, cost, backup/restore,
  rollout and rollback; ask for the concrete operation, not blanket future authority.

## Plan acceptance

| Criterion | Required? | Status | Evidence / boundary |
|---|---|---|---|
| Audit findings trace to bounded outcomes | Yes | PASS | F01–F14 mapped above; source report remains detailed authority |
| Existing product and approval boundaries preserved | Yes | PASS | No push/deploy/hosted writes/provider/user-account action authorized by this plan |
| Local links and diff consistency | Yes | PASS | Checked with final 078/079 handoff; no live acceptance implied |

No new environment, dependency installation or delegated writer is introduced by this document.
