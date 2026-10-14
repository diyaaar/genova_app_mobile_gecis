# Genova production roadmap

13 October 2026. Owner direction: finish a product that choirs can use and pay for.
This replaces the old stage ordering, not the agreed product scope. [AGENTS](../AGENTS.md)
owns working guidance; [checkpoint](teslim-rehberi/checkpoint.md) records current results.

## Delivery target

A choir operator can onboard an independent choir, invite its members, assign roles,
publish repertoire and homework, and run rehearsals. Members can reliably open their
PDF/audio, communicate and complete work. Cross-choir access, revoked membership and
interrupted saves must behave correctly. Commercial operation must include defined
seat rules, manual invoicing, support and recovery. Native annotation writing/sync,
homework/home and push remain part of the agreed product; a pilot is not full completion.
Keep React Native/Expo, the permanent WebView screens, Supabase and the shared annotation
contract. No new provider or architecture migration is necessary for this roadmap.

## Outcome checkpoints

| Checkpoint | Observable completion | Current position |
|---|---|---|
| A. Reproducible baseline | Current source builds; web/mobile tests and browser journeys run; Git, deployed backend prerequisites and product gaps are recorded | Local checks and read-only metadata refreshed in the [13 October report](reports/2026-10-13-production-baseline.md); not deployed acceptance |
| B. Compatible, recoverable service | Exact DB → Edge → web/mobile release rehearsed against restored state; five private-file families and legacy transition reject revoked access; restore and rollback/forward-repair verified | Active release bottleneck. Hosted snapshot still lacks seven required public RPCs; 219-case five-family managed runtime now passes locally; fresh restore/current web now pass locally; object/provider recovery and live release remain open |
| C. A choir completes its daily work | Operator-assisted second-choir onboarding, catalogs, invitation/recovery, role/profile changes, repertoire/PDF/audio/chat, homework/review and rehearsal/attendance complete without hidden operator SQL fixes | Several local flows exist. Finish remaining real service/browser journeys and recovery defects, including historical uncertain song drafts |
| D. Complete mobile experience | Native annotation editing, conflict/restart/offline recovery, remaining chat, homework/home and chosen push delivery work with web; Android and iOS automated runtime evidence | Retain existing source and dated tests; missing native features and provider/device acceptance remain open |
| E. Sell and operate | Enforced seat/plan rules, manual invoice workflow, ownership/deletion/retention, monitoring/support/recovery and repeatable release; scale checks and store/distribution requirements completed | Commercial choices below and operational implementation remain open |

These outcomes guide priorities, not permissions or artificial task-size limits.
Useful independent implementation can proceed while a release dependency is unresolved.
Do not equate passing unit tests or a generated APK with a usable production service.

## Next implementation direction

B's [five-family managed acceptance](reports/2026-10-13-five-family-managed-acceptance.md)
is complete locally. The new [release package](production-release-package.md) and exact
source manifest supersede the old unexecuted harness/capacity checkpoint. Preserve the
protected backup and dated evidence. Fresh target restore and current web integration passed on 14 October; see the
[acceptance report](reports/2026-10-14-fresh-recovery-and-current-web.md). Next are real
object/provider-secret recovery, remaining native/product work and applicable exact
live-operation authority.

The release package now records exact revisions and SQL/Edge/client contents, fresh
metadata/source comparison, rollout order and verification. Fresh logical recovery/current web read integration are verified locally. Real file
bytes, provider secrets and remaining native/product integration remain open.
Current remote main remains `a13f696da8c731e9af2a2bce473d4f4ae4a81587`; do not publish the
407-commit entry divergence as an unexplained bulk update. Live mutations and publishing
need the applicable concrete authorization when the package is ready. Continue local
implementation and checks without repeated permission requests.

## Product choices still needed at their dependent work

Existing decisions retain five free members, operator-assisted onboarding and manual
invoices. Do not invent the extra-seat price, billing interval or invited/paused-seat
counting. Retention periods and last-chef transfer/deletion rules also need a concrete
proposal before destructive lifecycle behavior. Select push transport with its actual
integration/operating tradeoff when implementing delivery. These choices do not block
the current file/service release work. Agent-owned automation remains the default;
do not assign the owner's phone as the missing test plan.
