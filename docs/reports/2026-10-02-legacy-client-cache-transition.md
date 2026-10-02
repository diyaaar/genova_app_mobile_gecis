# 090 — legacy cache and explicit refresh checkpoint

2 October 2026, source **15fc8c9** (parent8fdf3dc), primary engineer/single writer.
Owner requested continuation of the approved local legacy-client scope. The subsequent
possible note deletion was withdrawn: **no notes, records or source files deleted**.
No sibling-site change, hosted SQL, provider operation, push or deployment.
**Local cache/hook/browser checkpoint PASS; whole090/R1 OPEN, release NO-GO.**

## Discovered gap and bounded repair

The prior fe8cd19 server/SQL/URL-loader acceptance remains valid at its stated layers,
but did not test the actual non-versioned shared hook. `privateFamily=false` let
`hooks/useProtectedDriveFileUrl.ts` return a fresh-looking runtime cache while online
before ticket issuance/HEAD. Actual legacy comment and review consumers pass no version
flag (`ProtectedCommentAudioPlayer` and `AssignmentReviewAudioPlayer`), so the gap is
not an imaginary future path. Three new React tests initially FAILED: online cache bypass,
denied cache fallback and reconnect without authority. They pass after the minimal repair.

All hook families now use the existing fresh online HEAD/401-one-renewal/403-stop helper.
Downloaded local bytes are selected only while actually offline; reconnect immediately
hides the old local URL and obtains a current decision. Confirmed denial clears protected
caches best-effort but still hides the view if cleanup fails. Body error recovery is also
bounded for legacy files, and cancellation is rechecked after asynchronous cleanup.
No changes to SQL, Edge, adapters, SW, schemas, upload paths or annotations were needed.
Adding this shared hook/test to the minimal client closure is required by the measured gap,
not permission to promote current main or rewrite unrelated components.

## Actual browser composition and limits

[Final immutable browser record](090/2026-10-02-legacy-browser-transition-final.json)
pins the exact production a13f696 hook/loader/offline/SW and current sources, plus current
Next adapter/Edge handler/ticket and the harness hash. Installed Chrome154.0.8037.93,
React19.2.8 and existing esbuild0.28.2; no download/install/repository copy. In-memory bundles,
real browser React hook, real Cache Storage/Service Worker, local HTTP Next adapter and
actual legacy Edge handler/HMAC. Auth/access decisions and media provider are synthetic:
this does NOT rerun the actual SQL/index/SDK layers accepted previously, or prove full
Next workspace, production-baseline candidate, native WebView, hosted Auth/PostgREST or
real Drive/Storage. PDF.js parsed/rendered the synthetic one-page PDF (1932 dark channels);
Chrome decoded/played/seeks synthetic WAV. Harness audio wires the shared body-error callback;
complete production wrapper recovery remains a separate full-UI gate.

The old bundle was already running when server access was denied. Its online hook selected
the downloaded local audio and played it without any new authority request. This is
**FAIL_REPRODUCED for automatic old-client transition**, not new provider-byte leakage:
already-downloaded bytes are not retroactively revocable. Merely changing the server or
the next JS response did not replace loaded code. Explicit page reload loaded the repaired
client, refused the denied cached file and made zero provider calls. A real refresh/update
transition is therefore necessary; no actorless-v1 grace or automatic-update claim.
The earlier [six-scenario record](090/2026-10-02-legacy-browser-transition.json) is retained;
the final run adds invalid same-user-session refusal and complete source/tool provenance.

## Mandatory evidence

| Criterion | Required? | Result | Date/environment/evidence and limit |
|---|---|---|---|
| Actual legacy hook bypass reproduced before repair | Yes | PASS red→green | 20:05 initial3FAIL/4PASS; repaired final9hook tests; actual React with mocked boundaries |
| Online cache never chosen; cleanup failure still refuses | Yes | PASS | Focused hook regressions; browser refreshed POST403/provider0/no audio |
| Reconnect hides local bytes while decision pending | Yes | PASS | React pending-promise test and actual offline→online Chrome events |
| Bounded cached401 renewal,403-stop | Yes | PASS | Chrome HEAD401→onePOST→HEAD200; reconnect HEAD403→POST0/provider0/no audio |
| Same user invalid new session cannot reuse old cache | Yes | PASS | Chrome newPOST401/provider0/no audio; Auth is synthetic, not another actual hosted session |
| Legitimate PDF/audio/offline behavior preserved | Yes | PASS | Chrome PDF.js canvas, WAV play/seek, real SW offline playback |
| Already-loaded old hook auto-adopts repair without refresh | Transition investigation | FAIL_REPRODUCED | Real old hook/loader/SW browser composition; explicit reload succeeds, no auto-upgrade proof |
| Full refreshed/old Next workspace and native WebView transition | Yes for release | NOT RUN | Small actual-hook harness is not whole application or WebView |
| Exact production-baseline candidate/six-reader dependency closure | Yes for release | NOT RUN | Current loader imports broader embedded/five-family client changes; no bulk file promotion |
| Root current-source gate | Yes | PASS | pnpm check20:11–20:12:113files/1172tests, lint/types/coverage/SWsyntax/Nextbuild |
| Focused and harness checks | Yes | PASS | 20:10:2files/32tests; final7browser scenarios; scoped ESLint, node --check, diff |
| Hosted/provider/device/CI/deployment/independent review | Later required | NOT RUN | No authority inferred; review here is primary-engineer self-review |

Configured root coverage remains90.82statements/85.71branches/98.19functions/96.72lines;
it does not cover every changed hook/Edge module or measure tenant isolation. The focused
and browser regressions above provide the new behavior evidence. Final browser totals:
7POST/6HEAD/8GET,12synthetic provider calls during allowed controls, outside-origin requests0.
Denied/reconnect/session tests separately assert zero new provider calls; aggregate12 is
not a claim that denied calls fetched data. Recorded HTTP GET206 proves a Range path too.

## Resources, review and ordered next action

Entry21,520,872KiB available; after browser21,494,716KiB; after final build21,007,340KiB,
all above10GiB floor. One heavy process, no VM or repository/runtime copy. Browser/context/
loopback server closed in finally;18196 has no listener. Task-created .next477220KiB and
coverage348KiB removed after the last check; generated outputs are reproducible. Sources,
lockfiles/dependencies/protected R1 backup/original068/unrelated CLI marker preserved.
Final measured space is in the brief exit record. No private data sent to any provider.

Self-review checked shared callers, online/offline transitions, bounded retry, cache cleanup
failure, cancellation and source provenance. Supabase skill prompted current Auth/session
documentation checks; getSession remains a client bearer source, not server authorization.
[Official session guidance](https://supabase.com/docs/guides/auth/sessions) supports keeping
server session checks separate. TypeSafe skill keeps deterministic permission outcomes in
code; no new Jev call, incremental estimated Jev inference cost **$0**, not Codex/whole-day cost.

Next: construct and exercise the narrow production-a13f696 client candidate (including this
hook, cache lifecycle, no raw audio/inline fallback and explicit refresh). Then pin complete
six-reader/SQL/config/client closure and get independent review before separately scoped
live authority. Preserve the old failures; do not claim global next-request protection from
server-only or small-browser evidence. Real provider large-file/HEAD budgets and external
public Drive ACLs remain unmeasured/separate. Sibling website stays out of scope.

Final record validation:74 local links,20 current/historical SHA256 pins and ten-file
sensitive-format scan(no matches), JSON parse and git diff --check PASS. Handoff74lines,
active68lines. Source15fc8c9 and this documentation checkpoint are separate commits;
unrelated CLI marker remains unstaged. No independent review or full release acceptance claimed.
