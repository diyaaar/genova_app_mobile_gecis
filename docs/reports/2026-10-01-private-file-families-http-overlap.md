# Remaining private-file HTTP/COMMIT acceptance and cost ledger

1 October 2026. Source/tests `cc20758`. Local checkpoint PASS;
[090](../briefs/090-private-file-ticket-revocation-contract.md) remains IN PROGRESS.
Primary self-review, not independent review, hosted or beta acceptance.

## Result and scope

Actual four production index files were literally imported with test-only capture
of their Deno.serve registration. Their real shared handler, v2 ticket verification,
metadata mappings, R2 object-key checks and signed fetch helper execute. Supabase
fetch is replaced by a strict test-only transport executing nativePG17 service_role
SQL: known RPC, whitelisted tables/projections, mandatory choir/file filters,
active chat state; unsupported/Auth/foreign-origin requests refuse without remote
fallback. This is NOT real Auth/PostgREST/deployed gateway/POST issuance.
Actors/sessions/direct signed-v2 tickets and WAV/PNG content are synthetic.
Provider is full AWS4-signature-verified loopback HTTP, not hosted R2.

[Raw observations](090/2026-10-01-http-families-overlap.json),11:26UTC /14:26Istanbul:

| Family | Mutation matrix | Observed post-COMMIT result | Stream |
| --- | --- | --- | --- |
| assignment-file | Choir switch,chef-role removal,inactive member,deleted Auth session | GET/Range/HEAD403/provider0; held-before-SQL403/provider0 | First32B before COMMIT, exact48B WAV completes |
| assignment-review-file | Same four | Same | Exact48B WAV completes |
| repertoire-comment-file | Same four | Same | Exact48B WAV completes |
| chat-media-file | Choir switch,room-member removal,inactive member,deleted Auth session | Same | Exact70B PNG completes |

For each case, uncommitted mutation allows GET200/Range206/HEAD200 with exact
bytes/MIME/content-length/content-range/private-no-store. Explicit transaction
acknowledgements and barriers, not sleeps, establish SQL/COMMIT/first-byte ordering.
New requests are denied while previously started stream completes under decision32.
16 cases,554 ordered trace events,67 provider hits,zero signature failures.

Chat has an independent room grant: chef-role removal alone preserves
GET200/Range206/HEAD200 after COMMIT. Removing room membership instead denies.
Do not turn role changes into a universal ban while valid independent access exists.
The existing SQL090 matrix explicitly requires this distinction; no new policy invented.

Combined with [earlier repertoire run](2026-10-01-repertoire-http-overlap.md), there
are20 mutation cases across five families/two local runs and declared adapters.
The older repertoire run uses handler dependencies; the new four use actual index
registration plus fetch-to-psql transport. Original frozen evidence was NOT rerun or
overwritten. This is not a fresh all-platform connected Auth/RLS/provider release run.

## Checks, failures and cleanup

| Check | Result | Limit |
| --- | --- | --- |
| Deno check and shell syntax | PASS | Focused test code, no production/shared source changes |
| Strict transport unit tests | PASS | 11 tests including tenant/unknown/injection/Auth/credentials refusal |
| Fresh five-family SQL matrix | PASS | Actual SQL/guards in disposable nativePG17, rollback |
| Four-family HTTP/COMMIT matrix | PASS | 16 cases,exact bytes and provider boundaries |
| Independent chat grant | PASS | Three real HTTP reads after role COMMIT |
| Target/scratch/port/unknown-mode guards | PASS | Preexisting owned probe targets survive refusal, probes cleaned |
| Original068 hashes/counts | PASS | Five counts28/1/29/9/79 unchanged |
| Jev offline tooling | PASS | Four Node tests, including missing/failed family/grant refusal |
| Links/diff/redaction/hash linkage | PASS | Retained artifacts inspected, no key/URL/ticket/private-user values |
| Connected native audio/native iOS/hosted/load/release | NOT RUN | Separate090 gates; no inference from this checkpoint |
| Fresh root/mobile full gates | NOT RUN in this checkpoint | No product changes; existing historical evidence not relabeled current |

First typecheck corrected narrowed handler-capture and Uint8Array response-copy types.
First runtime passed SQL but correctly hit immutable-version UPDATE refusal before
HTTP. Final fixture metadata now prepared BEFORE insertion, preserving every DB
immutability trigger; second runtime passed fully. Original source data never copied.
Initial Jev packet exceeded24KB and failed offline; observations compacted without
raising cap or dropping families. No failed runtime claimed PASS/no provider retry.

Preflight23,718,244KiB free; final23,699,152KiB, above10,485,760KiB floor.
<200MiB additional forecast, not continuous measured peak. No downloads/packages/
VM/client build. Exact owned genova_090_families_overlap_test and
spike/090-runtime/families-overlap removed after dependent checks. Both task HTTP
listeners closed; original068/private evidence/dependencies/AVD/global caches and
unrelated cli-latest preserved. Removed synthetic derived outputs are reproducible,
not retained recovery snapshots. No push/deploy/CI/hosted/real data/email/hardware action.

## Jev advisory and disagreements

One jev-1.13.0 call,11:30UTC /14:30Istanbul,858ms,7208 input/433 output.
16121B redacted packet,10 questions,pre-inference primary labels outside provider
input; both original JSON hashes frozen, exclusive attempt reservation/no retry,
45s/<$0.002 advisory cap. Existing owner-authorized key in process memory/non-echo
input, not source/argv/retained artifacts. Earlier chat exposure still needs rotation.

[Request](090/2026-10-01-jev-families-overlap-request.json),
[labels](090/2026-10-01-jev-families-overlap-labels.json),
[attempt](090/2026-10-01-jev-families-overlap-attempt.json),
[response](090/2026-10-01-jev-families-overlap-response.json).
RequestSHA256 `fed26b8377edb9052d59f5db9c902b9c109d8800a225a504e349837c36a1dfe2`.
Eight/ten choices agree with self-labels; not calibration/independent acceptance.

| Claim | Primary pre-label | Jev | Review |
| --- | --- | --- | --- |
| Combined five-family declared-adapter overlap observations | supports | insufficient,confidence0.11; probabilities supports0.34/insufficient0.41/contradicts0.25 | Primary reviewed two frozen traces and source: scoped local observations exist. Do not stretch to connected transport/platform/whole090 proof. Model returns no reasoning, so its cause is unknown. |
| Acceptable100-tenant load performance | insufficient | contradicts,confidence0.57 | No benchmark in either run. Criteria allow explicitly unrun gates under contradicts, overlapping intended insufficient category. Label mismatch is not evidence of capacity or conclusively a model error. Tighten this semantic rubric in a future actual advisory, not retry this packet. |

Model rejected blanket chat-role denial, full Auth/POST, native audio, whole090
closure and verified-invoice claims. Preserve disagreements/probabilities; observed
tests/source remain authoritative. This skill influenced explicit grant-boundary
and evidence-scope review, not production authorization or test closure.

## Recorded API costs — 1 October

[Official pricing](https://docs.typesafe.ai/models), verified this turn:
jev-1.13.0 input$0.042/M, output free. Returned input×0.042/1,000,000, estimates only.

| Activity | Calls | Input | Output | Estimated USD |
| --- | ---: | ---: | ---: | ---: |
| Initial staged pilot | 2 | 7116 | 842 | 0.000298872 |
| Expanded assessment | 10 | 34876 | 5033 | 0.001464792 |
| Earlier repertoire advisory | 1 | 4952 | 388 | 0.000207984 |
| This remaining-family advisory | 1 | 7208 | 433 | 0.000302736 |
| Recorded daily total | 14 | 54152 | 6696 | 0.002274384 |

No newly charged external infrastructure for this checkpoint. Not verified invoice,
tax/TRY conversion/total project cost; existing subscriptions, electricity and Codex
per-turn cost unknown. Unrecorded outside usage excluded. Monthly infrastructure
target remains distinct from this API ledger.

## Next ready local action

Connected native Android audio Auth/R2 acceptance: valid-v1 refusal/one authority
renewal, actual signed object bytes, seek/expiry/tenant-clear and confirmed403.
Fresh resource preflight before any required connected runtime/build. Existing
synthetic audio evidence is not that gate. Native iOS stays at integrated both-platform
private-client acceptance; hosted rollout/assignment-version Drive-exit remain separate.
