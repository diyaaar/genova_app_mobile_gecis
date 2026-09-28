# 078 — active-membership revocation

Status: IN PROGRESS, 28 September 2026. Single writer: main agent.
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
| Negative SQL test fails on old source at inactive authority | Yes | NOT RUN | Synthetic BEGIN/ROLLBACK on disposable clone |
| Active single/multiple/session-isolated behavior and A→B refusals | Yes | NOT RUN | Actual PostgreSQL authenticated role/RLS, not doubles |
| Inactive selected/single member: NULL identity, no role/read/write/RPC; no implicit B fallback | Yes | NOT RUN | Include outsider and reactivation |
| Exact forward/down/reapply; repeat-forward/prerequisite/unsafe target refusal; source unchanged | Yes | NOT RUN | Applied as postgres with restored ACL defaults |
| Service bootstrap refuses inactive; shared contract rejects inactive current/preference | Yes | NOT RUN | Focused web SDK transport tests |
| Web/native resolved revoked context clears role/private state and cannot become ready | Yes | NOT RUN | Component/state-machine tests; not actual device |
| Root pnpm check | Yes | NOT RUN | Synthetic config; lint/typecheck/tests/SW/build |
| Mobile typecheck and full tests | Yes | NOT RUN | Installed product workspace; no device runtime change |
| Links/diff/self-review, cleanup/ownership and separate commits | Yes | NOT RUN | Self-review is not independent audit |
| Hosted DB/Edge/browser/device/provider/release | No, distinct approval/checkpoint | NOT RUN | No live security-fix claim |

## Results / failed approaches / delivery

Pending. Record real commands, limits, cleanup and commits here before closure.
