# 087 — authority-safe atomic profile request submission

Status: COMPLETE LOCALLY for this bounded submission contract, 29 September 2026.
Main agent, single writer. Scope `ae677c3`; product/test `9581ad7`; final records separately committed.
Owner's “devam et” continues the proposed 086 follow-up; local code/tests/commits only.
One outcome: submitting a profile request uses caller JWT authority and one DB transaction,
so session switches, membership revocation and concurrent same-field submissions cannot leave
an unauthorized/partial request or duplicate same-field pending requests.

## Startup / work card

Verified main `71ac50f`; only unrelated `supabase/.temp/cli-latest` dirty, preserve unstaged.
Read AGENTS, handoff/current active context, complete 086/WF-013, guide/work cycle/template,
delivery execution controls, decisions #16/#18/#28–31, MIGRATION's permanent profile WebView
boundary, actual submit/helper/078/082 and relevant SQL/route tests. Original local PG17 restore
exists; 086 services/VM/build are absent. Historical 086 browser pass is not post-087 evidence.

1. Reproduce old privileged submit after revocation in a disposable PG17 restore; inspect source
   ownership/ACLs. Prepare private fresh local backup/restore proof before target schema changes.
2. Add an explicitly authenticated-only transactional RPC; lock session choice then member,
   validate own references, normalize allowed fields, merge/delete matching duplicates atomically.
   Existing Next submit becomes a caller-JWT adapter; preserve response/form contract.
3. Actual PG concurrent ordering/rollback/A-B/ACL/down-reapply and SDK/route tests, full gate,
   self-review, cleanup/evidence and split commits. Exit only when mandatory local criteria pass.

Allowed: new `supabase/migrations/*_087.sql`, exact `supabase/rollback/087_atomic_profile_submit_down.sql`,
`supabase/tests/087_*`, `supabase/test-support/087_*`, existing submit route/test,
`lib/server/__tests__/profile-submit-transport.test.ts`, brief/evidence/WF-013/handoff/active/progress.
No other mutation refactor, review/approval repair, native/UI/credential/provider/live change.
Profile approval/merge atomicity is the NEXT separate outcome, not accepted by submission tests.

## Design / boundaries

Existing Next route checks membership then performs multiple service-key operations. This leaves
a check/write gap; same-key concurrent inserts can duplicate requests and duplicate cleanup can
partially fail. No authorization identity/member ID is accepted from payload. Caller JWT supplies
auth.uid/session_id; expected choir is compared, never treated as authority. Explicit session-row
locking materializes the already-authorized single-choir fallback when no choice exists; it never
chooses an arbitrary supplied choir. Member lock serializes submissions and real revocation updates.
Whichever lock-holder commits first determines valid ordering; already-committed revocation/switch
must be refused. Reference row share locks protect catalog ownership through request commit.

RPC needs a narrow security-definer boundary because existing restrictive policy intentionally
blocks direct authenticated profile inserts. Preserve all table RLS/grants and existing functions.
Empty search_path, fixed fully-qualified relations, private normalization helper and explicit ACL
revocation for PUBLIC/anon/service_role; grant only authenticated. No SQL text interpolation.
Known existing non-RPC/service writers and review races remain outside this serialization contract.

Preserve allowed fields/trim/null/unchanged/previous snapshot, same-key pending update and duplicate
cleanup behavior. Route maps missing session 401, inactive/no context 403, stale context 409,
invalid/foreign choice 400; backend unavailable fails closed, never falls back to split writes.
Auth/signup/mail/provider and updated real-browser/device acceptance are NOT RUN in this narrow
local SQL/transport scope; 086 remains historical. WF-013 step 5 remains PARTIAL.

## Resources / shared database / rollback

Available 34,644,660 KiB (~33 GiB); source PG DB 15,668,915 bytes. Reuse installed PG17 and
dependencies; one exact `genova_087_test_roundtrip` DB and private `spike/087-private-*` scratch.
Conservative added peak: backup/restore/SQL scratch 0.5 GiB + root build 1 GiB + logs 0.05 GiB,
comfortably above 10 GiB floor. No VM, SDK, browser, dependency install or runtime rebuild.
Fresh backup of LOCAL restore only (not hosted current backup), restore into target with existing
role attributes, compare relevant data/schema/ACL evidence; source remains read only.
Scratch holds sensitive copied backup briefly under 0700/0600; remove after final DB checks.
Build/coverage move recoverably after final gate. Drop only exact owned target after checks.

Sibling website tracked consumer search finds no profile-request submit usage; keep its current
tables/functions/grants untouched. Unknown live consumers not certified. Future live change needs
new current hosted backup/restore, both-project impact and exact release authority. Rollout DB RPC
first → web adapter, retain RPC while rolling web back; code revert is not data recovery.
Local down removes only new RPC/helper schema, no row deletion. Reapply and before/after checks
required. Do not apply local rollback to production while any adapter depends on the RPC.

Primary concurrency/safe-definer references: [PG17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html),
[row locks](https://www.postgresql.org/docs/17/explicit-locking.html),
[function security](https://www.postgresql.org/docs/17/sql-createfunction.html). Actual tests,
not documentation alone, determine acceptance.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limits |
|---|---|---|---|
| Old service write after revocation reproduced; fresh local backup/restore equality | Yes | PASS | Actual old service-role insert; 15-table/function owner/ACL/table policy equality; no hosted freshness claim |
| Own A/B, stale/foreign/inactive/missing-session refusals and normalization/merge/snapshots | Yes | PASS | Actual PG17 direct RPC matrix and eight SQL/TS parity samples; 14 keys/Unicode trim/null; UTF-16 note limit |
| Real competing sessions: revoke/switch before writer, writer before revoke/switch, concurrent merge | Yes | PASS | Six actual competing transactions, observed waits and exact final state; SQL JWT claims, not real Auth tokens |
| Forced failure rolls back update/duplicate deletion; authenticated-only ACL and exact down/reapply | Yes | PASS | Delete failure rolls back prior update; insert failure rolls back context; anon/service/helper/direct-insert refused; original table authority preserved |
| Caller-JWT Next/SDK contract, errors, root gate, review/links/secrets/cleanup/split commits | Yes | PASS | Focused 3/32; root 101/1004/build, original 005/083 SQL regressions; scoped links/diff/redaction; source/target/scratch cleanup and split revisions; self-review only |
| Post-change browser/Auth/REST/provider/device/hosted release | No; later integrated release checkpoint | NOT RUN | 086 is historical; no commercial readiness claim |

Progress review after 60 active minutes or two failed approaches to the same criterion.

## Causal execution notes

First actual PG matrix and down/reapply pass; concurrent-test observation initially fails.
Controlled local probe proves `postgres` sees `<insufficient privilege>`/NULL wait fields for
OS-admin backend sessions, while the existing local administrator observes actual `PgSleep`.
Concurrent observer uses that administrator for activity inspection; RPC/write sessions remain explicitly
authenticated/postgres as before. No production stats grant or broader product permission.
New bounded concurrent run is justified by this causal evidence, not a blind timing increase.

## Final result / handoff

[Dated evidence](../evidence/087-authority-safe-profile-submit/README.md) owns exact commands,
matrices and limits. New route no longer creates a service-key tenant client or performs split
writes. Missing RPC is 503 with no fallback; revoked membership is 403 rather than the historical
086 submit's 500. Existing other routes still have their own error/race debt. All original table
authority/functions are retained; new private helper/RPC are forward-only additions.
Self-review checked row-lock/FK compatibility, per-member serialization, helper/TS parity,
own references, response validation, denied ACLs, generic errors and DB-before-web dependency.
The rollback filename was normalized to the repo's existing singular `supabase/rollback/`
convention, then the complete SQL/concurrent runner passed at its final path.

Task DB and all `087_*` test backends are absent; private sensitive backup/log scratch permanently
removed. Root build 466 MiB/coverage 348 KiB/check log moved recoverably to Trash; no copied .env
file existed in build. Final free 34,144,992 KiB (~32.6 GiB). Original restore/configs/dependencies/
global resources and unrelated CLI marker preserved. No VM/service/provider/live operation.

No post-change browser/Auth/REST or hardware test ran. No rollout is authorized or implied.
WF-013 step 5 remains PARTIAL: next separate outcome is atomic chef review/approval; remaining
mutation families/catalog administration/protected files/browser/device/release remain open.
Existing service/direct writers can bypass this RPC's serialization; delete/cascade lock ordering
can produce a deadlock victim and retryable 409. No commercial deletion/retention choice is made.
