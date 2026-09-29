# 088 — authority-safe atomic profile review

Status: IN PROGRESS, 29 September 2026. Main agent, single writer.
Owner's continuing implementation request authorizes local code/tests/commits only.
One outcome: a chef's approve/reject decision and approved member changes commit together,
with caller session, membership and choir-aware chef authority held through commit.

## Startup / work card

Verified main `dfbb63b`; only unrelated `supabase/.temp/cli-latest` dirty, preserve unstaged.
Read AGENTS, short handoff/active context, 087/WF-013, guide/work cycle/brief template,
delivery execution controls and profile WebView boundary. Inspected actual review route,
submit transaction, source PG17 table/role definitions, review UI contract, push delivery,
087 fixtures/runner and 085 representative transport coverage. No delegate or new runtime.

1. Fresh LOCAL source backup/restore equality; reproduce the old half-decision/service authority
   gap using synthetic rows. Preserve original source and old table/function authority.
2. Add authenticated-only transactional review RPC and a thin caller-JWT existing Next adapter.
   Preserve response keys, overlap ordering, review-time snapshot and best-effort postcommit push.
3. Actual PG A/B/ACL/rollback/down-reapply and competing role/member/session/review/submit
   transactions; actual SDK simulated transport; root gate, self-review, cleanup and split commits.

Allowed paths: new `supabase/migrations/*_088.sql`, `supabase/rollback/088_atomic_profile_review_down.sql`,
`supabase/tests/088_*`, `supabase/test-support/088_*`, existing review route/new route test,
`app/api/object-anchored-tenant-boundary.test.ts` (move profile criteria to new RPC coverage,
retain other routes), this brief/evidence/WF-013/handoff/active/progress.
No UI/native/general role refactor, old grant removal, provider/outbox/schema lifecycle redesign.

## Contract / risk / authority

Current review uses service-key reads/writes after unlocked role/context checks. Request status
is written before the member; failure triggers a second, unchecked compensating reset. A failed
reset leaves an approved request without its member change. New RPC replaces those split writes.
No payload member/reviewer/choir authority. Request ID is the immutable tenant anchor; derive
verified current choir, lock/materialize only authorized session choice, reject a changed choice.
Lock actor and target members in UUID order (NO KEY UPDATE for FK compatibility), role assignment
and role rows, then member's pending requests in created_at/id order shared with 087. Reread
target binding/status after locks. Old/direct/service writers remain outside RPC coordination;
delete/cascade may yield a retryable deadlock, never claim universal deadlock freedom.

Chef role retains case/diacritic/trim normalization; no part-leader permission. Both approve/reject
retain earlier-created overlapping pending refusal; equal timestamps retain old behavior. Approve
requires active target (fail-closed safety); reject permits inactive target to resolve obsolete
drafts. Valid keys/null/trim remain the 087 helper contract; own school/department/song references
are revalidated and share-locked on approval, malformed typed dates/IDs refuse atomically.
Snapshot is review-time member values, not stale submit-time values. Reject never updates member.
Push uses only committed RPC target identity; its existing UUID-based subscription lookup stays
unchanged, delivery is best effort, not transactional/outbox or guaranteed retry acceptance.

Private additive definer function, empty search_path, fixed relations/static typed update;
explicitly revoke PUBLIC/anon/service_role execution and grant authenticated only. Preserve table
RLS/ACLs and existing functions. Generic route errors; missing RPC 503, no privileged fallback.
No profile browser/Auth/REST/provider/device/hosted acceptance inherited from 086/087.

## Resources / shared DB / rollback

Free 34,132,340 KiB (~32.6 GiB); reuse PG17/dependencies and read-only `genova_068_test_restore`.
One exact `genova_088_test_roundtrip`, private 0700 `spike/088-private-*` fresh LOCAL backup/logs;
estimated peak DB/scratch 0.5 GiB + root build 1 GiB + logs 0.05 GiB, above 10 GiB floor.
No VM/Auth/REST service/browser install. Remove owned target/sensitive scratch after final SQL;
recoverably move root build/coverage/log after gates, preserve original restore/configs/deps.
Fresh LOCAL backup is not a current hosted backup. Sibling website uses same tables: new function
only, preserve existing contracts; unknown live consumers remain unverified. Future release needs
current hosted backup/restore, both-project impact and exact authority. DB 087→088 then web;
retain RPC while rolling web back. Local down drops only new RPC; no row/data reversal. Git revert
is not data recovery, no production down while adapters depend on it.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? | Status | Date / environment / scenario | Evidence and limits |
|---|---|---|---|---|
| Old half-decision and revoked-role service write reproduced; fresh LOCAL restore equality | Yes | NOT RUN | PG17 synthetic fixtures | Source read-only; no hosted freshness claim |
| Own A/B approve/reject, foreign/stale/inactive/session/role/overlap/reference/snapshot refusals | Yes | NOT RUN | Actual caller-claims SQL | Auth tokens are not provider-tested |
| Forced post-member failure rolls back both; ACL/down/reapply preserve old authority | Yes | NOT RUN | PG17 triggers/catalog comparison | No production schema operation |
| Competing role/member/session, double decision and 087 submit serialize with exact final state | Yes | NOT RUN | Real PG locks/waits | Old writers/cascades outside universal guarantee |
| Caller-JWT SDK route/errors/no fallback/push semantics; focused/full root gate | Yes | NOT RUN | Next/supabase-js simulated HTTP + pnpm check | Provider and browser are distinct layers |
| Scope/self-review/links/redaction/cleanup/split code-record commits | Yes | NOT RUN | Local final checks | Self-review is not independent review |
| Updated real browser/Auth/REST/device/provider/hosted release | No; later integrated checkpoint | NOT RUN | Not this narrow local transaction scope | WF-013 step 5 remains PARTIAL |

Exit only when every required criterion passes. Progress review at 60 active minutes or two
failed approaches to the same criterion; record cause and new bounded action before retry.
