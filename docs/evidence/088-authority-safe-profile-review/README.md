# 088 — atomic authority-safe profile review evidence

29 September 2026. Scope `7983d91`, product/test `c16c783`; main-agent self-review only.
Actual local PG17 transactions and actual Next/supabase-js simulated HTTP are separate layers.
No updated real browser/Auth/REST, push provider, device or hosted release claim.

## Reproduction and contract

`088_old_profile_review_defect.sql` reproduces the former service-key write order: remove chef
role after the imagined precheck, privileged request becomes approved, force member failure and
force compensating reset failure. Actual rows show approved request + unchanged member + absent
role. Reproduction rolls back; this is SQL reproduction, not rerunning the old browser.

New `review_profile_change_request(uuid,text,text)` derives caller uid/session/current choir,
locks authorized session choice, actor/target members in UUID order, assignment/role definitions
and pending requests in created_at/id order shared with 087. Rereads request target/status after
waiting. Only locked active actor + own-choir chef can decide. Approved values and decision are
one transaction; snapshots use review-time values. Existing API is now one caller-token RPC;
no service client/table mutation/compensating reset fallback. UI remains permanent WebView.

Approve requires active target; reject can resolve inactive/corrupt requests without updating
member. Earlier-created overlapping pending drafts block both actions. Equal timestamps retain
old behavior (not a new total-order product rule). Allowed 14 fields/trim/null normalization reuse
087; approval revalidates own school/department/song and uses static typed member update.
Case/diacritic/Unicode-trim chef names and the existing DB mojibake chef alias are supported;
part-leader is refused. No payload reviewer/member/choir authority.

## Actual database evidence

Final `bash supabase/test-support/088_profile_review_runner.sh`: PASS.

| Criterion | Result / boundary |
|---|---|
| Fresh LOCAL backup/restore | PASS: existing LOCAL source freshly dumped/restored, 15-table data/function definition-owner-ACL/public table-policy-grant equality; not hosted freshness or a new-cluster restore |
| A/B independence | PASS: own A and B approved values only, A request under B selection PT404, B-only chef role does not authorize A |
| Session/authority | PASS: missing/stolen session 28000; inactive/unselected actor and removed/non-chef role 42501; singleton authorized fallback only |
| Changes/snapshots | PASS: all 14 fields/date/own reference IDs/null/trim; forged auth/is_active ignored; review snapshot reflects member change since submission |
| Reject | PASS: trimmed reason and snapshot/status, no member mutation; inactive and malformed-date drafts can be rejected |
| Invalid data | PASS: foreign school/department/song, missing/malformed UUID, array/empty/invalid-type draft 22023, malformed date 22007; status stays pending |
| Length/ordering | PASS: 1201 ASCII/601 astral reason refused with UTF-16 limit; older overlaps refuse both actions; disjoint/equal-time behavior retained |
| Atomic rollback | PASS: forced status failure after member update restores complete member row + pending request; first-choice session also rolls back; BEFORE-trigger skipped member/status updates raise 40001 and roll back |
| ACL/down/reapply | PASS: explicit authenticated-only definer with empty search_path; actual anon/service calls denied; repeated migration refused; down removes only new function and restores old function/table authority digests; reapply matrix passes |
| Regressions | PASS: original 005 active-choice, 083 own profile references and 087 submit SQL after 088 |
| Source/cleanup | PASS: original source data/function/authority digests unchanged; owned DB/scratch removed |

Twelve independent-backend matrices observe actual held locks/waits and exact final rows:

1. Role deletion first → review waits then 42501, pending request/unchanged member.
2. Review first → role deletion waits; approved member + decision commit before removal.
3. Role rename first → review waits then 42501, no decision/member change.
4. Actor deactivation first → review waits then 42501, no decision/member change.
5. Target deactivation first → review waits then 22023, no approval/member change.
6. Same-session choir switch first → review waits then PT409, no A decision/member change.
7. Review first → switch waits; authorized A decision commits before B selection.
8. Review first → actor deactivation waits; authorized decision commits first.
9. Review first → target deactivation waits; authorized decision commits first.
10. Two sessions double-decision → first approval commits; later rejection waits/refused PT409.
11. 087 submit first → approval waits and applies the latest merged draft, not stale values.
12. Review first → 087 submit waits and creates a new pending request, leaving decided history intact.

SQL JWT claims are not real Auth tokens. Existing local administrator only observes wait fields;
application roles gain no statistics grant. Concurrency guarantee covers these cooperating RPCs,
not unknown service/direct writers. Delete/cascade can cause a deadlock victim, mapped to 409.

## Web gates / review / limits

Focused final four suites / 78 tests PASS:
`pnpm exec vitest run app/api/profile-change-requests/review/route.test.ts app/api/profile-change-requests/submit/route.test.ts app/api/object-anchored-tenant-boundary.test.ts lib/profile-change-requests.test.ts`.
Six old profile-route representative criteria moved to the new RPC suite; other representative
routes remain. Actual caller token/SDK endpoint and payload verified, forged authority ignored,
uppercase ID canonicalized, old camel-case response preserved, invalid input/Auth/errors/no
fallback/malformed backend replies checked. Push runs only after validated success, only for
committed target; provider failure does not reverse decision or leak diagnostics. Delivery remains
best effort, no outbox/exactly-once/retry guarantee and no provider acceptance.

`pnpm check` PASS: lint/typecheck/102 suites/1036 tests/service-worker/production build.
No RN changes: native gate N/A. Self-review covered lock order, role-definition changes, tenant
binding recheck, reference/type normalization, skipped-update row counts and aftercommit push.
The cohesive transaction exceeds the function review signal; no unrelated helper/service refactor
was introduced. SQL tests were extended for skipped updates/session rollback during review;
the full final runner then passed. Uppercase ID canonicalization passed final focused/root gates.

WF-013 step 5 remains PARTIAL; historical 086 browser evidence is not 087/088 browser acceptance.
Next coherent checkpoint: real local two-choir browser/Auth/REST submit → chef approve/reject flow
using both updated RPCs, before additional mutation families. No live rollout implied: require
current hosted backup/restore, sibling impact and explicit 087→088 DB then web release authority.
Keep helper/RPCs available through web rollback; dropping functions never reverses user data.

## Artifact lifetime / ownership

Final owned DB/test backends count zero; `spike/088-private-*` sensitive fresh dump/logs removed
permanently by guarded runner trap. Original restore, retained backups/configs/dependencies and
other tasks' private evidence preserved. No VM/runtime/browser install or service created.
Root build 477,424 KiB (~466 MiB), coverage 348 KiB, check log 8 KiB moved recoverably to
`/Users/alidiyarduran/.Trash/genova-088-20260929-next`, `...-coverage`, `...-check.log`.
No `.env` file existed in build. Final free 33,644,096 KiB (~32.1 GiB), above floor; Trash retains
blocks. Only unrelated `supabase/.temp/cli-latest` remains unstaged. Sources contain synthetic
IDs only; no credentials/real rows included in public records. Scoped 54 local links/diff checks
pass; no private-key/secret-key/JWT value patterns in 15 owned records/sources.
