# 087 — authority-safe profile submission evidence

29 September 2026; product/test `9581ad7`, scope `ae677c3`. Main-agent self-review only.
Actual PG17/role/transaction evidence and actual Next/SDK simulated-HTTP evidence are separate.
No post-change browser/Auth/REST runtime, hosted provider, device or release acceptance.

## Reproduced defect and fix

The old verified-A → service-write sequence accepts a profile request after the target-local
member is deactivated. The actual service_role SQL insert succeeds (one synthetic request),
then the reproduction transaction rolls back. This is the same privileged DB write used by
the old route, not a claim that an old browser was rerun.

New authenticated-only `submit_profile_change_request` uses JWT uid/session, not supplied
identity. It locks the session choice and the member through commit, validates/locks own
references, snapshots member values and updates/inserts/cleans same-key duplicates atomically.
The Next adapter sends exactly one RPC with the verified caller token. No service fallback.
Permanent WebView/UI and `created`/`updated`/`unchanged` response contract are unchanged.

## Actual local SQL results

`bash supabase/test-support/087_profile_submit_runner.sh` PASS, final run after rollback-path
normalization to existing `supabase/rollback/` convention.

| Criterion | Result / evidence |
|---|---|
| Fresh local backup/restore | PASS: current LOCAL restore dump, same-cluster fresh DB; 15-table data, function definitions/owners/ACLs and public table policies/grants match |
| Old revocation gap | PASS RED: privileged insert persists after deactivation; synthetic reproduction rolled back |
| Own A/B, foreign references and stale context | PASS: direct authenticated RPC positives, A-school/department/song in B refusals, wrong expected choir PT409 |
| Missing/inactive/unselected/aliased session | PASS: 28000/42501 refusals; a single active member gets only authorized fallback; another user's choice cannot be reused |
| Normalization and snapshots | PASS: allowed 14 keys, invalid type/unknown filtering, null/trim/unchanged, same-key update, exact old-value snapshot; SQL/TS parity on eight samples including all keys and JS Unicode whitespace |
| Note length | PASS: 1201 ASCII and 601 astral characters rejected; DB limit counts UTF-16 units like form |
| Forced duplicate cleanup failure | PASS: update plus failed delete fully rolls back; after removing failure trigger, one pending request remains |
| Forced insert failure | PASS: profile digest unchanged and newly materialized fallback session also rolls back |
| ACL boundary | PASS: authenticated only; actual anon/service_role calls refused; private helper and direct authenticated insert refused; existing table RLS/grants unchanged |
| Down/reapply | PASS: only new RPC/helper/schema removed, exact original function owner/ACL/body and table policy/grant digests preserved; reapply matrix passes |
| Existing behavior regressions | PASS: original 005 active-choice and 083 new-choir/profile-reference SQL matrices after new RPC |
| Source and cleanup | PASS: original source 15-table/function/authority digests unchanged; exact target DB and private backup/log scratch removed |

Backup is not a current hosted-project backup. Role attributes are reused from the existing
local cluster; this does not certify restoring into a brand-new cluster or an unknown live state.
Fixture choirs/members/catalogs are manually synthetic, not newly accepted onboarding UI.

## Real concurrent transactions

Six matrices observe actual `pg_stat_activity` lock waits and exact final rows:

1. Revocation holds member first → writer blocks → after revocation commit, RPC 42501, no request.
2. Writer holds authority first → revoker blocks → authorized A request commits before revocation.
3. Same-session switch holds choice first → writer blocks → committed B choice yields PT409, no A request.
4. Writer holds choice first → same-session switch blocks → authorized A commit then B selection.
5. Distinct existing Auth-session claims, same member/field set → second waits on member; same request ID,
   `updated` result, one final request containing second draft.
6. Two first-use singleton-session claims → FK KEY SHARE remains compatible with member NO KEY UPDATE;
   actual member wait, both complete, one final pending request, no lock-upgrade deadlock.

These use SQL role/JWT settings, not real Auth tokens. Test administrator observes wait fields;
application users gain no statistics privilege. The initial observer failure was explained by a
controlled probe (`postgres` sees insufficient-privilege wait fields; local admin sees `PgSleep`).
No blind timing increase or product permission broadening was used to fix the test.

Revocation/switch semantics are commit ordering, not cancellation of already-authorized transactions.
Unknown legacy/service writers do not cooperate with the member lock. Concurrent member/choir
deletion may cause a deadlock victim; the adapter maps 40P01/40001 to retryable 409, not false success.
Deletion/retention policy and atomic chef review/approval are still outside this acceptance.

## Web gates and boundaries

Focused real Next handler/SDK simulated transport plus helper/form tests: 3 suites / 32 tests PASS.
Verified caller authorization header, one RPC/no table writes, sanitized payload/no forged identity,
success modes, missing-RPC 503, inactive 403, context/deadlock 409, invalid/foreign 400,
Auth 401, malformed-success 502 and no internal-error leakage. This is not real HTTP service proof.
Final `pnpm check`: lint/typecheck/101 suites/1004 tests/service-worker/build PASS.
No mobile source changed; no native/device gate claimed. Historical 086 real browser pass is not
post-087 evidence. WF-013 step 5 stays PARTIAL.

Source/public payloads contain synthetic IDs only; secret-bearing private backups/logs were
permanently removed with scratch cleanup. Owned `.next` 466 MiB, coverage 348 KiB and final
check log are recoverably in Trash. No `.env` file was copied inside `.next`. Source restore,
original configs/dependencies and unrelated CLI marker are preserved. Final free 34,144,992 KiB
(~32.6 GiB), above the floor; Trash retains blocks. No VM or new service runtime was created.

Next bounded checkpoint: atomic chef approval/merge with actor-role/target/request authority
and actual concurrent failure/rollback proof. Any live rollout separately needs current hosted
backup/restore and approved DB RPC → web revision order. Never drop RPC while adapter is live.
