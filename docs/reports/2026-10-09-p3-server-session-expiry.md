# P3 retained-session expiry — local server checkpoint

Date:9October2026, Europe/Istanbul. Entry main/02a03d8, primary sole writer.
Code **bbc301c62ffb58a533b19d7cf904518be274aae7**. Local checkpoint PASS after
final source/record/cleanup commit; whole090/P3 remains OPEN/NO-GO.
[Work card](../briefs/090-private-file-ticket-revocation-contract.md#9-october-retained-session-expiry--guarded-forward-server-delta)
→ [full contract](2026-10-04-p3-convergence-contract-audit.md)
→ [client checkpoint](2026-10-09-p3-client-source-convergence.md)
→ [delivery checkpoint](../teslim-rehberi/checkpoint.md).

## Fix and exact ordering

CLI2.107.0 generated, not manually invented:
[20261009190611_private_file_session_expiry_090.sql](../../supabase/migrations/20261009190611_private_file_session_expiry_090.sql).
FinalSHA256 **c191738462dc500e0be524155fb6e5ca3002e7445ba6a70d77f451d7a52bc36c**.
It replaces the private090authority body with exactly one additional predicate:
null not_after or not_after strictly after statement_timestamp. All five family
branches/signature/public RPC names/owner/ACL/stable/search_path remain unchanged.
The request-time choice follows [PG17date/time semantics](https://www.postgresql.org/docs/17/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT),
not transaction-start now(); [Supabase session guidance](https://supabase.com/docs/guides/auth/sessions)
also distinguishes retained session rows from session lifetime. No provider setting
or SDK upgrade was inferred from the current changelog/security review.
No table/data/provider/client mutation or activation. Two-second lock/five-second
statement deadlines bound this exact migration. No unsafe automatic down is added.

The preflight refuses missing prior090/Authnot_after, unexpected exact private or
public body fingerprint, owner/config/volatility, public client execution or extra
grantee/grant-option/grantor. Ownerpostgres/service_role EXECUTE only remains.
Existing30September090SQL and P1/P2 are immutable. A new forward delta is required
because historical local consumers already ran the old source, even though current
hosted090actor is absent. Do NOT edit that historical migration to invent provenance.
Run the exact prerequisite order078→090actor, retained legacy090 and this explicit
new delta before newly promoted v2 readers/client activation. Earlier ten missing
deltas still need reviewed recovered-state rehearsal; this is not a directory-glob
or bulk-apply instruction. Rollback of an unapplied file is code revert; after a
future deployment use separately reviewed forward repair, not insecure baseline.

## Current consumer/recovery provenance

Actual correct-project named read-only MCP probe9Oct19:08:24.864UTC (22:08Turkey):
databasepostgres/read-only user/transaction_read_onlyon/PG17.6;83public/genova
function records. Actor public RPC/private helper and legacy090RPC absent.
Raw definitions and existing local credential were not printed/persisted/exported.
This confirms missing current authority, not a checksum match for unavailable
historical bodies or a newly applied schema. No hosted write occurred.

[Actual9October selected faithful recovery](2026-10-09-p3-full-recovery-and-inventory-audit.md)
remains dated provenance:03:11:01Turkey held source/all101full fingerprints2880rows/
all17catalog groups, strict comparator/full pinned image, no normalized-away ACL.
Its owned full runtime was removed; it was NOT restored again or used for this
synthetic test. The protected source/key were not read/exported by this checkpoint.
This local relational model deliberately does not substitute for that full state.

## Actual tests and limits

Installed nativePG17.11, fresh owned cluster/TCPoff/private0700Unixsocket; synthetic
Auth/relational schema, actual003tenant-link/060media-read+avatar-guard/090functions.
The fake auth.uid returnsnull only as a declared test seam. No Supabase Auth server,
PostgREST, complete RLS/schema/default grants/immutable-write provider rules are
claimed. Public read RPC is invoked as real service_role; anon/authenticated calls
are actually rejected, not inferred solely from ACL strings. Owner is postgres.
Six preflight mutation negatives execute the actual guard and roll back their own
changes; a guard PASS cannot be caused by an unrelated permission failure.

HTTP uses actual four family indices via strict SQL transport and actual repertoire
handler/R2 adapter via declared dependencies. Tickets use actual v2 HMAC, GET/HEAD
cross real loopback HTTP, object responses require complete AWS4 signature matching.
All source handlers remain unmodified. Objects are synthetic bytes; repertoire
47byte PDF-marker transport fixture is NOT PDF-renderer/real-document proof.
Metadata read grants are only the named version/location tables, not blanket grants.
Auth/POST issuance, managed RLS and PostgREST HTTP are excluded and fail closed;
the other four-family connected Auth helper was extended but NOT run on a managed
stack in this checkpoint. That new test remains a part3 execution requirement.

| Criterion | Required here? | Result | Actual evidence / boundary |
|---|---|---|---|
| Baseline expired retained row reproduces failure | yes | PASS | Actual old090SQL allows all5withnot_afterpast; no changed authority mock |
| Expanded existing SQL suite/service+anon/auth execution | yes | PASS | Actual090test including20null/future/equality/past family controls; existing wrong actor/session/choir/visibility/role/room/inactive/deleted/tenant-link checks retained |
| Definer owner/exactACL/stable/emptysearch_path unchanged | yes | PASS | Before/after actual pg_proc metadata equal; private definer/public invoker; onlypostgres+serviceexecute |
| Forward guard rejects changed wrapper/owner/search_path/volatility/PUBLIC/extra grantee | yes | PASS |6real mutation cases, exactguard execution/expected error/ROLLBACK; metadata checked after each |
| Valid ticket/retained expired row: five-family GET+HEAD403/provider0 | yes | PASS | [Current v3proof](090/2026-10-09-p3-session-expiry-v3.json),85reads/17perfamily; expiry denials use the still-valid original ticket |
| Null/future GET/HEAD/Range/checksum controls, ticketexpiry distinct401 | yes | PASS |40signed object hits,45total401/403denials/provider0, provider validation failures0; header-policy regression not separately claimed |
| Concurrent peer uncommitted/COMMIT/held-next-request + long transaction | yes | PASS | Two actual connections/ack barriers/no sleeps; own transaction start before expiry, next statement after expiry denies all5 |
| Legacy control preserved | yes | PASS | Unchanged actual legacy090SQL test ran before and after repair; historical SHA retained |
| Deno/source lint/type/diff and exact child pins | yes | PASS | Deno2.9.6 cached-only check, Node connected-helper syntax, rootpnpmtypecheck, focusedESLint; no dependency/config changes |
| Owned cleanup / source+evidence commits | yes | PASS at exit |43,216KiBpeak, limit262,144KiB; each owned cluster stopped/removed, HTTPports closed; codebbc301c and separate records commit |
| Full managed Auth/RLS/connected helper/recovered-state mixed clients/cache, platforms/review | part3/fullP3 | NOT RUN | No hosted/native/device/real-provider/CI/store acceptance |

Final actual current run9Oct19:19:38.408UTC=22:19:38Turkey. Command:
`node supabase/test-support/090_session_expiry_runner.mjs --run-owned` plus
`deno check --no-config --cached-only --node-modules-dir=none --no-lock supabase/test-support/090_http_session_expiry.ts`.
Focus lint names the runner/currentHTTP/connected helper with warnings0;
`pnpm typecheck` passes. Fullpnpmcheck/build/mobile gates were NOT rerun: SQL and
backend-test-only change, current web/native/shared product code untouched. The
new Deno entry uses the existing090_http_*.ts boundary; no tsconfig relaxation.
Full managed DB advisors on the resulting exact rehearsal state remain a part3
gate; hosted advisors cannot validate this unapplied delta. No such PASS is claimed.

## Revision history, immutable child and cleanup

[v1actualproof](090/2026-10-09-p3-session-expiry.json) at19:13UTC proves initial
expiry predicate/85reads, earlier source/hash. Self-review then strengthens public
wrapper body/exactgrants and labels every family/scenario; [v2](090/2026-10-09-p3-session-expiry-v2.json)
19:17UTC includes6guards. Finally the new Deno entry was named within the existing
build exclusion boundary; v3 is the authoritative current source-pinned receipt.
No failed runtime approach was repeated; these are changed-source acceptance runs,
not an unchanged environment loop. Prior receipts are historical observations,
not re-pinned current-source proofs. Their earlier paths/hashes are not current.

[614pin child](090/2026-10-09-p3-server-convergence-source.json) pins codebbc301c,
all613client parents unchanged plus exactly this SQL;9auxiliary test/SQLsource pins,
no new public RPC or changed20Edge/46pageAPI/native/shared annotation. Actual body
comparison verifies only the expiry predicate changed. Immutable three parent
acceptance records rehashed unchanged. New current source uses no historical
profile/backport overlays; parent/P1/P2 records were not edited or promoted.

Owner explicitly approved a new256MiBSQL/HTTP disk exception after actual initial
free9,628,636KiB (<default10GiB). No image/install/download/VM/native/root build.
Each test used only43,216KiBownedPGpeak; a live8GiB stop and256MiB cap were checked.
Final v3initialfree9,393,364KiB/final9,391,816KiB are the actual machine fields;
use the JSON as authority, not an estimated disk delta. Other apps
also consume disk. No global caches/dependencies/user files/AVDs/simulators/backup
key or other PG target was deleted. Empty spike090runtime/HTTP18190+18191notlistening.
The root typecheck's304KiBowned tsbuildinfo is removed after its last check.
Jev0calls/$0new; no inferred later-day key/spend authority, no private AI export.

## Next bounded outcome

Local client and server source convergence are now prepared, not fullP3 acceptance.
1. Prepare the exact614pin current package/ordered reviewed SQL and managed
   restored-state Auth/PostgREST/RLS/mixed old-current web/mobile/cache rehearsal;
   re-pin historical old-web backport assumptions rather than silently rebuilding.
2. Measure resources and run agent-owned current Android/iOS acceptance; no owner
   manual QA. This256MiBexception does not authorize multiGiBnative/fullVMbuilds.
3. Independent actual package review/rollout+repair exercise/exact operation approval
   → P4private storage → signed installed Android beta → full product → both stores.

Self-review only. No hosted SQL/Edge/web/push/provider activation/distribution,
website edit or real-user operation occurred. New server fix is NOT LIVE.

## Final record exit

614pin/9auxiliary child byte replay PASS; current v3seven pins rehashed unchanged,
three immutable parent acceptance records unchanged.6owned Markdown/current090card:
118local links/0missing;11owned records/helper files0key/JWT/private-key pattern
matches. Source helper syntax/scoped diff PASS, product sources committed separately
atbbc301c. Owned304KiBroot tsbuildinfo removed; spike090runtime empty and both HTTP
ports closed; thenfree9,578,096KiB. CLI marker is unrelated/preserved/excluded.
Evidence commit follows these actual checks; no independent review/P3release PASS.
