# 084 — stale-choir create guards

Status: COMPLETE LOCALLY, 28 September 2026. Single writer: main agent.
One observable result: a creation form opened for Choir A cannot create its new object in
Choir B after the same Auth session switches to B, while an unchanged A session can still
create it. Owner approved the next local F13 checkpoint after 083.

## Startup and decision boundary

Read AGENTS, handoff, active context, WF-013, 083, delivery execution controls, transition
guide, work cycle, brief template, MIGRATION and decisions #16/#18/#28–31. Verified `main` /
`31b5122`; only unrelated `supabase/.temp/cli-latest` is dirty. Supabase and Postgres skills,
current Supabase changelog/RLS docs, existing tenant client, create forms/routes and repertoire
RLS are the task sources. No live state is assumed from old handoff evidence.

Inventory: rehearsal creation can have no invitee IDs, so its current privileged insert can
write into newly selected B from an old A form. Announcement and assignment creation require
target member IDs and tenant-scoped lookups, which usually refuse A IDs in B, but neither has
an explicit old-form precondition. Repertoire has a legacy direct-table insert relying on the
server-current default choir; the private-file path has explicit choir IDs and checks only the
current session, not the choir that opened the form. Profile creation was handled in 083.
Other mutation routes carry existing object/member IDs and need a separate object-anchored
inventory; assignment-submission upload and comment/file lifecycle are not silently declared
safe or included here.

This checkpoint covers four user-visible new-object flows: announcement, rehearsal,
assignment and repertoire. Capture the choir of the open form, require an expected-choir
precondition before the three privileged service clients, and explicitly bind legacy/private
repertoire creation to that opening choir. Failed context resolution or changed choir fails closed; do not
replace role/target/FK/RLS checks. Keep native/WebView ownership from MIGRATION. No new API for
a native screen, no schema migration and no operator/catalog/billing expansion.

## Work card and resources

1. Add focused A-form/B-session negative tests and a positive A/A control; run red baseline.
2. Implement the smallest form-origin precondition and server/client guards for these four
   create flows. Prove the repertoire explicit-choir RLS refusal in a disposable local PG17
   clone if feasible without schema or live data changes.
3. Run focused and root gates, review, clean only task-owned outputs, split commits and update
   WF-013/handoff/active/progress. Exit only with every required criterion PASS.

Preflight: 34,370,696 KiB free; retained PG17 source ~15 MiB; one disposable clone ~15 MiB;
root build/coverage estimate <1 GiB. The 10 GiB floor holds. No VM, simulator, dependency
download, provider, hosted project or real account action. Preserve 071–076 copies, source
restore and unrelated CLI marker. Drop only exact owned clone; move derived `.next`/coverage
recoverably after final checks. Code rollback is a web revision, not a DB rollback; release
still needs source/rollout approval and old browser tabs must refresh.

Allowed product paths: the three `app/api/{announcements/publish,rehearsals/create,
assignments/create}/route.ts` files and focused tests; `components/{CreateAnnouncementModal,
EventFormModal,CreateAssignmentModal,AddSongModal}.tsx`; a narrow form-choir hook if needed;
cross-route `app/api/new-object-choir-context.test.ts` and form/hook focused tests;
`lib/repertuvar/create-song.ts` and its tests; `lib/server/tenant-client.ts` only if a small
shared validation helper is justified; bounded SQL test/runner under `supabase/tests/` and
`supabase/test-support/`. Allowed records: this brief, WF-013, handoff, active/progress.
No unrelated refactor, other mutations, schema change, native code, new registration, push,
deploy, hosted DB/Edge, provider, credentials or real-choir write.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| A-form/B-session new-row risk reproduced; positive A/A retained | Yes | PASS | 28 Sep: rehearsal route returned 200 for an A payload under mocked B resolution before guard; negative matrix failed. Actual local PG17 also reproduces a default-choir repertoire insert landing in B. Fixed routes/client refuse; same-choir positive controls pass. |
| Three service-backed create routes refuse missing/mismatched choir before privileged client/writes | Yes | PASS | Route tests: missing/invalid UUID 400 without service bootstrap; old A form/current B 409 before scoped reads/writes; same-choir success, no-management-role 403, inactive targets 400 remain. Existing real SDK tenant-client transport tests included. |
| Form-origin choir is frozen for announcement/rehearsal/assignment/song creation; current context switch refuses | Yes | PASS | Eight rendered-component tests exercise all four forms: valid A sends A, an open A form refuses after member/active context changes to B. Hook tests prove close/reopen acquires B and mismatched member/context never captures an origin. This is jsdom, not an actual browser/WebView. |
| Legacy and private repertoire creation refuse stale context; explicit A insert cannot land in B | Yes | PASS | Client tests reject A origin/current B before insert/upload; legacy success has explicit A. `084_stale_choir_create_runner.sh`: actual PG17 A/A and B/B inserts, A request in B rejected by RLS, revoked B cannot fall back to A. Source/baseline unchanged; exact disposable clone dropped. |
| Same-choir create behavior and existing test suite remain green | Yes | PASS | Focused 6 suites/59 tests and typecheck; final `pnpm check` at product revision `54efa6b`: lint, typecheck, 100 suites/971 tests, service-worker syntax, Next production build all passed. No mobile source changed. |
| Diff, local links, ownership, cleanup and separate code/document commits | Yes | PASS | Self-reviewed scoped diff, `bash -n`, local-link/diff checks. Scope `237bbe1`, code/test `54efa6b`, final record commit in Git. Owned 467 MiB `.next` + 348 KiB coverage moved recoverably to exact 084 Trash paths; 33,827,652 KiB measured free (Trash retains blocks). Unrelated CLI marker unstaged. |
| Actual browser/device/hosted release and other mutation routes | No; separate work | NOT RUN | Must not imply full F13 or commercial readiness |

Self-review is not independent review. Required FAIL or NOT RUN prevents local closure.

One new announcement positive mock initially omitted the automatically included creator target,
so the existing target check correctly returned 400. Added that synthetic target; no production
validation was weakened. No other failed approach was repeated. No schema mutation, live data,
provider request, push/deploy or device operation ran. Release is web-only; old API consumers
without `expected_choir_id` fail closed with 400 and must refresh. Legacy old-version repertoire
clients can still omit `choir_id`; this revision fixes the four current forms, not arbitrary or
unrefreshed clients. Authorization still belongs to the verified session, role and DB/RLS.

## Remaining mutation inventory — source evidence, not acceptance

| Family | Concrete boundary found | Remaining proof / risk |
|---|---|---|
| Profile new request | 083 submit now requires displayed choir; review uses request/member IDs through scoped transport | Actual browser and review transaction/permission races not tested here |
| Announcement/rehearsal/assignment update, delete, lock; attendance | Existing object/member IDs queried through `createTenantServiceClient`; 003 tenant links enforce related IDs | Delayed same-session object-anchored requests, permission changes and empty-result behavior need an integrated matrix; not closed here |
| Assignment submission upload/review | `app/api/assignment-submissions/upload/route.ts` and Edge upload use assignment/member IDs; commit RPC binds actor/session/choir | File/compensation/notification races need the separate file/release matrix |
| Repertoire tags | `components/SongEditModal.tsx` creates a tag before song-tag linking; payload includes creator, not an explicit choir. 003 generic FK trigger checks creator links | Do not assume safety when creator is null/stale or UI identity refreshes mid-form; not exercised or fixed here |
| Chat room/messages/polls/social | `lib/chat.ts` mutations carry room/sender/creator IDs; 041/044/045 add current-member/room authority | Existing IDs reduce retargeting but are not a substitute for same-session multi-account/role runtime tests; no chat mutation acceptance added |
| Invitations | `choir_invitation_command` explicitly compares payload `choirId` with `current_choir_id()` and current Şef role; handler forwards JWT only | Strong server precondition already exists. Open-form retargeting/actual email/account lifecycle not reaccepted |
| Legacy Drive and private comment/media lifecycle | `drive-manager-v2` resolves current choir and scopes service transport; object actions carry song/submission IDs. Private lifecycle RPC receives actor/session/choir plus object ID | External provider and object-anchored delayed mutations remain NOT RUN |

`rg` inventory covered root API routes, component/direct-table writes, shared web libraries,
Edge Functions and relevant migration authority. It identifies mechanisms and residual work;
it is not an exhaustive behavior certificate or a full F13/commercial-readiness closure.
