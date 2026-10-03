import { createLocalPdfPreview } from '../local-pdf-preview';
import type { NativePdfRenderer } from '../../repertoire/pdf-renderer';

const uri = 'file:///cache/test.pdf';
const image = { uri: 'file:///cache/page.jpg', width: 595, height: 842 };
function runtime() {
  const controller = new AbortController();
  const pdf: NativePdfRenderer = { open: jest.fn(async () => ({ pageCount: 40 })),
    generate: jest.fn(async () => image), close: jest.fn(async () => {}) };
  return { controller, pdf, session: createLocalPdfPreview(uri, controller.signal, pdf) };
}
it('uses existing page-index contract and releases prior bitmaps between pages', async () => {
  const r = runtime();
  expect(await r.session.open()).toBe(40);
  await r.session.render(1); await r.session.render(40);
  expect(r.pdf.generate).toHaveBeenNthCalledWith(1, uri, 0);
  expect(r.pdf.generate).toHaveBeenNthCalledWith(2, uri, 39);
  expect(r.pdf.close).toHaveBeenCalledTimes(1);
  await expect(r.session.render(41)).rejects.toThrow();
  await expect(r.session.render(0)).rejects.toThrow();
  await r.session.close(); await r.session.close();
  expect(r.pdf.close).toHaveBeenCalledTimes(2);
});
it('queues close after native generation and rejects late aborted results', async () => {
  const r = runtime(); await r.session.open();
  let release!: (value: typeof image) => void;
  (r.pdf.generate as jest.Mock).mockImplementation(() => new Promise(resolve => { release = resolve; }));
  const rendering = r.session.render(1);
  const refusal = expect(rendering).rejects.toThrow('kapandı');
  await Promise.resolve(); r.controller.abort();
  const closed = r.session.close();
  expect(r.pdf.close).not.toHaveBeenCalled();
  release(image); await refusal; await closed;
  expect(r.pdf.close).toHaveBeenCalledTimes(1);
  await expect(r.session.render(1)).rejects.toThrow();
});
it('refuses remote URI, invalid counts/images and changed page count, without network fallback', async () => {
  const r = runtime();
  expect(() => createLocalPdfPreview('https://example.invalid/test.pdf', r.controller.signal, r.pdf)).toThrow();
  (r.pdf.open as jest.Mock).mockResolvedValueOnce({ pageCount: 0 });
  await expect(r.session.open()).rejects.toThrow(); await r.session.close();
  const changed = runtime(); await changed.session.open(); await changed.session.render(1);
  (changed.pdf.open as jest.Mock).mockResolvedValueOnce({ pageCount: 41 });
  await expect(changed.session.render(2)).rejects.toThrow('değişti'); await changed.session.close();
  const invalid = runtime(); await invalid.session.open();
  (invalid.pdf.generate as jest.Mock).mockResolvedValueOnce({ ...image, width: 0 });
  await expect(invalid.session.render(1)).rejects.toThrow(); await invalid.session.close();
});
