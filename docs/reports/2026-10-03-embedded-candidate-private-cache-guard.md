# Embedded candidate private-cache guard

3 October 2026. Bounded local goal: PASS. Source `9d2b6bd`; entry `958d140`.
Whole090 / beta / live release remain OPEN / NO-GO. Sole writer; self-review only.
No hosted, real-user, provider, sibling-site, push, CI, deployment, hardware, credential
or dependency operation. No Jev inference or data export; cost $0.

## Reproduced blocker and minimal repair

Before actual Android consent/share acceptance, inspect the real chorister file link →
useProtectedDriveFileUrl → offline/cache path, rather than reusing the native inspection
callback as proof. Exact7cd8d46 already has an access-only web ticket loader, but its
offline and catalog modules lack the embedded exclusion present on current main.

Executed exact pinned modules and the actual pinned embedded runtime (esbuild, no copied
guard or mocked embedded flag). Synthetic browser storage/ServiceWorker ports provide a
rejection-oriented control: after activateEmbeddedRuntime(), original catalog write/read
succeeds and cacheRuntimeDriveFile reaches worker registration. This is FAIL_REPRODUCED
at the source/module boundary, NOT a claim of observed production leakage or actual
Android ServiceWorker availability. Main already has this guard; do not call it a new
main-production fix.

The new factory preserves immutable parent7cd8d46 and borrows only accepted predicates
from d298229. Two generated files change:

- offline.ts: existing isRepertoireOfflineSupported also rejects embedded mode; all
  worker entry points already call this predicate before registration/message/download.
- cache.ts: existing canUsePersistentCatalogCache guards read/write/update. Ordinary
  browser behavior and scoped cleanup stay intact. Parent inline catalog types/schema/
  role functions are retained; no whole modern catalog/native graph transplant.

The patched actual modules return false for offline support, never read/write the
catalog or register/message a worker after embedded activation, and reject all four
worker entry points tested. Existing A metadata is not exposed through read; updates
cannot persist a replacement. Cleanup still removes owned catalog entries/four private
Cache Storage names and preserves an unrelated preference. Browser read/write/update
and registration behavior remain supported. Synthetic registration deliberately throws
after recording the call; no real worker/provider transfer is claimed.

## Acceptance

| Criterion / expected behavior | Required? / N/A reason | Status | Date / revision / environment | Evidence / limits |
|---|---|---|---|---|
| Original embedded persistence/worker reachability reproduced | Yes | PASS |3 Oct / exact7cd8d46 modules | Negative control FAIL_REPRODUCED; synthetic browser ports |
| Embedded catalog/offline refuses before side effects | Yes | PASS | Actual generated modules + actual embedded signal | Reads0/writes0/registers0/messages0; four worker operations reject |
| Browser behavior and scoped cleanup retained | Yes | PASS | Actual modules / synthetic storage | Browser catalog roundtrip/update; cleanup4 private caches; unrelated preference retained |
| Two-file delta and raw parent source retention | Yes | PASS |426 files / fixed Git refs |424 byte-identical, including binary login.png; no schema transplant |
| Focused negative/positive/factory regressions | Yes | PASS | Fresh Node execution |5 new +5 existing Android-harness regressions =10/10 |
| Candidate lint/typecheck/coverage/SW syntax/build | Yes | PASS | Fresh generated candidate |41 files406 tests; production Next build exit0; coverage thresholds passed |
| Root full check | Yes | PASS | Fresh source / pnpm check |114 files1178 tests, lint/typecheck/coverage/SW syntax/build exit0 |
| Source pins/diff/links/cleanup/separate commits | Yes | PASS | Local checkpoint |9d2b6bd + paired docs commit; final source hashes verified before owned cleanup |
| Fresh RN tests/runtime | N/A: no native source/dependency change in this cache-only goal | N/A | Previous Android record remains historical | No new453-test or native compatibility PASS claimed |
| Actual Android consent/share/visual and grouped iOS | Deferred required integration gate | NOT RUN | Next checkpoint | Module/build evidence is not a native WebView interaction |
| Hosted RLS/provider/release/independent review | Required at relevant later release gates | NOT RUN | No authority exercised | Self-review is not independent review |

Commands: node --test for090_candidate_native_cache and090_android_candidate; factory
--materialize-owned / --build-owned; installed root eslint/tsc/vitest --coverage/SW
executables in candidate cwd; root pnpm check. Candidate pnpm script invocation initially
tried automatic install against a dependency symlink and refused non-TTY purge before
removal. Verified dependencies remained present; used the exact installed executables.
No purge approval, reinstall, configuration change or waived test. Build was not repeated
after successful unchanged evidence. Root check's normal environment is distinct from
the candidate's synthetic no-dotenv build environment.

## Reproducible source identity

Factory: supabase/test-support/090_candidate_native_cache.mjs at9d2b6bd, SHA256
`d35a05454e32b5d7663f9fddbea517b99bbdd781a5513422a2cba9acb5ac0407`.
Focused test SHA256 `ffe1503fa8c599630608217171ae5bcac23b457db36316ebff8e920c99aca6cd`.
Parent: `7cd8d460c68465055049dbf30192f7f5478bcf64`;
accepted guard source: `d298229939bafaf881273e485eb2174c19e67fd0`.
Ordered426-row output pins JSON SHA256:
`1a1ae4d8736bd12c0561f13c7b048b5dd19ba800e3b527da94a52e90e58d9ca9`.
Generated cache.ts SHA256 `644a4d6b36a3d8fd0998afe07de9dd01a39c67ae5d51104d3455576e90987d51`;
offline.ts SHA256 `550530147077293404a673fa47bee0a335f6e9895fda0b5385a1d494ea0580d6`.
All426 output hashes and deterministic regeneration verified after build/tests; committed
factory/tests hashes verified before deletion. This is a reproducible factory-derived
candidate, not a newly deployed or independent Git candidate commit. Historical browser/
embedded candidate refs/manifests and Android v4 evidence are unchanged.

## Closure and next action

Entry21053228KiB free; observed20151636KiB during root build; final21049960KiB (~20.1GiB).
Peak budget2GiB, above10GiB floor. Removed exact owned native-cache-candidate476520KiB,
root .next and coverage after final checks. No emulator/VM/runtime/service/APK or download
started; dependencies/AVD/caches/backup/source/lockfiles/user data preserved. The candidate
and its small generated manifest can be regenerated from fixed refs/factory; keep essential
identity here rather than retaining another binary build. CLI marker remains unrelated.

Next: use this guarded candidate (not unpatched7cd8d46) for a bounded actual Android
WebView file request→consent/cancel/download/share/clear and visual/navigation/tenant-clear
acceptance, then grouped sensitive iOS. Current minimum-profile candidate still contains
browser-session-only mutations on other permanent pages; audit/backport actual API paths
before treating it as a full mobile web candidate. No general migration or release is
accepted by the cache guard. Independent review/fresh hosted preflight/R1/forward repair
and remaining beta/product gates stay open.
