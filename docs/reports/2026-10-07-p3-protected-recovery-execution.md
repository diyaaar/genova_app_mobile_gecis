# P3 — approved protected recovery execution, 7 October 2026

Status: **CONSISTENT BACKUP PASS / ACTUAL RESTORE NOT RUN**. Same full inventory
goal remains ACTIVE / INCOMPLETE; this is progress, not a third-turn blocked audit,
not P3 acceptance. Entry `main/50a09d5`, primary sole writer. Unrelated
`supabase/.temp/cli-latest` preserved and excluded. No production source changed.

Owner explicitly answered the private Auth/application export and isolated local
restore question with approval. [Decision35 method](2026-10-07-p3-current-state-evidence-method.md)
and the operation are now both authorized. Do not ask for the same method, key or
data scope again. No hosted write, live restore, deployment, distribution, private
AI transmission, new paid service or owner manual QA was authorized/performed.

## Actual export and evidence boundary

[Generated redacted record](090/2026-10-07-p3-protected-recovery.json) is generated
by [finalizer](../../spike/090-p3-recovery-evidence.mjs), not edited by hand.
[Exporter](../../spike/090-p3-consistent-backup.mjs) verifies named correct-project
MCP read-only identity, then uses the explicitly approved native session-pooler
export exception. This is not a general alternative Supabase query connection.
Existing credential stays in memory; no credential/config/grant change.

Source transaction is REPEATABLE READ READ ONLY; dump and catalog/data digests
share the held exported snapshot. Cutoff **2026-10-07T20:14:20.369414Z**, completed
20:16:25.725Z. Coverage:24schemas/101data tables/2,879rows/17roles/22memberships;
225policies/162functions/118relations/510constraints/329indexes/62triggers/
15defaultACLs/6extensions/2publications/15publication memberships.

1,693,495plaintext bytes →1,693,531encrypted bytes, AES-256-GCM, with authenticated
decryption/SHA256 roundtrip verified twice. Private directory:
`/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt`,0700;
artifacts/key/logs0600. Key is in the same restricted directory: **not independent
key custody or offsite recovery**. Do not print/upload/decrypt files into agent
context. SQL/rows/per-table hashes/key never entered Git/chat/Jev. Old backups kept.

Includes Auth/public/genova/migration data and selected catalog/roles/membership,
Realtime/Vault/extension definitions. Excludes Vault values, Realtime payloads,
net queues/results, Storage metadata/object bytes, Drive/R2 bytes, role passwords
and external settings/secrets. Full managed-platform/provider recovery is not
claimed. Sequence state is non-MVCC; sorted complete JSONB row digests do not fix
that limitation. Counts and successful decryption **are not restore equality**.

## Failures, changed approaches and resource boundary

| Phase | Actual result / cause | Changed approach and remaining limit |
|---|---|---|
| Export1 | Metadata parser consumed a partial stdout chunk; no dump created | Wait for completed newline; synthetic partial-chunk regression |
| Export2 | Composite JSON spans multiple lines; no dump created | After2failures reassess; outerJSONB and complete-document scanner; escaped/multiline regression; next export succeeded |
| Initial VM bootstrap | Public Alpine ISO RAM-root filled installing Docker; optional startup probe timed out, same VM Running | Verify already formatted owned data disk; move public `/usr` there, no host/guest disk formatting |
| Public package repair | Nested `/usr/local` mount busy, then immediate info probe raced daemon startup | Documented lazy unmount preserves guest-agent handles; verify same daemon fresh, no blind VM restart |
| Full image layout1 | Capped physical volume pressure while extracting Nix layer; filesystem became read-only | Stop/delete only owned derived runtime; preserve backup/logs; one exact-image classic-store alternative |
| Full image layout2 | Classic Docker bootstrap PASS; same full image still hit capped volume pressure/read-only filesystem | STOP further allocation/rebuilds; no slimmer image, stripped owners/grants/extensions or fake fidelity |

Installed official pinned Alpine-Lima ARM64 ISO, oneCPU/512MiBguest, virtual4GiB
disk inside **2458MiBphysical capped APFS image**. Additional reserves220MiBISOcache,
512MiBhostswap,64MiBmetadata; projected and monitored host floor10,485,760KiB.
Both layouts used exact full
`supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00`.
Guest virtual space is not evidence of host-backed capacity. Last layout allocated
2,306,836KiB physical; guest reported 1,742,564KiB available while backing volume
had reached its cap. Host stayed above the10GiBfloor in both attempts.

No PG container was created; no private bytes entered the VM; actual isolated
SQL restore/role execution/schema+ACL+RLS+data equality **NOT RUN**. The strict
[restore helper](../../spike/090-p3-offline-restore.mjs) and its tests are source
preparation, not accepted runtime. Do not replay it against any hosted target or
existing database; extension/role seed and exact fidelity must be proved in the
new disposable network-none container before synthetic writers.

## Cleanup and fresh served identity

Final owned cleanup20:51:42.377Z: stopped/deleted own LimaVM, detached/removed only
own capped sparsebundle and newly-created exact URL ISOcache. Two verified failed
export directories contained only32Btaskkeys+emptylogs: removed after recording
failures. Successful encrypted snapshot/small logs retained. No user data, global
caches, other VM/device, old backups or toolchain purged. Last dependent finalizer
checks all runtime/cache paths absent; default Lima inventory0; free14,113,780KiB
(~13.46GiB). Removed generated runtime can be recreated from pinned sources; failed
keys contained no backup and are intentionally unrecoverable. Protected backup kept.

Fresh supported Chrome Computer Use on **Genesi Nova** profile/account
`genesinovachoir`, exact Vercel team/project overview, observed before20:54UTC7October:
production deployment **ApCrcavKPpHSdBzdpv8JvESEiKc5**, Ready, alias
`app.genesinovachoir.com`, branchmain, commit
**a13f696da8c731e9af2a2bce473d4f4ae4a81587**. Same as4October metadata, now freshly
observed; no source/runtime/HTTP revocation acceptance inferred from dashboard.
No rollback/push/deploy/settings/key-page action. Existing unrelated user tabs kept.

## Acceptance table

| Required criterion | Evidence | Result / boundary |
|---|---|---|
| Exact operation authority/project/read-only source | Owner approval, held snapshot identity, named MCP guard | PASS scoped export/offline preparation; no live write |
| Consistent protected logical dump + catalog/data fingerprints | Generated record, AES-GCM authenticated roundtrip/full dump completion | PASS selected coverage only |
| Exact managed extension-compatible offline target | Both capped full-image pulls failed; no container | FAIL runtime prerequisite; backup unchanged |
| Actual isolated restore + schema/owner/ACL/RLS/role/data equality | No restore executed | NOT RUN — prevents goal/P3 closure |
| Fresh served production metadata | Vercel correct-profile production card/source commit URL | PASS metadata only |
| Parser/stream/encryption/scope/comparison + inventory regressions |26focused Node tests;610source pins; exact P1/P3 regeneration | PASS local helper/source layer only |
| Generated runtime cleanup/private artifact permissions/diskfloor | Finalizer and cleanup records/absent paths | PASS; backup retained |
| Local document links, source syntax, secret-pattern check, diff | Final scoped exit checks in090card | Required before commit |
| Full Next/Auth/RLS/five-family mixed-client/cache/recovery/independent review | Existing full mapping/convergence contract, no execution this turn | NOT RUN; P3 release remains NO-GO |

No unchanged mobile/root/build tests rerun: production/config/dependencies unchanged;
new sources are recovery spike helpers. Focused tests never replace platform/hosted
acceptance. Self-review only; no independent approval or fidelity score substitute.
Jev0calls/**$0 new inference**; no new paid infrastructure. Network/local compute
cost not measured; do not claim total hosting bill is zero.

Scoped exit:19owned files/172local links/0missing/0key-JWT-private-key patterns;
9MJSsyntax/2JSONparse/shsyntax PASS;26focused tests PASS; P1/P3 regeneration and
610pins PASS; scoped diff whitespace PASS. First local link diagnostic used an
overescaped expression (0matches), rejected and corrected before acceptance.
Read-only project space inspection: `.next` absent, spike804KiB; existing root/mobile
dependencies1,621,064/7,480,568KiB **preserved**, not disposable cleanup targets.
No external physical disk currently listed. No additional known owned generated
output can supply the larger offline budget. Final hostfree13,947,784KiB remains
above10GiBfloor; free space can change through other apps, remeasure before resume.

## One next action and linked continuation

Resolve **offline capacity**, not connection/credential/approval. No further attempt
under unchanged2458MiBbacking cap. Proposed next bounded budget:6GiBphysical cap
+220MiBISOcache+512MiBswap+64MiBmetadata; require **at least18GiB measured free**
on the host to preserve10GiBfloor with margin. This is an allocation plan, **not a
proven image peak or guarantee**; new preflight/monitor/stop remain required. No
owner-data deletion is authorized. A different protected disk/location requires
exact destination/custody authority; do not move private backup implicitly.

After sufficient bounded capacity: same encrypted snapshot → full compatible
network-none container → exact roles/extensions/catalog/full-row equality, retaining
failures. If cutoff becomes stale for schema work, refresh under approved exact
scope; do not call an old snapshot current. Then prepared narrow hook/log/Auth
lifetime convergence + actual full Next/Auth/RLS old/new mixed clients, independent
review and exact DB→Edge→web→native operation packet. P4storage/P5installed beta/
P6full product/P7both stores remain dependent; no bulk-main promotion.

Sources: [090 work card](../briefs/090-private-file-ticket-revocation-contract.md),
[current checkpoint](../teslim-rehberi/checkpoint.md),
[convergence contract](2026-10-04-p3-convergence-contract-audit.md),
[release authority](../private-r2-release-runbook.md).
