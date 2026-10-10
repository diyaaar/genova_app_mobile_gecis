# P3 — real managed protected-read checkpoint

Date: 10 October 2026, Europe/Istanbul. Helpers: `04b6a6c`; product remains
`bbc301c62ffb58a533b19d7cf904518be274aae7`, immutable 614/P1/P2 unchanged.
[Machine evidence](090/2026-10-10-p3-managed-read-compatibility.json) /
[090 work card](../briefs/090-private-file-ticket-revocation-contract.md).

Outcome: **the supported current-client real managed read checkpoint passed**.
This is NOT complete P3, hosted acceptance, private-provider activation, current
native acceptance or a distributable release. All tests were agent-owned.

## Architecture and evidence boundary

Actual full pinned Supabase PostgreSQL17 image → exact retained 9 October held
snapshot → exact eleven-delta packet → GoTrue2.196.0/PostgREST14.13 → actual current
Deno2.9.6 production function entrypoints → actual production Next15.5.25 → Chrome.
Auth users were created locally, then real password sign-in issued real sessions.
No seeded user JWT/browser session, Auth/REST/RPC/authority answer fulfillment,
schema-only substitute, broad grant, RLS/trigger weakening or hosted fallback.

The internal Docker bridge blocks service egress; dedicated SSH forwards bind
only host loopback. Local HTTPS ingress is a transport fixture, not a hosted
Kong/Envoy/Edge-runtime claim. Strict Node/Deno TLS uses a separate root CA and
non-CA server leaf; Chrome trusts only that leaf's SPKI for this scoped test.
Global trust was unchanged. PDF/WAV bytes were synthetic; all final provider
transport requests had actual AWS4-HMAC signatures verified by the fixture.
No real Drive/R2/Storage bytes, real accounts, email, provider activation or
hosted write occurred. Next/Deno/browser outside requests were blocked.

## Acceptance

| Criterion | Required here | Result | Evidence |
|---|---|---|---|
| Full retained-state fidelity before eleven deltas | yes | PASS | 17 catalogue groups, all101full-row fingerprints,2880rows; c54image/none/mount0/port0 |
| Exact ordered SQL | yes | PASS | All11pinned deltas applied only to the recovered copy |
| Real compatible Auth/REST startup | yes | PASS | 70image migration versions already present; no startup DDL;17+101unchanged |
| Source/dependency/build identity | yes | PASS | Current459/old394source files; all855old transitive package pins installed; current final build and separately recorded prior old build |
| Current genuine login → A → catalogue/PDF/audio/range | yes | PASS | Real browser password login, inked PDF, audio playback/seek,206range |
| Authorized offline and bounded online renewal | yes | PASS | Real service worker/audio transition; expired signed ticket transport injection yields actual401, fresh issuance settles; no Auth response mock |
| Same-session B → retained URL refusal | yes | PASS | Both files GET/HEAD403; provider0; A catalogue absent under real B RLS; no online cached PDF |
| Sign-out → retained URL refusal | yes | PASS | Actual SDK/server logout; both files GET/HEAD403,provider0 |
| Independent B user cannot issue A file | yes | PASS | Actual other password session/RLS/Edge403,provider0 |
| Retained legacy URL security | yes | PASS | Prior signed-provider v8 actual old browser/current Next adapter/legacy Edge/Auth/REST;9positive/security observations, same unchanged sources |
| Old R2-only feature visibility/offline source transition | no, owner#36 | FAIL retained, unsupported | Actual old browser could not show folderless new song; old hook did not switch sources online/offline. Never relabeled PASS |
| Final catalogue audit after completed current browser | yes | PASS | Final v2 at06:14:43UTC AFTER completed final browser; all17metadata groups/source ciphertext unchanged |
| Ordered cleanup/resources | yes | PASS | Final audit prerequisite checked before shutdown; VM/image/newISO/web outputs/10ephemeral artifacts removed09:15:34Turkey |
| Focused source guards | yes | PASS |12Node tests, scoped ESLint(no-ignore), two Deno cached-only type checks,614/eleven packet verification and diff check |
| All-five-family managed revocation/platform/independent review/live rollout | later P3 | NOT RUN | No inference from this repertoire+legacy checkpoint |

The current final run has12PASS observations plus a downloaded-byte limitation;
the old security run has9PASS observations. These are not12unit tests: the separate
guard suite also has12tests. Root `pnpm check` was not rerun because no product,
shared dependency or build configuration changed; actual current production build
and relevant helper checks ran. No Android/iOS build or owner manual QA occurred.

The retained source cutoff is9October03:11:01Turkey, not a fresh10October hosted
backup. Auth/application/full-row equality was established BEFORE deltas and
before synthetic users/fixtures. The tested backend subsequently contained new
synthetic accounts, sessions, audit and choir/file rows. Do not claim final whole-
table data equality; the final audit compares all17metadata groups and unchanged
protected source. Original recovery exclusions/non-MVCC limitations remain.

## Owner direction and legacy client

Direct owner clarification: “şuan eski web sürümü uygulama kullanılmıyor o yüzden
çok dert etmeye gerek yok doğru anladıysam.” Recorded as [decision36](../../KARARLAR.md).
This is owner direction, not independently measured usage/traffic. Do not spend
additional work extending the unused legacy application web to new storage flows.
Do not confuse it with the detached sibling website; that website was not changed.

Retain the failing old feature/cache evidence. Retained file security remains
enforced and tested. Activate the supported current client BEFORE private-storage
rollout; if old-client use returns, reassess support rather than assume it works.
Previously downloaded/buffered/offline bytes cannot be recalled. Historical old-
open online-buffer failure remains a limitation, not a successful cutover test.

## Failures, correction and resource custody

Original attempt20261010-managed-web exposed a transient PostgreSQL initialization
socket, Docker's none-versus-bridge constraint, internal-network host publication
probe mismatch, new-Auth-ID fixture collision, narrow Deno source-read permission,
shared SSH forward lifetime, and CA-as-server-leaf TLS refusal. Each error was
retained privately; final readiness queries the real final listener, attaches
ONLY an internal bridge, verifies image migrations/captured metadata before
startup, uses dedicated SSH, minimal source permission and proper CA/leaf TLS.
The UI test initially raced the choir gate, counted HEAD/GET as renewal POSTs,
and looked for navigation inside a deliberately full-screen workspace; these
test assumptions were corrected against actual screen/source evidence.

The agent then incorrectly started cleanup while an additional final catalogue
audit was still in flight. That audit **failed**; its earlier17group result was
not promoted. The original successful browser runs were not sufficient to close
the goal. A cleanup-order guard now refuses missing/failed/older audit receipts.

After owner#36, a fresh20261010-managed-final attempt used a LOWER6GiBtask cap and
skipped another old build. It repeated the full faithful restore, eleven SQL,
real services, current production build and entire current browser flow; then
fully awaited the final catalogue audit before gated cleanup. No reduced recovery
or synthetic Auth replacement. The current run's observed counted peak was
5,948,276KiB (~5.67GiB), below6GiB and the owner's6.5GiBmaximum;640MiBstop stayed.
All accepted final browser temp/profile outputs were counted. Initial rejected
v1's ambient Playwright temp peak was not measured and is not presented as proof.

Owned web outputs482,328KiB and VM/images/new task ISO were removed; local test
passwords/JWT infrastructure config/TLS keys/fixtures were deleted. Retained
encrypted snapshots, custody key, small private errors and receipts remain0700/
0600. Root dependencies, unrelated CLI marker, global caches and user data were
preserved. Default Lima0/no owned listener/mount/image/output. The source backup
and all614/eleven/P1/P2 records remain unchanged. Jev paid calls0/newcost$0;
no private data or transcripts were exported to AI.

## Next linked checkpoint

Extend **actual managed Auth/REST/RLS read and revocation acceptance across all
five private-file families**, including membership/role/session expiry and
concurrency negatives, with one bounded synthetic outcome. Keep current-client-
first rollout order and all source pins. Then group current Android+iOS acceptance
and independent package review before a separately authorized hosted operation.
This completed rehearsal's disk exception is not a global future build/deploy
authorization; fresh resource preflight applies. No old-feature rewrite or tiny
unrelated feature should replace a ready beta-blocking validation.
