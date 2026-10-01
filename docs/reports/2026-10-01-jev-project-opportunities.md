# Jev project opportunities — first two stages

1 October 2026. Actual TypeSafe API calls, not a simulated Jev report. Author:
primary agent. User retains React Native/Expo; Flutter is only an alternative.
Runner `6bb2e3d`; preparation repository baseline `8b3e1f5` plus owned pilot records.
This report separates model outputs from source facts and engineering recommendations.

## 1. What was actually examined

Stage1 supplied the full public [Introduction](https://docs.typesafe.ai/introduction)
and [Jev with coding agents](https://docs.typesafe.ai/introduction/coding-agents).
Six separate Choice questions checked output type, context delivery, code-writing
responsibility, decomposition, candidate selection and execution evidence. All six
selected the expected label. This is a tiny smoke control, **not calibration,
general model accuracy, a native test or an independent engineering review**.
Repository/context answer confidence0.82; execution-evidence answer confidence0.56
(execution_required probability0.71, unknown0.29). Do not hide that uncertainty.

Stage2 supplied an English, redacted architectural fact packet and eight bounded
candidate descriptions. It did **not** browse/read the whole repository. The primary
agent selected and verified the facts; source paths/hashes identify provenance, not
proof that Jev opened the files. The model cannot propose an omitted option in this
closed-set survey. No real choir/user content, host IDs, credentials or full source
was sent. No Flutter/RN winner question was asked and no framework choice changed.

Verified sources include:

- [MIGRATION](../../MIGRATION.md): native/permanent-WebView ownership and RN target.
- [Shared choir contract](../../lib/choir-context-core.ts): platform-free logic;
  Auth/session/membership decisions remain server authority.
- [Annotation contract](../../lib/repertuvar/annotation-types.ts): shared typed schema.
- [Native reader](../../apps/mobile/src/repertoire/reader-gateway.ts): bounded file
  recovery, operation-version/tenant lifetime and real native rendering interface.
- [Performance query](../../lib/korist-performance.ts) and
  [HomeworkCard](<../../app/(main)/koristler/[id]/page.tsx>): missing version selection
  and legacy-link preference are **already known source findings**, not Jev discoveries.
- [090](../briefs/090-private-file-ticket-revocation-contract.md): dated acceptance
  distinctions and remaining HTTP/connected-audio/iOS/hosted/device gates.

## 2. Actual Jev judgments

All values below are returned by pinned `jev-1.13.0`. Confidence is distribution
concentration, not probability that the workflow succeeds, ROI, test execution or
permission to act. Stage2 asked which approach fits, not whether a feature is ready.

| Candidate | Jev selected approach | Selected probability | Confidence |
|---|---|---:|---:|
| Web/native behavior parity | Bounded evidence verification | 0.89 | 0.85 |
| Match an acceptance claim to evidence | Bounded evidence verification | 0.67 | 0.59 |
| Redacted failure triage | Candidate selection | 0.78 | 0.73 |
| Narrative documentation drift | Bounded evidence verification | 0.96 | 0.96 |
| Search over already-authorized text candidates | Graded ranking | 0.64 | 0.55 |
| Repertoire title/composer equivalence | Candidate selection | 0.90 | 0.87 |
| Replace tenant/role/file authority with AI | Deterministic only | 0.98 | 0.97 |
| Jev directly validates PDF pixels/audio/stylus/runtime | Deterministic/platform tests | 0.95 | 0.93 |

Evidence matching also assigned0.30 to candidate selection; search assigned0.25.
Those are plausible alternate decompositions, not proof of an error. Test selecting
relevant candidates separately from verifying each claim; do not invent a universal
confidence cutoff or flatten the distinction between probability and confidence.
The descriptions and options were engineer-authored and directional; this is an
initial shortlist, not an impartial exhaustive architecture audit or measured value.

## 3. Engineering interpretation and priority

These are **primary-agent recommendations informed by Jev**, not generated reasons
from Jev (the model returns structured judgments, not a reasoning essay).

1. Start with migration behavior/evidence parity. Build a small packet for the current
   private-file flow: web/native confirmation, v1 refusal/one renewal, tenant clear,
   revoked URL, and in-flight request versus authority commit. Jev can flag semantic
   mismatches between expected behavior and evidence; real tests decide correctness.
   This supports 090's ready critical path rather than adding a new product feature.
2. Add documentation drift/claim checks to checkpoint review. Supply exact short
   source excerpts and dates; use one assertion per check, include unsupported and
   contradictory evidence. Current source/owner choices win over model judgments.
3. Add failure triage only as a routing hint: transport/body/content/Auth/tenant/race/
   platform/unknown. Record whether the engineering reproduction confirms the hint.
   Do not let Jev autonomously issue SQL, change policies or repeat expensive builds.
4. Investigate repertoire entity matching with synthetic examples before any import:
   accents, translated titles, composer aliases, similar-but-different arrangements,
   missing candidates and exact duplicates. Code handles exact matches and constraints;
   never automatically merge records because of confidence.
5. Consider tenant-scoped semantic search only if a concrete search problem justifies
   it. RLS/code retrieve permissible candidates **before** inference; Jev ranks only
   that set. Evaluate with Turkish/domain examples and privacy/latency/cost controls.
   No new retrieval infrastructure or runtime integration is approved by this report.

Do not use Jev for deterministic access grants, hash/signature checks, schema/ID
validation, concurrency locks, actual device/renderer/audio measurements, selecting
deployment targets or claiming a migration passed. It can help choose relevant test
cases or compare textual assertions about those subjects, but cannot replace execution.
Image/audio preprocessing may yield textual evidence for a later semantic judgment;
that does not mean Jev directly processes or validates the original media.

## 4. Next small experiment — not yet run

Prepare a manually source-labeled web/native private-file parity set (about20 pairs):
supported, contradictory, incomplete, stale-version, wrong-tenant and no-match cases.
Include known semantics that deterministic checks already settle as controls. Extract
only the relevant contracts/test observations; do not send private logs or full repo.

Read the chosen Noul/Choice/citation-check guidance before the next call. Separate
candidate selection from assertion verification. Compare Jev suggestions with labeled
outcomes and a deterministic/manual baseline; count false support separately from
missed support, plus disagreements, unavailable-provider handling, latency and tokens.
No production threshold is chosen from these two introductory calls. A small held-out
set and Turkish examples are still required before a broader decision-support claim.

Then use the results to assist the real HTTP/COMMIT test matrix, without delaying it
for an unrelated AI platform. Framework alternatives and product AI use cases are
later separate packets. Broader use follows measured value, not “AI everywhere”.

## 5. Trace, cost and limits

Two successful evaluations at12:10 local (UTC timestamps retained), zero service
retries, 14 typed questions total. Stage1:2731 input/249 output tokens,3535ms;
Stage2:4385 input/593 output tokens,394ms. Total7116 input/842 output tokens.
At the current [documented price](https://docs.typesafe.ai/models), estimated inference
cost **$0.000298872**, not invoice-confirmed cost. No general latency benchmark inferred.

Small [evidence directory](jev-analysis) retains model answers, usage, attempt/request
hash chain, exact questions, project facts and source/public-doc hashes. Entire
third-party public document bodies were omitted after inference; URLs/hash identify
the fetched version, but later upstream edits can prevent exact text reconstruction.
No extra inference after metadata retention/private-env support was added. Runner
guard/syntax5 tests PASS; request/attempt/response hash chains match; retained secret
scan0 matches. No application/SDK/package/DB/native/runtime change or product-test pass
is claimed. Existing unrelated CLI marker preserved. Key not in retained files or
public environment; prior chat/tool transcript is not a secret vault: rotate it
before broader use. Provider retention/ZDR was not checked or guaranteed.
