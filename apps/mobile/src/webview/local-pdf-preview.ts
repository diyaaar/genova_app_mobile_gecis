import type { NativePdfRenderer } from '../repertoire/pdf-renderer';
import { toNativePdfPageIndex, type NativePageImage } from '../repertoire/reader-contract';

/** Already-validated, capability-owned local bytes only; no ticket, network or DB reads.
 * Serializes native handles, retains one page bitmap and closes before file deletion.
 * Abort invalidates results immediately; native work must settle before close completes.
 */
export function createLocalPdfPreview(uri: string, signal: AbortSignal, pdf: NativePdfRenderer) {
  if (!uri.startsWith('file://')) throw new Error('Yerel PDF bulunamadı.');
  let queue: Promise<unknown> = Promise.resolve();
  let closed = false;
  let closing: Promise<void> | null = null;
  let pageCount = 0;
  let rendered = false;
  const current = () => { if (closed || signal.aborted) throw new Error('PDF oturumu kapandı.'); };
  function serial<T>(work: () => Promise<T>): Promise<T> {
    const next = queue.then(work);
    queue = next.catch(() => undefined);
    return next;
  }
  return {
    open: () => serial(async () => {
      current();
      const document = await pdf.open(uri);
      current();
      if (!Number.isInteger(document.pageCount) || document.pageCount < 1) throw new Error('PDF içinde okunabilir sayfa bulunamadı.');
      pageCount = document.pageCount;
      return pageCount;
    }),
    render: (page: number): Promise<NativePageImage> => serial(async () => {
      current();
      const index = toNativePdfPageIndex(page);
      if (page > pageCount) throw new Error('PDF sayfa aralığı geçersiz.');
      if (rendered) {
        await pdf.close(uri); current();
        const document = await pdf.open(uri); current();
        if (document.pageCount !== pageCount) throw new Error('PDF sayfa bilgisi değişti.');
      }
      // Mark before generate: even a failed render may leave a native temporary bitmap.
      rendered = true;
      const image = await pdf.generate(uri, index); current();
      if (!image.uri.startsWith('file://') || !Number.isFinite(image.width) || !Number.isFinite(image.height)
          || image.width <= 0 || image.height <= 0) throw new Error('PDF sayfa görüntüsü okunamadı.');
      return image;
    }),
    close(): Promise<void> {
      closed = true;
      closing ??= serial(async () => { await pdf.close(uri); });
      return closing;
    },
  };
}
