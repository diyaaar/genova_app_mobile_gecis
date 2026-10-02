# 090 — R1 fresh recovery and compatibility rehearsal

Date: 2 October 2026. Entry main/63b36d7; one writer, no delegation.
**Recovery/SQL checkpoint PASS; R1/client compatibility and live release remain NO-GO.**
This is not hosted090, a beta, full provider recovery or an independent review.
[Redacted machine evidence](090/2026-10-02-hosted-revocation-r1-evidence.json) pins the nine
owned source/test files and measured layers; private SQL/row contents remain outside Git.
The previous goal turn made progress: a fresh snapshot, actual restore, negative SQL
tests and a reproduced production-source bypass changed the next release action.

## Authority and the owner's later scope correction

Owner approved protected read-only DB export and bounded isolated rehearsal, renewed the
same Jev key for2October and allowed analysis spending. No hosted DDL/DML, Edge deployment,
secret/password change, real-user revocation, email, provider activation, push or CI occurred.
The designated Supabase MCP worked for R0 and early R1 metadata. After context continuation
no Supabase tools were in the actual tool inventory; the existing approved, exact-linked,
read-only psql path captured only later role/extension metadata. No other project's connector.

During this checkpoint the owner clarified: **do not change the sibling website; it no
longer uses this database.** This supersedes the old shared-site delivery assumption.
No sibling file/config/deployment/DB change was made. Earlier exact-source/catalog and
offline synthetic sibling observations below remain historical; they are NOT a new website
remediation task or a Genova release blocker. Disconnection is owner-reported, not an
independently verified current production endpoint test. Preserve existing DB objects;
do not infer permission to drop the old website tables or weaken tenant policies.

## Protected fresh backup and declared recovery scope

Exact project `hievmwwctjjlhmssoxsu`, linked session pooler, PG17.6.1.063/server17.6.
Snapshot holder used REPEATABLE READ READ ONLY and `pg_export_snapshot`; pg_dump and
all101 selected base-table counts used the SAME held snapshot. Export completed
13:58:30UTC /16:58:30Turkey. Native pg_dump17.11; restored backend17.6.

Private directory: `/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo`
(0700), every artifact0600. `database.sql`: **1,623,637B**,
SHA256 `9b73831cda2809273e3f671031b35ab990707c3613f2c3ffb30ddba143f15cd2`.
23 schemas: Auth/public/migrations/custom genova schemas plus extensions/Vault definitions.
Owners, grants, RLS, function bodies and Auth sessions retained. No backup body or user row
was copied into Git/chat/Jev. The later non-secret cluster catalog was captured14:24:19UTC,
so role metadata is NOT claimed to share the earlier row snapshot.

Excluded: Vault values/all Vault table data; net queued requests/responses; Storage metadata
and object bytes; Drive/R2 bytes; role passwords/validity/settings and external provider
configuration/secrets. Public/custom application rows are included, not silently stripped.
This is declared application/Auth logical recovery, NOT full managed-platform/PITR recovery.
[Supabase backup documentation](https://supabase.com/docs/guides/platform/backups) also
distinguishes database recovery from Storage object-byte recovery. Refresh this backup if
release timing or source/catalog drift makes the recovery cutoff unsuitable.

## Actual isolated restore, not an edited-away security contract

Official arm64 `supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00`.
One task-owned Lima VM,2CPU/2GiB RAM; container `genova090r1-db`, networkNONE, no host mounts,
no published ports. Private dump piped only into this offline backend. Baseline
`genova_090_r1_restore`; migrations/fixtures on separate `genova_090_r1_test` clone.
Original068 restore/backup/dependencies preserved; native068 DB presence freshly verified.

The selected-schema dump does not include CREATE EXTENSION dependency statements. An
explicit five-extension seed supplements, but DOES NOT modify, the original backup; plpgsql
comes from template0. No `--no-owner`, `--no-privileges`, missing-object skip or RLS bypass.
First restore matched counts but three extension owners differed: image supautils promotes
privileged extension installation to supabase_admin. This was a fidelity FAIL, not accepted.
Session SET of that configuration failed because its context is SIGHUP. A rollback-only
owner probe plus actual pg_settings established the cause. ONLY offline ALTER SYSTEM/reload
disabled the installer override; transactional bootstrap temporarily elevated local postgres
for canonical extension installation, then reverted it BEFORE application rows/tests.
The same protected dump was restored again; initial owner-mismatch record retained.

Final six extension versions AND owners match the fresh source catalog. A separate explicit
local role seed repaired four missing/different roles and three missing memberships.
All32 non-secret role attribute records and22 membership records match, including admin/
inherit/set options and grantors. Passwords/provider role configurations remain excluded.
No live superuser/role/config alteration occurred; offline bootstrap is not a claim that
the whole local platform configuration equals managed production.

Selected catalog comparison: seven helper bodies/owners/ACL/security-definer/search_path,
18 relations/columns/types/RLS/ACL, sibling historical view/policies and selected session
constraints match dated R0 metadata. regclass output used the same public/extension search
path. PostgreSQL NULL default owner ACLs were expanded with acldefault; ACL entry order was
sorted without removing rights, grant options or grantors. Parser/search_path/default-ACL
comparison failures were retained; they were harness issues, not hidden permission changes.
Catalog observations were earlier on2October, not the data snapshot itself.

## Measured acceptance

| Criterion / expected behavior | Required? / scope | Status | Actual evidence | Limit |
|---|---|---|---|---|
| Exact project, protected consistent fresh logical export | yes | PASS | 090_hosted_recovery.mjs; 23schemas/101counts/0600/hash; export-errors.log0B | Declared exclusions above |
| Actual restore with owner/ACL/RLS and selected security dependencies | yes | PASS | Corrected restore14:24:21UTC; role parity14:26:05UTC; catalog parity14:27:07UTC | Selected catalog/extension/role metadata; not full provider platform |
| Source restore unchanged after tests | yes | PASS | Final101 baseline counts match snapshot;0 Vault secrets/0 network queue/0 task choir rows; final-preservation.json | Counts, not a full row-by-row checksum |
| Existing-target refusal | yes | PASS | Explicit restore command exits1 REFUSED existing target before any write | Fixed task target only |
| 078 inactive-member defect red→green | yes | PASS | Fresh baseline fails exact inactive-selection assertion; exact078 then passes | Direct SQL claims, not Auth-service HTTP |
| Multi-choir selection and picker contract | yes | PASS | Fresh005/012 on repaired role setup | 005 now creates its own A choir/chef role; no real choir seed dependency |
| 090 five-family actor/session/choir/visibility/role/session-removal boundaries | yes | PASS | Exact090 migration and090_private_file_ticket_authority.sql on repaired fresh clone | Direct SQL service/RLS fixtures; no hosted transport |
| Actual090 RPC invocation as service_role and execution refusal as anon/authenticated | yes | NOT RUN | Existing090 fixture checks has_function_privilege, then executes family logic as owner; no three-role invocation switch | ACL predicates PASS, not an actual service-caller/HTTP acceptance; include fresh execution in next isolated package |
| Exact production legacy Next GET/HEAD satisfies next-request revocation | yes | FAIL | Actual a13f696 route/token bodies, synthetic key/upstream: GET200,HEAD200,provider2,current authority0 | Source execution with injected upstream, NOT a live-user revocation/exploit |
| Exact proposed compatible old-web renewal/cache/PDF/audio flows | yes | NOT RUN | A safe compatible legacy gateway/transition must first close the reproduced bypass | Historical local newer clients do not substitute |
| Sibling contact/collab/subscriber INSERT plus private SELECT refusal | Historical investigation; no longer production gate | PASS | Rollback-only baseline and078090 clone; exact00be086 request shapes | No UI/PostgREST/email delivery |
| Sibling anonymous public directory works | Historical observation; owner excludes website changes | FAIL (historical) | Synthetic visible member count0 before and after078090 | Existing behavior, not078 regression; no longer a Genova blocker |
| Sibling remediation/deploy/current endpoint acceptance | N/A — owner excludes detached website | N/A | Explicit user correction during this checkpoint | No independent disconnection verification claimed |
| Focused guard/source tests | yes | PASS | node --test:3/3; seven helper node syntax checks; scoped ESLint through full gate | Standalone .mjs tests are not included by Vitest |
| Current complete repository gate | yes | PASS | pnpm check exit0: lint/types,111files/1130tests,coverage thresholds,SW syntax,Next build | Not E2E/liveDB/Edge/native/device/CI |
| Hosted SQL/Edge acceptance, actual released client/phone | Later separate authority | NOT RUN | No deployment, real-user/object test or distribution | Whole090/beta remain open |
| Owned runtime/build cleanup | yes | PASS | VM/container removed17:30:53; task .next/coverage removed after gate; final22,949,412KiB | Generated outputs recoverable by rebuilding; protected backup retained |
| Redaction/links/diff/scoped source checkpoint | yes | PASS | 387 local links/7 anchors,9 source hashes,22-file secret scan,JSON/status contracts,diff check; source93ca043 | Primary self-review; documentation checkpoint recorded in Git |

## Critical old-web finding and source-pinned next package

`app/api/drive-file/[id]/route.ts` and `lib/server/drive-file-token.ts` at both a13f696 AND
current local HEAD are byte-identical; hashes respectively
`e8c14929995000ddeb915fc9253778b25f3bead236cfb94cae462325b39b6891` and
`3e672993a2e709fec27d285d9372ffe391b66ffc9d08f170fa9cb55adc20fd5b`.
Issuance authorizes once, signs actorless file metadata/expiry, then GET/HEAD checks only
signature/expiry before upstream reads. The existing `/api/drive-file-token` POST uses1hour
TTL. Five proposed Edge endpoint updates cannot fix a different unchanged Next endpoint.
Three green reproduction tests and the full green root gate DO NOT make this contract PASS.

Next local measurable result: old legacy URLs refuse BEFORE upstream on both GET/HEAD,
while an authorized old `{driveFileId}` POST can obtain a safe actor/session/choir-bound
reader with the existing `{url,expiresAt}` response shape. Preserve repertoire plus legacy
assignment/review/comment Drive or Storage flows: those may lack immutable private versions,
so blindly routing every legacy identifier into the existing version-only readers is NOT
an accepted compatible fix. Do not invent a version, silently activate R2 or drop these flows.
Centralize new server authority in Edge/shared SQL; existing Next compatibility route may be
an adapter, not a new parallel authorization service. New function/schema requirements mean
a newly reviewed manifest, NOT implicit extension of the currently pinned five-reader packet.

## Prioritized gated execution plan

1. **Local legacy compatibility closure first.** Bounded090 follow-up card/paths; red→green
   signature-only regression; real current identity/session and file-currentness checks;
   old GET/HEAD refusal/provider0, safe renewal, role removal, A→B, revoked Auth session,
   hidden/withdrawn file and upstream-error cases. Exact old web request/response contract,
   cached tab/WebView and valid legacy non-versioned files must remain usable safely.
2. **Prepare the exact publication candidate.** Pin only required server/compatibility files,
   source/lockfile/migration closure and release gates. Refresh live catalog/deploy identity and
   backup when needed. No bulk320-commit/849-file main push. Owner excludes sibling website
   changes; retained legacy website DB objects are not a cleanup authorization.
3. **Only after prerequisites, separately execute reviewed DB→Edge→web transition.** Exact
   SQL/ledger strategy and complete function closure; stop on first failure. Unsupported old
   clients require an explicitly planned update/maintenance window, never a v1 grace that
   contradicts decision32. No global guarantee during a partial rollout. Keep providers/writers
   and all activation flags unchanged. Existing078 rollback reopens a defect; repair forward
   with strict readers or an approved fail-closed read outage, not automatic v1 restoration.
4. **Hosted synthetic acceptance then Android beta path.** Separate task-only accounts/choirs/
   objects, exact cleanup, five-family HTTP/RLS/GET/HEAD/range and provider-attribution evidence,
   actual preview/released client and phone checks. Then remaining077 copies/reconciliation/
   activation/Drive withdrawal under their own authority. Recovery/security release is not beta.

## Resource/failure record and costs

Entry19,824,444KiB free;10GiBfloor. Official image compressed1,010,225,613B; measured54-layer
expanded tar3,249,138,688B. First pull FAIL because6GiB guest root could not hold base plus
compressed/unpacked image. Range-only gzip-trailer measurement justified ONLY task VM disk6→8GiB,
physical cap7.5GiB/watermark12,000,000KiB unchanged. Removed only hash-verified task Lima base
cache (recoverable download), not global caches; observed actual free increase about495,000KiB,
not its misleading du allocation. Second pull PASS; observed low13,482,796KiB abovefloor.
No blind second image/version or broad environment rebuild. Final VM allocated6,358,328KiB.
After its last dependent SQL check, exact task container/VM/disk were removed; no mounts/context
or sibling state changed. Post-removal22,950,380KiB; original068 database still present.
Root gate ran only after this cleanup. Task-generated .next477932KiB and coverage352KiB
were then removed; actual free22,949,412KiB. After owner#33's automatic-replay scope change,
fresh pnpm check again passed111files/1130tests/coverage/SW/build (17:47 onward); node3/3 and
changed-helper syntax passed. Final generated outputs removed, no Lima instance/socket;
actual final free22,771,852KiB at17:51:21. Pre-existing tsconfig.tsbuildinfo was preserved.
No task runtime remains; private copies can be regenerated from the retained protected
backup with a new measured resource preflight. No secure-erasure claim.

TypeSafe skill influenced method selection and semantic claim-to-evidence checks, not access
authority. [Recovery-method call](090/2026-10-02-jev-r1-recovery-method.json):996input/183output,
475ms,4/4 engineer labels. [Release-claims call](090/2026-10-02-jev-r1-release-claims.json):
1335input/253output,567ms,6/6 labels; explicit layer/old-endpoint/website-regression/email/
excluded-recovery controls plus next-fix selection. All packets redacted; no key or private
rows/body sent or persisted. Advisory self-labeled checks, not independent engineering review.
[Citation-check pattern](https://docs.typesafe.ai/cookbooks/citation_check) informed decomposition.
R1 total: **2calls,2331input/436output,$0.000097902 estimated**, using
[documented Jev input pricing](https://docs.typesafe.ai/models) $0.042/M and free outputs.
Not a provider invoice, full-day/Codex cost or proof that all infrastructure costs are zero.

The active goal/090 stay open for the required old-client FAIL/NOT RUN rows. Do not mark
R1 release-ready merely because backup/SQL/root checks pass. No website fix is pending.
After the owner's correction, role-rehearsal source no longer automatically repeats the
historical sibling fixture. Previous execution evidence is retained; final source gates
are rerun for this scoped replay change. Actual three-role090 invocation remains an explicit
coverage gap, not an ACL inference promoted to execution.

## Checkpoint handoff

Code/test checkpoint `93ca0430e72520cd47697a9caa6756d6a4d79832`; nine owned paths only.
Documentation/decision#33/English handoff/index evidence committed separately; no push.
387 local links/7 anchors, nine source hashes and22-file exact-sensitive-value/key-format
scan PASS; JSON/status/ownership/diff checks PASS. Sibling checkout untouched; unrelated
supabase/.temp/cli-latest excluded. Ready action: bounded local legacy reader/POST compatibility
closure plus real three-role invocation, before refreshing the exact live approval package.
