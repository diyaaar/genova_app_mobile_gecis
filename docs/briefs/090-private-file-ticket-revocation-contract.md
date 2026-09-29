# 090 — private-file ticket revocation contract before Android beta

Status: IN PROGRESS / decision checkpoint, 29 September 2026. Primary agent, single writer.
One result: define an honest, uniform online access-after-revocation contract for five private
file families before `mixed`/`r2-required` cutover. This brief does not authorize live writes.

## Work card / transition start check

The owner's “devam” resumes the Android-first Drive-exit queue after local 089. Read AGENTS,
handoff/active, WF-009/WF-013, current delivery controls, migration guide, MIGRATION, decisions
#28–31, 015/021/053, 065/076 and the R2 runbook. Verified `main/62254f2`; only unrelated
`supabase/.temp/cli-latest` dirty. Profile/repertoire remains the existing native/web shared
file service; no new Next API or client-facing ticket response is proposed. The local source is
authoritative over older acceptance prose.

Three next actions: (1) inventory the actual ticket issuance and GET/HEAD authority for five
families; (2) confirm the online revocation expectation with the owner; (3) if confirmed, scope
one coherent server-side implementation/test slice with old-client compatibility and fail-closed
rollback before product edits. Document-only preparation uses <100 KiB, no build/download/VM;
free 32,966,244 KiB before work (>10 GiB). Preserve original restore, private copy evidence,
global caches and all already-approved source bytes.

Allowed for this preparation: this brief, the narrow runbook claim correction, handoff/active/
progress. Product/server/schema tests require an implementation amendment with exact paths,
resource estimate, real PG/Auth/HTTP and web/mobile compatibility gates. Existing local code/
tests/commits are historical and not fresh 090 acceptance. No subagent; no shared-tree writer.

## Verified current behavior and decision

| Family | Issued ticket | GET/HEAD at current source | Online switch/revocation guarantee |
|---|---|---|---|
| `repertoire-file` | Signed file+choir+1-hour expiry; no actor/session | Admin file row lookup, then legacy/verified R2 provider | Previously issued URL remains usable until expiry if file remains |
| `assignment-file` | Signed file+choir+1-hour expiry; no actor/session | Admin version row lookup, then R2 | Same previous-URL window |
| `assignment-review-file` | Signed actor+file+choir+expiry | Service-role `can_read_assignment_review_audio_058` then row | Active actor/role/version rechecked; selected Auth session/choir not rechecked |
| `repertoire-comment-file` | Signed actor+file+choir+expiry | Service-role `can_read_repertoire_comment_audio_059` then row | Active actor/visibility rechecked; selected Auth session/choir not rechecked |
| `chat-media-file` | Signed actor+file+choir+expiry | Service-role `can_read_chat_media_060` then row | Active actor/room rechecked; selected Auth session/choir not rechecked |

Evidence: `supabase/functions/repertoire-file/{ticket,index,handler}.ts`,
`supabase/functions/assignment-file/{ticket,index}.ts`, corresponding review/comment/chat
`ticket.ts` and `index.ts`, SQL functions in 058–060. Native private PDF cache is cleared on
tenant switch; this is client hygiene, not bearer-URL revocation. 021/053 intentionally accepted
the previous one-hour sessionless repertoire behavior. The R2 runbook's blanket “actor-bound
ticket and live authorization” sentence was therefore inaccurate for two families.

Owner choice pending: should a previously issued URL be rejected on the **next online GET/HEAD**
after membership/role removal or same-session choir switch? Recommended yes for commercial
tenant isolation. This is a new product/security contract, not a silent reinterpretation of
021/053. It does not promise cancellation of already-streaming bytes or remote erasure of a file
already downloaded offline. Existing ticket-only audio/score consumers must retain their URL
shape; a server-issued version transition must define the brief expiry overlap/denial behavior.

If owner selects immediate next-request refusal, candidate implementation is actor- and
session-bound tickets plus an atomic server-owned access check for file, choir, active membership,
session selection and family-specific visibility on each GET/HEAD. Do not substitute separate
admin queries or claim a client cache clear is server revocation. Preserve POST's real Auth/RLS,
200/206/416, MIME, no-store, Range/seek, legacy/mixed/R2-required behavior. Later local tests
must include A/B multi-membership, revoke/switch, stale v1 tickets, roles, expiry/tampering,
R2/legacy source refusal and concurrent decisions. A session selection check alone is not Auth
logout revocation; define/test that boundary explicitly. All hosted schema/Edge/flag/Drive ACL,
provider copy, push/deploy and actual Android/iOS device checks remain separately gated.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limit |
|---|---|---|---|
| Five-family current ticket/read authority inventory and historical contract reconciled | Yes | PASS | 29 September source inspection above; no network/runtime mutation |
| Runbook avoids a blanket false actor-bound claim | Yes | PASS | 29 September narrow correction; five family differences and 090 link; link/diff gate below |
| Owner selects online next-request revocation expectation | Yes for product contract | NOT RUN | Asked as an explicit checkpoint; do not infer from “devam” |
| Product/DB/Edge implementation and real synthetic two-choir acceptance | Yes after contract selection | NOT RUN | Exact amendment, version/release order, local tests required |
| Hosted cutover/public Drive withdrawal/offline deletion/device/beta | Later separate authority | NOT RUN | This preparation cannot accept these layers |

Required NOT RUN keeps 090 open. A document correction may be committed as a partial checkpoint;
do not mark the product contract complete, hide the risk or weaken required tests. Self-review is
not independent review. Rollback of preparation is a doc revert; schema/data/provider rollback
requires separate evidence and authority.

Preparation self-review: old URL persistence is a source-level inference, not a fresh actual
GET-after-revocation runtime test. After the owner's choice, next required step is a bounded
implementation amendment and red/green local runtime proof, not hosted activation.
