# 090 — account-free inline protected PDF preview

3 October 2026, source checkpoint `402685b`; sole writer/self-review, not independent review.
Owner approved the replacement of PDF view's external ACTION_SEND flow and is ready for
the actual Android sequence. Same 090 goal; whole brief/R1/beta remain OPEN.

## Scope and design

PDF `view` now presents local, already-authorized bytes inside `NativeWebViewScreen`.
Existing `nativePdfRenderer` and page-index contract are reused; no dependency, fake
repertoire resource, DB/Edge/ticket/Auth rule or production web change. Sharing is an
explicit separate action; download/non-PDF behavior and explicit legacy inspection
ports remain unchanged. No share-availability check or automatic external fallback
is required for inline PDF view.

The local session serializes native work, keeps one rendered page, validates native
outputs, rejects late aborted results and closes renderer handles before source-file
removal. Parent-owned abort handles a preview which React never mounts. Closing,
unmount and tenant invalidation share idempotent cleanup. No AI authorization.

## Dated evidence

| Criterion | Required? | Status | Evidence | Limits |
|---|---|---|---|---|
| Inline PDF avoids external chooser; explicit share only; other dispositions preserved | yes | PASS | focused capability tests, source402685b | Mocked platform ports, not pixels |
| Page index/navigation/zoom/errors and serialized close/abort cleanup | yes | PASS | renderer-port and component tests; full mobile57suites464, types exit0 at13:33UTC | Native module and visual acceptance still required |
| Root quality gates | yes | PASS | fresh `pnpm check`,114files1178tests/lint/types/SW/build | Not hosted/native proof; last mobile-only abort fix covered by fresh mobile gates |
| Harness event ordering/negative cases | yes | PASS | focused Node16/16 | No owner actions fabricated |
| Exact four-delta pinned web candidate | yes | PASS |426pins materialized,422raw parent files; current production candidate build exit0 | Synthetic Auth/REST/dispatcher, not hosted RLS/Next file middleware |
| Android release build / challenged native profile boot | yes | PASS | Gradle76sec496tasks; API36 boot + one-use native Auth/access-only challenged chorister-detail bridge running at13:36:30UTC | Debug-signed local release, no actual PDF touch yet |
| Actual Android cancel0 → local page1/40 and2/40 → renderer/file cleanup → B403 | yes | PASS | owner initial cancel/pages + agent ADB close/B, immutable v4 PASS_HTTP_NATIVE | Synthetic emulator; B follows explicit native back, not proof of active-surface B teardown |
| Normal guard-off/resource cleanup | yes | PASS |13:50UTC normal prebuild manifest, owned app/reverses/servers/emulator/output removed | Existing deps/AVD/user data retained |
| Sensitive iOS native integration | later required milestone | NOT RUN | next grouped integration gate | Android or export evidence cannot substitute |

Historical [v3 chooser attempt](2026-10-03-android-candidate-consent-share.md) and
its immutable HTTP report remain unchanged. The synthetic40-page PDF is a faint
coordinate grid, not a real choir score. Previous Google account/Print path is not
accepted preview evidence. No Google account, recipient, sending or printing needed.

## Resources and authority

Fresh free22,435,440KiB at13:33UTC; current peak bound6GiB still above10GiB floor.
Reuse installed deps/SDK/JDK/API36AVD; one heavy build at a time, no downloads.
Owned generated Android/candidate/rootoutputs/runtime removed after the last check,
unless immediate ready-owner sequence has a short explicit expiry. Keep source,
small evidence, deps/AVD/global caches and user data. Unrelated CLI marker preserved.
No hosted operation, push, CI, deployment, real-user data or credentials. Jev $0;
prior exposed-key permission was2October only, no3October inference.

## Ready-owner runtime checkpoint,13:36UTC /16:36Istanbul

Installed source402685b APK SHA256
`9ed6c1c733c1d16903162c9c6cd91a84e92dc650cacd50c7b46f0df7466e920d`;
Hermes bundle `4f933b6659ddcfd9d4f775bc5cf04f823926e7d51f888d3178f51309df92b22f`.
Actual apksigner certificate SHA256
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`
is Android Debug, NOT a store signing identity. Initial `pm path` absent; owned
install/launch succeeded. API36 emulator5554, server PID87432/emulatorPID87465,
reverses31090/54491/18092 owned. No hosted credential/environment fallback.

Actual pre-touch read observation: A/renewal, fileGET0/HEAD0/provider0/unknown0/
failures0; actual Auth, startup ephemeral clear, challenged bridge running PASS.
CUA refreshed inventory still lacks Android; no adb input/UI capture substitution.
Owner asked ONLY actual cancel first. No operator cancel-observed event until reply;
no synthetic auto-action. New immutable v4 JSON is written on acceptance or stop,
not manufactured while pending. Candidate/source pins recorded by the running harness.

Free21,280,652KiB after APK build. Runtime retained only for immediate owner-ready
sequence until13:55UTC /16:55Istanbul; then stop/persist truthful unrun evidence and
cleanup before another handoff unless owner actively continues the sequence.
Required consent/page/close/B/browser persistence and iOS rows remain unaccepted.

### Owner cancel checkpoint,13:39UTC /16:39Istanbul

Owner reported “yaptım sıkıntı yok” after the explicit cancel-only instruction.
Actual native file.open.request accepted; current GET0/HEAD0/provider0/unknown0/
failures0 verified. Only then operator `cancel-observed` POST succeeded and safe
event appears in current observation. Cancel/return + zero read PASS; whole
page/close/B row remains NOT RUN. Next owner action: approve once, observe local
page1/40 then Sonraki2/40; do not share/print/close/switch until read verified.
TypeSafe inspected; this is deterministic local observation, no inference/spend.

### Owner local-page checkpoint,13:40UTC /16:40Istanbul

Owner confirmed1→2 “geçiyo sıkıntı yok”. Actual native65905B/hash PASS, Image
onLoad page1/40 and2/40 + corresponding fixture events200 verified; later actual
page3→6 logs observed, not required extra fixture events. GET1/HEAD0/provider1,
unknown0/failures0; no external share-return event. Local preview/page navigation
PASS within synthetic emulator scope, not real-device/hosted or independent visual
review. Next close/return, verify native close and per-file removal before B.

## Agent-owned Android automation,13:44–13:50UTC /16:44–16:50Istanbul

Owner explicitly approved ADB capture/input and Android/iOS test automation and
asked not to perform manual QA again. Preference recorded in AGENTS and a small
authorized global-memory note; it does not grant unrelated real-account/hosted/
credential/hardware/publication authority. Complete TypeSafe skill/live index read;
deterministic native/HTTP checks, no inference. Existing installed adb only, no
new test framework/dependency/runtime/build. Freshfree21,096,572KiB, capture peak
bounded10MiB; no floor risk. Computer Use direct qemu binding invalid; explicit
owner approval permits the ADB alternative rather than silently bypassing it.

Fresh actual1080×2400 screenshot showed SAYFA6/6of40, local grid and native toolbar.
ADB next6→7, wait for actual Image.onLoad, inspect fresh screenshot SAYFA7/7of40
PASS. Zoom100→125% visibly enlarged the page PASS. Initial immediate capture before
image load showed the transition, not a rendering failure; loaded pixels inspected.
ADB close returned to the same scrolled chorister homework card. Actual renderer
closed7/40, Expo File.existsfalse after removal and ordered fixture events PASS.
ADB swipe visibly moved profile from homework to calendar/summary; native Geri
cleared and closed the WebView. ADB KoroB then actual AuthStore selection and valid
oldA GET403/HEAD403 PASS; provider switched0, cache-directory absent assertion PASS.
No Drive account, Print, external chooser, recipient or send action was used.

[Immutable inlinev4 HTTP/native report](090/2026-10-03-android-candidate-inline-preview-http-v4.json)
PASS_HTTP_NATIVE: source402685b,157native pins freshly rehashed,426candidate pins,
65905bytes/SHA256 `39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`,
provider1/0/0; unknown/outside/failures0. Synthetic Auth/REST/current authority plus
actual adapter/HMAC dispatcher, not hosted RLS/Next file routing/middleware.
Report's legacy `actualConsent`/`actualShare` NOT RUN fields are not an aggregate
UI verdict: consent/cancel/page evidence is above; explicit optional share was NOT
RUN and remains unaccepted. Earlier failures/JSON remain immutable.

Actual PDF visuals/page/zoom/close/profile scroll/back PASS, self-review. Persistent
WebView browser storage absence was NOT inspected in the release app sandbox;
incognito/cache-disabled source alone is not runtime proof. Because native back
closed A before B, active-surface B-triggered teardown is NOT RUN in this attempt.
These prior broader gates and sensitive iOS remain OPEN, not waived by automation.
No whole090/R1/beta/goal completion claim. Next bounded gate is automated current
platform integration/persistence and grouped iOS acceptance, no owner QA request.

### Small screenshot evidence and cleanup

Synthetic screenshots visually inspected, hash recorded, then removed; no binary
history copies retained. Full SHA256 values for last dependent checks:

| View | SHA256 |
|---|---|
| page6 |027a5e3ccb3677a599551c9b2670a8fa690e4e1ad3881182c05bf8254cbd5b60|
| loadedpage7 |ad35fbb7b7678a1e185485236a33eadad8b1c7ec157ae92c2e8802471c8e21a2|
| zoom125 |7d05c93fc54a45a073c64ceebb5948a59ff594eae5af978e0b4cb13143b9c425|
| PDFclose/profile |faacb3d024a8113848d6e155d61be7496fb16a916bf85300390fdb0686efb0b2|
| profile swipe |ee76dedf8e5e98d5450ba8daee2b7d29d4bf9480cfe1907e86049d87f543d9de|
| nativeback/closed |91d77bde8e4b515ab9d4bfe66b9c9bf667300324b173b60a06ae2eb5913dcd74|
| B/refusal/closed |4476d9ccd5ace1e8f0361cb070e3e5dbd76b7daf7537f4266629a2e876d2f4cf|

At13:50UTC stopped/uninstalled owned app (initially absent), removed3reverses,
stopped server87432/ownedNext/emulator87465/5554. Actual acceptance-off prebuild
manifest PASS (no networkSecurityConfig/loopback XML); no package changes. Removed
owned generated apps/mobile/android, exact candidate, root.next/coverage and7PNG.
Before normal-prebuild cleanup: android783,928KiB/candidate476,252/root.next477,404/
coverage352; .expo absent. Ports/processes/adb verified absent. Free22,840,820KiB
after cleanup. Preserved installed deps/SDK/JDK/AVD/iOS Simulator/user data/unrelated
CLI marker/sources/lockfiles/immutable small JSON. Reproducible outputs only removed.
Fresh source pins/redaction scan PASS; document-only changes do not rerun builds.
