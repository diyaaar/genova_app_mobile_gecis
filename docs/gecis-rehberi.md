# Genova — migration reference

Updated 13 October 2026. This reference supports technical work; it adds no agent
startup, task-size, model, delegation or retry restrictions beyond [AGENTS](../AGENTS.md).

Use [MIGRATION](../MIGRATION.md) for the screen inventory and
[decisions](../KARARLAR.md) for product choices. Check relevant current code and tests
before relying on a dated status. The old delivery sequence is reference material
pending a new production roadmap.

For a migrated flow, understand its web/native ownership, shared data contracts,
authorization, platform behavior and error handling. Preserve features and tenant
isolation. Evaluate architecture changes on their merits and explain product-impacting
tradeoffs; an old implementation recipe does not prohibit a better technical solution.

Verify the actual affected layers. Shared TypeScript tests do not prove native
rendering, hosted authorization or release readiness. Automate mobile checks with
available tools and record any real environment blocker rather than assigning owner QA.

At handoff, provide the outcome, relevant sources, changes, checks, outstanding work
and applicable authorizations. The [handoff template](templates/ajan-devir.md) is optional.
