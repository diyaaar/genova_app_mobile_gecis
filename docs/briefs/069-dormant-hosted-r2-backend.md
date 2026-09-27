# 069 — Dormant hosted private-R2 backend

**Status/date/writer:** BLOCKED AT PREFLIGHT / 2026-09-27 / primary agent.

**Observable result:** The exact Genesinova Supabase project receives the least-privilege private-R2
server secrets, required additive authority/schema chain and only the thirteen private-file Edge
Functions while every storage mode remains `legacy` and every R2 write flag remains `false`.
Disabled writes, denied access and legacy reads are then proved without copying or activating data.

**Start evidence:** Git HEAD `51d149a`; only user-owned `supabase/.temp/cli-latest` is dirty.
[068](068-hosted-backup-isolated-r2-rehearsal.md) retains a verified fresh backup and matching local
PostgreSQL 17 restore. Exact hosted target is `hievmwwctjjlhmssoxsu`. Supabase CLI 2.107.0 reports
the live migration ledger through `20260907210932` and only eight existing, unrelated Edge
Functions; none of the thirteen private-R2 slugs is deployed.

**Preflight stop:** The one-time Cloudflare token-result tab is no longer open and reloading its
success URL exposes no values, so the existing `genova-private-runtime` secret cannot be recovered.
Replacement requires revoking that token and creating a new bucket-only Object Read & Write token.
The live DB also lacks required additive migrations `20260516_assignment_review_audio.sql` and
`041–045`; restored-schema inspection confirms their review-audio columns and chat authority
objects are absent. Migration 060 explicitly refuses without 044/045 and the accepted local runners
apply all six prerequisites before 053–065. Neither token replacement nor these six extra hosted
migrations was named in the owner's just-approved 053–065 checkpoint, so no external write has
started pending expanded approval.

**Execution controls:** Never use `supabase db push --linked`: the local directory contains many
historical migrations absent from the hosted ledger and that command would exceed this brief.
Apply only the approved explicit files, each transactionally and in verified order, and record only
their version/name in `supabase_migrations.schema_migrations`. Keep `R2_TEST_ENDPOINT` and
`R2_ALLOW_INSECURE_LOOPBACK` absent. Do not print, log or commit credential values.

## Allowed hosted order after approval

1. Revoke the unrecoverable Cloudflare token and create one replacement named
   `genova-private-runtime`, Object Read & Write for `genova-private (EU)` only, no bucket-admin or
   all-bucket scope.
2. Set exact project secrets: provider account/bucket/key/secret/jurisdiction; storage modes
   `legacy`; all five R2 enable flags `false`.
3. Apply `20260516_assignment_review_audio.sql`, 041, 042, 043, 044, 045, then 053, 054, 055, 056,
   057, 058, 059, 060, 063 and dormant 065. No other migration file is allowed.
4. Deploy only: `repertoire-file`, `repertoire-upload`, `repertoire-file-lifecycle`,
   `assignment-file`, `assignment-upload`, `assignment-review-file`, `assignment-review-upload`,
   `repertoire-comment-file`, `repertoire-comment-upload`, `repertoire-comment-lifecycle`,
   `chat-media-file`, `chat-media-upload`, `chat-media-lifecycle`.
5. Verify secret names, schema/ledger, function versions and disabled/legacy/denied probes. Retain
   exact rollback order and stop on the first failed required check.

## Out of scope

- Real 063 inventory export, Google metadata/content, R2 objects, 062 copy, 064 preparation, 065
  activation invocation, storage-mode/client-flag cutover, Drive ACL/source change or deletion.
- GitHub push, Vercel/main promotion, mobile build/device/beta/store action.
- Any migration or Edge Function not explicitly listed above.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? | Status | Evidence / boundary |
|---|---|---|---|
| Exact target, backup and hosted preflight | yes | **PASS** | 2026-09-27 exact project/ledger/function inventory; 068 backup/restore retained. |
| Replacement least-privilege R2 credential | yes | BLOCKED | Needs explicit approval because the unrecoverable credential must be revoked and recreated. |
| Exact prerequisite + 053–065 hosted schema/ledger | yes | BLOCKED | Needs explicit approval for the six prerequisite migrations; no bulk push. |
| Dormant secrets and thirteen exact Edge Functions | yes | NOT RUN | `legacy` and all enables `false`; no client flag. |
| Disabled/legacy/denied hosted probes | yes | NOT RUN | No real data copy or activation. |
| Real object copy/cutover/client deployment | N/A | N/A | Forbidden in 069. |

Required FAIL, BLOCKED or NOT RUN prevents closure. Self-review is not independent review.
