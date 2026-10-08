# P3 — actual isolated restore after the disk-floor waiver

Date9October2026 (Europe/Istanbul), entry main/1959ede, sole primary writer.
Status: **DATA RESTORATION PASS / FULL RECOVERY FIDELITY FAIL, NOT ACCEPTED**.
Original full inventory goal ACTIVE/INCOMPLETE; P3/090/R1 remain OPEN. No hosted
writes, deployment, distribution, real-user login/invites or owner manual QA.

## Actual execution and failure boundaries

Owner explicitly waived the10GiBfree-space floor for continuing this recovery.
Scoped policy6.5GiBphysical/8GiBguest/512MiBRAM/oneCPU; emergencyfloor512MiB,
640MiBstop; cache220MiB/swap512MiB/metadata64MiB reserved. Initial free8,416,988KiB;
actual volume preflight8,354,892KiB, projected724,044KiB after full reserve.
No smaller database/extension set or role/data stripping. Same full pinned image
`supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00`.
New20261009image/log/ownership names preserve prior2.4GiBfailures. Serialized classic
Docker pull completed00:17:02Turkey9Oct; post-pull physical allocation4,781,476KiB.
Container actually running, pg_isready PASS, networkNONE/mounts0/publishedports0.

Fresh export under SAME approved private parent failed before snapshot/data creation:
native session-pooler TCP connect timeout. Failed directorygenova-090-p3-kroZk3
contains only32Btaskkey/373Bprivate error/97Bstage record. No new backup PASS.
Independent public TCP probes of session pooler and primary endpoint timed out.
Correct-profile Supabase dashboard Healthy/Tokyo/session endpoint still matches
approved URL. No wrong-password inference, key rotation, network-policy change,
paid IPv4 add-on or unapproved transport/data-export fallback. Protected7Octdump kept.

Therefore actual restore uses the **owner-approved7October snapshot**, cutoff
2026-10-07T20:14:20.369414Z, not fresh9October application-row recovery evidence.
First actual restore aborted transaction at session SET of
`supautils.privileged_extensions`: its context is SIGHUP. Error retained privately.
Matched prior R1 causal evidence; only proven-empty failed local database reset.
Only owned offline ALTER SYSTEM/reload disables installer override, verified on
fresh connections. Temporary local postgresSUPERUSER for canonical extension
owners is reverted before application rows. No production settings/roles changed.

Second actual restore completed: **101tables/2,879rows, every complete canonical
JSONB table fingerprint matches**, not counts alone.17role attributes/22Postgres
role memberships/6extension versions+owners/62triggers/15defaultACLs match.
These are database-role memberships, not a new choir-membership authorization test.
[Generated proof](090/2026-10-09-p3-restoration-progress.json) pins helpers/cutoff.

## Strict gate remains failed — no cosmetic PASS

Original comparison failed functions/schemas/relations/policies/constraints/columns/
indexes/publications/publicationTables. Read-only diagnostics under explicit
public,extensions search path reproduce matching225policy expressions/allindexes/
function signatures: those differences were formatter context, not changed rows.
Original strict failure is retained, not rewritten as acceptance.

Remaining paired-row differences:49functionACLs/19schemaACLs/30relationACLs;
one constraint definition;46column ordinal positions. Some ACLs differ in NULL/
explicit representation or ordering, but privilege differences also exist: don't
declare all equivalent without supported grant/owner/option/grantor verification.
Physical dropped-column slots are a candidate ordinal cause, NOT accepted as an
exception yet. Source2publications/15expanded memberships restored0/0: selected-
schema dump alone lacks complete publication reconstruction. A zero paired-row
diagnostic count when actual rows are absent is NOT equality; counts and strict
missing-group failures remain authoritative. Full fidelity is **FAIL**.

| Required criterion | Actual evidence | Verdict |
|---|---|---|
| Compatible full offline runtime/isolation | Exact image/pg_isready/networkNONE/mount0/port0 | PASS local environment |
| Backup bytes and all101table row fingerprints | Protected7Octartifact + actual restore comparisons | PASS for7Octcutoff only |
|17roles/22memberships/6extensions/triggers/defaultACLs | Strict captured catalog comparisons | PASS selected metadata, not Auth/tenant runtime |
| All schema/ACL/constraints/columns/publications | Actual mismatches above | FAIL — original full goal remains incomplete |
| Fresh9Octprotected backup | Native connect timeout/no dump produced | NOT RUN successfully; old snapshot never relabeled |
| Current served/applied/deployed inventory drift |9Octnamed correct-project read-only8projectionsMATCH/21Edge; correct-profile VercelReady | PASS selected metadata only |
| Full Next/Auth/RLS/mixed-client/provider/platform/independent review | Prepared existing map, not executed here | NOT RUN release gates |
| Owned cleanup/source/document gates | Below and090exit checks | Required for handoff, not fidelity acceptance |

Fresh [9Oct metadata](090/2026-10-09-p3-current-state-preflight.json): same68ledger/
15presentNULLsource statements/10absent candidate IDs; all8captured projections
match4Oct. Not same-transaction full schema or row proof. Fresh correct Genesinova
Chrome/account VercelReady productionApCrcavKPpHSdBzdpv8JvESEiKc5,
main/a13f696da8c731e9af2a2bce473d4f4ae4a81587, app.genesinovachoir.com.
Browser ID changed: old2is now logged-out IAB, no sign-in/credential entry;
fresh inventory selects correct Genesi NovaChrome4. No deployment/settings change.

## Cleanup, scope and next bounded action

After last dependent read-only comparison, owned VM/container/6.5GiBimage/newISOcache
removed02:33:59Turkey9Oct. Private7Octencrypted backup/source hashes and small raw
failure/diagnostic records retained0700/0600, never uploaded to Git/Jev/chat. No
user files/AVD/CoreSimulator/global caches/toolchains/old backups removed. Generated
runtime is reproducible, not a retained second database. Final measured free
10,338,612KiB (~9.86GiB); other apps affected usage, no exact reclaimed-byte claim.
Default10GiB applies outside the scoped ongoing recovery exception.

Next one outcome: close **actual logical recovery parity**, not another UI feature
or unchanged rebuild. Verify canonical owner/grantee/privilege/option/grantor ACL
semantics, exact constraint cause and surviving column order; capture/reconstruct
publication root/column/filter/owner semantics without assuming expanded membership
rows prove root equivalence. Keep raw strict discrepancies and negative tests;
no direct catalog hacks, broad grants/RLS relaxation or silent dropped criteria.
Then one bounded repaired restore comparison. Fresh native-export connectivity is
separate: do not rotate credentials or alter hosted network security to hide a TCP
failure. Future schema operation still requires a current accepted recovery point.

Actual11focused checks passed during execution; final focused/source/document gates
in090card. Production source/610pins unchanged; root/mobile/platform tests not rerun
for recovery-spike-only work. Self-review, not independent review. Jev0calls/$0new
inference; no new paid service; existing total provider/network cost not measured.

Final gates:27focused tests/610pins/P1+P3exact regeneration PASS;23owned files/
330local link targets/0missing/0key-JWT-private-key patterns/11MJSsyntax/3JSONparse/
scoped whitespace and strict-failure/cleanup consistency PASS. Only recovery
spike/support and agent records changed; unrelated CLI marker remains unstaged.
