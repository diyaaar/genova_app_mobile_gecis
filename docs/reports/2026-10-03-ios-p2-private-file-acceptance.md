# P2 — current iOS private-file acceptance

3 October 2026 · primary agent, sole writer · **ACCEPTED LOCAL P2**.
Owning [090](../briefs/090-private-file-ticket-revocation-contract.md); input
[GENOVA-BETA-20261003-P1](090/2026-10-03-p1-beta-candidate.json); next [P3](../teslim-rehberi/03-release-package.md).
No owner QA, hosted write, recipient delivery, account change, push or deployment.

## Identity and scope

Entry `main/8673592910ad470064be7e0dd6e4384303c02a70`; frozen product
`c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0`. All610 source SHA256 pins rechecked
after the final root gate. All157 native and5 actual server pins match the passing
iOS records. No product source, annotation contract, lockfile, SDK, schema, flags or
deployment configuration changed. Same-source Android acceptance remains dated,
not rerun or promoted to iOS evidence.

Web: parent `7cd8d460c68465055049dbf30192f7f5478bcf64`, exact426 pinned files,
four already accepted fixture deltas: embedded catalog/offline guards, homework
file metadata and deferred native pre-consent probe. This is the bounded real
Next profile/chorister UI fixture, **not the complete production-web candidate**.
The dispatcher runs actual legacy adapter/Edge handler/HMAC code, but substitutes
Auth/REST/current-authority/provider ports. It does not prove hosted RLS, Next file
route/middleware integration or object recovery. P1 manifest remains immutable;
this report and [build/source sidecar](090/2026-10-03-ios-p2-build-summary.json)
extend its acceptance, not its product identity.

Installed tools: Xcode26.6/17F113, CocoaPods1.17.0, Node24.13.1; iOS26.5 on owned
iPhone17ProMax simulator `57F560F5-1EE1-4C28-A925-2D614E7CFFDE`, named
`genova090-p2-ios`. Simulator Release ad-hoc signing verified with
`codesign --verify --deep --strict`. Actual SecureStore/keychain, AuthStore,
supabase-js, WKWebView, Expo files/crypto/share and native PDF renderer used;
no memory-only authentication replacement. App executable/JS and screenshot hashes
are retained in the disk sidecars. This is not an EAS/store-signed or physical build.

## Mandatory acceptance evidence

All rows below are required for P2. Date3October, frozen source above, installed
simulator/environment above, task-only loopback18092/54491/31090/31095.

| Criterion / expected behavior | Required? | Status | Date, revision, environment, command or scenario | Evidence and limits |
|---|---|---|---|---|
| Exact frozen source/426 fixture and signed current Release | yes | PASS | `090-p1-source-inventory --verify`, fixture materialize/build, Expo prebuild, pods, Xcode Release and codesign | [Source gates](090/2026-10-03-ios-p2-source-gates.json), [build hashes](090/2026-10-03-ios-p2-build-summary.json); component identity, not hosted web |
| Actual consent cancel returns to profile, GET/HEAD/provider0 | yes | PASS | Apple XCTest v3 swipes real WebView, taps Drive Linki → Vazgeç, checks modal closed and live counters before recording cancel | [Interactive HTTP v2](090/2026-10-03-ios-p2-interactive-http-v2.json); one-use synthetic credentials, no injected HTML/JS cancellation |
| Intended nonblank PDF, exact bytes/hash, visible pages1→2 | yes | PASS | Confirm real native consent, actual Image.onLoad, XCTest counters1/40→2/40 and page2 label; agent inspected both exported screenshots |65905B/SHA256 `39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`; page hashes in [disk record](090/2026-10-03-ios-p2-interactive-v2-disk.json), not a renderer stub |
| Actual share surface, dismiss/reader return, close/file removal | yes | PASS | XCTest v3 opens real iOS share popover, taps dismiss region without recipient/account/Print; reader remains2/40; closes actual preview | Ordered share-returned/preview-closed/file-removed callbacks, actual Expo File.exists false; screenshot hashes; no delivered-share claim |
| Actual AuthStore B while A profile active; oldGET/HEAD403/provider0 and teardown | yes | PASS | After close, actual A homework profile still mounted; tap Koro B, select via AuthStore, then closed A surface and cache clear | Interactive v2 native assertion `{platform:ios,switched:true,cacheEmpty:true}`, GET403/HEAD403, no switched provider access; no prior back/unmount substituted |
| Expired authorization recovers once, valid denial fails closed | yes | PASS | Current native capability in separately built noninteractive authority variant; actual lease/SDK refresh/adapter/handler/HMAC | [Authority HTTP v2](090/2026-10-03-ios-p2-authority-http-v2.json): renewal GET401/HEAD401/POST200/GET200; revoked GET403/HEAD403; switched GET403/HEAD403/GET401/HEAD401/POST403; provider1/0/0 and refresh1/0/1 |
| WebView lease/renewal, no persistent credentials/storage, guard-off sign-in | yes | PASS | Running authenticated bridges, one-use credential channel200→410, functional refresh and B teardown; read-only owned app-data scan after both flows; isolated normal Release launch with fixture listeners absent | [Interactive disk](090/2026-10-03-ios-p2-interactive-v2-disk.json)/[authority disk](090/2026-10-03-ios-p2-authority-v2-disk.json):15 files each, cached responses0, JWT/refresh matches0, persistent WK store/ephemeral files0. [Normal](090/2026-10-03-ios-p2-normal-disk.json): normal App entry, test markers absent, actual sign-in fields/button. Keychain deliberately remains native secure storage; no WK memory-store or hosted-header claim |
| Relevant quality gates, source/diff/redaction, cleanup and scoped commits | yes | PASS | Fresh mobile TS+Jest, Node fixture tests, root pnpm check, source pin replay, scoped diff review and owned teardown | Mobile57 suites/465 tests; focused26; root114 files/1178 tests+lint/typecheck/coverage/service-worker syntax/build; [gate record](090/2026-10-03-ios-p2-source-gates.json). Local gates, not CI/live/hardware; commits below |

XCTest v3 passed the entire interactive UI method in26.451seconds. The passing
HTTP v2 has exactly `cancel-observed → preview-page-1 → preview-page-2 →
share-returned → preview-closed → file-removed`; unknown/outside/failure arrays
are empty. Native removal/clear is checked against actual files, not inferred from
component unmount. The authority inspection deliberately does not open a share
sheet; it supplements, rather than substitutes for, the interactive UI run.
Revocation covers the next new online GET/HEAD request. It does not retract bytes
already downloaded/copied outside the app or turn in-flight/offline data into
server-revocable content. This preserves the owner's accepted contract.
Legacy acceptance trace labels contain the word Android; actual `Platform.OS=ios`,
device/build provenance and immutable platform-specific records establish this run.

## Preserved failures and changes of method

1. Computer Use AX click/secondary scroll worked on native Settings. Real WebView
   content did not expose usable controls to that bridge, and coordinate scroll/
   drag did not change the page. After two methods, switched to already installed
   Apple XCTest, within owner's simulator automation scope; no owner QA requested.
2. XCTest v1 target compilation failed because the generated UI target lacked
   PRODUCT_NAME. Fixed the task-only Ruby generator, not a generated file by hand.
3. XCTest v2 passed cancel/pages and opened the real share popover, then failed
   because the driver expected Close. Fresh Computer Use showed the actual
   PopoverDismissRegion; agent completed dismissal/close/B via native AX. Preserved
   this partial run and its HTTP v1; corrected the driver and reran from a fresh
   owned app/keychain/session. V3, not the partial attempt, is accepted UI evidence.
4. Initial app disk scan found8 CFNetwork cache rows,16 synthetic JWT signatures
   and the synthetic refresh marker in Cache.db-wal. Read-only SQL located the
   synthetic Auth token response and RPC request headers. The task-only JSON
   dispatcher had no cache headers. Added iOS-only private,no-store/pragma to
   fixture JSON; kept real SecureStore and unchanged Android defaults. After clean
   owned session, the entire UI and separate authority flow both show cache0/hits0.
   **This is a reproduced fixture flaw, not proof of current hosted headers.**
5. Authority variants1/2 built successfully but retained interactive=true. Initial
   CI transform reuse and then unsupported RN --config forwarding were not counted
   as negative-authority acceptance. After two variants, inspected installed Expo57:
   CI suppresses resetCache; export:embed ignores that config forwarding. Its
   loadUserConfig explicitly reads EXPO_OVERRIDE_METRO_CONFIG. A task-only config
   isolates variant FileStore transforms; no global purge or product config patch.
   V3 has interactive=false and completed authority HTTP v2. Normal variant uses a
   separate store; normal App entry and absent test markers verified before launch.
   Authority HTTP v1 stays NOT RUN. [Preserved statuses/hashes](090/2026-10-03-ios-p2-build-summary.json).

Only four test-support source/test files changed. Cancellation evidence now rejects
HEAD as well as GET (old Android actual record already had zero HEAD). New platform/
attempt validation prevents overwriting prior reports or choosing arbitrary paths.
Focused negative tests reject credential-environment fallback, corrupted/traversing
source, wrong platform/attempt, pre-consent HEAD, extra provider reads, missing events,
wrong tenant fixtures and premature lease/network behavior. No permission rule was
delegated to AI or weakened to turn a failed check green.

## Platform boundary and Jev

Frozen NativeWebViewScreen uses incognito, cacheEnabled=false, cookie-sharing=false.
Installed react-native-webview iOS code sets WKWebsiteDataStore.nonPersistentDataStore
for incognito. Fresh disk evidence proves the bounded persistent-storage condition;
it does **not** assert all in-memory localStorage APIs are unavailable. Android's
domStorageEnabled prop and earlier CDP findings are not iOS runtime evidence.
Native keychain is intentionally excluded from the disk scan because it is the
approved secure Auth store. Actual source/config negatives also pass current Jest.

TypeSafe skill used for one redacted text-only triage packet, not raw conversations,
private logs, credentials or screenshots. [Request](090/p2-jev-triage/request.json)/
[response](090/p2-jev-triage/response.json): Jev1.13.0,5 questions,1108 input/215
output tokens,0 retries; estimated **$0.000046536**, not invoice, at
[TypeSafe's input-only $0.042/Mtok tariff](https://docs.typesafe.ai/models).
Choices: fixture-first retest1.0, selector mismatch1.0, AI cannot close missing
runtime1.0; bad/good controls reject/honest1.0. No material disagreement;
tests/disk/source, not these probabilities, prove the final fix. Provider key read
only in-process from direct owner input; not persisted or printed. No new service
integration or provider migration. Self-review only, **not independent review**.

## Resources, cleanup, delivery and next outcome

Entry free22,753,644KiB; declared additional peak<=6GiB/floor10,485,760.
Lowest recorded free16,313,352KiB remained above floor. One heavy build at a time.
Final observed free**21,452,752KiB**. Build/device usage measured before removal:
native2,024,168KiB, generatedios633,952KiB, runtime591,856KiB,
owneddevice2,006,756KiB; later root outputs477,820KiB. Free-space changes can include
unrelated system activity; not an exact claim of reclaimed bytes.

Owned fixture/Next processes stopped; all four loopback listeners absent. Owned
device shut down/deleted, UUID absence verified. Generated ios/native build/426-file
runtime copy/task caches/XCTest results/exported PNGs and videos/root.next/coverage/
task logs removed after dependent checks, keeping small hashes/counts/HTTP/typed
records and source generators. Generated data is reproducible, not retained history.
Existing deps/locks/AVD/simulators/global caches/backups/user data untouched. Root
CLI marker remains unrelated and excluded. The initial forced-delete command was
rejected by the host; cleanup used scoped non-forced removal and verified absence.

Source/test-support commit **03b59b5013bb2c37494ccc405c85cbcdf3f7c17d**;
separate document/spike commit `090: accept current iOS P2 and hand off release compatibility`
owns this report; verify its SHA with Git. Local link/status/redaction/diff review;
eight updated Markdown files/163 local links resolve; Node/Ruby helper syntax passed;
retained P2 reports contain no API-key/JWT value matches. No independent review claimed.
no product-source invalidation. P1 source + Android dated + current iOS evidence can
enter P3. Whole090/R1/storage cutover/installed beta/full commercial/both-store goals
remain OPEN; this report does not authorize live promotion.

Next one outcome: **P3 reviewed compatible/recoverable release packet**.
Three actions: inspect exact current served/DB/Edge dependencies and minimum repair
convergence; refresh scoped protected backup/isolated restore and old/new-client
negative rehearsal; obtain actually independent review and per-operation authority.
Add a specific check of actual Auth/REST/private-file response cache headers and
native CFNetwork persistence to that package; fixture no-store must not be mistaken
for provider proof. All five file families/full Next routing/RLS/session-role-member
changes and per-layer recovery remain required. No bulk-main push, sibling-site
change, discarded old notes or signature-only/actorless rollback. Existing iOS share
popover displays an ephemeral UUID filename although reader title is correct;
non-blocking filename UX can be evaluated with the beta flow, not silently refactored here.
