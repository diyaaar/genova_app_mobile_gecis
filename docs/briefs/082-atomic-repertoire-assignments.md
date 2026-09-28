# 082 — atomic, stale-safe repertoire assignment replacement

Status: COMPLETE LOCALLY, 28 September 2026. Single writer: main agent.
Code/test commit: `3fc2b23`; scope commit: `e18a885`.
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
| Old delete-then-insert and failed-load defect reproduced safely | Yes | PASS | Old source has separate DELETE/UPSERT; runner reproduces committed delete + failed insert on synthetic fixture; modal mock reports read failure and disables Save |
| Exact session/tenant/chef/target/role/part/input/refusal matrix | Yes | PASS | PG17 runner and SQL: A/B own/cross song, inactive actor/target, leader, blocked chef/section chef, duplicate/null/stale input, cross-part conflict; anon/service actual EXECUTE denial |
| Forced failure after delete preserves previous set; empty desired set commits intentionally | Yes | PASS | Trigger injects X8202 after internal DELETE; old row remains; empty set and restoration pass inside rollback-only test transaction |
| Two concurrent saves and stale/retry semantics | Yes | PASS | Two real PG sessions: first holds song row lock through commit, second waits then fails stale; exact two-row winner set; retry returns zero newly added IDs |
| Web modal failed-load refusal and API/RPC/push contract | Yes | PASS | 19 focused tests: failed members/assignments reads refuse Save; exact loaded snapshot sent; JWT invoker RPC; error mapping; no push on DB failure/retry; best-effort push failure. Real provider NOT RUN |
| Exact migration grants/prerequisites/down/reapply; source unchanged | Yes | PASS | `082` local runner: missing 078 and repeat-forward refusal, explicit grants, postgres creator, exact down/reapply, retained source fingerprint unchanged, disposable clone removed |
| Sibling website source impact and DB/client rollout order | Yes | PASS | Tracked `../genesinovachoir` source has no assignment writer/reader or RPC caller; shared project remains. Hosted/untracked/runtime consumers NOT RUN. Release DB migration first, then web adapter + refreshed modal; stale browser clients lacking expected set fail closed with 400 |
| Root `pnpm check`, relevant client gate, links/diff/cleanup/commits | Yes | PASS | Root lint/typecheck, 94 suites/927 tests/coverage, service worker check, Next production build; no mobile source changed; local links, `git diff --check`, bash syntax and split commits verified at handoff |
| Hosted DB/Edge/client/provider/real-account acceptance | No; separate release | NOT RUN | No live remediation claim |

## Outcome and release boundary

The split service-key route is replaced by one authenticated invoker-rights DB RPC. It locks the
song, validates active chef/tenant/targets/part conflicts, compares the loaded set and changes
only that part atomically. An exact retry is a no-op; notification is attempted only for newly
added targets after commit. The modal refuses incomplete reads and sends its loaded snapshot.
The new function has authenticated-only EXECUTE; historical direct-table write grants still
exist, so the lock contract covers this product writer, not arbitrary legacy/direct clients.

No hosted migration or web release was attempted. The old server route cannot call the new RPC;
the new route requires the RPC and old open browser tabs do not send `expected_member_ids`.
For release, review fresh exact-project backup/restore and both-project impact; apply DB first,
deploy web route/modal together, require browser refresh, then test live A/B authorization,
failures, concurrency and push. Rollback must coordinate app version with the function: the
provided down removes only the new function and never reconstructs already overwritten rows.
Browser E2E, hosted DB, real provider, native/device and rollout are NOT RUN.
The task-owned `.next` and `coverage` outputs were moved to distinct recoverable entries in
`/Users/alidiyarduran/.Trash`; only the unrelated `supabase/.temp/cli-latest` remains dirty.
Free space after the move: 34,945,696 KiB (the Trash move does not reclaim disk blocks).
