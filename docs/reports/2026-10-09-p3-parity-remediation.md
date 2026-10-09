# P3 — supported ACL parity diagnosis and recovery-source guard

9 October2026 Europe/Istanbul; entry main/5e55e04, primary sole writer.
Status: **DIAGNOSIS / SYNTHETIC ACL PROTOCOL PASS; FULL RECOVERY FAIL, NOT ACCEPTED**.
Original full goal ACTIVE/INCOMPLETE;090/R1/P3 remain OPEN. No hosted writes,
deployment, distribution, owner manual QA, private AI export or unchanged VM rebuild.

## Evidence and actual changes

[Machine diagnosis](090/2026-10-09-p3-parity-diagnosis.json) joins protected source
and saved actual canonical catalogs by object identity, not array position. Original
[real restore](2026-10-09-p3-real-restore-progress.md) and its strict failure stay
unchanged. Counts/fingerprints below are NOT a new current-row restore:

-98raw ACL discrepancies:46explicit/built-in-default representations (18schemas,
  28relations);52permission/option differences (49functions,1schema,2views).
  PostgreSQL17's actual `acldefault` agrees with all four modeled families:
  functions/schemas/tables/sequences. NULL is not empty ACL and is not the current
  ALTER DEFAULT PRIVILEGES configuration. Owner/options/grantors are retained.
-Prepared177explicit additive GRANT statements for these98objects. SQL remains
 0600inside the already approved private backup directory, never in Git/chat/Jev.
 No execution on restored/private/hosted data. Unexpected extra rights, changed
 owner/definition, delegated grant provenance, unsupported syntax, duplicate or
 missing identities cause refusal rather than blanket REVOKE/GRANT/CASCADE/catalog
 UPDATE. `pg_database_owner` is handled through the known offline database owner,
 not an invalid SET ROLE to that predefined role.
-All1,132captured surviving column fields/order match.46ordinal discrepancies occur
 in5tables with8internal position gaps. Physical equality remains FAIL: current
 `pg_attribute` has8dropped slots, but is not the7October snapshot. Do not infer
 historical dropped-slot fidelity or normalize away positions.
-One CHECK definition differs only in parenthesis tokens; all other tokens including
 literals match. This is not PostgreSQL AST/semantic proof; the criterion remains
 open. No general parenthesis-stripping comparator was introduced.
-Old encrypted source lacks direct `pg_publication_rel` roots/column lists/filters,
 publication-schema memberships, dropped-column positions and recorded comparison
 context. Expanded `pg_publication_tables` rows cannot establish root membership
 or future partition behavior. Today's separate metadata cannot fill that historical
 gap. Source guard now refuses this incompleteness **before any restore runtime
 access**, rather than spending another image pull on the same known failure.

Future held exports now capture the three missing catalog groups and explicit
public,extensions comparison context. These queries were actually executed via
the existing named correct-project READ-ONLY MCP (03:54:42Turkey9Oct):PG17.6/
supabase_read_only_user/read_onlyON;9direct publication memberships,0schema memberships,
8dropped positions. Full metadata output stays0600privately; public evidence contains
only counts/digests/default checks. This is query/model validation, NOT a current
backup, historical supplement, publication reconstruction or release acceptance.

## Actual synthetic PostgreSQL verification

[Runtime proof](090/2026-10-09-p3-acl-synthetic.json),03:57:48Turkey9Oct:
installed HomebrewPG17.11, exclusive0700acl-pg-* directory under approved private
RAJEJt parent, synthetic roles/function/schemas/table/view only. TCP listening disabled,
private0700Unix socket, no hosted connection or real backup/data read.5objects/
21GRANTs recreate exact owner/grantee/privilege/grant-option/grantor ACLs, including
NULL→explicit owner defaults, missing dashboard rights, owner grant options and
database-owner PUBLIC schema usage. PASS actual SQL, not just string-generation tests.
Actual allocated42,320KiB against256MiBreserve; cluster stopped and deleted after
last comparison. Final measured10,199,752KiBavailable; other apps may change it.
No existing PostgreSQL instance, VM, AVD/simulator, user cache/dependency or backup
was modified/deleted. This small isolated synthetic protocol check is explicitly
NOT a reduced substitute for the full pinned Supabase-image recovery.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Actual check / environment | Evidence / boundary |
|---|---|---|---|---|
| Source-anchored ACL/column/constraint diagnosis | Yes | PASS | Protected7Octsource vs saved9Octcanonical actual catalogs, identity joins | Machine diagnosis; no raw private content exported |
| New same-snapshot metadata/default queries actually work | Yes | PASS | Named correct-project MCP SELECT onPG17.6/read_onlyON |9roots/0schema memberships/8slots; not7Octhistorical data |
| Missing source metadata rejects before runtime | Yes | PASS negative | `node spike/090-p3-offline-restore.mjs --verify-source-only` exited1at source-metadata | No runtime allocated/accessed, original strict FAIL preserved |
| Scoped additive ACL behavior | Yes | PASS | `node spike/090-p3-acl-synthetic.mjs --verify-synthetic`, nativePG17.11 |5synthetic objects/21GRANTs, exact ACLs; actual177private GRANTs NOT RUN |
| Focused helper regression | Yes | PASS | `node --test spike/090-p3-*.test.mjs` |35tests; identity/extra rights/grantor/option/SQL injection/order/type/missing metadata negatives |
| Full current protected export/repaired isolated fidelity | Yes, original goal | FAIL / NOT RUN new successful run | Prior7Octrestore had full-row PASS but fidelity FAIL;9Octnative exportTCP timeout | No same-snapshot roots for old source; new export needed, no retries without causal change |
| Product/mobile/provider/hosted mutation/independent review | Original release gates; not changed-layer tests | NOT RUN | No production/shared/build/dependency/mobile change | No root/mobile/platform green claims; self-review only |
| Owned cleanup/source/document handoff | Yes | PASS runtime; document checks below | Own native cluster absent; default full VM remains removed | Small private source/diagnostics/SQL retained; no custodial scope change |

## Next single bounded action

Investigate the native database connection failure with non-mutating local transport/
route evidence; do not regenerate a full runtime until a causally justified native
connection and complete fresh held source can pass the new preflight. No password
reset, hosted network weakening, paid add-on, alternate real-row export transport or
new private destination is authorized by this report. If an alternative becomes
necessary, identify its exact data/custody/consistency contract and obtain any needed
authority first. Existing export/restore and disk-waiver permissions are preserved;
do not ask for them again or shift tests to the owner.

After complete source capture: direct publication root/schema/column/filter/owner
reconstruction, supported physical-slot/constraint fidelity remedy and exact ACL
replay, then ONE bounded full-image restore comparison. The synthetic protocol does
not resolve those remaining criteria. Full recovery and future source convergence/
mixed-client/security/cache/review/operation gates remain required. Source-only fixes
below do not close the original goal or justify P4activation/P5distribution.

Jev0calls/$0new inference; no new paid service. Supabase/Postgres skills influenced
the exact-privilege refusal rules and read-only/live-catalog verification; TypeSafe
keeps deterministic checks in code and private contents out of model inference.
No total-provider/network-cost claim. Original backup hashes/cutoff and exclusions
unchanged. Scope/diff self-reviewed, not independent review.

Primary references actually inspected: [PG17 ACL semantics](https://www.postgresql.org/docs/17/ddl-priv.html),
[acldefault](https://www.postgresql.org/docs/17/functions-info.html),
[direct publication membership](https://www.postgresql.org/docs/17/catalog-pg-publication-rel.html),
[publication schemas](https://www.postgresql.org/docs/17/catalog-pg-publication-namespace.html),
[dropped attributes](https://www.postgresql.org/docs/17/catalog-pg-attribute.html).
Supabase Markdown changelog was inaccessible through the web parser; normal HTML
fallback worked. [Realtime lock-down](https://supabase.com/changelog/realtime-schema-locked-down-against-modification)
and [extension pinning](https://supabase.com/changelog/extension-version-pinning-ignored)
reinforce the boundary: this local verification does not authorize managed-platform
DDL/version changes. TypeSafe index read; coding-agents Markdown fetch unavailable,
no integration/API change or model call attempted.

Exit checks:17owned source/evidence/doc files,177local link targets/0missing,
0key/JWT/private-key patterns,9MJSsyntax/2JSONparse PASS; all current helper evidence
pins and610frozen product pins unchanged. Original strict restoreFAIL/data-match
preserved; nativeacl-pg-* targets and full VM mount absent, private SQL/metadata0600.
35focused tests above; scoped whitespace PASS. CLI marker unrelated/excluded.
Source checkpoint6fd0fd2 (`090: guard recovery metadata and verify scoped ACL additions`);
evidence/current-pointer documentation committed separately. No push/deploy/hosted write.
