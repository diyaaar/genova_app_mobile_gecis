# 078 — active-membership revocation

Status: COMPLETE LOCALLY, 28 September 2026. Single writer: main agent.
One result: an inactive choir membership must not authorize new tenant reads, writes, roles or
active-choir selection. [WF-012 F01](../reports/2026-09-28-commercial-multi-tenant-audit.md)
reproduced retained SQL read/write authority. [Execution plan](WF-013-multi-tenant-remediation-plan.md).

## Startup and work card

Read AGENTS, English handoff, activeContext, [guide](../gecis-rehberi.md),
[work cycle](../ai-calisma-duzeni.md), brief template, delivery execution controls,
KARARLAR #9–11/#16/#18/#28–31, MIGRATION shared-auth boundary, 005/012 definitions,
tenant-client, Drive actor bootstrap and both clients' membership selection/tests.
Checkout main / 11b9e90; only unrelated `supabase/.temp/cli-latest` is dirty and stays unstaged.
Owner's latest request permits local implementation; no external or real-account operations.

Next three actions: reproduce negative matrix; implement forward-only authority/client repair;
run local SQL rollback/reapply, focused and full client gates, then record/commit separately.
Exit: required local criteria below PASS; hosted/device release remains explicitly excluded.

## Scope and preserved behavior

- New 078 migration and matching rollback/test/guarded local runner; do not edit applied 005/012.
- `lib/choir-context-core.ts` and tests: validate all rows before excluding inactive choices.
- `lib/server/tenant-client.ts` and tests, `supabase/functions/drive-manager-v2/index.ts` actor guard.
- Web AuthProvider and focused tests; native auth-store and tests only for revoked-context teardown.
- Docs brief/plan and relevant handoff/active/progress indexes; separate document commits.

Keep Auth identity separate from choir membership, multi-choir users, live JWT session choices,
single eligible membership compatibility, narrow RPC shape and annotation schema unchanged.
An existing session selection that becomes inactive returns NULL, not a silent DB fallback to
another choir. A new/unselected session may fall back to exactly one active membership.
Inactive membership rows may remain visible in the caller-only listing for compatibility;
they are not usable choices. UI checks are defense-in-depth, never the authorization layer.
Requests already authorized/in flight, existing bearer-file tickets, offline copies, remote
Realtime disconnects and deletion/role-admin policy are separate outcomes, not promises here.

## Resources, rollback and rollout

Preflight: 36,484,200 KiB available; existing PG17 restore databases about 15 MiB each.
Reuse installed tools/dependencies; no browser/SDK downloads. One disposable clone
`genova_078_test_local` (<100 MiB) and one heavy test/build at a time; estimate <2 GiB added peak.
Owned `.next`/coverage are removed recoverably after final gate; runner drops only its verified
new target. Preserve both source restore DBs, private 068 backup and 071–076 copy evidence.
Local migration uses a clone of 068's independently restored backup and synthetic rollback fixtures.
The retained backup is not a fresh production backup for a later deployment.

Shared website DB impact: website public/contact data is outside tenant tables; no table columns,
Auth accounts or member rows change. Choir helpers change globally; current active users retain
the same contracts. Hosted release requires fresh exact-project backup + restore acceptance,
both-project helper dependency check and DB -> Drive Edge -> web/native order.
Down restores exact prior function definitions/comments/ACLs only on isolated/approved target;
it deliberately reopens the old security bug, so hosted incident recovery prefers forward repair.
Git revert does not roll back DB. Hosted state is NOT RUN and not part of local completion.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? | Status | Date / environment / evidence |
|---|---|---|---|
| Negative SQL test fails on old source at inactive authority | Yes | PASS | 28 Sep: old clone fails exactly `inactive selected membership retains tenant authority`; fixtures rolled back |
| Active single/multiple/session-isolated behavior and A→B refusals | Yes | PASS | 078 runner actual PG17/authenticated RLS plus original 005/012 matrices |
| Inactive selected/single member: NULL identity, no role/read/write/RPC; no implicit B fallback | Yes | PASS | 078 SQL includes inactive single/all, outsider, B session, role borrowing and reactivation |
| Exact forward/down/reapply; repeat-forward/prerequisite/unsafe target refusal; source unchanged | Yes | PASS | Postgres/default ACL runner, exact definitions/comments/owner/ACL hash; loopback/target refusals exit 2 |
| Service bootstrap refuses inactive; shared contract rejects inactive current/preference | Yes | PASS | Focused real SDK transport refuses false/null/missing; query includes active filter. Drive guard source reviewed, entrypoint runtime NOT RUN |
| Web/native resolved revoked context clears role/private state and cannot become ready | Yes | PASS | Component/browser-mode and native state-machine tests; no device/Realtime revocation timing claim |
| Root pnpm check | Yes | PASS | 28 Sep: lint/typecheck, 90 files/804 tests, SW syntax and Next build; synthetic configuration |
| Mobile typecheck and full tests | Yes | PASS | 28 Sep: npx tsc --noEmit and npm test -- --runInBand, 49 suites/290 tests |
| Links/diff/self-review, cleanup/ownership and separate commits | Yes | PASS | Owned diff self-reviewed; exact local links checked; generated build/coverage moved recoverably to Trash |
| Hosted DB/Edge/browser/device/provider/release | No, distinct approval/checkpoint | NOT RUN | No live security-fix claim |

## Results / failed approaches / delivery

Implementation: `8692304`; startup documentation: `759ed61`. Full gates ran against the exact
product changes before the product commit; subsequent work is documentation only.
Focused root three files/42 tests PASS; native auth-store 35 tests PASS.
Commands: `bash supabase/test-support/078_active_membership_revocation_runner.sh`;
`pnpm exec vitest run lib/choir-context.test.ts lib/server/__tests__/tenant-client.test.ts
components/AuthProvider.embedded.test.tsx`; mobile gates above; root `pnpm check` with
example.supabase.co/test-only public/service/Gemini keys and local APP_URL overrides.
No provider endpoint or real account is exercised by those overrides.

Two initial runner issues were reassessed, not retried unchanged: local postgres is not superuser
and the clone belonged to the desktop role, so CREATE SCHEMA lacked database authority; creating
only the disposable clone with owner postgres fixes fidelity without global grants. The existing
push RPC rejects missing identity using SQLSTATE 28000, not 42501; the negative assertion now
checks its real documented authorization error. Product rejection was already correct.
Self-review caught and repaired a misplaced cache-clear block before final focused/full gates.

Source sibling website search found no tracked TS/JS/SQL callers of the changed helper RPCs;
this is source evidence, not hosted dependency acceptance. Shared DB release remains gated.
No old migration, membership row, annotation contract, infrastructure or dependency changed.
Current-session revocation applies to newly evaluated authorization; cached/offline media,
old bearer tickets and already-authorized in-flight requests remain separate security boundaries.
The native token-refresh preserve-ready path is unchanged; server authority is rechecked on data
requests, and UI teardown here is verified when choir context is explicitly re-resolved.

078 clones removed. Generated .next 476,676 KiB and coverage 344 KiB moved to macOS Trash,
recoverable until owner/OS disposal. Actual remaining free space: 35,977,132 KiB; Trash is not
claimed to immediately reclaim disk. Existing source DBs/backup/copy journals/dependencies remain.
Only unrelated `supabase/.temp/cli-latest` stays dirty. No push/deploy/hosted/provider/device action.
Next independent local outcome: 079 exact message-status execution grants.
