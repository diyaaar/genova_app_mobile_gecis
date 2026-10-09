# P3 client-source convergence checkpoint

Date: 9 October 2026 (Europe/Istanbul). Primary sole writer, entry
`main/578feee519f8ab3e98148735463791f4d2118551`. Product code:
**071465fc8ccb33877341c85bb4c62e38aee4ca1c**. Local checkpoint PASS after
the exit checks/scoped evidence commit; whole090/P3 remains OPEN/NO-GO.
[Work card](../briefs/090-private-file-ticket-revocation-contract.md#9-october-client-source-convergence--consent-and-diagnostic-boundary)
→ [existing full contract](2026-10-04-p3-convergence-contract-audit.md)
→ [checkpoint](../teslim-rehberi/checkpoint.md).

## Observable changes, not a new release claim

The actual hook now distinguishes embedded rendering from normal browsers.
Embedded resolution still obtains an authorized scoped ticket; it does not run
an automatic HEAD, select browser offline bytes or start a background cache.
The native confirmation/download owner is unchanged. Browser resolution keeps
HEAD, one401/opaque-transport renewal and final403 refusal, not an offline bypass.
No service/tenant policy is inferred from the embedded flag.

A reproduced additional race allowed a late successful browser HEAD to publish
its old URL after tenant/logout cache invalidation. The helper now pins its
generation after the first valid issuance and refuses late probe/renewal work
after context changes. The issuer already guards its own pending request. Pinning
after first issuance is intentional: initial same-user session rotation can
legitimately clear the cache and must not reject the new session's own ticket.
The fresh-session regression passes. No broad cache/auth refactor was added.

Both actual media error handlers now whitelist only the event, static player
kind and numeric code1–4/null. They never propagate `src`, `message`, track IDs
or raw error objects. Actual error-event tests put synthetic capability markers
in all those fields and inspect error/warn/log/info/debug arguments. Invalid code
strings/objects/fractions/NaN/Infinity are not echoed. Stop/recovery behavior is
retained, rather than suppressing the event or replacing it with a no-op logger.

## Reproduction and verification

The first hook test fixture used a non-canonical ticket URL. The real issuer
correctly rejected its pathname/fileId; this was a fixture defect, not evidence
of a product defect. Only after aligning the synthetic response with the actual
issuer contract did the baseline reproduce five hook negatives: active/reconnect/
late-file automatic reads, permissive embedded offline selection and late browser
HEAD publication. The two real component handlers independently reproduced the
raw-source/message/ID sink leak. No authorization test was weakened to get green.

| Criterion | Required here? | Status | Actual execution / evidence | Limit |
|---|---|---|---|---|
| Embedded active/locked/expired real hook→helper/fetch, no automatic reads/cache | yes | PASS | New18-case integration suite; actual one-way runtime activation, real ticket/helper/web-auth code; synthetic Auth/lease/fetch boundary | No real Supabase Auth/RLS/provider or native runtime claim |
| Repertoire/legacy/assignment/review/comment issuance still authorizes and defers byte access | yes | PASS | POST-only assertions and bearer/lease checks; locked/expired issue/read0 | Chat-media is not an input of this hook; its existing helper tests remain in root gate |
| Browser HEAD/401<=1renew/403final, fresh same-user session and no offline fallback | yes | PASS | Real helper integration + existing helper/hook/link tests | Browser DOM/network seam, not browser E2E or hosted client proof |
| Reconnect/previous file/unmount/pending ticket invalidation/late browser HEAD | yes | PASS | Explicit current/old response, clear-generation and callback negatives | Tests lifecycle mechanisms, not hosted concurrent membership changes |
| Both real component error handlers, all diagnostic sink arguments safe | yes | PASS |22new cases, actual React components/AudioPanel/media error events/stores | jsdom; PDF renderer/annotation backend and ticket hook mocked only in workspace log test |
| Focused regressions | yes | PASS |18:25Turkey, `pnpm exec vitest run` six named hook/helper/player/workspace/submission-link files:6files/88tests | Local deterministic checks |
| Full web gate | yes | PASS |18:26Turkey, `pnpm check`: lint/typecheck,117files/1218tests, coverage91.5%statements/86.22%branches/98.24%functions/97.26%lines, SW syntax and Next15.5.25 production build | Not CI/deploy/E2E/live/native acceptance |
| Native consent ownership control | supplemental | PASS |9October, mobile `npx tsc --noEmit`, four named WebView/platform/recovery/controller Jest suites:108tests | Existing unchanged RN source; mocked native adapters, not Android/iOS simulator acceptance |
| Exact child/immutable parents/closure comparison | yes | PASS | [Generated613pin child](090/2026-10-09-p3-client-convergence-source.json), replay helper;610parent pins reproduced,606unchanged/4changed/3new tests | Child is NOT RELEASE READY; no historical P1/P2 rewrite |
| Diff, links, redaction, cleanup and separate scoped commits | yes | PASS at final exit | Source071465f; document/helper evidence commit follows. See final exit below | Self-review only, not independent review |
| Server retained Auth not_after / five-family HTTP | full contract part2 | NOT RUN | Server/SQL pins unchanged; next bounded outcome | Existing defect remains; no server lifetime acceptance |
| Current-source mixed-client/server/cache rehearsal, Android+iOS reacceptance, independent review | full contract part3/release | NOT RUN | Explicit next gates; old P2 records retain their dates | No beta/store/hosted promotion |

Exact focused files: `hooks/useProtectedDriveFileUrl.integration.test.tsx`,
`hooks/useProtectedDriveFileUrl.test.tsx`, `lib/drive-file-url.test.ts`,
`components/FloatingMiniPlayer.private-file-log.test.tsx`,
`components/repertuvar/RepertoireWorkspace.private-file-log.test.tsx`,
`components/assignments/SubmissionFileLink.test.tsx`.
Native control command selects `NativeWebViewScreen.test.tsx`,
`platform-capabilities.test.ts`, `private-file-ticket-recovery.test.ts` and
`native-bridge-controller.test.ts` under mobile/src/webview/__tests__.
Existing SafeAreaView/punycode/npm-config warnings are retained technical debt,
not newly fixed or treated as authorization/test failure.

## Source, factories and remaining compatibility

Child candidate **GENOVA-BETA-20261003-P1-CLIENT-090-20261009** reads the committed
unmodified product, no overlays. Four changed production pins and three tests are
the exact only product delta from frozenP1. All20Edge closures,46page/API entries,
native/SQL/shared annotation pins remain unchanged. Literal local imports842→843;
the only new edge is hook→embedded-web-runtime, already in the parent's graph.
AST graph equality is not a claim that every route was exercised.

Historical profile/native-interactive factories read immutable Git parents;
their accepted hashes/overlays were deliberately not changed or reapplied to
current source. The historical old-web backport generator uses selected current
nodes; it must be reassessed/re-pinned during part3 instead of silently applying
its browser-only assumptions to this child. Its old schema-only/no-owner/no-grants
HTTP runner is not recovery proof. No fixture build or current client acceptance
was manufactured from either historical tool.

## Resources, authority and next actions

During final security review, the complete Supabase skill/security checklist and
current [changelog](https://supabase.com/changelog)/[sessions guide](https://supabase.com/docs/guides/auth/sessions)
were inspected (Markdown fetch unsupported, normal HTML plus docs-search fallback).
No SDK/API/schema dependency upgrade is part of this client change. The unchanged
browser session lookup supplies a bearer, not server authorization. No user_metadata
authority, service key exposure, policy/grant/schema change or privilege bypass
was added. Retained-session server authority is still the explicit next checkpoint;
no hosted query was made merely to claim a client-local fix passed.

No download/install/VM/simulator/native build, private SQL/row/key read or AI export.
Initialfree11,873,752KiB; declared additional root output768MiB, historical estimate
477,820KiB. After root build:free11,355,880KiB; .next470,952KiB/coverage352KiB/
tsconfig.tsbuildinfo332KiB. After supplemental mobile tests observedfree11,285,612KiB,
still above default10,485,760KiBfloor. Other apps affect free space. One heavy process
at a time; no extension of the prior recovery-only disk waiver. Last dependent
root gate is complete; only these owned generated outputs are removed at exit.
Dependencies/global caches/user files/AVDs/simulators/backups/CLI marker preserved.
Jev0calls/$0new; no inferred later-day key authority or cost-saving claim.

1. Repair retained Auth not_after in one exact forward SQL delta, with applied/local
   consumer/protected recovery provenance retained, service-only grants/owner/search_path
   and actual all-five-family GET/HEAD negatives/positive controls. No native expiry
   guess or silent edit of previously accepted SQL/manifests.
2. Compose a further exact child with that server delta; run current unmodified
   mixed clients/cache/old-web and agent-owned Android/iOS acceptance under a fresh
   measured resource card. Do not give manual QA back to the owner.
3. Independent exact-package review/rehearsal/operation approval → P4storage → signed
   installed Android beta → remaining commercial feature matrix → both stores.

No push/deploy/DB/provider flag/real-user/file operation occurred. Sibling website
and retained notes/tables untouched. Code rollback is scoped revert071465f; it is
not server/data rollback. Required whole090/P3 rows stay open.

## Final exit

Exact child replay, unchanged P1 reconstruction, source/diff/self-review, document
link/redaction checks and owned generated-output cleanup recorded before the
scoped evidence commit. The local goal closes only after those actual checks and
the commit; no final full-P3/independent/platform status is inferred.
Owned .next470,952KiB/coverage352KiB/tsconfig.tsbuildinfo332KiB were verified as
non-symlink generated targets and removed after their last dependent check;
all three absent/free11,714,040KiB afterward. No runtime/service/device was started;
no other files or backup keys removed. New generator is syntax checked and child
byte replay PASS. Final6owned Markdown files/current090card:100local links,
0missing targets;8owned record/helper files0key/JWT/private-key pattern matches.
Scoped diff/syntax PASS; product diff from071465f empty. Source and evidence
commits are separate; CLI marker remains the only unrelated dirt.
