import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { PersonalAnnotationEditor } from './personal-annotation-editor';
import type { DrawingTool } from './AnnotationDrawingSurface';
import { theme } from '../ui/theme';

const TOOLS: [DrawingTool, string][] = [['pen', 'Kalem'], ['highlighter', 'Vurgu'], ['arrow', 'Ok'], ['rectangle', 'Çerçeve'], ['text', 'Metin']];

export function AnnotationEditorControls({ editor, page, tool, setTool, text, setText, error, setError, onReload }: {
  editor: PersonalAnnotationEditor;
  page: number;
  tool: DrawingTool | null;
  setTool: (tool: DrawingTool | null) => void;
  text: string;
  setText: (text: string) => void;
  error: string | null;
  setError: (message: string | null) => void;
  onReload: () => void;
}) {
  const status = editor.status();
  const run = async (action: () => void | Promise<void>) => {
    setError(null);
    try { await action(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'İşlem tamamlanamadı.'); }
  };
  return <View style={styles.container} testID="annotation-editor-controls">
    <Text style={styles.label}>Kişisel notlar · {status.phase === 'saved' ? 'Kaydedildi' : status.phase === 'saving' ? 'Kaydediliyor…' : status.phase === 'error' ? 'Kaydedilemedi' : 'Hazır'}</Text>
    {!editor.canEdit(page) ? <Text style={styles.warning}>Bu sayfada not düzenleme kullanılamıyor.</Text> : null}
    <ScrollView horizontal contentContainerStyle={styles.tools}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: !tool }} onPress={() => setTool(null)} testID="annotation-tool-pan"><Text style={[styles.action, !tool && styles.selected]}>Gezin</Text></Pressable>
      {TOOLS.map(([value, label]) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: tool === value, disabled: !editor.canEdit(page) }} disabled={!editor.canEdit(page)} onPress={() => setTool(value)} testID={`annotation-tool-${value}`}><Text style={[styles.action, tool === value && styles.selected]}>{label}</Text></Pressable>)}
      <Pressable accessibilityRole="button" disabled={!editor.canUndo(page)} onPress={() => void run(() => editor.undo(page))} testID="annotation-undo"><Text style={styles.action}>Geri al</Text></Pressable>
    </ScrollView>
    {tool === 'text' ? <TextInput accessibilityLabel="Kişisel not metni" placeholder="Notu yazıp sayfada yerine dokunun" placeholderTextColor={theme.colors.textMuted} style={styles.input} value={text} onChangeText={setText} maxLength={1000} testID="annotation-text-input" /> : null}
    {error || status.error ? <Text accessibilityRole="alert" style={styles.warning} testID="annotation-save-error">{error ?? status.error}</Text> : null}
    {status.unresolvedCount > 0 ? <>
      <Text style={styles.hint}>Kaydedilmeyen notlar bu oturumda tutulur. Uygulamayı kapatmadan önce kaydı tamamlayın.</Text>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" onPress={() => void run(() => editor.flush())} testID="annotation-save-retry"><Text style={styles.action}>Kaydet</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => void run(async () => {
          const pending = editor.queue.getPendingSnapshots(editor.ownerKey, editor.fileId);
          await Clipboard.setStringAsync(JSON.stringify(pending));
          setError('Kaydedilmemiş notlar panoya kopyalandı.');
        })} testID="annotation-copy-draft"><Text style={styles.action}>Taslağı kopyala</Text></Pressable>
        {status.phase === 'error' ? <Pressable accessibilityRole="button" onPress={() => Alert.alert('Yerel değişikliklerden vazgeçilsin mi?', 'Bu dosyadaki kaydedilmemiş notlar silinecek ve sunucudaki notlar yeniden yüklenecek.', [
          { text: 'Koru', style: 'cancel' },
          { text: 'Vazgeç ve yükle', style: 'destructive', onPress: () => void run(() => { editor.discard(); setTool(null); onReload(); }) },
        ])} testID="annotation-discard"><Text style={styles.action}>Yeniden yükle</Text></Pressable> : null}
      </View>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 8, gap: 6 },
  label: { color: theme.colors.text, fontWeight: '600' },
  tools: { flexDirection: 'row', gap: 16, alignItems: 'center', paddingVertical: 8 },
  action: { color: theme.colors.accent, paddingVertical: 6 },
  selected: { color: theme.colors.text, fontWeight: '800', textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: theme.colors.textMuted, color: theme.colors.text, borderRadius: 8, padding: 10 },
  warning: { color: '#fbbf24' },
  hint: { color: theme.colors.textMuted, fontSize: 12 },
});
