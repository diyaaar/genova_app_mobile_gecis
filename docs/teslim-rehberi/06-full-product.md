# P6 — Complete the preserved commercial product

[Previous P5](05-android-beta.md) · [State](checkpoint.md) · Next: [P7](07-stores.md)

## Contract

One milestone outcome: an accepted full-feature matrix for independent choirs.
Execute as the sequential subplans below, **not one brief or one giant diff**.
Entry: usable Android beta; critical beta defects take priority over new features.
Owners: delivery B/C/D, [WF-013](../briefs/WF-013-multi-tenant-remediation-plan.md),
module inventories and MIGRATION. Preserve five-free/manual-billing/operator-assisted
decisions. Self-service is later, not a new prerequisite or an implied implementation.

## Linked subplans

| Order / single journey | Work and required output | Dependency / decisions |
|---|---|---|
| P6.1 — Independent choir starts using the product | Operator creates B without Genova constants → catalogs/bootstrap → invite → roles → member profile → first repertoire/assignment. Audit all WF-013 step5 remainder; no hidden SQL hand-edit required in ordinary onboarding. Retain two-choir and multi-membership refusals | Existing 007/008/083–089; role/catalog/operator scope. Each distinct mutation flow gets bounded acceptance |
| P6.2 — Shared rehearsal annotations | Finish native writing against shared `lib/repertuvar/annotation-types.ts`; web↔native read/write, undo/redo/coordinates, exact role/layer enforcement, stale revisions, unknown content preservation | B1–B2/023–025; resolve 023's four owner choices before final UX, no silent last-write-wins |
| P6.3 — Recoverable rehearsal away from network | Idempotent annotation save/reconnect/process restart; conflict recovery; explicit offline library download/eviction/version/access boundary; foreground audio preserved, background/interruption/stylus acceptance where promised | B3–B5; offline/unsaved-work decision; device proof separate from simulated events |
| P6.4 — Communication | Selected push provider/register/revoke/receipts/tap lifecycle, then remaining chat reactions/polls/receipts/Presence/media/admin/reconnect; retain already accepted stars 051 | C2/C3 inventories; provider choice/credentials/recipient authority. No new generic notification platform |
| P6.5 — Homework to home | Native assignment read → submit/upload/retry/withdrawal → chef review; then native home/performance using same role/data meanings | C4/C5, shared Edge logic and web callers; F14 definite failure vs uncertain commit handling |
| P6.6 — Commercial administration and lifecycle | Server-owned seat/limit rules, manual plan/invoice operations, account vs membership vs choir deletion/export/retention, last-chef transfer; correct UI/web entry points | D2/D3 + WF-013 step7. Price/interval/counting/retention choices required before enforcement or destructive flow |
| P6.7 — Complete-system release readiness | Reconcile every preserved feature; reproducible empty/incremental DB migrations, tenant/permission concurrency, 10 and 100 choir paging/load/quota, dependency/security and recovery checks | WF-013 F10/F11/F12 + D6; safe isolated fixtures, explicit performance/resource budget before load tests |

Within a subplan choose the earliest ready single journey; preserve its dependencies.
If an owner choice blocks P6.2, eligible P6.4 preparation may continue, but P6.2 remains
open. Do not let optional polish take priority over a demonstrated release blocker.
No fixed completion dates or whole-product percentage from brief/test counts.

## Common adversarial acceptance

- Two unrelated choirs and one account in both; URL/row/object/Realtime topic guessing;
  wrong choir, revoked role/membership, suspended account and expired session.
- Permission change during in-flight read/write; two users save/invite/upload together;
  uniqueness/seat reservations/idempotency and recovery from ambiguous commit.
- Deleted choir/member/resource; last chef; shared vs personal records; missing or
  malformed metadata and unknown annotation types. No data-loss fallback.
- Multi-client mixed revisions; app process death/offline/reconnect; queued operations
  cannot replay into a different tenant. Next-request online revocation remains fixed;
  already downloaded bytes are not remotely erasable.
- 10 then 100 synthetic choirs: measured query/page/request count, latency/memory and
  tenant boundary; agreed thresholds and environment stated before asserting scale.

Not every row needs rerunning for every tiny change; map each to its owning brief
and run at coherent integration boundaries. RN/web/DB/Edge gates follow AGENTS.
CI execution, hosted fixtures, real email/notifications and destructive operations
retain their own target scope. Reuse existing tools, do not build a compliance framework.

## Acceptance and handoff

Feature matrix columns: web capability, mobile ownership, beta status, final status,
source/brief, required tests, actual environment, remaining decision/defect. Every
original module action is accounted for; owner-deferred work has a real decision.
A row marked missing or NOT RUN cannot be hidden by calling the application complete.

Full commercial acceptance requires two-choir operator journey, promised native
features, defined/enforced five-free extra-seat behavior, lifecycle safeguards and
required scale/security/migration checks. Independent review covers consequential
authorization/schema changes; Jev analysis is advisory, not review acceptance.

Output: complete source/version/feature manifest, passed subplan evidence, current
operational/commercial policy and residual store/hardware gates explicitly owned by
P7. Reuse P3/P4's compatible-release procedure for every changed backend generation;
do not accumulate another untracked local/live divergence before final release.
