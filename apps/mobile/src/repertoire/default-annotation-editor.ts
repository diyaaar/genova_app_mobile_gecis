import { saveAnnotationSnapshot } from '@shared/repertuvar/annotation-snapshot';
import { getGenovaClient } from '../auth/supabase-client';
import { registerTenantCache } from '../auth/tenant-cache';
import { registerTenantTransition } from '../auth/tenant-transition';
import { PersonalAnnotationEditor } from './personal-annotation-editor';

const editors = new Map<string, PersonalAnnotationEditor>();

export function getDefaultAnnotationEditor(choirId: string, memberId: string, fileId: string): PersonalAnnotationEditor {
  const key = JSON.stringify([choirId, memberId, fileId]);
  const existing = editors.get(key);
  if (existing) return existing;
  const client = getGenovaClient();
  const editor = new PersonalAnnotationEditor(JSON.stringify([choirId, memberId]), fileId,
    (input) => saveAnnotationSnapshot((name, args) => client.rpc(name, args), input));
  editors.set(key, editor);
  const unregisterTransition = registerTenantTransition(() => editor.prepareExit(), () => editor.clear());
  const unregisterCache = registerTenantCache(() => {
    editor.clear();
    editors.delete(key);
    unregisterTransition();
    unregisterCache();
  });
  return editor;
}
