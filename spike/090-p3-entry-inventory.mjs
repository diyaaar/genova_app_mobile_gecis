// Bounded source/UI-metadata inventory, not deployment or runtime certification.
// No network, private rows, credentials, generated environments or production edits.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const manifestPath = 'docs/reports/090/2026-10-03-p1-beta-candidate.json';
const output = 'docs/reports/090/2026-10-03-p3-entry-inventory.json';
const sha = body => createHash('sha256').update(body).digest('hex');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pins = new Map(manifest.pins.map(pin => [pin.path, pin]));
for (const pin of pins.values()) assert.equal(sha(fs.readFileSync(pin.path)), pin.sha256, pin.path);
const imports = new Map();
for (const edge of manifest.dependencyInventory.localImports) {
  if (!imports.has(edge.from)) imports.set(edge.from, []);
  imports.get(edge.from).push(edge.to);
}
const shared = ['app/layout.tsx', 'app/(main)/layout.tsx', 'components/AuthProvider.tsx'];
const groups = {
  'native-shell-auth-repertoire-chat-and-webview': ['apps/mobile/src/ui/AppRoot.tsx'],
  'web-announcements': manifest.routes.filter(p => p.startsWith('app/(main)/announcements/')),
  'web-choristers-invitations': manifest.routes.filter(p => p.startsWith('app/(main)/koristler/')),
  'web-profile': manifest.routes.filter(p => p.startsWith('app/(main)/profil/')),
  'web-attendance': ['app/(main)/devamsizlik/page.tsx'],
  'invite-login-recovery': ['app/invite/page.tsx', 'app/login/page.tsx', 'app/auth/recovery/page.tsx'],
  'retained-browser-home-chat-assignment-repertoire': manifest.routes.filter(p => p.startsWith('app/(main)/') && !/\/(?:announcements|koristler|profil|devamsizlik)\//u.test(p)),
  'retained-next-api-handlers': manifest.routes.filter(p => p.startsWith('app/api/')),
};
const apiHandlers = manifest.routes.filter(p => p.startsWith('app/api/'));
function inventory(roots) {
  const seen = new Set(), pending = [...roots];
  const apiReferences = [], unresolvedApiReferences = [];
  while (pending.length) {
    const file = pending.shift();
    if (seen.has(file)) continue;
    assert(pins.has(file), 'Unpinned entry/import: ' + file);
    seen.add(file);
    pending.push(...(imports.get(file) ?? []));
    const body = fs.readFileSync(file, 'utf8');
    // Literal URL shortlist only; dynamic URLs, Auth/realtime/SDK dataflow need review.
    for (const match of body.matchAll(/["'`]([/]api[/][^"'`\s]+)["'`]/gu)) {
      const url = match[1];
      const pathname = url.split('?')[0];
      const matches = apiHandlers.filter(handler => {
        const route = handler.slice(3, -9);
        const pattern = '^' + route.split('/').map(part => part.startsWith('[') ? '[^/]+' : part).join('/') + '$';
        return new RegExp(pattern, 'u').test(pathname);
      });
      const ref = { file, line: body.slice(0, match.index).split('\n').length, literal: url, handlers: matches };
      apiReferences.push(ref);
      if (matches.length === 1) pending.push(matches[0]);
      else unresolvedApiReferences.push(ref);
    }
  }
  const files = [...seen].sort();
  const calls = manifest.dependencyInventory.literalCalls.filter(call => seen.has(call.file));
  return { roots, files, fileCount: files.length, apiReferences, unresolvedApiReferences,
    calls, dynamicCalls: calls.filter(c => !c.name),
    tables: [...new Set(calls.filter(c => c.kind === 'table' && c.name).map(c => c.name))].sort(),
    rpcs: [...new Set(calls.filter(c => c.kind === 'rpc' && c.name).map(c => c.name))].sort(),
    edgeNames: [...new Set(calls.filter(c => c.kind === 'edge' && c.name).map(c => c.name))].sort() };
}
const currentUi = {
  observationWindowUtc: '2026-10-03T18:30Z through 2026-10-03T18:38Z; dashboard metadata refreshed in this turn',
  method: 'Read-only visible Chrome Genesi Nova profile DOM, correct project/account; no SQL submission, secrets, hidden app state, HTTP fetch or deployment',
  web: { projectUrl: 'https://vercel.com/genesi-nova-choirs-projects/genova-app',
    deploymentId: 'ApCrcavKPpHSdBzdpv8JvESEiKc5', status: 'Ready',
    productionAlias: 'https://app.genesinovachoir.com',
    hostname: 'genova-3kamu2fwz-genesi-nova-choirs-projects.vercel.app',
    source: 'a13f696da8c731e9af2a2bce473d4f4ae4a81587', branch: 'main',
    limits: 'Production deployment metadata, not actual HTTP/Auth/user-flow exercise' },
  supabase: { projectId: 'hievmwwctjjlhmssoxsu', account: 'genesinovachoir', branch: 'main Production',
    migrationsUrl: 'https://supabase.com/dashboard/project/hievmwwctjjlhmssoxsu/database/migrations',
    functionsUrl: 'https://supabase.com/dashboard/project/hievmwwctjjlhmssoxsu/functions',
    observedSourceMigrationIds: ['20260919190000', '20260919193000', '20260919194500',
      '20260919201500', '20260919213000', '20260920205054', '20260921185113',
      '20260922071942', '20260922171847', '20260922221500', '20260923103000',
      '20260923170000', '20260923193000', '20260923194500', '20260925083611'],
    extraRetainedPrerequisiteId: '20260919183000',
    observedEdgeNames: ['assignment-file', 'assignment-review-file', 'assignment-review-upload',
      'assignment-upload', 'chat-media-file', 'chat-media-lifecycle', 'chat-media-upload',
      'choir-invitations', 'create-choir', 'drive-manager', 'drive-manager-test', 'drive-manager-v2',
      'repertoire-comment-file', 'repertoire-comment-lifecycle', 'repertoire-comment-upload',
      'repertoire-file', 'repertoire-file-lifecycle', 'repertoire-upload', 'resend-inbound',
      'send-email', 'send-push-notification'],
    missingExactEvidence: ['Migration stored SQL bodies/checksums', 'Actual current functions/policies/grants/schema definitions',
      'Edge numeric version/deployed source checksum/complete JWT config', 'Runtime flags/mappings/private ACL',
      'Provider Auth/REST/private-file cache headers and native persistence'],
    limits: 'Visible ledger/slugs only, not catalog or source equivalence. Absence from ledger does not exclude manual DDL. Deployment count/relative date is not exact version. Mandatory supabase-genesinova MCP unavailable; no alternate SQL path.' },
};
const mapped = Object.fromEntries(Object.entries(groups).map(([name, roots]) =>
  [name, inventory([...new Set([...roots, ...((name.startsWith('web-') || name.startsWith('retained-browser-')) ? shared : [])])]) ]));
const sql = manifest.sql.sourceUpgradeSequence.map(pin => ({ ...pin,
  id: pin.path.match(/[/](\d{14})_/u)[1],
  visibleLedger: currentUi.supabase.observedSourceMigrationIds.includes(pin.path.match(/[/](\d{14})_/u)[1]) ? 'OBSERVED_ROW' : 'NOT_IN_VISIBLE_LEDGER',
  actualDefinitionAndStoredChecksum: 'NOT RUN' }));
const edges = manifest.dependencyInventory.edge.map(entry => ({ ...entry,
  visibleFunctionList: currentUi.supabase.observedEdgeNames.includes(entry.slug) ? 'OBSERVED_SLUG' : 'NOT_IN_VISIBLE_LIST',
  exactDeployedIdentity: 'NOT RUN' }));
const result = { candidateId: manifest.candidateId, date: '2026-10-03', status: 'PARTIAL; exact target evidence NOT RUN',
  source: manifest.source, manifest: { path: manifestPath, sha256: sha(fs.readFileSync(manifestPath)) },
  sourcePinsVerified: pins.size, helperSha256: sha(fs.readFileSync(import.meta.filename)), currentUi,
  sql, edges, routes: mapped, limits: 'Import/literal URL/call graph is a navigation shortlist, not tenant authorization, complete dynamic dataflow, device testing or full P3 acceptance. No product change.' };
const serialized = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--verify')) assert.equal(fs.readFileSync(output, 'utf8'), serialized);
else fs.writeFileSync(output, serialized, { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ output, status: result.status, pins: pins.size,
  groups: Object.fromEntries(Object.entries(mapped).map(([name, value]) => [name, { files: value.fileCount, apiReferences: value.apiReferences.length, unresolved: value.unresolvedApiReferences.length, rpcs: value.rpcs }])),
  sqlObserved: sql.filter(s => s.visibleLedger === 'OBSERVED_ROW').length,
  sqlNotInVisibleLedger: sql.filter(s => s.visibleLedger !== 'OBSERVED_ROW').map(s => s.id),
  edgeNotInVisibleList: edges.filter(e => e.visibleFunctionList !== 'OBSERVED_SLUG').map(e => e.slug) }));
