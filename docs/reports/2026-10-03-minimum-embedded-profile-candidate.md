# Minimum embedded profile candidate — 3 October 2026

Bounded local goal PASS. Source `e5cc1d7`; new local candidate
`7cd8d460c68465055049dbf30192f7f5478bcf64`, tree
`49c0ce80e7d7a654b4f6904571ac3d7658ff5106`, branch
`codex/090-embedded-profile-candidate-20261003`.
This is **profile transport/proof acceptance, NOT full mobile compatibility**.
Whole090/R1/beta remain OPEN and live NO-GO. No hosted, push, CI or provider action.

## Scope and source provenance

The previous [negative preflight](2026-10-03-native-candidate-readiness-preflight.md)
showed browser candidate1a014c4 redirected an access-only native renderer to login.
The new candidate is a semantic backport over that exact immutable browser candidate,
not a transplant of the current50-module/31-delta provider comparison or all of main.
[Manifest](090/2026-10-03-embedded-profile-source-manifest.json) pins426 runtime paths:
20delta (13 product modules, seven tests), 406byte-identical browser-v3 paths, and the
40module/84edge profile/provider/legacy-access closure. Package/lock/SQL/Edge handlers,
chat/write/upload/offline/annotation schema and ordinary repertoire behavior are retained.
[Lossless patch](090/2026-10-03-embedded-profile-source.patch.b64) and the separate
local Git ref preserve exact source after disposable runtime cleanup.

Existing current bridge/protocol/lease vault/Auth proof are reused. Native remains the
only refresh-token owner; WebView receives only an access lease after challenge/ack,
Auth-user verification and server-current active membership proof. No browser session
seeding or refresh credential is used in embedded scenarios. The Supabase client is
lazy browser Auth or a non-persisting guarded accessToken data client; clear removes
the lease synchronously before async cleanup. Authorization is never an AI judgment.
Current source input hashes and five actual native compiler-input hashes are recorded.

Explicit cut points:

- Baseline has no annotation save queue. Omit only its current imports/discard calls
  and unused test mocks; keep all existing test assertions. Baseline chat store/cache,
  offline/private URL caches and QueryClient teardown remain functional.
- Browser choir-switch body stays baseline, with the existing native-only switch guard.
  Existing current failure-before-clear signout semantics are retained without the
  newer annotation transition wrapper. Failed browser signout must not erase chat state.
- Existing current active-membership refusal/revalidation is carried in AuthProvider;
  no metadata claim or stored preference authorizes a choir. Native identity never
  selects a different tenant as a fallback.
- Supabase initialization/proof/lease functions are current source; baseline exported
  types and drive helper stay baseline. No catalog/write/upload dependency expansion.
- Legacy private URL loader keeps browser-v3 cache/race behavior and imports the actual
  web access capability rather than its earlier browser-only helper.
- Layout/profile/native theme/signout and foreground-notifier wiring use existing
  source. Ordinary browser navigation remains enabled; embedded web chrome is hidden.
- One line-specific lint exemption explains post-hydration bootstrap state publication
  in the existing provider effect. No global rule disable or reduced test threshold.

## Verification and limits

Node24.13.1 / pnpm11.9.0 / Next15.5.25 / Chrome154.0.8037.93; existing dependencies,
no installation. Runtime uses exact loopback app31090 and synthetic service54491,
existing compile-time090 origin guard. Actual production Next, actual current native
controller in Node, actual Supabase SDK and web lease/proof machinery. Auth/REST replies
are explicit synthetic fixtures; Realtime is blocked. Chrome is message transport,
**not RN renderer, navigation callback, native consent/download/share or RLS proof**.

| Criterion / expected behavior | Required? / N/A reason | Status | Date, revision, environment, command/scenario | Evidence and limits |
|---|---|---|---|---|
| Minimum closure, missing mount refusal, no unrelated dependency promotion, byte-safe assets | Yes | PASS | 3Oct, sourcee5cc1d7; `node --test supabase/test-support/090_candidate_embedded_source.test.mjs` | 6/6; rejection signals are not authorization certificates |
| Challenged profile opens without login | Yes | PASS | Actual Next/current controller, `090_candidate_embedded_runtime.mjs --owned-loopback` | ready→challenge/ack→context.apply→Auth/current membership→visible Synthetic Profile; controller running, one lease, five authorized fixture requests |
| Clear removes visible profile, no browser fallback or subsequent private request | Yes | PASS | Actual controller `clearAndRun('choir-switch')` | One capability clear; profile hidden, remains /profil, request count unchanged |
| Wrong server-current choir refused | Yes | PASS | Fresh isolated context, mismatched native choir | One lease, Auth + membership only; no profile member request/content |
| Foreign bootstrap origin refused | Yes | PASS | Fresh foreign31091 origin, exact Next responses proxied by test transport | No lease, no Auth/REST request, locked error UI; not a real remote provider |
| Credential not persisted | Yes | PASS | All four fresh scenarios | No sb-* local/session key; access credential absent under all storage keys |
| Ordinary browser no-session entry preserved | Yes | PASS | No embedded surface, /profil→/login | Visible login button and actual login image decoded; authenticated browser runtime not repeated here |
| Candidate full gate | Yes | PASS | 3Oct11:36 TRT, final byte-safe source; guarded local `pnpm --config.verify-deps-before-run=false check` | lint/types/41files406tests/coverage/SW/build; coverage88.88/77.96/96.87/91.27; workspace-root warning retained |
| Root full gate | Yes | PASS | 3Oct11:37 TRT, final source; synthetic example Auth env, same check | lint/types/114files1178tests/coverage/SW/build; Node6 separate from1178 |
| Pins, patch, scope/diff/links/redaction, cleanup/separate commits | Yes | PASS | Local Git pin and document exit checks | Main/browser pin unaffected; self-review only, not independent review |
| Actual Android/iOS, legacy Next native file renewal, all permanent route write/read APIs | Deferred required release gate | NOT RUN | Next integrated checkpoint | Existing native reader rejects legacy Next issuer; profile-only acceptance does not repair it |
| Hosted SQL/Edge/web/Auth/provider, R1/fresh preflight, distribution/independent release review | Required before live | NOT RUN | No authority exercised | Live NO-GO remains |

Final [runtime evidence](090/2026-10-03-embedded-profile-runtime.json): four scenarios PASS,
unexpected HTTP0, browser errors0, transport errors0, outside requests0; processes closed.
Mobile product source did not change; earlier mobile unit/platform records remain historical.
The six added candidate suites contributed177 tests; the focused seven-suite run including
legacy loader passed182/182 before final full406 gate. No pre-change green reused as final.
Document exit:86 local links, four evidence JSONs,426 Git source hashes, exact decoded
patch/Git diff equality, current source/native provenance hashes and secret-pattern scan PASS.
Main and candidate `git diff --check` PASS; review was primary-agent self-review only.

## Failed approaches and causal repairs

1. Initial focused run: missing capability exports in legacy test mock (five failures),
   plus failed-signout cache regression (one failure). Update only mock interface; use
   existing failure-before-clear signout, not a new queue or a removed assertion. 182/182 PASS.
2. Initial candidate gate: existing bootstrap effect met baseline's compiler-advisory
   lint rule. Add the one-statement explained exemption; no broader config transplant.
3. [Initial runtime](090/2026-10-03-embedded-profile-runtime-initial.json): profile had
   opened, but harness sent unsupported `tenant-change`; clear UI wait failed. Protocol
   declares `choir-switch`; repair the driver, not application guards. Four scenarios pass.
4. Source self-review then caught UTF-8 conversion of unchanged binary assets. Preserve
   the earlier [pre-byte-repair record](090/2026-10-03-embedded-profile-runtime-pre-byte-repair.json)
   as provisional, not final source acceptance. Generator now uses raw Git bytes for
   every unchanged path; explicit PNG corruption regression and all406 baseline hashes.
   Repeat final candidate full gate/runtime and final root gate on repaired generator.

## Resources, authority and next action

Preflight21,359,816KiB free, lowest observed20,417,944KiB (>10GiB floor). No emulator/VM/
APK/new dependencies. After final pin, removed only owned embedded-candidate503364KiB,
root.next503220KiB and coverage352KiB; final21,340,272KiB available. No31090/54491 listener.
Preserved original browser-v3 branch/history, dependencies/AVD/CoreSimulator/global caches,
backups and unrelated supabase/.temp/cli-latest. Small essential source/hash/failure records
retained; no disposable runtime copies. Sourcee5cc1d7 and separate document commit handed off.
No real-user data, chef-note deletion, sibling site change, push/CI/deploy/provider action.
TypeSafe kept deterministic security in code; no new Jev inference, **$0 Jev cost**.
2October key permission was not extended to3October. Supabase changelog anonymous HTTP
fallback succeeded (web fetch unavailable); no relevant SDK breaking change observed in
the current index; no SDK upgrade. [Initialization docs](https://supabase.com/docs/reference/javascript/initializing)
and [TypeSafe index](https://docs.typesafe.ai/llms.txt) checked.

NEXT: trusted configured-app-origin legacy-Next native single-renewal support, then exact
Android-first profile/file consent/hash/401/403/A→B acceptance and grouped platform-sensitive
iOS. Audit other permanent-route reader/mutation helpers (retained older browser-only APIs)
before claiming full WebView compatibility. Preserve raw-media-log/independent-review/R1/
refresh-forward-repair/hosted gates; no live authority inferred from this local checkpoint.
