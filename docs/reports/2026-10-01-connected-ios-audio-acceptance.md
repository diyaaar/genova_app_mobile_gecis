# Connected iOS private audio acceptance — 1 October 2026

Local audio slice of [090](../briefs/090-private-file-ticket-revocation-contract.md),
entry `main/5ea21f1`, product fix `db6cc93`. Corrected actual native flow and unchanged
fixture tail PASS.090 remains IN PROGRESS; this is not beta, hosted or release acceptance.
Primary is sole writer and self-reviewer, not independent review.

## Reproduced blocker and repair

[First actual native attempt](090/2026-10-01-ios-audio-first-attempt.txt) refused v1,
renewed once and sought4s, but expiry/resume timed out with generic playback error;
there was no third POST and unchanged fixture exited1. This failed attempt is retained.

Installed `expo-audio/src/ExpoAudio.ts` recreates the native player on source change;
`expo/src/hooks/useEvent.ts` retains its previous snapshot until the new emitter tick.
Our `AudioPlaybackProvider` used that snapshot without checking player identity, so the
old player's error/loaded/position could contaminate the renewed player. Primary source
inspection identified this candidate before Jev's advisory, not because Jev discovered it.

New meaningful unit regression:14 existing tests PASS/new test FAIL with stale error and
loaded/canControl=true. Five-line provider repair uses emitted status only when its id
matches `player.id`, otherwise native `player.currentStatus`.15 focused tests/TypeScript
then PASS. Minimal test mock adds native id/currentStatus; mock clearing now ignores
nonfunction metadata. No SDK patch, dependency, Auth/schema, security bypass, weakened
assertion or broader refactor. Existing403/no-loop/tenant/unmount behavior is retained.

## Exact architecture and evidence boundary

Real local Expo AuthStore/SecureStore/choir choice/audio player, disposable PG17.11/Auth/
PostgREST/Kong54491/54492 and actual Deno `repertoire-file` index8000. Observer18092 serves
signature-verified synthetic S3-compatible bytes and relays signed queries unchanged.
Valid signed-v1 substitution, client-deadline and old-v2 injection are explicit faults;
this is not hosted R2, physical audibility or actual server-expiry evidence.

Schema-only source export preserves owners/ACLs; committed migrations applied atomically
to disposable target, no source row/Auth-user copy.090 RPC execute anon/authenticated/
service flags f/f/t. Three sibling mail triggers disabled only on synthetic target.
Wrong historical RPC-name query and node --import loader preparation failures made no
source changes; inspected current migration and existing tsx shim resolved them, no install.

| Criterion | Required here? | Result | Evidence / limit |
|---|---|---|---|
| SDK/resource/config/signature preflight | Yes | PASS | Existing Xcode26.6/17F113, CocoaPods1.17/iOS26.5; actual local public anon in bundle, service key absent; strict deep codesign |
| Meaningful regression and narrow repair | Yes | PASS | Reproduced14pass/1fail then15pass; no assertion or authority weakening |
| Corrected normal arm64 Release build | Yes | PASS | exit0,158904ms;1113 warning matches, no compiler error lines; no signing override |
| Actual native v1 refusal/one renewal/seek | Yes | PASS | GET401/HEAD401/provider0 → POST200/RangeGET206; native seek4 |
| Client deadline renewal/resume/pause/seek | Yes | PASS | Third POST200, native resume>=4.2s, pause/seek2/resume |
| Actual AuthStore B teardown and old URL refusal | Yes | PASS | Old HEAD403/new POST403; injected previous v2 native GET403/probe403, no renewal; provider0 |
| Complete unchanged fixture tail | Yes | PASS | Foreign/old-context denial; same-session revokes, separate session remainsA; inactive membership new/issued denial; exit0 |
| Fresh mobile TypeScript/full unit tests | Yes | PASS |55 suites406 tests,3.511s; existing SafeAreaView/punycode/npm-config warnings |
| Fresh normal guard-off Android/iOS JS exports | Yes | PASS |1440 modules each; not Android native runtime |
| Fresh root pnpm check | Yes, conservative final gate | PASS | Lint/typecheck110files1110tests/service-worker/Next production build; exit0 |
| Jev packet/response/offline validation | Yes | PASS advisory |5 offline validator tests, exact hash/typed probabilities/frozen labels; no new provider call |
| Original source preservation | Yes | PASS | Five tables/counts28/1/29/9/79 and fresh before/after row hashes identical |
| Exact owned cleanup/links/diff/redaction | Yes | PASS | Verified after cleanup; final22293524KiB free; no task listeners/booted simulator |
| Fresh Android native runtime after this shared repair | Broader090 | NOT RUN | Historical Android audio remains dated; new JS/unit pass does not relabel it |
| Current integrated iOS permanent WebView | Broader090 | NOT RUN | Next consumer, not accepted by audio |
| Hosted/provider/physical phone/Drive withdrawal/beta/stores/load | Separate gates | NOT RUN | No product-completion claim |

Automatic [HTTP record](090/2026-10-01-connected-ios-audio-http.json): POST200/200/200/403,
two full160044-byte Range206 reads, SHA256
`a368aca90c310ca6a84ff4b3e29dc3ca27d99d229edd8d8c460a97061d2297a7`.
Every observed401/403 body refusal has providerDelta0. [Native trace](090/2026-10-01-ios-audio-native.txt)
is primary transcription of actual CUA/stdout, not a raw-log export; screenshot actually inspected.
Corrected bundle SHA256 `b506b853f3ef2418f8415da71f0f593e3b5040c7c4be96fc77200c4a689e8691`,
73-file app manifest SHA256 `7d4a84f11ad39323873099f86f8979e37b6f97c35270f67f5bb5ddbc709aaf31`.
Historical Android HTTP SHA256 remains `5b215d2ab6220882303beda2689df565b3343b2efacb3a0b9e15393cc70ed08f`.

## TypeSafe advisory and cost

TypeSafe skill guided bounded triage/regression selection and evidence-vs-claim/no-match
checks, not authorization or native acceptance. Current official [coding-agent guidance](https://docs.typesafe.ai/introduction/coding-agents),
[API](https://docs.typesafe.ai/api), [Choice](https://docs.typesafe.ai/primitives/choice) and
[models/pricing](https://docs.typesafe.ai/models) reviewed.
[Request](090/2026-10-01-jev-ios-audio-triage-request.json),
[frozen labels](090/2026-10-01-jev-ios-audio-triage-labels.json),
[attempt/provenance](090/2026-10-01-jev-ios-audio-triage-attempt.json),
[response](090/2026-10-01-jev-ios-audio-triage-response.json):5420B/five questions,
jev-1.13.0,409ms,1595input/241output, one request/no retry.5/5 label agreement comprises
three recommendations and two claim/no-match controls, not objective diagnostic accuracy,
causal proof, calibration or independent review. Real regression/native execution established acceptance.

New estimate **$0.000066990**;1October cumulative20calls73107input9227output/**$0.003070494**,
at documented$0.042/M input/outputfree. Not provider invoice or total coding-agent cost.
Prior workflow advisory plus this triage$0.000214074 remains below combined$0.002 cap.
No whole repo, private user/audio/DB contents or credentials in packet/evidence.
**Terminal input masking failed:** readline with output re-echoed the already chat-exposed
key despite stty-echo. Key was not persisted in repo/env/artifacts, but tool transcript
exposure occurred. Owner was informed; no further inference or after1October reuse.
Owner's replacement is still required; no credential rotation authority inferred.

## Resources, ownership and next action

Entry22427024KiB; floor10485760KiB/safety12500000KiB. VM/image<=6GiB staged before
stopped-VM/native<=4GiB. First build166483ms; failed device2BCDDBEA… deleted before
corrected build. Corrected-build measured free15548780KiB, runtime/root gate stayed abovefloor.
Owned native intermediates~2.45GiB and46MiB app removed after last dependent checks.
Final simulator6D11F09C… uninstalled/stopped/deleted; four-service genova-090-runtime stack/
volume, colima genova090/root/data/profile/tunnel and generated090/093/.expo/.next/coverage
removed. Temporary synthetic rows/builds are intentionally not recoverable; small evidence retained.
Original068 restore/backup/private copy manifests, dependencies, global caches and shared devices
preserved. [Five source tables](090/2026-10-01-ios-audio-source-preservation.json) unchanged;
this is not all-row backup/restore/live-production proof. Final22293524KiB; unrelated
supabase/.temp/cli-latest remains unstaged. No hosted/real-data/credentials/push/CI/deploy/hardware change.

Next bounded work: measured connected iOS permanent WebView integration using existing090
flow, then fresh Android native audio regression for the changed provider before closing the
both-platform checkpoint. Preserve RN/Expo/WebView ownership and all remaining090 gates.
