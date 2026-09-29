# 091 — Connected local private repertoire read

Status: COMPLETE LOCALLY / 29 September 2026 / primary agent, single writer.
Test/config commit `f1e19f8`; this evidence is a separate planning commit.

## Outcome and work card

One observable result: a synthetic member of two independent choirs obtains the correct
private PDF/audio bytes through the actual repertoire-file HTTP entrypoint, local Supabase
Auth/PostgREST/RLS and a signed loopback S3 endpoint; the wrong choir/user cannot issue a
file ticket. This joins the separate 021 (actual Auth/RLS, Supabase Storage) and 053 (actual
Edge/R2 transport, mocked Auth/REST) evidence. It does **not** accept hosted R2 or a phone.

Actions: (1) prepare an exact unlinked loopback runtime from schema-only local 068 restore,
with 053 and 078 migrations and synthetic fixtures; (2) exercise positive PDF/audio,
Range/HEAD and A/B/user refusals, explicitly record the existing one-hour bearer URL
behavior pending 090; (3) run required gates, inspect/clean owned artifacts and commit
test code separately from these records. Exit only when mandatory rows below are PASS.

## Transition startup and scope

Read `AGENTS.md`, `docs/agent-handoff.md`, `memory-bank/activeContext.md`, this brief,
`docs/gecis-rehberi.md`, `docs/ai-calisma-duzeni.md`, delivery controls, `MIGRATION.md`,
decision #29, 021/053/089/090 briefs and current handlers/runners. Verified HEAD `c1e6eea`;
only unrelated `supabase/.temp/cli-latest` is dirty and stays unstaged. Profile stays WebView;
repertoire/PDF client contract stays unchanged; this is backend integration evidence, not a
native feature change. Existing ticket revocation is **not** changed while 090 owner choice
is pending. Single writer; user authorized scoped local progress, not external actions.

Allowed paths: `supabase/test-support/091_*`, `.gitignore` exact generated runtime exclusion,
this brief and concise handoff/active/progress/plan evidence indexes. No production handler,
schema or client change unless a test first demonstrates a scoped defect and brief is amended.
No new Next API, provider credentials, real file copy, hosted DB/Edge, push, deployment,
real users/email, billing, device/store operation or changed revocation semantics.

## Resources, safety and rollback

Preflight 32,966,752 KiB free; no Colima instance or owned task runtime. Reuse installed
CLI/Deno/Node and prior five-service container image metadata: ~0.90 GiB compressed. One
`genova091` VM with root/data caps 8/8 GiB, plus 3 GiB download and <0.25 GiB fixture/log
allowance gives <19.25 GiB conservative peak, projected >13 GiB free above 10 GiB floor.
Only exact `spike/091-runtime`, `colima-genova091` and loopback API/DB/Edge/provider ports are
owned. Runtime secrets/synthetic users remain mode 0600/0700 and are deleted at the last
dependent check; source restore, dependencies and global cache stay intact. Guard source data
fingerprint before/after, unlinked runtime, exact project/ports, localhost and service key
issuer. Fail closed; stop/remove only owned services/VM/context/runtime. Local source clone
is not a current hosted backup. Code/test rollback is commit revert, not DB/copy rollback.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Date / evidence and limit |
|---|---|---|---|
| Exact resource, loopback, unlinked runtime and local-source preservation guards | Yes | PASS | 29 Sep: five exact local services, API/DB only `127.0.0.1:54491/54492`, unlinked `genova-091-runtime`, PG17, source six-table digest unchanged before/after; not an all-table or hosted backup |
| Actual local Auth/REST/RLS + 053 mapping + Deno entrypoint + signed loopback PDF/audio full/ranged/HEAD bytes | Yes | PASS | 29 Sep, `f1e19f8`: 40-page 65,905-byte PDF SHA-256 `39fcafaec0263d8c2429a66d4ea941180692a99749be398a1d48c8fd5397d6a3`; 48-byte WAV SHA-256 `eb2a1929367ffcb8ffc6fbd98f684a36928e46e1aa504cf10a45407d02ffe002`; full/range/HEAD, actual Auth/PostgREST/RLS and Deno entrypoint, signed synthetic S3; no real R2/provider or native client |
| Foreign choir/user/inactive/old-context ticket refusals and provider-not-hit | Yes | PASS | A user in selected A cannot issue B; B-only user cannot issue A; neither POST touched provider. Same-session switch to B refuses new A ticket and reads own B audio; inactivating A refuses new A ticket. Provider-hit absence was counted for the first two refusals, not separately for switch/revoke. Previously issued A URL still returns HEAD 200 after switch: **090 OPEN**, not a revocation pass |
| Root `pnpm check`, self-reviewed scoped diff and exact owned cleanup | Yes | PASS | 29 Sep: lint/typecheck, 103 suites/1042 tests, service-worker check and build PASS. Only `.gitignore` plus 091 test/config in code commit. VM/data/context, tunnel/listeners and secret-bearing runtime removed; build 477,432 KiB and coverage 348 KiB moved recoverably to exact `genova-091-20260929-*` Trash items; final free 31,410,024 KiB. Self-review only |
| Hosted R2/current production/device/full beta | Later separate gates | NOT RUN | Never inferred from this local integration |

Required FAIL/NOT RUN prevents 091 closure. Keep dated results and failed attempts here.
Self-review is not independent review. No subagent: the test and environment share one writer.

## Execution, failures and boundary

Exact synthetic runner: `pnpm exec tsx supabase/test-support/091_connected_private_r2_read.ts`
with `API_URL`, `DB_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` from the guarded **local** Supabase
stack. The fixture checks fixed loopback ports and the `supabase-demo` JWT issuer before
creating confirmed `example.invalid` Auth users. Schema-only source import retained owners/
ACLs; 053/078 applied only to the disposable target; target-only sibling notification hooks
were disabled. The Deno process could reach only local Auth and the signed loopback S3 server,
not Drive or hosted R2. Actual direct Auth sign-in, session choir switch and RLS file lookup
occurred; only object transport was synthetic. This is backend integration, not actual Android
PDF/audio client or R2 provider acceptance. Cloudflare R2 guidance was applied to distinguish
the S3-compatible local adapter check from provider/account claims; no fresh pricing claim.

Two initial test-driver failures were investigated before continuing: the first expected port
18091 while `Deno.serve` listens on 8000; the second compared Node `Buffer` and
`Uint8Array` constructors despite equal ranged bytes. Correcting the driver (not product code)
then passed in the same VM; no blind environment rebuild. Failed attempts left only synthetic
rows in the disposable target, all removed with its volume. No source or hosted data changed.

After the run, `supabase stop --no-backup` removed exact task containers/volumes, the explicit
SSH tunnel stopped, `colima delete genova091 --data --force` removed only the task VM/data,
and verified `spike/091-runtime` (including local secrets) was permanently removed. There are
no 54491/54492/8000/18092 listeners; default Docker context and local 068 restore remain.
Generated `.next`/coverage are recoverable in Trash, not retained as repository proof. The
unrelated `supabase/.temp/cli-latest` remains unstaged. No independent review, provider read,
hosted activation, public Drive withdrawal, real user, device or beta release occurred.

Next action: owner decision for [090](090-private-file-ticket-revocation-contract.md) and
separate approval for [077](077-repertoire-mp3-r2-batch-3.md) real-data copy. Keep 090's
previously issued URL risk visible until its contract and migration path are approved.
