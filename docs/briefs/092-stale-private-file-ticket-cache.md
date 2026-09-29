# 092 — reject stale private-file tickets after tenant cache clear

Status: COMPLETE LOCALLY / 29 September 2026 / primary agent, single writer.
Code/test commit `b0fe523`; records are a separate planning commit.

## Outcome and work card

One observable result: a protected web/WebView file-ticket request started under choir A
cannot return or cache its URL after tenant cleanup invalidates A, even if its response
arrives late. This closes a client-side race across the repertoire, assignment, review,
comment, chat and legacy protected-link helpers. It does **not** revoke an already issued
bearer URL on the server; [090](090-private-file-ticket-revocation-contract.md) remains the
separate owner decision and implementation gate.

Actions: (1) reproduce a held ticket response that resolves after `clearProtectedDriveFileUrlCache`;
(2) add one generation guard around the common cache/read boundary and targeted six-family
regressions; (3) run focused and root gates, self-review, cleanup and split commits. Exit
only when every required criterion below passes.

## Transition start and scope

Read `AGENTS.md`, [handoff](../agent-handoff.md),
[active context](../../memory-bank/activeContext.md), [guide](../gecis-rehberi.md),
[delivery controls](../mobil-teslim-plani.md#bounded-execution-and-resource-controls),
`MIGRATION.md`, decision #29, [090](090-private-file-ticket-revocation-contract.md),
[091](091-connected-private-r2-read.md), current `lib/drive-file-url.ts`, AuthProvider,
EmbeddedWebBridgeProvider, native score/audio gateways and existing URL tests. Verified
HEAD `1898bd0`; only unrelated `supabase/.temp/cli-latest` is dirty and stays unstaged.
Native PDF/audio already invalidate in-flight work at tenant clear; this brief targets
web and embedded WebView URL generation, not a native redesign. Same URL response format,
current Auth checks, all file-family endpoints and offline behavior remain unchanged.

Allowed production/test paths: `lib/drive-file-url.ts`, `lib/drive-file-url.test.ts`.
Allowed records: this brief, handoff/active/progress and narrow WF-013/plan status links.
No server/DB/provider/native changes, hosted writes, real account/data, push/deploy,
credential operation or new revocation contract. No subagent in the shared tree.

## Resources, risk and rollback

No new VM/provider/download. Reuse installed root dependencies; latest measured free
31,404,788 KiB, above the 10 GiB floor. Focused test allocation is small; full `pnpm
check` may create ~0.5 GiB `.next` plus coverage, estimated <1 GiB additional peak.
Move only owned generated build/coverage recoverably to exact Trash targets after tests.
The only state change is local source/tests and commits; rollback is the code commit revert
and separate evidence correction. A cache clear intentionally invalidates pending responses;
callers receive a tenant-change error and must request a fresh ticket in the new context.
No claim about stopping an already-open stream, removing downloaded offline bytes or
revoking the old signed URL at the service.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Date / environment / evidence and limit |
|---|---|---|---|
| Reproduce late A ticket response after tenant cache clear before production edit | Yes | PASS | 29 Sep focused RED: 1/10 failed because the held response returned `ticket=old-a` after clear; 9 existing cases passed |
| Repertoire and all five other URL families reject late response without cache repopulation; new context can issue fresh ticket | Yes | PASS | 29 Sep `b0fe523`: six held-response cases reject old URL with tenant-change error; a subsequent call obtains `fresh` and makes a second HTTP request. One pre-session-resolution case rejects without any HTTP request. Synthetic fetch responses only, not actual Auth/Edge |
| Existing same-user cache hit, other-user separation, expiry and session checks preserved | Yes | PASS | Focused `pnpm exec vitest run lib/drive-file-url.test.ts`: 1 file/16 tests; preexisting nine cases still pass |
| Root `pnpm check`, scoped self-review, resource cleanup and separate code/record commits | Yes | PASS | 29 Sep: lint/typecheck, 103 suites/1049 tests, service-worker syntax and Next production build PASS. Only `lib/drive-file-url.ts` and its test in `b0fe523`; no RN source. Generated `.next` 477,432 KiB and coverage 348 KiB moved recoverably to exact `genova-092-20260929-*` Trash targets. Final free 30,925,652 KiB, above floor; Trash retains blocks. Self-review only |
| Real Auth/Edge/browser/provider/Android phone and 090 online GET/HEAD revocation | Later separate gates | NOT RUN | These cannot be inferred from a unit cache race |

Required FAIL or NOT RUN keeps 092 open. Self-review is not independent review.

## Result and limits

The shared web/WebView helper now captures a cache generation **before** reading the Auth
session and checks it before returning a cache hit and after the ticket request resolves.
Tenant cleanup increments the generation and clears existing URLs. A request still awaiting
the session or network response cannot repopulate or return its old URL; callers can retry
in the new context. Every existing file-family endpoint and response format is unchanged.
This is client hygiene, not a new authority source. AuthProvider and EmbeddedWebBridgeProvider
already invoke cache clear on context cleanup; their real browser timing was not rerun here.
An old URL already held by a caller or offline copy can remain usable until the service
contract changes; [090](090-private-file-ticket-revocation-contract.md) still requires the
owner's next-online-request decision. This test did not run actual Edge/Auth, R2, WebView,
Android, iOS, hosted or device checks. [091](091-connected-private-r2-read.md) is separate
historical local server integration, not proof of this new web cache path.

Two bounded source edits/tests only; no dependencies, hosted resources, provider credentials
or customer data changed. The unrelated `supabase/.temp/cli-latest` remains unstaged. Rollback
is code commit revert plus separate record correction; no live DB or file operation occurred.
