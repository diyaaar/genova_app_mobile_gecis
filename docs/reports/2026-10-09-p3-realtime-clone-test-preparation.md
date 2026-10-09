# P3 — exact046publication-membership clone-test preparation

Date:9October2026, Europe/Istanbul. Entry main/ec88f02, primary sole writer.
[Owning090card](../briefs/090-private-file-ticket-revocation-contract.md#9-october-compatibility-continuation--legacy-source-and-exact-recovered-state-sql).
Previous turn PROGRESS: sourceaa58bf8 repaired actual old-browser backport and
ec88f02 froze [the eleven-delta packet](090/2026-10-09-p3-compatibility-packet.json).
This turn PROGRESS: one clone-test portability blocker has a strict source adapter.
Neither turn is a verified live wait. Required actual clone/SQL remains NOT RUN;
resource permission still PENDING, goal INCOMPLETE/full090/P3OPEN/NO-GO.

## Contract and implementation

Original046test assumes exactly one previously published chat table. Captured source
already has three; deleting publication members or broadening grants to fit the
fixture would invalidate fidelity. Original migration/test and accepted proof stay
unchanged. New `spike/090-realtime-clone-test.mjs` is a pure builder, not a runner.

On the future exclusive fidelity-verified clone, capture table-membership pairs
from `pg_publication_tables` immediately BEFORE046. The builder derives exactly
the prior chat subset and complete expected membership (all prior tables plus the
three required chat tables). Replace only the old one-table fixture clause with
bidirectional `EXCEPT ALL` checks against temporary transaction-local expectations.
Rollback and all original role/policy/room/cross-choir/anon/revocation tests survive;
roundtrip assertion reconstructs the original test byte-for-byte after removal of
only those explicit additions. No GRANT, publication deletion, RLS disable, source
data mutation or managed Auth stub is added.

Metadata must match exact shape, bounded count and conservative identifiers;
duplicates/injection/unknown fields refuse before SQL construction. Capturing and
validating actual input provenance/fidelity are the future runner's obligations:
this pure builder cannot grant execution authority or prove the capture happened.
Pairs verify membership only, not publication owner/options/row filters/column lists.
Full captured metadata and full-row fidelity remain separately mandatory.

[PostgreSQL17 set operations](https://www.postgresql.org/docs/17/queries-union.html)
and [publication table view](https://www.postgresql.org/docs/17/view-pg-publication-tables.html)
support the comparison shape; documentation is not actual SQL execution evidence.
Installed TypeSafe/Supabase/Postgres skills and current docs were read. Jev is not
used for exact deterministic equality or authority;0newcalls/$0newinference.

## Acceptance and source identity

| Criterion | Required now? | Result | Evidence/limit |
|---|---|---|---|
| Known three-table clone shape plus unrelated table gets exact prior/final membership checks | yes | PASS |6Node source tests, generated SQL inspection; not SQL execution |
| Same-count substitution/missing/extra/duplicate/injection/unknown-shape/oversize negatives | yes | PASS |Pure JS/source mutation controls; not real DB/RLS |
| Original SQL/test bytes retained and all original authority labels survive | yes | PASS |Exact baseline SHA guard, roundtrip boundary assertion, unchanged tracked source paths |
| Lint/diff/local links and small scoped commit | yes | PASS |ESLint --no-ignore/diff/local link check; self-review only |
| Actual before046 capture, full clone fidelity and SQL/RLS/caller/concurrency checks | yes for original checkpoint | NOT RUN |6.5GiBresource exception has no explicit response |
| Managed Auth/REST/provider/browserbuild/mixedclients/Android+iOS/independentreview | later fullP3 gate | NOT RUN |No scope promotion from source tests |

| Source | SHA256 |
|---|---|
| spike/090-realtime-clone-test.mjs | 8ab0cfc4cde2427188e367514fbff773c5c7f0b8598069dd3fd13da1542300fd |
| spike/090-realtime-clone-test.test.mjs | c5e29536f652292740bcc34f55e542cfea8e57059e063767978af7661512922f |
| Original046test (unchanged) | d5e893eb6db9033b047a3e5247b7d02f622b634a623e77872c1699bb1844bd3e |
| Original046migration (unchanged) | 7e2528b5f1bbb1df5094bb65bfa9ff3dab51baa25419456e8bb5489569c52ea3 |
| Eleven-delta packet (unchanged) | fd8656f80c78889ab307ddaac9894545cd301d2949bd49c0f3185932e68d718c |

Commands: `node --test spike/090-realtime-clone-test.test.mjs`6PASS;
focused ESLint, source SHA/diff and local-link checks. No repeated unchanged full
source/platform/runtime acceptance. No root build/mobile output/runtime to clean;
small source/report retained (<64KiB new allocation). Last free9,944,836KiB (~9.48GiB)
below default10GiB. Unrelated CLI marker preserved/excluded. No VM/image/download/
restore/DBprocess/hostedaccess/provider/ownerQA/private SQL-row-key export.

NEXT requires explicit new resource approval: exclusive full pinned-image restore,
strict original fidelity, eleven exact deltas and actual clone-specific tests.
Fixture collision/original-row invariants and exclusive090peer target need that
real baseline; do not substitute another minimal/synthetic database. This adapter
prepares046acceptance but does not close it. Prior packet/history not rewritten.
