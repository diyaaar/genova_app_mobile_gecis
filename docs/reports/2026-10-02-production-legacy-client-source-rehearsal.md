# 090 — exact production legacy-client source rehearsal

2 October 2026. Entry a00b358; test checkpoint **356a348**, sole writer.
This advances approved R1 old-client rehearsal without starting the unapproved new
production-source package. Sibling website/live providers/DB/clients were not changed.
No recreated runtime, download, inference, real session or real file. Existing CLI marker preserved.

## Exact source and harness boundary

Production pin a13f696da8c731e9af2a2bce473d4f4ae4a81587, previously verified in R0.
This is not a new current Vercel lookup. Sources read with git show:

| Source | SHA256 | Execution scope |
|---|---|---|
| lib/drive-file-url.ts | e7b5076a5e18690acac88134bb46769dda05977af37e9606537ba30ae7e3f1f7 | Whole actual URL-loader module, transpiled in a Node vm JavaScript context; no OS virtual machine |
| components/repertuvar/RepertoireWorkspace.tsx | ffd8167209db2942108c7bb7a8aba346a395a9a102149bc80672c03c874b100e | Actual async audioFiles.map callback selected uniquely by TypeScript AST, not a handwritten mirror |

Test source `supabase/test-support/090_legacy_client_recovery.test.mjs`, SHA256
484742fdb0522501b4d924c3e3c62ad0682e8111726a3d25478e6cd96a027f41.
Synthetic Auth session, clock and POST responses; offline branch explicitly false. No network
fetch escapes the injected `/api/drive-file-token` adapter. The resource401 is injected by
the test; it is NOT an executed server/React/browser/PDF/audio-player response path.
This distinction prevents the cache-unit result being overstated as an entire-client proof.

## Measured behavior and effect on the release plan

| Criterion / expected behavior | Required R1? | Result | Evidence / limit |
|---|---|---|---|
| Cached loader automatically renews after old resource401 | yes, compatible-client requirement | FAIL at loader layer | Recalling the actual loader returns the same URL; only1POST. The loader has no resource-status feedback. Full browser recovery remains NOT RUN |
| Same-user new Auth session cannot reuse prior loader cache | yes, isolation transition | FAIL at loader layer | Session B gets A's old URL with no newPOST; explicit clear then POSTs B. Not full koro-switch UI behavior |
| Explicit cache clear permits authorized renewal | yes, useful compatibility primitive | PASS | Clear triggers secondPOST/newURL with unchanged old-shaped request/response |
| Time-expiry renewal works | yes, preserved existing behavior | PASS | Cache retains at expiry minus30001ms; renews at expiry minus29999ms |
| Denied online authorization has no raw audio fallback | yes, fail-closed application path | FAIL at actual callback layer | Actual loader POST403 throws; actual extracted callback returns drive_download_link as source |
| Raw fallback is accessible in production/plays real audio | investigative boundary | NOT RUN | No Drive ACL/provider/render/playback test, and no claim of an exploited leak |
| Complete old cached tab/WebView/PDF/audio/server candidate | required later | NOT RUN | New production-source package/transition still requires owner scope approval |
| Focused tests/source gates | yes for this source probe | PASS | New4/4; combined standalone7/7, syntax and scoped ESLint exit0, diff check |

The four passing tests are reproductions of these defects plus positive controls, not four
security fixes. Both real-source modules remain unchanged. Provider requests0 in the callback
harness means no real provider was used; it does NOT prove a deployed denied playback would
make zero provider attempts after choosing that raw source.

The current local component is different: protected repertoire URL + online authorization
probe, catch→null, no raw direct-link fallback in this callback. This read-only source observation
does not accept the current entire component for release: its full dependencies, selected-track
branches, actual browser and hosted backend have not been proved by this probe. Do not bulk-push
local main or assume old cached bundles adopt it automatically.

## Consequence and remaining authority

[Updated local plan](2026-10-02-legacy-reader-compatibility-local-plan.md) must include a
compatible WEB-APP client adoption/refresh transition in addition to Edge/SQL/Next adapters.
Remove denied/error raw fallback; bind caches to current identity and invalidate in-flight
loads, handle401 with bounded safe renewal and403 with stop. For unsupported cached bundles,
explicit refresh/update/maintenance acceptance is required; no actorless access grace.
Direct public Drive URLs have independent provider ACL semantics: application rejection
cannot revoke a public provider link. Any source-ACL withdrawal remains separately authorized
Drive-exit work, not a silent live operation in this rehearsal.

No root build repeated: production/shared/dependency code is unchanged; new standalone probe
has focused syntax/ESLint/Node gates as declared in the work card. Historical pnpm check18:16
111files/1130tests/build belongs to31483fd, not a fresh browser or probe-covered root claim.
No new generated outputs/runtime. Entry20997884KiB/final20985944KiB free, above10GiBfloor.
No new Jev inference, incremental cost$0. Existing R1 estimates remain historical.

R1/goal remain OPEN/NO-GO. Earlier required client/server FAIL/NOT RUN is not reclassified as
complete. New implementation-scope approval is still missing on the second consecutive goal
turn where that blocker applies; both turns made independent rehearsal progress. Safe
source/role/recovery evidence is now checkpointed. Do not manufacture progress from another
unchanged status/build/model call. If a third consecutive goal turn finds the same missing
scope choice and no meaningful approved action, perform the blocked audit and set blocked.
No pending process is a verified wait: all relevant test handles completed and runtime is absent.

Final source/record acceptance PASS:215 local links/3anchors, three SHA256 source pins
(production loader/component and test checkpoint),7-file exact-sensitive-value/key-format
scan and diff check. Standalone test commit356a348 is retained; separate documentation commit
finishes the interrupted record. No production fix, new inference or release implied.
