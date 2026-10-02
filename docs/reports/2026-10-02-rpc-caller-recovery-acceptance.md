# 090 — actual RPC caller execution on the fresh protected restore

2 October 2026. Entry e39ba60, source/test checkpoint **31483fd**; sole writer.
Previous goal turn was progress: restored the retained fresh snapshot again and actually
executed the missing caller-role boundary. This follow-up closes that NOT RUN row in
[R1](2026-10-02-hosted-revocation-r1-recovery-rehearsal.md), not the old-client gap or live release.
[Redacted evidence](090/2026-10-02-rpc-caller-recovery-evidence.json) pins this source layer.

## Scope and reproducible execution

No hosted export/write, website execution/change, real-user operation, new provider, push,
CI or deployment. Same protected1623637B backup, original SHA256
9b73831cda2809273e3f671031b35ab990707c3613f2c3ffb30ddba143f15cd2.
Private artifacts remain0700/0600 outside Git; original historical evidence is unchanged.
Original genova_068_test_restore presence was freshly verified after this rehearsal.

The cleaned runtime was recreated ONLY because actual callers were missing from the earlier
test. Exact same official PG17.6 image and pinned Ubuntu minimal base; one2CPU/2GiB VM,
8GiB virtual disk, offline PG container networkNONE/no mounts/no ports. Before restore,
offline-only supautils installer override was disabled/reloaded as already causally justified
in R1. No live configuration change; original dump never altered.

Commands, from repository root after explicit isolated runtime setup:

```
node supabase/test-support/090_isolated_rehearsal.mjs --fresh-role-execution-repeat
node supabase/test-support/090_role_rehearsal.mjs --fresh-role-execution-repeat
node supabase/test-support/090_rpc_caller_rehearsal.mjs --owned-offline
node --test supabase/test-support/090_hosted_recovery.test.mjs supabase/test-support/090_legacy_release_contract.test.mjs
pnpm check
```

Repeat helper actions refuse existing target databases and historical output overwrite;
they do not drop old private evidence or connect to a hosted fallback. Restore counts passed
15:05:26UTC. Non-secret32roles/22memberships/six extension versions AND owners matched
15:05:49UTC; fresh078/005/012/090 fixtures then passed again. Role metadata remains the
later R1 catalog, not the earlier consistent row snapshot. Recovery exclusions remain unchanged.

## Actual execution and challenge tests

Fixture explicitly verifies current_user after switching roles. Permission switches are
outside the exception trap, so a failed switch cannot count as a refused RPC. All five
families are called under anon and authenticated and must produce insufficient_privilege.
Service_role executes actual allowed, cross-actor/session/choir and unknown-family cases.
Original writer identity is restored before fixture mutations; all synthetic rows roll back.
[PostgreSQL SET ROLE](https://www.postgresql.org/docs/17/sql-set-role.html) defines the
permission-checked caller change; the fixture is not SECURITY DEFINER.

To challenge the test independently of its earlier has_function_privilege assertions, the
runner creates three IN-MEMORY fixture mutants that skip ONLY that earlier ACL predicate.
Each begins a disposable transaction: grant the complete callable path to anon/authenticated,
or revoke the wrapper from service_role. The actual invocation assertions must fail with
the specific expected error. Closing each failed psql connection rolls back those grants.
The unchanged full fixture runs again afterward to prove no permission mutant persists.
This is focused mutation testing, not an independent reviewer or a hosted PostgREST test.

| Criterion / expected result | Required? | Status | Evidence / limit |
|---|---|---|---|
| Same protected backup restored;23schemas/101counts | yes | PASS | New repeat summary15:05:26UTC; original artifact/hash retained |
|32roles/22memberships/six extension owner/version parity | yes | PASS | Repeat parity15:05:49UTC; source catalog is later than row snapshot |
|078 red→green and078→090/005/012 regressions | yes | PASS | Exact migrations and rollback-only fixtures on test clone |
| service_role actual family calls | yes | PASS |5 allowed +15 actor/session/choir refusals +1 unknown family refusal |
| anon/authenticated actual invocation | yes | PASS |5 SQLSTATE42501 refusals per role; caller identity asserted |
| Three permission mutants fail; unchanged fixture passes afterward | yes | PASS | Specific unexpected-execution errors for anon/auth; permission-denied for service |
| Baseline remains unchanged | yes | PASS |101 table counts still equal snapshot; migrations/tests use separate clone |
| Source/guard tests and root gate | yes | PASS | Node3/3, three changed helper syntax checks, scoped ESLint; pnpm check exit0,111files/1130tests/coverage/SW/build18:16 |
| Hosted Auth/PostgREST/HTTP/provider/client | not this layer; required later | NOT RUN | No transport/platform/phone acceptance implied |
| Legacy Next next-request revocation | required R1 | FAIL | Fresh source probe again GET200/HEAD200,provider2,authority0; reproduction PASS is product FAIL |
| Safe exact old-web renewal/cache/PDF/audio | required R1 | NOT RUN | Requires separately scoped production-source compatibility implementation |
| Cleanup, hash/modes and original068 preservation | yes | PASS | Container/VM removed18:15; private0700/allfiles0600/hash unchanged; native068 exists |

## Resource and cost boundaries

Entry22755340KiB free; observed16078428KiB before cleanup, above10GiBfloor. Task VM
6356004KiB allocated before removal, no second heavy process. Docker container and VM were
removed18:15:25–32Turkey; recovery is from retained backup, not a secure-erasure claim.
Exact newly downloaded, hash-verified Lima cache was moved to
`/Users/alidiyarduran/.Trash/genova090r1-lima-cache-20261002-1815` (1378420KiB du).
Direct rm-f-style shell deletion was rejected; used recoverable move, not another deletion
mechanism. It is NO LONGER an active cache, but still uses disk until Trash is emptied.
Fresh .next477928KiB/coverage352KiB moved to corresponding task-prefixed Trash paths;
no global Trash/cache purge. Final measured21002984KiB free; do not call those moves freed
space. VM/socket/root outputs absent. Pre-existing tsconfig.tsbuildinfo preserved.

TypeSafe skill keeps exact permission checks deterministic; current API/citation cookbook/model
docs refreshed, **no new inference call**. Incremental Jev cost$0. Prior R1 two-call estimate
$0.000097902 remains unchanged; not invoice/whole-day/Codex cost. No key persisted.

## Remaining decision and handoff

R1/090/active goal remain OPEN, release NO-GO. [Local compatibility proposal](2026-10-02-legacy-reader-compatibility-local-plan.md)
defines the new production-source package separately from the already approved recovery-only
paths. User approval requested; NOT presumed from the prior backup/restore approval.
No sibling website fix is pending. No new required criterion was removed to close this checkpoint.
Code/test31483fd and separate documentation commit form the handoff; no push.
Final record checks PASS:228 local links/4anchors across10 owned records; four current source hashes
match31483fd and nine historical hashes match93ca043;14-file exact-sensitive-value/key-format
scan, JSON/status/goal-open contract and git diff --check. No historical hash silently refreshed.
