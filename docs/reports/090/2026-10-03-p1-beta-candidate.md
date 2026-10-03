# P1 — One source-frozen Android beta candidate

Date: 3 October 2026. Owner: primary agent, single writer. Owning brief:
[090](../../briefs/090-private-file-ticket-revocation-contract.md). Candidate:
**GENOVA-BETA-20261003-P1**. Source inventory acceptance is separate from runtime,
hosted compatibility, storage activation, installed beta and store acceptance.

## Identity and construction

One intended full-product source: `c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0`,
tree `82daeec7804acc79bef9786ead14d55c18d1dad0`. Entry checkout:
`main/3fb3a2c7698bf80134860ade50f7e5713b5308f7`; all selected product paths are
byte-equivalent to the intended source. No production code/config changed in P1.
Unrelated `supabase/.temp/cli-latest` remains untouched and unstaged.

The [machine manifest](2026-10-03-p1-beta-candidate.json) pins610 files, including
154 mobile +105 lib +82 Edge +59 SQL +29 public assets and exact build/lock inputs.
It records842 literal local import edges,20 Edge entry closures,435 lexical call
candidates,38 declared/literal RPCs, every tracked Next page/API route, external
imports and environment **names only**. No source bodies, keys or choir/user data.
AST calls are an inventory, not a full execution/data-flow or authorization proof.
Nested relation selects, storage buckets and helper-mediated calls require P3 integration.

Reconstruct each pin with `git show c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0:<path>`;
verify SHA256 using the manifest. A later authorized, resource-preflighted clean
checkout can use this exact commit, not moving main. No copy/build was made here.
Re-run `node spike/090-p1-source-inventory.mjs --verify` for deterministic verification;
the helper reads Git objects and reconstructs the426-file fixture **in memory**.
Changed code/config versions this candidate and reopens affected tests.

Target project `hievmwwctjjlhmssoxsu`, web `https://app.genesinovachoir.com`, mobile
ID `com.genesinovachoir.genova`, first controlled Android beta. Fresh read-only
GitHub main on3October: `a13f696da8c731e9af2a2bce473d4f4ae4a81587`.
This is **not served Vercel revision proof**. Actual served web, hosted SQL/Edge
versions/checksums/configuration are NOT VERIFIED; refresh in P3 before writes.
Distribution recipients/channel/account operations are not authorized by this manifest.

## Why this source, not the smaller profile candidate

The shell actually exposes native repertoire/chat, four permanent WebViews, sign-out,
choir switching and notification permission. Freezing only a profile fixture would
omit visible dependencies. Therefore freeze the complete known product source and
prepare **minimal compatible promotion stages in P3**, not a bulk-main push.

The immutable browser repair `1a014c4e1927a03a7c67dd666a91a6006a28b6f8` and embedded
profile repair `7cd8d460c68465055049dbf30192f7f5478bcf64` remain reproducible,
separately bounded intermediate/test sources. They are **not competing beta releases**
and their green profile test does not accept the complete web application.
P3 must prove how intermediate repairs converge to the frozen full source; if changes
are needed, issue a revised manifest rather than silently changing these refs.

## Feature-to-source and dependency reconciliation

All current web source is retained in the candidate, including existing browser
features not yet native. “Included” means source included, **not beta accepted**.
No owner-excluded product feature is invented. The detached sibling website is out
of scope; no retained table or historical chef note is deleted.

| Feature / reachable action | Beta source scope and concrete anchor | Dependencies / remaining gate |
|---|---|---|
| Sign-in, zero/one/multiple memberships, choose/switch choir, cold relaunch, sign-out | Included native: `apps/mobile/src/auth/`, `src/ui/AppRoot.tsx` | SecureStore/Auth, shared `lib/choir-context-core.ts`;003/005/006/012/078, `list_my_choirs`/`set_active_choir`; fresh beta chain P5 |
| Assisted choir opening and invitations | Existing web/operator flow retained: `lib/choir-invitations.ts`, web `/invite`, `/koristler/davetler` |007/008, `create-choir`/`choir-invitations`; no self-service rewrite; withdrawn/wrong-account invitation product negatives P5/010 |
| Native repertoire, tags and member assignments | Included: `src/repertoire/RepertoireScreen.tsx`, `supabase-source.ts` | Tables/relations, cache versions, RLS003/005/078 and053; real hosted mapping/read P4/P5 |
| Native PDF/read-only shared annotations | Included: `default-reader-gateway.ts`, reader/Skia | `repertoire-file`, shared annotation contract024; private file current authority090; latest iOS P2 |
| Native audio + foreground mini-player | Included: `default-audio-source-gateway.ts`, `src/audio/`, AppRoot | Same repertoire reader/Auth/RLS, temporary file lifecycle; hosted same-version playback/reopen P5; background/hardware proof stays open |
| Native chat read/send/retry, copy/edit/delete/hide, personal stars/panel | Included: `src/chat/`, AppRoot;051 locally accepted at `22a19d6` |041–048; `get_chat_rooms_for_member`, `mark_chat_room_read`, `send_chat_text_message`, edit/delete/hide, `chat_starred_messages`; `link-preview`; full hosted read/write isolation P3/P5 |
| Announcements/detail | Included permanent WebView: shell `/announcements`, shared route policy | Current Next routes/API + Auth bridge + existing tables and push sender; actual Next/RLS compatibility P3, reachable UI P5 |
| Choristers/detail/invitations + assignment-file links | Included permanent WebView: shell `/koristler`, `/koristler/[id]` | Shared native lease/capabilities, Next legacy token/content adapter, `legacy-file` +090legacy; new assignment versions057/readers; iOS profile-file P2, full runtime P3/P4 |
| Profile/edit/change requests/password/logout | Included permanent WebView: shell `/profil`, `/profil/duzenle`, `/profil/degisiklikler` | `lib/web-auth-capability.ts`, Auth APIs, atomic submit087/review088, photo route; P3 browser-only API and hybrid write audit |
| Attendance/date navigation | Included permanent WebView: shell `/devamsizlik` | Existing rehearsal/attendance/continuity RPC and RLS, actual embedded mutation/Realtimes P3/P5 |
| Notification permission and cold/live deep links | Included permission/tap consumer: `src/notifications/`, shared `lib/notification-*` | Existing provider-neutral037 contract; native provider/backend delivery NOT IMPLEMENTED/accepted. Permission is not a delivery promise; P5 exposes truthful capability, P6 completes provider/hardware delivery |
| Native home beyond navigation shell, full native assignments | Retained final, currently unavailable routes, not fabricated beta tabs | MIGRATION ownership remains native; existing full browser functionality retained; staged P6 without making unavailable native screens a beta blocker |
| Full native annotation write/sync/offline, chat reactions/polls/receipts/Presence/media/admin | Retained final P6; existing web features and server sources retained | Shared contracts/024,039–047,060; not represented as currently implemented native controls |
| Commercial seats/billing/limits, deletion/retention, both stores | Retained P6/P7 | Five free + extra seats; assisted onboarding; remaining owner choices staged, no silent defaults or individual-sales addition |

Every listed anchor is pinned. Exact individual call locations, source SQL definitions,
routes and Edge closures are in the machine manifest, not inferred from chat history.

## Backend and release dependencies

Clients: web lock `pnpm-lock.yaml`, mobile `apps/mobile/package-lock.json`; both
SHA256-pinned with package/config. Existing Node24.13.1 used for this verification;
mobile engine>=22.12<25, Expo57/RN0.86.3. Mobile supabase-js2.115.0 vs web/Edge2.112.4
is intentional inventory, **not compatibility acceptance**. No dependency install/change.

Six content readers: `repertoire-file`, `assignment-file`, `assignment-review-file`,
`repertoire-comment-file`, `chat-media-file`, `legacy-file`. Eight writer/lifecycle
functions: `repertoire-upload`, `repertoire-file-lifecycle`, `assignment-upload`,
`assignment-review-upload`, `repertoire-comment-upload`, `repertoire-comment-lifecycle`,
`chat-media-upload`, `chat-media-lifecycle`.
Other exact closure entries: `create-choir`, `choir-invitations`, `link-preview`,
`account-recovery-006`, `drive-manager-v2`, `resend-inbound`;20 total, not20 new deployments.
Recovery/mail/legacy operations are retained dependencies, not automatic new feature scope.
JWT exceptions in pinned `supabase/config.toml` require handler/Auth/SQL checks;
`verify_jwt=false` never means public unauthorized access.

SQL:25 changed fourteen-digit forward files compared with observed GitHub baseline,
ordered explicitly in JSON:024 →041–046 →048 →053–060 →063 →065 →078 →079 →082 →087
→088 →090actor-ticket →090legacy. This is a **source dependency order**, not the hosted
applied-migration list. Existing003/005/006/007/008/012 and earlier tables/functions/
grants are prerequisites. P3 checks applied IDs/checksums, then installs only missing,
reviewed forward changes on a fresh recovered target. No directory replay.

The continuity RPC's original baseline body is not a fresh CREATE migration:
003 adapts `get_member_continuity_info(uuid)` with checked catalog transformation.
Its existing-DB prerequisite is covered by the dated protected R1 snapshot
SHA256 `9b73831cda2809273e3f671031b35ab990707c3613f2c3ffb30ddba143f15cd2`;
fresh restored definition/grants/tenant negatives are P3 environment gates. This
package **cannot bootstrap an unrelated empty database**, and does not claim that.
The three dynamic RPC transports are resolved to exact literal alternatives/source:
native edit/delete/hide; link-preview current choir/member (authorization module);
repertoire-upload054 versus cover056. No nonliteral dynamic import found.

28 historical eight-digit/undated SQL files are pinned as retained prerequisite or
historical source, excluded from automatic upgrade execution. In particular
`delete_bulk_songs_keep_zartzurt.sql` is **prohibited**, not a migration to apply.
P1 deletes no file/data. R2 modes/flags default legacy/disabled; copies alone do not
activate reads/writes. The `legacy-file` reader still supports Drive/Supabase-storage
compatibility; it is not proof of final R2 operation or retired public Drive ACLs.

Rollout contract: fresh protected backup/isolated restore → compatible DB expansion
→ compatible Edge → repaired Next/web → supported native → reconciled storage/flag
activation. Retain current/old-client checks at each stage. P3 must separate the
minimal078/090/legacy repair from the broader full-product dependency package and
prove convergent compatibility. No blind bulk push, destructive down, actorless-v1
rollback or restoration of known inactive-membership bugs. Git revert is not recovery.

## Reused evidence and precise exclusions

[Android fullv5](2026-10-03-android-candidate-full-share-http-v5.json): PASS_HTTP_NATIVE,
3October14:04:19UTC,157 native +5 dispatcher-server hashes matched to frozen source;
426 profile-fixture hashes reconstructed in memory from7cd8d46 plus four pinned
semantic deltas/factory hashes. These fixture bytes are **not all full web bytes**.
Dated source gates mobile57suites465/root1178/build are linked in the
[Android report](../2026-10-03-android-full-share-flow.md), not rerun or renamed fresh.
Reuse: Android agent cancel0 →65905-byte intended PDF/pages1→2 → share chooser
dismissed without recipient → return/close/file removed → actual AuthStore B while
A profile active → oldA GET/HEAD403/provider0; browser persistence/teardown checks.
Limits: synthetic authority/dispatcher/emulator; not full Next routing/middleware,
hosted RLS/provider, physical device, recipient delivery or current iOS proof.

## Assigned release blockers, in execution order

| ID / severity | Exact open evidence / reason | Owner plan / next smallest action |
|---|---|---|
| B1 CRITICAL | Latest iOS consent/PDF/share-return/cleanup/B/expiry/WebView/guard-off matrix NOT RUN | P2/090: installed-tools/resource preflight, same native source + pinned fixture, agent automation, no owner QA |
| B2 CRITICAL | Served revision/hosted IDs/Edge/config unknown; complete Next/API/old-client/browser-API compatibility NOT RUN | P3/090/R1: correct-project read-only preflight; minimum-backport and full candidate integration on recovered target; all visible routes, SQL definitions and dynamic call paths |
| B3 CRITICAL | Fresh complete recovery and named independent package review NOT RUN | P3/090/R1: exact source package, fresh protected snapshot/restore and per-layer recovery; independent review, not Jev/self-review |
| B4 CRITICAL | Actual R2 five-family readers/writers/mappings/flags/private ACL cutover NOT accepted; dated42copies60,969,062B and49pendingMP3/192,361,428B need refresh | P4/053–077/090: authorized staged promotion, reconcile source/destination hash/count, verify every family/denial and active writers; retire old exposure only under exact scope |
| B5 IMPORTANT | Installed signed usable Android beta same-version invite→login→choir→repertoire→PDF/audio→reopen→logout NOT RUN; revoked/wrong-account invite product negatives open | P5/004/010/090: choose controlled delivery/recipient scope with owner, agent-installed cohort test, clean second-independent-choir isolation; no emulator-to-phone promotion |
| B6 IMPORTANT | Exposed chat/WebView/permission controls must match actual server capability, not the profile-only fixture | P3→P5: validate included chat and four WebViews; clearly distinguish notification permission from unavailable delivery; capability changes require explicit candidate revision, no silent feature removal |
| F1 RETAINED FINAL | Native missing full features, push delivery/hardware and commercial policy choices | P6 existing briefs: finish preserved feature matrix and request only unresolved product decisions; not blanket blocker for a scoped usable beta |
| F2 RETAINED FINAL | Both-store submission/distribution/operations NOT RUN | P7: exact full candidate/accounts/compliance/physical verification/authority; beta is not final completion |

No hosted operation, credentials/account addition, recipient communication, DB write,
provider ACL change, CI/push/deploy, build or simulator started. Existing authority
is preserved; exact missing external scope is matched in P3/P4/P5 packets.

## P1 verification and handoff

Deterministic replay reconstructs the same manifest, all610 selected source pins,
842 literal import edges/20 Edge closures and157/5/426 reuse pins. Initial inventory
assertion caught a guessed root middleware path that does not exist: replaced with
the actual tracked configuration set before generation. Array/Buffer.from lexical
false positives were removed; remaining inventory limitations are explicit.
No required P2–P7 runtime row is closed by P1. Self-review only. P2's input is this
manifest plus the Android fixture's immutable
426-pin definition, **not an instruction to substitute that fixture for all web routes**.

### Actual bounded Jev review

One call, pinned `jev-1.13.0`,8 typed questions,19,482 request bytes;5,385 input and
324 output tokens; zero retries. Estimated **$0.00022617**, not invoice, from
[current official pricing](https://docs.typesafe.ai/models) ($0.042/M input, free output).
[Request/provenance](p1-jev-review/request.json) and [answer distributions/usage](p1-jev-review/response.json)
retain the exact **pre-review** document snapshot/hash; adding this paragraph does
not claim Jev read later acceptance edits. Key stayed in memory; no transcripts,
source bodies, user/choir data or credentials sent. No key persisted.

Jev selected full-source freeze with bounded profile evidence; marked supplied
scope/dependencies/recovery/evidence descriptions supported; selected unproved
complete Next/Auth/RLS/old-client compatibility/recovery as the strongest remaining
release risk. Negative control rejected false whole-product completion; positive
control kept source documentation separate from open runtime gates. All8 choices
matched the primary's source-based expected interpretation; probability1 on each.
These are judgments on supplied text, **not calibrated proof of absent defects**,
independent review or permission. No disagreement hidden; no source fix was made
because of an AI choice. P3 package risk is preserved as B2/B3 rather than waived.

### Acceptance table — source inventory only

| Criterion | Required | Status | Dated evidence / limit |
|---|---|---|---|
| Immutable single candidate and reconstructible components | yes | PASS |3October helper generation/replay; source/entry/ref trees and610 SHA256 pins; no runtime construction |
| Exposed features and retained final ownership | yes | PASS | Actual Shell/AppRoot/route policy, feature table and051 source/brief; unavailable native features remain P6 |
| SQL/Edge/API source dependency inventory and prerequisites | yes | PASS |842 import edges,20 closures,38 RPC definitions/adaptation source,25 forward SQL/28 excluded historical files; actual hosted state P3 |
| Android evidence provenance/reuse | yes | PASS |157 native/5 server match,426 semantic fixture reconstruction; full web/current iOS not accepted |
| Assigned blockers and executable next plan | yes | PASS |B1–B6/P2–P5, F1–F2/P6–P7; no closed required runtime FAIL/NOT RUN |
| Jev actual usage/cost/provenance/controls | yes | PASS | One actual call,8/8 expectations/two controls; source verification remains primary authority |
| Link/secret/scope/diff/resource checks and commit | yes | PASS |3October178 final links/anchors,610 working-source pins, key/JWT-pattern scan and diff checks; scoped090 commit owns this record; no unrelated CLI staging |
| Fresh pnpm/mobile/build/emulator/hosted tests | no, P1 | N/A | No product/config/dependency change; unrun P2/P3/P4/P5 gates stay open |

P2 next three actions: (1) verify current pins and installed iOS automation/toolchain,
free disk and owned cleanup targets; (2) run current guarded native/fixture iOS matrix
with actual UI/network/file evidence; (3) record precise outcomes/invalidations, clean
owned outputs, and advance to P3 only on required PASS. No manual owner test steps.

Final resource observation:22,747,728KiB available. Small owned source/record set
741,727B before final acceptance paragraphs, below2MiB; no runtime/copy/build process
created or retained. Only regenerated the task-owned unaccepted JSON draft; retained
all product data/source/older manifests and dependencies. P1 accepted by primary
self-review and deterministic checks; not independent review. Scoped commit
`090: freeze source-complete beta candidate and P2 handoff` owns this acceptance;
verify actual SHA with Git on resume. No separate production-code commit is needed.
