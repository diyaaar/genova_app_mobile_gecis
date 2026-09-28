# 086 — two-choir real web acceptance

Status: COMPLETE LOCALLY for the bounded matrix, 29 September 2026.
Main agent is the single writer. Scope commit `a366c5c`; test/config commit `dbb0afb`;
the separate final records commit follows it (no self-referential hash).
Owner approved continuing the real-browser local-service checkpoint after 085.
One outcome: the real web product accepts invitations into two fresh unrelated choirs,
shows only the selected choir's profile/catalog and assignments, and refuses stale/foreign
requests through actual local Auth, PostgREST/RLS, Edge and Next routes.
WF-013 step 5 stays partial until its full preserved matrix passes.

## Startup / scope

Verified main / `3fa885c`; only unrelated CLI marker dirty. Refreshed handoff, active
context, WF-013, complete 085, delivery resource controls, current login/invite/profile code,
022 runner and browser/fixture patterns. AGENTS/guide/work-cycle/template and decisions
#16/#18/#28–31 were already read in the continuing session; preserve their boundaries.
Actual Chrome is installed; local PG17 restore exists; no Colima instance/local service remains.
Do not rebuild a full historical stack or use a real account to bypass absent services.

1. Prepare one bounded, unlinked disposable runtime: DB/Auth/REST/gateway/Edge only,
   schema-only source restore (no copied user/choir/content rows), exact 078/082 prerequisites,
   synthetic confirmed Auth identities and fresh 007 choirs. Prove a real browser/server flow early.
2. Expand invitation → selected profile → repertoire/assignment and stale/foreign/revoked
   scenarios, with exact database before/after checks. No response mocking for accepted flows.
3. Focused/full gates, review, redacted evidence, source/fixture verification, stop/remove owned
   runtime/build outputs, split source and record commits. Required failure/unrun stays pending.

Allowed: test/runtime sources `supabase/test-support/086_*`, `.gitignore` for exact owned
generated runtime exclusion, this brief/WF-013/handoff/active/progress and small redacted
`docs/evidence/086-two-choir-real-web/` evidence. Runtime is `spike/086-runtime`; context/profile
`colima-genova086` / `genova086`; project `genova-086-runtime`; loopback API 54381, DB 54382,
web 31086. No production code/schema repair without first recording a demonstrated defect
and bounded amended scope. Preserve operator-assisted v1 and native/WebView ownership.

No hosted DB/Edge/provider/credentials, real accounts, email delivery, file cutover, hardware,
CI/push/deploy, price/retention decisions, general-purpose framework or parallel writer.
Confirmed synthetic users bypass email delivery only; real signup/verification is NOT accepted.
Catalog administration remains manual fixture setup, not a delivered operator interface.

## Resource preflight and cleanup

Measured free 36,774,780 KiB (~35 GiB); dependencies reused (root 1.5 GiB/mobile 2.4 GiB).
Metadata-only registry checks: arm64 compressed postgres 364,337,612 bytes; Auth 24,986,909;
REST 152,398,777; Edge 378,113,351. Colima root image 332,354,401 compressed bytes from
official release metadata. Official `kong:2.8.1` arm64 is 48,524,280 compressed bytes;
the five service images total ~0.9 GiB, root image ~0.31 GiB. Pre-download metadata gate passes.
Use root disk cap 8 GiB + data disk cap 10 GiB, 4 GiB RAM, 2 CPUs, only the exact runtime
directory mounted read-only (Edge needs its function sources), no broad host-directory mounts,
no SSH-agent/config forwarding or default-context activation. These are caps, not actual usage.
Conservative additional allocation envelope: VM caps 18 GiB + host download/cache allowance
3 GiB + root build 1 GiB + private runtime/browser/logs 0.25 GiB = 22.25 GiB; projected free
~12.8 GiB remains above 10 GiB. Measure allocated bytes during setup and after phases;
stop allocation before the floor. No simulator/SDK/browser/dependency upgrade or full stack.

CLI 2.107.0/Colima 0.10.3/installed Chrome are reused. 022's Storage-specific CLI failure is
historical; Storage is excluded here, so no automatic CLI upgrade. ECR manifest rate limiting
and unavailable Docker Hub `supabase/kong` are metadata failures, not application failures;
resolve official gateway image metadata before download. Two guessed old CLI source paths
were 404; actual tagged tree locates source under `apps/cli-go/`, no repeated blind retrieval.

Last dependent checks own runtime, browser context and `.next`/coverage. Stop web/services,
drop synthetic runtime DB by removing only task containers/volumes/profile through their
tools. Check orphan VM allocation; preserve unknown/global caches and original local restore.
Remove secret-bearing ephemeral runtime files; recoverable move for derived build/evidence
outputs. Code rollback is test revision removal; no hosted DB/data rollback is implied.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limits |
|---|---|---|---|
| Metadata/resource/loopback guards, actual service runtime and source preservation | Yes | PASS | Five actual services; loopback-only host listeners before fixtures; original six-table digest unchanged after browser and at stop |
| Real product browser invitation acceptance and two separate memberships | Yes | PASS | Wrong-recipient 400/zero memberships; own A then B invitations through actual Auth/Edge/RPC; no response mocks; email delivery excluded |
| Selected profile/catalog/repertoire/assignment positive A/B controls | Yes | PASS | Actual UI options/Next 200/persisted own requests, own visible songs and isolated assignment reads; catalogs/manual synthetic readiness metadata labeled |
| Same-session stale/foreign object and pre-dispatch permission-revocation refusals preserve data | Yes | PASS | Delayed A form after B switch 409; foreign reference 400/exact profile digest unchanged; revoked selection null/read empty/write 500/digest unchanged. In-flight permission races remain unresolved |
| Root gate, scoped review/links/redaction, source/runtime cleanup and split commits | Yes | PASS | Final lint/typecheck/101 suites/990 tests/service-worker/build; shell syntax, local links/diff, zero retained ephemeral-secret matches; exact services/VM/disks/secrets removed, source preserved; split revisions recorded below. Self-review only |
| Protected files/provider, complete mutation inventory, actual devices/hosted release | No; retained WF-013 5/6/8 gates | NOT RUN | Never claim commercial readiness from this narrower browser matrix |

## Result / retained limits

Detailed dated [evidence](../evidence/086-two-choir-real-web/README.md) records actual layers,
causal runtime/test corrections and the final real matrix. Early real invitation-to-membership
flow passed before the expanded profile/repertoire/stale/refusal matrix. The first expanded
attempt exposed incomplete song fixtures, not a product defect; exact target identities/choirs
were verified before disposable volume reset and fresh single-use invitations reran successfully.
No production source/schema/native change. No hosted write, push/deploy, real user or provider call.

Observed IMPORTANT error-contract gap: `lib/server/tenant-client.ts` throws a generic error for
missing active context; `app/api/profile-change-requests/submit/route.ts` maps it to HTTP 500.
The real revoked-account browser POST fails closed and changes no profile data, but should
ultimately return an explicit authorization/context error (401/403/409 as appropriate).
This brief accepts data refusal only, not commercial error UX. Do not repair it by allowing
a fallback choir. The pre-check/service-write race and partial approval writes are separate,
more important open risks; do not equate this pre-dispatch test with an in-flight transaction.

The original-source six-table digest covers users/choirs/members/repertoire/invitations/active
sessions, not all source tables. Catalog provisioning/role bootstrap is still privileged test
setup. Assignment creation is an authenticated founder RPC, not modal UX. Pending profile
requests are accepted here; approval/merge, all mutation families, files and devices are not.
WF-013 step 5 remains PARTIAL, preserving all wider criteria.

## Cleanup / next checkpoint

Next server stopped; Supabase exact task containers/volumes stopped with `--no-backup` after
source comparison; loopback tunnel closed; `colima delete genova086 --data --force` removed
profile, VM and its data disk. Confirmed no task context/profile/orphan disk or listeners on
54381/54382/31086. Exact secret-bearing `spike/086-runtime` permanently removed (synthetic
identities/tokens intentionally unrecoverable); original restore/configs/dependencies/global
caches preserved. `.next` 492 MiB and coverage 348 KiB moved recoverably to Trash; no copied
`.env` file existed in `.next`. Final measured free 36,245,476 KiB (~34.6 GiB), above the
10 GiB floor; Trash still retains derived-output blocks. Global caches were not purged.

Recommended next bounded outcome: make the profile request write authority-safe at commit,
then profile approval/merge atomic, with actual concurrent PG/Auth/REST proofs. Amend a new
brief before implementation; local schema work must retain shared-website impact and future
backup/restore/DB→web rollout requirements. No live DB action is implied.
