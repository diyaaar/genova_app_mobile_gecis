# P3 — offline capacity audit, 8 October 2026

Status: **RESOURCE PREREQUISITE UNRESOLVED / ACTUAL RESTORE NOT RUN**. Entry
`main/9db0f0b`; sole primary writer; unrelated CLI marker preserved/excluded.
Previous goal turn made progress: actual protected snapshot/authenticated roundtrip,
current served metadata and cleanup. This continuation is not an owner answer to
the pending resource/destination choice. Exact snapshot/restore approval remains
valid; no duplicate key/method/export question, narrower goal or owner QA.

Read actual AGENTS/handoff/active/090/controls/guide/work cycle, full installed
Supabase+TypeSafe skills; TypeSafe live index read. Supabase changelog Markdown
reader failed; bounded64KiBfetch refused larger body. No API/schema implementation
based on unavailable docs; no paid inference or private data/log/key inspection.

## New source-backed resource evidence

[2October R1 execution](2026-10-02-hosted-revocation-r1-recovery-rehearsal.md) records
exact same pinned full image as the7October attempts:
`supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00`.
Dated measurements:54layers/1,010,225,613compressed bytes;3,249,138,688expanded tar
bytes;6GiBguest root failed,8GiBroot succeeded. [Machine resource record](090/2026-10-02-hosted-revocation-r1-evidence.json)
has **6,358,328KiB** actual VM allocation before removal (~6.06GiB).
This is dated different-VM evidence, **not fresh P3 restore/fidelity/peak acceptance**.
Do not equate expanded tar sum with live disk peak or change the pinned image.

It changes the next allocation budget: the previously proposed6GiBphysical cap is
below that observed older allocation. Although the new Alpine/classic layout is
smaller, its actual successful peak is unknown. Supersede the18GiBfree/6GiBproposal
with a **7.5GiBphysical cap,8GiBguest disk,≥20GiBmeasured hostfree** preflight target.
Additional reserves220MiBISOcache+512MiBhostswap+64MiBmetadata →8,679,424KiBtotal.
Conservative host floor10,485,760KiB; sum19,165,184KiB (~18.28GiB),20GiBtarget adds
margin. This is a bounded next budget, **not a guaranteed fit or known peak**.
One heavy process/monitor/stop/owned cleanup still required. Existing2.4GiBhelpers
and old records remain unchanged; future approved attempt must update source
budget/guest config and exclusive phase/ownership/evidence names, not overwrite
failed logs/generated config or reuse the damaged removed filesystem.

## Actual low-allocation inspection, 7October21:10–21:13UTC

| Target | Observed | Disposition |
|---|---|---|
| Host available filesystem space |14,192,272KiB (~13.53GiB); below new20GiBtarget | No runtime allocation |
| Default Lima |0instances, metadata directory12KiB | No live job/VM to wait on |
| Owned P3 mount/image/newISOcache | Removed by prior exact cleanup; mount/image absent rechecked | Do not recreate unchanged cap |
| Protected current backup directory |2,980KiB; raw contents not read | Retain; not a cleanup target |
| Prior P2 generated native build/ios/android/.next/coverage | Absent | Nothing material to reclaim |
| `spike/090-runtime` | Present, empty,0KiB | No retained binary/runtime copy |
| P2 owned simulator57F560F5-1EE1-4C28-A925-2D614E7CFFDE | Absent by source UUID/path and fresh device inventory | Prior deletion verified; not new reclaimed space |
| Existing iOS device inventory |22available devices, allShutdown | Existing simulator/user data preserved, no erase/delete/boot |
| Existing Android AVD directory |3,730,184KiB | Explicit prior preservation boundary, not disposable output |
| External physical disk list | Empty | No known separately scoped recovery destination |

An assumed Android executable path was absent; no reinstall or runtime test was
attempted. AVD filesystem allocation is evidence only of existing storage, not
emulator availability/testing. Prior root/mobile dependencies stay preserved as
required by the accepted P2 cleanup records; no global cache/user-data deletion.
No files removed or private backup copied/re-exported this turn. Host free changes
can come from other apps; do not attribute them to this read-only inspection.

## Acceptance and next action

| Criterion | Result |
|---|---|
| Inspect source-backed prior exact-image allocation and refine next budget | PASS dated provenance, not current runtime proof |
| Verify owned outputs/VM/simulator and protected/existing resource boundaries | PASS low-allocation inspection only |
| Sufficient current bounded offline allocation or new destination authority | NOT SATISFIED |
| Actual restored schema/owner/ACL/RLS/roles/full-row equality | NOT RUN; prevents original goal/P3 closure |
| Document links/redaction/diff and source consistency | Required scoped exit checks in090card |

Exit:7owned documents/183local link targets/0missing/0key-JWT-private-key patterns;
scoped whitespace/source-resource consistency PASS. Same-image dated allocation
identity matches source JSON; proposed8,679,424KiBreserve leaves12,292,096KiB at
20GiBhostfree, above10GiBfloor. Final fresh hostfree13,629,828KiB (~13GiB), still
insufficient; do not blame unrelated disk movement on read-only work. No source/
product/helper/platform tests rerun or current fidelity acceptance. CLI marker
excluded from the scoped090documentation commit.

Same resource blocker now persists for2consecutive goal turns, including the
approved operation turn; original full goal remains ACTIVE/INCOMPLETE. No threshold
for BLOCKED yet. New budget evidence is meaningful preparation; no authorized
large cleanup/different private destination or independent missing inventory work
remains ready. Do not rerun exports/unchanged tests/catalog/image pulls to seem busy.

Next: resolve the existing resource choice — enough measured free capacity here
without deleting preserved data/toolchains, or explicitly identified protected
destination/custody. Then same approved snapshot → exact compatible network-none
restore/selected fidelity (freshness rechecked before schema work) → prepared narrow
source convergence/full mixed clients/review/operation packet. No hosted writes,
deployment/distribution/owner manual QA. Whole090/R1/P3 remain OPEN/NO-GO.
Jev0calls/$0new inference; no new paid service or measured total hosting bill claim.

Current [checkpoint](../teslim-rehberi/checkpoint.md), [090](../briefs/090-private-file-ticket-revocation-contract.md),
[actual7October recovery](2026-10-07-p3-protected-recovery-execution.md).
