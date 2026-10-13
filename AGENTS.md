# Genova — agent guidance

Updated 13 October 2026 following the owner's instruction to remove restrictive
agent workflows before defining a new production roadmap.

## Work autonomously

Follow the current user request and carry authorized work through implementation,
verification and delivery. Choose the research depth, tools, skills, task size,
refactoring, test order and working method that best achieve the result. Routine
technical decisions and reversible local work do not need repeated permission.
Use parallel work and delegation when authorized and useful; coordinate ownership
and integration to avoid overwriting another contributor's work. There are no
project-specific model-tier, agent-depth, retry-count or single-writer restrictions.

Briefs, templates and checkpoints are aids, not prerequisites for starting work.
Create or update them when they help continuity. There is no fixed reading sequence,
file/function size limit, number of next actions, mandatory code/docs commit split,
or requirement to create a brief or commit for each small step. Read the relevant
sources and keep changes coherent and reviewable.

This file is the repository's current agent-workflow authority. Older procedural
rules in briefs, reports, memory indexes, migration notes and delivery plans are
historical and do not reimpose removed limits. Their product contracts, actual
acceptance results and unresolved defects remain evidence. The latest user direction
supersedes older project workflow preferences; external platform/tool instructions
still apply. This cleanup does not declare the application production-ready.

## Useful project context

- Web: Next.js/React/TypeScript at the root; mobile: React Native/Expo in `apps/mobile/`.
  Use manifests and lockfiles for exact versions. `spike/` contains experiments.
- [Handoff](docs/agent-handoff.md) and [checkpoint](docs/teslim-rehberi/checkpoint.md)
  summarize current work. [Decisions](KARARLAR.md) and [MIGRATION](MIGRATION.md)
  describe product choices and screen ownership. Read them as relevant.
- Preserve user-visible behavior and shared contracts, especially
  `lib/repertuvar/annotation-types.ts`, tenant isolation, Auth/RLS and file access.
  Existing architecture guides implementation; propose evidence-backed improvements
  when useful instead of treating an old implementation choice as a model limitation.
- Supabase project: `hievmwwctjjlhmssoxsu`,
  `https://hievmwwctjjlhmssoxsu.supabase.co`; use `supabase-genesinova`, not another
  project's connection. The sibling public website is outside this project's scope.
- Git remote: `git@github-genesinova:genesinovachoir/genova_app.git`.
  Git identity: `genesinovachoir` / `genesinova.choir@gmail.com`.
- User updates and product copy are Turkish; agent-facing records are English.

## Jev and tools

The owner authorizes Jev use as needed for project analysis and development support
(13 October 2026), without a project-imposed call or cost cap. Use the installed
`typesafe-ai` skill and current provider documentation when using Jev. It is optional;
choose it where semantic judgments help, without requiring a separate approval for
each call. The owner also explicitly authorized retrieving the prior key and saving
it for project-wide use on 13 October. It is stored in the Git-ignored root
`.env.jev.local` as `TYPESAFE_API_KEY` (owner-only `0600`). Load it into the calling
process without printing it; Node scripts can use `node --env-file=.env.jev.local`.
New sessions should use this saved credential instead of searching chat history.
Keep credentials out of request bodies/logs and private user data out of AI requests.
Validate AI judgments against source and tests; confidence is not execution evidence.
This inference permission does not itself authorize a product/provider migration.

## Deliver verified work

Select checks for the changed behavior and risk. Existing entry points include root
`pnpm check` and mobile `npx tsc --noEmit && npm test` in `apps/mobile/`; use relevant
runtime/browser/platform checks for affected flows. Documentation changes need link,
consistency and diff checks. Run mobile automation yourself with available tools;
do not transfer manual Android/iOS QA to the owner.

Report actual results and limits. Distinguish local, simulated, hosted, physical-device
and release evidence. Keep failures/unrun checks visible; do not weaken required
behavior to obtain a passing status. Identify self-review accurately.

Respect existing user work, secrets and data. Choose resource use from actual capacity
and workload needs, with no fixed repository disk floor or concurrency cap. Reuse
useful environments and clean disposable owned output when appropriate; preserve
backups, personal files and unrelated caches. Do not remove runtime safety checks
merely because an agent workflow rule was retired.

Authority comes from the user's request and applicable standing approvals. Do not
ask again for authorization already granted. Publishing, sending to others, spending
beyond authorized Jev use, destructive changes and production data/credential actions
need applicable authorization. Prepare concrete work before asking for a missing
decision. This instruction cleanup alone does not authorize those operations.
