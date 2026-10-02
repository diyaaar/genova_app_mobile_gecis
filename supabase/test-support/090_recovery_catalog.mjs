// Read-only comparison of the exact owned offline baseline with dated R0 catalogs.
// No hosted connection, backup rows, credential fallback or automatic repair.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { spawnSync } from 'node:child_process';
const host = 'unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const container = 'genova090r1-db';
const artifact = '/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo';
function command(args, input) {
  const result = spawnSync('docker', ['--host', host, ...args], { input, encoding: 'utf8', timeout: 60000 });
  if (result.status !== 0) throw Error('Offline catalog command failed: ' + result.stderr.split('\n').find(l => l.startsWith('ERROR:')));
  return result.stdout.trim();
}
const target = JSON.parse(command(['inspect', container]))[0];
assert.equal(process.cwd(), '/Users/alidiyarduran/Antigravity/genovakorist');
assert.equal(target.HostConfig.NetworkMode, 'none');
assert.equal(target.Config.Image, 'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00');
assert.equal(target.Mounts.length, 0);
const source = JSON.parse(fs.readFileSync('docs/reports/090/2026-10-02-hosted-revocation-r0-connected-metadata.json'));
const local = {};
for (const name of ['Catalog', 'Impact', 'Prereq', 'Constraints']) {
  const query = source.queries[name].replace(/^begin (?:transaction )?read only;\s*/i, '').replace(/;\s*rollback;\s*$/i, '')
    // NULL schema ACL is PostgreSQL's default owner-only ACL, not a missing grant.
    .replaceAll('n.nspacl::text', "coalesce(n.nspacl,acldefault('n',n.nspowner))::text")
    .replaceAll('c.relacl::text', "coalesce(c.relacl,acldefault('r',c.relowner))::text");
  const select = name === 'Constraints' ? `select coalesce(json_agg(q),'[]'::json) from (${query}) q` : `select row_to_json(q) from (${query}) q`;
  const body = command(['exec', '-i', '-e', 'PGPASSWORD=090-synthetic-local-only', container,
    'psql', '-X', '-Atq', '-w', '-U', 'supabase_admin', '-d', 'genova_090_r1_restore', '-v', 'ON_ERROR_STOP=1'],
  `begin read only; set local search_path=public,extensions; ${select}; rollback;`);
  local[name] = JSON.parse(body);
}
// Compare semantic catalog fields; catalog OIDs and dependency order are not identities.
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
    key === 'acl' && typeof child === 'string'
      ? child.slice(1,-1).split(',').sort() : normalize(child)]));
}
for (const [label, actual, expected] of [
  ['helpers',local.Catalog,source.catalog], ['shared-site',local.Impact,source.sharedSiteCatalog],
  ['relations',local.Prereq.required_relations,source.prerequisites.required_relations],
  ['constraints',local.Constraints,source.constraints],
]) {
  if (!isDeepStrictEqual(normalize(actual),normalize(expected))) throw Error('Catalog mismatch: '+label+' (no private bodies echoed)');
}
const result = { recordedAt: new Date().toISOString(), status: 'SELECTED_CATALOG_FIDELITY_PASS',
  source: 'R0 read-only catalog recorded earlier on 2 October; NOT one snapshot with R1 counts',
  exactHelpers: source.catalog.helpers.length, exactRelations: source.prerequisites.required_relations.length,
  checks: ['seven helper bodies/owners/ACL/security-definer/search_path', 'selected relation types/columns/RLS/ACL',
    'shared-site view definition/owner/ACL/security_invoker/policies', 'selected constraints'],
  limits: 'Not full cluster fidelity: extension ownership and global memberships are separate open checks; no Auth/PostgREST/HTTP/client proof.',
  local };
fs.writeFileSync(artifact + '/catalog-comparison-final.json', JSON.stringify(result, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ ...result, local: undefined }));
