# 093 — Android native private-file read through connected local R2-compatible service

Status: COMPLETE LOCALLY / 29 September 2026 / primary agent, single writer.
Source/test commit: `c3e1b28`; documentation/evidence commit follows separately.

## Outcome and work card

One observable result: an Android API 36 emulator running the real mobile Auth, catalogue,
reader, native PDF renderer and private cache reads a synthetic 40-page PDF through actual
local Auth/PostgREST/RLS and the `repertoire-file` Deno handler, which reads from a signed
loopback S3-compatible object server. A/B tenant switch must refuse a new A ticket and
clear the A file. This joins 021's native lifecycle and 091's connected backend; it does
not prove hosted Cloudflare R2, real data, or a physical device.

Actions: (1) extend the guarded 091 fixture to permit an explicit bounded Android hold and
mobile-only synthetic configuration; (2) run a guarded Android acceptance entry with the
existing production modules, two temporary reverse routes and local service; (3) verify
the required gates, cleanup exact resources, self-review and commit test code and records
separately. Exit only when required rows are PASS.

## Transition start, boundaries and authority

Read `AGENTS.md`, `docs/agent-handoff.md`, `memory-bank/activeContext.md`,
`docs/gecis-rehberi.md`, `docs/ai-calisma-duzeni.md`, delivery controls, `MIGRATION.md`,
decision #29, 021/026/090/091/092 and the relevant native gateway, handler and runners.
Verified HEAD `6643c1b`; only unrelated `supabase/.temp/cli-latest` is dirty and must
remain unstaged. Repertoire/PDF is native; profile stays WebView. No production file
protocol or 090 ticket revocation semantics change. Owner authorized scoped local work,
tests and commits, not hosted DB/Edge/provider, real files/accounts, credentials, push,
deploy, hardware or distribution. No subagent shares the worktree.

Allowed source/test paths: `supabase/test-support/091_connected_private_r2_read.ts`,
`supabase/test-support/093_*`, `apps/mobile/src/acceptance/093_*`, existing acceptance
entry/loopback plugin only for guarded test selection; focused tests for these files.
After first runtime preflight, the disposable Supabase gateway was observed to bind host
ports on all interfaces. It was stopped and restarted with forwarding disabled, then
explicit `127.0.0.1` SSH forwards were verified. The direct Deno handler would similarly
bind all interfaces by default. Permit only a test-environment loopback bind switch in
`supabase/functions/repertoire-file/index.ts`; the default hosted bind stays unchanged.
Android Release read reached the real 40-page PDF, but switching choirs crashed at
`AudioPlaybackProvider` unmount: Expo had already released its `useAudioPlayer(null)`
shared object, while our cleanup still called `pause()`. Permit a focused fix in
`apps/mobile/src/repertoire/AudioPlaybackProvider.tsx` and its existing component test:
unmount invalidates the request/ticket and lets Expo release the player; explicit tenant
clear pauses only an active audio source before clearing it. No audio protocol change.
First direct Deno attempt failed before readiness: the harness still permitted the old
`0.0.0.0:8000` address while the new local bind requested `127.0.0.1:8000`. Adjust only
that Deno allow-net entry and rerun once; synthetic rows from the failed attempt remain
inside the disposable target until VM cleanup, not in the source database.
Allowed records: this brief and concise handoff/active/progress/plan pointers. No
production Auth/gateway/schema/client changes unless an actual runtime defect is first
reproduced and the scope recorded here. Use no real R2 account/token. The Cloudflare R2
skill's S3-compatibility/local-development cautions apply: loopback object transport is
not provider acceptance.

## Resources, rollback and stop rules

Preflight free 31,732,392 KiB, existing installed AVD ~2.23 GiB and dependencies ~2.45 GiB
already counted. Reuse installed SDK/JDK/Deno/Colima images. One new `genova093` Colima VM
with root/data caps 6/6 GiB, up to 3 GiB Android build/AVD growth and 1 GiB container
download/logs gives conservative additional peak <=16 GiB, projected >15 GiB free, above
10 GiB floor. Recheck each phase. Exact task resources: `spike/093-runtime`,
`colima-genova093`, loopback 54321/54322 or 54491/54492 (verify actual config),
8000/18092, Android emulator 5580 and its two adb reverse routes, generated mobile
`android/` and build outputs. Existing AVD and dependencies are preserved; stop owned
services and move only owned generated outputs to Trash after final check. Unknown target,
non-loopback service, insufficient disk or stale fixture stops the run. Local VM cleanup is
not hosted backup/restore. Code rollback is revert of owned commits; no live data touched.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Date / environment / evidence and limit |
|---|---|---|---|
| Exact loopback runtime, local-only keys, synthetic fixtures and source preservation guards | Yes | PASS | 29 Sep isolated PG17 target, local Auth/PostgREST/RLS, handler bound to 127.0.0.1, signed 127.0.0.1 S3; all host listeners verified loopback after forwarding restart. Synthetic fixture mode 0600 and removed by runner; source six-table counts `28/1/29/9/79/41` and normalized schema SHA-256 `8c91d170aed8ac69a1e696e695a0b30ed8f682054287c687d26b91ef47fc2072` unchanged. Local disposable target is not a hosted restore. |
| Real Android Auth/catalogue → ticket → signed loopback S3 bytes → Expo private file → native PDF/Skia page 1 | Yes | PASS | 29 Sep API 36 Android **Release** acceptance bundle: synthetic sign-in, A catalogue, exact 65,905-byte PDF download, native PDF page 1/40 visibly rendered. [Screen and trace summary](../evidence/093-android-private-r2-read/README.md). Local S3 emulation is not hosted R2 acceptance. |
| A/B switch clears previous PDF and new A ticket is refused under B; old issued URL behavior remains 090 OPEN | Yes | PASS | 29 Sep fixed reproduced no-source audio cleanup crash, reran Release: A→B and B→A switch without crash; private-cache directory absent after clear, B catalogue shows only B audio; A file ticket under B returned 403. 090's old already-issued A URL still returned 200 in connected service check; revocation remains OPEN. |
| Native typecheck/tests, relevant Android build/runtime, scoped self-review, exact cleanup and split commits | Yes | PASS | 29 Sep mobile TypeScript + 50 suites/299 tests PASS; root `pnpm check` lint/typecheck, 103 suites/1049 tests, service-worker syntax, Next build PASS. Android `assembleDebug` and final `assembleRelease` PASS; Debug Metro bridge failed, so acceptance used Release. Scoped diff/review and cleanup below; source/test commit and documentation commit recorded by Git history. Self-review is not independent review. |
| Hosted R2/current live deployment/physical device/full beta | Later separate gates | NOT RUN | No current provider read, hosted activation, production client, real account/file, physical phone, push or deploy in 093. |

## Reproduction boundary and failure recovery

`supabase/test-support/093_runtime_config.toml` is the tracked local-only Supabase
configuration; copy it to ignored `spike/093-runtime/supabase/config.toml` for an isolated
run. The connected runner is `supabase/test-support/091_connected_private_r2_read.ts`;
only the exact `GENOVA_093_ANDROID_FIXTURE_PATH=spike/093-runtime/.093-android-fixture.json`
enables its 30-minute Android hold. The guarded mobile entry requires explicit
`EXPO_PUBLIC_GENOVA_093_ACCEPTANCE=1` and loopback-only URL. The temporary fixture contains
synthetic credentials and must not be committed. The Android emulator uses temporary reverse
routes for the local API and Deno handler. A conventional `assembleDebug` built but did not
reach Metro at `10.0.2.2:8081`; the Release bundle removed that dev-server dependency.

The first VM exposed gateway ports on all host interfaces; it was stopped before tests and
restarted with port forwarding disabled and explicit `127.0.0.1` SSH forwards. The first
Deno start failed because its permission list still named `0.0.0.0:8000`; corrected to
`127.0.0.1:8000`, then the connected runner passed. The first Android Release proved PDF
render but crashed at choir switch due `pause()` on Expo's released hook-owned player.
The focused no-source teardown guard and active-source tenant-clear test passed before the
final Release rerun. Finally, the runner's 30-minute hold timer originally kept the process
alive after SIGTERM; clearing it on signal yielded a clean second connected-runner exit 0.
These failed attempts are not counted as passes.

The final connected run also passed own PDF/WAV full, ranged and HEAD bytes and wrong-user,
wrong-choir, stale-context and revoked-membership new-ticket refusals. It was rerun on a
disposable local target. The Release test used actual product Auth, catalogue, reader, Expo
file store and native renderer, but a test-only entry, synthetic rows and loopback services.

## Cleanup, review and next boundary

The acceptance APK was uninstalled from the emulator, reverse routes removed, emulator
stopped, local services/tunnel stopped and the exact `colima-genova093` instance deleted.
No owned listener remains on 54491/54492/8000/18092/8081; no ADB device remains. The
ignored runtime and generated Android, `.next` and coverage directories were moved to
four exact recoverable `genova-093-20260929-*` Trash targets; the temporary synthetic
Auth DB was destroyed and its password is invalid. Free space after VM removal was
23,133,344 KiB, above the 10 GiB floor. Unrelated `supabase/.temp/cli-latest` remains
unstaged. The source table-count/schema comparison above is a local preservation guard,
not a substitute for a fresh hosted backup and restore.

Self-review checked the test-only flag fails closed, hosted Deno binding is unchanged,
no service key enters the mobile bundle, and tenant cleanup does not pause a released
audio player. Active-audio **unmount on a real device**, hosted R2 behavior, old issued
URL revocation and full product beta remain unverified. Next local product slice should
advance the same Android beta path; [090](090-private-file-ticket-revocation-contract.md)
requires the owner's revocation semantics before changing the server, and [077](077-repertoire-mp3-r2-batch-3.md)
requires separate exact real-copy approval.
