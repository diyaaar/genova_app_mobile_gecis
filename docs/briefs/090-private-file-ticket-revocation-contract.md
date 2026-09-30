# 090 — private-file ticket revocation contract before Android beta

Status: IN PROGRESS / local v2 implementation and synthetic acceptance PASS on
30 September 2026; hosted, real web-browser and release gates remain open. Primary agent,
single writer. No hosted release authority.
One result: uniform online next-request access-after-revocation for five private file
families before `mixed`/`r2-required` cutover. This brief does not authorize live writes.

## Work card / transition start check

The original “devam” resumed the Android-first Drive-exit queue after local 089. Read AGENTS,
handoff/active, WF-009/WF-013, current delivery controls, migration guide, MIGRATION, decisions
#28–31, 015/021/053, 065/076 and the R2 runbook. At that earlier checkpoint
`main/62254f2` was verified; only unrelated `supabase/.temp/cli-latest` was dirty.
Profile/repertoire remains the existing native/web shared
file service; no new Next API or client-facing ticket response is proposed. The local source is
authoritative over older acceptance prose.

The inventory and owner policy choice are complete. The owner subsequently approved the
bounded **local** implementation checkpoint on 30 September. Executed work card: (1) implement
service-owned, session-aware authority and strict v2 tickets for all five readers; (2) make
web/native consumers refresh once and fail closed on confirmed denial; (3) prove the connected
two-choir flow and record any unrun layer. Exit only when the required matrix below passes.
Preserve original restore, private copy evidence, global caches and approved source bytes.

Allowed local paths for this checkpoint: this brief and handoff/active/progress; one new
`supabase/migrations/*090*` authority migration and its isolated SQL/connected fixtures;
`supabase/functions/{repertoire-file,assignment-file,assignment-review-file,repertoire-comment-file,chat-media-file}/` plus a narrow shared ticket/Auth module under `supabase/functions/` and their tests;
`lib/drive-file-url.ts`, `lib/repertuvar/protected-file-client.ts`,
`hooks/useProtected{DriveFileUrl,ChatMediaUrl}.ts` and focused tests;
`apps/mobile/src/repertoire/` plus the existing audio consumer and focused tests.
Acceptance-required adjacent files: `components/repertuvar/RepertoireWorkspace.tsx`
prevented online offline-copy bypass and handles PDF/audio body errors;
`components/ProtectedDriveImage.tsx`, `components/chat/{MessageBubble,ChatRoom,
MediaGalleryGrid,ImageGalleryViewer,ProtectedChatMediaImage}.tsx` ensure image bodies and
gallery downloads refresh/fail closed; `lib/chat-media.ts` probes hydrated image URLs;
`apps/mobile/src/acceptance/093_android-private-r2{,-config}.tsx` records Android A URL
and its post-switch HEAD result without exposing the ticket. `.gitignore` covers
the exact disposable 090 runtime.
No subagent/shared-tree writer. Existing tests/commits are historical, not fresh 090 evidence.

Transition start: read `AGENTS.md`, handoff, active context, this brief, delivery controls,
`docs/gecis-rehberi.md`, `docs/ai-calisma-duzeni.md`, relevant `MIGRATION.md` and decision
#32; verified `main/1a84037`, ahead of origin by 261; only unrelated
`supabase/.temp/cli-latest` dirty. Native score and web/WebView private-file clients remain
separate consumers of the shared Edge URL shape. Preserve POST/URL, R2/legacy/MIME/Range,
no provider request on denial, and all offline bytes only within the stated offline boundary.
Authority is scoped to synthetic local DB and service; no hosted migration/Edge, real provider,
push, user data or hardware. Code rollback must fail closed for v1; a Git revert alone would
restore the unsafe bearer window, so no release is allowed before its separate ordered gate.

Resource preflight 30 September: `df -k .` reports 28,194,340 KiB available (>10,485,760
KiB floor). Source/document edits <10 MiB; focused Node/Deno tests and coverage estimate
<1 GiB; an isolated PG17/Auth/Edge + Android Release reuse is estimated <12 GiB peak,
including VM and build outputs, pending fresh measurement of owned artifacts immediately
before start. Run only one heavy process; stop before allocation if projected headroom falls
below 10 GiB. Keep evidence, trash only exact task-owned generated output after its final check.
Required gates: focused ticket/handler/client tests, `pnpm check`, mobile
`npx tsc --noEmit && npm test`, isolated real PG17/Auth/RLS/HTTP two-choir matrix and Android
runtime refresh/denial. Any missing required gate remains NOT RUN and keeps 090 open.

## Verified pre-090 behavior and decision (historical baseline)

| Family | Pre-090 issued ticket | Pre-090 GET/HEAD source path | Pre-090 online switch/revocation guarantee |
|---|---|---|---|
| `repertoire-file` | Signed file+choir+1-hour expiry; no actor/session | Admin file row lookup, then legacy/verified R2 provider | Previously issued URL remains usable until expiry if file remains |
| `assignment-file` | Signed file+choir+1-hour expiry; no actor/session | Admin version row lookup, then R2 | Same previous-URL window |
| `assignment-review-file` | Signed actor+file+choir+expiry | Service-role `can_read_assignment_review_audio_058` then row | Active actor/role/version rechecked; selected Auth session/choir not rechecked |
| `repertoire-comment-file` | Signed actor+file+choir+expiry | Service-role `can_read_repertoire_comment_audio_059` then row | Active actor/visibility rechecked; selected Auth session/choir not rechecked |
| `chat-media-file` | Signed actor+file+choir+expiry | Service-role `can_read_chat_media_060` then row | Active actor/room rechecked; selected Auth session/choir not rechecked |

Evidence: `supabase/functions/repertoire-file/{ticket,index,handler}.ts`,
`supabase/functions/assignment-file/{ticket,index}.ts`, corresponding review/comment/chat
`ticket.ts` and `index.ts`, SQL functions in 058–060. Native private PDF cache is cleared on
tenant switch; this is client hygiene, not bearer-URL revocation. 021/053 intentionally accepted
the previous one-hour sessionless repertoire behavior. The R2 runbook's blanket “actor-bound
ticket and live authorization” sentence was therefore inaccurate for two families.

Owner decision received 30 September: **yes**, a previously issued URL must be rejected on the
**next online GET/HEAD** after membership/role removal or same-session choir switch. This is a
new product/security contract, not a silent reinterpretation of
021/053. It does not promise cancellation of already-streaming bytes or remote erasure of a file
already downloaded offline. Existing ticket-only audio/score consumers must retain their URL
shape. The version-transition and compatibility plan below was a proposal before
subsequent local implementation approval. The policy choice did not itself add a
logout-revocation guarantee; the local v2 authority now checks Auth session existence.

The approved next-request refusal required actor- and
session-bound tickets plus an atomic server-owned access check for file, choir, active membership,
session selection and family-specific visibility on each GET/HEAD. Do not substitute separate
admin queries or claim a client cache clear is server revocation. Preserve POST's real Auth/RLS,
200/206/416, MIME, no-store, Range/seek, legacy/mixed/R2-required behavior. Required evidence
includes A/B multi-membership, revoke/switch, stale v1 tickets, roles, expiry/tampering,
R2/legacy source refusal and concurrent decisions; the table below separates passed from unrun
layers. A session selection check alone is not Auth
logout revocation; define/test that boundary explicitly. All hosted schema/Edge/flag/Drive ACL,
provider copy, push/deploy and actual Android/iOS device checks remain separately gated.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Five-family pre-090 ticket/read authority inventory and historical contract reconciled | Yes | PASS | 29 September source inspection above; no network/runtime mutation |
| Runbook avoids a blanket false actor-bound claim | Yes | PASS | 29 September narrow correction; five family differences and 090 link; link/diff gate below |
| Read-only policy/client/rollout feasibility without weakening family access | Yes for preparation | PASS | 29 September retained local PG policy query plus SQL 057–060 and actual web/native consumer source; no current hosted/runtime proof |
| Owner selects online next-request revocation expectation | Yes for product contract | PASS | 30 September explicit answer: “Evet, sonraki istekte reddet (önerilen)”; no code or hosted change inferred |
| Decision #32 and 090 cross-links/consistency | Yes for this record | PASS | 30 September local link scan, `git diff --check` and scoped self-review; no source or runtime gate claimed |
| Legacy v1 denial and compatibility checkpoint approved | Yes before implementation | PASS locally | Owner approved bounded local work on 30 September; v1 GET/HEAD now returns 401 in local tests. Hosted release was not approved. |
| Five-family DB/Edge implementation and synthetic two-choir acceptance | Yes after contract selection | PASS locally | Disposable PG17 SQL matrix; service-only RPC; real local Auth/RLS/PostgREST/Edge + signed loopback S3 for repertoire; A/B same and separate sessions. Details below. |
| Web/native client recovery and required gates | Yes locally | PARTIAL | Web hook/body and native PDF/audio tests, full gates and Android Release old-URL denial PASS; real web-browser, native stale-v1 body retry, all five HTTP family readers and concurrent boundary NOT RUN. |
| Hosted cutover/public Drive withdrawal/offline deletion/device/beta | Later separate authority | NOT RUN | This preparation cannot accept these layers |

Required NOT RUN keeps 090 open. This local implementation may be committed as a partial checkpoint;
do not mark the product contract complete, hide the risk or weaken required tests. Self-review is
not independent review. Rollback of preparation is a doc revert; schema/data/provider rollback
requires separate evidence and authority.

Preparation self-review at its original checkpoint: old URL persistence was a source-level
inference. [091](091-connected-private-r2-read.md) subsequently confirmed with actual local
Auth/RLS/PG17 and signed loopback S3 that a previously issued A URL still returns HEAD 200
after the same Auth session selects B. That is **switch** evidence, not a membership-removal
GET/HEAD test, hosted R2 proof, or a new revocation contract. After the owner's choice,
the legacy-transition checkpoint was approved and bounded local implementation followed;
hosted activation is still separate. [092](092-stale-private-file-ticket-cache.md) only prevents late web/
WebView cache publication after tenant clear; it cannot invalidate the old bearer URL.

## 29 September feasibility checkpoint — read-only, before owner choice

The retained local `genova_068_test_restore` was queried read-only for `pg_policies`; it is a
dated **local restore**, not the current hosted schema. Its `repertoire_files` SELECT rules have
two permissive branches (assigned visible song for chorist; leader sees files) under the
restrictive `choir_id = current_choir_id()` tenant policy. Thus checking only an active choir
membership on GET/HEAD would broaden access to a file whose assignment/visibility changed after
ticket issue. Source SQL 057 separately gives assignment-version reads to its owner, chef or
eligible part-leader; the retained 068 restore predates that table, so that family is source-only
evidence here. SQL 058–060 use distinct role/target/comment/room visibility checks. A uniform
fix must preserve these family-specific grants, not just add one generic session query.

All five clients consume the returned ticket URL without attaching an Auth header to the body
request: web `lib/drive-file-url.ts` caches by user and file, native PDF downloads the URL, and
native audio gives it to Expo's media source. Requiring a bearer header on GET/HEAD is therefore
not a drop-in server fix. A signed ticket can carry a verified actor+Auth session identity while
keeping the same `?fileId=...&ticket=...` response shape; the server then rechecks one authoritative
decision before touching Drive/R2. The token contents must come only from a successfully verified
POST Auth session, never an unverified caller-provided ID. Service-only database reads must bind
the file, actor, session, selected choir, active membership and exact family visibility in one
transactional decision. An Edge sequence of separate session/member/file admin queries is not
accepted as atomic authority. The test must include changed song assignment/visibility as well
as membership and choir-switch refusal.

The selected strict next-request refusal requires an old signed-ticket transition. Immediate
rejection of v1 avoids a one-hour residual window,
but a pre-deployment PDF/audio request can receive 401 and needs an evidenced retry path. A
bounded dual-version grace supports existing in-flight requests, but **cannot** be described as
immediate revocation until v1 expiry. The URLs themselves need no client format change, but
web/native refresh, Range/seek and error recovery still require current regression evidence.
Rollout order is current hosted backup/isolated restore and sibling impact → additive service-only
DB check → Edge issuers/readers with explicit v1 policy → web/mobile compatibility verification
→ separately authorized live probe/flags/cutover. A Git revert is not DB/data rollback.

Auth logout is a separate boundary: a selected-choir row and actor ID do not by themselves prove
that a Supabase Auth session remains active. The requested decision covers membership/role
revocation and same-session choir switch; do not silently claim universal logout invalidation.
Already-open streams and previously downloaded offline bytes cannot be retroactively recalled.

## 30 September implementation checkpoint — historical pre-approval specification

**Recommended transition:** when the new readers become active, reject all five legacy v1
ticket formats on GET/HEAD. The two actorless families cannot be safely re-authorized from
their v1 payload; the other three lack selected-session identity. A one-hour v1 grace
(one minute for chat media) would contradict the selected next-request guarantee. An
in-flight v1 URL can therefore receive a one-time 401. Before strict readers go live,
web and native clients must demonstrate stale-URL discard, fresh-ticket request and one
bounded retry; if access is now revoked, show denial rather than loop. Older installed
clients without this recovery may need the user to reopen the file or update the app.

**Smallest coherent local implementation sequence, approved and now implemented locally:**

1. Add a service-only PostgreSQL authority decision for verified signed-ticket
   actor/session/file/choir identity. One database call must check Auth session existence,
   selected choir, active membership and exact family-specific visibility/role/assignment
   under one statement/transaction snapshot. The signing subject comes only from verified
   POST Auth, never a caller-supplied ID. Keep the authority routine in a non-exposed
   schema; if Edge needs a Data API RPC, use an explicitly service-role-granted invoker
   wrapper and prove `PUBLIC`/`anon`/`authenticated` cannot execute it. Supabase's
   [session guidance](https://supabase.com/docs/guides/auth/sessions) confirms JWT
   `session_id` maps to `auth.sessions`. Check managed-schema access in isolated PG17;
   do not assume a service client has safe access merely because it can query rows.
2. Version all five ticket issuers/readers together. Keep public URL and POST response
   shape; bind v2 tickets to actor and Auth session, reject v1 on GET/HEAD after activation,
   and decide authorization **before** contacting Drive/R2. Preserve family-specific
   access, MIME/no-store and 200/206/416 Range/HEAD behavior. DB/Auth outage fails
   closed. Never place a service key in web/mobile or use `user_metadata` as authority.
3. Make web/WebView and native score/audio consumers renew once on a body 401 where
   observable. Where status is opaque, one transport-failure reauthorization attempt is
   acceptable only if abort/content-validation failures do not trigger it. Never bypass
   a 403 or tenant clear. On confirmed fresh-ticket authorization denial, discard the
   stale URL and private local copy; never fall back to it. Test cached URLs, PDF download, Range/seek,
   audio resume and an older client. A concurrently started request may finish under the
   pre-change snapshot; the guarantee applies when its authority check starts after
   the switch/revocation commits, not to recalling an already-open stream.

**Required local red/green evidence:** two independent choirs and a dual-member Auth
user; same-session switch and separate-session noninterference; member/role removal;
changed assignment/visibility; old v1 and new v2; invalid/expired/tampered ticket;
GET/HEAD/Range; legacy/mixed/R2-required provider modes; no provider hit on denial;
simultaneous request/revocation boundary; web and Android retry/denial. If sign-out
revocation is claimed, session deletion needs its own test. Reuse 053/057–060/091 and
mobile acceptance fixtures only after checking coverage; old green is historical.
Specifically prove that an online cached repertoire/assignment file cannot bypass the
new authority check and that a fresh-ticket denial does not fall back to its local copy;
also record the distinct, unavoidable offline-copy boundary.
Before PG17/Android runtime, amend the brief with exact paths, process/disk estimates,
rollback and gates: `pnpm check`, mobile TypeScript/tests and real local Auth/RLS/HTTP/
Android. At the original document-only checkpoint no heavy test or source change ran;
the subsequent approval authorized the local run recorded below.

**Release gate, not authorized here:** current hosted backup and proven isolated
restore, sibling-site impact, additive DB decision → compatible web/mobile clients →
Edge issuers/readers with v1 denial → actual hosted refusal/refresh probes → separate
flags/cutover. Rollback must not quietly restore one-hour v1 access; use a fail-closed
reader/service mode or an expressly approved temporary availability trade-off. Git
revert cannot undo DB data. No 077 real copy, hosted schema/Edge, push/deploy, real
users, hardware or provider action is authorized by the policy answer.

### 30 September client compatibility audit — pre-implementation baseline

The web `lib/drive-file-url.ts` cache retains a ticket per user/file until near expiry;
`hooks/useProtectedDriveFileUrl.ts` has no body-response 401 refresh path and can show a
cached repertoire/assignment copy even while online. On ticket-loading failure it may
fall back to that copy. The chat-image URL hook also has no body-response recovery.
Native `reader-gateway.ts` obtains one ticket then delegates to Expo's
`File.downloadFileAsync`; the installed Android implementation throws an error string
for a non-2xx response rather than exposing a typed status. Native audio receives a
generic player error with a manual retry action, not a guaranteed 401-specific path.
Therefore changing only the ticket utility or Edge reader will not prove user-visible
revocation/automatic recovery. The implementation must exercise each consumer in its
actual runtime, bound retries and cache invalidation, and clearly distinguish offline
copies that cannot be remotely recalled from copies purged after an observed online
denial. These are source findings, not passing runtime tests.

Document-only self-review on 30 September: the recorded decision matches the exact
user answer, remains separate from the proposed v1 policy, and does not reclassify any
historical local/hosted/device result. Local links and whitespace pass; the unrelated
`supabase/.temp/cli-latest` remains untouched. This is not an independent review.

## 30 September scoped local implementation and acceptance

`20260930080046_private_file_ticket_authority_090.sql` adds a service-role-only
invoker RPC over a private definer function. Its one SQL statement checks the signed
actor's `auth.sessions` row, per-session active-choir selection (single active
membership fallback), active member, same-choir role links and family-specific file
visibility. The review/comment checks are inlined with explicit choir role links;
the old 058/059 helpers alone did not assert `roles.choir_id`. Existing 003's
tenant-link trigger also rejected an attempted foreign-choir role fixture. The
signed HMAC v2 payload binds family, file, choir, actor, Auth session and expiry.
All five Edge entrypoints issue/verify v2, reject v1, call the RPC before metadata/
provider access and retain the public POST/URL shape. Service errors fail closed.

Web online reads now HEAD-check cached/private URLs, refresh once on 401 or opaque
body failure, refuse 403 and purge private local caches after confirmed denial.
The repertoire workspace no longer treats a fresh offline snapshot as online
authority; genuine offline copies remain possible and cannot be remotely recalled.
Native PDF retries one untyped Expo transport failure only after obtaining a fresh
ticket, never an abort or invalid PDF. Native audio probes a failed body URL:
401/transport permits one fresh ticket/resume; 403 discards source; a 200 HEAD
remains a decoder failure. Message images/room avatars/gallery use fresh authority
checks and bounded body refresh.

| Required local criterion | 30 September status | Dated evidence / boundary |
|---|---|---|
| Migration, RPC privilege and five-family tenant/role/visibility/session tests | PASS | Disposable PG17, `supabase/tests/090_private_file_ticket_authority.sql` transaction/ROLLBACK. `anon`/`authenticated` denied, service role executes. A/B, dual session, hidden song/review/comment, room membership, role removal, inactive member and deleted Auth session checked. Schema-only 068 source plus exact dependent migration chain; not a hosted restore. |
| Five Edge entrypoint syntax and ticket/handler tests | PASS | `deno check` all five; six focused Vitest files, 60 tests. v1 GET/HEAD 401, signed v2/tamper/expiry and no-provider denial in handler tests. |
| Connected repertoire actual Auth/RLS/HTTP/provider | PASS | Final short runner exit 0: local Auth/PostgREST/RLS/PG17 + Deno + signed loopback S3 exact 65,905-byte PDF/48-byte WAV full/range/HEAD; A→B old A HEAD 403/no provider, separate Auth session retains A, inactive member rejects new and old tickets. S3 is local synthetic, not hosted R2. |
| Android Release native score and post-switch old URL | PASS | API 36 emulator: synthetic sign-in, A URL HEAD 200, exact 65,905-byte PDF page 1/40, A→B cache clear, B-only catalogue, new A ticket 403 and old A URL HEAD 403 from Android. The APK is a test-only loopback Release, not a store/physical-phone build. |
| Full source gates | PASS | Root `pnpm check`: lint, TS, 106/1066 Vitest, service-worker syntax, Next production build. Mobile `npx tsc --noEmit && npm test -- --runInBand`: 50/302. Focused tests and `git diff --check` pass. |
| Real web browser/WebView stale URL and body recovery | NOT RUN | Hook/component tests pass, but no post-change installed Chrome/WebView with actual Auth/Edge. Do not promote build/unit results to browser acceptance. |
| Android stale-v1 body 401 automatic retry and native audio seek/resume runtime | NOT RUN | Jest covers bounded PDF/audio recovery, but Android Release exercised current v2 PDF and post-switch 403 only. |
| All five families' actual HTTP GET/HEAD with provider and concurrency boundary | NOT RUN | Five-family SQL, Edge typecheck and generic handler tests pass; connected HTTP/provider only covers repertoire. No overlapping request/revocation transaction test or hosted check. |
| Hosted DB/Edge, sibling site, real R2/Drive, push/deploy and physical pilot | NOT RUN | Separate current backup/restore, staged release and owner authority required. |

Failed attempts remain failures: first disposable migration chain lacked historical
043/review-audio dependencies and was corrected only in the isolated target; an
initial DB restart missed its SSH tunnel; Android Release first lacked `JAVA_HOME`,
then a relative runtime path omitted the test anon key, then prebuild omitted the
guarded loopback network profile. No such attempt is counted as acceptance. The
30-minute fixture hold timed out **after** the Android PASS traces, so that long
runner exited 1; a separate final short connected runner and SQL matrix exited 0.

Cleanup: the installed synthetic APK, two reverse routes, emulator, exact 090
Supabase containers/volume, SSH tunnel and `colima-genova090` profile/data were
removed. Ignored generated `apps/mobile/android`, `.next`, `coverage`, and exact
`spike/090-runtime`/`spike/093-runtime` were moved to named recoverable 090 Trash
targets; they retain disk blocks, and no real data was deleted. No listeners remain
on 54491/54492/8000/18092; `adb devices` empty, Docker context `default`.
Original local 068 restore's users/choirs/members/songs/files counts remain
`28/1/29/9/79`; this is a scoped source guard, not all-table or hosted backup
equivalence. Final free space 22,561,256 KiB (>10 GiB floor); unrelated
`supabase/.temp/cli-latest` remains unstaged.

090 is **not** a release acceptance. Before hosted activation, close the unrun
browser/WebView, native stale-v1/audio runtime, five-family connected HTTP and
concurrency checks where required; then separately approve and verify current
hosted backup/isolated restore and sibling-site impact, additive DB migration,
compatible web/mobile clients, strict v2 Edge rollout, actual hosted refusal/
refresh probes and later R2 copy/flag/public Drive withdrawal. Never roll back
to permissive v1 readers as an unannounced availability fix; Git revert cannot
undo DB data. Self-review of this implementation is not independent review.

### 30 September follow-up: concurrent boundary preparation, NOT RUN

A read-only inspection confirmed the retained `genova_068_test_restore` has no
057–060 private-file tables. A disposable 15–16 MB database named
`genova_090_concurrency_test` was cloned from it without modifying the source.
An initial abbreviated chain refused at 043 because 041/042 were absent. After
adding 041/042, 043/053/057 applied, but 058 refused because the older
`20260516_assignment_review_audio.sql` columns were absent. Adding that source
migration let 058/059 apply; 060 then refused because it requires 044/045 chat
authority objects. After these bounded setup failures, no concurrent authority
probe or additional HTTP-family probe was run; neither gets a PASS. The exact
disposable clone was dropped, and its absence verified. Original 068 restore
remained untouched; free space after cleanup was 22,566,876 KiB.

Next bounded action: derive the complete ordered prerequisite closure from each
migration preflight **before** starting another disposable clone (at minimum
041–045, historical review-audio, 053/057–060, 090), then run the existing 090
SQL matrix first and a two-session post-commit versus in-flight authorization
test. Only after that re-establish Auth/Edge/S3 to exercise the four remaining
HTTP families. Do not treat a pre-commit snapshot read as a violation of the
chosen post-commit next-request contract.
