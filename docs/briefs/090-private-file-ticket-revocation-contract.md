# 090 — private-file ticket revocation contract before Android beta

Status: IN PROGRESS / local v2 implementation and synthetic acceptance PASS on
30 September 2026; Android synthetic audio and connected stale-v1 PDF recovery PASS on 1 October.
Hosted, remaining four-family HTTP overlap, connected audio/native-iOS and release gates remain open. Primary agent,
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
| Web/native client recovery and required gates | Yes locally | PARTIAL | Chrome PDF recovery, connected Android native stale-v1→v2 PDF/cache/switch and actual permanent Android WebView recovery PASS locally. Android audio uses unsigned synthetic issuance. Five connected serial HTTP readers PASS historically; repertoire HTTP/COMMIT PASS with declared native-psql adapter on 1 October. Remaining four-family HTTP overlap, connected audio Auth/R2 and native iOS remain NOT RUN. |
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

### 30 September connected four-family HTTP work card

One outcome: prove that each non-repertoire private-file reader issues a v2 URL
through real local Auth/PostgREST/RLS, serves exact bytes from signed loopback
S3, and refuses the already-issued URL on the next GET/HEAD after a committed
same-session A→B switch without contacting the provider. This closes only the
four-family connected HTTP evidence gap, not browser/native/hosted acceptance.
At most three actions: (1) prepare one unlinked disposable local Auth/PG17 stack
with the preflight-derived 041–045, 053, historical review-audio, 057–060 and
090 chain; (2) add/run one focused `supabase/test-support/090_*` synthetic
four-family HTTP fixture, reusing the 091 loopback S3 pattern; (3) run focused
and root gates, record failures, clean exact owned resources and commit code/
record separately. Allow only this brief, narrow test support, exact runtime
ignore/config and concise handoff/progress references. No production reader/
schema/client edit unless a connected RED proves a scoped defect and this
card is amended. Preserve POST URL shape, five-family access rules, 200/206/
HEAD bytes, no provider hit after denial and offline boundary. No real data,
credentials, hosted Supabase/R2/Drive, push, device or deployment.

Transition check: `AGENTS.md`, handoff, active context, this brief, delivery
controls, transition guide, work cycle, `MIGRATION.md` native/WebView boundary,
decision #32, 091 fixture and current 057–060 readers were inspected at
`main/4fbef53`; only unrelated `supabase/.temp/cli-latest` is dirty.
Fresh `df -k .` gave 21,906,500 KiB available. No Colima profile, 090 service,
port listener or generated build is active. Reuse installed binaries/images;
conservative additional peak is <8 GiB for one VM/data plus <1 GiB for dump,
logs and test, leaving >12 GiB projected free. Check actual allocation during
startup and stop at the next safe boundary if below 10 GiB. Owned targets are
only `spike/090-runtime`, `colima-genova090`, its exact five containers/volume,
loopback 54491/54492/8000/18092 and any named generated output. Preserve
the original 068 restore, global caches and private copy evidence. A failed
local run is NOT RUN/FAIL, not a reason to weaken the test or activate live
services. Code rollback is a scoped test-code revert; local runtime is
disposable. Hosted migration rollback remains a separate release problem.

| Required local criterion | 30 September status | Dated evidence / boundary |
|---|---|---|
| Migration, RPC privilege and five-family tenant/role/visibility/session tests | PASS | Disposable PG17, `supabase/tests/090_private_file_ticket_authority.sql` transaction/ROLLBACK. `anon`/`authenticated` denied, service role executes. A/B, dual session, hidden song/review/comment, room membership, role removal, inactive member and deleted Auth session checked. Schema-only 068 source plus exact dependent migration chain; not a hosted restore. |
| Five Edge entrypoint syntax and ticket/handler tests | PASS | `deno check` all five; six focused Vitest files, 60 tests. v1 GET/HEAD 401, signed v2/tamper/expiry and no-provider denial in handler tests. |
| Connected repertoire actual Auth/RLS/HTTP/provider | PASS | Final short runner exit 0: local Auth/PostgREST/RLS/PG17 + Deno + signed loopback S3 exact 65,905-byte PDF/48-byte WAV full/range/HEAD; A→B old A HEAD 403/no provider, separate Auth session retains A, inactive member rejects new and old tickets. S3 is local synthetic, not hosted R2. |
| Android Release native score and post-switch old URL | PASS | API 36 emulator: synthetic sign-in, A URL HEAD 200, exact 65,905-byte PDF page 1/40, A→B cache clear, B-only catalogue, new A ticket 403 and old A URL HEAD 403 from Android. The APK is a test-only loopback Release, not a store/physical-phone build. |
| Full source gates | PASS | Root `pnpm check`: lint, TS, 106/1066 Vitest, service-worker syntax, Next production build. Mobile `npx tsc --noEmit && npm test -- --runInBand`: 50/302. Focused tests and `git diff --check` pass. |
| Installed Chrome web stale URL and body recovery | PASS locally | 30 September follow-up below: production-built Next UI and actual local Auth/RLS/Deno/signed S3, with declared v1/body fault injection and test-only transport relay. This is not an unmodified Kong route. |
| Android WebView stale URL and body recovery | NOT RUN | Chrome web UI is not an installed Android WebView; no WebView runtime was exercised. |
| Android stale-v1 body 401 automatic retry and native audio seek/resume runtime | NOT RUN | Jest covers bounded PDF/audio recovery, but Android Release exercised current v2 PDF and post-switch 403 only. |
| Two-session SQL authorization at switch/role/member commit boundaries | PASS locally | 30 September follow-up: `supabase/tests/090_private_file_ticket_concurrency.sql` on a disposable native PG17 clone. An uncommitted peer change leaves the prior snapshot readable; a new statement after commit refuses it. This is SQL authority evidence, not an overlapping HTTP request or provider test. |
| All five families' actual HTTP GET/HEAD with provider | PASS locally | Repertoire connected runner above; 30 September follow-up adds all four other actual Edge entrypoints with local Auth/PostgREST/RLS/PG17 and signed loopback S3. Full/range/HEAD bytes, foreign-user POST 403 and same-session A→B old URL GET/HEAD 403/no provider hit passed. This is not hosted R2 or browser/native acceptance. |
| Provider request overlapping a membership/role/choir-switch commit | NOT RUN | The existing two-session SQL test proves the next-statement post-COMMIT boundary, and the connected HTTP fixture proves serial post-switch refusal. Neither drives an already-in-flight GET against a concurrent commit. |
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
Android WebView, native stale-v1/audio runtime and the in-flight HTTP boundary
where required; then separately approve and verify current
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

At that failed checkpoint, the next bounded action was to derive the complete ordered prerequisite closure from each
migration preflight **before** starting another disposable clone (at minimum
041–045, historical review-audio, 053/057–060, 090), then run the existing 090
SQL matrix first and a two-session pre-/post-commit authorization
test. Only after that re-establish Auth/Edge/S3 to exercise the four remaining
HTTP families. Do not treat a pre-commit snapshot read as a violation of the
chosen post-commit next-request contract.

### 30 September follow-up: two-session SQL boundary, PASS locally

The complete preflight-derived chain on a new 15 MB disposable clone was
041→045, 053, 057, historical `20260516_assignment_review_audio.sql`, 058→060,
then 090. All applied in order. The first 090 SQL-matrix attempt failed because
the retained native restore's `genova_003` trigger owner `postgres` lacks the
superuser privileges it has in the Supabase stack; a **target-only** SELECT grant
on public tables restored that test prerequisite. The next attempt exposed an
incorrect fixture writer: 060 intentionally refuses a private avatar alias from
the native local administrator. The test now performs only that fixture update
under `postgres` using `SET LOCAL ROLE`, keeping the 060 trigger enabled. The
five-family matrix then exited 0 with ROLLBACK; neither failed attempt counts as
acceptance or a production-code defect.

New `supabase/tests/090_private_file_ticket_concurrency.sql` is guarded to the
exact disposable database name and uses a second `dblink` session. Its SQL
authority checks pass for A→B selected-choir switch, A chef-role removal and
A membership deactivation: before peer COMMIT the old committed state remains
visible; a fresh statement after COMMIT refuses the same signed-ticket identity.
The script does **not** model a provider stream already in flight, prove lock
ordering for HTTP, or exercise all five Edge readers. `psql -X -v ON_ERROR_STOP=1`
exited 0. Test-only code commit `70fd23e`; no product migration or reader code
changed. Final `pnpm check` passes lint, TypeScript, 106 files/1066 tests,
service-worker syntax and Next build. Mobile tests were not rerun because no
mobile source changed after the preceding 090 acceptance.

The 17 MB disposable clone was dropped and its absence verified. The retained
068 restore's five scoped counts remained `28/1/29/9/79`; this is not an
all-schema digest. The generated `.next` (477,576 KiB) and coverage (352 KiB)
were moved to exact recoverable `genova-090-concurrency-20260930-*` Trash targets.
Final free space was 21,890,392 KiB, above the 10 GiB floor; the unrelated CLI
marker remains unstaged. Next ready local evidence is the four non-repertoire
HTTP-family reads against real local Auth/Edge/PostgREST and signed loopback S3;
At that checkpoint, browser/WebView and native stale-v1/audio runtime remained
separate NOT RUN gates; the later Chrome result below closes only the web-browser layer.

### 30 September follow-up: four-family connected HTTP, PASS locally

Added `supabase/test-support/090_connected_private_file_families.ts` with an exact
loopback API/PG/S3 guard and only random synthetic Auth users, A/B choirs, members
and private-file rows. The retained 068 restore supplied **schema only**. Local
Supabase PG17/Auth/PostgREST/Kong and the actual four Deno Edge entrypoints ran
against a signed loopback S3 fixture; no hosted provider or real content was
accessed. The complete 041–045, 053, 057, historical review-audio, 058–060,
090 migration chain applied, and the five-family SQL matrix exited 0 with
ROLLBACK on this disposable stack. The source schema dump ended with a denied
`supabase_admin` default-privilege statement under local `postgres`; all schema
objects and earlier grants had applied, and the relevant migration/SQL/HTTP
checks passed. This is a documented local restore difference, not a claim of
full-fidelity hosted restore.

The first service start failed with no reachable PG port. A first SSH attempt
accidentally used `ClearAllForwardings=yes` and failed identically; inspection
showed no listener. Removing that option made both explicit loopback tunnels
listen, and the next start succeeded. The first fixture run reached Deno but
its permission list omitted the entrypoints' `0.0.0.0:8000` bind; after that
test-only correction the runner exited 0. All four families passed exact MIME
and SHA-256 full GET, exact range bytes, HEAD length/no body, foreign-user
POST 403, and same-session A→B new POST plus previously issued GET/HEAD 403.
Denied requests made no provider call. Earlier failures are not counted as
passes. The repertoire family has its separate connected PASS above; together
the five families now have local connected GET/HEAD evidence. This is serial
post-switch behavior, **not** an already-in-flight HTTP request overlapping
COMMIT. Browser/WebView, Android stale-v1/audio runtime and hosted layers stay
NOT RUN.

Fresh root `pnpm check` exited 0: lint, TypeScript, 106 files/1066 Vitest
tests, service-worker syntax and Next production build. No mobile source
changed, so mobile tests were not rerun. `git diff --check` passed. Cleanup
removed only the exact disposable `genova-090-runtime` containers/volume and
`genova090` VM/data; the SSH tunnel stopped, and all four task ports have no
listener. The 276 KiB ignored runtime was moved recoverably to
`~/.Trash/genova-090-http-20260930-1748`; generated `.next` (466 MiB) and
`coverage` (352 KiB) were deleted after verification. Final free space was
24,445,848 KiB. Original 068 restore row-count guard remained
`28/1/29/9/79`; unrelated `supabase/.temp/cli-latest` remains unstaged.

## 30 September approved Chrome browser checkpoint — work card

Owner approved the next bounded local checkpoint. One observable result: in an
installed Chrome running the real web repertoire UI, a synthetic A PDF whose
first ticket response is deliberately replaced with a valid legacy v1 URL must
receive an actual Edge 401 on HEAD, obtain a new v2 ticket and display the
authorized PDF; a single injected body failure must recover once without
showing A content after a same-session A→B selection. These two fault injections
are test-only and must be separated from unmodified Auth/RLS/Edge/S3 responses.
Chrome is the web client, **not** proof of Android WebView; the latter remains
NOT RUN unless its own installed runtime is actually exercised.

Transition check: read `AGENTS.md`, short handoff/active, this brief, plan's
bounded controls, `docs/gecis-rehberi.md`, work cycle, relevant `MIGRATION.md`,
decision #32, 089 Chrome runner, 091 connected fixture and current web hook/
reader source. Verified `main/f885af7`, only unrelated
`supabase/.temp/cli-latest` dirty. `df -k .` gives 24,404,672 KiB free.
Installed Chrome and local binaries exist; no active Colima profile or task
ports. One fresh disposable PG17/Auth/Next/Chrome environment is conservatively
estimated below 7 GiB additional allocation (previous VM about 4.5 GiB peak,
Next about 0.5 GiB, browser/dependencies already installed), leaving >17 GiB
projected, above the 10,485,760 KiB floor. Recheck during runtime/build and
stop allocation if below floor. No download or hardware is planned.

At most three actions: (1) start one guarded unlinked `spike/090-runtime` local
stack, source schema-only plus exact 041–045/053/057–060/090 chain, and reuse
the 091 synthetic A/B PDF fixture/loopback S3; (2) run one narrow Chrome script
against production Next UI and actual Deno entrypoint, with POST forwarding
to loopback Deno and only the named legacy/body fault injections; (3) run
focused/full relevant checks, record exact PASS/FAIL/NOT RUN, clean owned
VM/containers/ports/build/runtime, commit test and records separately. Allowed
tracked paths are this brief, `supabase/test-support/090_*` browser fixture,
and concise handoff/active/progress references. No production web/Edge/schema
change without an observed RED and explicit scope amendment here. Preserve
v2 URL shape, one retry ceiling, live tenant decision, exact bytes, no provider
hit on denial and offline boundary. No hosted, real-account/data, push/deploy,
device or provider action.

| Required Chrome checkpoint criterion | Status | Evidence / limit |
|---|---|---|
| Guarded local Auth/PG17/Next/Chrome/Deno/signed S3 and synthetic A/B fixture; source unchanged | PASS locally | Chrome 154, local PG17/Auth/REST/Next/Deno/signed S3; source five-count guard `28/1/29/9/79`. Browser function requests used a test-only transport relay to the actual Deno handler, not an unmodified Kong function route. |
| Actual UI v1 HEAD 401 → one bounded v2 refresh → authorized A PDF body | PASS locally | One valid legacy-ticket response injected, actual Deno HEAD 401 observed once; next real v2 ticket authorized. A 65,905-byte fixture PDF reached Chrome and its React-PDF canvas rendered. |
| Actual UI one body failure → bounded re-ticket/recovery; A→B old URL refusal and no stale A display | PASS locally | Exactly one synthetic body GET 401; exactly three total POSTs (v1, replacement v2, body retry), one successful PDF GET; B catalogue showed B-only and old A URL HEAD returned actual 403. Browser switch is not in-flight HTTP COMMIT proof. |
| Relevant focused checks, root gate if tracked web/shared code changes, links/diff and cleanup | PASS locally | Final focused ESLint/TS, `pnpm check` 106 files/1066 tests and Next build; diff/link and exact cleanup below. No mobile source changed. |
| Android WebView and native stale-v1/audio runtime, hosted/physical device and overlapping HTTP COMMIT | NOT RUN | Not inferred from Chrome or local test. |

### Chrome checkpoint result / causal record

New `supabase/test-support/090_chrome_private_file_acceptance.ts` drives the
installed Chrome against production-built Next and actual local Auth/REST/RLS,
the 091 synthetic two-choir PDF fixture, the repertoire Deno entrypoint and
signed loopback S3. External browser destinations are blocked. Because the
direct local Deno process binds `:8000/` but the web client correctly accepts
only `:54491/functions/v1/repertoire-file`, the test browser relays function
requests to Deno and normalizes only the local URL origin/path; it does not
change signed ticket bytes or authority decisions. A one-time valid v1 response
and a one-time PDF body 401 are explicitly injected to exercise recovery. This
is real Chrome/UI/Edge behavior under two declared faults, **not** an
unmodified Kong-function-route or Android WebView result.

The first Chrome attempt waited for the post-selection switcher while the
actual two-choir gate was displayed; the test now uses that real gate. The
next attempt reached the song but no PDF request: the retained 068 schema
lacked annotation `revision`; applying existing 024 only to the disposable
target removed the visible error. A subsequent run exposed the direct-Deno
versus browser endpoint shape mismatch in the test relay; after URL
normalization, the handler's relative `?fileId=...` response needed a base URL
to parse. No production code was changed for these harness failures.

After the first Chrome PASS, fixture teardown detected a real 200 on an
inactive-member **new POST**. Inspection showed the disposable source schema
had not received the existing 078 active-membership migration. Adding 078 to
the target and rerunning a fresh synthetic fixture made both Chrome and the
fixture's inactive-member new/old-ticket checks pass. The earlier failed
teardown remains recorded, not relabeled as a pass. The complete browser
prerequisite closure used here is source schema-only plus 024, 041–045, 053,
057, historical review-audio, 058–060, 078 and 090; 024/078 were added after
the initial chain in this disposable target. Fresh five-family SQL matrix
also exited 0 with ROLLBACK after those additions.

Final Chrome run exited 0: `post=3`, injected `v1=1`, body `401=1`, observed
legacy HEAD `401=1`, PDF body `200=1`, post-switch old HEAD `403=1`; A PDF
canvas visible and B-only catalogue visible. The held 091 connected fixture
then exited 0, including inactive membership refusing new and previously
issued tickets. Fresh root `pnpm check` exited 0 with lint, TypeScript,
106 files/1066 tests, service-worker syntax and Next production build.
Self-review only; no independent reviewer or hosted/browser-WebView parity
claim. Actual WebView, native stale-v1/audio and in-flight HTTP/COMMIT remain
required NOT RUN gates.

Cleanup: exact `genova-090-runtime` Supabase containers/volume, SSH tunnel and
`genova090` VM/data were deleted; task ports 54491/54492/8000/18092/31090
have no listener. The ignored synthetic `spike/090-runtime`, empty
`spike/093-runtime`, generated `.next` (494 MiB) and `coverage` (352 KiB)
were deleted after their last checks; these task-generated outputs are not
recoverable, while source and original restore remain. Final free space was
24,262,492 KiB, above the 10 GiB floor. The unrelated
`supabase/.temp/cli-latest` stays unstaged. No push, live DB/Edge/provider,
real user/data, hardware or deployment action occurred.

## 1 October general check and Android audio recovery — work card

Current request: general project check and continue scoped local implementation. Read
AGENTS, handoff/active, this brief, guide/work cycle, delivery execution controls,
MIGRATION, decisions #28–32, WF-013 and actual native audio/config/tests. Verified
`main/d3ce159`; only unrelated `supabase/.temp/cli-latest` dirty. No delegated writer.
WF-013 step 6 incorrectly still says the owner contract is missing; decision #32 and
the implemented 090 evidence supersede that wording. Correct that current pointer,
without relabeling historical 093 evidence or changing commercial/release decisions.

One continued outcome: actual Android Release / Expo audio must recover once from an
HTTP body 401, seek and renew an expiring URL while preserving position/play intent,
then clear the native owner at the tenant boundary. Reuse the existing synthetic
160,044-byte WAV loopback server; deliberate synthetic tickets are NOT actual Auth,
SQL, signed S3 or v1/v2 cryptographic evidence. Those layers retain their distinct gates.
Android native PDF stale-v1 and WebView are not closed by this audio checkpoint.

Allowed paths: `apps/mobile/src/acceptance/090_*`, its focused config tests, the
existing audio loopback server/network plugin, guarded `apps/mobile/index.ts`
selection and focused plugin tests; only a
runtime-reproduced defect permits a narrow `AudioPlaybackProvider.tsx` + regression
test fix with necessary `apps/mobile/src/test/setup.ts` event-emitter fidelity.
Records: this brief, `docs/reports/2026-10-01-project-checkup.md`, WF-013,
short handoff/active/progress. No dependency, schema, web or hosted changes planned.
Actions: (1) guarded fixture/automated acceptance and focused tests; (2) one Android
Release with installed SDK/JDK17/API36 AVD, recording actual media HTTP and playback;
(3) mobile full gates, scoped review, exact cleanup and separate code/docs commits.
Rollback is reverting owned local code; no external data changes. 090 remains open.

Preflight: free 24,915,836 KiB; existing mobile dependencies 8,673,288 KiB, root
1,621,064 KiB, Gradle 5,531,480 KiB and AVD 3,387,144 KiB already counted. No
task VM/process/device exists. Additional peak <=7 GiB (Android source/native build
<=4 GiB, AVD growth <=1 GiB, Metro/cache/logs <=2 GiB), projected >16 GiB free,
above 10,485,760 KiB floor. No toolchain download or VM. Measure each phase; stop
allocation before floor breach. Owned disposable output: generated mobile `android/`,
`.expo/`, exact ignored `spike/090-runtime`, emulator 5580 process and reverse 18026,
loopback audio server 18026. Preserve existing AVD, dependencies, global caches,
private backup/copy evidence and unrelated marker. Delete only new owned output
after its final dependent check; stop emulator/server and remove reverse route.

| Required checkpoint criterion | Status | Evidence / boundary |
|---|---|---|
| General source/plan/Git/resource/retained-artifact check | PASS locally | [General report](../reports/2026-10-01-project-checkup.md); no live-state inference |
| Guarded synthetic loopback and focused config/plugin tests | PASS locally | Focused config/plugin 2/13, audio/player checks and complete mobile gate; exact flags/target, no Auth credentials/public build secrets |
| Actual Android body 401 → bounded retry, seek/expiry resume, tenant clear | PASS locally | Actual API36 Release / Expo media client; 401 recovery, seek, expiry resume, tenant clear and confirmed 403 no-re-ticket below. Deliberately synthetic ticket service, not connected Auth/R2 |
| Full mobile typecheck/tests, Android build, scoped review and cleanup | PASS locally | Mobile TS/51 suites/314 tests, Android Release, normal Android/iOS JS exports, fresh root lint/TS/106 files/1066 tests/SW syntax/Next build, diff and exact cleanup PASS. Self-review only; iOS JS export is not native/runtime |
| Native PDF stale-v1, WebView, overlapping HTTP/COMMIT, hosted/device/release | NOT RUN | Separate 090 gates; no blanket brief closure |

### 1 October Android audio result / causal record

Installed SDK/JDK17 and offline Gradle arm64 `assembleRelease` built successfully.
The first install ran before Android's package/activity services were ready; the next
command explicitly waited for `sys.boot_completed=1` before installing. No rebuild
was needed for that environment readiness failure.

The first actual media acceptance **FAILed**: ExoPlayer made four internal GET retries,
all HTTP 401, then reported a native source error; the product never requested ticket 2
and acceptance timed out. Installed Expo Android source emits error once in
`AudioPlayer.onPlayerError`, while following `currentStatus()` updates emit `error:null`;
`useAudioPlayerStatus` stores only the last event. A React-batched tick can therefore
erase that error before the previous effect observes it. This was invisible to the
old stable mutable-status mock. The fix subscribes to the real player's status event,
latches error only for that source/player, and removes the listener on cleanup. New
event-emitter regressions exercise error→null in one turn, 403, bounded second failure
and a late old-source event. Private failure state clears with source/tenant/denial.

Scoped lifecycle review also guards async seek→play/catch against request-generation
or player changes; a pending seek completed after tenant clear cannot restart audio.
The focused regression covers that late completion. No native dependency was patched.
An initial test-helper Babel hoist error rejected a type-parameter name; renaming that
type-only mock parameter repaired the helper. It is not a product RED/green result.

The repaired Android run passed recovery/seek/resume/clear. A final rebuild included
the async-resume guards and a separate actual 403 fixture; it also passed. Final APK
SHA-256 `d96d7f9b58a6c1991391460e0659ae43106a0aece2d6490ddbda436d738981a2`.
Afterward a type-only assertion removed TS's incorrect literal narrowing of a ref
mutated by async `openSession`; it changes no emitted playback behavior. Complete
mobile typecheck/tests then passed 51 suites / 314 cases after the final regression.

Final Android UI hierarchy and app-PID log confirm: initial synthetic ticket 1,
ticket 2 after one HEAD 401, loaded source, seek to 4s, ticket 3 for expiry and
playing at >=4.2s, pause/seek2/resume without another ticket, tenant-clear owner empty,
ticket 4 for a deliberately denied source, access-ended error without ticket 5,
then final clear and `ALL PASS`. The loopback service saw four ExoPlayer GET 401s,
one HEAD 401, two successful 160,044-byte GET 200s, Range `bytes=32044-` returning
206 / 128,000 bytes; denial had four internal GET 403s and one HEAD 403. Internal
decoder retries are distinct from the application's one permitted re-ticket.
WAV SHA-256 `b43dde9816f8047e0c351a5a756f99d75433396ce8f4ac0b36dc1d825f26127e`.
The emulator ran with audio output disabled: this proves playback state/HTTP/seek,
not speaker output quality, physical-device behavior or background playback.

This test uses the actual product provider and Expo/Android decoder, but deliberately
synthetic unsigned ticket issuance and HTTP 401/403 faults. No Auth/Postgres/Deno/S3
environment was started. It does not close native PDF cryptographic v1→v2, WebView,
connected audio Auth/R2, or in-flight HTTP/COMMIT proof. iOS JS export passes; native
iOS audio error-latch/seek lifecycle acceptance is **NOT RUN**, explicitly scheduled
for 090's integrated both-platform private-client checkpoint before release, not
silently removed. A mistaken `expo export --platform all` attempted unsupported web
and failed before export; native-only exports avoid adding react-native-web or changing
the product scope. 090 remains IN PROGRESS.

Final gates: `npm run typecheck && npm test -- --runInBand` exits 0, 51/314.
Source/test checkpoint: `dc46c2a`; documentation committed separately, no push.
Normal native-only Expo exports (all acceptance flags disabled, dotenv loading off,
placeholder public Supabase configuration) both exit 0 with 1,439 modules each.
Fresh root `pnpm check` exits 0: ESLint, TS, 106/1066 Vitest, service-worker syntax,
Next production build; Supabase URL/keys explicitly overridden to local/synthetic,
VAPID blank. No hosted Auth/DB action. Focused config/plugin 2/13 and player/mini
checks pass; final full gate includes the added bounded-second-body-failure case.
`git diff --check`, JS syntax and changed-document link checks PASS.

Cleanup: acceptance APK uninstalled, exact temporary UI dump removed, adb reverse
18026 removed, emulator stopped and loopback audio server exited 0. No ADB device
or listener remains. Exact newly generated `apps/mobile/android` (782,904 KiB),
`apps/mobile/.expo` (8,576 KiB), root `.next` (477,544 KiB) and `coverage` (352 KiB)
were deleted after their last checks. They are reproducible, not recoverable binaries;
source, existing AVD/toolchain/dependencies/caches/private backups remain. No VM or
secret fixture was created. Final free 25,989,296 KiB; measured phase headroom stayed
above 10 GiB. Unrelated `supabase/.temp/cli-latest` remains unstaged. No external
write, credentials, email, real data, push/deploy/device/distribution action occurred.

## 1 October native Android stale-v1 PDF — work card

Continuation approved by the owner. Entry sources: AGENTS, short handoff/active,
this brief, guide/work cycle, delivery execution controls, decisions #32, MIGRATION,
093/091 and actual reader/Auth/file-store/renderer/acceptance sources. Verified
`main/4cc2961`; only unrelated `supabase/.temp/cli-latest` dirty, left unstaged.
One writer, no delegation. Original `genova_068_test_restore` remains 28 Auth users,
1 choir, 29 memberships, 9 repertoire rows and 79 files; it is a preserved source,
not the disposable runtime target.

Outcome: actual Android Expo file download rejects a valid legacy v1 ticket, the
product reader obtains exactly one replacement from actual local Auth/RLS/Deno,
renders the 40-page synthetic PDF, then A→B clears private cache and refuses the
already-issued A URL. First response URL substitution is a declared fixture fault;
a loopback GET/HEAD observation relay forwards unchanged signed queries to the
real Deno handler. It is not unmodified Kong, hosted R2 or a physical-device test.
Synthetic login secrets travel once over guarded loopback at runtime, never via
public build variables, source, trace or committed evidence.

Allowed source: new `apps/mobile/src/acceptance/090_native-pdf*` and tests, existing
loopback plugin/tests, guarded `apps/mobile/index.ts`, and
`supabase/test-support/091_connected_private_r2_read.ts`. A product fix requires a
runtime-reproduced reader defect and narrow regression. Records: this brief and
short handoff/active/progress. No dependencies, live schema/provider or web changes.
Actions: (1) guarded runtime fixture/native entry + focused tests; (2) one local
PG17/Auth/Edge/signed-S3 runtime and Android Release, actual UI + HTTP assertions;
(3) mobile/root gates, review, exact cleanup and separate source/docs commits.
Exit is this local acceptance, not blanket 090 closure. Rollback: owned code revert
and disposal of only this synthetic runtime; preserved source DB is never mutated.

Preflight: 26,021,080 KiB free; existing mobile dependencies 7,480,492 KiB, root
1,621,064 KiB, Gradle 4,448,984 KiB, AVD 3,434,124 KiB. No owned VM running.
Additional peak <=12 GiB: VM/images/DB <=7 GiB (prior measured runtime bound),
Android/build/cache <=3 GiB, AVD growth <=1 GiB, logs/exports <=1 GiB; projected
free >13 GiB above 10,485,760 KiB floor. Reuse SDK/JDK17/API36, no toolchain install.
Measure each phase and stop further allocation before the floor. Exact disposable
targets: `genova090` Colima profile/data, `genova-090-runtime` local containers/volume,
127.0.0.1 ports 54491/54492/8000/18092, emulator 5580 and its app/reverse routes,
generated mobile `android/`/`.expo/`, ignored `spike/090-runtime` and the one-use
`spike/093-runtime` fixture, root `.next`/coverage after gates. Preserve dependencies,
existing AVD/global caches/private backups/manifests and unrelated marker.

| Required checkpoint criterion | Status | Evidence / boundary |
|---|---|---|
| Exact loopback/config guards, no public build password | PASS locally | Focused 2 suites/26 cases; strict target/shape/relay guards, runtime-only one-use credentials with second POST 410; no full synthetic email baked in APK strings scan. No literal password is supplied to build variables |
| Actual Android v1 GET 401 → exactly one real v2 renewal → hash/native PDF page 1/40 | PASS locally | API36 arm64 Release, actual Expo file store/renderer; server GET401/providerDelta0 then GET200/65905B/providerDelta1, exactly two successful ticket POSTs; matching SHA, visible page1/40 and page2/40 |
| Actual A→B cache clear, old A HEAD 403 without provider access, B-only catalogue | PASS locally | Product AuthStore/AppRoot, on-device private root absent; old URL HEAD403/providerDelta0, new A POST403 in B, actual B-only catalogue UI assertion |
| Mobile TS/full tests, root check, review, resources/cleanup | PASS locally | TS/52 suites/333 tests, normal native-only exports, root 106/1066/build, diff/lint/links and exact cleanup; source `364cfe4`. Self-review, not independent review |
| WebView, concurrent HTTP/COMMIT, connected audio, iOS native, hosted/device/release | NOT RUN | Separate retained gates; no blanket closure |

### 1 October native PDF result, bounded failures and cleanup

Source/test checkpoint `364cfe4`; no production reader/Auth/backend dependency or schema
change was needed. The existing reader's one opaque native-download retry worked with
actual Expo Android. New code is explicitly gated local acceptance instrumentation:
real AuthProvider/AuthStore/SecureStore and AppRoot/catalogue/PDF screen, actual POST
authority, existing file store/renderer/annotations, declared first-response v1 URL
substitution and GET/HEAD observation relay. Signed query bytes are forwarded unchanged
to Deno. The signed S3-compatible object server is synthetic, not hosted Cloudflare R2;
the relay is not unmodified Kong. No cross-client or hosted inference.

Setup causal record: the first schema restore failed because a pre-created empty
`public` conflicted with the dump's CREATE; a retry exposed previously partially
created empty `genova_003/005/007/008`. After these two failures, inspected CREATE order
and target schema/table inventory, then atomically dropped only those empty disposable
schemas and restored with `--single-transaction`. No source DB write or VM rebuild.
Applied the complete prerequisite closure (024, 041–045, 053, 057, historical review
audio, 058–060, 078, 090). First connected fixture failed at `select A`; diagnostics
subsequently proved the actual authenticated RPC succeeds unchanged. The initial
redacted error does not establish an exact cause (asynchronous schema-cache readiness
is suspected, not confirmed). A fresh synthetic fixture then passed all checks; no
product fix is attributed to that setup failure. Prebuild completed without changes
to package/lock files; the Release build explicitly used absolute local runtime path,
nonempty public anon key, dotenv disabled and no public password variables.

Offline Gradle arm64 Release: `BUILD SUCCESSFUL in 1m 17s`; installed SDK/JDK17/API36
AVD `genova004_api36`, emulator5580. Waited for `sys.boot_completed=1` before install.
APK SHA-256 `f8e552b5f0d0cf377173ca57fa404effb8689d4a98358ed9595ae5aef7303905`.
Single-use credential POST200 then POST410; no credential JSON file was created in
090 mode. Native trace proves ticket1 actual-authority POST with declared legacy URL,
native download rejection, ticket2 actual v2, matching 65,905-byte checksum, native
render page1/40 (window2) and page2/40 (window3). Screenshot visually inspected:
synthetic coordinate-grid page1 visible, not merely renderer metadata. Native trace
09:01:16–09:02:35 local; HTTP observer asserts exactly GET401(30B/providerDelta0),
GET200(65905B/providerDelta1), HEAD403(0B/providerDelta0). PDF SHA-256
`39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`.
The UI then clears private cache through the product tenant boundary, shows B only
(`091 audio`, no `091 score`), denies old A HEAD and new A ticket in B. Held fixture
exits0 after SIGTERM, including foreign-user refusal, separate session still A and
inactive membership refusing both new and already-issued tickets.

Fresh mobile `npm run typecheck && npm test -- --runInBand`: 52 suites/333 cases, exit0.
Normal Expo Android/iOS exports (acceptance flags off, dotenv off, synthetic public
config): each 1439 modules, exit0; these are JS checks, NOT native iOS/runtime proof.
Fresh root `pnpm check`: ESLint, TS, 106 files/1066 tests, SW syntax and Next production
build exit0, Supabase explicitly local/synthetic and VAPID blank. Final fixture-only
review preserves the original malformed-URL catch and formatting; no change to the
exercised valid relay flow or APK. Focused fixture ESLint, diff and document-link
checks PASS. Self-review only. 090 stays IN PROGRESS; next ready local result is actual
permanent Android WebView private-file recovery, then overlapping HTTP/COMMIT.

Resources stayed above 10 GiB (lowest observed 19,271,556 KiB during Android runtime).
Disposed exact local containers/volume, SSH tunnel and `genova090` VM/data; Colima
returns no instances/default Docker context, no task-port listeners or adb device.
APK uninstalled, UI dump/reverse54491/8000/18092 removed, emulator/server stopped.
After last dependent gates deleted owned mobile `android/`789,384 KiB, `.expo/`8,528
KiB, root `.next`477,548 KiB, coverage352 KiB, ignored runtime956 KiB (including
screenshot/logs/schema-only dump), empty093 runtime. These derived outputs and
synthetic runtime data are not retained/recoverable; source can reproduce them.
Final free 24,923,220 KiB; existing AVD3,449,672 KiB, Gradle5,531,824 KiB, mobile
dependencies6,410,064 KiB/root1,621,064 KiB and original/private evidence preserved.
Original068 five-count guard remains `28/1/29/9/79`. Unrelated CLI marker unstaged.
No push, live DB/Edge/provider, real data/email/user/credential change, hardware or release.

## 1 October permanent Android WebView — work card

Owner asked to continue. Read AGENTS, handoff/active, current 090, execution controls,
MIGRATION route ownership and actual NativeWebViewScreen/platform capability/bridge,
embedded web policy, 033 composed fixture and korist-detail homework link. Verified
`main/86dc5e3`; only unrelated CLI marker dirty. Single writer, no delegation. Guide
and work cycle unchanged from prior checkpoint. Memory's pre-090 old-URL policy note
is stale; decision #32/current implementation remain authoritative.

One outcome: a real permanent `/koristler/<target>` page in actual Android WebView
must deliver its protected PDF through the native confirmation/download/share flow,
renew once when a valid old v1 body is refused, then fail closed after A→B. Source
shows `ProtectedFileCapability.run` currently downloads a URL once and returns false
on failure, with no authority re-ticket. Reproduce before changing product behavior.
Repertoire is native-owned: do not use a fake WebView repertoire route or claim Chrome
as WebView. Use the existing 033 legacy-submission-link pattern pointing to a synthetic
repertoire PDF. This does not accept assignment-version integration or all WebView media.
The performance query omits `current_file_version_id` and prefers legacy links;
record that follow-up rather than silently accepting Drive-exit completeness.

Allowed: `apps/mobile/src/acceptance/090_webview*`/focused tests, guarded index and
existing local network plugin/tests; `supabase/test-support/091_connected_private_r2_read.ts`
plus narrow test-only relay/fixture support if needed; compile-time loopback policy in
`lib/embedded-web-runtime.ts`, its tests and `components/EmbeddedWebBridgeProvider.tsx`.
Only after Android RED: narrow native `platform-capabilities.ts`, NativeWebViewScreen,
one pure private-ticket recovery helper and focused regressions. No route/schema/
dependency changes, native rewrite, hosted action or auth/permission weakening.
Records: this brief + handoff/active/progress. Actions: (1) guarded one-use fixture,
real production web peer and baseline Android RED; (2) causal minimal repair and
same-environment Android acceptance; (3) full gates/review, owned cleanup, separate
source/docs commits. Required: actual bridge challenge/verified lease, body401→one
renewal/hash/share-sheet, B-context oldURL403/no provider and private-file cleanup,
focused guards/races/denial tests, mobile TS/full tests and root check. Exit is this
local partial checkpoint; 090's other gates remain. Rollback: owned code revert and
disposable local runtime removal, not original DB or external data rollback.

Preflight: free24,929,192 KiB; existing mobile dependencies7,491,952 KiB, root1,621,064,
Gradle4,449,132, AVD3,449,672, Colima24. No VM/device. Additional peak <=11 GiB:
VM/images/DB <=7 GiB (last runtime ~5 GiB), Android/cache <=2 GiB (last output~0.8 GiB),
AVD growth <=1 GiB, web/export/log <=1 GiB; projected >12 GiB above10,485,760 KiB floor.
Reuse installed SDK/JDK17/API36; no toolchain download. Measure phases and stop
allocation before floor breach. Owned exact disposable set: `genova090` VM/data/
`genova-090-runtime` stack/volume, loopback54491/54492/8000/18092/31090, emulator5580
app/reverses/UI dump, generated mobile android/.expo, root .next/coverage, ignored
spike/090-runtime and empty093 fixture directory. Preserve original068 restore/private
backups/manifests, existing dependencies/AVD/global caches and unrelated marker.

| Required checkpoint criterion | Status | Evidence / boundary |
|---|---|---|
| Exact isolated loopback/native/web policy, one-use runtime login | PASS locally | Guarded local Auth/Next/API36 Release, one-use POST200/410 and actual challenge/lease/web proof |
| Baseline real WebView old v1 refusal identifies recovery gap | PASS reproduced | Actual `/koristler/<target>` homework link → native confirmation → GET401, no renewal/hash/share before repair |
| Bounded authority renewal, exact native PDF, real share UI | PASS locally | GET401 → HEAD401 → exactly one POST200 → GET200;65905B/hash, actual Android share sheet; negative/race tests |
| Same-session B revokes A and ephemeral private cache clears | PASS locally | Actual B `Shared B` profile, root cache absent, old A HEAD403/providerDelta0 |
| Fresh mobile/root gates, review and exact cleanup | PASS locally | Mobile TS54/377; root106/1067/build; normal Android/iOS JS exports, self-review/diff/links/cleanup |
| Connected audio, HTTP overlap, native iOS, hosted/device/release | NOT RUN | Other retained 090 gates |

### WebView local acceptance — 1 October 2026

Source/tests `d8139bc`. This is a partial checkpoint, **not closure of 090**, all
WebView media, assignment-version Drive-exit, beta, hosted R2 or physical-device proof.
The actual permanent korist-detail page/HomeworkCard supplies a synthetic legacy
submission URL pointing to the repertoire PDF; no fake repertoire WebView route.
Production-built Next15.5.25 serves127.0.0.1:31090. Disposable PG17/Auth/PostgREST
on54491/54492, actual Deno repertoire-file on8000 and AWS4-checked loopback object
service/declared observation relay on18092. Original068 source was queried read-only;
schema-only copy and complete ordered local migration chain restored into the owned
empty target. Unlike the earlier prerequisite attempt, restore/migrations passed
first time this run. No hosted Auth, provider, DB or schema action.

Baseline offline arm64 Android Release build PASS in1m17s; APK SHA-256
`58b36ab3d7c2d7f2c148d340fce6f2f8cfd7e655c3f5b3c1e2d4c9da3ea833f7`.
Existing API36 AVD/emulator5580 boot-completed before install. Native one-use runtime
login POST200 then410, real challenged bridge/verified lease, real homework link and
native `Dosyayı aç` confirmation. At11:28:36–11:28:43 local the actual downloader's
valid-v1 GET returned401/providerDelta0. Baseline had no fresh ticket, PDF hash or
share sheet: reproduced product gap, not merely a mocked rejection.

Minimal repair: ProtectedFileCapability supports one optional download-failure
recovery; the default NativeWebViewScreen wires the native helper with current
actionsRef lease and configured Supabase issuer, not the bridge-selected origin.
All five exact private-reader paths/UUID/exact fileId+ticket query are accepted;
unknown/foreign/credential-bearing URLs are refused before any probe or native-token
use. HEAD is token-free; confirmed403 (also other non200/401 statuses) is final.
HEAD401, HEAD200 with opaque body failure, or a transport failure permits one
authority POST using a forced-fresh native lease, then at most one replacement
download. No re-ticket loop, content/size validation failure recovery or late work
after abort. Abort is checked after lease/issuance and before replacement download;
sharing and temporary-file removal retain their original lifetime boundaries.
The acceptance adapter uses the **same helper** with explicitly guarded local relay
issuer, real files and real sharing; it is not a replacement recovery implementation.

Repaired offline build PASS in19s, APK SHA-256
`4ee644b8055c6f545e69c4fd6a333d8ccf61490b0e6374ac04d9161a6a61d798`.
Installed with `-r`, preserving the same SecureStore/Auth session and one-use channel.
At11:34:23–11:34:58 native trace and actual server observer prove precisely
GET401/provider0 → HEAD401/provider0 → POST200/provider0 → GET200/provider1;
65905B with SHA-256 `39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`.
Actual Android share sheet visually inspected, displaying the PDF and system share
targets. Dismissed with Back; shareAsync returned. No external target was selected,
file sent or external PDF viewer rendering claimed. At11:35 native B selection
cleared the private-cache directory; actual `/profil` rendered `Shared B` and a new
challenge/lease/web proof. Previously issued A v2 HEAD403/providerDelta0 observed by
the actual Deno authority, not a local-only fake. Fixture SIGTERM teardown exited0:
exact one renewal/body, denied reads never touch provider, foreign-user/new A ticket
refusal, a separate Auth session staying A, inactive membership refusing issued/new
URLs. No synthetic-password file was produced in this mode or placed in public env.

Focused preparation uncovered one overly broad metadata query check; exact keys/path
added, config/plugin2 suites25 cases and root policy23 cases then PASS. Initial mobile
test typecheck found strict optional-call indexing; corrected. A pre-existing late
download test then cleared before its download started because the new pre-download
abort check refuses that work earlier. Reassessed causally, added an explicit started
barrier, retained late-file removal assertions, and added separate during-renewal
clear coverage. No blind runtime/build retry or removed acceptance. Final regressions
cover five readers, foreign/malformed/duplicate URLs, confirmed denials, POST403,
explicit loopback gating, redirect-error options, second-download bound, content
refusal and clear during lease/renewal. Installed Expo's default global fetch uses
its native redirect policy (`NativeRequest.followRedirects(false)`/error handling);
no RN-fetch override was used. Redirect refusal was unit/source-reviewed, not an
actual injected native redirect run or native iOS acceptance.

Fresh mobile typecheck/full Jest:54 suites/377 cases, exit0. Fresh root `pnpm check`:
ESLint/TS/106 files1067 tests/SW syntax/Next production build exit0; Supabase explicitly
local/synthetic, VAPID blank, acceptance flags off. Final normal Expo native-only
exports with dotenv/acceptance flags off and synthetic public config: Android1436,
iOS1440 modules, exit0. JS exports are **not native iOS** or production-native-network
acceptance. No native debug exposure, dependencies, permissions/schema or route
ownership changed. Self-review only; not independent review. Diff/local links PASS.

Follow-up retained: `lib/korist-performance.ts` omits current_file_version_id in its
submission selection and the korist-detail HomeworkCard prefers legacy links. This
checkpoint accepts the existing file-capability path, **not** assignment-file version
integration/complete Drive-exit. Fix that in a bounded product-read integration,
without rewriting permanent WebView routes or pretending native repertoire is web.
Next ready 090 local outcome: overlapping HTTP request / authority-COMMIT evidence;
connected audio Auth/R2 and integrated native-iOS remain separately required.

Cleanup after dependent gates: fixture/Deno/object service, Next process, SSH tunnel,
owned Supabase stack/volume and genova090 VM/data removed. No Colima instances, Docker
context default, no task-port listeners or adb device. APK uninstalled, dump and
reverse54491/18092/31090 removed, emulator stopped. Generated android774708 KiB,
.expo4 KiB, .next552732 KiB, coverage352 KiB, runtime9628 KiB (APK-related logs,
schema-only dump, screenshot, normal exports) and empty093 hold directory deleted.
Validated exact non-symlink ignored output targets; broad shell force-removal was
rejected, then guarded filesystem removal completed. Derived outputs/synthetic
runtime data are not retained/recoverable; tracked sources reproduce them. Original
068 five counts remain28/1/29/9/79; existing AVD3466056 KiB, Gradle5531968 KiB,
mobile dependencies6409160/root1621064 KiB, private evidence and CLI marker preserved.
Lowest observed free17577012 KiB, final23776212 KiB; both above10,485,760 KiB floor.
No push/deploy/CI/real users/data/email/credential change, spending/hardware/distribution.

## 1 October HTTP/COMMIT local checkpoint

Owner says continue and report costs after WF-015. Entry main/a3c7273; unrelated
cli-latest dirty. Read skill/AGENTS, handoff/active,090, relevant migration/decision32,
guide/work cycle and execution controls; inspected existing PG17/handler/SQL fixtures.
One outcome: actual repertoire GET/HEAD/Range refusal after an overlapping committed
choir switch, role removal, membership deactivation or Auth-session deletion, while
already-streaming bytes retain the documented boundary. No production code change.

Three actions: schema-only disposable native PG17 fixture and actual-handler HTTP
barriers; run/assert serial and overlapping observations plus five-family SQL matrix;
run one redacted Jev claim-evidence advisory and record cost/source/cleanup.
Allowed: narrow supabase/test-support/090_http_overlap*.{sh,ts}, this brief, small
docs/reports/090 evidence, spike/typesafe/jev-090-evidence.mjs and handoff/active/progress.
No product/client/schema source edits without a reproduced scoped defect; no deployment.

Resource preflight free23,809,132KiB; native PostgreSQL17 already running. Additional
peak <200MiB for schema-only20MiB DB, tiny logs/source/Deno cache checks; no Docker,
VM, package installation or client build. Existing Deno modules cached. Exact owned
DB genova_090_http_overlap_test; scratch spike/090-runtime/http-overlap; HTTP18190/
provider18191 loopback only. Refuse existing DB/foreign listeners; remove owned DB/
scratch after dependent checks. Preserve original068 row hashes/counts and caches.

Boundary: use the actual repertoire handler/ticket/R2 helper and SQL090 authority
under service_role via a DECLARED native-psql transport adapter, not Auth/PostgREST
or the deployed entrypoint. Synthetic actor/session rows and direct signed-v2 fixture
issuance; POST login/issuance is not retested. Signed loopback object transport, not
hosted R2. This proves only repertoire HTTP/COMMIT; other-family HTTP overlap remains
NOT RUN even if the five-family SQL matrix passes. Do not relabel this as connected
Auth/RLS/native/provider acceptance or all of090. No new native/client acceptance needed.

Required: runner fail-closed targets, Deno check; fresh five-family SQL; actual
repertoire full/Range/HEAD within uncommitted revocation and denied after COMMIT;
request held before SQL sees committed denial/provider0; observed streaming read
survives COMMIT while new requests fail; source preservation/owned cleanup, diff/links.
One Jev call max24KB/16questions/45s, pinned model, no retry and <$0.002 advisory cap;
existing key authorized today only, memory-only. Report returned tokens and current
documented$0.042/M input estimate, today's earlier$0.001763664 separately. Local
existing-tool test creates no external provider charge; Codex per-turn price unknown.

### HTTP/COMMIT acceptance — 1 October 2026

Source/test `d448de5`, Jev tooling `062c034`.
[Report](../reports/2026-10-01-repertoire-http-overlap.md) owns exact boundaries,
costs, failures and next action; [raw trace](../reports/090/2026-10-01-http-overlap.json)
was frozen before inference. Final run11:04UTC /14:04Istanbul.

| Criterion | Required | Result | Evidence |
| --- | --- | --- | --- |
| Fail-closed targets and source checks | Yes | PASS | Existing scratch/DB and occupied-port probes refused without removing foreign targets; shell syntax/Deno check pass |
| Fresh five-family SQL090 matrix | Yes | PASS | Disposable schema-only nativePG17, actual SQL, rollback |
| Actual repertoire GET/Range/HEAD across four mutations | Yes | PASS | Uncommitted200/206/200; acknowledged COMMIT gives403/provider0 |
| HTTP before COMMIT, SQL afterward | Yes | PASS | Explicit barrier; real authority denies all four cases/provider0 |
| Already-streaming boundary | Yes | PASS | First32B before COMMIT, original65905B/hash completes; freshGET/Range/HEAD403/provider0 |
| Original preservation and owned cleanup | Yes | PASS | Original five-table row hashes/counts28/1/29/9/79 unchanged; disposable DB/scratch/services removed |
| Bounded Jev/cost record | Yes | PASS advisory only | One call4952 input/388 output,$0.000207984 estimate; nine labels agree, not independent acceptance |
| Docs/links/diff | Yes | PASS | Local links/git diff --check |
| Other four-family overlap; fresh Auth/PostgREST/entrypoint/native/hosted | Separate gates | NOT RUN | Not inferred from this adapter or historical serial checks |

Four cases,180 ordered trace events,16 signature-verified provider hits,zero failures.
No production/client/schema/dependency changes. Focused checks do not refresh root/
mobile full-gate evidence or establish load capacity. Whole090 remains IN PROGRESS.
Initial inherited-tsconfig/strict-type check failures and pre-HTTP emptyPGSERVICE
runtime failure were reproduced/corrected; final run after ownership/guard review PASS.
See report for details; no failed runtime relabeled HTTP PASS.

Final free23,695,880KiB, above10,485,760KiB floor; preflight23,809,132KiB.
<200MiB was allocation forecast, not measured continuous peak. Only owned disposable
outputs removed, reproducible from sources; original068/caches/unrelated CLI preserved.
No push/deploy/CI/hosted/real-user/email/hardware operation. Next bounded outcome:
remaining four private-file readers' actual HTTP/COMMIT matrix. Connected audio,
native iOS, assignment-version Drive-exit and hosted rollout remain separate gates.
