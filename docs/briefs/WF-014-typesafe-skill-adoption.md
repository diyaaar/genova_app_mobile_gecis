# WF-014 — TypeSafe skill adoption for Codex

Status: local workflow installation accepted, 1 October 2026. Sole writer: primary
agent. This is not a Jev runtime integration, model replacement, or provider release.

## Scope and authority

The owner explicitly requested the TypeSafe skill through the non-Claude installation
method and its use on this project. One result: install/register it for Codex and
retain the project instruction without changing application behavior. Entry state:
`main/aa3934c`, only unrelated `supabase/.temp/cli-latest` dirty, preserved unstaged.
Read AGENTS, short handoff/active context, delivery resource controls, brief template,
skill-installer, the complete upstream and installed TypeSafe SKILL.md, live docs index,
System One, agent-skill installation page and HTTP API contract. No delegation.

Actions: (1) inspect instructions and install one method; (2) verify registration and
record project use; (3) check local documentation/diff and commit only owned records.
Allowed repository files: AGENTS, this brief and the progress index. Outside-repo
installation: the CLI-managed global Codex skill and metadata. No application,
package/lockfile, DB, release, credential, real-data or paid inference changes.

Preflight free23,823,060 KiB before installation; conservative incremental budget
200 MiB for the small skill/package cache, above10,485,760 KiB floor. Installed skill
allocated16 KiB; observed post-install free23,825,088 KiB. No VM/device/build/test
environment; existing global caches preserved. No duplicate installation method.

## Result and design boundary

Executed `npx --yes skills add typesafe-ai/skills --skill typesafe-ai --agent codex --global --yes`.
Exit0; installed `/Users/alidiyarduran/.agents/skills/typesafe-ai/` (SKILL.md + LICENSE).
`skills list --global --agent codex --json` confirms TypeSafe registration. Installed
SKILL.md SHA-256 `71ea90d7906c6554c4f4c460ef7361b2d26f59116ccdae986dc6d997b9389f52`.
The CLI reported an unrelated existing Claude git-hygiene YAML warning; TypeSafe
registration still passed. No other skill/configuration was repaired or removed.
The next agent turn should discover the installed skill; its full instructions were
also read directly for this turn. No claim that Jev is now the coding/chat model.

Sources: [upstream skill](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md),
[installation](https://docs.typesafe.ai/agent-skill),
[System One](https://docs.typesafe.ai/concepts/system-one),
[API](https://docs.typesafe.ai/api). Jev provides typed text judgments/probabilities,
not generated code/replies, images/audio/video analysis or deterministic authority.
Use its skill for project work, but preserve explicit Auth/RLS/tenant/role rules in
code. Before a concrete integration read relevant current docs/cookbook and evaluate
representative synthetic cases, uncertainty, bounded costs and failure behavior.

The supplied API key was **not stored, transmitted or tested**. No live authentication
or inference request. Recommend revoking/replacing the chat-exposed key before use;
rotation has not been performed. Future keys must remain server-side/private, never
in NEXT_PUBLIC/EXPO_PUBLIC variables, committed artifacts or logs. The owner still
needs to clarify application AI feature vs development decision-support use and the
bounded provider/data/budget scope. Skill installation does not authorize broad
repository/user-data upload or replacing the existing Gemini dependency. Source
inspection finds @google/genai in package.json but no matching runtime invocation in
the searched app/components/lib/supabase-functions paths; this is not a full AI audit.
090 and the Android beta queue remain open and unchanged.

## Acceptance evidence

| Criterion | Required? | Status | Evidence / boundary |
|---|---|---|---|
| One Codex installation method succeeds | Yes | PASS | Explicit agent/global npx installation, exit0 |
| Skill registered and complete instructions read | Yes | PASS | CLI registration, two installed source files, hash above |
| Project use persisted without runtime/authority changes | Yes | PASS | Narrow AGENTS instruction; no product edits |
| Local document links, consistency, diff and self-review | Yes | PASS | Changed-record checks; self-review, not independent |
| Provider/key/inference/application integration | N/A in installation scope | NOT RUN | Explicitly deferred; no exposure of supplied key |
| Product tests, hosted/native/device/release | N/A, no product code changed | NOT RUN | Installation/docs cannot accept those layers |

Rollback: revert owned workflow records and use the skills CLI's targeted removal
if the owner requests uninstall; do not touch other skills, caches or credentials.
Next: clarify the intended Jev use before implementing or making provider calls.
