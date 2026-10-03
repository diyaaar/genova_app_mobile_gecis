# 090 — pinned candidate native readiness preflight

3 October 2026. Source checkpoint `39923fa`, entry `6ffc82b/main`, sole writer.
Bounded preflight goal PASS; **native compatibility FAIL_REPRODUCED**. Android/iOS runtime,
090/R1/beta and publication are NOT accepted. No production or mobile source changed.
[Work card](../briefs/090-private-file-ticket-revocation-contract.md).

## Outcome and architecture boundary

Candidate `1a014c4e1927a03a7c67dd666a91a6006a28b6f8`, tree
`d901450049ee7f0aa6484062e8b1dd09824aa730`, remains immutable on
`codex/090-private-reader-candidate-20261003`. It is a narrow browser/private-reader backport
from historical production `a13f696`, not a full mobile-compatible web release. Earlier browser
PDF/audio/401/403/refresh gates remain [dated evidence](2026-10-03-production-baseline-local-candidate.md),
not fresh native proof.

Current RN `NativeWebViewScreen` owns the secure session and supplies a non-secret bootstrap.
After a challenged bridge handshake, web must verify a native access-only lease and the current
user/choir/member before exposing the permanent page. Web must never receive a refresh token or
create a second persisted session. The exact candidate has no bridge provider/runtime/protocol/
web-auth capability, and its Auth, layout, data client and ticket issuer are browser-only.
Installing an emulator or copying a token into WebView would not resolve that contract safely.

The new dedicated rejection-oriented preflight detects nine source blockers. Merely adding
the four missing modules without mounting/wiring them still fails. Its positive static result
only indicates inspected source prerequisites, never a platform/security/deployment approval.
The actual Next experiment below reproduces the missing handshake independently of that scan.

## Important issues and fixes required next

| Severity / scope | Evidence and relevant source | Why it matters | Recommended bounded fix |
|---|---|---|---|
| CRITICAL before mobile candidate/beta; not evidence of an existing browser data leak | Exact candidate lacks `components/EmbeddedWebBridgeProvider.tsx`, `lib/embedded-web-runtime.ts`, `lib/mobile-webview-bridge.ts`, `lib/web-auth-capability.ts`; `components/AppProviders.tsx`, `components/AuthProvider.tsx`, `app/(main)/layout.tsx`, `lib/supabase.ts`, `lib/drive-file-url.ts` remain browser-only. Actual `/profil` redirects to `/login`, sends zero bridge messages; actual controller times out covered/cleared | Native does not seed browser Auth; permanent routes cannot authenticate. Old device passes at different source cannot certify this release | Backport the existing access-only bridge, proof and embedded-aware Auth/data/ticket interfaces in a separate narrow candidate. Review cache/feature dependency cut points; no shared refresh token, grace or bulk main promotion |
| IMPORTANT before legacy native-file recovery acceptance | Actual `apps/mobile/src/webview/private-file-ticket-recovery.ts` accepts only five exact Edge reader paths with `fileId,ticket` at configured issuer. Candidate Next `/api/drive-file/<alias>?token=…` is refused before fetch/lease | The Next ticket response and native renewal URL contracts do not match. This experiment proves rejection of the URL shape, not a successfully downloaded/native-expired file | Add a separately scoped legacy-Next recovery path bound to trusted configured app origin, alias and fresh native lease; validate replacement response, retain one retry,403-stop and tenant-abort. Never send bearer to a bridge-selected origin |
| IMPORTANT publication blocker, unchanged | Raw src/signed-URL media diagnostics already noted in the prior [candidate record](2026-10-03-production-baseline-local-candidate.md) | Redacted harness records do not repair production logging | Minimum credential-free logging fix before generating a publishable pin; tests must inject sensitive URLs and prove no secret appears |
| GOOD | Missing handshake/current native controller covers content and clears capability; unsupported renewal calls fetch0/lease0; browser has no persisted Supabase credential | Failure is closed, not an authorization bypass | Preserve these guards in the eventual positive integration; do not “fix” by browser session persistence or relaxing origin/path checks |

## Actual runtime reproduction and limits

[Final runtime/source record](090/2026-10-03-native-candidate-preflight-runtime.json),
started `2026-10-03T07:36:52.923Z` (10:36:52 TRT). Installed Chrome, production-mode actual
candidate Next on `127.0.0.1:18199`, fresh browser context, no browser credential injection.
Actual current native controller and recovery are compiled from five compiler-discovered
modules with hashes pinned in the record; these match the tracked entry source. Their bodies
are not a handwritten replacement. Non-secret bootstrap follows the existing native format.
All external browser HTTP/WebSocket traffic is denied; outside requests and browser errors0.

Observed `/profil` → `/login`; actual visible login button; web bridge messages0, native lease
requests0, credential commands0, Supabase local/session persistence keys0. The actual controller
waits its real15-second deadline, enters `error/handshake-timeout`, covers content and clears
capability once. Navigation events are not wired as RN renderer callbacks in this experiment:
an actual WebView may reject the `/login` navigation earlier. This record isolates the missing
handshake and deadline; it does NOT claim that exact error timing on Android/iOS.

The actual recovery function rejects a synthetic expired Next URL with
`Unsupported private-file issuer`, fetch0/lease0. No actual native file download/expiry/consent/
share/viewer, genuine Auth/RLS/SQL/provider, real user, hardware or deployment runs here.
Both incompatibilities are retained as `FAIL_REPRODUCED`; record-level PASS means the negative
preflight reproduced its expected blocker, not that the native candidate passed.

[Initial runtime record](090/2026-10-03-native-candidate-preflight-runtime-initial.json) retains
the first successful reproduction before compiler-input pins were added. No failure was hidden;
the final repeat is justified by that evidence addition, not an unchanged heavy rebuild.
Source inspection CLI intentionally exits1 on this candidate. Node regression success does not
convert that readiness refusal to compatible/PASS.
This dedicated local CLI is not automatically wired into publication CI; no CI/push/deployment
change occurred. Its recorded refusal must be retained in the next candidate's work card.

## Evidence table

| Criterion / expected behavior | Required? / N/A reason | Status: PASS / FAIL / NOT RUN / N/A | Date, revision, environment, command or scenario | Evidence and limits |
|---|---|---|---|---|
| Exact candidate source/pin identity | Yes, preflight | PASS | 3Oct; manifest v3 against generated runtime before startup | All30 delta and386 unchanged files hashed; fixed commit/tree verified; branch/history unchanged |
| Readiness refusal detects wiring rather than file presence | Yes, preflight | PASS | 3Oct; `node --test supabase/test-support/090_candidate_native_preflight.test.mjs` | 7/7 including missing mounted provider, copying modules without wiring, actual recovery/no bearer, controller deadline. Static positive expressly not runtime acceptance |
| Actual Next missing handshake/current controller refusal | Yes, negative reproduction | PASS | 3Oct10:36 TRT; `node supabase/test-support/090_candidate_native_preflight_runtime.mjs --owned-loopback-negative` | Fresh production Next/Chrome; `/login`, bridge0, lease0, covered/cleared; compatibility stays FAIL_REPRODUCED |
| Actual Next-URL recovery refuses with no credential/network effects | Yes, negative reproduction | PASS | Same final actual runtime function and Node regression | Network0/lease0; URL-shape rejection, not native successful file recovery |
| Exact candidate production build for this new runtime criterion | Yes, preflight | PASS | 3Oct; explicit synthetic public Auth config, `pnpm --config.verify-deps-before-run=false build` in owned candidate | Build/types exit0, Next15.5.25; no source change/new candidate229-unit rerun. Previous candidate full229-test acceptance remains historical |
| Changed test-support root full gate | Yes | PASS | 3Oct10:38 TRT; `pnpm --config.verify-deps-before-run=false check` at root with synthetic public config | Lint/types/114files1178tests/coverage/SW/build exit0; new Node7 suite separately executed, not silently counted in1178 |
| Current mobile interface typecheck/focused bridge/capability/recovery | Yes, preflight | PASS | 3Oct; `npx tsc --noEmit && npm test -- --runInBand` with four named webview suites | TS and4suites/58tests exit0; no mobile product change. Not full mobile suite/platform proof; existing npm/punycode/SafeAreaView warnings retained |
| Source closure/differences pinned without promotion | Yes, preflight | PASS | Final runtime record, four current provider/Auth/layout/capability entries | 50 modules/120 edges/31 changed or missing paths; native compiler pins5 modules.31 is a full-module comparison, NOT minimal necessary patch |
| Docs links/consistency/redaction/diff, separate commits and owned cleanup | Yes, preflight | PASS | 3Oct, final exit checks after source checkpoint39923fa | 80 local file links resolve;2 JSON records parse;6 documents/records scanned; native5/provider50 hashes match; scoped/staged diff clean; separate source/docs commits, CLI excluded; exact outputs removed |
| Positive native-compatible candidate/Android/iOS runtime | Required later for090/release | NOT RUN | No new bridge candidate/APK/emulator/native render here | Existing candidate is incompatible; missing prerequisite captured, not waived |
| Hosted Auth/SQL/Edge/provider, independent review, client refresh/R1/live publication | Required later, separate scope/authority | NOT RUN | No hosted request/mutation or external inference | Whole090/R1/beta OPEN / live NO-GO; sole-writer self-review is not independent review |

Root coverage91.03stmts/85.68branches/98.23functions/96.79lines covers configured narrow includes,
not all application code or a multi-tenant isolation percentage. No performance/load claim.
Root Next sees its existing `.env.local/.env`; public Auth/build-origin values were explicitly
synthetic. No env file was copied into the candidate or printed. No API key/provider inference,
real data, sibling website, note deletion, push/CI/deploy/configuration/credential change.
TypeSafe skill/index retained deterministic decisions; Jev spend$0, no3October key reuse.
Supabase skill read; changelog web access failed; no new Supabase API/schema feature was implemented.

## Prioritized execution plan

1. Prepare one minimal native-compatible web candidate from the immutable browser candidate.
   Start with the four missing bridge/protocol/auth modules and five wiring consumers above;
   use existing implementations, not a new bridge framework. The full current graph also reaches
   `lib/chat.ts`, upload/comment-audio/annotation-write/cache lifecycles: review each necessary
   adapter/clear interface, preserve baseline feature behavior and do not copy those31 paths
   wholesale. First exit: actual challenged ready→proof→permanent profile with no browser
   persistence, foreign/mismatched choir rejected, stale lease/clear cancels, browser unaffected.
2. Add trusted-origin legacy-Next one-shot native file renewal, then exact native Android
   profile/file consent/download/hash,401-one-renewal,403-no-new-ticket, A→B/private clear and
   old GET/HEAD refusal. Platform-sensitive iOS checks at that integration milestone. Source,
   role/tenant tests and normal release configuration removal remain mandatory. This preflight
   is not a reason to skip genuine-service or exact runtime criteria already owned by090.
3. Minimum secret-free diagnostics, independent review, regenerated six-reader/client/SQL/
   config manifest and recovery/refresh/forward-repair packet, fresh hosted read-only preflight,
   then request exact live scope. No whole-main push, unsupported rollback, sibling site work
   or actorless grace. Android usable beta/full preserved product/both stores remain the goal.

The next implementation needs a new short090 work card that pins dependency cut points and
actual allowed files before source edits. No new product/stack choice is needed; retain RN/Expo,
permanent WebView ownership and the access-only lease contract. No current approval is treated
as hosted/provider/distribution authority.

## Resources, source review and exit

Measured entry21,287,212KiB, immediate pre-materialization21,297,052KiB available. Existing
AVD3,517,384KiB/CoreSimulator10,386,008KiB preserved, no new native allocation. One small runtime
copy (same exact candidate, deps symlink) was needed for this previously unrun criterion, not
cosmetic cleanliness. One heavy process at a time; no baseline copy, toolchain install/VM/APK.
After final gates removed exact owned candidate473164KiB/root.next477416KiB/coverage352KiB;
dependency symlink not followed, source pins/Node scripts/small records retained in Git.
Browser/Next closed, no18199 listener; final21,348,620KiB free above10GiB floor. User dependencies,
AVD/simulators/global caches/backups/native data and unrelated CLI marker preserved.
Only primary self-review:206 lines of dedicated preflight source, no production/mobile patch.
Do not present a source-signal gate, Chrome transport or current native unit tests as an
independent review or actual WebView/tenant/provider acceptance.
Document patch preparation initially used a rejected duplicate delete/add target; no files
changed in that failed operation. Retried as scoped updates, then verified links/diff/ownership.
