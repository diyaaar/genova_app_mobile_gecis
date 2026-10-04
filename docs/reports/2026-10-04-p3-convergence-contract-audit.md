# P3 — precise next convergence contract and original-goal audit

Date: 4 October 2026; entry `main/95b089d`, primary sole writer.
Same goal/candidate **GENOVA-BETA-20261003-P1**, frozen product
`c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0`. No product change.
[Owning work card](../briefs/090-private-file-ticket-revocation-contract.md#4-october-continuation--exact-convergence-contract-and-completion-audit)
→ [checkpoint](../teslim-rehberi/checkpoint.md) → [P3](../teslim-rehberi/03-release-package.md).

## Original full inventory requirement audit

This is an entry-inventory audit, not acceptance of the whole P3 release package.
Historical statements remain required under the original card until the owner
explicitly chooses another evidence method. The pending question is not answered
by an automatic goal continuation. No criterion silently dropped or marked complete.

| Requirement / authoritative evidence | Current verdict / exact remaining work |
|---|---|
| Frozen and minimum/intermediate source identities | Frozen610pins verified; browser1a014c4/profile7cd8d46 are intermediate, not full beta. This contract pins relevant actual source and defines missing convergence; no repaired candidate exists yet |
| Verified served web identity | 4October correct Genesinova Vercel Ready deployment ApCrcavKPpHSdBzdpv8JvESEiKc5,main/a13f696 recorded in hosted reconciliation. Actual HTTP/Auth acceptance remains a separate NOT RUN release gate |
| Verified applied SQL identity | Correct-project read-only ledger/current function/catalog/ACL/RLS/constraint metadata acquired. **Historical body/checksum equality UNAVAILABLE/NOT VERIFIED**:15NULLstored statement sets. No genuine historical archive verified, no source-equivalence inference from migration names |
| Deployed Edge identities/configuration |21metadata/17candidate source closures captured:5exact,6runtime exact/type-only omissions,6real source differences,3missing. Versions/JWT retained; runtime secret values/settings/provider behavior not verified or exported |
| Every exposed native/WebView/browser/API route | Eight entry groups, every frozen page/API, four permanent WebViews/native Auth/repertoire/chat, unresolved/dynamic RPCs explicitly mapped in original graph/report. Graph import coverage is not runtime feature acceptance |
| Five-family old/new/security/cache tests | Original common matrix plus actor not_after negative from delta report; actual Next/Auth/RLS/provider/cache/full-client execution NOT RUN, not required execution in this inventory. Existing helper limitations made explicit below |
| Exact recovery/review/operation prerequisites | Original recovery/exclusion/stop/review/authority map + actual ten-delta order + exact source/test/reacceptance contract below. Fresh snapshot/clone/review/provider/operations not performed or authorized by this inventory |
| Committed, validated handoff with honest boundaries | Prior95b089d inventory commit preserved; accompanying scoped090document commit owns this new contract/audit. Required historical equality remains open, so full original goal NOT COMPLETE |

Evidence: [immutable P1](090/2026-10-03-p1-beta-candidate.json),
[full route/test/operation map](2026-10-03-p3-entry-inventory.md),
[exact hosted reconciliation](2026-10-04-p3-hosted-reconciliation.md),
[ten-delta prerequisites and new source gap](2026-10-04-p3-delta-dependency-inventory.md),
[accepted local P2](2026-10-03-ios-p2-private-file-acceptance.md).
Hosted catalog/Edge/web timestamps remain those of the captured reports, not silently
refreshed by this audit. Only the blocking ledger predicate was revalidated below.
Existing16focused-test results remain dated;
no unchanged product build/device test rerun is inflated as new acceptance.

## Next source card: one observable outcome, NOT IMPLEMENTED HERE

Outcome: full candidate's protected-file flow agrees with the accepted native
consent boundary, browser authorization behavior and next-request session authority,
without capability-bearing diagnostics. Keep all exposed features/tenants/roles.
This contract is local implementation preparation, not SQL/deploy authority.

### Exact inspected baseline

The following current bytes match their frozen manifest pins. Paths are the actual
repository locations, not obsolete runtime copies or historical shorthand.

| Actual path | SHA256 |
|---|---|
| hooks/useProtectedDriveFileUrl.ts |552fb35788ef535b98ad4dde22eb83685e6daf2392abf2c8ef885ade3b324c36|
| lib/drive-file-url.ts |5638930bf3f89bcb5f115cd972657f4816deff2cc64ee32c1a407caf658f1326|
| components/FloatingMiniPlayer.tsx |90b1449459c9d3596841e11f958b25286ffd5e1acd3448532cfa36583df2c87c|
| components/repertuvar/RepertoireWorkspace.tsx |3e0152c55e559adbfa795e91aadd60a7574e2ed956808c4b2f375df28979df55|
| lib/embedded-web-runtime.ts |a8f547da5d68d1edf25d831642b27171fd84837bf43705ca2f8e4b64cc28a82e|
| supabase/migrations/20260930080046_private_file_ticket_authority_090.sql |4f345d968fa6945aa746b4d00b7852c293047a984beabd79c4b7a64629c0ad86|
| apps/mobile/src/webview/NativeWebViewScreen.tsx |43d9e0d222edf672dbffcf0c1dc337239276dc98af65b5847fb63dbbe90a7d11|
| apps/mobile/src/webview/platform-capabilities.ts |d00ff9c0b944b74efca08090bb31f2fe56d5375a9c7f651bd0c7f5c90f4c781b|

### Allowed future change boundary and mandatory negatives

1. **Full hook/native consent convergence.** Narrow edit to
   [hook](../../hooks/useProtectedDriveFileUrl.ts:143), plus its actual
   [test](../../hooks/useProtectedDriveFileUrl.test.tsx:16) and a focused real-helper
   integration test. Existing hook tests mock `authorizeOnline` as just loading a
   URL, so they cannot prove pre-consent HEAD traffic. Do not alter shared
   [browser helper](../../lib/drive-file-url.ts:99) to globally skip authorization.
   Actual accepted overlay is
   [withDeferredNativeProbe](../../supabase/test-support/090_candidate_native_interactive.mjs:12),
   not a source file under spike. It is historical fixture code, not production.

   New tests must retain real hook→helper→fetch behavior: embedded active/locked/
   expired bootstrap never performs automatic body/HEAD/background cache; allowed
   scoped issuance is distinguished from byte access. Cancel after native confirmation
   presentation yields GET/HEAD/provider0. Normal browser still HEAD-probes;401
   renews at most once,403 is final with no fallback. Reconnect/stale responses,
   file identity changes, activeA→B/logout and cancellation cannot install old URLs.
   Embedded mode only defers byte access to the native capability; it is **never**
   permission and cannot weaken issuer/server tenant/Auth checks.

   [Native screen](../../apps/mobile/src/webview/NativeWebViewScreen.tsx:389) runs the
   capability only after confirmation; [capability](../../apps/mobile/src/webview/platform-capabilities.ts:315)
   owns download/one recovery/presenter close/removal. Preserve those modules unless
   a reproduced integration failure requires a separately bounded change.

2. **Actual diagnostic sinks, not just source string removal.** Narrow edit to
   [mini player](../../components/FloatingMiniPlayer.tsx:211) and
   [workspace](../../components/repertuvar/RepertoireWorkspace.tsx:842); add focused
   component error-event tests at `components/FloatingMiniPlayer.private-file-log.test.tsx`
   and `components/repertuvar/RepertoireWorkspace.private-file-log.test.tsx`.
   Trigger each real error handler and inspect all console sink arguments. Put
   synthetic capabilities/JWT-like markers into `src`, error.message and unexpected
   IDs. No raw URL/token/object/message propagation; retain only whitelisted event/
   numeric error code and safe operational context. Merely removing `${el.src}` but
   keeping a capability-containing `${err?.message}` does not meet acceptance.
   No new general logging service, UI redesign or broad player refactor.

3. **Retained Auth expiry source gap.** Extend the actual
   [actor SQL test](../../supabase/tests/090_private_file_ticket_authority.sql:195),
   connected four-family helper and separate repertoire/actual HTTP tests; preserve
   legacy tests as a control. Before choosing pending-migration edit versus an
   explicit forward delta, record affected applied/local consumers, backup/restore
   provenance and exact new source identity. Current target lacks090actor, but that
   does not prove every historical isolated consumer is unmodified. No old manifest
   or accepted SQL evidence is overwritten. A new delta's exact ID/path/hash must
   be recorded before rehearsal; do not run a placeholder or a directory glob.

   Reproduce a still-valid signed ticket with retained Auth row and past not_after;
   require denial of the next GET and HEAD across all five families/provider0.
   Null/future expiry positive controls and deleted session/ticket expiry/A→B/role/
   inactive-member/version/hidden-resource cases remain separate. Test actual
   service-only RPC invocation, anon/authenticated rejection, stable definer owner/
   empty search_path/private grants and concurrency. No service-role bypass or
   native-only expiry guess may replace server authority. Exact source repair,
   synthetic DB reproduction and HTTP acceptance remain NOT RUN.

Preserve [annotation shared TS](../../lib/repertuvar/annotation-types.ts), existing
embedded catalog/offline guards, file metadata, permanent WebViews, full feature
scope and old-web supported consumers. Do not touch sibling website, notes, provider
flags/objects or real users; do not add a new native Next API.

## Acceptance invalidation and existing tool limits

Any later product change creates a new converged component manifest with explicit
changed pins/parent refs and closure comparison. P1's610pins and accepted P2 are
immutable historical records, not editable green status. Reopen changed hook/log/
SQL integration and dependency behavior; retain unchanged tests only within their
actual scope. Fixture generators must not apply deferred-probe/cache/file-label
overlays a second time to already repaired product source. Use unmodified current
product flow for new acceptance, not a silently patched profile-only substitute.

Required later gates: focused real-helper/log/SQL negatives first; `pnpm check` for
web/shared changes, mobile typecheck/tests at integrated boundary; Android default
runtime, grouped iOS milestone (earlier for platform-sensitive changes). Consent,
PDF1→2/share-dismiss/return/close/remove/tenant revoke/persistence are agent-owned.
No owner manual QA. These checks have not run for any new source because none exists.

Newly explicit recovery limitation:
[historical overlap runner](../../supabase/test-support/090_http_overlap_runner.sh:45)
uses `pg_dump --schema-only --no-owner --no-privileges`, then grants test privileges
and applies an explicit historical chain including an undated prerequisite. It is
**not** a current-state clone, actual provider Auth/REST or ACL-preserving recovery
tool. It cannot prove grant/owner parity; never point it at a fresh protected restored
database or label its success full P3 acceptance. Its old expected database/ports are
not verified live handles. Preserve old test evidence; no runner executed/changed.

Use actual protected current restore preserving roles/owners/ACL/RLS/publications/
triggers for future mixed-client rehearsal. Apply only the observed dependency
branches from the delta inventory, recheck guards, then exact DB→Edge→repaired web/
mobile→activation. Keep current Auth/REST/cache/header and no-provider denial
negatives. R1 object/Vault/queue/secret/config exclusions stay explicit. Independent
review must inspect actual new manifest/diffs/locks/roles/recovery/stop tests; Jev or
self-review cannot close it. Match each external operation's target/version/data/
resource/cost/automatic-deploy effects/recovery to actual authority; no generic push.

## Pending method decision and exit

Historical applied statements are unavailable from the present ledger. The two
concrete choices are a genuine existing historical apply-source archive, or explicit
owner approval to replace only that unrecoverable historical equality requirement
with fresh protected current-state snapshot/isolated-restore catalog+ACL equality
and exact future-delta source/application provenance. No such approval received.
Neither choice lowers security/recovery/review acceptance or grants data export/
hosted writes/distribution. Original goal is NOT COMPLETE; no success waiver.

This continuation is PROGRESS: exact implementation/test boundary and acceptance
invalidation now recorded, plus a source-backed restore-tool exclusion. It is not
a verified wait or a repetition of the connection blocker. After scoped document
validation/commit, dependent closure waits for that evidence-method choice; no
new connection/password request or repeated historical body query will recover NULL.
TypeSafe full skill/live index used to keep exact rules deterministic; Jev0/$0new.
Resource preflight21,253,920KiB, <128KiBdocuments, no build/runtime/copy/download.
Local links/pin/secret/diff results and final free space are in the owning card.

### Blocking audit at exit

Same required historical-equality condition has persisted through three consecutive
goal turns: initial correct-project acquisition/ee7be6f, delta inventory/95b089d,
and this contract/audit continuation. Earlier independent preparation made progress;
it is now recorded. Fresh named correct-project read-only identity + exact existing
ledger SELECT at **2026-10-04T10:23:06.583Z** verifies68rows,15candidate IDs present,
10absent,all15relevant statement fields NULL,0available bodies. Only counts/identity
printed; no body/user rows retained, no mutation. This is blocker revalidation,
not an attempt to recover NULL or renew the full catalog/Edge/web observations.

No owner evidence-method answer or verified historical apply archive is available
in this task. No live process/job/restore handle is being waited on. All independently
ready authorized inventory/source/test/recovery/operation mapping is now recorded;
product implementation, backup export/restore/runtime or hosted operations would
expand this inventory's scope and cannot manufacture the required historical proof.
At successful scoped commit, the blocked audit threshold is satisfied: mark the
full goal BLOCKED (not complete/paused), retain P3 IN PROGRESS, and resume the same
objective after the explicit method decision or genuine archive evidence.
