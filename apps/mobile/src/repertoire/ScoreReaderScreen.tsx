import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { RepertoireFile } from '@shared/repertuvar/catalog-core';
import { theme } from '../ui/theme';
import { AnnotationOverlay } from './AnnotationOverlay';
import { AnnotationDrawingSurface, type DrawingTool } from './AnnotationDrawingSurface';
import { AnnotationEditorControls } from './AnnotationEditorControls';
import { getDefaultAnnotationEditor } from './default-annotation-editor';
import type { PersonalAnnotationEditor } from './personal-annotation-editor';
import { getDefaultScoreReaderGateway } from './default-reader-gateway';
import type {
  NativeRenderedPageWindow,
  NativeScoreDocument,
  NativeScoreReaderGateway,
} from './reader-contract';

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export function ScoreReaderScreen({ choirId, memberId, file, gateway: suppliedGateway, annotationEditor: suppliedEditor, onBack }: {
  choirId: string;
  memberId?: string;
  annotationEditor?: PersonalAnnotationEditor;
  file: RepertoireFile;
  gateway?: NativeScoreReaderGateway;
  onBack: () => void;
}) {
  const gateway = useMemo(() => suppliedGateway ?? getDefaultScoreReaderGateway(), [suppliedGateway]);
  const editor = useMemo(() => suppliedEditor ?? (memberId && !suppliedGateway
    ? getDefaultAnnotationEditor(choirId, memberId, file.id) : null), [suppliedEditor, memberId, suppliedGateway, choirId, file.id]);
  const [, refreshEditor] = useState(0);
  const [tool, setTool] = useState<DrawingTool | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  useEffect(() => editor?.queue.subscribe(() => refreshEditor((value) => value + 1)), [editor]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') void editor?.flush().catch(() => {});
    });
    return () => subscription.remove();
  }, [editor]);
  const leave = useCallback(() => {
    if (!editor || !editor.queue.hasUnresolved(editor.ownerKey)) { onBack(); return; }
    if (editor.queue.isOwnerExiting(editor.ownerKey)) return;
    void editor.prepareExit().then((release) => { onBack(); release(); })
      .catch((error: unknown) => setEditError(error instanceof Error ? error.message : 'Notlar kaydedilemedi.'));
  }, [editor, onBack]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { leave(); return true; });
    return () => subscription.remove();
  }, [leave]);
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const [document, setDocument] = useState<NativeScoreDocument | null>(null);
  const [window, setWindow] = useState<NativeRenderedPageWindow | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [openError, setOpenError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [opening, setOpening] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    let openedUri: string | null = null;
    let cancelled = false;
    const version = ++requestVersion.current;
    setOpening(true);
    setOpenError(null);
    setRenderError(null);
    setDocument(null);
    setWindow(null);
    setTool(null);
    setEditError(null);
    setPage(1);
    setZoom(MIN_ZOOM);
    const readVersion = editor?.readVersion();
    gateway.open({ choirId, file })
      .then((next) => {
        openedUri = next.uri;
        if (cancelled || requestVersion.current !== version) return gateway.close(next.uri);
        editor?.hydrate(next.annotations, next.pageCount, readVersion);
        // Rendering starts from setDocument and advances requestVersion. Finish opening first.
        setOpening(false);
        setDocument(next);
      })
      .catch((error: unknown) => {
        if (!cancelled && requestVersion.current === version) {
          setOpenError(error instanceof Error ? error.message : 'PDF açılamadı.');
        }
      })
      .finally(() => {
        if (!cancelled && requestVersion.current === version) setOpening(false);
      });
    return () => {
      cancelled = true;
      requestVersion.current += 1;
      if (openedUri) void gateway.close(openedUri);
    };
  }, [attempt, choirId, editor, file, gateway]);

  const loadPage = useCallback(async () => {
    if (!document) return;
    const version = ++requestVersion.current;
    setRendering(true);
    setRenderError(null);
    setWindow(null);
    try {
      const next = await gateway.renderWindow(document, page);
      if (requestVersion.current === version) setWindow(next);
    } catch (error) {
      if (requestVersion.current === version) {
        setRenderError(error instanceof Error ? error.message : 'PDF sayfası oluşturulamadı.');
      }
    } finally {
      if (requestVersion.current === version) setRendering(false);
    }
  }, [document, gateway, page]);

  useEffect(() => { void loadPage(); }, [loadPage]);

  const image = window?.pages[page];
  const pageRatio = image ? image.height / image.width : 1.414;
  const fittedPageWidth = Math.max(1, Math.min(
    viewportWidth - theme.spacing(3),
    (viewportHeight - 210) / pageRatio,
  ));
  const pageWidth = fittedPageWidth * zoom;
  const pageHeight = pageWidth * pageRatio;
  const warning = document && document.annotations.skippedCount > 0
    ? `${document.annotations.skippedCount} desteklenmeyen veya bozuk not öğesi atlandı.`
    : null;

  return (
    <View style={styles.container} testID="score-reader-screen">
      <View style={styles.header}>
        <Pressable onPress={leave} accessibilityRole="button" testID="score-reader-back">
          <Text style={styles.action}>Repertuvara dön</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>{file.file_name}</Text>
      </View>

      {document && editor ? <AnnotationEditorControls editor={editor} page={page} tool={tool} setTool={setTool}
        text={noteText} setText={setNoteText} error={editError} setError={setEditError}
        onReload={() => setAttempt((value) => value + 1)} /> : null}

      {warning ? <Text style={styles.warning} testID="score-reader-warning">{warning}</Text> : null}

      {opening ? (
        <View style={styles.center} testID="score-reader-opening">
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.muted}>PDF güvenli alana indiriliyor…</Text>
        </View>
      ) : openError ? (
        <View style={styles.center} testID="score-reader-open-error">
          <Text style={styles.error}>{openError}</Text>
          <Pressable onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button" testID="score-reader-open-retry">
            <Text style={styles.action}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : renderError ? (
        <View style={styles.center} testID="score-reader-render-error">
          <Text style={styles.error}>{renderError}</Text>
          <Pressable onPress={() => void loadPage()} accessibilityRole="button" testID="score-reader-render-retry">
            <Text style={styles.action}>Sayfayı yeniden oluştur</Text>
          </Pressable>
        </View>
      ) : rendering || !image ? (
        <View style={styles.center} testID="score-reader-rendering">
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.muted}>Sayfa {page} hazırlanıyor…</Text>
        </View>
      ) : (
        <ScrollView
          scrollEnabled={!tool}
          style={styles.viewport}
          contentContainerStyle={styles.verticalContent}
          testID="score-reader-vertical-scroll"
        >
          <ScrollView
            horizontal
            scrollEnabled={!tool}
            contentContainerStyle={styles.horizontalContent}
            showsHorizontalScrollIndicator={zoom > MIN_ZOOM}
            testID="score-reader-horizontal-scroll"
          >
            <View style={[styles.page, { width: pageWidth, height: pageHeight }]} testID={`score-reader-page-${page}`}>
              <Image
                source={{ uri: image.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="stretch"
                accessibilityLabel={`${page}. PDF sayfası`}
                alt={`${page}. PDF sayfası`}
                onError={() => setRenderError('PDF sayfa görüntüsü okunamadı.')}
              />
              <AnnotationOverlay layers={editor ? [
                ...(document?.annotations.byPage[page] ?? []).filter((layer) => layer.layerKey !== 'personal'),
                { layerKey: 'personal', items: editor.getItems(page) },
              ] : document?.annotations.byPage[page] ?? []} width={pageWidth} height={pageHeight} />
              {editor && tool && editor.canEdit(page) ? <AnnotationDrawingSurface key={`${page}:${tool}:${zoom}`}
                tool={tool} width={pageWidth} height={pageHeight} text={noteText} onError={setEditError}
                onCommit={(item) => { editor.append(page, item); setEditError(null); if (item.type === 'text') setNoteText(''); }} /> : null}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {document ? (
        <>
          <View style={styles.zoomControls}>
            <Pressable
              disabled={zoom <= MIN_ZOOM}
              onPress={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
              accessibilityRole="button"
              accessibilityLabel="Uzaklaştır"
              testID="score-reader-zoom-out"
            >
              <Text style={[styles.action, zoom <= MIN_ZOOM && styles.disabled]}>−</Text>
            </Pressable>
            <Pressable onPress={() => setZoom(MIN_ZOOM)} accessibilityRole="button" testID="score-reader-zoom-reset">
              <Text style={styles.counter}>{Math.round(zoom * 100)}%</Text>
            </Pressable>
            <Pressable
              disabled={zoom >= MAX_ZOOM}
              onPress={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
              accessibilityRole="button"
              accessibilityLabel="Yakınlaştır"
              testID="score-reader-zoom-in"
            >
              <Text style={[styles.action, zoom >= MAX_ZOOM && styles.disabled]}>+</Text>
            </Pressable>
          </View>
          <View style={styles.controls}>
            <Pressable disabled={page <= 1 || rendering} onPress={() => setPage((value) => Math.max(1, value - 1))} testID="score-reader-prev">
              <Text style={[styles.action, (page <= 1 || rendering) && styles.disabled]}>Önceki</Text>
            </Pressable>
            <Text style={styles.counter} testID="score-reader-counter">{page} / {document.pageCount}</Text>
            <Pressable disabled={page >= document.pageCount || rendering} onPress={() => setPage((value) => Math.min(document.pageCount, value + 1))} testID="score-reader-next">
              <Text style={[styles.action, (page >= document.pageCount || rendering) && styles.disabled]}>Sonraki</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.background, paddingTop: theme.spacing(5), paddingHorizontal: theme.spacing(1.5) },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: theme.spacing(2), paddingHorizontal: theme.spacing(1.5), paddingBottom: theme.spacing(2) },
  title: { flex: 1, textAlign: 'right', color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  action: { color: theme.colors.accent, fontWeight: '700' },
  warning: { width: '100%', color: '#fbbf24', paddingHorizontal: theme.spacing(1.5), paddingBottom: theme.spacing(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing(2), padding: theme.spacing(3) },
  muted: { color: theme.colors.textMuted, textAlign: 'center' },
  error: { color: theme.colors.danger, textAlign: 'center', lineHeight: 20 },
  viewport: { flex: 1, width: '100%' },
  verticalContent: { flexGrow: 1, justifyContent: 'center' },
  horizontalContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  page: { backgroundColor: '#ffffff', overflow: 'hidden' },
  zoomControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing(3), paddingTop: theme.spacing(1) },
  controls: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2) },
  counter: { color: theme.colors.text, fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
});
