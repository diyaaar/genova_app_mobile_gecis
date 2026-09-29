# 089 — real two-choir profile submit / chef decision web acceptance

Status: COMPLETE LOCALLY, 29 September 2026. Main agent, single writer.
Scope `6db0144`; product/test `a8df751`. [Durable evidence](../evidence/089-real-profile-review-web/README.md).
Owner's “devam” continues the proposed local browser integration checkpoint after 088.
One outcome: actual product form → caller-JWT submit → own choir chef approve/reject → member
profile/history works through real local browser/Auth/REST/RLS/Next with 087/088, no response mocks.

## Startup / work card

Verified main `33f3ae0`; only unrelated `supabase/.temp/cli-latest` dirty, preserve unstaged.
Read AGENTS, short handoff/active, complete 086/088/evidence and 086 runtime/browser sources,
current profile review UI/API/push helper, brief template and delivery execution controls.
Profile remains permanent WebView; 087/088 SQL/transport results are historical, not browser proof.
Local PG17 source exists; Colima has no existing instance and Docker default context is preserved.
Installed CLI 2.107.0, Colima 0.10.3 and Chrome reused. No delegates/dependency upgrade.

1. Prepare one exact unlinked schema-only synthetic runtime, apply 078/082/087/088, disable
   sibling outbound hooks and push provider, confirm loopback/source guards. Prove early real
   form submission → chef approval before widening the matrix.
2. Own A/B approval/rejection/history/profile values, tenant/member/role/stale refusals and exact
   before/after DB checks. Separate actual UI clicks from authenticated browser HTTP probes.
3. Root gate, self-review/redacted durable evidence/source equality, exact runtime/VM/secrets
   cleanup and separate test vs record commits. Required FAIL/NOT RUN prevents closure.

Allowed: `supabase/test-support/089_*`, exact generated-runtime exclusion in `.gitignore`, this
brief/evidence/WF-013/handoff/active/progress. Runtime `spike/089-runtime`, profile `genova089`,
context `colima-genova089`, project `genova-089-runtime`, API/DB 54391/54392, web 31089.
Production amendment below is limited to the demonstrated review-label defect and stale read guard.
No hosted DB/Edge/provider, real accounts/mail, credentials, spending, CI/push/deploy, storage,
hardware, retention/price/lifecycle decisions or general-purpose test framework.

## Resources / environment / recovery

Free 33,647,696 KiB (~32.1 GiB), original PG restore read-only, dependencies/installed Chrome reused.
Fresh official Docker Hub arm64 manifest metadata (no image-body download): postgres 17.6.1.136
364,337,612 bytes; gotrue v2.190.0 24,986,909; postgrest v14.13 152,398,777; edge v1.74.1
378,113,351; official kong 2.8.1 48,524,280. Total compressed 968,360,929 bytes (~0.90 GiB).
Existing Colima root-image cache 324,568 KiB is preserved, not purged. Reduce task VM data cap
from historical 10 to 8 GiB: root/data caps 8/8 GiB + host download allowance 3 GiB + build 1 GiB
+ runtime/browser/logs 0.25 GiB = 20.25 GiB envelope; projected free ~11.8 GiB >10 GiB floor.
Only DB/Auth/REST/gateway/Edge, RAM 4 GiB/2 CPUs; no Storage/Realtime/mail/full-stack recreation.
VM host mount only exact runtime read-only; no context activation, host SSH config/agent forwarding,
or automatic port forwarding. Dedicated explicit loopback SSH tunnel; prove listeners before
schema/identities. Monitor actual allocated bytes/free space during heavy phases.

0700 generated runtime/0600 secrets hold only new synthetic confirmed `example.invalid` identities,
tokens and schema (no original users/choirs/content). Fresh original-source schema export retains
owners/ACLs; source six-table data digest compares users/choirs/members/repertoire/invitations/
active sessions before/after (not all source data). This is not a hosted backup or
fresh-cluster disaster restore. Disable target-only sibling callbacks; explicitly blank VAPID
environment before both build/server so profile decisions cannot use existing provider keys.
Browser denies non-loopback destinations; no fabricated responses. Confirmed users bypass email
delivery only. Manual synthetic catalogs/role test setup is not accepted administration UX.

At last dependent check: close task browser/web/tunnel, stop exact task containers/volumes with
no backup; delete only `genova089` VM/data via Colima; remove exact secret-bearing runtime permanently.
Recoverably move owned build/coverage/redacted logs; verify listener/context/profile/orphan disks,
source and final free space. Preserve all original configs/deps/restore and global caches.
Test revision rollback only; no hosted release/data rollback is implied. Product 087→088 DB before
web still requires current hosted backup/restore, sibling impact and separate release authority.

## Mandatory acceptance evidence

| Criterion | Required? | Status | Evidence / limits |
|---|---|---|---|
| Resource/loopback/provider/source guards and real synthetic local Auth/REST/Next runtime | Yes | PASS | Five exact services, PG17, loopback 54391/54392/31089, outbound browser denied, VAPID blank; six-table source digest unchanged |
| Early actual form → own chef UI approval → persisted member + decision/history | Yes | PASS | Installed Chrome 154.0.8037.58, zero response mocks; actual new 087/088 contracts |
| Own A/B submission, chef approve/reject, member profile/history and tenant-scoped reads | Yes | PASS | Real form/chef clicks, stored values/history; browser caller-token RLS request read sets A-only/B-only |
| Review/history shows own school/department/song names, no original-choir constants or stale-context overwrite | Yes | PASS | Real own catalog names; six component cases cover late request/catalog reads, immediate clearing, missing/error/corrupt references |
| Cross-choir/non-chef/inactive/stale/finalized refusals leave exact DB state unchanged | Yes | PASS | Actual authenticated browser HTTP refusals and all-member/request before/after digest; permission changes are pre-dispatch, not new in-flight HTTP concurrency proof |
| Root gate, scoped self-review/links/redaction/commits and owned runtime cleanup/source equality | Yes | PASS | 103 suites/1042 tests/build; focused 4/72; exact runtime/VM/data/context/listeners absent, original restore retained; self-review only |
| Hosted/push/mail/files/device/full commercial product release | No; later WF-013/delivery checkpoints | NOT RUN | No extrapolation from this bounded local flow |

Review after two failed approaches to a criterion or 60 active minutes; retain causal evidence and
choose a changed bounded action, not a blind environment rebuild. WF-013 step 5 remains PARTIAL.

## Causal scope amendment / 29 September

Early real form → chef approval → persisted member/history PASS before expanding. Expanded run
then waits for switcher on profile route; source proves TopBar intentionally absent there.
Test `pick` now navigates to actual repertoire main UI, never substitutes a fake response.
Fresh single-use invitation rerun will use exact owned fixture/volume reset, not another VM.
Initial prepare refused before service changes because generated config did not exist; generator
now copies known local config before checking its exact project, never falls back to linked root.

Actual `inspect-labels` browser probe PASS RED: approved A history shows own school/department
UUIDs, while own school name is absent. Source contains original-choir hardcoded maps and one
mutable module-global song map. This prevents meaningful review for new choirs; bounded fix is
necessary for this same submit→review user outcome. Allow only additional
`app/(main)/profil/degisiklikler/page.tsx` + `page.test.tsx`: fetch relevant own RLS catalog names,
keep labels page-local, refuse stale async publication after member/context changes. Preserve
review decisions/HTTP contracts, photo/details/history/order and permanent WebView boundary.
No new DB/API/role/catalog provisioning behavior. New required label/late-read acceptance above;
record main-agent self-review, do not call it independent review.

## Final result / limits

Review labels now come from caller-RLS referenced school/department/song rows, remain page-local
and cannot publish an old member/scope read. Failed/deleted labels show honest raw IDs; no
original-choir label fallback. Six component regressions include prototype-like corrupt IDs.
The first focused edit run caught an accidentally removed birth-date branch opener; restored
before green verification. After self-review added the prototype guard, the full gate was rerun
to 1042 tests (the earlier 1041 result is not final acceptance). Fresh single-use synthetic fixture
reset, same owned VM/images, precedes the final passing real-browser matrix.

Exact task containers/volumes, SSH forwards, `genova089` VM/root/data/context and secret-bearing
runtime permanently removed. Owned ~522 MiB build, coverage and check log moved recoverably to
Trash. Final available 33,076,684 KiB (~31.5 GiB); Trash retains blocks. Original local restore,
dependencies/configs/global caches preserved; only unrelated CLI marker remains unstaged.
No hosted/provider/device acceptance, no signup/email/catalog-admin UX acceptance, no new
PG concurrency rerun, and no full WF-013 closure. Existing 087/088 SQL evidence is historical.
Next queue checkpoint: bounded local private-file read/revocation integration preparation for
the Android beta blocker; consult the delivery queue and remaining tenant-authority gaps before
writing its brief. Real copies/activation/legacy public ACL changes still need exact approval.
