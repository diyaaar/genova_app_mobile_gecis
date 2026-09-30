# 090 — private-file ticket revocation contract before Android beta

Status: IN PROGRESS / online revocation policy selected 30 September 2026;
legacy-ticket transition and implementation checkpoint await owner approval. Primary agent,
single writer.
One result: define an honest, uniform online access-after-revocation contract for five private
file families before `mixed`/`r2-required` cutover. This brief does not authorize live writes.

## Work card / transition start check

The owner's “devam” resumes the Android-first Drive-exit queue after local 089. Read AGENTS,
handoff/active, WF-009/WF-013, current delivery controls, migration guide, MIGRATION, decisions
#28–31, 015/021/053, 065/076 and the R2 runbook. Verified `main/62254f2`; only unrelated
`supabase/.temp/cli-latest` dirty. Profile/repertoire remains the existing native/web shared
file service; no new Next API or client-facing ticket response is proposed. The local source is
authoritative over older acceptance prose.

The inventory and owner policy choice are complete. Current work card: (1) record the selected
contract and exact legacy-ticket transition proposal; (2) obtain approval of the bounded
implementation/release-compatibility checkpoint; (3) only then amend the brief with exact
paths/resources and implement a coherent local backend/client acceptance slice. This
document-only update uses <100 KiB, no build/download/VM; 30 September free space
23,248,364 KiB (>10 GiB). Preserve original restore, private copy evidence, global caches
and all already-approved source bytes.

Allowed for this preparation: this brief, the narrow runbook claim correction,
`KARARLAR.md` decision #32, the delivery-plan pointer and handoff/active/progress indexes.
Product/server/schema tests require an implementation amendment with exact paths,
resource estimate, real PG/Auth/HTTP and web/mobile compatibility gates. Existing local code/
tests/commits are historical and not fresh 090 acceptance. No subagent; no shared-tree writer.

## Verified current behavior and decision

| Family | Issued ticket | GET/HEAD at current source | Online switch/revocation guarantee |
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
shape. The exact version-transition and compatibility plan below is a proposal, not yet
implementation approval. The decision does not itself add a logout-revocation guarantee.

If owner selects immediate next-request refusal, candidate implementation is actor- and
session-bound tickets plus an atomic server-owned access check for file, choir, active membership,
session selection and family-specific visibility on each GET/HEAD. Do not substitute separate
admin queries or claim a client cache clear is server revocation. Preserve POST's real Auth/RLS,
200/206/416, MIME, no-store, Range/seek, legacy/mixed/R2-required behavior. Later local tests
must include A/B multi-membership, revoke/switch, stale v1 tickets, roles, expiry/tampering,
R2/legacy source refusal and concurrent decisions. A session selection check alone is not Auth
logout revocation; define/test that boundary explicitly. All hosted schema/Edge/flag/Drive ACL,
provider copy, push/deploy and actual Android/iOS device checks remain separately gated.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Five-family current ticket/read authority inventory and historical contract reconciled | Yes | PASS | 29 September source inspection above; no network/runtime mutation |
| Runbook avoids a blanket false actor-bound claim | Yes | PASS | 29 September narrow correction; five family differences and 090 link; link/diff gate below |
| Read-only policy/client/rollout feasibility without weakening family access | Yes for preparation | PASS | 29 September retained local PG policy query plus SQL 057–060 and actual web/native consumer source; no current hosted/runtime proof |
| Owner selects online next-request revocation expectation | Yes for product contract | PASS | 30 September explicit answer: “Evet, sonraki istekte reddet (önerilen)”; no code or hosted change inferred |
| Decision #32 and 090 cross-links/consistency | Yes for this record | PASS | 30 September local link scan, `git diff --check` and scoped self-review; no source or runtime gate claimed |
| Legacy v1 denial and compatibility/release checkpoint approved | Yes before implementation | NOT RUN | Proposed below; owner has not yet accepted the one-time 401 and release order |
| Product/DB/Edge implementation and real synthetic two-choir acceptance | Yes after contract selection | NOT RUN | Exact amendment, version/release order, local tests required |
| Hosted cutover/public Drive withdrawal/offline deletion/device/beta | Later separate authority | NOT RUN | This preparation cannot accept these layers |

Required NOT RUN keeps 090 open. This decision record may be committed as a partial checkpoint;
do not mark the product contract complete, hide the risk or weaken required tests. Self-review is
not independent review. Rollback of preparation is a doc revert; schema/data/provider rollback
requires separate evidence and authority.

Preparation self-review at its original checkpoint: old URL persistence was a source-level
inference. [091](091-connected-private-r2-read.md) subsequently confirmed with actual local
Auth/RLS/PG17 and signed loopback S3 that a previously issued A URL still returns HEAD 200
after the same Auth session selects B. That is **switch** evidence, not a membership-removal
GET/HEAD test, hosted R2 proof, or a new revocation contract. After the owner's choice, next
required step remains the explicit legacy-transition checkpoint below, then a bounded
implementation amendment and red/green local runtime proof,
not hosted activation. [092](092-stale-private-file-ticket-cache.md) only prevents late web/
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

## 30 September implementation checkpoint proposed for owner approval — no code yet

**Recommended transition:** when the new readers become active, reject all five legacy v1
ticket formats on GET/HEAD. The two actorless families cannot be safely re-authorized from
their v1 payload; the other three lack selected-session identity. A one-hour v1 grace
(one minute for chat media) would contradict the selected next-request guarantee. An
in-flight v1 URL can therefore receive a one-time 401. Before strict readers go live,
web and native clients must demonstrate stale-URL discard, fresh-ticket request and one
bounded retry; if access is now revoked, show denial rather than loop. Older installed
clients without this recovery may need the user to reopen the file or update the app.

**Smallest coherent local implementation sequence, after this checkpoint is approved:**

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
Android. No heavy test or source change runs in this document-only checkpoint.

**Release gate, not authorized here:** current hosted backup and proven isolated
restore, sibling-site impact, additive DB decision → compatible web/mobile clients →
Edge issuers/readers with v1 denial → actual hosted refusal/refresh probes → separate
flags/cutover. Rollback must not quietly restore one-hour v1 access; use a fail-closed
reader/service mode or an expressly approved temporary availability trade-off. Git
revert cannot undo DB data. No 077 real copy, hosted schema/Edge, push/deploy, real
users, hardware or provider action is authorized by the policy answer.

### 30 September client compatibility audit — read-only, no implementation

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
