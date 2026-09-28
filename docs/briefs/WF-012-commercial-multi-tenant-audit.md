# WF-012 — Commercial multi-tenant architecture audit

Status: COMPLETE (audit deliverable only), 28 September 2026. Sole writer: main agent.

## Outcome and authority

Produce an evidence-backed commercial SaaS readiness audit and prioritized execution plan,
before further development. The owner's latest request pauses the pending 077 copy proposal.
Inspect all tracked repository areas, trace tenant/auth/onboarding boundaries and run existing
tests where safely possible. No implementation, deployment, hosted writes, credential changes,
real invitations or source media operations are authorized by this audit.

## Startup and work card

Read AGENTS.md, docs/agent-handoff.md, memory-bank/activeContext.md,
docs/gecis-rehberi.md, docs/ai-calisma-duzeni.md, MIGRATION.md, the relevant decisions and
delivery execution controls. Verified HEAD: 0bdf8a0. Existing unrelated dirty path:
supabase/.temp/cli-latest; preserve unstaged.

1. Map architecture and delegate bounded read-only evidence collection.
2. Independently challenge findings and execute sequential local verification.
3. Deliver the report, evidence boundaries and ordered remediation plan.

Allowed edits: this brief, docs/reports/2026-09-28-commercial-multi-tenant-audit.md,
and short repository handoff/context/progress links. Product code and tests remain unchanged.
Sub-agents may read and report only; no Git/file/runtime mutations and no delegation.
Main agent owns tests, artifact cleanup and final judgment. User explicitly requested useful
cheaper/faster delegated investigations; actual chosen models will be recorded.

## Resources and rollback

Initial free space: 37,053,092 KiB; floor 10,485,760 KiB. Reuse installed dependencies;
one heavy process at a time. Estimated test/build peak <= 2 GiB based on existing project
gates. Audit-owned generated paths: .next, coverage, test-results, playwright-report;
remove after last dependent check. No browser/runtime downloads or database restoration
without a verified bounded resource need. Inspect existing local PG17 restore read-only
before deciding whether rollback-only isolation tests can run there.
Report/record edits are reversible by a scoped follow-up commit. No product rollback needed.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Date/revision/environment | Evidence and limits |
|---|---|---|---|---|
| Architecture map precedes judgments | Yes | PASS | 28 Sep / 0bdf8a0 / source | Report section 1, before findings |
| Tenant, database, authorization, storage and configuration evidence | Yes | PASS | Source and safe local tests | Report F01-F14; hosted state not inferred |
| New choir onboarding and commercial lifecycle traced | Yes | PASS | Source | Report section 6; no real accounts/invitations |
| Existing web/mobile test execution and meaningfulness reviewed | Yes | PASS | Local | Root 90/797 and mobile 49/288 pass; browser limitations explicit |
| Explicit A-to-B isolation scenario attempted or limitation evidenced | Yes | PASS | Local PostgreSQL 17; synthetic claims/fixtures | Six baseline SQL suites pass; more tenant/file/chat tests; not real hosted Auth |
| Severity, evidence, fix and prioritized plan delivered | Yes | PASS | Report | No implementation |
| Local links, consistency, diff and scope verified | Yes | PASS | 28 Sep / document-only gate | Five files, 173 local links, zero missing; diff clean; unrelated marker excluded |

Required audit checks assess evidence collection, not production readiness. Product failures
and unrun acceptance layers remain open in the report; completing the audit does not accept SaaS release.

## Fresh evidence and investigation limits

- Read-only sub-agents: gpt-6-sol (DB/tenant evidence), gpt-6-sol (onboarding/quality),
  gpt-6-luna (test inventory). No child writes or test execution. Main agent independently
  checked security findings, executed all commands, wrote records and owns final judgment.
  No measured monetary savings claim.
- `pnpm check` with synthetic Supabase/build configuration PASS: lint/typecheck,
  90 files / 797 tests, coverage, service-worker syntax and Next production build.
  Coverage 90.37% statements / 97.1% lines is a selected-file allowlist, not whole-product coverage.
- Mobile `npm run typecheck && npm test -- --runInBand` PASS: 49 suites / 288 tests;
  SafeAreaView, punycode and npm configuration warnings remain non-failing.
- Local loopback PostgreSQL 17.11: verified dedicated `genova_068_test_restore`, 15,668,915
  bytes, 003-012 baseline. Six BEGIN/ROLLBACK suites 003/005/006/007/008/012 PASS.
  Synthetic inactive member retains tenant/chef/one protected row; protected INSERT succeeds.
  This expected-denial criterion is FAIL for product readiness; audit reproduction is complete.
- Disposable `genova_wf012_test_audit`: 19 current migrations applied as postgres with the
  restored default ACL and an owner-matched minimal Realtime schema/publication fixture.
  19 SQL packages attempted: 17 PASS, 043 FAIL (anonymous EXECUTE unexpectedly true),
  058 fixture setup failure. Proper 058 runner with 057 `setup_only=true` then PASS;
  the fixture failure is not classified as a product defect. Normal 043 runner under the other
  local creator PASS; this does not cancel the postgres/default-ACL grant failure.
- Existing 046 and 065 guarded forward/down/reapply runners PASS, source unchanged and
  clones removed. Actual Realtime socket/provider delivery remains NOT RUN; local wal_level
  cannot prove logical replication. No global PostgreSQL setting changed.
- Failed setup approaches: absent Realtime → 046 refused; skipping it → 048 prerequisite
  refused; synthetic Realtime without postgres schema ownership → permission denied.
  Source/catalog evidence explained each change; ownership-matched fixture allowed the chain.
  We switched to existing focused 046/065/058/043 runners for their own acceptance contracts.
- `pnpm test:e2e`: process FAIL, four API tests PASS, 26 browser UI cases cannot launch due
  to missing Chromium headless shell. Those UI behaviors are NOT RUN, not application failures.
- `pnpm audit --prod --audit-level high`: threshold PASS, one low @babel/core advisory,
  zero moderate/high/critical findings in that report. No dependency update performed.
- URL parser-only SSRF check accepts localhost/loopback/private/metadata addresses;
  no network request to those addresses or exploitation attempted.
- GitHub main freshly read at a13f696; source gap 213 commits / 565 files. Live web revision,
  current hosted grants, real email/signup/provider/device/load acceptance NOT RUN.
- Limited selected-pattern tracked secret scan: zero hits; file modes inspected without
  exposing values. Local secret permissions were not changed.

## Artifact lifetime and review

Audit-created .next (542,744 KiB), coverage (344 KiB), test-results (212 KiB) were moved to
macOS Trash after their final checks; recoverable there until user/OS disposal. All disposable
WF-012 local database copies were dropped; the two pre-existing restore databases remain.
No audit test server/process remains. Initial free space 37,053,092 KiB; post-test/pre-trash
36,492,808 KiB. Final free space and document link gate are recorded at handoff below.
No browser/SDK/runtime was downloaded. Original CLI marker remains unrelated and unstaged.
Sub-agent source review is real delegated evidence collection; final consolidation is main-agent
self-review, not an independent security certification. Product FAIL/NOT RUN rows remain open.

Final document review: all 173 local Markdown links across five owned files resolve;
`git diff --check` passes. Fresh official Supabase RLS and PostgreSQL 17 default-privilege
references corroborate the interpretation, not the hosted deployment state. Final measured
free space after Trash cleanup: 36,495,880 KiB, above the floor. Source/product files unchanged;
only the two new audit documents and three repository indexes are owned changes.
Delivery: document-only commit `WF-012: audit commercial multi-tenant readiness`;
no push, deployment, provider mutation or goal-completion claim.
