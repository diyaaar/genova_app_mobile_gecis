# P7 — Both-store release and operational handoff

> Historical plan as of 13 October 2026. [AGENTS](../../AGENTS.md) supersedes
> procedural restrictions here; the old stage order is not a current assignment.
> Product requirements, dependencies and recorded acceptance gaps are retained for
> the new roadmap. See [checkpoint](checkpoint.md).

[Previous P6](06-full-product.md) · [State](checkpoint.md) · [Guide](README.md)

## Contract

One final milestone: the full accepted product is actually available in the agreed
Android and iOS store destinations, with support and recovery handed over. Entry:
P6 feature/commercial acceptance and a current compatible-release manifest. Beta
acceptance, uploaded binaries or store submission alone do not satisfy this outcome.
Owner: delivery E1–E5 and [store record](../store-yayin.md).

Read-only account/readiness checks may happen earlier to expose external lead time;
they do not change the serial release dependency or authorize publication. Refresh
official Apple/Google/account-specific requirements at execution; old policy text,
pricing, testing duration and billing exemptions are not current facts.

## Linked stages

1. **P7.1 — Store-ready full candidate.** Verify publisher identity/account access,
   territories, privacy/terms, actual SDK/data/permission disclosures, deletion entry
   and web resource, review access, listing assets/accessibility and commercial-model
   assessment. Confirm new backend/schema/client compatibility and recovery through
   P3/P4 procedure. Do not invent a payment exception for web/manual billing.
2. **P7.2 — Signed two-platform acceptance.** Produce exact reproducible Android/iOS
   builds, verify approved distribution install/update and full role/device/network
   matrix. Close remaining 004/A5/B5 hardware rows on real devices using agent
   automation; secure storage, process lifecycle, push/background/audio/stylus as
   promised. A missing tool/device remains a blocker, never owner manual QA.
3. **P7.3 — Submit, verify availability, hand over.** Match publication scope to explicit
   operation authority, submit the tested identities, handle review issues as bounded
   changes and rerun affected gates. Verify actual listings and installation in both
   chosen destinations. Then exercise support/incident/restore/budget procedures.

Each stage uses its own bounded work card or brief when the observable outcome
changes. Store review/account verification/required testing are external dependencies;
record them and the next check, not a guaranteed calendar or fabricated acceptance.

## Required final gates

| Gate | Completion evidence |
|---|---|
| Complete scope | P6 matrix has no unapproved missing feature; permanent WebViews remain by decision, not unfinished native promises |
| Security/lifecycle | Cross-tenant/role/old-client/file and deletion/retention/seat boundaries proved; relevant independent review findings resolved |
| Android and iOS | Exact signed source/build/config identities; installation/update/relaunch, permissions, accessibility and promised hardware behavior |
| Store compliance | Current official/account-specific checklist, actual app disclosures and assets reviewed; billing/legal decisions recorded, not AI-assumed |
| Publication | Separate submission, approval and actual availability/install verification for each store; failures remain visible |
| Recovery | Fresh backup/restore and configuration/object scope; compatible rollback/forward repair for installed clients; incident drill |
| Operations | Named support owner/channel, crash/incident triage, backup cadence, supported-client policy, provider budget/usage check and first maintenance exercise |

## Final handoff and stop

Deliver release manifest, accepted evidence, actual store references/build IDs,
known nonblocking issues, operational runbook and prioritized maintenance backlog.
No recurring monitor is created unless the user asks for one. Publication does not
authorize announcements to people or indefinite background account activity.

If one store is pending, report one-store availability and the other exact blocker;
do not close P7 or the two-store goal. If physical proof is missing, do not promote
simulator evidence. Keep required rows open; do independent preparation only within
scope. At actual completion checkpoint becomes RELEASED, with evidence links rather
than a claim of permanent error-free operation. Future feature work starts a new
explicitly scoped brief; this plan does not grant unlimited changes forever.
