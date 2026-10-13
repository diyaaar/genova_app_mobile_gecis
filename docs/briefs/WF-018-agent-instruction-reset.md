# WF-018 — agent instruction reset

Date: 13 October 2026. Status: COMPLETE for instruction cleanup and private Jev credential setup.
Owner request: audit project instructions, remove rules limiting the model's work,
then address a new production roadmap/checkpoints in a later phase. Jev assistance
is authorized as needed without a project call/cost cap.

## Scope and baseline

Entry HEAD: `878a2f2142825cca4357d6843026838ae0ec6025`.
Only pre-existing dirty path: `supabase/.temp/cli-latest`, left unchanged and unstaged.
Repository-wide tracked-file inventory: 1,743 paths at entry. Filename discovery also
included hidden/ignored first-party paths, excluding Git internals, installed/vendor
dependencies and generated build/cache directories. Content search covered instruction
references across first-party documents/configuration; this is an instruction audit,
not a line-by-line product implementation or production-readiness audit.

Found `AGENTS.md` and `.codex/config.toml`. No additional first-party `CLAUDE.md`,
`CLAUDE.local.md`, `GEMINI.md`, nested `AGENTS.md`, Cursor/Windsurf rule file,
Copilot instruction file or repository-local `SKILL.md` was found. `.github` contains
CI and Dependabot configuration, not an additional agent instruction source.

## Changes

| Surface | Treatment |
|---|---|
| `AGENTS.md`, `BASLA.md` | Short autonomous-work guidance; current request takes precedence over old workflow records |
| Work cycle / migration guide | Remove mandatory startup, tiny-task, model-tier, retry and delegation procedures |
| Brief / handoff / project-profile templates | Optional outlines; remove required forms, fixed action counts, split commits and fixed memory-file structure |
| Handoff / active context / checkpoint | Replace accumulated attempt instructions with current direction and links to retained evidence |
| Delivery plan | Remove executor/retry/disk/serialization directives; preserve technical/product scope as historical planning input |
| P1–P7 references and method source analyses | Explicit historical status; do not reimpose superseded procedural limits |
| Decisions / migration / memory indexes / brief archive | Record decision #37 and reconcile entry points so old NEXT directives cannot override the current request |
| Brief 090 | Add workflow supersession notice only; preserve the complete original contract and chronological test record |
| Jev guidance | Record current assistance authorization and optional use; remove expired per-task approval restrictions from current guidance |

Removed general constraints include fixed disk/attempt limits, one heavy process,
one writer regardless of file overlap, prescribed model tiers/agent depth, mandatory
briefs and reading order, separate code/docs commits, small-step-only execution and
automatic resumption of the old delivery queue. Collaboration still coordinates
ownership and integration; engineering chooses resources from actual conditions.

Preserved: product behavior/contracts, Auth/RLS/tenant/data protections, honest
verification, existing user changes, backups, and authorization for real external
operations. The project-scoped read-only Supabase connection and prompt configuration
in `.codex/config.toml` are unchanged: they control access to production data rather
than research, reasoning or local implementation. Runtime safety guards are unchanged.
The follow-up additionally authorized a private project credential file; no global
assistant settings, external skills or personal memory files were modified.

Old failed/unrun acceptance remains failed/unrun. Existing brief/report evidence is
not retrospectively rewritten to fit the new workflow. Earlier handoff/checkpoint
versions are recoverable from the entry Git revision; linked detailed reports remain.
The new production roadmap is not designed or executed by this change.

## Jev and review

Read the installed TypeSafe skill and live [API reference](https://docs.typesafe.ai/api)
and [quick start](https://docs.typesafe.ai/introduction/quickstart). Markdown endpoints
were unavailable; the normal documentation pages worked.

Initially no Jev key was present in the process environment. The owner's follow-up
explicitly requested searching old chats, using the key and persisting it project-wide.
Exactly one key was recovered from a user message in the 1 October conversation.
The key itself was never printed or placed in a versioned artifact.

One real API call reviewed generic workflow excerpts, evidence preservation and the
credential storage design: HTTP 200, `jev-1.13.0`, 1,297 input / 116 output tokens.
[Request](../reports/WF-018/jev-request.json) and
[response](../reports/WF-018/jev-response.json) preserve source text and advisory results.
All three choices were `aligned`; credential-design confidence was 0.76, so this is
advice only. File permissions, ignore state, persistence and diff contents are checked
deterministically. No provider billing total or independent engineering review is claimed.

After API success, saved `TYPESAFE_API_KEY` in root `.env.jev.local`, owner-only `0600`,
matched by the existing `.env*` ignore rule. The file is shared by project sessions
through documented environment loading; it is not automatically loaded by the product,
installed globally for other repositories, or committed. Existing scripts that accept
`TYPESAFE_API_KEY` can use `node --env-file=.env.jev.local <script>` from the repository
root. No product dependency or provider migration was introduced.

## Verification

| Criterion | Result | Evidence / limit |
|---|---|---|
| Instruction inventory and active-source review | PASS | Filename/content scans and direct reads; dependencies/build artifacts outside instruction scope |
| Current entry points agree on autonomy and deferred roadmap | PASS | Direct self-review plus retired-directive scan over 11 active entry/guidance files |
| Changed local links and incoming anchors | PASS | 31 changed Markdown documents / 610 local links pass target/anchor validation; no broken incoming anchors to rewritten entry points |
| Historical 090 and P1–P7 bodies retained | PASS | All 8 original bodies match entry HEAD byte-for-byte after the added notice |
| Product/runtime/config unchanged; unrelated CLI marker excluded | PASS | Only Markdown/JSON evidence is versioned; production MCP config byte-identical; CLI marker left unstaged |
| Whitespace/diff review | PASS | `git diff --check`; self-review, not independent review |
| Jev key works and persists privately | PASS | HTTP 200; fresh Node process loads saved env; mode 0600, ignored/untracked, no key in versioned diff/evidence |
| Product builds, hosted/device/release checks | N/A | Documentation-only change; no production acceptance claim |

## Continuation

After this cleanup, assess actual product state and define the new production
roadmap and outcome checkpoints with the owner. Do not automatically resume the
old resource-blocked runtime. Remaining product gaps are inputs to that next phase.
