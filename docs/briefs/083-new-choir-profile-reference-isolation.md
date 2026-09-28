# 083 — new-choir profile reference isolation

Status: COMPLETE LOCALLY, 28 September 2026. Single writer: main agent.
One observable result: a member of either newly created choir sees only that choir's profile
reference choices, and a profile request from an outdated tab cannot be written to another choir.
Source: [WF-012 F05/F13](../reports/2026-09-28-commercial-multi-tenant-audit.md),
[WF-013](WF-013-multi-tenant-remediation-plan.md). Owner approved this local checkpoint.

## Startup and decision boundary

Read AGENTS, handoff, active context, 082, delivery controls, transition guide, work cycle,
brief template, MIGRATION profile ownership, decisions #16/#18, 003/005/006/007/078 authority,
profile editor/submit/review, tenant client and actual table policies. Verified `main`/`ee6ca44`;
only unrelated `supabase/.temp/cli-latest` is dirty. Supabase and Postgres skills plus current
official Data API/RLS guidance are used; local PG17 and product tests decide acceptance.

The profile editor currently embeds four school and 15 department UUIDs from the original
choir. 007 creates roles and founder but no school/department catalog; 006 blocks ordinary
client writes to these reference tables. v1 operator-assisted choir creation is already decided.
This checkpoint removes foreign choices, but does not invent a global catalog or an operator
catalog-management workflow. A genuinely empty new-choir catalog must be shown honestly and
cannot be populated through this member UI. That operator workflow stays in F08.

Profile is a permanent WebView screen per MIGRATION; do not create a native twin. In another
tab, the same Auth session can switch its server-active choir while this page still displays
its earlier choir. The profile submit route creates new rows without an existing tenant ID, so
it needs an expected-choir precondition. This is a profile-flow slice of F13; other mutation
routes remain outside this brief and must not be represented as globally protected.

## Work card and scope

1. Reproduce the fixed-options defect and stale-tab request with focused negative tests;
   prove two new synthetic choirs, including a shared account, on an isolated PG17 clone.
2. Load school/department/favorite-song choices from the browser's active tenant through
   existing RLS; fail closed on loading errors. Send expected choir on profile submit and
   compare it during server session resolution before using the tenant service client.
3. Run focused SQL/web, root `pnpm check`, self-review, task-owned cleanup and split commits;
   update WF-013/handoff/active/progress with limits.

Allowed: `app/(main)/profil/duzenle/page.tsx`, profile submit route and focused tests,
`lib/server/tenant-client.ts` and its focused tests, bounded SQL fixture/test/runner under
`supabase/tests/` and `supabase/test-support/`, this brief and status records. No schema
migration, provider/network object, new registration, role/catalog admin UI, unrelated route,
native source or retrospective rewrite of 003/005/006/007/078. Review route is inspected and
tested as relevant, but an unneeded refactor is not authorized.

## Resources, authority and rollback

Preflight 34,971,364 KiB free; retained PG17 restore ~15 MiB, one disposable clone ~15 MiB,
root build/coverage expected <1 GiB peak. 10 GiB floor holds. No VM/simulator/dependency
download. Retain source restore and accepted 071–076 copies. Remove only task-owned clone and
generated build/coverage after final checks; preserve unrelated CLI marker. No hosted DB/data,
Edge, push, deployment, real choir, credential or provider action. Code rollback is an
application revision; no DB down applies. Hosted use still needs exact source/release approval.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Fixed old-choir choices and stale-context write reproduced safely | Yes | PASS | Source held four original-school/15 original-department IDs; negative UI test and expected-A/current-B helper test failed before fixes, then passed. Synthetic only. |
| Two fresh choirs: own reference choices, empty catalog, foreign refusal, shared-account switch | Yes | PASS | `083_new_choir_profile_runner.sh`: local PG17 clone, actual 007 operator creation, 078/082 applied, authenticated A/B/shared-session RLS, own/foreign reference and inactive refusal. 005 regression and source/baseline fingerprints unchanged; disposable clone removed. |
| Profile editor loads only selected choir and handles error/context switch without stale choices | Yes | PASS | Five focused UI cases: A→B, empty catalog, late A response, failed load, expected B on submit. Explicit choir filters and disabled save. Browser E2E separate. |
| Submit endpoint refuses missing/mismatched expected choir before privileged write | Yes | PASS | Missing/invalid ID 400, A-tab/B-session mismatch 409 before service client/writes; verified via route and tenant-client tests. Existing deployed old tab must refresh. |
| Own-choir profile request and approval remain possible; other-choir reference rejected | Yes | PASS | PG17 SQL proves tenant-link own approval and cross-tenant school/department/member refusal; route tests own school accepted and foreign school/department/song rejected before pending insert. No real user rows. |
| Root `pnpm check`, local links/diff, cleanup and split commits | Yes | PASS | Lint, typecheck, 96 suites/943 tests, service-worker syntax and Next build passed after final test edits. `bash -n`, diff check and local-link check passed. Scope `4b4f999`, code/test `fdb2dbb`, final record commit below. Owned clone removed; `.next`/coverage moved recoverably to Trash; 34,378,488 KiB free. No mobile source changed. |
| Hosted/browser/provider/real-account acceptance | No; separate release | NOT RUN | Do not claim production readiness |

The first SQL fixture attempt exposed inherited operator JWT claims during synthetic setup;
clearing them before privileged fixture insertion made the exact check pass. A new UI mock
initially recreated a member object on each render and looped; a stable test fixture fixed it.
These were local test harness errors, not hosted product observations. Self-review is not
independent review. F05/F13 are only partially addressed: other mutation routes, invite/file/
assignment product flows, operator reference-catalog management and full two-choir browser/device
acceptance remain open. No schema migration, push, deploy, hosted data or provider action ran.
