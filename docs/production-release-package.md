# Proposed compatible-service release

13 October 2026. Target: Supabase `hievmwwctjjlhmssoxsu` and the Genova app at
`app.genesinovachoir.com`; detached public website excluded. Product revision
`9d1f1a72d2024734a9d8fac6cc540960ce9b1534`. No provider change is executed by this packet.
[Candidate manifest](reports/production-2026-10-13/release-candidate.json) pins 363
product/config files, the exact eleven SQL deltas and nine proposed Edge closures.
[RPC inventory](reports/production-2026-10-13/rpc-inventory.json) maps all 38 required
RPC names, including three source-reviewed dynamic dispatchers. Seven are absent live. [Fresh Edge comparison](reports/production-2026-10-13/edge-inventory.json)
confirms six deployed source differences and three missing functions.

## Evidence already available

Fresh root lint/types/1,234 tests/coverage/build and 38 desktop/mobile browser cases;
mobile types/465 tests at the product revision. The restored-state
[five-family acceptance](reports/2026-10-13-five-family-managed-acceptance.md) now passes
219 actual local HTTP controls, all eleven deltas and ten SQL controls. Earlier
[current web managed evidence](reports/2026-10-10-p3-managed-read-compatibility.md)
remains dated source-specific evidence, not a new run of the entire candidate.

## 14 October evidence update

[Fresh source/current web result](reports/2026-10-14-fresh-recovery-and-current-web.md):
13 October cutoff restored with 17 catalog groups / 101 tables / 2,884 rows identical;
11 SQL deltas, 10 SQL controls, 219 HTTP observations and 12 current web browser checks
passed. 21 deployed Edge closures and five configuration GET responses are encrypted
and roundtrip verified. Original release manifest remains immutable and product pins
unchanged. Actual object bodies/provider secrets and offsite recovery are still open.

## Exact proposed order

1. Refresh protected recovery cutoff and compare target catalog/config to the rehearsed
   baseline. Preserve encrypted existing backup; make any new export in a new private
   directory with mode 0700 and files 0600. Keep secrets and row bodies outside Git/AI.
   Restore/rehearse any new source differences before live mutation. Confirm recovery
   coverage separately for object bytes/configuration; the logical backup excludes them.
2. Apply only the eleven pinned deltas in manifest order: 024 annotation revision/save,
   046 private chat topics, 048 room-read ordering, 078 active memberships, 079 RPC grants,
   082 atomic repertoire assignments, 087 profile submit, 088 profile review,
   090 actor/session file authority, 090 legacy resolution, 090 session lifetime.
   Verify schema/RPC/grants and negative tenant cases after each dependency group.
   Do not replay the migration directory or rewrite historical ledger statements.
3. Reconcile current hosted bundles/configs, then deploy the named reader/adapter package:
   repertoire-file, assignment-file, assignment-review-file, repertoire-comment-file,
   chat-media-file, legacy-file, drive-manager-v2, link-preview, account-recovery-006.
   Preserve unrelated functions and provider secrets. The latter two legacy config
   omissions (`drive-manager-v2`, `link-preview`) use the documented default `true`: retain
   the deployed drive-manager-v2 setting, and use that default for new link-preview.
   Both still perform their own handler authorization. The seven explicitly configured
   functions keep their exact local settings. [Supabase configuration reference](https://supabase.com/docs/guides/functions/function-configuration).
4. Publish the compatible web candidate through a reviewed Git/hosting release; explicitly
   account for automatic deployment when pushing. Require supported current client before
   private-storage activation. Validate login/choir choice/profile/repertoire/chat and
   file renewal/refusal with scoped test users; sending real invitations/mail is separate.
5. Reconcile/distribute the supported mobile build and validate actual provider/platform
   behavior. Private storage activation, remaining object copy and legacy public-link
   withdrawal are separate operations with their own object lists and recovery evidence.

At any unexpected target/source difference or failed check, stop dependent stages.
Keep old logical/object recovery material and the prior deployed artifact identities.
Do not use an insecure down migration, actorless ticket reader or disabled RLS as rollback.
No billing provider, new infrastructure subscription, user-data deletion or credential
rotation is included. Actual hosting/provider charges, if any, are not inferred from
Jev's separate permission.

## Open conditions before a live operation

- Fresh cutoff/restore comparison is complete at the dated cutoff; recheck drift before
  execution. Object bytes/provider secret values and actual config restore remain open.
- Immediately recheck the now-recorded exact hosted Edge versions/config before deployment.
- Current complete web/native/provider integration and release review; this session's
  review is self-review. Do not represent it as independent review.
- Applicable authorization for the exact live DB/Edge/web/data operations and hosted
  test accounts. Existing local implementation/rehearsal authority remains valid.

This service package closes backend divergence; it is not a claim that native annotation
editing/sync, native homework/home, push transport, commercial seat/lifecycle controls,
scale readiness or store delivery are already complete. Those remain in the
[production roadmap](production-roadmap.md). The package does not narrow their scope.
