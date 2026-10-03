# Delivery checkpoint — single current execution pointer

Updated 3 October 2026. Planning baseline `main/cf28c30`; product source unchanged
by WF-017. This is the moving execution index, not a substitute for acceptance evidence.
Historical records keep their original date/revision. [Guide](README.md).

## Current position

- Active plan: **P1 — candidate manifest**, ready for execution; not accepted/frozen yet.
- Current documentation outcome: [WF-017](../briefs/WF-017-linked-delivery-playbook.md).
- Next product work card: candidate reconciliation in existing [090](../briefs/090-private-file-ticket-revocation-contract.md),
  then P2 grouped iOS. Do not create a replacement that closes 090's unrun rows.
- Single writer: primary agent. Unrelated `supabase/.temp/cli-latest` is modified;
  preserve and exclude it. Recheck actual ownership on every resume.
- No owned runtime started by this planning task; fresh resources required before builds.
- Whole 090/R1, active storage cutover, installed beta and two-store acceptance remain OPEN.

| Plan | Execution status | Input → required output |
|---|---|---|
| [P1](01-candidate.md) | READY; inventory seeds below, final manifest NOT RUN | WF-016 audit → reviewed candidate manifest |
| [P2](02-ios.md) | WAITING P1 | manifest + Android pins → current iOS evidence |
| [P3](03-release-package.md) | WAITING P2; safe inventory preparation possible | same candidate → reviewed compatibility/recovery package |
| [P4](04-storage.md) | WAITING P3 | authorized package → deployed compatible readers/writers and reconciled private storage |
| [P5](05-android-beta.md) | WAITING P4 | active services/storage → installed signed Android beta |
| [P6](06-full-product.md) | WAITING P5; decision preparation possible | beta evidence → full preserved commercial feature matrix |
| [P7](07-stores.md) | WAITING P6; account/checklist preflight possible | full candidate → both-store availability and operational handoff |

WAITING is a dependency label, not proof that no preparation is possible. Only an
actual accepted output advances the active execution pointer. Planning acceptance
of WF-017 does not turn any row above into PASS.

## P1 input seeds — not a release manifest

| Component / observation | Recorded identity or fact | Evidence limit |
|---|---|---|
| Planning checkout | `cf28c30` before WF-017 documentation | Verify new HEAD; not a production revision |
| GitHub main | `a13f696da8c731e9af2a2bce473d4f4ae4a81587` in WF-016 read-only check | Not current served Vercel proof; 363-ahead count belonged to `2652584`, not future HEAD |
| Browser private-reader candidate | `1a014c4e1927a03a7c67dd666a91a6006a28b6f8` | Local branch/candidate only |
| Embedded-profile candidate | `7cd8d460c68465055049dbf30192f7f5478bcf64` | Local branch/candidate only |
| Last full Android file source | `c2ec9b0`; 157 native/5 server/426 candidate pins | Synthetic emulator/dispatcher, not hosted/physical/iOS |
| DB/Edge outgoing set | NOT FROZEN | P1 derives exact files/checksums/compatibility; do not deploy all migrations by directory order |
| Storage snapshot | 42 objects/60,969,062 bytes copied; 49 MP3/192,361,428 bytes pending | Dated 070–076 evidence; inventory must be refreshed before writes |
| Latest iOS file acceptance | NOT RUN | Earlier iOS evidence predates this candidate's changes |

Evidence: [Jev/source audit](../reports/2026-10-03-jev-conversation-direction-audit.md),
[Android full flow](../reports/2026-10-03-android-full-share-flow.md),
[browser candidate](../reports/2026-10-03-production-baseline-local-candidate.md),
[profile candidate](../reports/2026-10-03-minimum-embedded-profile-candidate.md),
[R1 recovery](../reports/2026-10-02-hosted-revocation-r1-recovery-rehearsal.md).

## Next three actions

1. In 090, identify one candidate ID and fill P1's component/feature/dependency manifest
   against current refs and hashes. Separate shipped, candidate-only and excluded features.
2. Trace remaining release blockers to P2/P3/P4 owners; verify Android evidence reuse
   at exact file hashes. Do not make every local commit part of the candidate.
3. Accept P1 only when its manifest rows pass; start agent-operated P2 with installed
   iOS toolchain and measured disk/cleanup preflight. No owner manual QA.

## Pending decisions / authority

Owner selected the beta cohort this turn: existing choir's small group first, then
a second independent choir ([decision #34](../../KARARLAR.md#initial-beta-cohort--3-october-2026)).
Exact recipients/channel remain to be defined; selection is not distribution authority.
Owner also requests broad useful Jev assistance in the agent's own work; use bounded
redacted semantic questions, record cost, verify answers and preserve key/data boundaries.
Other product choices are staged in the [guide](README.md), not silently defaulted.

The owner approves the end-to-end direction and asks for executable plans. Ordinary
scoped local implementation follows applicable existing approval. Before each external
operation, match exact target/version/data/cost/recovery against the actual granted
scope; preserve valid earlier approval and ask only for a missing authority. This
planning checkpoint performs no push/CI/deploy/DB/provider/account/distribution action.
No sibling-site changes or old-note/source deletion. All mobile QA is agent-owned.

## Resume/exit record format

Replace the current pointer, not historical evidence, after each coherent checkpoint:

```text
Date / active plan / owning brief / writer:
HEAD + component manifest + owned dirty paths:
New observable outcome; PASS / FAIL / NOT RUN evidence links:
Source/config changes invalidating earlier checks:
Unresolved required gates / actual blocker / decision needed:
Failed attempts and changed method (if any):
Owned processes/artifacts + size + cleanup/expiry + available disk:
Existing applicable authority / external step still needing scope:
Next one outcome and at most three actions:
Code commit + separate document commit:
```
