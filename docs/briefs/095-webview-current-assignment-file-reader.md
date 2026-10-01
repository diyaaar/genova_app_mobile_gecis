# 095 — Current assignment files in permanent WebView

**Status/date/writer:** LOCAL WEB ACCEPTANCE COMPLETE / 1 October 2026 / primary agent, sole writer.

**Observable result:** The permanent chorist-detail WebView and its existing assignment-detail
continuation read the selected immutable assignment version, never a stale legacy Drive link
when a version pointer exists. Pending, denied or superseded reads expose no stale link.

## Start and bounded work card

- Verified main `7831ee8`; only unrelated `supabase/.temp/cli-latest` is dirty and remains unstaged.
- Read AGENTS, handoff, active context, transition guide, work cycle, template, delivery resource
  controls, decisions 28–32, MIGRATION route ownership and 057's mixed-mode contract.
- Confirmed `lib/korist-performance.ts` omits `current_file_version_id`; `HomeworkCard` selects
  raw Drive before private reads. Assignment detail already selects the pointer but also prefers
  raw Drive. Existing assignment-file Edge owns server-side actor/session/choir/version authority.
- Native repertoire/audio remain native; chorist detail remains permanent WebView. No native
  assignment rewrite, schema, authorization-policy or ticket change is part of this result.
- Three actions: add one shared version-first link and propagate the projection; prove selection,
  denial, late completion and legacy compatibility with focused tests and an actual local browser;
  run root gates, review, record, commit and remove owned outputs.
- Exact local exit: all required rows below PASS. Android connected assignment-file integration
  is the following 090 checkpoint, not inferred from Chrome or component tests.

## Resources and scope

Measured free space 23,409,084 KiB (~22.33 GiB), above the 10 GiB floor. Reuse installed Node,
pnpm and Chromium. Additional peak <=2 GiB: `.next`, `coverage`, `test-results`; one heavy process
at a time. Remove these owned outputs and stop the loopback server after recording small text
evidence. Keep dependencies, existing AVD/caches and original 068 database unchanged.

Allowed: `components/assignments/SubmissionFileLink*`, the two existing detail pages,
`lib/korist-performance*`, focused `tests/e2e/assignment-files.spec.ts`, optional installed-browser
selection in `playwright.config.ts`; bounded `spike/typesafe/jev-095-evidence*` advisory tooling,
redacted `docs/reports/095/` evidence; this brief and narrow
handoff/active-context/progress updates. Read existing hook/client/Edge contracts without changing
authority. User's continue authorizes scoped reversible local implementation, tests and commits.

Preserve assignment/history metadata, review permissions, performance metrics, route/query
continuation and `data-genova-file-*` bridge attributes. Legacy-only records retain mixed-mode
compatibility. No new public URL for private versions; UI denial cannot bypass the Edge reader.
Existing offline bytes are not recalled. No live provider/DB/Edge, credentials, real data/users,
push/deploy/CI, hardware or external share. No delegation. Supabase documentation confirms
projection does not replace RLS; current engine changelog is N/A to this no-schema change.
TypeSafe remains advisory, never an access-control or automatic acceptance authority.
One optional Jev citation-check call: <=24,000B, <=16 questions, 45-second timeout, no retries,
estimated ceiling $0.002. Today-only authorized key via non-echoing ephemeral stdin, never files,
arguments/public env or evidence. Freeze primary labels before calling; retain disagreements.

**Rollback:** revert the local code checkpoint only; keep backend and immutable versions intact.
No DB down migration. Stop on ambiguous authority, unexpected shared-data change or resource floor.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status | Date, revision, environment, command/scenario | Evidence and limits |
|---|---|---|---|---|
| Actual performance load preserves selected version and member/assignment filters | yes | PASS | 1 Oct, `ee7be64`, focused Vitest3 cases | Mocked database response/projection, not RLS proof |
| Version-first UI; no Drive or stale-link fallback on private denial/malformed pointer | yes | PASS | 1 Oct, `ee7be64`, focused component12 cases | Actual hook, mocked ticket/HEAD/cache boundaries |
| Source/identity replacement cancels late publication; legacy-only compatibility and bridge metadata | yes | PASS | Same focused tests and final Chrome | No server revocation claim |
| Actual chorist page browser shows private link and denial without a Drive link | yes | PASS | 1 Oct19:58 Istanbul, fresh production source `ee7be64`, Chrome8 cases including assignment continuation | Intercepted synthetic network, not native/Auth/RLS integration |
| Fresh root `pnpm check`, diff/link/status review and cleanup | yes | PASS | 1 Oct, same source bytes `ee7be64`; root109 files/1090 cases/build; final local link/secret/diff review | Self-review, not independent review; detailed [record](../reports/095/2026-10-01-acceptance.md) |
| Native Android/iOS source/build acceptance | N/A: no native changes | N/A | Android connected WebView integration remains next090 checkpoint | Not beta/device acceptance |
| Hosted release, real data/provider and independent review | no; separate authority | NOT RUN | none | 090 and commercial goal remain open |

## Result / next checkpoint

All five required local-web criteria passed; broader090 remains IN PROGRESS. Source/test
commit `ee7be64`; separate planning/tooling checkpoint accompanies it. No push/deploy.
Actual commands, failures, advisory/costs and cleanup: [acceptance record](../reports/095/2026-10-01-acceptance.md).
Next single action: connected Android assignment-version WebView acceptance through actual local
Auth/RLS/Edge and signature-verified synthetic private bytes, including A→B and old URL refusal.
Do not infer it from these intercepted Chrome fixtures or historical legacy WebView acceptance.

Focused-test progress review: first run 14/15 passed; a blank legacy web-link incorrectly
suppressed the resolved protected URL. Fixed blank-link normalization. Second run caught a
test assumption: a fresh legacy cache legitimately avoids a network request under the existing
mixed-mode contract. Reassessed after these two failures; the uncached legacy test now explicitly
declares an absent cache, without weakening private-version online denial checks or changing
legacy offline policy. Next bounded action: rerun focused tests/types, then actual browser fixture.

Browser attempt 1 did not execute any scenario: Playwright's newly pinned managed Chromium
binary is absent. The installed Chrome binary is available. Use an explicit optional `chrome`
channel with a disposable test profile, preserving the default managed CI browser; no download,
user Chrome profile or account access. Reuse the already built synthetic production server.

Browser attempt 2 launched Chrome but no page/scenario: Playwright's separate ffmpeg video
binary is also absent. Reassessed the dependencies instead of installing a runtime: these
three scenarios do not require video, so this test file disables video while keeping failure
traces/screenshots and every assertion. Installed Chrome plus the existing build remain the
bounded third approach; no generated dependency/download and no acceptance criterion removed.
