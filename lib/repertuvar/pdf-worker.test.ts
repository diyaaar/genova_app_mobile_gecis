import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('react-pdf', () => ({ pdfjs: { PDFWorker: { create: mocks.create } } }));
beforeEach(() => { vi.resetModules(); mocks.create.mockReset().mockImplementation(() => ({ destroyed: false })); });
it('shares one page worker across document/URL changes and replaces a destroyed worker', async () => {
  const { getRepertoirePdfWorker } = await import('./pdf-worker');
  const first = getRepertoirePdfWorker();
  expect(getRepertoirePdfWorker()).toBe(first);
  expect(mocks.create).toHaveBeenCalledTimes(1);
  first!.destroyed = true;
  expect(getRepertoirePdfWorker()).not.toBe(first);
  expect(mocks.create).toHaveBeenCalledTimes(2);
});
it('does not initialize a worker in server rendering', async () => {
  const { getRepertoirePdfWorker } = await import('./pdf-worker');
  vi.stubGlobal('window', undefined);
  try { expect(getRepertoirePdfWorker()).toBeUndefined(); expect(mocks.create).not.toHaveBeenCalled(); }
  finally { vi.unstubAllGlobals(); }
});
