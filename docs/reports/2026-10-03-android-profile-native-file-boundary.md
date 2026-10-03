# Android profile and native legacy-file SDK boundary

Date: 3 October 2026. Local goal: PASS. Whole090 / Android beta / hosted release: OPEN.
Source checkpoint: `d298229`; entry `f7ad2a9`. Sole writer, self-review only.
Authority: approved local synthetic implementation, tests, commits and owned cleanup.
No push, CI, deployment, hosted SQL/Edge/provider operation, physical device, sibling-site
change, real user data, email, credential change or paid inference. Jev cost: $0.

## Outcome and exact boundary

The actual Android Release app signs in using native Supabase SDK/AuthStore/SecureStore,
opens the permanent profile WebView, accepts ready/challenge/ack, supplies an access-only
lease and reaches running after web Auth/membership proof. The production-type Next
profile makes an authorized exact actor/member/current-choir data query. This is a bridge
and data-loading check, NOT visual acceptance of the entire profile UI.

The actual Expo file store downloads an expired legacy Next URL, identifies401 using
HEAD, obtains one fresh native SDK lease, issues one configured-origin renewal POST,
downloads65905 bytes and verifies SHA256 before inspection/clear. A valid but revoked
ticket is refused on the next GET/HEAD. After actual native A→B selection, old valid A
GET/HEAD and attempted expired-A renewal are refused, with zero provider reads.

Web source is immutable `7cd8d460c68465055049dbf30192f7f5478bcf64` (parent browser1a014c4).
All426 accepted raw Git files, including binary login.png, were verified before
materialization and again after build. No factory rerun against main or web-source edit.
Android SDK36 / emulator37.1.11 / installed JDK17.0.20; no dependency/toolchain download.

Actual production Next profile runs behind a local HTTP dispatcher. Legacy file requests
dispatch actual Next server adapter / Edge handler / HMAC code, but NOT production Next
file routing/middleware. Auth/REST/current-authority/provider are synthetic. Provider
response bytes are the retained synthetic PDF. An inspection-share port observes file
existence; it does NOT open a sharing app, prove a share sheet or exercise user consent.
Fixture outside/unknown-request arrays cover fixture transport, NOT a device-wide egress
audit. Realtime socket upgrade is refused; Realtime behavior is not accepted here.

## Required evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date / environment | Evidence / limits |
|---|---|---|---|---|
| Exact web/native inputs and guarded synthetic build | Yes | PASS | 3 Oct / local Git, Android Release |426 web hashes;153 native and5 server hashes plus final harness hash verified |
| Native challenged profile and SDK/web membership proof | Yes | PASS | API36 emulator, actual WebView | ready/ack/running; authorized Auth user, RPC and scoped member query; NOT visual UI |
| Actual Expo one-shot expired URL renewal/hash/removal | Yes | PASS | Android Expo filesystem + local HTTP | GET401→HEAD401→POST200→GET200;65905B/hash; cache absent after clear |
| Valid revoked ticket denied before provider read | Yes | PASS | Actual native request, synthetic authority | GET403→HEAD403, no refresh/renewal/provider read |
| Actual A→B switch denies old A ticket and renewal | Yes | PASS | Native SDK selection + actual handler | GET403/HEAD403 then expired GET401/HEAD401/POST403; provider0 |
| Mobile types/full tests | Yes | PASS | Fresh source / local |55 suites453 tests, typecheck exit0 |
| Root full check | Yes | PASS | Fresh source / local | lint/typecheck,114 files1178 tests/coverage, service-worker syntax, production build; exit0 |
| Focused Node regression/preflight tests | Yes | PASS | Fresh source / local |5 new harness tests +7 preserved negative preflight tests =12/12 |
| Normal guard-off generated Android manifest/resource | Yes | PASS | Fresh unflagged prebuild / no dotenv | loopback manifest attribute/resource absent; app.json/package unchanged; NOT normal APK runtime proof |
| Pins, documentation, cleanup, separated commits | Yes | PASS | Local checkpoint | source d298229 + paired docs commit; scoped generated outputs removed; unrelated CLI marker excluded |
| Actual WebView user consent/share sheet/visual and iOS | Deferred required integration/release gate | NOT RUN | Next owner-assisted checkpoint | Inspection is not consent/share; previous required rows retained |
| Hosted RLS/provider/real data/device/deployment | Required before relevant release, not this local goal | NOT RUN | No authority exercised | Local fixture is not hosted isolation or production release proof |

Authoritative machine evidence: [v4 PASS](090/2026-10-03-android-candidate-sdk-http-v4.json).
Exact provider reads: renewal1, revoked0, switched0. Native SDK refresh counts:1/0/1.
Unknown/outside/failures arrays empty. PDF SHA256:
`39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`.
Actual native log PID3840 reported `bridge running:profile`, PDF/hash PASS,
renewal/hash/removal PASS, current denial PASS, inspection NOT actual sheet and final
`Android profile/native file boundary PASS`. No screenshot/visual assertion is inferred.

## Rejection-oriented attempts and corrections

1. [Initial NOT RUN](090/2026-10-03-android-candidate-sdk-http.json): login succeeded,
   bridge timed out. Fixture web build omitted existing guarded090 web acceptance/app-origin
   flags. Corrected only fixture environment; production guard stayed intact.
2. [v2 NOT RUN](090/2026-10-03-android-candidate-sdk-http-v2.json): ready/challenge/ack
   and Auth GET200 succeeded, REST preflight did not proceed to POST. Fixture CORS omitted
   installed SDK's Content-Profile/Accept-Profile headers. Added only those names, with
   an explicit allowlist regression; actual v3/v4 preflight header names confirm the cause.
3. [v3 FAIL](090/2026-10-03-android-candidate-sdk-http-v3.json): native file behavior and
   exact HTTP/provider/refresh assertions succeeded. Final profile assertion incorrectly
   required asynchronous member GET to finish before file inspection started. Accept
   only authorized GET200 during profile/renewal (same A), never revoke/switch/OPTIONS/
   non200/unauthorized. Route separately asserts exact actor/member/current choir. Added
   positive/negative regression and reran; no failed evidence overwritten or promoted.
4. v4 passes final exact assertions on the unchanged APK and immutable rebuilt web source.
   No production bridge/Auth/RLS change was necessary. Two-failure reassessment recorded
   in090 before the next bounded action.

Offline arm64 Release build succeeded in1m23s. APK:45993518 bytes, SHA256
`3186d053621360804d38cc1ccbc9b0fc12672b52d8ef460dd3728f8b02f847b3`;
actual apksigner verification exit0 with installed JDK. Hermes bundle:1964188 bytes,
SHA256 `b58fa1cb94ca6c5eb567eb681d7e4b1f4487e2be6ac3ae3befcf2280a7ab7aa7`.
No hosted-project/chat-key marker in bundle. Initial signer check without JAVA_HOME failed;
correct explicit installed JDK passed without rebuilding. Existing SafeAreaView/system-UI/
Gradle deprecation warnings retained, not unrelated refactor scope.

## Resource closure and next ordered action

Entry free21278508KiB; observed low19898484KiB; final free21054604KiB (about20.1GiB).
One heavy build at a time; no VM, dependency copy or downloaded SDK. Removed exact owned
candidate/build, mobile android, root .next and coverage after their final checks. Normal
prebuild had already removed the acceptance native build; .expo absent. Removed owned
synthetic installed package (baseline absent), three reverses and stopped emulator/Next/
fixtures. adb inventory empty and31090/31095/54491/18092 listeners absent. Sources, small
records, lockfiles, caches, AVD, historical candidates and user data preserved.

Next: bounded Android owner-assisted actual WebView file request→consent/cancel/download/
share/clear, navigation/profile visual behavior and tenant clear; then grouped sensitive
iOS acceptance. Audit remaining permanent WebView API boundaries before promoting a web
candidate. Independent review, fresh hosted preflight, forward repair/refresh policy and
R1 restoration remain prerequisites for live authority. No automatic cutover or release.
