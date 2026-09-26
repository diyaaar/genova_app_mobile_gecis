# 067 — Cloudflare R2 provider activation and private bucket

**Status/date/writer:** ACCEPTED / 2026-09-26 / primary agent.

**Observable result:** The verified Genesinova Cloudflare account has an active R2 subscription and
one empty private Standard bucket named `genova-private`, permanently restricted to the European
Union jurisdiction.

**Delivery focus:** Close provider activation, jurisdiction, bucket and least-privilege token
creation for release gate 3. Secure placement of the one-time token values remains a separate
hosted-write step after the backup/restore gate. No Supabase, Google Drive, object, schema,
function, flag or deployment action is permitted by this brief.

**Start evidence:** Candidate `e459bdd` already passed GitHub CI and Vercel Preview. The signed-in
Chrome profile was `genesinova.choir@gmail.com`; Cloudflare account ID was
`b642dee69121237ba20cc1a1bb50f1c5`. R2 was not active and the dashboard required a usage-based R2
subscription with $0 due now, $0 fixed monthly charge and charges only beyond the displayed monthly
allowances. The owner confirmed the transaction at action time and completed the provider's private
payment/billing form directly.

## Transition start check

- Read `AGENTS.md`, handoff, active context, the release runbook, gate 3 and current Cloudflare R2
  documentation. One result: activate R2 and create the approved empty bucket.
- Exact target: account `b642dee69121237ba20cc1a1bb50f1c5`, bucket `genova-private`,
  jurisdiction `eu`, default storage class `Standard`, no public access.
- Do not create a token, upload an object, enable a public URL/custom domain, add CORS/lifecycle/
  lock/event rules, change another provider, or touch Supabase/Google/production.
- Stop on another account, another jurisdiction, a nonzero fixed charge, an unexpected plan, a
  request for credentials outside the provider form or a name collision.
- Rollback is not automatic: subscription cancellation or bucket deletion is a destructive/
  financial action requiring separate authority. The accepted bucket is empty.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? | Status | Evidence and limit |
|---|---|---|---|
| Correct account and owner-approved R2 subscription | yes | **PASS** | 2026-09-26 signed-in Cloudflare dashboard showed `Genesinova.choir@gmail.com's Account`, account ID `b642dee69121237ba20cc1a1bb50f1c5`; owner confirmed the $0 fixed/$0 due-now usage subscription and completed billing privately. |
| Exact EU Standard bucket exists | yes | **PASS** | Bucket page and Settings show name `genova-private`, created 26 Sep 2026, jurisdiction `European Union (EU)`, default class `Standard`; EU S3 endpoint is present. |
| Bucket remains private and empty | yes | **PASS** | Overview showed Public Access `Disabled`, 0 B, Class A `0`, Class B `0`; Settings showed no custom domain and public development URL disabled. |
| Current provider billing observation | yes | **PASS** | R2 overview showed current billable usage `$0.00`, total storage `0 B`, Class A/B `0`. This is not proof that total recurring infrastructure is $0 or <=$5/month. |
| Bucket-scoped Object Read & Write token | yes | **PASS** | 2026-09-26 owner confirmed at action time; account token `genova-private-runtime` has Object Read & Write only for `genova-private (EU)`, no bucket-admin/all-bucket scope, provider-default `Forever` TTL and no IP filter. One-time values remain only on the open provider result screen and are not recorded here. |
| Secure credential placement and operational verification | no — later hosted-write gate | **NOT RUN** | Access key and secret were not copied, stored locally, transmitted to Supabase or tested. Keep the one-time provider screen open until the separately authorized destination is ready. |
| Hosted DB/functions/secrets, real inventory/copy/cutover, production/device/store | no — outside this result | **NOT RUN** | No such action or inference. |

Required FAIL or NOT RUN criteria prevent closure only when marked required. Self-review is not
independent review.

## Result and boundary

Cloudflare R2 is active and the empty private target is fixed as
`b642dee69121237ba20cc1a1bb50f1c5 / eu / genova-private / Standard`. Public development access and
custom domains remain disabled. Token `genova-private-runtime` now exists with the exact bucket-only
object scope. Its one-time values remain untransmitted on the open provider result page; do not
navigate away until the separately authorized secure destination is ready. Hosted backup/read,
secret placement and cost measurement remain separate stages. No secret value belongs in Git,
chat or this brief.

Current Cloudflare sources used for the provider contract:
[bucket creation](https://developers.cloudflare.com/r2/buckets/create-buckets/),
[data location](https://developers.cloudflare.com/r2/reference/data-location/) and
[storage classes](https://developers.cloudflare.com/r2/buckets/storage-classes/).
