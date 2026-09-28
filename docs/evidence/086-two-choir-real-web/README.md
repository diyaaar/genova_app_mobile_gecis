# 086 — real local two-choir web evidence

29 September 2026. Local synthetic acceptance, not hosted/provider/device acceptance.
Main-agent self-review only; no independent review is claimed.

## Actual connected matrix

Installed Chrome 153.0.8010.53 / Playwright 1.62.1 against a production Next 15.5.25
build and actual local Auth, PostgREST/RLS, Edge and PG17. Five synthetic confirmed
identities (`example.invalid`), two fresh unrelated 007 choirs, two actual 008 invitations.
No response mocks. Browser network policy only aborts external destinations.

| Check | Result | Actual evidence |
|---|---|---|
| Wrong recipient | PASS | Product login and accept button; Edge HTTP 400; zero memberships |
| First invitation, early connected flow | PASS | Product login/accept; Edge → DB membership; current-choir RPC A; one membership |
| Second invitation | PASS | Product accept; two independent memberships for the same Auth account |
| Selected profile A/B | PASS | Actual switcher, own school/department options and no foreign school; each Next submit 200 and own persisted request |
| Repertoire and assignments A/B | PASS | Own song visible, other song absent; browser JWT/RLS reads only own assignment; authenticated founder assignment RPC |
| Delayed old-tab form | PASS | Hold real A submit before dispatch, second tab switches same Auth session to B, release; Next 409; marker absent |
| Foreign school in B | PASS | Actual Next 400; exact profile-request table digest unchanged |
| Selected membership revoked | PASS for isolation | Target-local operator deactivates B; browser current-choir RPC null, no silent fallback to A; repertoire empty; Next write refused and profile digest unchanged |
| Revocation HTTP error contract | OPEN / observed 500 | Missing active context fails closed, but Next catch maps it to 500 rather than 401/403; not a polished commercial error contract |

Catalog provisioning is manual/service fixture setup, not an operator product interface.
Songs have deliberately synthetic, non-provider `drive_folder_id` readiness metadata;
there is no real Drive folder, file body, protected-file read or provider call accepted here.
The assignment creation is an actual authenticated founder RPC, not the assignment modal UI.
Profile changes are pending requests, not approval/merge acceptance.
Revocation occurs before dispatch, not between the server authorization check and its write.

## Runtime and guards

- Existing source restore `genova_068_test_restore` is read only. Export application schemas
  only, with original ownership/ACLs retained; no source user/choir/content rows imported.
  Apply accepted 078/082 only to disposable target. Six-table source digest compares Auth users,
  choirs, members, repertoire, invitations and active sessions before/after; not an all-data checksum.
- Exact unlinked project `genova-086-runtime`, context `colima-genova086`, profile `genova086`,
  generated directory `spike/086-runtime` (0700), secret files 0600/umask 077. DB/Auth/REST/
  gateway/Edge only. Storage/Realtime/mail are absent and unaccepted.
- Root/data VM caps 8/10 GiB, RAM 4 GiB, 2 CPUs; only exact runtime read-only host mount.
  Do not activate the default Docker context or forward host SSH agents/configs.
- Colima default TCP forwarding initially opened host `*` ports. This was detected and stopped
  **before schema import or identities**. Same VM restarted with `--port-forwarder none`;
  dedicated SSH forwards bind 127.0.0.1:54381/54382. Actual listener guards pass before fixtures.
  VM-internal services still bind broadly, as the CLI warns; this is not a general hardened deployment.
- Three target-only sibling website callback triggers are disabled so fixtures cannot invoke
  its mail provider. No source trigger changed.
- CLI 2.107.0/Colima 0.10.3/installed Chrome reused, no upgrade. CLI partial-stack exit 3 is
  accepted only with all five requested containers and actual Auth health/listener checks.
  Invalid exclude-alias warnings were not treated as proof; actual five-container inventory is proof.
- Public build URL/key hash must equal the actual test API configuration before browser execution.
  No real credentials or passwords are retained in this evidence directory.

## Causal corrections, not product defects

1. Partial CLI exit and wildcard host forwarding: inspect actual containers/listeners; use explicit
   loopback tunnel rather than repeatedly rebuilding or ignoring failures.
2. Interrupted preparation left application schemas. Clear only exact target schemas; restore
   via target bootstrap `supabase_admin` to preserve source OWNER/default ACL statements rather
   than dropping ownership/grants. Original restore unchanged.
3. Test tooling: async main for tsx CJS; parse local DB URL into strict PG variables (PGDATABASE
   is not a connection URI); use actual 007 response `.choir` envelope.
4. Auth email-login disabled: email provider flag must allow password login while global signup
   remains disabled. Synthetic confirmed users bypass delivery only, not Auth verification.
5. First browser form timeout: test URL incorrectly used `#token`; product uses `#invite`.
   Correct the test URL; no invitation consumed in that attempt.
6. Initial repertoire timeout after invitations/A submit: source readiness filter requires a
   folder or file record. Add explicitly synthetic metadata, verify exactly five owned identities
   and two owned choirs, remove only disposable runtime volumes and rerun fresh single-use
   invitations. The complete matrix then passes. Do not rerun consumed tokens as fresh proof.

The full gate and cleanup results are recorded in the linked
[brief](../../briefs/086-two-choir-real-web-acceptance.md). WF-013 step 5 remains PARTIAL.
Do not extrapolate to files, all mutation families, in-flight authority races, devices,
live deployment, self-service/email signup or commercial readiness.
