# Trusted-app legacy Next native recovery — 3 October 2026

Bounded local goal PASS. Source `f1d089be9ab5beb7e070cc570a30a9c23cb58a01`.
Whole090/R1/beta remain OPEN, live NO-GO. This is native logic/network-boundary
acceptance, **not Android/iOS renderer, Expo filesystem/share or hosted RLS proof**.
No push, CI, hosted, provider ACL, sibling-site or real-user action.

## Implementation and authority

The prior [profile candidate](2026-10-03-minimum-embedded-profile-candidate.md)
opened the profile through access-only native proof, but native file recovery rejected
legacy Next URLs. The existing capability now supports one recovery through the
validated native runtime's exact app origin, in addition to the five existing Edge
readers. No new Next route, Edge/SQL change, package or Auth framework.

- Input is an absolute canonical URL with the exact configured origin, exact safe
  alias path and one bounded two-part token. Foreign origins, credentials, fragments,
  duplicate/extra parameters, normalization tricks and malformed aliases are refused.
- The old body HEAD sends no bearer. Confirmed403/404/redirect/server-error verdicts
  stop without a new lease or POST.401 or an opaque transport/body failure can make
  one authority attempt; HEAD200 also permits that existing opaque-failure behavior.
- A force-refreshed native access lease goes only to the fixed configured-app
  `/api/drive-file-token`, with `{driveFileId}` only, credentials omitted and redirects
  forbidden. Tenant/role/session/resource/source authorization remains server-owned.
- A replacement must have a future integer expiry, same origin/path/alias, one
  bounded HMAC-shaped token and a URL different from the old one. Parsing/cancellation
  is checked before and after async lease/HTTP/JSON boundaries. No late ticket is used.
- The existing native capability makes at most two download attempts and one renewal.
  A second download failure is final, not a renewal loop. Successful temporary files
  are removed. Already-downloaded/offline bytes remain outside server revocation.
- Screen wiring derives the issuer from runtime configuration, not bridge messages;
  an origin change reconstructs the capability and clears the old operation. Current
  lease callbacks are read from the existing action ref. No refresh-token sharing or
  browser session seeding. Deterministic policy never delegates authorization to AI.

## Evidence and limits

[Final HTTP record](090/2026-10-03-native-legacy-recovery-http-v2.json) pins11 actual
compiler inputs and four wiring/test sources, plus the harness hash. Main source
commit above contains those exact hashes. The [initial record](090/2026-10-03-native-legacy-recovery-http.json)
is retained: seven result/count scenarios passed before exact status-sequence assertions
and the screen-wiring regression were added. It is not the final acceptance pin.
No test assertion was removed; no failed approach or threshold weakening occurred.
Document exit verified85 local links, both evidence JSONs/redaction,15 source/test
hashes against sourcef1d089b plus harness hash, immutable candidate refs and diff checks.

Node24.13.1; existing dependencies only. Owned HTTP18196 dispatches actual Next
adapter functions and actual Edge handler/HMAC. Only the adapter's exact fixture HTTPS
issuer is transported to owned HTTP; the handler still emits its expected fixed HTTPS
URL. Native GET/HEAD/POST traverse real HTTP. Auth and current-authority resolution,
provider bytes and in-memory file/share ports are synthetic. Expo import fixtures
throw if invoked; there is no production Next middleware/router or native SDK proof.
The68-byte synthetic PDF verifies signature/byte hash, not PDF rendering.

| Criterion / expected behavior | Required? / N/A reason | Status | Date / environment / scenario | Evidence and limits |
|---|---|---|---|---|
| Legacy renewal and all five existing Edge reader paths | Yes | PASS | 3Oct, actual recovery unit code | Same trusted endpoint, forceRefresh; existing five parameterized reader cases retained |
| Foreign/malformed/replacement/expiry/redirect/denial/cancel guards | Yes | PASS | Focused mobile3suites95tests | Includes screen configured-origin/clear/current-callback wiring; passive validation and one retry tests retained |
| Expired signed URL recovers once and preserves bytes | Yes | PASS | Real HTTP: GET401→HEAD401→POST200→GET200 | One lease/POST, two downloads, one provider read/share/removal;68B SHA256773d5ebaa2f6b84406e526e42a1199ac0336e5fbed47d920c9ca7cad5652467c |
| Valid URL loses current authority | Yes | PASS | GET403→HEAD403 | No lease, POST, provider read or share |
| Expired A URL with current B lease | Yes | PASS | GET401→HEAD401→POST403 | One current lease/POST; no provider read or share; synthetic authority, not hosted SQL |
| Revocation between renewal and second GET | Yes | PASS | GET401→HEAD401→POST200→GET403 | Exactly one renewal, no third download/provider/share |
| Tenant clear during lease lookup | Yes | PASS | GET401→HEAD401 then clear | No POST or share; existing abort capability used |
| Credential-bearing POST redirect | Yes | PASS | POST307 rejected by actual fetch redirect:error | No trap/unknown route/provider/share; no remote request |
| Foreign input before probe/lease | Yes | PASS | Actual compiled recovery | Zero network/lease side effects; seventh HTTP-harness scenario |
| Mobile full gate | Yes | PASS | 3Oct12:11 TRT, `npx tsc --noEmit && npm test -- --runInBand` | 55suites452tests; existing SafeAreaView/punycode/npm config warnings retained |
| Root full gate | Yes | PASS | 3Oct12:12 TRT, synthetic example public Auth config, `pnpm --config.verify-deps-before-run=false check` | lint/types/114files1178tests/coverage/SW/Next build; coverage91.03/85.68/98.23/96.79 |
| Preserved source/preflight regressions | Yes | PASS | Node native-preflight + embedded-source tests | 13/13; unconfigured legacy support still refuses; immutable web refs unchanged |
| Pins/diff/links/redaction/cleanup/scoped separate commits | Yes | PASS | Local document exit checks | 15source/test hashes + harness checked; sourcef1d089b; document commit handed off separately; primary self-review only |
| Exact Android and grouped sensitive iOS profile/file flow | Deferred required release gate | NOT RUN | Next integrated checkpoint | Consent, actual Expo download/share/cleanup and renderer/navigation still required |
| Other permanent-route APIs, hosted R1/preflight/release and independent review | Required before live | NOT RUN | No authority exercised | This local result is not whole090/native/beta/production completion |

## Resources and next measurable action

Preflight21,338,192KiB free; measured before cleanup20,777,152KiB (>10GiB floor),
final21,255,756KiB. Removed only owned root.next477416KiB and coverage352KiB after
all gates/source pins; both are rebuildable. HTTP18196 stopped, fetch/environment
restored, no temporary file bytes retained. No candidate copy/install/emulator/VM/APK
allocated. Existing dependencies, AVD/CoreSimulator/global caches/user data/backups
and unrelated `supabase/.temp/cli-latest` preserved. Protected R1 backups unchanged.
Immutable browser1a014c4 and embedded-profile7cd8d46 refs remain unchanged.

NEXT: fresh resource preflight, reconstruct only the exact7cd8d46 embedded web candidate
and currentf1d089b native app for owned Android-first integrated acceptance. Measure
challenged profile entry, file consent, expired-link one-shot renewal, real file/hash,
share/cleanup, valid-ticket403 after authority removal and A→B/clear. Refuse foreign
issuer/redirect and credential persistence. Use synthetic loopback authority/provider;
then group platform-sensitive iOS. Do not claim RLS/hosted/hardware acceptance from
emulator fixtures. Audit remaining permanent-route APIs before full mobile compatibility.
Secret-free media logging, independent review, R1/refresh-forward-repair and fresh
hosted preflight remain ordered release gates; no automatic server downgrade.

TypeSafe/Supabase rules influenced the bounded design: authority stays deterministic
on the existing server; no new provider, SDK change or AI security decision. No Jev
inference: **$0 Jev cost**. Same-key reuse authorized2October only, not3October.
