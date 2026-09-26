# 068 — Fresh hosted backup and isolated R2 schema rehearsal

**Status/date/writer:** IN PROGRESS / 2026-09-26 / primary agent.

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
but correctly stopped because no database password is stored. R2 bucket/token identity is accepted
in 067; one-time token values remain only on the open Cloudflare result page.

**Current work card:** (1) create and validate one guarded interactive backup/restore runner;
(2) the owner enters the database password directly into the visible terminal, never chat/log/Git;
(3) verify restore equality and run the 061/063/065 local rehearsal runners. Exit only when every
required row below passes and sensitive artifacts remain outside the repository with mode 0600.

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
  rehearsal. The user enters the DB password directly into a hidden terminal prompt.
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
- Resetting the Supabase database password or creating another credential.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date/environment/evidence | Limit |
|---|---|---|---|---|
| Exact hosted project and read-only connection preflight | yes | **PASS** | 2026-09-26 CLI/account metadata and session pooler resolve `hievmwwctjjlhmssoxsu`, `ACTIVE_HEALTHY`, PostgreSQL 17.6; no-password probe reached the pooler and stopped before query execution. | No live SQL result yet. |
| Guarded operator runner and refusal checks | yes | NOT RUN | Shell syntax plus no-password/wrong target/existing target tests required. | No secret may enter logs. |
| Fresh nonempty private dump and hash | yes | NOT RUN | Exact schema set, byte/line count, SHA-256, 0600 mode required. | DB/Auth only; no object bytes. |
| Clean local PostgreSQL 17 restore and exact source/restore equality | yes | NOT RUN | Included schemas and every base-table count must match. | Local isolated target only. |
| 053–065 rehearsal and refusal/down/reapply evidence | yes | NOT RUN | Existing 061, 063 and 065 runners against the fresh restore. | Synthetic runner fixtures may be added only to disposable clones. |
| Live DB/schema/function/secret/object/deployment change | N/A — forbidden | N/A | No such action permitted. | Any need for a live write stops this checkpoint. |

Required FAIL or NOT RUN keeps 068 open. Self-review is not independent review.
