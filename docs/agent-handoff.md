# Genova — agent handoff

Updated 13 October 2026. Current direction: remove restrictive agent procedures first;
define a new production roadmap and helpful checkpoints afterward.
[AGENTS](../AGENTS.md) is the current workflow authority.

## Current work

[WF-018](briefs/WF-018-agent-instruction-reset.md) records the instruction cleanup.
The new roadmap has not been defined or executed. Old delivery ordering and
resource/model/retry rules are not the default assignment for the next session.
Use the current user request to select work and verify actual repository state.

## Product state carried forward, not re-tested here

- The last recorded five-family continuation remains incomplete:
  [10 October report](reports/2026-10-10-p3-managed-five-family-preflight.md).
  It stopped during image download before restore/API/matrix acceptance.
- The earlier managed current-read checkpoint has local acceptance:
  [report](reports/2026-10-10-p3-managed-read-compatibility.md).
  This does not establish full P3 or production readiness.
- [090](briefs/090-private-file-ticket-revocation-contract.md) retains detailed
  contracts, failures, tests and source references. Historical resource caps apply
  to their recorded attempts, not as general model limits.
- [Decisions](../KARARLAR.md) and [MIGRATION](../MIGRATION.md) retain product context.
  The detached sibling website is outside Genova scope.

Entry revision for this cleanup: `878a2f2142825cca4357d6843026838ae0ec6025`.
Pre-existing dirty path: `supabase/.temp/cli-latest`; left untouched.
No hosted state, device acceptance or release status was refreshed in this cleanup.
The owner's follow-up explicitly authorized recovery/persistence of the prior Jev key.
It is saved in Git-ignored `.env.jev.local` as `TYPESAFE_API_KEY`, mode `0600`;
load it into the process environment without printing it. One actual Jev call returned
HTTP 200 / `jev-1.13.0`; [advisory result](reports/WF-018/jev-response.json).
No key is included in versioned files. This is project-local reuse across sessions,
not an installation into other repositories or the global shell profile.
