# Genova project check-up — 1 October 2026

## Judgment and scope

The local product direction remains consistent with the commercial multi-choir and
Android-first decisions, but it is **not release-ready**. Continue the remaining
090 client-runtime acceptance before requesting its hosted rollout. Do not replace
the pending storage/beta work with an unrelated feature. This is a focused general
check and self-review, not a second full security audit or independent review.

Current request authorizes scoped local continuation. Hosted DB/Edge/provider,
credentials, real users/files/email, spending, push/CI/deploy, hardware and beta/store
distribution remain separately gated. No external operation is accepted by this report.

## Repository and architecture map

- Starting `main/d3ce159`, correct `github-genesinova` origin. Only unrelated
  `supabase/.temp/cli-latest` dirty; preserve unstaged. No active task VM or ADB device.
- Root Next/React web and `apps/mobile` Expo/RN product share TypeScript tenant/file
  contracts. Supabase owns Auth/Postgres/RLS/Edge/Realtime. Private R2 direction
  preserves Supabase, rather than replacing it with another database platform.
- Server-validated Auth-session choir selection, tenant-aware memberships/roles and
  new operator-assisted choirs remain the chosen model. Native repertoire/PDF/audio
  and permanent WebView profile/administration are separate consumers; Chrome alone
  cannot accept WebView. Annotation schema remains shared, not a native fork.
- Local recorded `origin/main` is 272 commits behind; recorded comparison is 685
  files / 79,172 insertions / 11,831 deletions at starting HEAD. This is **local
  tracking-ref evidence**, not a current remote/live lookup. No bulk push is safe
  merely because local gates pass; staged DB/Edge/client order is still required.

## Findings and action

| Severity | Evidence / files | Why it matters | Action |
|---|---|---|---|
| IMPORTANT | [WF-013](../briefs/WF-013-multi-tenant-remediation-plan.md) step 6 still says the 090 owner contract is missing; [decision #32](../../KARARLAR.md) and [090](../briefs/090-private-file-ticket-revocation-contract.md) record approval, implementation and tests | A new session could re-ask an already settled decision or pick the wrong task | Update current step-6/decision pointers; preserve historical evidence |
| IMPORTANT | [090](../briefs/090-private-file-ticket-revocation-contract.md): native stale-v1/audio, WebView and overlapping HTTP/COMMIT remained NOT RUN | Unit/SQL/Chrome passes do not prove the actual media client or every concurrency layer | Execute guarded Android audio body-recovery/seek/resume, retaining distinct remaining gates |
| IMPORTANT / FIXED LOCALLY | [AudioPlaybackProvider](../../apps/mobile/src/repertoire/AudioPlaybackProvider.tsx) read only the last Expo status; actual Android emitted a transient error then `error:null`, and 401 recovery timed out | An old private URL could leave the audio UI loading despite green unit tests | Source-scoped native event latch, event-emitter/403/bounded-retry regressions, actual Android verification; async seek generation guard prevents restart after tenant clear |
| IMPORTANT | [handoff](../agent-handoff.md) 132 lines, [active context](../../memory-bank/activeContext.md) 111 at entry; target roughly <=80 | Duplicated historical/current prose increases drift and intake cost | Condense current indexes; link detailed evidence rather than delete it |
| IMPORTANT | Large recorded local/remote gap plus shared live database and dormant backend | New clients and old DB/Edge can fail or regain unsafe legacy behavior | Fresh release preflight/backup/restore and ordered rollout; no current release authority |
| IMPORTANT / OPEN | WF-013 step 5 remains PARTIAL; operator/catalog/role administration, mail/signup, seat counting/billing and account/choir deletion/retention not fully accepted | Two synthetic choirs are not a complete commercial onboarding/lifecycle | Preserve ordered execution and ask concrete commercial choices at dependent checkpoints |
| TECH DEBT | Existing dependency/AVD/Gradle/CoreSimulator footprint; source records and installed caches are retained | Blind cleanup can erase reusable tools or recovery evidence; unmanaged builds can breach floor | Measure headroom each phase, one heavy process, remove only owned generated output |

The prior 28 September audit remains the detailed source for F01–F14. No claim is
made that repository-wide secrets/history, all mutation writers, 100-choir load,
empty-database replay or old account/password risks are now resolved.

## Evidence layers

| Check | Status | Date / evidence / boundary |
|---|---|---|
| Git/source/authority/plan/current-marker review | PASS | 1 Oct local inspection; remote/live NOT RUN |
| Actual local five-family SQL/HTTP, Chrome PDF recovery | PASS historical | 30 Sep 090 records; not rerun or relabeled as today's evidence |
| Root lint/TS/106 files, 1066 tests/Next build | PASS | Fresh 1 Oct `pnpm check` exited 0 with local/synthetic Supabase overrides and blank VAPID; not hosted/E2E proof |
| Focused mobile config + playback tests | PASS | 1 Oct typecheck and 2 suites / 14 tests before native runtime; later final gates recorded below |
| Current Android audio media HTTP/recovery/seek/expiry/tenant clear | PASS locally | Actual API36 Release: 401→one fresh ticket, seek4/expiry resume >=4.2s, pause/seek2/resume, owner clear; separate 403 refuses without re-ticket. Synthetic unsigned tickets; no Auth/R2/v1 cryptographic proof |
| Current full mobile gate/Android build | PASS | 1 Oct TS/51 suites/314 tests and offline arm64 Release; normal iOS/Android JS exports 1,439 modules each. Native iOS error-latch/seek runtime NOT RUN, scheduled 090 integrated both-platform acceptance before release |
| Native PDF stale-v1, Android WebView, overlapping HTTP/COMMIT | NOT RUN | Distinct remaining 090 acceptance |
| Hosted/provider/physical phone/beta/stores | NOT RUN | No current authorization/execution; beta is not full-product completion |

## Resources and retained artifacts

Before build, available 24,915,836 KiB. Existing allocated root dependencies
1,621,064 KiB, mobile dependencies 8,673,288 KiB, Gradle 5,531,480 KiB, API36 AVD
3,387,144 KiB, CoreSimulator devices 10,227,320 KiB; these are not new disposable
task allocation. `.git` 309,704 KiB, docs 7,612 KiB, spike 412 KiB, Colima 24 KiB.
Root `.env`, `.env.local`, `.env.local.github` and mobile `.env` have mode 0600;
this verifies selected local modes, not creator/history scanning or key rotation.
No credential values were read into this report.

Android work estimates <=7 GiB additional allocation, above the 10 GiB floor;
installed SDK/JDK17/API36 are reused, offline Gradle first, no VM/new toolchain.
Original 068 restore, private backup/copy records, AVD and dependencies remain.
Exact task-generated Android/Expo/runtime output and audio process/reverse route
must be removed after final dependent check. Actual cleanup/free space is recorded
in 090; no global cache or other project data may be purged.

Final cleanup removed exact newly generated Android (782,904 KiB), Expo (8,576 KiB),
Next (477,544 KiB) and coverage (352 KiB) outputs, plus emulator-installed acceptance
app/UI dump/reverse route; loopback server and emulator stopped. Generated outputs
are reproducible, not recoverable binaries. Existing AVD, dependencies and recovery
records remain. Available 25,989,296 KiB (~24.8 GiB), no ADB device or 18026 listener.
No VM or secret-bearing fixture was created. Detailed failed attempts and final
APK/WAV hashes are retained in 090, not overwritten by the final PASS.

## Prioritized continuation

1. Completed current outcome: repaired and locally accepted Android audio body
   refusal/recovery, seek/expiry resume and tenant cleanup; source/docs split commits.
2. Next local outcome: guarded connected Android native PDF stale-v1 recovery;
   then actual permanent-WebView, connected audio Auth/R2 and overlapping HTTP/COMMIT gates.
3. Prepare exact current hosted migration/Edge/client rollout and recovery checkpoint;
   retain 077's separate remaining real-copy authority. Release only with its own approval.
4. Complete beta and preserved commercial lifecycle/full-feature/two-store criteria.

The existing [delivery queue](../mobil-teslim-plani.md) and WF-013 remain authoritative.

Checkpoint source/test `dc46c2a`; report/brief/index changes committed separately.
Handoff condensed from 132 to 80 lines, active context from 111 to 71, with historical
evidence retained in linked briefs/progress. Changed-document local links: 170 PASS;
diff/syntax PASS. Only the unrelated CLI marker remains outside owned staging.
