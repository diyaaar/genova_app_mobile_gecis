# P4 — Compatible live services and private-storage cutover

> Historical plan as of 13 October 2026. [AGENTS](../../AGENTS.md) supersedes
> procedural restrictions here; the old stage order is not a current assignment.
> Product requirements, dependencies and recorded acceptance gaps are retained for
> the new roadmap. See [checkpoint](checkpoint.md).

[Previous P3](03-release-package.md) · [State](checkpoint.md) · Next: [P5](05-android-beta.md)

## Contract

One outcome: the declared beta's real file readers and writers use private storage
without requiring Drive, with reconciliation and recovery proved. Entry: accepted
P3 package and exact applicable hosted/provider/copy/cutover authority. Preparation
does not itself authorize these mutations. Keep DB/Auth/Realtime/Edge on Supabase;
no hosting or Railway rewrite. Use the [existing runbook](../private-r2-release-runbook.md).

Owners: 090 hosted revocation, [077](../briefs/077-repertoire-mp3-r2-batch-3.md) and
the existing copy/activation briefs. Each bounded batch keeps its own acceptance;
do not combine the whole storage migration into an unreviewable write.

## Ordered work

1. Verify target/source/config/backups immediately before each authorized action.
   Promote only P3's compatible dependency chain and verify each actual destination.
   A failed DB/Edge/client step stops dependent activation. Confirm ordinary web
   users and supported old clients still operate safely.
2. Refresh real inventory without exposing private bytes in reports. Reconcile
   the dated 42 copied objects and remaining 49 MP3; derive exact pending batches.
   Resume approved copies idempotently with size/hash/ownership evidence. 077's
   ten-object packet is a historical proposal, not permission to copy today's matches.
3. Reconcile mappings and activate by file family, verifying real readers **and
   writers**, then withdraw old public access under separately matched authority.
   Retain source objects/notes and recoverable mapping history. Complete declared
   cutover checks before handing the live service manifest to P5.

## Required matrix

| Area | Exit evidence |
|---|---|
| All retained file families | Every inventory record reconciled by tenant/resource/version; copied/active/error/skipped rationale; no unaccounted required object |
| Reads | Correct MIME/size/checksum, PDF rendering, audio Range/seek, HEAD, expiration/renewal and denied tenant/role/session; private object not anonymously readable |
| Writes | New uploads/submissions/media complete atomically into intended private backend; interrupted/retried upload safe; no Drive-only writer left behind |
| Cutover | Current mapping/flags and actual deployed versions recorded; old/new clients supported or safely refused according to package |
| Authorization | Previously issued URL next-request refusal; wrong tenant, inactive member, changed role and stale context cannot fetch bytes |
| Old access | Old public links/ACL actually withdrawn or release remains blocked for that family; copying or hiding a link is not revocation |
| Recovery | Tested mapping/config recovery or forward repair without reopening known security defects; original files retained |
| Cost/operations | Measured object/egress/request footprint, real cost estimate versus <=$5/month preference, discrepancy surfaced before new spending |

No real conductor note or Drive object is deleted by this plan. Sibling website and
retained tables are outside scope. No key, private object URL or raw user file is
sent to Jev; only redacted metadata/questions if semantic assistance is useful.

## Acceptance and handoff

P4 requires actual target evidence, not a local mocked provider. Record date,
deployed revisions/function versions, inventory hashes/counts, authority scope,
verification and recovery for each step. Required failures keep cutover open.
Use fresh provider docs/skills and target-specific tests when executing; do not
invent current pricing, policies or provider capabilities from this plan.

Output: deployed compatibility manifest + complete storage reconciliation + access
withdrawal/recovery evidence. Update P1 identity if exact release composition changed.
P5 receives this backend baseline; later target drift invalidates dependent beta
checks. Remove only owned disposable outputs; preserve protected backups.
