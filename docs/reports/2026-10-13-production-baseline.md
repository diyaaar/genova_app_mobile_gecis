# Production baseline and recovery fixes — 13 October 2026

Entry `90a5a81` on local main. Owner authorized proceeding toward production after the
instruction reset. This is implementation and a refreshed baseline, not production acceptance.
[Roadmap](../production-roadmap.md) · [checkpoint](../teslim-rehberi/checkpoint.md).

## Fresh observations

- Live Git remote main: `a13f696da8c731e9af2a2bce473d4f4ae4a81587` via `git ls-remote`.
  Entry revision was 407 commits ahead, zero behind the matching origin/main reference.
  This Git result does not establish which revision the hosting platform currently serves.
- Correct named Supabase connection, `hievmwwctjjlhmssoxsu`, read-only role and transaction
  verified. [Metadata](production-2026-10-13/hosted-metadata.json): 68 migrations, 21 active
  Edge functions. Latest ledger entry remains `20260925083611_private_r2_activation_065`.
  Seven public RPCs remain missing: annotation snapshot save, mark room read, atomic
  repertoire assignments, profile submit/review, private ticket authority and legacy-file
  resolution. `genova_087.normalize_changes` is also absent; annotation revision absent.
  Source bundles, deployed runtime behavior and historical migration statements were not
  re-audited. No user rows, credentials or hosted writes in this metadata acquisition.
- Live app opening led to the labelled login page. No authenticated product journey or
  account mutation was performed. This is availability evidence only.
- Local toolchain: Node 24.13.1 / pnpm 11.9.0; Next 15.5.25 production build.
  Disk capacity varied during the session; it is not a fixed permission gate.

## Implemented behavior

### Song creation recovery (F14, partially closed)

A new private-file song attempt that receives an explicit PostgreSQL constraint or
permission rejection now releases its own pending draft. The user can correct title or
composer and retry in the same form. The form immediately shows and locks pending
metadata when insertion/upload outcome is uncertain, including after reopening.
A per-context in-flight guard prevents overlapping submissions in the same module/tab.
Draft deletion compares the complete stored value so it cannot erase a replacement.

Only fresh attempts with codes 23505/23502/23503/23514/42501 are released. Existing
uncertain drafts retain their song ID and upload retry key even after a later definite
rejection: an empty RLS-filtered read cannot prove that an older insert did not commit.
Response-loss retries retain identities and avoid duplicate inserts. No server row or
uploaded object is deleted. Historical ambiguous/stuck drafts still need safe server
reconciliation; this slice does not claim to close all of F14.

### Malformed legacy-file tickets

Browser baseline exposed a stale test expecting 400 for invalid aliases; the existing
adapter contract intentionally returns 401. Inspection also found malformed ticket
strings unnecessarily reached Edge and surfaced as 503 when its transport was unavailable.
The adapter now rejects strings outside the existing two-part base64url ticket format
before network access. Well-formed old/current tokens still reach Edge for signature,
session and tenant checks. GET and HEAD preserve private/no-store, nosniff and bodyless
HEAD refusal. The E2E test now asserts this precise contract rather than weakening it.

## Verification

- Initial new recovery tests reproduced five definite-rejection failures and a concurrent
  submission failure. After the fix, focused form/service and stale-choir checks pass.
- Fresh mobile check: TypeScript and 57 suites / 465 tests PASS. No mobile source changed;
  this is not a new Android/iOS runtime or physical-device result.
- Root check before the additional ticket fix: lint, types, 118 files / 1,228 tests,
  coverage thresholds, service-worker syntax and production build PASS.
- Initial browser run: 10 passed / 28 failed. Of these, 26 could not create a page because
  Playwright's video executable was missing, and two exposed the stale alias assertion.
  Installed Playwright's ~1 MiB FFmpeg dependency without changing system settings.
- Final `pnpm check`: PASS, exit 0 — lint, TypeScript, 118 files / 1,234 tests,
  coverage thresholds (91.50% statements / 86.22% branches / 98.24% functions /
  97.26% lines in the configured coverage scope), service-worker syntax and production build.
- Final `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome pnpm test:e2e --workers=2`: PASS,
  38/38 scenarios across desktop Chrome and Pixel 7 browser emulation, 31.4 seconds.
  Includes login/errors/accessibility, choir selection, invitation/recovery, anonymous
  mutation denial and private/legacy assignment-file rendering. No real email sent.
- Changed Markdown: 208 local path links resolve; `git diff --check` passes.
  Known local secret-value comparison found zero matches in changed artifacts;
  `.env.jev.local` remains ignored and mode 0600. Test server port 4174 is released.

## Remaining release boundaries

Hosted authority/feature prerequisites, full managed five-family runtime, current
Android/iOS/device acceptance, private-storage transition, commercial lifecycle and
release operations remain open. Browser fixtures use mocked Auth/REST/file transports;
they do not prove hosted RLS or provider behavior. Changes were self-reviewed, not
independently reviewed. No push, deployment, hosted mutation, invite/mail/notification
sending, global credential change or additional Jev call occurred. Existing ignored
Jev key remains available. Unrelated `supabase/.temp/cli-latest` is preserved.
