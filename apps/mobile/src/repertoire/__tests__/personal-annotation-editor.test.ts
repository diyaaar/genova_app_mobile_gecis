import { PersonalAnnotationEditor } from '../personal-annotation-editor';
import type { AnnotationItem } from '@shared/repertuvar/annotation-types';
import type { NativeAnnotationReadResult } from '../reader-contract';
const note = (id: string): AnnotationItem => ({ id, type: 'text', color: 'red', text: id, width: 0.3, position: { x: 0.2, y: 0.3 } });
const saved = (revision: number) => ({ rowId: 'row', revision, deleted: false, updatedAt: '2026-10-14T10:00:00Z' });
const loaded = (writable = true, revision = 2): NativeAnnotationReadResult => ({ skippedCount: 0, byPage: {
  1: [{ layerKey: 'personal', items: [note('stored')], writeMetadata: { revision, writableWithoutLoss: writable } }],
} });
function setup(annotations = loaded()) {
  const save = jest.fn().mockResolvedValue(saved(3));
  const editor = new PersonalAnnotationEditor('choir-a/member-a', 'file-a', save, 60_000);
  editor.hydrate(annotations, 2);
  return { editor, save };
}
afterEach(() => jest.useRealTimers());

describe('native personal note ownership and safe persistence', () => {
  it('serializes later edits with the returned revision, including edits made during a request', async () => {
    const { editor, save } = setup();
    let resolve!: (value: ReturnType<typeof saved>) => void;
    save.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    editor.append(1, note('one'));
    const flush = editor.flush();
    editor.append(1, note('two'));
    resolve(saved(3));
    await flush;
    expect(save.mock.calls.map(([input]) => input.expectedRevision)).toEqual([2, 3]);
    expect(save.mock.calls[1]?.[0].annotations.map((item: AnnotationItem) => item.id)).toEqual(['stored', 'one', 'two']);
    expect(editor.status().phase).toBe('saved');
    editor.clear();
  });

  it('retains an offline/conflicted draft and its original revision across reread and failed exit', async () => {
    const { editor, save } = setup();
    save.mockRejectedValue(new Error('conflict'));
    editor.append(1, note('local'));
    await expect(editor.prepareExit()).rejects.toThrow('conflict');
    expect(editor.canEdit(1)).toBe(true);
    editor.hydrate(loaded(true, 9), 2);
    expect(editor.getItems(1).map((item) => item.id)).toEqual(['stored', 'local']);
    await expect(editor.flush()).rejects.toThrow('conflict');
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ expectedRevision: 2 }));
    editor.discard();
    editor.hydrate(loaded(true, 9), 2);
    expect(editor.getItems(1).map((item) => item.id)).toEqual(['stored']);
    editor.clear();
  });

  it('does not let a delayed read replace a save that completed after the read started', async () => {
    const { editor } = setup();
    const readVersion = editor.readVersion();
    editor.append(1, note('new'));
    await editor.flush();
    editor.hydrate(loaded(), 2, readVersion);
    expect(editor.getItems(1).map((item) => item.id)).toEqual(['stored', 'new']);
    editor.clear();
  });

  it('blocks missing metadata, lossy payloads and duplicate rows but permits an absent page', () => {
    const { editor, save } = setup(loaded(false));
    expect(() => editor.append(1, note('new'))).toThrow('düzenlenemiyor');
    editor.hydrate({ skippedCount: 0, byPage: { 1: [{ layerKey: 'personal', items: [] }] } }, 2);
    expect(editor.canEdit(1)).toBe(false);
    const duplicate = loaded(); duplicate.byPage[1]!.push(duplicate.byPage[1]![0]!);
    editor.hydrate(duplicate, 2);
    expect(editor.canEdit(1)).toBe(false);
    expect(editor.canEdit(2)).toBe(true);
    expect(save).not.toHaveBeenCalled();
    editor.clear();
  });

  it('blocks complete deletion of a stored layer, retaining the local undo and server row', async () => {
    const { editor, save } = setup({ skippedCount: 0, byPage: {} });
    editor.append(1, note('new'));
    await editor.flush();
    editor.undo(1);
    await expect(editor.flush()).rejects.toThrow('tamamen silme');
    expect(save).toHaveBeenCalledTimes(1);
    expect(editor.getItems(1)).toEqual([]);
    editor.clear();
  });

  it('locks edits through exit and cannot resurrect private state or run successors after forced cleanup', async () => {
    const { editor, save } = setup();
    let resolve!: (value: ReturnType<typeof saved>) => void;
    save.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    editor.append(1, note('before'));
    const exiting = editor.prepareExit();
    expect(() => editor.append(1, note('during'))).toThrow();
    editor.clear();
    resolve(saved(3));
    await expect(exiting).rejects.toThrow('sona erdi');
    expect(editor.getItems(1)).toEqual([]);
    expect(editor.canEdit(1)).toBe(false);
    expect(editor.status().unresolvedCount).toBe(0);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('keeps pages separate and restores undo without changing another page', async () => {
    const { editor, save } = setup();
    editor.append(1, note('one'));
    editor.append(2, note('two'));
    editor.undo(1);
    await editor.flush();
    expect(editor.getItems(1).map((item) => item.id)).toEqual(['stored']);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ pageNumber: 2, expectedRevision: null, layerKey: 'personal' }));
    editor.clear();
  });
});
