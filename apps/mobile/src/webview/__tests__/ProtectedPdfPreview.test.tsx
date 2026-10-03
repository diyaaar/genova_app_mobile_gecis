import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ProtectedPdfPreview } from '../ProtectedPdfPreview';
import type { NativePdfRenderer } from '../../repertoire/pdf-renderer';

function setup() {
  const controller = new AbortController();
  const pdf: NativePdfRenderer = { open: jest.fn(async () => ({ pageCount: 40 })),
    generate: jest.fn(async (_uri, page) => ({ uri: `file:///cache/page-${page}.jpg`, width: 595, height: 842 })), close: jest.fn(async () => {}) };
  const input = { uri: 'file:///cache/only-local.pdf', fileName: 'Ödev.pdf', signal: controller.signal, share: jest.fn(async () => {}) };
  const onClosed = jest.fn(); const onEvent = jest.fn();
  return { controller, pdf, input, onClosed, onEvent };
}
it('renders native page/count, navigates and zooms without opening another app; sharing is separate', async () => {
  const r = setup(); await render(<ProtectedPdfPreview {...r} />);
  await screen.findByTestId('protected-pdf-page');
  expect(screen.getByTestId('protected-pdf-counter')).toHaveTextContent('1 / 40');
  expect(r.input.share).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('protected-pdf-next'));
  await waitFor(() => expect(screen.getByTestId('protected-pdf-counter')).toHaveTextContent('2 / 40'));
  await screen.findByTestId('protected-pdf-page');
  expect(r.pdf.generate).toHaveBeenLastCalledWith(r.input.uri, 1);
  await fireEvent.press(screen.getByLabelText('Yakınlaştır'));
  expect(screen.getByText('125%')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('protected-pdf-share'));
  expect(r.input.share).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByTestId('protected-pdf-close'));
  await waitFor(() => expect(r.onClosed).toHaveBeenCalledTimes(1));
  expect(r.pdf.close).toHaveBeenCalled();
});
it('closes and hides on abort, and unmount closes an unfinished renderer exactly once', async () => {
  for (const abort of [true, false]) {
    const r = setup(); const result = await render(<ProtectedPdfPreview {...r} />);
    await screen.findByTestId('protected-pdf-page');
    if (abort) await act(async () => r.controller.abort()); else await result.unmount();
    await waitFor(() => expect(r.onClosed).toHaveBeenCalledTimes(1));
    expect(r.pdf.close).toHaveBeenCalledTimes(1);
    if (abort) { expect(r.onClosed).toHaveBeenCalledWith(expect.any(Error)); await result.unmount(); }
  }
});
it('corrupt PDF shows safe error and can close without any sharing fallback', async () => {
  const r = setup(); (r.pdf.open as jest.Mock).mockRejectedValueOnce(Error('secret renderer internals'));
  await render(<ProtectedPdfPreview {...r} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('PDF açılamadı.');
  expect(screen.queryByText('secret renderer internals')).toBeNull();
  await fireEvent.press(screen.getByTestId('protected-pdf-close'));
  await waitFor(() => expect(r.onClosed).toHaveBeenCalled());
  expect(r.input.share).not.toHaveBeenCalled();
});
