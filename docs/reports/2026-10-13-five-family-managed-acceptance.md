# Five-family managed acceptance — 13 October 2026

**219 actual local HTTP observations PASS across all five protected-file families.**
The previously unexecuted five-family checkpoint is now complete locally. This is not
hosted R2, mobile-device, store or complete commercial-production acceptance.
[Machine evidence](production-2026-10-13/five-family-evidence.json) ·
[Source manifest](production-2026-10-13/five-family-source.json) ·
[Roadmap](../production-roadmap.md).

## What actually ran

Fresh attempt `20261013-managed-families`; entry product `9d1f1a7`. Full pinned
Supabase PostgreSQL 17 image restored from the protected 9 October snapshot.
Before any delta: 17 catalog groups and 101 tables / 2,880 full-row fingerprints
matched. The original encrypted backup was unchanged. Applied the existing exact
11 SQL deltas only to this copy; ten transactional SQL control suites passed with
retained row digests unchanged after each rollback.

Real GoTrue 2.196.0 password accounts/sessions → PostgREST 14.13 with RLS → actual
current Deno 2.9.6 production Edge entrypoints. Managed startup changed neither
catalogs nor retained rows. All managed services used an internal network; local
TLS used its own CA/server leaf without global trust changes. Only nine file bodies
and signed provider transport were synthetic. Every permitted provider request
had its actual AWS4 signature checked. No Auth/REST/RPC decision was mocked.

| Family | Verified behavior |
|---|---|
| Repertoire | PDF plus explicit WAV audio; full/ranged GET/HEAD, exact bytes/MIME/length; Chef loss denies unless independent song assignment grants access |
| Assignment submission | Another member's audio denied after Chef loss; own submission remains readable |
| Assignment review | Another member's review denied after Chef loss; visible own review allowed; hidden own review denies issuance and retained GET/HEAD |
| Repertoire comment | Hidden comment denied after Chef loss; visible independent comment remains readable |
| Chat media | Chef loss alone does not revoke room membership; removal from the room revokes retained avatar access |

For every family: independent B account cannot issue A's file; selecting B,
inactive membership, session `not_after` expiry and real sign-out deny retained
GET/HEAD with **zero provider contact**. Separate writer transactions exercise
selection, membership and effective family authority before COMMIT, after COMMIT,
and with actual HTTP requests held immediately before their genuine authority RPC.
All 15 transaction dimensions produce the expected committed-state decisions.

Every retained-ticket observation checks that the signed ticket is still unexpired;
minimum observed remaining lifetime was 59,782 ms. Short-lived chat tickets are
renewed between independent scenarios, never between a scenario's mutation and
its retained-URL check. Stored hashes identify each ticket without retaining it.

For each family, a real authorized HTTP body was partially consumed, its provider
stream paused, membership revoked, and the stream resumed. Those already-authorized
bytes finish; subsequent GET/HEAD are refused. This demonstrates the in-flight-byte
limit honestly; it does not promise remote deletion of downloaded/offline bytes.

## Failures fixed in the test infrastructure

The first SQL pass failed because the 9 October snapshot's daily Realtime partitions
end before the current date. The fixture implicitly inserted today's date. The clone
adapter now selects an existing captured daily partition and sets only synthetic
insert timestamps. Seven helper tests prove original role/tenant/policy assertions
and all other bytes survive. No partition, default, policy or production SQL changed.
The initial error remains private and is not relabelled PASS. The second full SQL
pass completed all ten controls with retained rows unchanged.

The prepared matrix previously lacked explicit audio/hidden-review/stream/lifetime
checks and emitted an incomplete status. Those controls are implemented and actually
executed. Transport shutdown now awaits all child processes; acceptance cleanup
requires completed matrix, later final catalog audit and confirmed child shutdown.
A dedicated cleanup removes only this attempt's ephemeral credentials/TLS/fixture.

## Evidence and cleanup

- 219 matrix observations; 82 real Auth and 565 REST requests; 71 signed provider reads;
  zero outside-ingress requests. Raw user data/tokens/passwords are not in repository evidence.
- New source manifest pins 57 source/config/SQL files including the 12-file five-reader
  product dependency closure. The preflight manifest remains dated preparation evidence;
  final manifest includes the corrected Realtime fixture adapter. Old manifests unchanged.
- Final 17-group catalog/source audit completed after the matrix was fully written.
  No role/grant/RLS/trigger/schema weakening; final runtime data includes legitimate
  synthetic users/sessions/fixtures, so final whole-table equality is not claimed.
- Matrix finished 16:33 UTC; audit 16:34:03 UTC; cleanup completed 16:34:16 UTC.
  Exact owned VM, mounted volume, sparse image and newly downloaded ISO removed;
  all ten ephemeral secret/TLS/fixture files removed; scoped listeners absent.
  Protected source/key, private errors and unrelated caches/user data retained.
- Peak measured owned allocation: 5,499,620 KiB. After cleanup approximately 9 GiB
  available. Prior-turn generated `.next`/coverage output was removed before this run.
  Host swap usage was measured before allocation; no system cache/swap deletion occurred.
- Focused helper tests, scoped ESLint, cached Deno typecheck, current source pin verification
  and diff checks pass. No product/mobile code changed in this checkpoint; prior fresh
  web 1,234/mobile 465/browser 38/build results remain dated to the preceding commit.

## Remaining boundary

The test source snapshot is dated 9 October, not a new hosted backup. Live catalog/RPC
presence was refreshed separately; production recovery needs a fresh cutoff and object/
configuration coverage. Current web/native source/package integration, independent
release review, actual provider activation/old-link withdrawal and hosted rollout remain
separate. Existing mobile/full-product feature gaps are not closed by this backend matrix.
No hosted mutation, push, deploy, email/push sending or Jev inference occurred. The correct
Supabase skill's Auth/session/RLS checks guided verification. Review here is self-review.
