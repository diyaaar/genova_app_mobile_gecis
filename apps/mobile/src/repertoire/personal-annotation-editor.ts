import { AnnotationSaveQueue } from '@shared/repertuvar/annotation-save-queue';
import { cloneAnnotationItems, isAnnotationPayloadLosslesslyWritable, type AnnotationItem } from '@shared/repertuvar/annotation-types';
import type { AnnotationSaveResult, SafeSaveLayerSnapshotInput } from '@shared/repertuvar/annotation-snapshot';
import type { NativeAnnotationReadResult } from './reader-contract';

/** One file/member/choir lifetime. Pending snapshots survive screen navigation, never identity loss. */
export class PersonalAnnotationEditor {
  readonly queue: AnnotationSaveQueue;
  private items = new Map<number, AnnotationItem[]>();
  private history = new Map<number, AnnotationItem[][]>();
  private invalidated = false;
  private version = 0;

  constructor(
    readonly ownerKey: string,
    readonly fileId: string,
    save: (input: SafeSaveLayerSnapshotInput) => Promise<AnnotationSaveResult>,
    debounceMs = 500,
  ) {
    this.queue = new AnnotationSaveQueue(async (input) => {
      if (this.invalidated) throw new Error('PDF notu oturumu sona erdi.');
      return save(input);
    }, debounceMs);
    this.queue.subscribe(() => { this.version += 1; });
  }

  private key(page: number) { return `${this.ownerKey}::${this.fileId}::${page}::personal`; }

  readVersion(): number { return this.version; }

  hydrate(annotations: NativeAnnotationReadResult, pageCount: number, readVersion = this.version): void {
    if (this.invalidated) return;
    const changedDuringRead = readVersion !== this.version;
    for (let page = 1; page <= pageCount; page += 1) {
      if (changedDuringRead && this.items.has(page)) continue;
      const layers = (annotations.byPage[page] ?? []).filter((layer) => layer.layerKey === 'personal');
      const layer = layers[0];
      const pending = this.queue.getContextSnapshot(this.key(page))?.pendingItems;
      this.queue.registerContext(this.ownerKey, this.key(page), {
        revision: layer?.writeMetadata?.revision ?? (layer ? 0 : null),
        hadStoredRow: Boolean(layer),
        // Missing metadata or duplicate personal layers must never become a fresh writable row.
        writableWithoutLoss: annotations.writeContractAvailable !== false && layers.length <= 1 && (!layer || layer.writeMetadata?.writableWithoutLoss === true),
      });
      this.items.set(page, cloneAnnotationItems(pending ?? layer?.items ?? []));
      if (!pending) this.history.delete(page);
    }
  }

  getItems(page: number): AnnotationItem[] { return cloneAnnotationItems(this.items.get(page) ?? []); }
  canEdit(page: number): boolean {
    return !this.invalidated && !this.queue.isOwnerExiting(this.ownerKey)
      && this.queue.getContextSnapshot(this.key(page))?.writableWithoutLoss === true;
  }

  append(page: number, item: AnnotationItem): void {
    this.replace(page, [...this.getItems(page), item]);
  }

  private replace(page: number, items: AnnotationItem[], remember = true): void {
    if (!this.canEdit(page)) throw new Error('Bu not katmanı şu anda düzenlenemiyor.');
    if (!isAnnotationPayloadLosslesslyWritable(items, 1)) throw new Error('Not sınırına ulaşıldı. Daha kısa bir not ekleyin.');
    if (remember) {
      const history = this.history.get(page) ?? [];
      this.history.set(page, [...history.slice(-19), this.getItems(page)]);
    }
    this.items.set(page, cloneAnnotationItems(items));
    this.queue.enqueue({ ownerKey: this.ownerKey, contextKey: this.key(page), fileId: this.fileId,
      pageNumber: page, layerKey: 'personal', items });
  }

  canUndo(page: number): boolean { return this.canEdit(page) && Boolean(this.history.get(page)?.length); }
  undo(page: number): void {
    const previous = this.history.get(page)?.pop();
    if (previous) this.replace(page, previous, false);
  }
  status() { return this.queue.getOwnerStatus(this.ownerKey); }
  flush() { return this.queue.flushOwner(this.ownerKey); }

  async prepareExit(): Promise<() => void> {
    if (this.invalidated) return () => {};
    this.queue.beginOwnerExit(this.ownerKey);
    try {
      await this.flush();
      if (this.invalidated) throw new Error('PDF notu oturumu sona erdi.');
      return () => this.queue.cancelOwnerExit(this.ownerKey);
    } catch (error) {
      this.queue.cancelOwnerExit(this.ownerKey);
      throw error;
    }
  }

  /** Explicitly confirmed discard; an active request must settle before a reload can reset revision. */
  discard(): void {
    if (this.status().phase === 'saving') throw new Error('Not kaydı sürüyor. Lütfen tamamlanmasını bekleyin.');
    this.items.clear();
    this.history.clear();
    this.queue.discardAll();
  }

  clear(): void {
    this.invalidated = true;
    this.items.clear();
    this.history.clear();
    this.queue.discardAll();
  }
}
