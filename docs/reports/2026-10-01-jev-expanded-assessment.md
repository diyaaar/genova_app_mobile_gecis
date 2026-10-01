# Jev expanded assessment — migration, architecture and product

1 October 2026, 13:33–13:42 Europe/Istanbul. Primary engineering assessment using
actual jev-1.13.0 responses. Source runner `194fe0e` + `7e56d60`, final guard `61c9437`; initial source baseline
`daaa5a1`. [WF-015](../briefs/WF-015-jev-assisted-project-analysis.md) owns scope.
React Native/Expo remains the target; Flutter is only an alternative, not a migration.

## Outcome

Use Jev as a bounded advisory tool for claim/evidence review, redacted failure
triage and semantic candidate selection. Do not let it close acceptance gates,
grant permissions, merge music identities, choose commercial policies or reorder
the delivery plan automatically. The assessment found useful judgments AND a
false-support signal, scope sensitivity and a next-action disagreement.

This is expanded decision-support evaluation, **not** an exhaustive source/security
audit or independent review. The coding agent inspected relevant sources and
prepared facts; Jev did not browse the repository, execute tests or write this report.

## What Jev actually received

Nine sequential calls, 76 questions including repeated comparison questions:

| Packet | Questions | Input/output tokens | Measured call ms |
|---|---:|---:|---:|
| Evidence A | 10 | 3676 / 438 | 417 |
| Evidence B | 10 | 3675 / 436 | 403 |
| Architecture actions | 10 | 3602 / 588 | 312 |
| Synthetic product routing | 10 | 2981 / 457 | 265 |
| Synthetic/redacted failure triage | 8 | 3346 / 617 | 272 |
| Next-action options | 6 | 3533 / 593 | 372 |
| Explicit route-not-answer comparison | 10 | 2587 / 457 | 627 |
| Explicit repository-order comparison | 6 | 3597 / 593 | 293 |
| Claim-support Noul comparison | 6 | 2304 / 112 | 314 |

Total 29,301 input / 4,291 output; estimated **$0.001230642** at documented
[$0.042/M input](https://docs.typesafe.ai/models), not an invoice-verified cost.
Call timings are one-off HTTP measurements, not application latency benchmarks.
No automatic retries, model switches, cached replay or whole-repository upload.

Author-written source paraphrases, known project facts and synthetic requests were
sent. Twelve path/hash references identify source provenance but do not mean Jev
opened them. Expected labels stayed offline, frozen before inference. Exact owned
request/attempt/response JSON is retained in [evidence](jev-expanded/); all nine hash
chains validate. No real choir/user messages, files, audio, screenshots, identifiers,
signed URLs or credentials are in the packets. Provider account retention/ZDR was
not verified; these results authorize no future private-data upload.

The owner explicitly permits this chat-exposed key today and will replace it later.
It was read through non-echoing terminal input into process memory, not argv/source/
public env/evidence. Chat/tool transcripts are not a secret vault. No key stored,
rotated or printed by the runner; no permission inferred for later-day reuse.

## Measured checks and disagreements

These labels are primary-agent authored, tiny, curated and mostly straightforward.
They are NOT random held-out data, independent human labels or calibration.
Follow-up wording was informed by observed mistakes; its score is in-sample tuning.

| Evaluation | Actual result | Meaning / limitation |
|---|---|---|
| Three-way evidence relation | 19/20 primary labels | e09: contradiction instead of insufficient; no false `supports` among12 non-support cases |
| Simple lexical-overlap baseline | 6/20;8 false supports | Deliberately weak reference; not a comparison to full deterministic freshness/scope rules |
| Initial product candidate routing | 7/10 | p03/p05/p06 abstained; p03's shorthand work identity is genuinely debatable |
| Explicit advisory-routing comparison | 10/10 same labels | Better scope; not fresh validation or proof of Turkish production accuracy |
| Failure-layer routing | 8/8 | Known/synthetic clear observations; routes investigation, not confirms diagnosis |
| Six Noul support checks | 5/6 at diagnostic0.5 split | e09 false support0.66; no production threshold selected |

### Evidence error: stale build evidence

e09's claim says the current Android build passes based on an older run. The
evidence explicitly describes a historical pre-change PASS and no post-change
build. Frozen label: insufficient. Choice returned contradicted (probability0.82),
which still avoids an unsafe support decision. Noul later returned support0.66.
This cross-primitive disagreement prevents treating model judgments as acceptance.
The wording may contribute; the failure is retained, not tuned away.

Recommendation: validate evidence existence, run revision, date, platform, tenant,
environment and required gate identifiers deterministically FIRST. Jev may flag
semantic contradictions after that. Missing/failing/unrun gates stay open regardless
of a model response. No threshold or confidence value grants a PASS.

### Product error: route versus answer

p05 asks where previous rehearsal assignments belong; p06 asks for invoice/payment
support. Initial choices selected no_match with probabilities0.69/0.62 despite
available matching topics. The likely design problem is mixing advisory routing
with a factual answer requiring absent tenant records; this is a hypothesis, not
Jev's explanation. A slim state and explicit route-not-answer instruction selected
the intended candidates at probability1 for both. Multiple changes prevent attributing
the improvement to one field. No actual historical assignment or invoice was fetched.

p03 `Bach Ave Maria` initially abstained (0.56 versus Bach/Gounod0.43); explicit
closest-candidate-for-human-review chose Bach/Gounod0.77. This does not establish
the user's intended work. Bare `Ave Maria` remained no_match; do not auto-merge.
p02's follow-up still assigns probability0.12 to an unsafe grant-access control
option although support_review wins. Production options must exclude access-grant
actions entirely; deterministic security cannot depend on the winning label.

### Planning error: missing order and irrelevant options

Initial critical-gate selection: assignment integration0.67, overlap test0.30.
The supplied facts listed unrun gates but omitted the handoff's explicit NEXT order.
After adding that source-derived order, overlap test became1.00. This is a context
repair, not proof Jev had read and ignored the handoff or independently discovered
the right sequence. [Current handoff](../agent-handoff.md) remains authoritative.

The runtime-pilot question originally chose semantic search0.34/confidence0.26;
with ordered context it chose overlap test0.60, which is NOT a runtime AI feature.
Over-broad candidate sets and unrelated constraints can distort selection. The
primary agent rejects that interpretation, not the delivery order. AI-first guidance
also remains diffuse: evidence assistant0.41 initially,0.36 after ordered context.
Do not advertise these as strong model recommendations.

## Architecture: model judgments versus source judgment

| Action | Jev selection (selected probability) | Primary source-based judgment |
|---|---|---|
| Shared annotation contract | preserve1.00 | Preserve [single TS schema](../../lib/repertuvar/annotation-types.ts); no Dart mirror |
| Shared active-choir contract | preserve0.68; adaptation0.31 | [Pure core](../../lib/choir-context-core.ts) uses injected client; preference never authorizes |
| Wholesale unchanged chat port | reject0.74; adaptation0.26 | [chat.ts](../../lib/chat.ts) imports web Supabase singleton and mixes operations; inventory/pick pure contracts and adapt dependencies, not wholesale copy |
| New native server behavior in Next route | reject0.87 | Approved Edge boundary stands; web reuses server behavior |
| Bounded current-lease recovery | preserve0.86 | [Recovery](../../apps/mobile/src/webview/private-file-ticket-recovery.ts) guards issuer, family, denial and cancellation; retain tests |
| Primary Flutter switch | reject1.00 | Owner retains RN/Expo, not a technology contest |
| Native profile rewrite | reject0.96 | Permanent WebView boundary in [MIGRATION](../../MIGRATION.md) stays |
| Assignment-version read integration | bounded_adaptation0.99 | [Performance query](../../lib/korist-performance.ts) omits version; [HomeworkCard](<../../app/(main)/koristler/[id]/page.tsx>) prefers Drive link; known primary-agent gap, not Jev discovery |
| Immediate shared hosted deployment | reject1.00 | Backup/restore, sibling impact and ordered rollout still required |
| AI decides deletion/retention | owner_decision0.97 | Human business/privacy policy must be explicit |

These are judgments over prepared facts, not evidence all queries/storage paths are
isolated. RLS, server revocation, races, membership changes and actual file behavior
need existing deterministic tests and connected/runtime gates.

## Where Jev is useful, in order

| Area | Proposed use and boundaries | Evaluation status |
|---|---|---|
| Delivery evidence | Claim-to-excerpt relation, outdated/overclaimed proof warnings; human closes gates | Evaluated on20 paraphrase/altered-claim cases; error retained |
| Test failure triage | Suggest first investigation owner/layer, retain unknown and reproduction | Evaluated8; no actual new bug diagnosis |
| Migration inventory | Help compare web/native behavior descriptions and spot missing cases | Evidence and architecture proxy evaluated; detailed executable behavior parity NOT RUN |
| Document drift | Compare brief/handoff statements to dated source/evidence, preserve historical truth | Narrow scope cases evaluated; whole-doc scanner NOT RUN |
| Tenant-authorized help/repertoire search | Code retrieves only allowed candidates, Jev chooses relevance; no-match/human fallback | Tiny synthetic topic/candidate routing, not graded ranking or production search |
| Repertoire metadata alignment | Suggest closest title/composer/voice part candidate; human confirms duplicates | Ambiguity controls evaluated; real catalog/merge NOT RUN |
| Onboarding/support | Route password, invitation/account or billing questions to known guidance | Password/billing routing only evaluated; invitation UX and actual support outcomes NOT RUN |
| Chat/sensitive reports | Route to authorized human or known helper, not judge members or alter roles | One synthetic sensitive escalation; real moderation and private-message processing NOT RUN |
| Date/task extraction, rehearsal suggestions | Preparse candidate spans; Jev selects intent; code validates dates and constraints | Future candidate only, not evaluated here |

No direct Jev PDF pixel/audio/stylus validation: [model input is text-only](https://docs.typesafe.ai/models).
Textual preprocessing/transcripts would need separate quality/privacy evaluation;
real renderer, checksum, audio/seek, accessibility and device tests remain external.
Do not replace DB constraints, locks, Auth/RLS, exact normalization, billing math,
storage signing, migrations or a coding agent with semantic inference.

## Migration execution plan — primary engineer decision

1. **Finish ready090 overlapping HTTP/COMMIT acceptance.** Use bounded disposable
   local fixtures; assert authority ordering, post-commit denial and provider hits.
   Distinguish already-streaming bytes from next-request refusal. Jev may compare
   the resulting redacted evidence to claims, but the test decides PASS/FAIL.
2. **Bounded assignment-version Drive-exit integration.** Current-version select,
   HomeworkCard protected-reader preference, compatibility and tenant/revocation
   tests. Do not rewrite the permanent WebView screen. Scope a product brief first.
3. **Continue connected audio and grouped native iOS/private-client acceptance.**
   The synthetic audio lifecycle/iOS JS export do not close these gates. Preserve
   the ordered hosted backup/rollout and physical-device/release checkpoints.
4. **Use Jev alongside real work, not as a separate framework.** Build fresh, richer
   manually reviewed claim/excerpt examples from the next migration outcome;
   deterministic freshness/scope checks first, all inference advisory. Report false
   support, abstentions and language/primitive sensitivity, not only matching labels.
5. **Runtime AI later:** scoped tenant-authorized help/repertoire candidate pilot,
   new unseen Turkish examples and missing/ambiguous cases; measure user outcomes,
   costs, latency and privacy/retention; provider unavailable means normal app works.
   No user-data upload or permanent runtime dependency authorized by this report.

RN/Expo remains shared TypeScript migration. Jev could assist a future explicitly
authorized Flutter comparison with behavior/contract matching, but it cannot port
the Dart code or replace platform verification. No such implementation now.

## Verification and remaining boundary

11 offline Node tests/syntax PASS;9 response envelopes/hash chains PASS;
retained credential/host-pattern scan0. Source56KiB including prior pilot;
expanded evidence188KiB; final observed free23,806,464KiB, above10GiB floor.
No application code, package, database, device, VM, hosted service, CI or release
changed; no product test rerun claimed. Original data and unrelated cli-latest preserved.
Source/report review is primary self-review, not independent acceptance.

## Owner-added real-source code-search pilot

Following the owner's explicit suggestion to use Jev for debugging/code search,
one additional call at13:42 compared seven exact source ranges with nine queries.
**9/9** frozen primary labels matched: seven relevant functions/excerpts and two
no-match controls (HTTP/COMMIT test proof and invoice calculation are absent from
the supplied code). No entire file or private data sent. All seven selected ranges
were checked against current file text/full-file hashes after inference.

| Search intent | Verified selected source range |
|---|---|
| Confirmed HEAD403 stops recovery | mobile webview/private-file-ticket-recovery.ts:36–54 |
| Strict v2/family verification | shared private-file-ticket-v2.ts:65–78 |
| Stale native PDF operation guard | mobile repertoire/reader-gateway.ts:29–39 |
| Legacy Drive link preference | app/(main)/koristler/[id]/page.tsx:323–329 |
| Submission select missing current version | lib/korist-performance.ts:582–590 |
| Session-aware choir RPC invocation | lib/choir-context-core.ts:88–98 |
| Recovery issuer/query/path validation | mobile webview/private-file-ticket-recovery.ts:18–35 |

This is a tiny candidate-selection test, not proof of whole-repo recall, improved
debugging speed or a new bug discovery. Candidate preparation was done by the coding
agent; source implementation matching is not runtime/authorization acceptance.
Debug triage8/8 above uses synthetic/redacted observations, not eight fresh bugs.

Workflow adoption: use `rg`/exact symbol search first. When semantics spans modules,
send a minimal redacted shortlist to Jev, include no-match, then open and verify the
selected file/range. For debugging, Jev suggests a likely investigation layer;
reproduce the failure and verify the causal fix/tests before accepting it. Never
upload env/credentials/private user logs or run inferred actions automatically.

Added call5575input/742output,380ms, estimated$0.00023415. **Expanded total10 calls,
85 judgments,34876input/5033output, estimated$0.001464792**. Including the earlier
two-stage pilot, this project's recorded Jev analyses today total12calls,
41992input/5875output, estimated$0.001763664; not provider invoice verification.
Latest offline tests13/13; all10 response/hash chains validated. Final guard includes
previous responses in the cumulative cost cap and refuses completed10-call pilots
before asking for a key; no further provider request after this local change. No more calls or
tuning in this checkpoint. Actual model errors remain in the report/evidence.

Expanded checkpoint is accepted as a measured analysis with disclosed failures.
Production AI adoption and the broader project/migration remain incomplete.
