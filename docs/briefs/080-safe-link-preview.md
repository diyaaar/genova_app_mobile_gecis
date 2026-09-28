# 080 — bounded, public-network-only link previews

Status: IN PROGRESS, 28 September 2026. Single writer: main agent.
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
Next: write focused negative/positive tests; implement vetted/pinned transport and bounded parsing;
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
one root build (~0.6 GiB), existing package cache missing pinned HTML parser at most 20 MiB,
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
| Old parser accepts forbidden targets (red-before-green) | Yes | NOT RUN | Parser only, no network probes |
| Literal/encoded IPv4, IPv6, internal names/ports/credentials and mixed DNS refused | Yes | NOT RUN | Focused policy tests, no target request |
| Every redirect validated, rebinding cannot change pinned socket, Host/TLS identity retained | Yes | NOT RUN | Unit + actual Deno loopback/TLS transport, no remote site |
| Header/body/declared/chunked/slow/error/cancel bounds hold | Yes | NOT RUN | Actual bounded stream/deadline and socket cleanup |
| Verified active actor, bounded request, redacted errors, bounded abuse-state/concurrency | Yes | NOT RUN | Handler tests and synthetic composition; no hosted Auth proof |
| OG/Twitter/title/entities/relative assets/non-HTML fallback and public schema preserved | Yes | NOT RUN | Reused actual sanitizer/parser under both runtimes |
| Root pnpm check and mobile optional-preview send regression | Yes | NOT RUN | No actual UI/device/server deployment acceptance |
| Exact scope/self-review/links/cleanup/resource/commits | Yes | NOT RUN | Self-review is not independent security certification |
| Hosted Edge/gateway/provider/public DNS/real account/device/browser | No; separate approved release | NOT RUN | No live remediation claim |

Results / failed approaches / delivery pending.
