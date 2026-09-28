# 084 — stale-choir create guards

Status: IN PROGRESS, 28 September 2026. Single writer: main agent.
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
repertoire creation to that opening choir. A failed read or changed choir fails closed; do not
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
`lib/repertuvar/create-song.ts` and its tests; `lib/server/tenant-client.ts` only if a small
shared validation helper is justified; bounded SQL test/runner under `supabase/tests/` and
`supabase/test-support/`. Allowed records: this brief, WF-013, handoff, active/progress.
No unrelated refactor, other mutations, schema change, native code, new registration, push,
deploy, hosted DB/Edge, provider, credentials or real-choir write.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| A-form/B-session new-row risk reproduced; positive A/A retained | Yes | NOT RUN | Synthetic request tests before/after fix |
| Three service-backed create routes refuse missing/mismatched choir before privileged client/writes | Yes | NOT RUN | A/B and malformed input matrix; role/target behavior preserved |
| Form-origin choir is frozen for announcement/rehearsal/assignment/song creation; current context switch refuses | Yes | NOT RUN | Focused form/hook tests, no stale form silently retargeted |
| Legacy and private repertoire creation refuse stale context; explicit A insert cannot land in B | Yes | NOT RUN | Focused client tests and local PG17 RLS two-choir fixture |
| Same-choir create behavior and existing test suite remain green | Yes | NOT RUN | Focused positive tests and root `pnpm check` |
| Diff, local links, ownership, cleanup and separate code/document commits | Yes | NOT RUN | No native or live acceptance claimed |
| Actual browser/device/hosted release and other mutation routes | No; separate work | NOT RUN | Must not imply full F13 or commercial readiness |

Self-review is not independent review. Required FAIL or NOT RUN prevents local closure.
