# Jev workflow opportunities and iOS audio preflight — 1 October 2026

Entry `main/b390fac`. [WF-015](../briefs/WF-015-jev-assisted-project-analysis.md)
advisory checkpoint and first source-preparation step of [090](../briefs/090-private-file-ticket-revocation-contract.md).
Sole primary writer, self-review only. Useful next action is still actual connected iOS audio,
then permanent WebView, not a new AI feature or infrastructure framework.
Source checkpoint `fd55322`; source and advisory/status records committed separately, no push.

## Current introduction and method

Read the supplied [introduction](https://docs.typesafe.ai/introduction), current coding-agent,
use-case-map, API, Choice, semantic-find cookbook and model pages using the TypeSafe skill.
Jev evaluates supplied text/state and typed questions; the coding agent supplies context,
tools, code and verification. It does not generate an audit essay, autonomously search files,
listen to audio or grant access. [Official coding-agent guidance](https://docs.typesafe.ai/introduction/coding-agents).
Public source facts were condensed by the primary agent, not presented as verbatim documents.

One actual12-question request,12399B, pinnedjev-1.13.0,541ms/no retries; metadata and frozen
primary labels retained separately from inference. [Request](jev-workflow/2026-10-01-audio-preflight-request.json),
[provenance](jev-workflow/2026-10-01-audio-preflight-provenance.json),
[labels](jev-workflow/2026-10-01-audio-preflight-labels.json),
[attempt](jev-workflow/2026-10-01-audio-preflight-attempt.json),
[response](jev-workflow/2026-10-01-audio-preflight-response.json).
No entire repository, private user/choir data, secrets, tickets or source DB functions transmitted.
Key accepted via non-echo runtime input, not argv/public environment/file; chat is not a vault.

## Actual judgments and proposed adoption

| Candidate | Jev result/confidence | Primary decision and next useful application |
|---|---|---|
| Semantic code lint | workflow_now/1.00 | Check tiny changed snippets against one convention, including platform/evidence labels; source and regression decide |
| Web/native test-gap mapping | workflow_now/0.94 | Map one invariant to dated positive/negative/missing test descriptions before the next integration; test names do not prove execution |
| Change-impact candidate ranking | workflow_now/0.98 | Start with rg/import evidence; rank a bounded caller shortlist, then verify actual callers and completeness |
| Release-note claim checking | workflow_now/0.92 | Catch platform/provider/gate overclaims before preparing a release packet; never authorize deployment |
| Similar-incident matching | workflow_now/0.94 | Match a new redacted failure to bounded previous incidents, with no-match; reproduce before applying an earlier fix |
| Repertoire metadata matching | synthetic_later/1.00 | Later synthetic title/composer duplicate pilot; no real catalog export or automatic merge now |
| Model-based tenant authorization | deterministic_platform/0.79 | Reject the proposed replacement; SQL/Auth/Edge remains authority regardless of confidence |
| Direct audio/pixel/runtime inspection by Jev | deterministic_platform/0.87 | Keep native/platform checks; only their textual observations may later be reviewed |

Two actual source selections matched the fixture evidence writer and native B-selection
automation; billing negative control correctly selected no-match. Portability question correctly
identified a harness gap, not an iOS runtime PASS. Four directly checkable controls4/4; all12
frozen labels agree, but eight opportunity labels are recommendations, not general accuracy,
calibration, cost savings or independent review. Confidence summarizes concentration, not truth.
All answers primary-reviewed; authority rejection stands even at0.79. No further tuning/call.

## Source blocker and implementation

BEFORE inference, primary `rg`/source reading found:

1. Native connected-audio success trace hard-coded Android and excluded iOS even if run on iOS.
2. Server fixture wrote one already-existing immutable Android report with `flag:'wx'`; a new
   iOS run would refuse that path rather than produce fresh evidence. Never overwrite the old report.

Scoped repair: native summary derives from `Platform.OS`, refuses unsupported platforms and
preserves exact old Android wording. Server accepts only fixed android/ios evidence targets,
defaults Android for compatibility, retains wx/no-overwrite and all existing HTTP/provider
assertions. Explicit `GENOVA_090_CONNECTED_AUDIO_PLATFORM=ios` requires existing audio mode;
no public credentials, unknown platform or arbitrary output path accepted. Normal product entry,
Auth/RLS/ticket logic, microphone/network permissions and dependencies unchanged.

Relevant sources: `apps/mobile/src/acceptance/090_connected-audio-{config,runtime}.ts*`,
their config test, `supabase/test-support/091_connected_audio_fixture.ts/.test.ts` and existing091 runner.
No product playback rewrite, generic AI runner/framework or CI integration added.

Regression actually drove the handler through mocked HTTP ticket/read observations and a mocked
filesystem writer. Before repair it selected the retained Android path instead of the iOS path;
after repair it selected the separate iOS path/platform/boundary and retained wx. This is a unit
handler test, NOT genuine Auth/RLS/native playback. A first mock lacked the default module export;
the next partial mock still used its real default writeFile and safely failed EEXIST on the retained
Android file. Reassessed the transpiled default import and mocked both export shapes before
accepting the meaningful wrong-path red regression. The original report hash remained identical:
`5b215d2ab6220882303beda2689df565b3343b2efacb3a0b9e15393cc70ed08f`.

## Acceptance evidence

| Criterion | Required here? | Status | Evidence / limit |
|---|---|---|---|
| Current docs/skill and minimal bounded packet/frozen labels | Yes | PASS |12-question actual request and hashes; primary summaries, no whole source upload |
| Actual useful judgments, source selection and no-match | Yes | PASS advisory |4 direct controls,8 recommendations; no calibration/general-accuracy claim |
| Meaningful wrong-path red→green and source-only platform labels | Yes | PASS |Fixture10 tests/mobile config23; unsupported platform/path refusal, unchanged wx/assertions |
| Fresh mobile typecheck/full tests | Yes | PASS |`npm run check -- --runInBand`:55 suites405 tests,3.855s |
| Fresh root gate | Yes | PASS |`pnpm check`:eslint/TS,110 files1110 tests/coverage,service-worker syntax,Next production build; not runtime DB/provider |
| Guard-off normal Android/iOS exports | Yes | PASS |`EXPO_NO_DOTENV=1 npx expo export --platform ios/android ... --max-workers2`, sequential; Hermes bundles, not signed native runtime |
| Advisory schema/hash/labels and offline guard tests | Yes | PASS |Existing validator5 tests; current response exact model/question/probability envelope/request hash;12 labels |
| Local links/diff/redaction and owned cleanup | Yes | PASS |Final scoped scan/diff; generated.next/coverage/.expo removed, no VM/device started |
| Actual connected iOS audio/native build/Auth/RLS/seek/B flow | Broader090 | NOT RUN |No new native iOS audio HTTP record exists; this preparation does not accept runtime |
| iOS permanent WebView/hosted/physical audibility/beta/stores | Broader090/release | NOT RUN |Separate integration/provider/release authority retained |

Existing SafeAreaView/punycode/npm/NO_COLOR warnings were not suppressed. No dependency upgrade.
No local DB, provider storage, simulator, native build or real data touched this checkpoint;
unchanged Android/PDF observations remain dated historical evidence.

## Resources, cost and next action

Preflight22,467,888KiB free, no owned heavy runtime; source/record<2MiB and checks/exports<1GiB
budget. Sequential Next/build and native JS exports; generated.next477928KiB,coverage352KiB,
temporary mobile exports removed after dependent checks, preserving global caches/dependencies.
Final22,437,184KiB free, no owned VM/DB/device/native build created this checkpoint.
Only unrelated `supabase/.temp/cli-latest` is outside task ownership.
Jev3502input/683output, new estimate **$0.000147084**; daily19calls71512input8986output,
**$0.003003504**. [Live model pricing](https://docs.typesafe.ai/models):$0.042/M input/outputfree;
estimate, not invoice or coding-agent spend. No later failure-triage call needed for these
deterministically reproduced setup issues, and no real-data/runtime product AI adoption.

Next: fresh disk/SDK preflight and normal signed iOS audio build with genuine local CLIpublic
configuration, then existing real disposable Auth/RLS/Deno/signed synthetic storage and native
recovery/client-deadline/seek/resume/B teardown. Set explicit server platformios; retain actual
HTTP evidence at its distinct fixed path. Recheck existing fixtures and no early global sign-out.
Only new unclear redacted runtime failures justify the reserved triage call. Keep090 open.
