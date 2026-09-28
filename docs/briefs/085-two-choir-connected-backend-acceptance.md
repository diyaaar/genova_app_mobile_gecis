# 085 — connected two-fresh-choir backend acceptance

Status: COMPLETE LOCALLY for the bounded backend matrix, 28 September 2026.
Main agent is the single writer. Scope `a480e5d`; test sources `4d87e90`.
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
| Two genuinely fresh 007 choirs and actual 008 invitation acceptance create separate memberships for one account | Yes | PASS | 28 Sep, PG17.11: guarded 085 runner; each founder invites shared account, wrong recipient/reused token refused; two separate Korist memberships, no raw token persisted. Auth users/sessions are synthetic verified fixtures, not real login/mail. |
| Connected profile/catalog/repertoire/assignment flow has A/B positive controls and foreign refusals | Yes | PASS | 085 SQL: same catalog/song names allowed in distinct choirs, separate request/profile references, own song inserts/atomic assignments/idempotent retry, A/B reads, foreign school/target refusal. Catalog/profile bootstrap remains privileged fixture setup, not public onboarding or actual profile review API acceptance. |
| Same-session old-object requests, role removal and selected-member revocation leave both choirs' prior state intact | Yes | PASS | 085 SQL: shared chef/current B cannot mutate A song/request or list A invites; before/after fixture digests equal. B demotion cannot inherit A chef role; selected inactive B yields null, no automatic A fallback; explicit active A reselect succeeds. Revocation happens before dispatch, not concurrently in-flight. |
| Actual route/tenant client/SDK preserve scoped object IDs, refuse foreign/demoted/inactive requests, own-context succeeds | Yes | PASS | 19 new tests: rehearsal delete, assignment delete, profile approval. Actual route/tenant client/SDK with simulated HTTP and verified Auth identity; every service read/write scoped to B, old A ID returns 404 with no write/push, demotion 403, inactive/null bootstrap fails closed (currently 500), own B success and query-failure refusal. Not actual Auth/REST runtime. |
| Source and clone baseline unchanged; exact clone removed; focused/root/diff/link gates and split commits | Yes | PASS | Final guarded runner passes connected SQL + 008/083/084 regressions and 15-table baseline/source equality; synthetic probe verifies fingerprint sensitivity. Focused 3 suites/62 tests; root lint/typecheck/101 suites/990 tests/service-worker/build PASS. Scoped self-review, bash syntax/local links/diff checks; commits split. Exact clone absent; outputs recoverably trashed; 33,270,848 KiB free. |
| Browser/Edge/Auth mail/file/device/hosted release and remaining mutation families | No; retained WF-013 step 5/6/8 gates | NOT RUN | Need exact local service runtime/resource preparation and separately authorized release |

Required FAIL/NOT RUN prevents this bounded backend checkpoint closing. Passing it does
not close F05/F13, certify all APIs or prove a new choir can onboard without operator help.

## Review, corrections and remaining boundaries

Self-review, not independent review. No production source, migration, native code,
dependency, hosted account/data/provider/push/deploy changed. One test-only verification
defect was caught in review: `query_to_xml(..., tableforest=true)` produces a row root,
but the first fingerprint used a table-root XPath. A tiny actual SQL probe proved 0 vs 1
XPath matches. Changed to tableforest=false, require all 15 hashes, and insert/remove an
exact synthetic clone-only choir to prove the final fingerprint changes and returns to
baseline. Re-ran the entire guarded SQL/regression/cleanup matrix successfully. Initial
fingerprint equality was not retained as final preservation evidence. A vacuous test was
also removed before the final focused/full gates; no production guard was relaxed.

Generated `.next` 467 MiB and coverage 348 KiB moved recoverably to
`/Users/alidiyarduran/.Trash/genovakorist-085-next-20260928` and
`/Users/alidiyarduran/.Trash/genovakorist-085-coverage-20260928`. Trash retains disk blocks.
No new VM/browser runtime; original PG restore retained. Only unrelated CLI marker stays dirty.

Important unaccepted boundaries, not new verified live failures:

- Privileged routes resolve membership/roles before later service-key writes. This matrix
  covers changes before dispatch, not changes between check and commit. Atomic permission
  revocation and partial profile/deletion writes remain open; inspect the actual route timing
  in `app/api/profile-change-requests/review/route.ts` and `app/api/rehearsals/delete/route.ts`.
- The three route representatives do not certify announcement/assignment updates, lock,
  attendance, tags, chat or file/upload compensation. Preserve 084's full inventory.
- Manual catalog/member-role fixture setup is not an implemented operator administration UI.
- 082's concurrency/rollback proof is historical; this run does not repeat or extend it.
- Browser, actual Auth/REST/Edge, email, protected files, device and release remain NOT RUN.

Next bounded owner checkpoint: prepare a measured, minimal disposable local service runtime
and prove one real browser-to-server flow early, then extend the preserved two-choir matrix.
Use installed Chrome and existing source/tooling; obtain image/VM peak-size evidence before
downloads. No real-account fallback, provider writes or blanket release authority. Full
WF-013 checkpoint 5 stays PARTIAL until its complete product and remaining mutation gates pass.
