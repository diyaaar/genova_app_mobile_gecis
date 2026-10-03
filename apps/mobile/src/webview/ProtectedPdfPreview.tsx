import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { nativePdfRenderer, type NativePdfRenderer } from '../repertoire/pdf-renderer';
import type { NativePageImage } from '../repertoire/reader-contract';
import { createLocalPdfPreview } from './local-pdf-preview';
import type { NativePdfPreviewInput } from './platform-capabilities';

export interface PdfPreviewEvent {
  event: 'page-loaded' | 'closed';
  page: number;
  pageCount: number;
}

/** Native-only passive PDF view. It owns renderer handles, not downloaded-file lifetime. */
export function ProtectedPdfPreview({ input, onClosed, onEvent, pdf = nativePdfRenderer, session: suppliedSession }: {
  input: NativePdfPreviewInput;
  onClosed: (error?: Error) => void;
  onEvent?: (event: PdfPreviewEvent) => void;
  pdf?: NativePdfRenderer;
  session?: ReturnType<typeof createLocalPdfPreview>;
}) {
  const session = useMemo(() => suppliedSession ?? createLocalPdfPreview(input.uri, input.signal, pdf), [suppliedSession, input.uri, input.signal, pdf]);
  const actions = useRef({ onClosed, onEvent }); actions.current = { onClosed, onEvent };
  const alive = useRef(true);
  const finished = useRef(false);
  const displayed = useRef(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [image, setImage] = useState<NativePageImage | null>(null);
  const [renderedPage, setRenderedPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [hidden, setHidden] = useState(input.signal.aborted);
  const [zoom, setZoom] = useState(1);
  const { width, height } = useWindowDimensions();

  const finishRef = useRef<(error?: Error) => void>(() => undefined);
  finishRef.current = (failure) => {
    if (finished.current) return;
    finished.current = true;
    if (alive.current) { setHidden(true); setImage(null); }
    void session.close().then(() => {
      actions.current.onEvent?.({ event: 'closed', page, pageCount });
      actions.current.onClosed(failure ?? (displayed.current ? undefined : new Error('PDF görüntülenemedi.')));
    }, () => actions.current.onClosed(new Error('PDF güvenle kapatılamadı.')));
  };
  useEffect(() => {
    alive.current = true;
    const abort = () => finishRef.current(new Error('PDF oturumu kapandı.'));
    input.signal.addEventListener('abort', abort, { once: true });
    if (input.signal.aborted) abort();
    void session.open().then(count => {
      if (alive.current && !finished.current) setPageCount(count);
    }).catch(() => {
      if (alive.current && !finished.current) { setError('PDF açılamadı.'); setBusy(false); }
    });
    return () => {
      alive.current = false;
      input.signal.removeEventListener('abort', abort);
      finishRef.current();
    };
  }, [input.signal, session]);
  useEffect(() => {
    if (!pageCount || finished.current) return;
    let current = true;
    setBusy(true); setError(null); setImage(null);
    void session.render(page).then(next => {
      if (current && alive.current && !finished.current) { setRenderedPage(page); setImage(next); }
    }).catch(() => {
      if (current && alive.current && !finished.current) setError('PDF sayfası gösterilemedi.');
    }).finally(() => {
      if (current && alive.current && !finished.current) setBusy(false);
    });
    return () => { current = false; };
  }, [page, pageCount, session]);
  const share = async () => {
    if (sharing || finished.current) return;
    setSharing(true); setError(null);
    try { await input.share(); }
    catch { if (alive.current && !finished.current) setError('Paylaşım tamamlanamadı. PDF’yi burada okumaya devam edebilirsiniz.'); }
    finally { if (alive.current && !finished.current) setSharing(false); }
  };
  const ratio = image ? image.height / image.width : 1.414;
  const pageWidth = Math.max(1, Math.min(width - 24, (height - 180) / ratio)) * zoom;
  return <Modal visible={!hidden} animationType="none" onRequestClose={() => { if (!sharing) finishRef.current(); }}>
    <View style={styles.root} testID="protected-pdf-preview">
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" testID="protected-pdf-close" disabled={sharing} onPress={() => finishRef.current()}>
          <Text style={styles.action}>PDF’yi kapat</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>{input.fileName}</Text>
        <Pressable accessibilityRole="button" testID="protected-pdf-share" disabled={sharing || busy || !image} onPress={() => void share()}>
          <Text style={styles.action}>{sharing ? 'Paylaşılıyor…' : 'Paylaş'}</Text>
        </Pressable>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {busy ? <ActivityIndicator testID="protected-pdf-loading" /> : null}
      <ScrollView style={styles.viewport} contentContainerStyle={styles.center}>
        <ScrollView horizontal contentContainerStyle={styles.center}>
          {image && renderedPage === page ? <Image key={image.uri} testID="protected-pdf-page" accessibilityLabel={`${page}. PDF sayfası`}
            source={{ uri: image.uri }} style={{ width: pageWidth, height: pageWidth * ratio, backgroundColor: '#fff' }}
            resizeMode="contain" onError={() => setError('PDF sayfa görüntüsü okunamadı.')}
            onLoad={() => {
              if (!finished.current) { displayed.current = true; actions.current.onEvent?.({ event: 'page-loaded', page, pageCount }); }
            }} /> : null}
        </ScrollView>
      </ScrollView>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" testID="protected-pdf-prev" disabled={busy || page <= 1} onPress={() => setPage(value => value - 1)}><Text style={styles.action}>Önceki</Text></Pressable>
        <Text testID="protected-pdf-counter" style={styles.title}>{page} / {pageCount || '…'}</Text>
        <Pressable accessibilityRole="button" testID="protected-pdf-next" disabled={busy || page >= pageCount} onPress={() => setPage(value => value + 1)}><Text style={styles.action}>Sonraki</Text></Pressable>
      </View>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Uzaklaştır" disabled={zoom <= 1} onPress={() => setZoom(value => Math.max(1, value - 0.25))}><Text style={styles.action}>−</Text></Pressable>
        <Text style={styles.title}>{Math.round(zoom * 100)}%</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Yakınlaştır" disabled={zoom >= 2.5} onPress={() => setZoom(value => Math.min(2.5, value + 0.25))}><Text style={styles.action}>+</Text></Pressable>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#0f1115', paddingTop: 38, paddingBottom: 24 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, gap: 10 },
  action: { color: '#8ea5ff', paddingVertical: 8, fontWeight: '600' }, title: { flex: 1, color: '#f5f6f8', textAlign: 'center' },
  error: { color: '#ff8a8a', textAlign: 'center', padding: 10 }, viewport: { flex: 1 },
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' } });
