# 090 — bounded Genova legacy reader compatibility proposal

2 October 2026. **LOCAL IMPLEMENTATION APPROVAL REQUESTED; NOT a release manifest/permission.**
This is the concrete scope expansion required by the reproduced legacy Next security failure.
The approved R1 recovery-only paths do not implicitly authorize a new production server package.
Sibling website is detached/out of change scope by owner#33 and stays untouched.

## One measurable result

Preserve legitimate legacy file use while an already-issued private URL cannot authorize its
next online GET/HEAD after session/membership/choir/role/resource access changes. Reject old
actorless tokens BEFORE provider access; authenticated old-shaped POST may renew safely.
Do not preserve unauthorized access, invent R2 versions or silently remove valid legacy files.
Previously downloaded/offline bytes remain non-revocable; an already-authorized in-flight
read can finish. This is the accepted next-new-online-request contract, not a deletion claim.

## Source facts that constrain the change

- Exact production a13f696 legacy client POSTs `{driveFileId,fileName,mimeType}` with Bearer
  Auth and expects `{url,expiresAt}`; cache keys include user/file but not choir/session.
- Exact/current Next GET/HEAD accept actorless signed file metadata without current authority.
  Safe regeneration cannot be achieved by cache clearing alone.
- Existing authorizeDriveFileAccess resolves repertoire, comment audio, public/private review
  audio and assignment submission aliases. Assignment submission may use trusted Storage
  metadata; legitimate legacy files can have NO immutable private-version row.
- Five existing v2 families predominantly use file/version UUIDs. They cannot replace every
  legacy alias without an explicit compatible resolver. New native allowed-reader classifiers
  are not proof that an older cached WebView accepts an arbitrary sixth URL.

## Proposed local implementation, no live mutation

1. Add service-only SQL legacy resource resolution/read authority, bound to verified actor,
   real Auth session, current selected choir, active membership, current role/voice scope and
   stable resource identity. Resolve existing trusted metadata, not caller filenames/paths.
   Issuance alias resolution and subsequent exact resource/alias-currentness checks must use
   explicit tenant predicates. Private review notes remain reviewer-only; hidden/withdrawn
   public review/comment visibility must be enforced. Unknown/ambiguous data fails closed.
2. Add a small `legacy-file` Edge reader with strict independently family-bound actor/session/
   choir/resource tickets. POST verifies Auth; GET/HEAD performs current service RPC BEFORE
   provider access. Preserve Drive/Storage sources without activating R2; share existing safe
   content/MIME/range/no-store helpers where contracts actually match. No direct object URL
   bypass, arbitrary upstream host, caller-controlled Storage bucket or implicit service fallback.
3. Turn existing Next POST/GET/HEAD into fixed-origin Edge adapters. Keep old POST response
   and relative `/api/drive-file/...` URL shape for existing clients; no new Next authorization
   service or provider reader. Fail old actorless tokens closed; support old cached URL401
   recovery only where actual client evidence proves it. Unsupported cached clients must
   update under an explicit transition plan, never a v1-access grace period.

Tentative bounded paths (source closure can add an actual imported dependency only with
recorded reason; not a broad refactor):

- New ordered090 legacy-authority migration + matching rollback-only SQL fixture.
- `supabase/functions/legacy-file/` index/handler/ticket and focused tests; one gateway section
  in `supabase/config.toml`. Existing shared authority/provider/content helpers only if needed.
- `app/api/drive-file-token/route.ts`, `app/api/drive-file/[id]/route.ts` and existing tests;
  a fixed-origin adapter helper under `lib/server/` with tests. No sibling paths.
- Existing legacy token module only if its obsolete use must be removed; do not rotate keys.
- Dedicated090 runtime/compatibility harness and090 brief/report/manifest/handoff indexes.
  No native UI rewrite, dependency upgrade, upload path, R2 flag or billing change.

## Required acceptance and evidence layers

| Gate | Required observable result | Current state |
|---|---|---|
| Exact old URL refusal | Forged/expired/actorless old GET+HEAD401, provider attempts0 | FAIL until implementation |
| Compatible issuance and valid legacy reads | Old POST shape/response; authorized non-versioned repertoire/comment/public-private review/submission Drive/Storage; GET/HEAD/Range/MIME/no-store | NOT RUN |
| Live identity in offline SQL rehearsal | Service-only actual RPC; anon/auth execution refusal; A→B, inactive/role/session removal, hidden/withdrawn/replaced resources, same actor second session | NOT RUN for new legacy RPC; existing090 caller layer PASS separately |
| Upstream error/authority failure/concurrency | Fail closed without provider on denied/error decisions; fresh request after committed revoke refuses; in-flight boundary explicit | NOT RUN |
| Exact old cache/WebView/PDF/audio | Current production source and proposed adapter in isolated runtime;401 recovery and403 stop; no uncontrolled retries or cross-tenant cached display | NOT RUN; unsupported clients require owner transition choice |
| Regression and reviewed closure | Existing five-family tests, focused new tests, pnpm check, exact import/SQL/config/client manifest and scoped review | NOT RUN for implementation; earlier manifest is insufficient |

Resource plan must use a fresh disk/process preflight. Earlier supported image/runtime was
cleaned; recreate only for a concrete new SQL/client runtime gate, one heavy process, measured
cap/watermark/floor. Original068 and protected R1 backup remain preserved. Do not download
or start another environment merely to prepare this proposal.

## Publication remains separate

After local acceptance, pin complete old-compatible SQL→six Edge readers→Next adapter closure
against the real production baseline; do not bulk-push hundreds of changes. Refresh exact
hosted catalogs/function identity/recovery cutoff as necessary. Review new migration ledger
strategy, stop/forward-repair and compatible old-client transition. Then request separately
scoped live DB/Edge/web authority and hosted synthetic acceptance. Existing five-reader
packet is NOT permission to add this sixth reader or run new SQL. No global next-request
guarantee may be claimed mid-partial deployment. If rollout fails, strict fail-closed repair,
not automatic restoration of actorless URLs or078's inactive-member defect.

This plan is primary-engineer source analysis, not Jev-generated architecture or independent
review. No new Jev call/cost. Its purpose is to obtain the material production-source scope
choice; it does not close the active R1 goal while required FAIL/NOT RUN remains.
