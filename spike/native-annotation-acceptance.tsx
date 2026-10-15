// Synthetic transport only. Mounts the actual reader, editor, queue and native PDF/Skia renderer.
import { useState } from 'react';
import { Asset } from 'expo-asset';
import { Pressable, Text, View } from 'react-native';
import { ScoreReaderScreen } from '../apps/mobile/src/repertoire/ScoreReaderScreen';
import { PersonalAnnotationEditor } from '../apps/mobile/src/repertoire/personal-annotation-editor';
import { nativePdfRenderer } from '../apps/mobile/src/repertoire/pdf-renderer';
import { saveAnnotationSnapshot } from '../lib/repertuvar/annotation-snapshot';
import type { AnnotationItem } from '../lib/repertuvar/annotation-types';
import type { NativeScoreReaderGateway } from '../apps/mobile/src/repertoire/reader-contract';
const asset = require('../apps/mobile/src/repertoire/__fixtures__/score_40p.pdf');
let revision = 1;
let conflict = false;
let stored: AnnotationItem[] = [{ id: 'stored', type: 'text', color: 'red', position: { x: 0.1, y: 0.1 }, width: 0.4, text: 'Stored' }];
const file = { id: '11111111-1111-4111-8111-111111111111', song_id: '22222222-2222-4222-8222-222222222222', file_type: 'sheet' as const,
  file_name: 'Sentetik nota', mime_type: 'application/pdf', partition_label: null, drive_file_id: null, drive_web_view_link: null, drive_download_link: null,
  file_size_bytes: 65905, uploaded_by: null, created_at: '', updated_at: '' };
const editor = new PersonalAnnotationEditor('synthetic/one', file.id, (input) => saveAnnotationSnapshot(async (_name, args) => {
  await new Promise((done) => setTimeout(done, 700));
  console.info('ANNOTATION_ACCEPTANCE_REQUEST', JSON.stringify({ page: args.p_page_number, expected: args.p_expected_revision, conflict, count: (args.p_annotations_json as unknown[]).length }));
  if (conflict || args.p_expected_revision !== revision) return { data: null, error: { code: '40001' } };
  stored = args.p_annotations_json as AnnotationItem[];
  revision += 1;
  console.info('ANNOTATION_ACCEPTANCE_SAVED', JSON.stringify({ revision, types: stored.map((item) => item.type) }));
  return { data: [{ annotation_id: 'row', next_revision: revision, deleted: false, updated_at: new Date().toISOString() }], error: null };
}, input));
const gateway: NativeScoreReaderGateway = {
  async open() {
    const downloaded = await Asset.fromModule(asset).downloadAsync();
    const uri = downloaded.localUri!;
    const { pageCount } = await nativePdfRenderer.open(uri);
    return { choirId: 'synthetic', fileId: file.id, fileName: file.file_name, uri, pageCount, annotations: { skippedCount: 0, byPage: {
      1: [{ layerKey: 'personal', items: stored, writeMetadata: { revision, writableWithoutLoss: true } }],
    } } };
  },
  async renderWindow(document, page) {
    return { currentPage: page, pages: { [page]: await nativePdfRenderer.generate(document.uri, page - 1) } };
  },
  close: (uri) => nativePdfRenderer.close(uri),
  async clear() { editor.clear(); },
};
export default function Acceptance() {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(true);
  return <View style={{ flex: 1, paddingTop: 30, backgroundColor: '#101820' }}>
    <Pressable testID="acceptance-toggle-conflict" onPress={() => { conflict = !conflict; setFailed(conflict); }}><Text style={{ color: 'white', padding: 12 }}>Transport: {failed ? 'conflict' : 'success'}</Text></Pressable>
    {open ? <ScoreReaderScreen choirId="synthetic" file={file} gateway={gateway} annotationEditor={editor} onBack={() => { console.info('ANNOTATION_ACCEPTANCE_EXIT', revision); setOpen(false); }} />
      : <Pressable testID="acceptance-reopen" onPress={() => setOpen(true)}><Text style={{ color: 'white', padding: 20 }}>EXIT PASS · Yeniden aç</Text></Pressable>}
  </View>;
}
