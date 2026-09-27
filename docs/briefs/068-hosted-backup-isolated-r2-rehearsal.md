# 068 — Fresh hosted backup and isolated R2 schema rehearsal

**Status/date/writer:** COMPLETE / 2026-09-27 / primary agent.

**Observable result:** A fresh read-only logical backup of the exact Genesinova Supabase project is
restored into a dedicated local PostgreSQL 17 database with matching schema/table counts, then the
053–065 private-R2 chain passes its existing forward/refusal/down/reapply checks without changing
the live project.

**Delivery focus:** Complete release-runbook stage 2 and establish the recovery/rehearsal evidence
required before any hosted schema, Edge, secret or copy write. The next user-visible outcome is a
verified dormant backend package ready for a separately approved hosted-write checkpoint.

**Start evidence:** Git HEAD `5e9ac3e`; only user-owned `supabase/.temp/cli-latest` is dirty.
`supabase projects list` resolves the linked project to `hievmwwctjjlhmssoxsu`, organization
`urpuzollmvvdkayavnhd`, `ACTIVE_HEALTHY`, PostgreSQL `17.6.1.063`. The linked session-pooler URL
uses the same project. Local PostgreSQL 17.11 is running on `127.0.0.1:5432`; the matching 17.11
client tools exist. About 38,237,128 KiB is free. A read-only connection reached the exact pooler
but correctly stopped because no database password was stored. The owner later approved a database
password reset after the remembered value failed authentication. The replacement is present only as
`SUPABASE_DB_PASSWORD` in ignored local `.env.local`, which is mode 0600; the value is absent from
Git, logs and this record. R2 bucket/token identity is accepted in 067; one-time token values remain
only on the open Cloudflare result page.

**Completed work card:** (1) guarded runner `dcbbbcb` plus the observed pooler-identity-format repair
`c550d81`; (2) exact hosted read, logical dump and isolated restore; (3) source/restore equality and
061/063/065 rehearsal against the retained restore. Every required row below passes and sensitive
artifacts remain outside the repository with restricted permissions.

**Resources:** One plain logical dump and one retained local PostgreSQL 17 restore, expected below
50 MiB and below 500 MiB peak. Private artifacts live under
`/Users/alidiyarduran/Documents/Codex/2026-09-26/genova-r2-checkpoint-068/` (0700 directory; 0600
files). The local DB is `genova_068_test_restore`. No Docker, simulator, mobile build, root build or
provider download. Preserve at least 10 GiB free. Retain the backup/restore through the following
hosted-write checkpoint; remove only with explicit cleanup authority.

**Allowed paths/modules:**

- `supabase/test-support/068_hosted_backup_restore.sh` — guarded read-only hosted dump and isolated
  local restore/count verification.
- This brief plus concise runbook/handoff/active/progress/plan indexes after acceptance.
- External private artifact directory and the dedicated local database named above.

**Sources/current pattern:** [transition guide](../gecis-rehberi.md),
[release runbook](../private-r2-release-runbook.md), [010 backup evidence](010-008-canli-yayin-ve-kabul.md),
`supabase/test-support/restore-prep.sql`, and accepted 061/063/065 runners.

## Transition start check

- Read `AGENTS.md`, handoff, active context, this brief template, transition guide, work cycle,
  bounded execution controls, runbook, 010 backup/restore evidence and 061/063/065 runners.
- One result: fresh logical recovery evidence plus the existing R2 schema chain on an isolated
  restore. Backend only; no native/WebView/product behavior changes.
- Preserve exact project `hievmwwctjjlhmssoxsu`, live read-only access, current role attributes,
  every included `auth`/`public`/`genova_*`/`supabase_migrations` schema and the existing R2
  migration/refusal order. Existing web/mobile clients are not deployed or pointed at the restore.
- Single writer. User explicitly approved the hosted read, backup, isolated restore and local
  rehearsal, then separately approved the necessary database-password reset and ignored local-env
  storage. The value was generated locally, entered through the provider UI by the owner and never
  printed.
- Required checks: shell syntax; wrong-target/no-password/existing-target refusal; exact project/
  Postgres check; nonempty 0600 dump + SHA-256; clean PostgreSQL 17 restore; included schema and
  table-count equality; 061/063/065 runners; source unchanged; external-artifact permissions,
  links and `git diff --check`.
- Rollback/cleanup: live source has no write path. On failure, the runner removes only a newly
  created `genova_068_test_restore`; it never drops another DB. Retain a successful restore and
  backup for the next checkpoint. Never print or persist the database password.

## Out of scope

- Live migration/SQL, Supabase secrets, Edge deploy, R2 credential transfer, real inventory,
  Google metadata/content, R2 objects, activation/cutover, web/main promotion, device or store.
- Storage/Drive object backup. The logical dump is DB/Auth recovery evidence only.
- Any further Supabase password or credential change. The post-start password reset needed to
  recover the approved read path is recorded above; it grants no authority for another rotation.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/evidence | Limit |
|---|---|---|---|---|
| Exact hosted project and read-only connection preflight | yes | **PASS** | 2026-09-27 exact pooler query returned database `postgres`, user `postgres`, PostgreSQL `17.6`, non-recovery; target remained `hievmwwctjjlhmssoxsu`. | Authentication was the only live credential action; queries/dump were read-only. |
| Guarded operator runner and refusal checks | yes | **PASS** | 2026-09-27 `bash -n`, no-TTY, wrong-target and existing-target guards; live run accepted only the observed PostgreSQL 17 pooler identity. Script commits `dcbbbcb`, `c550d81`. | No secret entered output or Git. |
| Fresh nonempty private dump and hash | yes | **PASS** | 2026-09-27 `genova_full_20260927T102619Z.sql`: 1,317,637 bytes, 13,154 lines, SHA-256 `9bb2291b307b617df1a98f745bb6d115a10af1d80b8978d93c36054d78897601`; directory 0700, dump/summary 0600. | DB/Auth logical scope only; no Storage/Drive/R2 object bytes. |
| Clean local PostgreSQL 17 restore and exact source/restore equality | yes | **PASS** | 2026-09-27 retained `genova_068_test_restore` on local PostgreSQL 17.11; 7 included schemas and 74 base-table counts match the stable post-dump hosted counts. | Local isolated target only. |
| 053–065 rehearsal and refusal/down/reapply evidence | yes | **PASS** | 2026-09-27 runners 061, 063 and 065 pass forward/refusal/down/reapply on disposable clones; each reports source unchanged and target removed. | Synthetic fixtures existed only in disposable clones. |
| Live DB/schema/function/secret/object/deployment change | N/A — forbidden | N/A | No live schema/data/function/secret/R2 object/deployment action occurred. The separately approved database-password reset changed authentication only. | Hosted-write stage remains separately gated. |

Required FAIL or NOT RUN keeps 068 open. Self-review is not independent review.
