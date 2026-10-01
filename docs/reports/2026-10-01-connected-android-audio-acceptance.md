# Connected Android audio — local acceptance, 1 October 2026

Source/test `6fed2ac`; Jev tooling `9f07d35`. Owned checkpoint of
[090](../briefs/090-private-file-ticket-revocation-contract.md), which remains
**IN PROGRESS**. Primary-agent self-review, not independent review or beta acceptance.

## Outcome and exact boundary

Android API36 Release, product AuthProvider/AuthStore/SecureStore,
AudioPlaybackProvider/ExpoAudio and audio-source gateway exercised actual local
Auth/PostgREST/RLS, repertoire-file Deno entrypoint and signature-verified synthetic
loopback S3 audio. This joins the previously separately accepted player and service.
The test UI automates those product components; it does not retest the catalogue UI,
hosted Cloudflare R2, unmodified Kong functions, native iOS or physical audibility.
React Native/Expo remains the target; Flutter remains only an alternative.

Only the disposable `genova-090-runtime` stack received source application schemas
and existing prerequisite migrations:024,041–045,053,057,historical review audio,
058–060,078,090. Original068 rows were not copied. Restore used one transaction on
verified-empty application schemas; factory Auth stayed separate. The four services
were DB/Auth/REST/Kong; Deno and synthetic storage ran separately on loopback.
Colima initially forwarded API/DB on all interfaces; before fixture credentials were
created, those two forwards were replaced with verified127.0.0.1-only listeners.
No claim is made that the default local CLI configuration itself is loopback-only.

One-use runtime credentials returned POST200 then POST410, never public password
variables or a credential JSON file. Three successful genuine ticket POSTs were
followed by a denied A POST from B. Explicit test-only faults/transport:

- source1 replaces a genuinely issued URL with a valid signed legacy v1;
- source2 retains actual v2 but injects a short client `expiresAt`, not server expiry;
- source3 is an ordinary newly issued v2, saved for the revocation check;
- source4 reuses that earlier valid v2 after B, without another POST;
- POST URL origin/path is normalized to satisfy the shared client; GET/HEAD forward
  unchanged signed query bytes to actual Deno. Authority and signatures are not mocked.

## Evidence

| Required checkpoint criterion | Result | Evidence / limit |
|---|---|---|
| Guarded isolated config / one-use runtime Auth / product choir selection | PASS locally | [Native trace](090/2026-10-01-connected-audio-native.txt); real synthetic session, two memberships, actual selection A then B |
| v1 refusal → one authority renewal → actual native audio load | PASS locally | [HTTP record](090/2026-10-01-connected-audio-http.json): GET401×4 from native codec retries, HEAD401×1, then source2 POST200 and GET200. One application-level renewal, not one network GET |
| Client-deadline renewal preserves seek/playback | PASS locally | seek4, source3 POST200, playback≥4.2, pause/seek2/playback≥2.2. Full160044B GET200×2 and Range GET206×2; SHA-256 checked per whole/ranged payload |
| Actual B selection clears source / earlier A URL refuses | PASS locally | Player/session/ticket cleared; oldHEAD403, newPOST403; injected earlier-v2 native GET403×4 and HEAD403×1, no renewed POST |
| Denials do not access storage | PASS locally | All401/403 read providerDelta0; all four allowed reads providerDelta1, complete AWS4-HMAC signature verification, exact audio/wav bytes |
| Connected fixture teardown / independent session / inactive member | PASS locally | [Gate summary](090/2026-10-01-connected-audio-gates.txt): fixture exits0; same-session switch denial, separate A session stays A, inactive membership rejects new and already-issued tickets |
| Fresh mobile / web / Deno / Jev tooling checks | PASS locally | Mobile TS +55 suites/401 cases; root `pnpm check` lint/TS/107 files1075 tests/coverage/SW/Next build; separate Deno check +11 tests; Jev Node tests3 (combined tooling7) |
| Actual Release / normal native-only JS exports / guard removal | PASS locally | Initial offline build71s, final incremental8s; Android install/launch/trace and visually inspected ALL PASS screen. Fresh normal Android/iOS exports; correct loopback XML and manifest reference absent after normal prebuild |
| Native iOS / server expiry / hosted / physical audibility / load / beta | NOT RUN | Required broader090/release gates remain open; client deadline is not server expiration and exports are not native iOS |

Accepted Android run15:10:37–15:10:46 Istanbul /12:10UTC. APK SHA-256
`7d506ba94a6c3833d5f46d4e50be6d9d97e32129d6e4d95d82983e9ceb382dda`.
10-second mono8kHz16-bit PCM440Hz fixture160044B SHA-256
`a368aca90c310ca6a84ff4b3e29dc3ca27d99d229edd8d8c460a97061d2297a7`.
No binary/build/runtime copy retained merely for history.

## Failures, fixes and engineering review

IMPORTANT — first fresh root TS failed: previous090 Deno HTTP harness was included
in browser/Node compilation, pulling Deno globals/npm imports; Vitest would collect
its Deno.test file. `tsconfig.json` excludes only090_http_*.ts; `vitest.config.ts`
excludes its Deno test. Separate fresh Deno check/test is retained as a required gate;
Node fixture tests still execute in root Vitest. This does not suppress product checks.

[First native attempt](090/2026-10-01-connected-audio-first-attempt.txt) failed at
selectA: `signIn` completes before asynchronous AuthStore membership hydration.
The harness now waits for its real membership-selection state, as the product UI does.
No Auth/RLS product fix is attributed to this harness error. A pre-runtime fixture
was also stopped unaccepted after correcting the relay's relative-ticket base URL.

IMPORTANT — [second native attempt](090/2026-10-01-connected-audio-second-attempt.txt)
passed recovery/seek/playback but B teardown timed out. Actual DB confirmed B;
source/time/ticket were cleared, while outward native status stayed loaded/playing.
After two native failures we inspected state and wrote a meaningful red regression:
13 pass/1 fail, cleared session/ticket but playing/loaded/buffering remained true.
The initial regression draft reused unchanged JSX and did not rerender; corrected
before treating its failure as causal evidence. AudioPlaybackProvider now gates those
outward flags by source presence; existing pause/invalidation/server authorization
remain intact. The late-status regression passes and the third Android run passes.
This is a stale UI-state fix, not evidence of previously leaked authorized bytes.

Self-review checked unchanged native ownership, shared authority, bounded renewal,
scope guards, secret handling, signature/hash checks and no new Next API/schema migration.
The strengthened signature helper is shared with prior PDF/WebView fixtures, but those
older native runs were not rerun in this audio-only checkpoint.

## TypeSafe/Jev advisory and cost

The TypeSafe skill's citation-check pattern informed a redacted, hash-frozen
[request](090/2026-10-01-jev-connected-audio-request.json) and separately frozen
[primary labels](090/2026-10-01-jev-connected-audio-labels.json). One call,
11 independent questions,10656B; no secrets, binary/audio, real user/data or retries.
Unknown/unrun and explicitly contradicted claims have disjoint criteria.
[Response](090/2026-10-01-jev-connected-audio-response.json): jev-1.13.0,
396ms,3825 input/467 output;10/11 labels agree. Recovery chose `contradicts`,
confidence0.54. Retain the disagreement, not a fabricated model explanation.
Primary review confirms one source2 authority renewal for the v1 failure; source3
is the separately injected client-deadline renewal. Native codec GET retries are
not extra ticket renewals. The model does not override this observed event sequence.

[Official current model pricing](https://docs.typesafe.ai/models) was verified:
$0.042/million input, output free. Call estimate **$0.000160650**; today's recorded
15 calls:57977 input/7163 output, estimated **$0.002435034**. Not an invoice;
Codex per-turn cost unavailable. Local runtime used no hosted provider, and the key
was accepted through non-echoing TTY only, not persisted or repeated in artifacts.

## Cleanup and next checkpoint

Original068 five-table aggregate hash unchanged, counts28/1/29/9/79.
Fixture/Deno/storage stopped, task app uninstalled, reverse ports removed, emulator
stopped. Exact Supabase stack/volume and genova090 VM/data deleted; task listeners
54491/54492/8000/18092 absent. Generated mobile android/.expo, root.next/coverage,
spike090 and empty093 runtime removed after small redacted evidence was retained.
Those generated outputs are not recoverable; source/evidence remain in Git.
Dependencies, existing AVD/global caches, original restore/backups/private journals
and unrelated CLI marker preserved. Measured preflight23701200KiB, lowest recorded
15382484KiB, final22541468KiB, all above10GiB floor. Reusable AVD growth remains;
no broad cache purge. No push/deploy/hosted DB/Edge/provider/real data/device action.

090 stays open for its integrated native-iOS checkpoint and separately authorized
hosted/release layers. Next Android beta critical-path work is current assignment
version → tenant-aware protected-file reader integration in the existing permanent
WebView (performance query/HomeworkCard legacy preference), under one new bounded
brief. Do not rewrite that WebView natively or repeat unrelated small chat features.
