# 085 — connected two-fresh-choir backend acceptance

Status: IN PROGRESS, 28 September 2026. Main agent is the single writer.
WF-013 checkpoint 5 remains partial. Owner approved continuing its integrated synthetic
two-choir acceptance; this brief proves the backend portion, not browser/file/device release.

## Startup and observable outcome

Read AGENTS, handoff, active context, 084, WF-013, transition guide, work cycle,
brief template, delivery execution controls, MIGRATION screen/backend boundaries and
decisions #16/#18/#28–31. Verified main / `235375c`; only unrelated
`supabase/.temp/cli-latest` is dirty. Current PG17 restore contains 007/008, not 078/082.
Chrome 153 is installed, but Colima has no instance and no local Supabase Auth/REST/Edge
service listens. Do not silently recreate the cleaned VM or call SQL/SDK tests browser E2E.

One observable result: two unrelated 007-created choirs can invite the same verified synthetic
account through 008, retain separate profiles/catalogs and song assignments, and refuse
foreign object requests and revoked authority without changing either choir's prior data.
Use real local PostgreSQL RPC/RLS/constraints, plus representative web route/actual SDK
transport tests. The transport's HTTP responses are simulated and not database acceptance.
Profile request bootstrap/catalog provisioning/role administration need privileged fixture
setup because they are service-backed/manual today; label those steps, do not invent a public
onboarding API. Preserve operator-assisted v1 and native/WebView ownership.

## Work card, scope and resources

1. Add a connected SQL transaction and guarded disposable-clone runner, using actual
   operator/invitation/active-choir/assignment functions. Verify positive A/B, wrong recipient,
   same-session switching, foreign references/targets/objects and permission revocation.
2. Exercise representative object-anchored web routes through their actual tenant client
   and Supabase SDK; refuse old A IDs in B, demoted/inactive callers; preserve own-B success.
   Report a discovered production defect before expanding beyond this test-only checkpoint.
3. Run focused tests, root gate, self-review, ownership/links/cleanup; split test and record
   commits. Exit only when every required backend criterion passes; keep full WF-013 step 5 open.

Measured free: 33,769,712 KiB. Retained source DB 15,668,915 bytes; one owned target
`genova_085_test_connected` estimated <25 MiB; build/coverage <1 GiB. Floor remains >10 GiB.
One heavy process; no VM/browser/SDK download, dependency install, native runtime or provider.
Drop only newly created owned target; preserve original source and 071–076 evidence.
Move task-generated `.next`/coverage recoverably after their last check; Trash retains blocks.

Allowed paths: `supabase/tests/085_two_choir_connected.sql`,
`supabase/test-support/085_two_choir_connected_runner.sh`,
`app/api/object-anchored-tenant-boundary.test.ts`, this brief, WF-013, handoff,
active context and progress. No production source/schema change, broad refactor, live
accounts/data, credential changes, messages, push/deploy or provider/file writes.
Rollback: remove/revert test sources; transaction ROLLBACK and exact clone removal preserve
baseline data. Existing migrations apply only to the disposable clone, not the source/hosted DB.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Two genuinely fresh 007 choirs and actual 008 invitation acceptance create separate memberships for one account | Yes | NOT RUN | No direct membership fixture for invited account; synthetic verified Auth/session rows only |
| Connected profile/catalog/repertoire/assignment flow has A/B positive controls and foreign refusals | Yes | NOT RUN | Catalog/profile bootstrap is explicitly privileged fixture setup; not a public product/API flow |
| Same-session old-object requests, role removal and selected-member revocation leave both choirs' prior state intact | Yes | NOT RUN | Real PG17 constraints/RLS/RPC; web representative routes tested separately |
| Actual route/tenant client/SDK preserve scoped object IDs, refuse foreign/demoted/inactive requests, own-context succeeds | Yes | NOT RUN | Simulated HTTP responses; no mock of tenant client/SDK, not actual Auth/REST runtime |
| Source and clone baseline unchanged; exact clone removed; focused/root/diff/link gates and split commits | Yes | NOT RUN | Re-run after final test source edits; self-review is not independent review |
| Browser/Edge/Auth mail/file/device/hosted release and remaining mutation families | No; retained WF-013 step 5/6/8 gates | NOT RUN | Need exact local service runtime/resource preparation and separately authorized release |

Required FAIL/NOT RUN prevents this bounded backend checkpoint closing. Passing it does
not close F05/F13, certify all APIs or prove a new choir can onboard without operator help.
