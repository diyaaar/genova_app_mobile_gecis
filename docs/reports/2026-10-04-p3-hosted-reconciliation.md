# P3 — correct-project access recovered and hosted identities reconciled

4 October 2026 (Europe/Istanbul). Entry `main/24d157c`; one primary writer.
Candidate GENOVA-BETA-20261003-P1, frozen productc2ec9b0,610pins unchanged.
[090 card](../briefs/090-private-file-ticket-revocation-contract.md#4-october--p3-inventory-resumed-with-existing-named-mcp-credential)
→ [checkpoint](../teslim-rehberi/checkpoint.md) → [P3](../teslim-rehberi/03-release-package.md).
[Digest-only machine evidence](090/2026-10-04-p3-hosted-inventory.json).

**Connection blocker REMOVED. P3 remains IN PROGRESS; no promotion or whole090
closure.** Exact current SQL catalog and Edge identities are now obtained. Historical
applied SQL statement checksums remain **UNAVAILABLE: NULL ledger statements**, not
an unattempted query or source mismatch. Required historical equivalence is not
silently waived; the inventory goal is not declared complete. The next recovery
package must use actual current-state provenance and explicitly address this limit.
No live data, schema, deployment, credentials, configuration or product code changed.

## Scope, method and correction

Owner authorized existing local/project credential discovery/reuse and signed-in
Genesinova Chrome, then confirmed proceeding. Complete OpenAI and TypeSafe skills
read; [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp) and
[official Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp) checked.
No inference needed for deterministic metadata work: Jev0calls/$0new estimated
inference cost. No assumption of permission to reuse the Jev key on another date.

Root env has correct project public/service credentials and DB password; project
`.codex/config.toml` already has the named correct-project read-only MCP URL.
Existing Antigravity `supabase-genesinova` config contains its existing PAT. Values
never printed/copied/persisted, no app key or DB password substituted for MCP.
No new PAT/OAuth grant, config edit, installation or other account. The earlier
observation “tool not exposed in this turn” was correct; the conclusion that no
usable configured connection existed was incomplete. Do not repeat installation
requests or ask the owner to supply a key already available locally.

The bounded internal [helper](../../spike/090-p3-hosted-inventory.mjs) connects to
the documented HTTP MCP using that existing **named** credential; fixed project
`hievmwwctjjlhmssoxsu`, read_only=true, database+functions only. Tool allowlist:
exact catalog SELECT, list_migrations, list_edge_functions, get_edge_function;
no account tools, management REST/psql fallback, mutation, log/user-row export or
automatic retry. Server0.13.0; identity `postgres/supabase_read_only_user`,
transaction_read_only=on, Postgres17.6. Protocol session header/initialized corrected
after one discovery failure; no security bypass. SQL envelopes are untrusted data.

Actual acquisition21:54:40–21:55:14UTC on3October (4October local). Source contents
used mechanically in memory and discarded; only names/metadata/byte counts/SHA256s
retained. Deployed packaging prefixes normalized explicitly; canonical paths must
be unique. TypeScript AST removes explicit type-only imports from a separate runtime
closure; full candidate closures remain unchanged. Matching files do not prove
executed authorization, transitive provider configuration or HTTP cache behavior.

Initial comparison erroneously treated NULL ledger statements as an empty SQL
script, and raw packaging path differences as code changes. Corrected locally
without another bundle fetch, retaining original acquisition/helper/snapshot hashes.
Final classifications below supersede those preliminary counts. First inventory
abort: plain PostgreSQL backslashes were treated as E-string escapes; corrected
and regression-tested. Unknown body syntax stays byte-hashed, not guessed equivalent.
No raw hosted body, secret or private row was included in a tool output or Jev.

## Exact current observations

| Layer | Current evidence | Boundary |
|---|---|---|
| Served web | Fresh correct-account Chrome Vercel overview still Ready productionApCrcavKPpHSdBzdpv8JvESEiKc5, main/a13f696da8c731e9af2a2bce473d4f4ae4a81587, alias app.genesinovachoir.com | Deployment metadata, not HTTP/Auth acceptance; no controls/settings changed |
| Migration ledger |68rows;15of25candidate source IDs present,10absent | All15relevant statements are SQL NULL. Hash of JSON null is recorded only as absence provenance; it is not the applied SQL checksum |
| Current catalog |83function definitions,74relations,225policies,378constraints,696columns; owner/ACL/RLS/search_path/effective role EXECUTE captured | Definition/expression/default values hashed, not retained. No actual role invocation or row behavior test |
| Source function bodies |65 latest definitions across25source SQL files:50body-token matches,4different,11missing | Conservative lexer preserves literals/case; exact byte hashes also retained. Body equality does not prove grants/policies/trigger effects or entire migration equivalence; overload details recorded |
| Public RPC requirements |31of38present,7missing | Presence is not functional/authorization acceptance |
| Deployed Edge |21slugs/numeric versions/bundle digest/JWT/import-map flags;17candidate sources fetched |17candidate deployments use no import map; retained extras not deleted or implicitly accepted |
| Edge source reconciliation |5full closures exact,6runtime sources exact with type-only omissions,6real source differences,3missing | Not “15changed”; omitted type-only sources are not executable runtime defects |

Missing source migration IDs:024,046,048,078,079,082,087,088,090actor,090legacy
(exact timestamps/hash paths in machine record). Absent ledger alone is insufficient;
current catalog separately verifies the missing/old definitions below. Do not apply
ten files blindly or replay the migration directory.

Missing required public RPCs: `save_repertoire_pdf_annotation_snapshot`,
`mark_chat_room_read`, `replace_repertoire_assignments`,
`submit_profile_change_request`, `review_profile_change_request`,
`private_file_ticket_authorized_090`, `resolve_legacy_file_090`.
Private helpers genova046/087/090 also absent. Current annotation columns have no
024revision column; snapshot RPC absent and updated-fields function body differs.

### Edge classification

| Classification | Exact slugs |
|---|---|
| Full candidate source closure matches |assignment-upload(v1),repertoire-upload(v1),choir-invitations(v3),create-choir(v5),resend-inbound(v6)|
| Runtime source matches; explicit type-only files omitted |assignment-review-upload,chat-media-upload,chat-media-lifecycle,repertoire-comment-upload,repertoire-comment-lifecycle,repertoire-file-lifecycle (allv1)|
| Real source differences |repertoire-file,assignment-file,assignment-review-file,repertoire-comment-file,chat-media-file (allv1),drive-manager-v2(v22)|
| Candidate slug absent |legacy-file,link-preview,account-recovery-006|

All five private readers deploy family ticket.ts, lack shared090authority/v2 modules,
and have changed entry/shared handler digests. This extends the earlier visible
chat-source finding to exact five-family source evidence. Reader gateway verifyJwt=false
matches the candidate, but source does not. drive-manager-v2 entry differs and
gateway verifyJwt=true versus candidatefalse. Test compatibility before any change;
do not silently toggle gateway verification. Retain drive-manager,drive-manager-test,
send-email,send-push-notification; existing consumer scope remains to be assessed.

## Prioritized findings and minimum next package

| Severity | Evidence / files | Meaning and bounded next action |
|---|---|---|
| CRITICAL release gate: next-request authority chain not deployed |Five reader digests above; public.private_file_ticket_authorized_090/resolve_legacy_file_090 absent; served old Next route. Sources:090actor/legacy migrations, shared private-file-authority/ticket-v2, five Edge readers, app/api/drive-file/[id]/route.ts|Current target cannot be called equivalent to accepted localv2. Rehearse compatible authority DB → five readers + legacy reader → repaired web; deny stale actor/session/member/role/tenant URLs before provider. No live exploit test or rollout here|
| IMPORTANT release gate: active-membership repair absent |Three actual helper bodies match005, not078; current_choir_id/current_choir_member_id/set_active_choir catalog hashes. Source20260928140000_active_membership_revocation_078.sql|Not just missing ledger: actual old behavior source identity confirmed. Use restored current DB, test deactivation/multiple memberships and concurrent selection, apply exact078only after fresh recovery/review|
| IMPORTANT ACL repair absent |mark_chat_message_status actual anon/authenticated/service_role EXECUTE=true;079requires onlyauthenticated; source20260928150000_message_status_rpc_privileges_079.sql|Body matches043but role ACL does not match079. Effective grant is not proof of anonymous data exposure; exercise actual role negatives, preserve ACL provenance and fix narrowly in authorized package|
| IMPORTANT exposed feature prerequisites absent |Seven RPCs/private helpers/024revision above;046048024082087088source|Read ordering/realtime, annotation save, atomic assignments/profile flows cannot be accepted merely because UI exists. Rehearse exact dependencies and tenant/concurrency negatives; do not silently hide product features|
| IMPORTANT full web/native convergence |Earlier hook HEAD/log findings still apply; hooks/useProtectedDriveFileUrl.ts,lib/drive-file-url.ts,components/FloatingMiniPlayer.tsx,components/repertuvar/RepertoireWorkspace.tsx|Local narrow hook/log card: unmocked consent/probe regression, safe log-sink assertions; preserve browser probe401renewal/403refusal. Reopen only affected P1/P2pins/platform evidence|
| TECH DEBT / recovery provenance limitation |15ledger rows have NULL statements; current catalog/source SHA observations retained|Historical statement checksum equality remains UNAVAILABLE, not PASS. Do not manufacture statements/checksums or modify ledger to “repair evidence.” Compare fresh protected current snapshot/catalog to isolated restore, then record exact future delta hashes and outcomes|

Next three connected actions (no bulk push/deploy):

1. Finish explicit actual-catalog-to-source dependency assessment for missing deltas;
   historical SQL-body gate remains open with its proven limit. Prepare the narrow
   full-source hook/log convergence card and focused regressions, not another roadmap.
2. Fresh protected current-state snapshot + isolated restore/rehearsal packet, using
   prior R1 exclusions/actual roles and synthetic old/new/mixed five-family negatives.
   Exact target/resources/cutoff/RPO/export authority must match; no new backup yet.
3. Independent review of exact reconciled DB/Edge/web/mobile manifest and recovery,
   then present exact operation scope/order/cost/stop/forward-repair before P4writes.

## Acceptance evidence and unrun layers

| Criterion | Required? | Status / evidence | Limit |
|---|---|---|---|
| Existing named correct-project MCP connection |yes|PASS initialize/SQL read-only identity, server0.13.0|Direct documented HTTP transport; tools are still not injected into this turn's tool list|
| Current ledger/catalog/Edge source/config observations |yes|PASS scoped acquisition + digest-only machine record|Current target identity/gap observation only|
| Historical applied SQL body/checksum equality |yes under original inventory card|UNAVAILABLE:15NULLstored bodies;10noledger rows|Not waived; original inventory goal not marked complete|
| Classifications/collector regressions |yes|PASS7new helper tests +3existing inventory tests|Synthetic/local parser/import tests, not provider security|
| Frozen product pins/prior artifacts unchanged |yes|PASS P1/P3 byte-equivalent verification,610pins|No product gates rerun because product/config/dependencies unchanged|
| Local links/diff/secret scan and scoped commit |yes|PASS at accompanying090checkpoint commit|Only task-owned spike/docs; CLI marker excluded|
| Fresh backup/restore, current full Next/Auth/RLS compatibility |required P3 package|NOT RUN|Prior R1/P2 evidence remains dated; metadata is not acceptance|
| Independent review, hosted writes/storage/beta/stores |required later gates|NOT RUN|Self-review is not independent review; no owner manual QA|

Resource preflight: free21,335,984KiB, exact candidate Edge closure sum595,719B;
<4MiBretained metadata estimate,16MiBresponse cap, one process, no install/build/
runtime/copy. Final machine record705,715B; no raw-source/ZIP export. Previous
browser ZIP location/status remains unknown; no prohibited lookup or cleanup claim.
Final free21,310,072KiB, above10GiBfloor; existing toolchains/userdata unchanged.
Credentials checked by boolean exact-value scans over task artifacts before commit;
no leaked credential values reported. No Jev call/cost or product test inflation.
