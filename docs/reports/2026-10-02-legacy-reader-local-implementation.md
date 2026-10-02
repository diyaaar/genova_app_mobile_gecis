# 090 — approved local legacy-reader implementation checkpoint

2 October 2026. Source **fe8cd19**, sole writer; parent c2022f7. Owner explicitly approved
the [bounded local package](2026-10-02-legacy-reader-compatibility-local-plan.md). No push,
hosted SQL/Edge/web deploy, real-user operation, provider ACL change or sibling-site edit.
**Local source/security checkpoint PASS. Whole090/R1 OPEN; publication NO-GO.**

## Implemented contract and architecture

Old `{driveFileId,fileName,mimeType}` POST and relative `/api/drive-file/...?...` response
remain compatible. Existing Next routes now only adapt to a fixed Supabase Edge origin;
they do not sign old tokens, query privileged tables or fetch Drive/Storage themselves.
POST forwards the bearer to `legacy-file`; Auth.getUser verifies it before session extraction.
GET/HEAD accept only independently legacy-family-bound v2 tickets. Actorless, malformed,
expired, wrong-family or tampered tokens fail before provider access. No v1 grace period.

The service-only `resolve_legacy_file_090` RPC uses one SQL snapshot for the real Auth session,
session expiry, current selected choir, active member, current role/voice scope, stable resource
identity, current alias and trusted file metadata. Its private definer has empty search_path,
explicit tenant joins and service-only execute; the public wrapper is an invoker, not a public
definer. Explicit verified actor/session arguments replace auth.uid in this privileged Edge
path; anon/authenticated must not be allowed to call either helper with arbitrary identities.
No user_metadata authorization, new tables, upload changes or R2 activation.

Non-versioned repertoire, submission, public/private review and comment files remain supported.
A review's identical public/private mirror counts as one public resource. When hidden, old
public tickets deny; reviewers may mint private-review tickets but owners cannot. Ambiguous
aliases fail closed. Storage submissions require their actual assignment/member path prefix;
the existing encoded fixed-origin Storage helper refuses unsafe paths. Caller names/MIME/paths
are not authority. Source metadata digest changes refuse already-issued URLs.

Client cache identity is memory-only bearer/user identity; tenant lifecycle still clears caches
on choir changes, and SQL independently checks each read. Generation and lookup-order guards
invalidate in-flight old-session results, including an older session lookup finishing last.
Legacy POST403 retains a typed denial. Existing bounded401 recovery/403-stop and no-raw-audio
fallback are preserved; selected online audio tracks now take the same fresh HEAD decision.
Already-downloaded/offline bytes and authorized in-flight reads are not retroactively revoked.
Signed URLs remain bearer capabilities; do not log or distribute them as non-sensitive links.

## Evidence table

| Criterion | Required layer | Result | Evidence and boundary |
|---|---|---|---|
| Old actual actorless token GET/HEAD denied, provider0 | Local source composition | PASS | Actual old signer + Next adapter + new Edge handler; synthetic dependencies |
| Five legacy kinds, Drive and Storage, old POST/relative URL, MIME/Range/HEAD | Local HTTP + index/SDK + SQL | PASS | [HTTP record](090/2026-10-02-legacy-http-compatibility.json): fivePOST200, GET206, HEAD200; 25authority calls, ten provider-fixture reads |
| Next GET/HEAD after committed inactive membership | Local HTTP + actual service RPC | PASS | Ten403 responses, extra provider attempts0; real loopback HTTP, synthetic Auth/RPC transport/providers |
| A/B same-user sessions, same alias in two choirs, resource mismatch | Actual offline service SQL | PASS | rollback-only `090_legacy_file_authority.sql`; real service_role invocations |
| Inactive/role/voice/session expiry/deletion/selection change | Actual offline service SQL | PASS | 32role/22membership/sixextension parity repaired before the fresh matrix |
| Hidden/private review, stale hidden public metadata, hidden comments, replaced/deleted/ambiguous alias | Actual offline service SQL | PASS | Explicit positive and negative fixture controls; no invented immutable versions |
| anon/auth RPC execution refusal | Actual offline invocation | PASS | Both callers execute the real wrapper and receive insufficient_privilege |
| Mutation sensitivity | Actual offline SQL | PASS | Six deliberately unsafe permission/predicate mutants fail; transactional rollback and clean fixture rerun |
| Error/changed metadata/in-flight request boundary | Focused handler tests | PASS | Denial/error provider0; allowed in-flight read finishes but next request refuses |
| Cache401 renewal/403-stop and same-user async races | Actual source unit composition | PASS | Focused five files/63tests after final race fix; Next/Edge/client composition included |
| Selected/unselected audio has no raw or stale online fallback | AST-selected actual callback | PASS | Four standalone tests; not React rendering/playback |
| Exact old cached bundle already open in browser/WebView | Complete client runtime | NOT RUN | Historical source tests still reproduce automatic401/cache/raw-fallback failures; no claim old tabs adopt new code |
| Full refreshed browser/PDF/audio and complete production-baseline release closure | Client/release | NOT RUN | This checkpoint is not a wholesale release of current main |
| Current source regression | Root lint/types/coverage/SW/build | PASS | Final pnpm check19:20:113files/1167tests; coverage90.82stmts/85.71branches/98.19functions/96.72lines |
| Deno imports/types and standalone probes | Targeted source | PASS | cached-only Deno check for index/HTTP harness; Node9/9 (four new, five historical reproduction controls) |
| Hosted Auth/PostgREST/DB/Edge, real Drive/Storage, device/CI | Live/platform | NOT RUN | No new authority or inference from local success |

Coverage percentages refer only to the existing configured coverage include list, not every
new Edge/adapter module. Those modules have explicit behavioral tests; the percentage is not
an isolation score. Self-review is primary-engineer review, not independent review.

## Recovery, failures and resources

Retained R1 dump SHA256 `9b73831cda2809273e3f671031b35ab990707c3613f2c3ffb30ddba143f15cd2`
was restored again into the pinned offline official PG17.6 image:23schemas/101table counts.
32roles/22memberships/sixversions/owners matched. Original068 and the protected baseline remain
unchanged; synthetic tests write only to the separate test clone. Backup coverage/exclusions
remain exactly [R1's declared coverage](2026-10-02-hosted-revocation-r1-recovery-rehearsal.md),
not a new full provider/config recovery claim. Private parity/matrix/mutation records remain
outside Git in the protected R1 directory; only small redacted results enter these records.

First new SQL fixture failed because PostgreSQL does not accept regex repetition256; moved
the bound into length<=256, then actual callers passed. First HTTP checks passed but cleanup
failed on RESTRICT tenant FKs: preserve [the non-accepted initial record](090/2026-10-02-legacy-http-initial-cleanup-failure.json).
After a second cleanup attempt failed, inspected full FK dependencies and task-row counts;
repertoire triggers also created two cache-version rows. Corrected dependency-order cleanup,
then reran the full five-kind/Storage HTTP matrix. Final cleanup PASS; synthetic users/choirs0.
An initial root typecheck exposed a Deno/Next test-boundary mistake; moved cross-runtime test
under the existing excluded Edge test boundary, rather than relaxing root compiler settings.
Final primary review found the stale-session-lookup race; added a regression and reran full gates.

Resource entry20,996,440KiB; pinned VM2CPU/2GiBRAM/8GiBvirtual, measured peak ~6.27GiB
allocated VM plus1.40GiB task image cache. Floor remained above10GiB; lowest observed14,119,024KiB.
VM/container removed19:17 after last SQL/HTTP check; no loopback listeners remain. Post-removal
19,571,540KiB available. Build outputs and newly created exact image-cache path expire after
evidence validation. Final exact .next/coverage/new task image-cache copy removed;
matching pinned image remains in the earlier recoverable task Trash copy. Final measured
free space21,033,852KiB; do not equate a prior Trash move with freed disk. Protected dump/source/
lockfiles/dependencies/unrelated global caches retained; generated outputs can be rebuilt.

## Review and next ordered actions

[Local source manifest](090/2026-10-02-legacy-local-source-manifest.json) pins fe8cd19's eight-module
legacy Edge closure, config, ordered078→090→legacy SQL, adapters/client sources and dedicated
test sources. It is NOT the complete six-reader/client production release manifest. Existing
five-reader bdf34b8 manifest and historical production a13f696 evidence are not rewritten.
Primary review checked method auth, family-bound tickets, exact resource/tenant joins, current
selection/session predicates, service-only grants, safe provider/error boundaries and cache races.
Supabase/Postgres skills drove session/privilege/current-doc checks; TypeSafe's rule is followed:
deterministic access control stays in code/SQL, not probabilistic inference. No new Jev call:
incremental Jev inference estimate **$0**; historical R1 two calls$0.000097902 is not today's
invoice or total coding/provider cost. Codex cost unavailable here.

1. Build a narrowly scoped production-baseline web-client release candidate and exercise the
   supported refreshed client plus an already-open old cached tab/WebView/PDF/audio. Required
   NOT RUN rows prevent R1 closure. Unsupported old bundles require explicit refresh/update,
   not a server access grace period; no silent maintenance/deploy authority.
2. Complete six-reader/config/SQL/client dependency manifest and independent acceptance;
   refresh exact hosted state/recovery cutoff and forward-repair/transition plan. Preserve DB→
   Edge→compatible-client order, with no uniform online guarantee during partial deployment.
3. Request exact live authority only after local gates are accepted, then controlled synthetic
   hosted Auth/PostgREST/HTTP/provider acceptance. Do not bulk-push main or revive actorless URLs.

Remaining risk: legacy Drive/Storage reads buffer provider bytes for Range and can be expensive
for large files/HEAD; real-provider latency/large-file budgets are unmeasured. Review before
publication, do not claim production scalability from tiny fixtures. External public Drive ACLs
are separate from application refusal. No source ACL withdrawal happened in this checkpoint.

Final record verification:211 local file links/21 source SHA256 pins/30-file sensitive-format
scan and git diff --check PASS. Protected backup hash/0700 directory/all files0600 rechecked;
original genova_068_test_restore still exists. Handoff66lines/active60lines. Documentation
commit is separate from sourcefe8cd19; only the unrelated CLI marker is excluded/preserved.
