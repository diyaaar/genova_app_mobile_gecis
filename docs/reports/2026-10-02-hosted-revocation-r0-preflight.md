# 090 — authorized R0 metadata preflight

Subsequent [connected R0 completion](2026-10-02-hosted-revocation-r0-connected-preflight.md)
resolves the catalog/version/sibling-alias gaps below after owner connection. This earlier
PARTIAL record and its scope deviation remain historical; no later gate or live release closed.

Date: 2 October 2026; primary agent, sole writer. Entry main/cafd336.
Result: **PARTIAL / NO-GO for release**. The bounded assessment is delivered; the
required R0 release gate and whole090 remain open. This is not hosted revocation acceptance.
Source proposal remains [bdf34b8 manifest](090/2026-10-02-hosted-revocation-source-manifest.json)
and [approval packet](2026-10-02-hosted-revocation-approval-packet.md).
Machine-readable selected observations: [metadata](090/2026-10-02-hosted-revocation-r0-metadata.json).

## Authority and method

Owner approved the preceding R0-only request: correct Genesinova project metadata,
no user rows, file bodies, secret values, mutations, backup export or deployment.
Read AGENTS, handoff/active/current090, transition guide/work cycle/template,
delivery execution controls, MIGRATION/decisions28–32 and the pinned packet.
Supabase skill used to enforce target identity and metadata boundaries. No subagent,
runtime/build/installation, account/login/config change, provider call, CI trigger or push.
Only unrelated `supabase/.temp/cli-latest` was dirty at entry and remains excluded.
Entry free19,859,888KiB; document-only peak/environment/cleanup targets N/A.

The available generic Supabase MCP `get_project(id=hievmwwctjjlhmssoxsu)` returned
permission denied (-32600). No SQL or another-project fallback was attempted. This
does not prove an absent project, wrong account, or absent schema. The existing signed-in
Chrome Supabase session independently verified organization genesinovachoir, exact project
ref, main Production and account genesinovachoir. Read-only dashboard metadata navigation
was then used; no SQL Editor, Auth users, Table Editor, Storage bodies, keys, invocation
logs, function test, save, upgrade, restart or deploy action was used.

An initial secrets-table extraction displayed SHA256 digests of credentials as well as
flags. These were metadata, not secret values, but exceeded the intended digest allowlist.
No credential digest was persisted in these records. Subsequent extraction selected only
secret names/update labels and the eight explicitly non-secret flags. Future extraction
must apply that allowlist before returning output, not after it.

## Fresh observations (12:58–13:18 UTC)

- Exact project healthy, Free/nano, Tokyo ap-northeast-1. Dashboard service versions:
  Postgres17.6.1.063, Auth2.197.0, PostgREST14.5. No version upgrade attempted.
- Enabled extension UI rows: pgcrypto1.3/extensions, pg_stat_statements1.11/extensions,
  pg_net0.19.5/public, uuid-ossp1.1/extensions, plpgsql1.0/pg_catalog. These are dashboard
  observations, not a complete server/custom-operator catalog or restore compatibility proof.
- Migration UI shows the same sixteen recent entries as historical069, ending at
  `20260925083611 private_r2_activation_065`. Neither exact078 nor090 version/name is
  present in the unfiltered ledger. UI `Inserted at (UTC)` labels are not asserted as
  the actual deployment time; historical069 applied these on27September.
- Unfiltered public function table contains55 rows, including shared current-member
  helpers and dormant053–065 RPCs; `private_file_ticket_authorized_090` is absent from
  that displayed table. No statement about the entire hidden/custom-schema catalog.
  Opening/cancelling current_choir_id's definition yielded only a partial editor buffer;
  it is insufficient to accept078 helper semantics. No function was invoked or saved.
- All five exact reader slugs exist in the21-function Edge list, displayed updated
  `5 days ago`. Each Settings switch `Verify JWT with legacy secret` has
  aria-checked=false. No deploy version number/source hash is exposed in the observed
  list/settings; historical version1 is **not** promoted to current evidence.
- Three storage-mode digests equal local SHA256(`legacy`); five R2-write flag digests
  equal SHA256(`false`). R2 configuration names are present; test endpoint and insecure
  loopback names are absent from the displayed custom-secret list. No credential value
  read/revealed/entered, no provider permission/bucket/body verification or flag change.
- Live Git `ls-remote` and exact-repository GitHub main API agree on
  a13f696da8c731e9af2a2bce473d4f4ae4a81587. Vercel signed-in genova-app production
  is Ready for that same full SHA and app.genesinovachoir.com. GitHub deployment6316967607
  has vercel[bot] success. Existing source-pin gap320commits/849files remains a
  source comparison, not authority to bulk push. A newer Dependabot preview is visible;
  it was not reviewed, deployed by this task, or used as the release candidate.
- Sibling exact remote genesinovachoir/genesinovachoir main is
  00be08678b0fc597b082e3e6255d6abef2e849e8; GitHub production deployment6664487073
  has vercel[bot] success. This is GitHub provider status metadata, not fresh proof of
  the sibling's current Vercel production alias or shared-view/RLS independence.
  Its dirty local checkout was not edited or staged. Vercel showed a2FA setup prompt;
  no setup, skip, security-setting or account action was taken.
- Supabase overview says `Last backup: No backups`. This dashboard label does not
  negate retained external068 logical backup/restore evidence and is not fresh R1 recovery.

## Evidence matrix

| Criterion | Required for R0 release gate? | Status | Date / method / limit |
|---|---|---|---|
| Correct project identity | Yes | PASS | 2Oct signed-in dashboard exact project/org/account; MCP denied, not misidentified |
| Server versions / enabled extension metadata | Yes | PASS | 2Oct General / Extensions UI; complete SQL/custom-operator catalog still unrun |
| Exact migration ledger comparison | Yes | PASS | 2Oct unfiltered migration UI;078/090 not present |
| Public090 authority name observation | Yes | PASS | 2Oct55-row public UI; exact authority not displayed; not full catalog proof |
| Full helper definitions, grants/ACL, shared views/policies, custom operators | Yes | NOT RUN | Required designated MCP catalog access unavailable; partial UI definition is insufficient |
| Five reader presence and gateway JWT flags | Yes | PASS | 2Oct each exact slug Settings switch false; no configuration changed |
| Five deployment IDs/versions and source identity | Yes | NOT RUN | UI list/settings only expose relative update label; no management API version evidence |
| Secret names / eight non-secret flags | Yes | PASS | 2Oct selected metadata, local digest comparison; initial digest scope overread recorded above |
| Exact app GitHub/Vercel production revision | Yes | PASS | 2Oct ls-remote/GitHub deployment and Vercel Ready matcha13f696; no product smoke test |
| Sibling current provider alias / shared DB impact | Yes | NOT RUN | GitHub success metadata only; no complete catalog/preview smoke acceptance |
| R1 fresh backup/restore and old-client rehearsal | Later gate | NOT RUN | No backup export, restore or client/runtime authorized here |
| R2–R5 mutations, live isolation, clients/phone/provider | Later gates | NOT RUN | No release/provider/physical-device scope |
| Record links / source-pin hashes / JSON / redaction / diff / ownership | Assessment delivery | PASS | Local doc checks recorded in090 work card; primary self-review, not independent review |

## Engineering decision and next bounded action

**NO-GO.** Current observations do not show the proposed090 authority installed, and
required catalog/ACL/deployment identity/sibling evidence is incomplete. The observations
are sufficient to establish the release gap, not to characterize every current live access
path or claim an exploited data leak. Gateway false alone is not an authorization failure;
the handlers must enforce Auth/tenant authority and current deployment identity is still unknown.

Next: restore the **designated Genesinova read-only metadata connector** or provide an
equally approved exact-project metadata mechanism, then finish the existing R0 catalog/ACL,
five version IDs and sibling provider check. Do not create a token, widen permissions,
change account/configuration or switch project without concrete authority. No need to
repeat already accepted local native tests or rebuild the cleaned environment.

Only after R0 passes, obtain separate R1 authority for a fresh protected logical backup,
isolated restore, exact078→090 rehearsal, both-site impact and actual old-client compatibility.
R1 is not implied by this approval; no DB/Edge release until R0/R1/compatibility pass and
exact R2 scope is approved. Source-pin changes require a renewed manifest comparison.
Rollback of this assessment is a scoped docs revert; live state was not changed.
New Jev inference cost: $0; total Codex/account billing unavailable.

Local record validation:397 local links/6 anchors, JSON/status contract,15 pinned source
hashes/byte counts and eight digest mappings PASS; nine-file credential-format scan0hits,
git diff --check PASS. Self-review confirmed no code/lockfile/other-project changes and
retained required NOT RUN criteria. Final free19,800,168KiB; no runtime/build retained.
Scoped documentation checkpoint only, unrelated CLI marker excluded.
