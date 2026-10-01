# 090 — connected Android current assignment-version WebView

1 October 2026. Source/tests `216b996`; entry `main/d5cc95f`. One writer, no delegation.
This **local checkpoint passes**, but090, hosted cutover, Android beta and the commercial
product remain open. [Brief/work card](../briefs/090-private-file-ticket-revocation-contract.md).

## Outcome and product repair

The actual permanent `/koristler/<target>` page selects a synthetic immutable
`current_file_version_id`, despite an empty Drive ID and a stale signed-v1 repertoire URL.
Real local Auth/RLS/assignment-file Deno issues the native session's ticket. Product web
HEAD200 and native GET200 reach AWS4-signature-verified synthetic private object bytes.
Actual Android file consent and system share sheet work. No external share target was
selected, file sent or external PDF-viewer rendering accepted.

Runtime found a real product gap: `isProtectedFileAnchor` recognized only repertoire-file.
Assignment links took external navigation rather than the native file capability. A red
component regression reproduced all four missing reader families and the overly broad
repertoire-lookalike match. The narrow fix recognizes the five **exact** reader paths,
retaining legacy/download routing, native consent, ticket checks and server authority.
All seven new cases pass. This is not proof that all five families ran on Android here.

## Evidence and boundaries

| Criterion | Required here? | Status | Evidence |
|---|---|---|---|
| Explicit assignment-family/config/one-use/loopback guards; legacy default preserved | Yes | PASS locally | Fixture11; mobile config19; root policy23; combined focused58 including provider24. No synthetic password file/public password variable |
| Actual Auth/RLS/current-version issuance and foreign user denial | Yes | PASS locally | Genuine disposable Auth/PG17/PostgREST + literal assignment index; A POST200, foreign B POST403/provider0 |
| Actual Android permanent page/native capability/exact bytes | Yes | PASS locally | [HTTP](090/2026-10-01-assignment-webview-http.json), [native trace](090/2026-10-01-assignment-webview-native.txt); file.open accepted,65905B/SHA256; share sheet visually inspected and dismissed |
| Actual product B selection/private teardown/old-URL refusal/B profile | Yes | PASS locally | Native AuthStore switch, ephemeral directory absent, old A HEAD403 + GET403/provider0; new bridge proof and visually inspected `Shared B` profile |
| Fresh mobile TS/full Jest | Yes | PASS locally | 55 suites/404 cases, exit0 after final mobile source change |
| Fresh root gate | Yes | PASS locally | `pnpm check`: ESLint/TS/110 files1108 tests/SW syntax/Next production build, exit0; final build acceptance flags off and public config synthetic/local |
| Normal exports and network guard removal | Yes | PASS locally | Android1440/iOS1440 JS modules; dotenv/acceptance flags off; normal prebuild removes loopback XML/manifest reference. Not native iOS runtime |
| Review, links/diff and owned cleanup/source preservation | Yes | PASS locally | Scoped primary self-review only; no independent review. Original068 five hashes unchanged, [counts28/1/29/9/79](090/2026-10-01-assignment-source-preservation.json); exact generated targets removed |
| Native iOS/physical phone/hosted provider/deploy/Drive cutover/stores/whole090 | Broader release | NOT RUN | No promotion of emulator/local/JS-export evidence |

Final observed web/native sequence: POST200/provider0 → HEAD200/provider1 →
GET200/provider1 → HEAD403/provider0 → GET403/provider0. Exact PDF SHA256:
`39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`.
Final APK SHA256 `83222ca39ae063aeba558a0ac0ceae93751d0a324478ef351c49ee6498946006`.
Offline arm64 Release initial build1m9s; assignment-origin build16s. Final source repair
was web-only; production Next rebuilt, same APK reused with fresh synthetic app state.
Final native trace21:39:30–21:41:13 local. Fixture teardown exited0, retaining genuine
repertoire A/B/new-ticket denials, separate Auth-session A and inactive-membership checks.
Those additional checks are repertoire-specific, not new assignment-role-removal proof.

Transport:54491 is an explicitly guarded API front door. Auth/REST are forwarded unchanged
to genuine Kong through the owned loopback54493 SSH tunnel; assignment-file goes through
observer18092 to actual Deno8001. A test-only Deno.serve listener adapter binds127.0.0.1;
the production index/handler remain unchanged. Ticket query bytes are forwarded unchanged;
only listener URL/path and CORS are normalized. Exact assignment-only web/native acceptance
policy permits54491; default/normal production policy remains unchanged. Unknown function
path404 and actual assignment OPTIONS204/provider0 were checked. This is **not unmodified
Kong Edge routing, hosted R2 or hosted privilege proof**.

The application schema-only copy plus024,041–045,053,057,historical review-audio,058–060,
078,090 was restored into a disposable factory Auth database; no source rows were copied.
Basic authenticated/service public-table privileges were re-established only in that
fixture; RLS policies and SQL authority stayed intact. Source068 was read-only throughout.

Preparation failures remain failures: missing SSH forwarding; intentionally stopped
pre-UI fixture; missing web acceptance flag; retry before Next readiness; observer
same-origin/CORS mismatch; and the actual missing file-anchor routing. Partial fixtures
failed their mandatory missing-HEAD/GET assertions, never became acceptance. The work card
records causal reassessment and bounded next actions, not a product fix for setup errors.

## Jev advisory and cost

Used TypeSafe's live API/Choice/citation-check guidance for a frozen ten-claim evidence
packet, not runtime authorization. [Labels](090/2026-10-01-jev-assignment-labels.json),
[request](090/2026-10-01-jev-assignment-request.json), [attempt](090/2026-10-01-jev-assignment-attempt.json),
[response](090/2026-10-01-jev-assignment-response.json). One call,11888B request, no retry.
`jev-1.13.0`:4394input/419output,479ms, **$0.000184548 estimated**, using the
[documented $0.042/M input rate](https://docs.typesafe.ai/models); output tokens free.
Tracked1October total17calls65958input7962output, **$0.002770236 estimated**, not invoice.
Codex usage cost is unavailable here. Key read only from non-echoing private TTY; not
persisted, added to env/public bundle, printed or uploaded with evidence.

9/10 primary labels agree. Jev says `contradicts` for unrun native iOS at confidence0.27;
primary judgment retains **insufficient/NOT RUN**, not proven broken. Connected0.14,
routing0.58, normal0.76, viewer0.63 and invoice0.28 also remain review-required. No
AI score overrides observations, required gates or source. The skill influenced only
bounded semantic evidence review; deterministic auth/routing/tests stay in code.

## Cleanup, remaining risk and next action

Owned stack/volume,genova090 VM/data, emulated app/UI dump/reverses/emulator, Next/Deno/
observer/API relay/tunnels stopped and removed. Exact ignored generated android/.expo,
.next/coverage and090/093 runtime directories removed after their last dependent check;
derived binaries/screenshots/schema dump are not retained/recoverable. Small tracked
evidence and sources remain. No task-port listener, Colima instance or adb device.
Lowest observed free16792772KiB; final21940156KiB, above10485760KiB floor. Preserved
Gradle5533840KiB, AVD3509836KiB, dependencies/private records/original068 and unrelated
CLI marker. No push, CI, hosted schema/provider/credential/account write or distribution.

Next bounded **integration milestone**: measured disk/SDK/owned-runtime preflight for
090's accumulated native iOS private-client acceptance (PDF, audio recovery/seek and
permanent WebView), then its platform observations. Do not switch simulators per small UI
change or mark exports as runtime proof. Actual remaining-family Android media, hosted
DB→Edge→clients/flags, real-copy077 and owner phone/beta remain separately gated. B's
existing `Genova'lı` profile branding was visible; multi-tenant branding debt is retained,
not fixed in this private-file checkpoint.
