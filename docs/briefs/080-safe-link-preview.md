# 080 — bounded, public-network-only link previews

Status: COMPLETE LOCALLY, 28 September 2026. Single writer: main agent. Hosted release NOT RUN.
One outcome: authenticated active choir users can obtain public HTML previews without allowing
the server to fetch internal destinations or retain unbounded/slow upstream bodies.
Source: [WF-012 F06](../reports/2026-09-28-commercial-multi-tenant-audit.md),
[WF-013](WF-013-multi-tenant-remediation-plan.md). Owner explicitly requested this checkpoint.

## Startup / contract

Verified main / e16bcd9, only unrelated `supabase/.temp/cli-latest` dirty. Read AGENTS,
handoff/activeContext, execution controls, brief template and guide; prior same-session work-cycle,
KARARLAR #18/#28–31 and MIGRATION native chat/server boundary remain unchanged.
Current endpoint accepts loopback/private IP URLs, automatically follows redirects, reads the
whole body before slicing and stops its timer at headers. Local Deno 2.9.6 has no DOMParser.
Web and mobile both call this Edge endpoint; neither client contract nor message sending changes.
Planned sequence at startup: focused negative/positive tests; vetted/pinned transport and bounded parsing;
run actual installed Deno transport/handler acceptance plus root/client regressions and handoff.

Allowed: `supabase/functions/link-preview/` policy/transport/parser/handler/entrypoint/tests;
focused `supabase/test-support/080_*` source/runner; this brief and plan/handoff/active/progress.
No new Next route, provider, DB schema/rows, UI rewrite, dependency upgrade or parallel writer.
Re-use existing pinned sanitize-html 2.17.7 (already a root dependency), not a new parsing platform.

## Required boundaries

- Only normalized http/https public targets; reject credentials, control characters, special-use
  IPs/IPv6 transition forms, local names and non-web ports. URL limit 2,048 characters.
- Validate all DNS answers; reject any private/special/malformed/mixed result. Select one vetted
  numeric IP, connect directly to it, preserve original Host/TLS SNI/certificate identity. No
  second DNS lookup/automatic proxy/redirect; at most three individually revalidated redirects.
- 300,000 actual upstream bytes, bounded response headers, no decompression; reject oversized
  Content-Length and streaming overflow. Cancel sockets/bodies on refused/non-HTML/error paths.
- Three-second DNS/redirect/body deadline; bounded inbound JSON and auth phase; stable redacted
  errors. Never forward user Authorization, cookies or API keys to the preview target.
- Require verified Auth and current active choir/member before outbound work. Per-actor/per-choir
  warm-worker request limits, bounded buckets and concurrent work are defense in depth, NOT a
  distributed billing/quota guarantee. Durable cross-instance quotas remain F11 release work.
- Preserve public response fields/OG/Twitter/title/fallback behavior and optional-preview send
  semantics. Safe assets only; no automatic server fetch of image/favicon resources.

## Resources / authority / rollback

35,980,348 KiB available; installed Node24/Deno2.9.6/dependencies reused. Added peak <2 GiB:
one root build (~0.6 GiB), existing cached pinned HTML parser (no download needed),
small ephemeral self-signed fixture certificate/key and synthetic loopback HTTP/TLS servers.
No external target probes, private/metadata requests, production credentials or hosted Auth calls.
Runtime tests use only task-owned loopback fixtures; private URL refusals use fake DNS/transport
and never probe the user's network. Fixture ports ephemeral; close all and remove owned temp
directory in finally/trap. Generated .next/coverage removed recoverably after final gates.
No VM/emulator/native build. Root gate required; focused mobile send regression proves fallback,
not hardware/hosted acceptance. Production deployment/Edge-runtime-specific compatibility remains
a separate gated verification, not inferred from local Deno.
Rollback local source via a scoped revert; live Edge rollout/rollback must preserve the secured
endpoint or explicitly accept reopening the vulnerability. No DB rollback or data deletion.

## Primary technical references

- [Supabase Node built-ins/dependencies](https://supabase.com/docs/guides/functions/dependencies).
- [Node HTTP](https://nodejs.org/docs/latest-v24.x/api/http.html) and
  [TLS server identity](https://nodejs.org/docs/latest-v24.x/api/tls.html).
- [IANA IPv4 special-use](https://www.iana.org/assignments/iana-ipv4-special-registry/) and
  [IPv6 special-use](https://www.iana.org/assignments/iana-ipv6-special-registry/).
These inform conservative policy; only actual tests prove the local implementation.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limits |
|---|---|---|---|
| Old parser accepts forbidden targets (red-before-green) | Yes | PASS | Original e16bcd9 helper accepts four forbidden targets; parser only, no probes |
| Literal/encoded IPv4, IPv6, internal names/ports/credentials and mixed DNS refused | Yes | PASS | 104 focused cases; actual Deno IPv6 mapped/special/transition refusals and public control, no networking |
| Every redirect validated, rebinding cannot change pinned socket, Host/TLS identity retained | Yes | PASS | Node policy/redirect cases + actual numeric Deno HTTP/TLS and certificate mismatch refusal |
| Header/body/declared/chunked/slow/error/cancel bounds hold | Yes | PASS | Actual Deno header/chunked/declared/reset/fallback/deadline/socket matrix |
| Verified active actor, bounded request, redacted errors, bounded abuse-state/concurrency | Yes | PASS | Tested adapter and handler/pre-auth admission; synthetic identities, no hosted Auth proof |
| OG/Twitter/title/entities/relative assets/non-HTML fallback and public schema preserved | Yes | PASS | Actual sanitizer/parser under Node and Deno; unsafe literal/scheme assets refused |
| Root pnpm check and mobile optional-preview send regression | Yes | PASS | 92 files/908 tests/build; mobile typecheck + 2 suites/6 tests; no UI/device acceptance |
| Exact scope/self-review/links/cleanup/resource/commits | Yes | PASS | 9708ab9, owned cleanup/links/diff; self-review is not independent security certification |
| Hosted Edge/gateway/provider/public DNS/real account/device/browser | No; separate approved release | NOT RUN | No live remediation claim |

## Implementation / verified local behavior

Policy, pinned transport, parser, authorization and handler are separate small modules under
`supabase/functions/link-preview/`; `index.ts` only wires the existing Supabase client, system DNS,
system-trust numeric HTTP/TLS and pinned existing sanitize-html dependency. No ts-nocheck remains.
Auth.getUser verifies identity; current choir/member RPCs plus the active member row bind user,
choir and member. Client-selected tenant/body fields are refused. Authorization is checked at
request time, not an atomic promise against a subsequent in-flight revocation.

Limits: 2,048-character URL, standard ports, all-public maximum 16 DNS answers, three followed
redirects, 16,384-byte upstream headers, 300,000-byte HTML, 4,096-byte inbound JSON, 3-second
whole upstream operation and 5-second whole async handler. Fixed warm-worker guards admit
at most 300 POSTs/minute and 16 body/auth handlers concurrently; outbound work adds 8 concurrent,
12 requests/actor/choir/minute, 120/choir/minute, 300/worker/minute and 1,024 retained buckets.
Reservations release exactly once on success/error/abort. These reset across instances/restarts:
NOT distributed quotas, per-IP bot protection, a billing limit or a cross-worker fairness guarantee.
Non-cancellable system DNS promises are raced against the deadline, not forcibly killed.

Transport's constructor-only CA/port seams are for ephemeral owned fixtures. Production supplies
no overrides, accepts only the internally vetted numeric target, and has no body/env-controlled
CA, destination bypass, proxy or port override. Original Host/TLS SNI/certificate hostname remain
distinct from the socket address. Responses are never automatically redirected or decompressed.
Images/favicons receive URL-scheme/literal-host validation only; no server asset fetch occurs and
the subsequent browser/native asset request is not DNS-pinned by this function.

Network-free red baseline: extract only normalizeUrl from `e16bcd9` using git show and existing
TypeScript transpilation; localhost, 127.0.0.1, 10.0.0.1 and 169.254.169.254 were all accepted.
No original insecure endpoint was invoked and no internal target was probed.
Green: 104 focused Vitest cases under Node cover literal/encoded/special addresses, malformed/
mixed DNS, redirects, actual byte counts and chunk-split UTF-8, slow phases, body cancellation,
actual HTML parsing, actor/auth adapter refusals, redacted errors, inbound bounds, admission,
actor/choir/worker caps, bounded identity buckets and release/reset semantics.

Actual installed Deno 2.9.6 acceptance uses only ephemeral 127.0.0.1 HTTP/TLS servers and synthetic
certificate/key. Public mocked DNS selects 8.8.8.8; the explicit fixture wrapper substitutes
loopback only after policy. Actual transport retains Host/SNI, accepts the matching certificate,
rejects the wrong hostname, respects header/chunked/declared limits and cancels all observed
sockets after overflow/refusal/non-HTML/compressed/empty/reset/deadline paths. Real three-second
body and five-second auth deadlines pass. Production policy independently rejects the fixture
loopback address. This is actual local transport/handler execution, NOT hosted DNS/Auth/Edge.

Reproduce with `pnpm exec vitest run supabase/functions/link-preview`,
`deno check --no-config --cached-only supabase/functions/link-preview/index.ts
supabase/functions/link-preview/runtime-acceptance.ts`, and
`sh supabase/test-support/080_link_preview_runtime.sh`. The runner forbids external network and
reads only its own certificate directory. Finally/trap closes servers and removes both generated
files and the exact owned directory. No installed package, environment or TLS verification switch.

Failed approaches were repaired and rerun: actual Deno found a bodyless 205 response reaching
the HTML parser; it now takes the explicit fallback and has a regression test. Root TypeScript
initially included the Deno fixture from test-support; it was moved into the existing Edge-only
source boundary rather than disabling checking or broadening the web compiler's exclusions.
Self-review additionally extended admission to pre-auth body/Auth work and repaired pre-aborted
IO rejection handling. Self-review is not independent review or security certification.

## Final acceptance / retained boundaries

Product/test commit: `9708ab9`; startup scope commit: `fa06ad5`. Final Deno check, runtime matrix
and complete root `pnpm check` ran against the exact product source after the pre-auth refinement.
Root lint/typecheck/92 files/908 tests/coverage thresholds/SW syntax/Next production build PASS.
The existing coverage allowlist is unchanged and does NOT measure the new preview modules;
their evidence is the focused 104 cases and actual Deno matrix, not an inferred coverage score.
Root used example.supabase.co and test-only public/service/Gemini keys with local APP_URL
overrides, not provider/account acceptance. Mobile `npm run typecheck` plus
`npm test -- --runInBand src/chat/__tests__/chat-send-gateway.test.ts
src/chat/__tests__/supabase-chat-send-transport.test.ts` PASS (2 suites/6 tests), including preview
failure retaining/sending the message. The full native suite was not rerun; no native source changed.
Existing npm config/punycode warnings did not fail those checks.

The runner's synthetic key/certificate/temp directories and all fixture sockets were removed/closed.
Owned .next (537,624 KiB) and coverage (344 KiB) moved recoverably to
`/Users/alidiyarduran/.Trash/genova-080.4trLF7`; source/lockfiles/retained backup/copy evidence untouched.
Measured free space after cleanup: 35,424,864 KiB (~33.8 GiB), above the 10-GiB floor. Moving to
Trash is recovery, not a claim that storage was reclaimed. No VM/emulator/install was created.
Only unrelated `supabase/.temp/cli-latest` remains unstaged after documentation delivery.

No push, hosted migration, Edge deployment, public DNS/provider target, real account, browser,
device or R2 copy ran. A separately approved release must verify the exact target schema and
078/079 order, Edge runtime built-ins/DNS/TLS/bundle/gateway compatibility, active/inactive real
sessions, public preview/refused redirects and web/native fallback on the deployed revision.
Do not declare F06 fixed in production from this local acceptance. No new pricing, choir,
account or credential decision was invented. Next WF-013 local checkpoint: F12 owned secret-file
permissions; provider rotation remains a separate decision, not part of that local mode repair.
