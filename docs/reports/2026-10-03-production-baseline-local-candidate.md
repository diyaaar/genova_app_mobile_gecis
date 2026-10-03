# 090 — production-baseline local candidate, 3 October 2026

Status: bounded local candidate goal PASS, including document/cleanup exit gates. This result is LOCAL only;
090/R1, Android beta and live publication remain OPEN / NO-GO.

## Outcome and authority

Owner requested a measurable further goal, persistence to its acceptance, and strict repo
rules. One writer. Main source7289edb, implementation13237d4 and factory/artifact follow-upbfed461.
Final candidate1a014c4e1927a03a7c67dd666a91a6006a28b6f8,
tree d901450049ee7f0aa6484062e8b1dd09824aa730;
branch codex/090-private-reader-candidate-20261003. No push, CI, hosted SQL/Edge/Next,
provider ACL, real user/email/credentials/hardware, sibling website or note/data deletion.
TypeSafe and Supabase skills were read and applied: authorization is deterministic, no
inference/data export. New Jev spend$0; 2October key reuse was not inferred for3October.

The candidate starts at historical production source
a13f696da8c731e9af2a2bce473d4f4ae4a81587, NOT today's hosted state. It changes30 source/test/
SQL/config paths and proves386 of395 baseline runtime paths byte-identical. Package and
lockfile are unchanged. Historical instructions/docs/mobile/spike are not replayed into
the runtime copies. This is not a bulk promotion of main's newer product/embedded features.

The factory extracts accepted actual source nodes for legacy ticket/cache/inline/audio
behavior, not a separately handwritten provider/Auth implementation. Baseline upload,
chat, attendance, invitation and other UI paths remain unmodified. Their source
preservation and existing unit gates are NOT exhaustive manual acceptance of every feature.

## Repairs found by testing

1. A401 globally invalidated tenant generation, cancelling another file's legitimate load.
   `lib/drive-file-url.ts` now evicts only the expired URL and coalesces same-key issuance.
   Tenant/Auth clear still advances generation and rejects all old waiters. Actual old
   global-eviction mutant is caught; current-session checks still precede cache lookup.
2. Two RED hook tests prove delayed body callbacks from a previous file/offline resolution
   can erase a newly authorized URL, even when URL strings match. Load epochs now ignore
   stale callbacks. Actual current-body failures still allow only one retry, then stop.
3. Offline URL switching destroyed the document-owned PDF worker; re-fetching the script
   offline failed and poisoned fake-worker setup in that page. The new page-owned worker
   is explicitly supplied in workspace options, reused across documents and replaced if
   destroyed. Documents still destroy their own data; no private-byte cache/permission is
   added. Cold offline page launch is NOT proved or promised. Local installed PDF.js5.4.296
   code and types verify ownership; [official PDFWorker docs](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFWorker.html)
   and [document worker option](https://mozilla.github.io/pdf.js/api/draft/api.js.html) were checked.
4. A fresh repeat exposed a genuine403-stop failure: rebuilding the playlist with no
   selected authorized URL could issue an extra ticket POST (provider0, POST delta1).
   `suspendMiniAudioSources()` clears playable source tracks/currentTrackId/isPlaying while
   retaining metadata when online authority is absent. Valid-source per-track HEAD checks
   and explicit offline fallback remain. Actual helper regression and three fresh browser
   repetitions pass; the required zero-extra-POST assertion was not weakened.

## Evidence table

| Criterion / expected behavior | Required? / N/A reason | Status: PASS / FAIL / NOT RUN / N/A | Date, revision, environment, command or scenario | Evidence and limits |
|---|---|---|---|---|
| Narrow candidate, unchanged paths/dependencies | Yes, local | PASS | 3Oct, candidate factory + manifest verification | 30delta/386unchanged runtime paths; original package/lock hashes; no embedded/native feature graph promoted |
| Candidate lint/types/unit/coverage/SW/build | Yes, local | PASS | 3Oct04:06 TRT, final owned candidate, `pnpm --config.verify-deps-before-run=false check`, explicit synthetic build env | 35files/229tests; all gates exit0; Next15.5.25. No hosted fallback/env copy/install |
| Root final gates after playlist follow-up | Yes, local | PASS | 3Oct04:07 TRT,7289edb content, final root `pnpm --config.verify-deps-before-run=false check` | 114files/1178tests, lint/types/coverage/SW/build exit0; same synthetic public build env |
| Focused behavioral regressions | Yes, local | PASS | 3Oct, actual root4files/41tests and Node9/9 | Coalescing/Auth cancellation, independent401, body stale callbacks RED→GREEN, worker reuse/SSR, suspended playlist sources/metadata, old mutant caught |
| Actual full Next PDF/audio and old-open/refreshed transition | Yes, local | PASS | 3Oct, exact final post-playlist-guard12scenario full drill | 11PASS + old-open buffered playback FAIL_REPRODUCED negative control; explicit refresh refuses/provider0;403 stops new POSTs/provider bytes; not automatic refresh |
| Fresh-context repeat stability | Yes, local | PASS | 3Oct, three separate candidate-only browser contexts | Each8/8 PASS; no reuse of pre-format/pre-guard green evidence |
| Complete source closure / exact patch tree | Yes, local | PASS | 3Oct,7289edb/1a014c4 source verification, private-index forward pin and decoded replay | Six readers15literal modules; client61modules/133edges; SQL078→090→legacy; pinned npmSDK2.112.4/aws1.0.20; candidate diff check passes; decoded patch SHA and write-tree match final manifest |
| Links, redaction, diff, exact cleanup, separate commits | Yes, local | PASS | 3Oct, final document exit verification | 84 local file links resolve;20 JSON records parse;27 records/indexes/decoded patches scanned; staged diff check clean; CLI marker excluded; source/docs separate commits; historical failures retained; owned copies/builds removed and no fixture listeners |
| Exact candidate native Android/iOS WebView, worker lifecycle | Required for090/release, not this local goal | NOT RUN | 3Oct | Prior native checkpoints do NOT certify this candidate; PDF worker is platform-sensitive |
| Fresh hosted Auth/SQL/Edge/provider/publication | Required for090/release, separate authority | NOT RUN | 3Oct | No live mutation, remote preflight or new SQL rehearsal here; 2Oct SQL/HTTP evidence remains dated historical evidence |
| Independent review / safe client refresh / recovery packet | Required for090/release | NOT RUN | 3Oct | Sole-writer self-review is not independent review; broader required failures remain open |

Coverage percentages apply only to configured unit includes: candidate89.13stmts/78.42branches/
96.96functions/91.42lines; they are NOT a percentage of tenant isolation or all application code.
Root coverage is91.03stmts/85.68branches/98.23functions/96.79lines, also a narrow configured
include. Candidate loader coverage is79.06stmts/59.64branches. The worker/hook/browser scenarios
add behavior evidence outside that narrow coverage include; no blanket isolation score is claimed.

## Real runtime boundary

Production-mode actual Next baseline/candidate with real React, Auth SDK local session,
workspace, mini player, Service Worker, PDF canvas, WAV decode/play and Range responses.
Play is clicked through UI; seek uses the real HTMLMediaElement, not a claim about a seek
bar gesture. Synthetic identity/REST/current-authority metadata/media; no database fixture.
Candidate requests execute actual Next API routes, fixed-origin adapter, legacy handler and
HMAC. The owned bootstrap redirects only example.supabase.co's legacy endpoint to loopback;
all other remote Next fetches fail closed. The old phase uses an HTTP proxy to the actual
new adapter (not the old insecure Next provider route); SW requests cross real HTTP, not an
incomplete page-route interception. Realtime sockets are blocked; Realtime behavior NOT RUN.

An old open tab can replay already-downloaded HTMLMediaElement/cache bytes after server
cutover without any new authority request. One historical raw-Drive fallback attempt is
captured and blocked; not a successful provider leak. Explicit refresh adopts the new client
and refuses denied cached media/provider0. No automatic refresh, actorless grace or retroactive
recall is claimed. Online403 purges offline opt-in; legitimate access restoration is followed
by explicit UI re-download, not reuse of revoked fixture bytes.

Final fresh full-drill JSON: [runtime record](090/2026-10-03-candidate-next.json).
Final closure and source pins: [v3 manifest](090/2026-10-03-candidate-source-manifest-v3.json),
[lossless patch](090/2026-10-03-candidate-source-v3.patch.b64). Predecessors4c3b6f0 and980b08f
and their manifests remain in history; main branch/index were not replaced.
Fresh candidate-only rounds: [round1](090/2026-10-03-candidate-next-candidate-only-repeat1.json),
[round2](090/2026-10-03-candidate-next-candidate-only-repeat2.json),
[round3](090/2026-10-03-candidate-next-candidate-only.json), each8/8 PASS.
Pre-format same-behavior full drill: [pre-format record](090/2026-10-03-candidate-next-pre-format.json);
separate fresh repeat: [repeat](090/2026-10-03-candidate-next-candidate-only-pre-format.json).
Before repairs, [candidate-only failure](090/2026-10-03-candidate-next-candidate-only-attempt1.json)
captures the actual fake-worker error in UI, not merely a timeout interpretation.

## Preserved failures and causal reassessment

Two pnpm attempts tried automatic dependency reconciliation and failed noninteractive purge
confirmation; shared dependencies were untouched. Inspected pnpm behavior, disabled only
pre-run reconciliation, no install/new lock. The initial header test compared object shape
against a valid Headers instance; exact bearer checks now use Headers.get. First candidate
prerender lacked explicit synthetic Supabase configuration; fixed without copying real env.

Browser attempt records1–8 are retained under090/2026-10-03-candidate-next-attemptN.json.
Attempts1–2 incorrectly assumed a cache-route source; actual old audio used its already
downloaded API buffer. Attempt3 treated aggregate parallel consumers as one call and missed
declared read-only REST fixtures. Attempt4 was agent-aborted after a wait was inserted into
the wrong phase; its old message says "Owner fixture aborted", NOT evidence of owner action.
Offline-playback failures5/7 preceded restoration of offline opt-in after the correctly purged
denial; UI pause and stable source waits were improved, then legitimate downloads explicitly
re-enabled. Attempt6 reproduces concurrent renewal failure; attempt8 still fails PDF after
that repair. Candidate-only UI diagnostics identify the independent worker lifetime failure.
Do not promote every harness failure to a product bug or erase genuine failed criteria.
The next candidate-only repeat then caught the genuine extra POST after403:
[failed repeat](090/2026-10-03-candidate-next-candidate-only-attempt2.json).
The prior full record is [pre-guard evidence](090/2026-10-03-candidate-next-pre-playlist-guard.json),
not the final candidate. The playlist guard was added, root/candidate/Node gates rerun, and
the complete old/new drill plus three fresh8-scenario repeats passed on final source.

First pinned patch replay caught one whitespace-only removed parameter line. Factory fixed,
candidate gates rerun. Historical candidate4c3b6f0 and manifest remain; original patch retained
losslessly as [base64](090/2026-10-03-candidate-source.patch.b64), decoded hash verified.
The final forward pin is separate and does not overwrite history or main's index/branch.
Unified patch blank context lines carry spaces by design; base64 artifacts preserve exact
bytes without weakening repository document whitespace gates.
Document exit initially compared runtime source records to bare path strings; corrected to
the actual path/bytes/hash schema, then all four final records matched exactly. The initial
URL scanner consumed apostrophe-delimited source context and flagged already-redacted or
explicit unit fixture values. Inspected the actual test sources, constrained the exceptions
to those exact test paths/hosts/constants and a removed template expression, then scanned all
27 changed records/indexes/decoded patches: no real key/JWT/unredacted runtime ticket found.
These were verifier-shape/lexical failures, not additional product or authorization repairs.

## Remaining release blockers / ordered next actions

1. Exact candidate Android-first WebView/bridge integration and private file recovery; group
   iOS worker/Document lifecycle acceptance at the integration milestone. The candidate excludes
   newer main embedded features; prove compatibility or explicitly scope their smallest closure.
2. Independent source/security review. Known small follow-up: unchanged FloatingMiniPlayer media
   error logging still includes src/signed URLs; harness redaction does not fix production logs.
   Main workspace logger also remains raw; candidate workspace uses code-only logging. Remove
   credential-bearing diagnostic fields before publication and regenerate the exact pin/gates.
   Cross-choir mini-player metadata persistence remains a source-review hypothesis, NOT a tested
   failure in this drill. Do not claim full A→B/sign-out runtime acceptance here.
   Per-playback-state playlist rebuild/HEAD amplification is a source-review scalability risk,
   not a measured load-capacity failure or a completed load test in this goal.
3. Refresh/maintenance semantics, six-reader forward repair, actual DB consumers, supported R1
   recovery limitations and fresh hosted read-only preflight before requesting exact live scope.
   Provider ACL/public source-byte exposure remains separate; Git revert is not data recovery.
4. Android usable beta and full delivery queue remain the destination. No new unrelated feature,
   sibling site work, Railway rewrite or claim of whole product readiness.

## Resources and exit

Installed Chrome154.0.8037.93, Node24.13.1, pnpm11.9.0; existing deps symlinked, no downloads/VM.
Initial21,518,576KiB. First runtime cleanup removed candidate550892KiB/baseline473232KiB/
root.next544964KiB/coverage352KiB, final21,507,812KiB at that point. Reconstructed only after
fresh preflight for the actual final patch gate, not for cosmetic cleanliness. Final cleanup
removed exact task-owned candidate529600KiB/baseline473220KiB/root.next533960KiB/coverage352KiB.
Sources and lossless pins remain in Git; generated builds can be recreated from the recorded
source. Dependency symlinks were not followed. Both private Git indexes were removed;
browser contexts/servers closed and no listeners on18197/18198/18199. Final measured free
space21,484,080KiB; exit recheck21,483,100KiB, both above10GiB floor. Original backup,
dependencies/global caches/user browser data/native runtimes and unrelated CLI marker preserved.
Local document links, JSON/pin/hash consistency, redaction and staged whitespace checks passed.
No post-source-code heavy rebuild is required for these documentation-only edits.
