# 081 — owner-only local configuration and backup files

Status: COMPLETE LOCALLY (mode hardening only), 28 September 2026. Main agent is the single writer.
One outcome: the exact owned local configuration/backup files are owner-readable/writable only,
and their immediate container cannot be used by another local user to replace them.
Source: [WF-012 F12](../reports/2026-09-28-commercial-multi-tenant-audit.md),
[WF-013](WF-013-multi-tenant-remediation-plan.md); owner explicitly approved this checkpoint.

## Startup / work card

Verified main / 98aaa9e; unrelated `supabase/.temp/cli-latest` remains dirty and unstaged.
Read AGENTS, handoff, active context, current plan, brief template, guide/work cycle and execution
controls. This is a local filesystem-security task, not a native migration or product decision;
no new MIGRATION/KARARLAR behavior applies. Active tool goal is null; no new global goal invented.

At most three steps: validate exact targets/owner/type/link count/ACL/ignore/parents; narrow modes
without content changes; verify bytes/identity/mtime/owner access, redacted tracked-source scan and
documentation/commit. Exit requires every mandatory acceptance row below to pass.

Reverified metadata, without displaying file contents: all ten targets are regular, single-link
files owned by the calling UID 501; all are ignored and untracked. No file ACL entries observed.
The workspace container is owned by UID 501, mode 0777, with no ACL entries; this permits path
replacement even when an individual file is 0600. Its parent Antigravity is 0755 and the home
directory is 0750 with deny-delete ACL only. Apps/mobile's ancestor directories are 0755.
No ancestor outside this repository needs modification.

| Exact repository-relative target | Before | Intended after |
|---|---|---|
| `.env` | 0666 | 0600 |
| `.env.local` | 0600 | 0600, preserve |
| `.env.local.github` | 0666 | 0600 |
| `apps/mobile/.env` | 0644 | 0600 |
| `backup_full_2026-09-07.sql` | 0644 | 0600 |
| `backup_data_2026-09-07.sql` | 0644 | 0600 |
| `backup_data_2026-09-04.sql` | 0644 | 0600 |
| `backup_schema_2026-09-04.sql` | 0644 | 0600 |
| `backup_roles_2026-09-04.sql` | 0644 | 0600 |
| `backup_schema_2026-09-07.sql` | 0644 | 0600 |
| Workspace container `/Users/alidiyarduran/Antigravity/genovakorist` | 0777 | 0755 |

The three 4 September exports are empty; keep them unchanged, not mislabelled as valid backups.
Mobile public environment values are not inherently secret; the local file receives the same
conservative mode without changing public variables or claiming to conceal bundled public keys.
Tracked example files and dependency CA certificates are not secret targets and remain unchanged.

## Boundaries / safety / resources

Allowed writes: only the modes of the targets above; this brief and plan/handoff/active/progress.
Use no-follow descriptors, validate owner/type/link count/inode before fchmod and validate the
final path still names that same object. Hash bytes privately in memory before/after; do not print
digests or values, copy secrets, rewrite configuration, change ownership, remove ACLs/xattrs,
delete/move a backup, recurse chmod, or modify any parent/global/user/provider setting.
Refuse symlinks, multiple hard links, unexpected owner/type/path replacement or ACL entries.
The selected tracked-source scan reports counts/booleans only; no matched lines/values.

No network, credential/account rotation, Git-history rewriting, CI change, push, deploy, DB/Edge,
real data mutation, build, dependency installation, simulator or new runtime. No new compliance
framework/reusable runner. Existing local Node/filesystem tools suffice. 35,447,092 KiB available;
peak added disk <1 MiB (small documentation only), peak read buffer below 5 MiB. No secret copies
or generated cleanup targets. Retain existing source/lockfiles/backups/copy evidence unchanged.

Rollback is a scoped file-mode operation on exact owned paths, not Git revert (ignored modes are
not Git-tracked). Restoring the old permissive modes would reopen exposure and must not be an
automatic fallback. Same-UID processes, root, existing copies/open descriptors and prior access
are NOT revoked by chmod. Newly recreated files can regain permissive modes: creator/umask,
CI scanning, history review and provider rotation remain separate follow-up work.

## Mandatory acceptance evidence

| Criterion | Required? / reason | Status | Evidence / boundary |
|---|---|---|---|
| Exact owner/type/single-link/ACL/ignored scope and unsafe modes reproduced | Yes | PASS | Current metadata and ls -ldne, no contents disclosed; UID 501 |
| All ten files 0600; workspace 0755; no other directory/ownership/ACL change | Yes | PASS | 9 files narrowed, 1 preserved; descriptor fchmod and independent ls -ldne post-check |
| File bytes, inode, size, mtime and owner/group unchanged; owner can still read/write | Yes | PASS | All ten private in-memory SHA-256 comparisons and fstat/path checks pass; R_OK/W_OK access passes |
| Redacted selected tracked-source scan; ignored inputs never staged | Yes | PASS | 987 tracked files, five selected patterns have zero matches; targets remain ignored/untracked |
| Local links, consistency, self-review, diff, commit and resource handoff | Yes | PASS | Exact owned mode changes plus docs only; linked handoff; no product code/build change |
| Web/mobile build/tests, hosted/device/provider acceptance | No: modes/docs only | N/A | Do not rerun or reuse 080's green tests as new 081 evidence |
| Different-UID/root/prior-access revocation, history/CI/rotation/creator policy | No: separate decision | NOT RUN | No user switching, administrator operation or credential changes |

## Actual operation / acceptance

28 September, local installed Node: build an explicit list of all ten files; preflight every target
with lstat/realpath/owner/single-link/ACL/ignore checks; open O_RDONLY|O_NOFOLLOW and validate the
descriptor against the path's inode/device. Capture private SHA-256 using positional 64-KiB reads.
Open only the exact workspace directory with O_NOFOLLOW|O_DIRECTORY and verify owner/inode.
After all targets pass, fchmod nine file descriptors to 0600 (skip already-correct .env.local),
and the one workspace descriptor to 0755. Never chmod a glob or recursively traverse/mutate.

Post-check every file: descriptor and path identity, uid/gid/nlink, bytes/size/mtime and private
digest equal the baseline; all modes exactly 0600; R_OK|W_OK succeeds for the owner. The workspace
descriptor still matches the same directory and is exactly 0755. Independent ls -ldne confirms
file/container modes and unchanged app/parent directories; no ACL entries were added/removed.
Only mode/ctime changes are intentional. No secret value/digest is printed or retained in a record,
no target is moved, copied, rewritten, deleted or staged. All ten checks pass with no failed attempt.

Selected tracked-source scan reads only regular tracked files, caps each input at 10 MiB and
prints aggregate counts only: PEM private-key markers, GitHub tokens, AWS access IDs, Stripe
live keys and Slack tokens each match zero of 987 files. It does not parse ignored secret values,
scan Git history, detect all possible secret formats or prove that no credential was exposed.
Zero-byte old exports remain empty; this is not backup/restore validation.

Startup/scope commit: `f34a25e`. Final acceptance documentation commit contains no product code.
The ignored POSIX modes cannot be delivered/reverted through Git; only this current filesystem
was hardened. Future checkout/CI/other devices need their own verification. No files were newly
created with credentials and no install/build/runtime output requires cleanup. Measured free space
after the operation: 35,450,216 KiB (~33.8 GiB). Unrelated supabase/.temp/cli-latest stays unstaged.

Self-review confirmed that parent-directory write permission was relevant; workspace 0777 -> 0755
was added to the exact scope before the first mutation. Upper directories remain untouched. No
different-UID login/sudo test was attempted; effective other-user restrictions are based on the
verified POSIX modes and absence of permissive file ACLs, not invented runtime-user evidence.
Same-UID/root processes, prior exposure/copies and newly recreated permissive files remain risks.
The creator/umask, history/CI scanning and provider rotation portions of F12 remain OPEN.
No web/mobile/DB/Auth/Edge/provider/device/live release acceptance is implied.

Next bounded proposal under WF-013: F04 transactional song-assignment replacement, preserving
the previous assignment set on error and validating concurrency/retry and failed-load behavior.
Its local implementation needs the owner's next checkpoint approval; hosted migration is separate.
