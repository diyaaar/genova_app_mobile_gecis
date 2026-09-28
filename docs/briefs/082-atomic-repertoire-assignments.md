# 082 — atomic, stale-safe repertoire assignment replacement

Status: IN PROGRESS, 28 September 2026. Single writer: main agent.
One result: a chef saving one song/part assignment scope cannot lose its prior set on a failed write,
and a stale editor cannot silently replace another completed save.
Source: [WF-012 F04](../reports/2026-09-28-commercial-multi-tenant-audit.md),
[WF-013](WF-013-multi-tenant-remediation-plan.md). Owner approved local work; no hosted write.

## Startup and exact scope

Read AGENTS, handoff, active context, delivery controls, transition guide, work cycle, template,
KARARLAR/MIGRATION assignment guidance, route/modal, 003/005/078 tenant auth, role/RLS and schema.
Use Supabase and Supabase Postgres skills: their current docs/security/locking guidance informs an
invoker-rights RPC with explicit EXECUTE grants and one transaction; actual local tests decide pass.
Verified `main`/`f29d4a8`, only unrelated `supabase/.temp/cli-latest` dirty. Existing PostgreSQL
17.11 loopback restored 068 database plus private dated backup are retained, not fresh evidence of
today's hosted state. Both app and `genesinovachoir` website use the same Supabase project:
database function/grant changes require sibling-site impact check and DB → server/client release
order. This brief authorizes isolated local clone only; before any hosted migration, obtain a fresh
exact-project backup, restore proof, two-project review and separate rollout/rollback approval.

Current route `app/api/repertoire/assignments/update/route.ts` checks chef/targets with service
client but issues separate DELETE and UPSERT. Part-specific assignment changes can also collide
with global UNIQUE(song_id,member_id). The modal swallows Supabase read error fields and renders
an empty selection, which can be saved as a destructive empty replacement. No product row changed
in this inspection.

Allowed: new forward-only 082 migration, exact rollback/test/runner under `supabase/`; existing
web route, modal and focused tests; brief, WF-013, handoff/active/progress. No new Next route or
unrelated refactor. Existing endpoint remains the web compatibility boundary; native does not
gain a new web dependency. New mutation logic belongs in a single DB RPC invoked with the caller's
JWT, not the service role. Original migration/fixtures are not rewritten.

Work card: (1) reproduce old destructive sequence and write contract/negative tests;
(2) implement and exercise the RPC + web integration in an isolated PG17 clone;
(3) full required gates, rollback/reapply, two-project source check, cleanup and handoff.
Exit: every required acceptance row PASS. Scope is one song/part set, not all assignment features.

## Contract and boundaries

- The active choir and active chef are resolved in the DB from the caller JWT/session. Song and
  targets must belong to that choir, targets must be active and cannot be chef/section chef. No
  client-selected choir, owner or privileges. RPC grants only authenticated; no PUBLIC/anon/service
  execution. If invoker rights do not support the existing RLS and lock, reassess rather than add
  definer privilege to hide the failure.
- The modal loads members and current scope successfully before enabling Save. It sends its exact
  loaded assignment IDs as an expected set. Transactional RPC takes a per-song lock, compares
  current and expected sets, and either commits exactly the desired set or raises a conflict with
  no changes. Exact desired replay can return success without duplicate notification.
- Validate duplicates/nulls/size/UUIDs and cross-part membership conflicts. A target already
  assigned to a different part is refused rather than silently moved by an UPSERT. A deliberate
  part move requires removing it from the prior scope first. Existing per-part/no-part behavior is
  otherwise preserved.
- Return only newly added IDs and title for post-commit push. Push failure must not roll back DB
  success; DB failure must not push. No notification before the transaction commits.
- Existing direct table writers do not coordinate on the new application lock; audited product
  write callers must route through the RPC. Revoke/rewrite of all legacy direct-write permissions
  is a separate rollout decision. No claim of global linearizability outside controlled callers.

## Resources / rollback / validation

Preflight free space 35,428,324 KiB. Existing retained local restore ~15 MiB; one disposable PG17
clone and root build/coverage estimated <1 GiB peak, above 10-GiB floor. No VM, simulator,
network/provider copy or new dependency. Preserve the source restore/private dump and 071–076
copy evidence. Remove only task-owned clone and generated .next/coverage after final checks.
Local down must remove only new function/metadata after verifying expected signature/grants;
Git revert is not DB data rollback. Live rollback needs a separate migration/application version
plan and must not restore stale overwritten assignment rows by assumption.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Old delete-then-insert and failed-load defect reproduced safely | Yes | NOT RUN | Source/mocked path, not real user data |
| Exact session/tenant/chef/target/role/part/input/refusal matrix | Yes | NOT RUN | Actual isolated PG17 with authenticated/anon/service roles |
| Forced failure after delete preserves previous set; empty desired set commits intentionally | Yes | NOT RUN | Actual SQL transaction test, not mock-only |
| Two concurrent saves and stale/retry semantics | Yes | NOT RUN | Separate local PG sessions / exact resulting rows |
| Web modal failed-load refusal and API/RPC/push contract | Yes | NOT RUN | Focused web tests; no real provider push |
| Exact migration grants/prerequisites/down/reapply; source unchanged | Yes | NOT RUN | PG17 clone, no hosted write |
| Sibling website source impact and DB/client rollout order | Yes | NOT RUN | Tracked source search only; hosted consumers unknown |
| Root `pnpm check`, relevant client gate, links/diff/cleanup/commits | Yes | NOT RUN | E2E/hosted/device separate |
| Hosted DB/Edge/client/provider/real-account acceptance | No; separate release | NOT RUN | No live remediation claim |

Results pending.
