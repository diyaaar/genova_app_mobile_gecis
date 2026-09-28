# 079 — deterministic message-status RPC execution privileges

Status: COMPLETE LOCALLY, 28 September 2026. Main agent single writer.
One result: only authenticated callers and the function owner may execute the message-status
RPC, regardless of restored Supabase defaults or migration creator.
Source: [WF-012 F03](../reports/2026-09-28-commercial-multi-tenant-audit.md),
[remediation plan](WF-013-multi-tenant-remediation-plan.md).

## Startup/work card

078 is locally accepted at product `8692304`; live 078 remains NOT RUN.
Read same AGENTS/guide/work-cycle/delivery controls and decisions as 078; reread actual 043
migration/test/runner/rollback and PG default ACL catalog. Original 043 runner's local creator
differs from postgres; do not edit 043 history or suppress its privilege assertion.
Only unrelated CLI marker is dirty; preserve it. Local implementation authorization unchanged.
Next: reproduce 043 failure as postgres; add a forward ACL-only migration with exact local down;
run old 043 matrix and new ACL/078 regression with creator fidelity, then record/commit.

Allowed: new 079 migration/rollback/test/guarded runner and documentation indexes only.
No UI/client/API/body/schema contract changes. Keep room/tenant/live actor checks inside 043.
Do not change global default ACLs or rely on service-role bypass to authorize this user RPC.
Non-owner service_role execute is not required by existing callers (web/native use user sessions).

## Resources and release boundary

35,977,132 KiB free. One <100 MiB disposable PG17 clone `genova_079_test_local` reusing 068
restore; no new dependencies, builds, runtime/browser downloads. Remove clone after checks.
Source/row hashes and original function body/ACL/comment/owner captured without printing data.
Apply 041/042/043 prerequisites and 078 on the clone as postgres. Original 043 must fail grants
before 079 and pass its complete behavioral matrix after 079. Keep original applied SQL immutable.
Run a second creator configuration sequentially, not a second simultaneous runtime.
079 down intentionally restores old effective grants; hosted rollback is unsafe by default and
needs explicit approval, with forward recovery preferred. No data migration/deletion.
Shared website source has no caller found, but hosted release still needs fresh backup/restore,
both-project dependencies/effective-grant read and exact DB -> dependent client rollout checks.
Retained 068 backup is a local rehearsal input, not automatic current production backup.

## Mandatory acceptance

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Old 043 grant assertion fails with postgres + restored defaults | Yes | PASS | 28 Sep runner: exact `043: RPC privilege boundary is wrong` before 079 |
| 079 effective privileges: authenticated yes, anon/service_role/PUBLIC no | Yes | PASS | Catalog and actual denied calls; authenticated cannot delegate EXECUTE; original 043 matrix passes |
| Existing 043 read/write/room/tenant/idempotence matrix and 078 revocation regression | Yes | PASS | Original full 043 and synthetic 078 SQL; fixtures rolled back in both modes |
| Forward/down/reapply exact ACL/body/owner/comments and unchanged data/source | Yes | PASS | Both postgres and existing desktop creator; injected prior grant option restored exactly by down |
| Repeat forward, missing prerequisite and unsafe target refusal | Yes | PASS | Runner assertions; unsafe target and non-loopback exit 2 before any connection/allocation |
| Script syntax, source/diff/self-review, local links, cleanup and separate commits | Yes | PASS | Bash syntax/diff; final source review and exact local links; both clones removed |
| Full web/mobile gate | No new client code; 078 exact source unchanged | PASS (historical same-day) | 078 804/290 plus build; no fresh rerun claimed |
| Hosted grants/migration/deploy/real socket/browser/device | No; separate authority | NOT RUN | Local acceptance only |

## Results / review / delivery

Product commits `462573f` and final `2810a3d`. Final SQL tests executed against the exact source
before the latter commit; no subsequent product change. Commands (local PG17.11):

- `bash supabase/test-support/079_message_status_rpc_privileges_runner.sh` — PASS.
- `GENOVA_079_CREATOR=local bash supabase/test-support/079_message_status_rpc_privileges_runner.sh` — PASS.
- Same runner with `PGDATABASE=postgres` and separately `PGHOST=example.invalid` — expected REFUSED/exit 2.
- `bash -n` and `git diff --check` — PASS; no build needed for SQL-only successor to 078.

The normal 043 test remains immutable and passes after 079 in the production-like creator
configuration where it failed in the audit. No global default privilege, role definition,
function body, policy or baseline row changes. Unknown ACL grantors/grantees fail preflight
for review rather than losing unexplained authority silently. Self-review added explicit
revocation of authenticated grant options, tested exact restoration of a prior grant option,
and pinned every runner connection to the validated CLI host/port.
This is self-review, not an independently performed security certification.

Both sequential creator runs remove their one disposable target; no 078/079 database remains.
Final free space before record-only handoff: 35,986,192 KiB. Source restores, backup and private
copy evidence remain deliberately unchanged. Only unrelated CLI marker remains dirty.
No hosted effective-grant read, DB migration, deploy/push, socket/browser/device/provider action.
Future release needs exact live prerequisites/grants, fresh backup/restore and explicit scope.
078's component/SDK tests are not actual browser/Edge/device runtime acceptance.
Next local checkpoint is URL-preview SSRF/resource bounds (F06); F02 public-media cutover/withdrawal
remains a critical separately authorized external operation, not fixed by these local changes.
