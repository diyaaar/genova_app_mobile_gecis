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
| Actual Android cancel0 → local page1/40 and2/40 → renderer/file cleanup → B403 | yes | NOT RUN | new immutable v4 attempt to follow | Owner-assisted touch needed; source/mocks do not prove it |
| Normal guard-off/resource cleanup | yes | NOT RUN | after runtime attempt | Current generated candidate/Android build are owned temporary outputs |
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
