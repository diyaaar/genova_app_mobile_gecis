# 066 — Node 22 private R2 CLI warning isolation

**Status/date/writer:** ACCEPTED / 2026-09-25 / primary agent. Product/test commit `e459bdd`.

**Observable result:** The two private R2 operator entrypoint tests retain machine-readable JSON
stderr on the repository CI's Node 22.13.1 without suppressing application failures or changing
copy/manifest behavior.

**Delivery focus:** Unblock the exact release candidate's required Quality and security CI job.
Native checks and 30/30 browser regression already pass at `12a236f`; this brief repairs only the
two Node-version-specific CLI boundary failures. No provider, database, file copy or deployment is
part of this package.

**Start evidence:** GitHub Actions run `36143657251` checked out exact SHA `12a236f`. Native product
checks passed and browser regression passed 30/30. Root lint and typecheck passed, then coverage
reported 795/797 passing. The only failures were `scripts/private-r2-copy.test.ts:449` and
`scripts/private-r2-manifest.test.ts:418`: Node 22's experimental type-stripping warning preceded
the expected JSON stderr. Local Node is 24.13.1 and did not reproduce that warning.

**Current work card:** Add the narrow Node `ExperimentalWarning` suppression to both TypeScript CLI
entrypoints and their direct child-process invocations; run focused tests plus root `pnpm check`;
push the fast-forward repair to the approved candidate branch and require all CI jobs to pass.

**Resources:** Existing dependencies only; no download, database, browser, simulator or provider.
One root test/build process at a time; about 38 GiB free. Remove only generated `.next`/coverage
owned by this repair after evidence is captured.

## Transition start check

- Read `AGENTS.md`, handoff, active context, WF-011, the failing CI log, affected source/tests and
  delivery controls. One result: Node 22 machine-readable CLI boundary compatibility.
- Allowed product/test files: `scripts/private-r2-copy.ts`, `scripts/private-r2-manifest.ts`,
  `scripts/private-r2-copy.test.ts`, `scripts/private-r2-manifest.test.ts`. This brief and current
  handoff/status records may be updated separately.
- Preserve every manifest/copy validation, approval, credential, path, cap and fail-closed rule.
  Do not silence arbitrary child-process stderr or weaken JSON assertions.
- Local scoped fix/test/commit and the already approved candidate-branch CI/preview retry are in
  scope. `main`, production, provider, hosted DB, credentials, real objects and device remain out.
- Required checks: focused two-file tests, root `pnpm check`, exact diff review, candidate CI's
  three jobs, Vercel preview result, links and `git diff --check`.
- Rollback: revert the product/test commit; no external data rollback exists because no data action
  is permitted. Preserve `supabase/.temp/cli-latest` unstaged.

## Planned change

Use Node's code-specific `--disable-warning=ExperimentalWarning` alongside the existing
`--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` in the two shebangs and direct test invocations.
This removes only the runtime's experimental type-stripping notice from the operator protocol;
script validation errors must remain the sole JSON stderr value and are still asserted exactly.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? | Status | Evidence and limit |
|---|---|---|---|
| Both real CLI entrypoints preserve exact JSON refusal output under the supported invocation | yes | **PASS** | 2026-09-25 local Node 24.13.1, focused 2 files / 62 tests. The direct entrypoint refusals still parse to the exact expected JSON; no validation or approval assertion changed. |
| Existing copy/manifest behavior and root gate remain compatible | yes | **PASS** | 2026-09-25 `pnpm check`: lint, typecheck, 90 files / 797 tests, service-worker syntax and Next production build passed. |
| Exact candidate CI quality, browser and native jobs pass | yes | **PASS** | GitHub Actions run `36144388175`, exact SHA `e459bdd`: Quality and security passed `pnpm check`, production audit and artifact upload; Browser regression passed 30/30; Native product checks passed typecheck, tests and bundle. |
| Vercel preview reaches Ready for the repaired candidate | yes | **PASS** | Signed-in Vercel inspection: `genova-b8ltr4l2o-genesi-nova-choirs-projects.vercel.app`, Preview, Ready, source `e459bdd`. Production remains `a13f696`. |
| Hosted/provider/data/device/store behavior | no — outside repair | NOT RUN | No such action or inference. |

Required FAIL or NOT RUN keeps 066 open. Self-review is not independent review.

## Result and boundary

The first exact-candidate run `36143657251` is retained as FAIL evidence: Node 22 prepended its
experimental type-stripping warning and caused only the two strict JSON protocol tests to fail
(795/797 passed); native and 30/30 browser jobs passed. Commit `e459bdd` suppresses only that named
runtime warning in the two operator entrypoints/direct invocations. The replacement run
`36144388175` and matching Vercel preview are fully green. Branch
`codex/release-2026-09-25` now points to `e459bdd`; GitHub `main` and Vercel production remain
unchanged at `a13f696`. No pull request, production deployment, provider, DB, credential, real
object, device or store action occurred.
Local `.next` (465 MiB) and coverage output were removed after verification; about 38 GiB remained
free. The unrelated `supabase/.temp/cli-latest` marker stayed unstaged.
