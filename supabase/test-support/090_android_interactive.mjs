// Synthetic REST responses for the real pinned chorister-detail UI, not hosted RLS.
import assert from 'node:assert/strict';
export function interactiveRows(url, ids, currentChoir) {
  const { choirA, actor, memberA, targetMember, assignmentId, submissionId, fileId } = ids;
  assert.equal(currentChoir, choirA, 'A performance dataset after choir switch');
  const row = id => ({ id, choir_id: choirA, auth_user_id: id === memberA ? actor : null,
    first_name: 'Synthetic', last_name: id === memberA ? 'Chef' : 'Korist',
    voice_group: 'Soprano', is_active: true, photo_url: null });
  const exact = (key, value) => assert.equal(url.searchParams.get(key), value, key);
  switch (url.pathname) {
    case '/rest/v1/choir_members':
      exact('is_active', 'eq.true'); return [row(memberA), row(targetMember)];
    case '/rest/v1/rehearsals':
      exact('collect_attendance', 'eq.true'); return [];
    case '/rest/v1/assignments':
      return [{ id: assignmentId, title: '090 Sentetik PDF Ödevi', description: '',
        deadline: null, target_voice_group: null, created_by: memberA, is_active: true,
        created_at: '2026-10-03T00:00:00Z', updated_at: '2026-10-03T00:00:00Z' }];
    case '/rest/v1/choir_member_roles':
      exact('member_id', `in.(${memberA},${targetMember})`);
      return [{ member_id: memberA, roles: { name: 'Şef' } }, { member_id: targetMember, roles: { name: 'Korist' } }];
    case '/rest/v1/assignment_targets':
      exact('assignment_id', `in.(${assignmentId})`);
      return [{ assignment_id: assignmentId, member_id: targetMember }];
    case '/rest/v1/assignment_submissions':
      exact('assignment_id', `in.(${assignmentId})`); exact('member_id', `in.(${memberA},${targetMember})`);
      return [{ id: submissionId, assignment_id: assignmentId, member_id: targetMember,
        drive_file_id: fileId, drive_web_view_link: null, drive_download_link: null,
        file_name: '090-synthetic.pdf', mime_type: 'application/pdf', file_size_bytes: 65905,
        status: 'pending', submitted_at: '2026-10-03T00:00:00Z', updated_at: '2026-10-03T00:00:00Z' }];
    default: return null;
  }
}
export function assertInteractiveCancel(requests, providerReads) {
  assert.equal(providerReads.renewal, 0, 'Provider bytes before consent/cancel');
  assert(!requests.some(item => item.path.startsWith('/api/drive-file/') && item.method === 'GET'),
    'Native/browser body read before consent');
}

// Ordered v4 synthetic evidence, not a substitute for owner visual acceptance.
export function assertInlinePreviewEvent(event, events, providerReads) {
  assert(['share-returned', 'preview-page-1', 'preview-page-2', 'preview-closed', 'file-removed'].includes(event));
  assert(events.includes('cancel-observed')); assert.equal(providerReads.renewal, 1);
  if (event === 'file-removed') assert(events.includes('preview-closed'));
  if (['preview-page-2', 'preview-closed'].includes(event)) assert(events.includes('preview-page-1'));
}

export function assertCompletedInteractiveFlow(events, providerReads) {
  assert.deepEqual(events, ['cancel-observed', 'preview-page-1', 'preview-page-2',
    'share-returned', 'preview-closed', 'file-removed']);
  assert.deepEqual(providerReads, { renewal: 1, revoked: 0, switched: 0 });
}
