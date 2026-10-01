import assert from 'node:assert/strict';

/** Explicit fixture-only mode; no hosted/production authority or fallback is inferred. */
export function assignmentWebViewMode(env: Record<string, string | undefined>) {
  const enabled = env.GENOVA_090_ANDROID_ASSIGNMENT_WEBVIEW === '1';
  if (enabled) {
    assert.equal(env.GENOVA_090_ANDROID_WEBVIEW, '1');
    assert.equal(env.GENOVA_090_CONNECTED_ANDROID_AUDIO === '1', false);
    assert.equal(env.GENOVA_090_ANDROID_PDF_RECOVERY === '1', false);
    assert.equal(env.API_URL, 'http://127.0.0.1:54491');
  }
  return enabled;
}

export function assignmentVersionSeed(input: {
  choirId: string; assignmentId: string; memberId: string; submissionId: string; versionId: string;
  bucket: string; bytes: number; sha256: string;
}) {
  for (const id of [input.choirId, input.assignmentId, input.memberId, input.submissionId, input.versionId]) {
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  }
  assert.match(input.bucket, /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/);
  assert.match(input.sha256, /^[a-f0-9]{64}$/);
  assert.equal(input.bytes, 65_905);
  const key = `choirs/${input.choirId}/assignments/${input.assignmentId}/submissions/${input.versionId}/content`;
  return { key, sql: `begin;
    insert into public.assignment_submission_file_versions
      (id,choir_id,submission_id,assignment_id,member_id,version_number,provider,bucket,object_key,content_length,mime_type,sha256_hex,file_name)
      values ('${input.versionId}','${input.choirId}','${input.submissionId}','${input.assignmentId}',
        '${input.memberId}',1,'r2','${input.bucket}','${key}',${input.bytes},'application/pdf','${input.sha256}','score.pdf');
    update public.assignment_submissions set current_file_version_id='${input.versionId}',drive_file_id=''
      where id='${input.submissionId}' and choir_id='${input.choirId}';
    commit;` };
}

export function assertAssignmentWebViewReads(reads: Array<{ method: string; status: number; providerDelta: number }>) {
  assert.equal(reads.filter(row => row.method === 'POST' && row.status === 200).length, 1);
  assert.ok(reads.some(row => row.method === 'HEAD' && row.status === 200));
  assert.equal(reads.filter(row => row.method === 'GET' && row.status === 200).length, 1);
  for (const method of ['GET', 'HEAD']) assert.equal(reads.filter(row => row.method === method && row.status === 403).length, 1);
  for (const row of reads) {
    assert.equal(row.providerDelta, row.status >= 400 || row.method === 'POST' ? 0 : 1);
    assert.ok(row.status === 200 || row.status === 403);
  }
}
