# 093 Android connected private-file read — local evidence

Date: 29 September 2026. Environment: existing Android API 36 emulator, Release
acceptance bundle, disposable local Supabase Auth/PostgREST/RLS/PG17, loopback Deno
`repertoire-file` handler and signed loopback S3-compatible server. All users, choirs,
credentials, files and object keys were synthetic. This is not hosted Cloudflare R2,
a physical device or production/beta acceptance.

| Check | Observed result |
|---|---|
| Auth and A catalogue | Synthetic sign-in PASS; A score visible. |
| Private read | 65,905-byte PDF through a new ticket and signed local S3 read into Expo private cache; native renderer displayed page 1/40. |
| Tenant switch | A→B and B→A completed after audio-provider teardown fix. Cache-clear trace PASS and cache directory absent. B catalogue showed only its audio. New A-file ticket under B returned 403. |
| Connected service | PDF and WAV exact full/ranged/HEAD bytes PASS; foreign actor/choir, stale context and inactive membership new-ticket refusals PASS. Previously issued A URL still readable after switch: 090 OPEN. |
| Regression/build | Mobile TypeScript and 50 suites/299 tests PASS; root `pnpm check` 103 suites/1049 tests plus build PASS; Android Release build PASS. |

[A score rendered](choir-a-score.png) (SHA-256
`49fe2522ec23cd7540df3690059af607cf056e48af7aec785844aa9427463129`)
and [B-only catalogue](choir-b-repertoire.png) (SHA-256
`534d20d728660fdfd9d7cf0fa74c2b3a2d5857f66842f2e4a64f5b2c1bf01ef1`)
were visually inspected. They show the test-only banner and synthetic content; no
actual choir data or credentials are visible. The status-bar overlap is limited to
the acceptance entry, not a production-screen result.

The exact local runtime, generated Android build, Next output and coverage were moved
to recoverable Trash targets after services and emulator were stopped. The test APK
was uninstalled. The synthetic password was invalidated with deletion of the local
Auth database. Detailed failure/recovery and source-preservation evidence is in the
[093 brief](../../briefs/093-android-private-r2-read-integration.md).
