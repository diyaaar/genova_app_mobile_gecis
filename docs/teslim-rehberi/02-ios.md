# P2 — Current iOS private-file acceptance

[Previous P1](01-candidate.md) · [State](checkpoint.md) · Next: [P3](03-release-package.md)

## Contract

One outcome: the latest candidate's protected-file user flow is proved on iOS by
the agent, with platform-specific limits explicit. Entry: accepted P1 manifest and
same-source Android evidence. Execution remains in [090](../briefs/090-private-file-ticket-revocation-contract.md).
Do not reopen unchanged Android scenarios just to repeat them; source/config changes
that affect Android do require focused regression.

Read the [Android full-flow acceptance](../reports/2026-10-03-android-full-share-flow.md),
P1 manifest, existing iOS tooling/source and resource controls. Prior iOS acceptance
predating the changed PDF/cleanup flow cannot close this result.

## Ordered work

1. Inspect installed simulator/automation tools and existing scripts. Record free
   disk, projected peak, owned targets and cleanup. One heavy build/runtime. Prefer
   supported Computer Use; use authorized existing simulator automation if necessary.
   An unavailable tool is an automation blocker, not a request for owner manual QA.
2. Build/run the exact guarded candidate against bounded synthetic local services;
   execute the matrix below with fresh UI and network/file evidence. No Google account,
   real recipient, real choir mutation or replacement memory-only secure store.
3. Fix only reproduced defects within 090's paths; rerun affected checks and final
   mobile gates. Record source identities, platform/build and limits, verify guard-off
   product behavior, clean owned output, hand the accepted candidate to P3.

## Required scenarios

| Scenario | Observable acceptance |
|---|---|
| Cancel consent | Return to profile; zero file GET/HEAD/provider bytes caused by cancellation |
| Confirm and read | Nonblank intended PDF, exact fixture size/hash, visible pages 1 and 2 |
| Share and return | Actual iOS share surface opens; dismiss without recipient; reader remains usable |
| Close | Reader closes; ephemeral file removal proved, not inferred from unmount |
| Active A → B | Switch using actual AuthStore while A profile is active; old A URL's next GET/HEAD denied; no provider read; old UI/cache cleared |
| Expired/revoked authority | Recoverable expired authorization follows the approved path; valid denial never bypassed or retried with broad credentials |
| WebView boundary | No persistent bearer/refresh credential leak; allowed lease/renewal, teardown and relevant storage checks tied to exact WebView candidate |
| Normal build | Inspection/test paths fail closed or are absent when guard is off; ordinary sign-in reachable |

Capture attempt status without rewriting earlier failures. The synthetic dispatcher
does not establish hosted RLS or full Next routing; those are P3/P4. A simulator is
not physical-device/stylus/background-audio proof; remaining hardware rows stay open.

## Acceptance and handoff

3 October: **ACCEPTED LOCAL P2**, [current evidence](../reports/2026-10-03-ios-p2-private-file-acceptance.md).
Required matrix passed with agent XCTest/Computer Use, current iOS26.5 signed Release,
real SecureStore, actual native PDF/share/cleanup/AuthStore and bounded synthetic ports.
All610 product pins unchanged; mobile465/focused26/root1178/build fresh; owned outputs
cleaned. Test fixture caching/selector/variant failures preserved, then retested.
This advances P3, not hosted/provider/full-web/hardware/beta or whole090/R1 acceptance.

Every row is recorded in 090 with date/revision/command/environment/evidence/limit.
New RN code: `npx tsc --noEmit && npm test` in `apps/mobile`; shared/web/build changes:
root `pnpm check`, plus affected runtime gates. Do not add a general test framework.
If no source change, reuse valid source gates and run the missing iOS integration.

Required failures keep P2 open. After two unsuccessful approaches, record cause/new
method; do not loop builds. Output: iOS evidence and updated candidate manifest with
precise invalidations. Remove owned build/runtime artifacts after final dependent
checks, preserve existing toolchains/user data. Acceptance advances checkpoint to P3;
it does not close whole 090/R1 or authorize a hosted release.
