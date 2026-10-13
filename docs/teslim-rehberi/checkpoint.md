# Current checkpoint

Updated 13 October 2026. [Roadmap](../production-roadmap.md) ·
[Evidence](../reports/2026-10-13-production-baseline.md) · [AGENTS](../../AGENTS.md).

## Completed locally

- Instruction reset and private project-wide Jev access are complete (WF-018).
- Repertoire creation now allows correction after definite fresh rejection; uncertain
  insert/upload preserves retry identity and locks pending metadata immediately.
- Malformed legacy file tickets fail before network access; valid-format tickets still
  require Edge authorization. GET/HEAD refusal contract is covered.
- Baseline: mobile types + 57 suites / 465 tests; desktop/mobile browser 38 scenarios pass.
  Web lint/types/1,234 tests/coverage/SW/production build pass. No native runtime or hosted-flow pass implied.

## Active: compatible service release

Correct-project read-only metadata: 68 migrations, 21 active Edge functions, seven
required public RPCs still missing. Remote main verified at `a13f696`; local entry was
407 commits ahead. Prepare a coherent DB/Edge/client release, not an unexplained bulk push.

## New acceptance: five-family managed runtime

[13 October result](../reports/2026-10-13-five-family-managed-acceptance.md): 219 actual
local HTTP observations across all five families PASS. Full restored 17-group / 101-table /
2,880-row baseline, exact eleven deltas and ten SQL controls PASS. Real Auth/REST/RLS,
all three transaction-overlap dimensions, explicit audio/hidden review and in-flight
stream boundary accepted. Final audit completed before cleanup; VM and ten ephemeral
secret files removed, protected source retained. Thirty-one focused helper tests PASS.
The old download-capacity blocker and unexecuted harness gaps are closed for this attempt.

## Next release boundary

[Concrete package](../production-release-package.md) pins product `9d1f1a7`, 363 product
files, eleven SQL deltas and nine Edge closures. Fresh source-based RPC inventory covers
38 required names; seven absent. Fresh nine-Edge inventory finds six real source
changes and three absent functions. Preserve explicit gateway settings and the default
true for drive-manager-v2/link-preview; no blind no-verify-JWT flag.

Next: fresh protected target cutoff/recovery comparison, complete package integration/
review, then the exact authorized DB → Edge → current web transition. No bulk migration
push, source-history rewrite, repeated old runtime attempt or another roadmap. Hosted
writes/publishing retain applicable authorization; local implementation remains authorized.

## Still open

Historical uncertain-song draft reconciliation; current backend/client compatibility,
recovery and storage transition; independent-choir operational flows; missing native
annotations/sync, homework/home, push; commercial seat/lifecycle rules and release/store
acceptance. The roadmap preserves these outcomes. No hosted mutation or deployment yet.
