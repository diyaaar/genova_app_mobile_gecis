# 095 — Permanent WebView current assignment file acceptance

Source/test commit `ee7be64`. Local-only checkpoint; primary-agent self-review, not independent review.
[Brief](../../briefs/095-webview-current-assignment-file-reader.md) owns acceptance.

Fresh root `pnpm check` passed lint/TypeScript, 109 files/1090 cases, coverage thresholds,
service-worker syntax and Next production build on 1 October 2026. Synthetic public/service
configuration was explicitly supplied; no server, live database or provider was exercised by
the build. Coverage headline applies only to the configured coverage allowlist, not the full app.

Focused real-hook/component and performance-query tests passed 2 files/15 cases. Advisory
tooling separately passed 3 offline Node tests; this is not a provider or AI accuracy test.

## Fresh browser acceptance

The final fresh production build passed eight scenarios on installed Chrome at desktop and
Pixel7-sized mobile viewport, 1 October19:58 Istanbul. [Machine-readable record](2026-10-01-browser.json).
All remote HTTP is intercepted with synthetic fixtures and unexpected remote requests fail closed.
This exercises actual page/query/client/private hook/HEAD/UI, not Auth/RLS/Edge/provider integration.

- Current immutable version overrides stale Drive even when the legacy Drive ID is empty;
  exactly one ticket POST and one online authority HEAD per chorist page, zero Drive requests.
- Synthetic private HEAD403 leaves neither a private anchor nor the stale Drive anchor;
  no protected-cache or legacy-link fallback.
- Legacy-only rows retain their existing Drive link and issue zero private-version requests.
- Chorist→assignment-detail continuation retains the version-backed link and bridge filename/MIME,
  invokes online HEAD again, and exposes no stale Drive URL. No page error in the success flows.

Commands: root focused `pnpm exec vitest run components/assignments/SubmissionFileLink.test.tsx
lib/korist-performance.test.ts`; root `pnpm check` with explicit synthetic configuration;
`PLAYWRIGHT_CHROMIUM_CHANNEL=chrome ./node_modules/.bin/playwright test
tests/e2e/assignment-files.spec.ts --workers=1 --reporter=json`. The final browser report was
generated from that executed JSON, not handwritten expected results. Sources did not change
between the final build/browser run and `ee7be64`.

## Failure review and preserved boundaries

The first focused run was14/15: a blank legacy URL incorrectly masked the resolved protected
legacy URL. Normalizing empty URLs to null fixes that real regression. The second run exposed
a test assumption: fresh legacy cache intentionally skips network under existing mixed-mode
policy. After reassessment the uncached-legacy case declares an absent cache; private online
401/403/500 and malformed-pointer assertions remain intact.

Two browser attempts did not execute a page: managed Chromium and then ffmpeg binaries were
absent. After reassessment use the installed Chrome with disposable profiles and disable only
this fixture's video, retaining failure trace/screenshots and all behavioral assertions. No
download or access to the user's Chrome profile/account. An earlier eight-case run predates
the compact pending/error icon accessibility refinement; final fresh-build eight-case evidence
above supersedes it. No existing required test or application permission was weakened.

Self-review checked exact projection/filter retention; immutable cache identity `r2_<version>`;
source/actor/choir/member keyed teardown and late-completion tests; no fallback from malformed or
denied private versions; existing authorized reader ownership; legacy compatibility; compact
assignment-link layout and accessible labels; unchanged notes/review/history/metrics/route scope.
Shared component removes duplicate legacy-priority logic. No new API, schema or model-based access.
Already downloaded offline bytes remain outside recall. Legacy public Drive ACLs are not revoked
by this UI fix. Release must independently verify prerequisite057/090 schema→Edge→client order;
no current hosted state was checked and no hosted-ready claim is made.

## TypeSafe/Jev advisory and costs

Live API, Choice, models and citation-check cookbook were read. The skill's semantic citation-check
pattern influenced the bounded evidence review, not runtime file authorization. Nine independent
claims were frozen against source/browser hashes before inference; no real user data, binary,
secret or full-repository upload. [Request](2026-10-01-jev-request.json),
[primary labels](2026-10-01-jev-labels.json), [response](2026-10-01-jev-response.json).
One call,11935B,476ms,jev-1.13.0,3587input/380output, no retries. Nine of nine primary
labels agree, but identity0.64, Android-unknown0.36, hosted-nonrelease0.64 and whole090-open0.61
are below the cookbook's example0.8 threshold; primary review explicitly retains their limited
scope instead of calling this model confirmation independent acceptance/calibration.

At the current documented [$0.042/M input, output free](https://docs.typesafe.ai/models), this call
is **$0.000150654 estimated**. Dated retained prior records:15calls57977input7163output;
today's tracked total now16calls61564input7543output, **$0.002585688 estimated**, not an invoice
or verified account balance. Codex turn cost is unavailable and not included. Today-only key
was supplied through non-echoing ephemeral stdin, never persisted in source/env/evidence.
Offline advisory guards passed `node --test spike/typesafe/jev-095-evidence.test.mjs`3/3.
Advisory labels do not replace genuine Android/Auth/RLS/Edge/private-body acceptance.

## Cleanup and next action

Start23409084KiB free; pre-cleanup22697640KiB; post-cleanup23246920KiB and final metadata
check23235824KiB, all above10GiB floor. Background filesystem use can vary between checks.
Stopped both owned loopback server instances after their last use; port4174 no longer listens.
Removed `.next`542004KiB, `coverage`352KiB and `test-results`4KiB (~529.65MiB total):
generated, regenerable, not source data. No runtime/VM/native output was recreated or retained.
Original068 DB, dependencies, AVD/global caches and unrelated CLI marker are untouched.
Redacted small JSON/source evidence remains; raw browser videos/binaries are not retained.
Final local51-link check, artifact secret-pattern scan8 files, request/source/browser/response
hash-chain validation, diff whitespace and no-listener check PASS. No secret values were printed.

Android connected assignment-version acceptance remains the next090 checkpoint: actual product
WebView plus local Auth/RLS/Edge/signed synthetic bytes, source/version replacement, A→B teardown
and old URL GET/HEAD403. Native iOS remains a scheduled integrated gate; no hosted/device/beta
release inference. Rollback is local source revert only, preserving backend immutable versions.
