# Repertoire HTTP/COMMIT checkpoint and Jev costs

Date: 1 October 2026. Local checkpoint PASS; [090](../briefs/090-private-file-ticket-revocation-contract.md)
remains IN PROGRESS. Source/tests `d448de5`; Jev tooling `062c034`.
Primary-agent self-review, not independent review or hosted acceptance.

## Observed result

Actual repertoire handler, v2 ticket helpers and R2 fetch/signing helpers served real
loopback HTTP. NativePG17 SQL authority ran under service_role through an explicit
test-only psql dependency adapter. Synthetic actors/sessions and direct signed-v2
tickets; Auth login, POST issuance, PostgREST/deployed entrypoint not exercised here.
Provider was AWS4-signature-verifying loopback HTTP, not hosted R2. No authorization
boolean mock substitutes for SQL authority.

[Raw trace](090/2026-10-01-http-overlap.json),11:04UTC /14:04Istanbul:

| Mutation | Before COMMIT | After COMMIT | Held before SQL | Existing stream |
| --- | --- | --- | --- | --- |
| Same-session choir switch | GET200/Range206/HEAD200 | All403/provider0 | GET403/provider0 | First32B before COMMIT; full65905B/hash completes |
| Chef role removal | GET200/Range206/HEAD200 | All403/provider0 | GET403/provider0 | Same boundary; new reads403/provider0 |
| Member deactivation | GET200/Range206/HEAD200 | All403/provider0 | GET403/provider0 | Same boundary; new reads403/provider0 |
| Auth session deletion | GET200/Range206/HEAD200 | All403/provider0 | GET403/provider0 | Same boundary; new reads403/provider0 |

Explicit transaction acknowledgements and HTTP/SQL/stream barriers establish order,
not sleeps. Four cases,180 trace events,16 provider hits,zero signature failures.
Existing stream completion follows decision32, not a policy failure: previously
delivered/streaming bytes cannot be promised to be recalled.

## Verification and limits

| Check | Result | Boundary |
| --- | --- | --- |
| Deno focused check/shell syntax | PASS | Test support only; not fresh web/mobile full gates |
| Five-family SQL090 suite | PASS | Fresh disposable schema, real SQL, rollback |
| Four repertoire HTTP/COMMIT cases | PASS | Declared psql transport, not connected Auth/PostgREST |
| Existing DB/scratch/busy-port guards | PASS | Foreign targets survive refusal |
| Original row hashes/counts | PASS | Original068 unchanged; five counts28/1/29/9/79 |
| Jev tooling offline tests | PASS | Two Node tests; payload/labels and fail-closed inputs |
| Owned cleanup/diff/local links | PASS | Disposable DB/scratch/HTTP listeners removed |
| Other four readers' HTTP overlap | NOT RUN | SQL/serial HTTP evidence cannot close this |
| Connected audio/native iOS/hosted/release/load | NOT RUN | Separate layers; no100-tenant capacity claim |

Initial checks hit inherited Next tsconfig and strict local types; corrected explicit
no-config and bounded types. First runtime passed SQL but stopped before HTTP:
empty PGSERVICE selects an undefined empty libpq service. Reproduced, removed that
key, reran. Cleanup review added scratch-ownership tracking/environment clearing
and guard probes; final complete run passed afterward. No failure suppressed or
relabeled a product defect. No production/client/schema/dependency changes.

Preflight23,809,132KiB free; final23,695,880KiB, above10,485,760KiB floor.
Forecast additional<200MiB, no continuous peak sampler. No VM/container/client build/
package install. Owned disposable outputs removed, reproducible from sources;
original068/private evidence/dependencies/AVD/global caches retained. No push/deploy/
CI/hosted/real data/email/hardware operation.

## Jev advisory, not test authority

One pinned jev-1.13.0 call,11:07UTC /14:07Istanbul;413ms,4952 input/388 output.
Redacted11883B packet, nine questions; primary labels frozen before inference, not
sent to provider. At-most-one attempt,45s/no retry,<$0.002 advisory cap. Existing
owner-authorized key only in process memory, not source/argv/retained evidence.
Earlier chat exposure still needs owner rotation; this checkpoint is not rotation.

Artifacts: [request](090/2026-10-01-jev-overlap-request.json),
[labels](090/2026-10-01-jev-overlap-labels.json),
[attempt](090/2026-10-01-jev-overlap-attempt.json),
[response](090/2026-10-01-jev-overlap-response.json).
Request SHA256: `77da36cda482a6620a4e14cd7d2875ac8501ccca5870e5292d4da3226cef76e5`.
Packet source hash binds frozen HTTP trace. Nine/nine labels agree, including rejection
of all-family/full-Auth/hosted/whole090 claims and insufficient100-tenant evidence.
Small self-labeled packet is not calibrated accuracy/independent review. Actual tests
remain authoritative; nonzero unsupported-label probabilities must not close gates.

## Recorded API cost ledger — 1 October

Verified [official pricing](https://docs.typesafe.ai/models): jev-1.13.0 input$0.042/M,
output free. Formula: returned input tokens×0.042/1,000,000. Estimates, not verified
provider invoices/taxes/exchange conversion.

| Recorded activity | Calls | Input | Output | Estimated USD |
| --- | ---: | ---: | ---: | ---: |
| [Initial pilot](2026-10-01-jev-project-opportunities.md) | 2 | 7116 | 842 | 0.000298872 |
| [Expanded assessment](2026-10-01-jev-expanded-assessment.md) | 10 | 34876 | 5033 | 0.001464792 |
| This HTTP evidence advisory | 1 | 4952 | 388 | 0.000207984 |
| Recorded daily total | 13 | 46944 | 6263 | 0.001971648 |

No newly charged external infrastructure provisioned for this local checkpoint.
Overall work is not claimed free: Codex per-turn cost, existing subscriptions,
electricity and actual provider invoice totals unavailable. This ledger is not total
project cost or the preferred monthly infrastructure ceiling; broader unrecorded
usage is not counted.

## Next action

Extend bounded actual-handler HTTP/COMMIT matrix to remaining four private-file
readers, explicit adapters and fresh evidence per family. Do not recreate a heavy
runtime solely for cosmetic parity. Connected Auth/audio/native iOS/hosted gates
stay separate. Assignment-version/legacy-link product integration follows in its
own brief; preserve native repertoire/permanent WebView ownership.
