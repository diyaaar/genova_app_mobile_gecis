# 089 — real profile review acceptance evidence

29 September 2026. [Brief](../../briefs/089-real-profile-review-web-acceptance.md).
Scope `6db0144`, product/test `a8df751`. Main-agent self-review, not independent review.
Small redacted [browser summary](browser-summary.json); no passwords, tokens, schema dump,
screenshots or raw authenticated traces retained in the repository.

## Executed evidence

| Layer | Result | Evidence / exact boundary |
|---|---|---|
| Local real runtime | PASS | Installed Chrome 154.0.8037.58, Next 15.5.25, actual Auth/REST/RLS/Edge/PG17; five task services, schema-only source export, migrations 078/082/087/088; no response mocks |
| Early connected slice | PASS | Actual shared-member form submit → pending request → own chef UI approval → persisted member and history, before expanded cases |
| Two-choir actual UI | PASS | Fresh synthetic A/B invitations accepted in UI, shared member switches via real repertoire switcher; own profiles, changes, approval/rejection reason/history and referenced school/department/song names |
| Tenant-scoped reads | PASS | Actual browser JWT/RLS request ID sets A-only and B-only, not simulated transports |
| Browser authenticated HTTP refusals | PASS | Foreign object 404, non-chef 403, finalized decision 409, foreign school 400; all member/request rows unchanged |
| Same-session stale browser actions | PASS | Form/chef action held before dispatch; another tab selects B, then A submit 409/review 404; no data mutation |
| Permission/member changes | PASS | Task DB fixture removes chef role/inactivates actor or target before dispatch; review 403, inactive submission 403, inactive-target approval 400; rejection remains possible and does not update member |
| Review reference/state regressions | PASS | Six component cases: own A/B labels and exact referenced IDs, immediate old-scope clearing, late request/catalog publication refusal, missing/failed lookup, failed request clearing, corrupt prototype-like IDs |
| Focused final regressions | PASS | `pnpm exec vitest run 'app/(main)/profil/degisiklikler/page.test.tsx' 'app/(main)/profil/duzenle/tenant-options.test.tsx' app/api/profile-change-requests/review/route.test.ts app/api/profile-change-requests/submit/route.test.ts` — 4 suites/72 tests |
| Full final web gate | PASS | `bash supabase/test-support/089_web_runtime_runner.sh check` invokes `pnpm check`: lint/typecheck, 103 suites/1042 tests, service-worker syntax and production build |
| Source preservation | PASS | Original `genova_068_test_restore` six-table data digest unchanged after preparation/browser and immediately before service stop; not an all-source digest or hosted backup |
| Exact owned cleanup | PASS | Five services/volumes stopped no-backup; Next/tunnel stopped; VM/profile/data disk/Docker context/runtime absent, no 54391/54392/31089 listeners, default context and original restore retained |
| Links/diff/redaction/record separation | PASS | 59 scoped local Markdown targets, summary whitelist, final diff check and secret-pattern scan; product/test vs planning/evidence commits kept separate |
| Hosted/push/mail/device/file/release | NOT RUN | Outside this checkpoint's authority; no production readiness inference |

Browser command: `bash supabase/test-support/089_web_runtime_runner.sh browser` exits 0 with
early connected approval, own A/B UI/history/scoped reads and refusal matrix PASS. Actual UI
clicks and direct authenticated browser HTTP probes above are distinct evidence layers.
These role/session/member cases are pre-dispatch; prior 088 observed PG lock/concurrency
matrices were not rerun and are not relabeled browser in-flight concurrency acceptance.

## Defect and causal repairs

Actual old-build `inspect-labels` probe confirms RED: approved history displays own reference
UUIDs but cannot display own school name. Production source had hardcoded original-choir
school/department maps and a mutable module-global repertoire map. Bounded UI fix loads only
referenced RLS catalog rows, keeps labels page-local and guards asynchronous publication by
member/scope generation. Missing/deleted catalog names remain raw IDs, not invented labels.
`Object.hasOwn` rejects prototype-like reference values; all three review/history card families
consume the same local label context. No DB/API/native review semantics changed here.

Prepare first refused a missing generated config before service changes; generator now copies
the known unlinked config before validating it. Expanded run first searched for a choir switcher
on the profile route where TopBar is intentionally absent; test now switches through the actual
repertoire UI. Single-use invitation fixtures were reset only after exact 5-user/2-choir guards,
using the same VM/images. Initial focused parse failure from the removed birth-date branch
opener was repaired before green checks. Final self-review added the corrupt-reference guard
and sixth regression, then reran the full gate to 1042 (earlier 1041 is superseded).

## Resources / retained boundaries

Initial free 33,647,696 KiB (~32.1 GiB). Official arm64 compressed-image metadata 968,360,929
bytes (~0.90 GiB); root/data caps 8/8 GiB, RAM 4 GiB/2 CPUs, budget envelope 20.25 GiB leaves
projected >10 GiB. Latest allocated task root/data before deletion 1,142,064/3,883,744 KiB.
Exact task VM/profile/data removed via `colima delete genova089 --data --force`; generated
secret-bearing `spike/089-runtime` removed permanently. Owned build 534,956 KiB, coverage
348 KiB and check log are recoverable at exact `genova-089-20260929-*` Trash names. Final
available 33,076,684 KiB (~31.5 GiB); Trash retains disk blocks. No global cache/restore/dependency
purge. Unrelated `supabase/.temp/cli-latest` remains unstaged.

Only new `example.invalid` synthetic confirmed accounts; manual catalogs/readiness metadata
and extra chef role are fixture setup, not accepted operator administration or real email signup.
Browser external destinations denied, sibling callback triggers disabled only in the task DB,
VAPID keys explicitly blank for build/server; push is NOT RUN. VM-internal local defaults are
not a production-hardened stack. Six source tables are guarded, not all source objects.
Other direct/service writers, catalog administration, files, native/device and commercial
lifecycle remain open; WF-013 step 5 stays PARTIAL. Future shared hosted release requires
current backup/restore, sibling impact and DB 087→088 before web; git revert is not data recovery.
