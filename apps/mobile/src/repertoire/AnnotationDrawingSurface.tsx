import { useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { normalizePoint, type AnnotationItem, type NormalizedPoint } from '@shared/repertuvar/annotation-types';
import { AnnotationOverlay } from './AnnotationOverlay';

export type DrawingTool = AnnotationItem['type'];

export function AnnotationDrawingSurface({ tool, width, height, text, onCommit, onError }: {
  tool: DrawingTool;
  width: number;
  height: number;
  text: string;
  onCommit: (item: AnnotationItem) => void;
  onError: (message: string) => void;
}) {
  const [preview, setPreview] = useState<AnnotationItem | null>(null);
  const stroke = useRef<AnnotationItem | null>(null);
  const point = (event: GestureResponderEvent): NormalizedPoint =>
    normalizePoint(event.nativeEvent.locationX, event.nativeEvent.locationY, width, height);
  const cancel = () => { stroke.current = null; setPreview(null); };
  const move = (event: GestureResponderEvent) => {
    const current = stroke.current;
    if (!current) return;
    if (event.nativeEvent.touches.length > 1) { cancel(); return; }
    const next = point(event);
    if (current.type === 'pen' || current.type === 'highlighter') {
      if (current.points.length >= 9_999) { cancel(); onError('Çizgi çok uzun. Daha kısa çizgiler kullanın.'); return; }
      stroke.current = { ...current, points: [...current.points, next] };
    } else if (current.type === 'arrow' || current.type === 'rectangle') {
      stroke.current = { ...current, end: next };
    }
    setPreview(stroke.current);
  };
  return <View
    style={StyleSheet.absoluteFill}
    testID="annotation-drawing-surface"
    onStartShouldSetResponder={() => true}
    onResponderGrant={(event) => {
      if (event.nativeEvent.touches.length !== 1) return;
      const start = point(event);
      const id = randomUUID();
      if (tool === 'text') {
        if (!text.trim()) { onError('Önce not metnini yazın, sonra sayfada yerine dokunun.'); return; }
        stroke.current = { id, type: 'text', color: 'red', position: start, text: text.trim(), width: 0.4 };
      } else if (tool === 'pen' || tool === 'highlighter') {
        stroke.current = { id, type: tool, color: tool === 'highlighter' ? '#facc15' : 'red',
          points: [start], strokeWidth: (tool === 'highlighter' ? 10 : 3) / width };
      } else {
        stroke.current = { id, type: tool, color: 'red', start, end: start, strokeWidth: 3 / width };
      }
      setPreview(stroke.current);
    }}
    onResponderMove={move}
    onResponderRelease={(event) => {
      move(event);
      const current = stroke.current;
      cancel();
      if (!current) return;
      if ((current.type === 'pen' || current.type === 'highlighter') && current.points.length < 2) return;
      try { onCommit(current); } catch (error) { onError(error instanceof Error ? error.message : 'Not eklenemedi.'); }
    }}
    onResponderTerminationRequest={() => true}
    onResponderTerminate={cancel}
  >
    {preview ? <AnnotationOverlay layers={[{ layerKey: 'personal', items: [preview] }]} width={width} height={height} /> : null}
  </View>;
}
