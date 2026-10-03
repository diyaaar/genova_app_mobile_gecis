import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { interactiveRows, assertInteractiveCancel } from './090_android_interactive.mjs';
import { withFileMetadata, DETAIL_PAGE } from './090_candidate_native_interactive.mjs';
import { sourceAt } from './090_candidate_native_cache.mjs';
import { buildEnv, ROOT, WEB_REF } from './090_android_candidate.mjs';
const require = createRequire(import.meta.url), ts = require('typescript'), React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { build, transformSync } = createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const ids = { choirA: 'a', actor: 'actor', memberA: 'chef', targetMember: 'korist',
  assignmentId: 'assignment', submissionId: 'submission', fileId: 'alias' };
const url = (table, query = '') => new URL(`http://127.0.0.1/rest/v1/${table}?${query}`);
test('interactive environment opt-in is absent from unchanged inspection environment', () => {
  assert.equal(buildEnv().EXPO_PUBLIC_GENOVA_090_WEBVIEW_INTERACTIVE, undefined);
  assert.equal(buildEnv(true).EXPO_PUBLIC_GENOVA_090_WEBVIEW_INTERACTIVE, '1');
});
test('real detail dataset keeps chef and homework target separate, not all-choir wildcard', () => {
  const members = interactiveRows(url('choir_members', 'is_active=eq.true'), ids, 'a');
  assert.deepEqual(members.map(item => item.id), ['chef', 'korist']);
  assert.equal(members[0].auth_user_id, 'actor'); assert.equal(members[1].auth_user_id, null);
  const submissions = interactiveRows(url('assignment_submissions', 'assignment_id=in.(assignment)&member_id=in.(chef,korist)'), ids, 'a');
  assert.equal(submissions[0].drive_web_view_link, null); // Exercise the actual legacy issuer hook.
  assert.equal(submissions[0].member_id, 'korist');
  assert.throws(() => interactiveRows(url('choir_members', 'is_active=eq.true'), ids, 'b'));
  assert.throws(() => interactiveRows(url('choir_members'), ids, 'a'));
  assert.throws(() => interactiveRows(url('assignment_submissions', 'assignment_id=in.(other)&member_id=in.(chef,korist)'), ids, 'a'));
  assert.throws(() => interactiveRows(url('assignment_submissions', 'assignment_id=in.(assignment)&member_id=in.(other)'), ids, 'a'));
  assert.equal(interactiveRows(url('unknown'), ids, 'a'), null);
});
test('cancel allows metadata/HEAD preflight but refuses any body/provider access', () => {
  const head = { path: '/api/drive-file/alias', method: 'HEAD' };
  assertInteractiveCancel([head, { path: '/api/drive-file-token', method: 'POST' }], { renewal: 0 });
  assert.throws(() => assertInteractiveCancel([{ ...head, method: 'GET' }], { renewal: 0 }));
  assert.throws(() => assertInteractiveCancel([head], { renewal: 1 }));
});
test('actual pinned HomeworkCard negative control is refused; metadata-only repair admits passive PDF', async () => {
  const source = sourceAt(WEB_REF, DETAIL_PAGE).toString();
  const nativeSource = fs.readFileSync(ROOT + '/apps/mobile/src/webview/platform-capabilities.ts', 'utf8');
  const policy = nativeSource.slice(nativeSource.indexOf('const ACTIVE_MIME_TYPES'), nativeSource.indexOf('export const WEBVIEW_IMAGE_INPUT_POLICY'));
  const compiled = await build({ stdin: { contents: `import { canonicalizeBridgeFileRequestUrl } from ${JSON.stringify(ROOT + '/lib/mobile-webview-bridge.ts')};\n${policy}`,
    loader: 'ts', resolveDir: ROOT }, bundle: true, platform: 'node', format: 'esm', write: false });
  const { prepareProtectedFileRequest } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
  const item = { assignment: { id: 'assignment', title: 'Synthetic', deadline: null }, status: 'pending',
    submission: { file_name: '090-synthetic.pdf', mime_type: 'application/pdf' } };
  const link = 'http://127.0.0.1:31090/api/drive-file/09000000-0000-4000-8000-000000000006?token=old.signature';
  const render = text => {
    const tree = ts.createSourceFile('page.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const node = tree.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === 'HomeworkCard');
    assert(node);
    const js = transformSync(node.getText(tree), { loader: 'tsx' }).code;
    const Component = new Function('React', 'useProtectedDriveFileUrl', 'formatDateTime', 'formatShortDate', 'HomeworkStatusPill', 'Link',
      js + ';return HomeworkCard;')(React, () => ({ url: link }), () => null, () => '', () => null,
      ({ children, ...props }) => React.createElement('a', props, children));
    return renderToStaticMarkup(React.createElement(Component, { item, memberId: 'target' }));
  };
  const request = html => ({ requestId: 'synthetic_request', url: link, disposition: 'view',
    fileName: /data-genova-file-name="([^"]+)"/.exec(html)?.[1], mimeType: /data-genova-mime-type="([^"]+)"/.exec(html)?.[1] });
  const routePolicy = { appOrigin: 'http://127.0.0.1:31090', protectedFileOrigins: [] };
  assert.equal(prepareProtectedFileRequest(request(render(source)), routePolicy), null);
  const patched = withFileMetadata(source), accepted = prepareProtectedFileRequest(request(render(patched)), routePolicy);
  assert.equal(accepted.mimeType, 'application/pdf'); assert.equal(accepted.fileName, '090-synthetic.pdf');
  assert.equal(patched.replace('\n                  data-genova-file-name={item.submission?.file_name}\n                  data-genova-mime-type={item.submission?.mime_type ?? undefined}', ''), source);
  assert.throws(() => withFileMetadata(patched));
});
