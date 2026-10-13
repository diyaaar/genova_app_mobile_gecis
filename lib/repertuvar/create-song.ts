import { supabase } from '../supabase';
import { requireCurrentWebAccess } from '../web-auth-capability';
import { uploadPrivateRepertoireFile, REPERTOIRE_UPLOAD_MAX_BYTES } from './upload';
import { isChoirId } from '../choir-context-core';

interface SongDraft {
  songId: string; retryKey: string; title: string; composer: string; fileName: string;
}
const PREFIX = 'genova:pending-repertoire-song:054:';
const inFlight = new Set<string>();
// Only explicit database rejections prove that this insert did not commit.
const REJECTED_INSERT_CODES = new Set(['23505', '23502', '23503', '23514', '42501']);

export class PrivateSongCreationError extends Error {
  constructor(message: string, readonly pendingDraft: SongDraft | null) {
    super(message);
    this.name = 'PrivateSongCreationError';
  }
}

function removeOwnedDraft(key: string, draft: SongDraft) {
  if (sessionStorage.getItem(key) === JSON.stringify(draft)) sessionStorage.removeItem(key);
}

async function draftContext() {
  const access = await requireCurrentWebAccess('mutation');
  const { data: choirId, error } = await supabase.rpc('current_choir_id');
  if (error || typeof choirId !== 'string') throw new Error('Aktif koro bulunamadı.');
  return { key: `${PREFIX}${access.userId}:${choirId}`, choirId, access };
}

function readDraft(key: string): SongDraft | null {
  const value = sessionStorage.getItem(key);
  if (!value) return null;
  const draft = JSON.parse(value) as SongDraft;
  if (!draft.songId || !draft.retryKey || !draft.title || typeof draft.composer !== 'string' || !draft.fileName) {
    throw new Error('Bekleyen şarkı kaydı okunamadı.');
  }
  return draft;
}

export async function loadPendingRepertoireSong(): Promise<SongDraft | null> {
  return readDraft((await draftContext()).key);
}

function requireFormChoir(expectedChoirId: string, currentChoirId: string) {
  if (!isChoirId(expectedChoirId) || expectedChoirId !== currentChoirId) {
    throw new Error('Koro seçimi değişti. Formu yeniden açıp tekrar deneyin.');
  }
}

/** The explicit choir_id lets database RLS reject a switch racing with the client check. */
export async function createLegacyRepertoireSong(title: string, composer: string, expectedChoirId: string) {
  const context = await draftContext();
  requireFormChoir(expectedChoirId, context.choirId);
  const { data, error } = await supabase.from('repertoire').insert({
    choir_id: expectedChoirId,
    title: title.trim(), composer: composer.trim() || null, is_visible: true,
  }).select('id, title').single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error('Şarkı oluşturulamadı.');
  return data;
}

/** A tab-scoped draft preserves retry identities across response loss; never erase uncertain
 * uploads on error. The opening choir is a precondition, not authorization; RLS owns access.
 */
export async function createPrivateRepertoireSong(
  title: string, composer: string, file: File, expectedChoirId: string,
) {
  if (!title.trim()) throw new Error('Şarkı adı zorunlu.');
  if (!file.size || file.size > REPERTOIRE_UPLOAD_MAX_BYTES) throw new Error('Dosya boyutu 1 bayt ile 100 MB arasında olmalı.');
  const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
  const fileType = mimeType === 'application/pdf' ? 'sheet' : 'audio';
  if (fileType === 'audio' && !['audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg','audio/webm','audio/flac'].includes(mimeType)) {
    throw new Error('PDF veya desteklenen bir ses dosyası seçin.');
  }
  const context = await draftContext();
  requireFormChoir(expectedChoirId, context.choirId);
  if (inFlight.has(context.key)) throw new Error('Şarkı yüklemesi devam ediyor. Lütfen bekleyin.');
  inFlight.add(context.key);
  let draft: SongDraft | null = null;
  try {
    draft = readDraft(context.key);
    const freshDraft = !draft;
    if (draft && (draft.title !== title.trim() || draft.composer !== composer.trim() || draft.fileName !== file.name)) {
      throw new Error(`Önce bekleyen “${draft.title}” şarkısını “${draft.fileName}” dosyasıyla tamamlayın.`);
    }
    if (!draft) {
      draft = { songId: crypto.randomUUID(), retryKey: crypto.randomUUID(), title: title.trim(),
        composer: composer.trim(), fileName: file.name };
      sessionStorage.setItem(context.key, JSON.stringify(draft));
    }
    const check = await supabase.from('repertoire').select('id, title, composer, choir_id').eq('id', draft.songId).maybeSingle();
    if (check.error) throw new Error('Bekleyen şarkı kontrol edilemedi. Tekrar deneyin.');
    if (check.data) {
      if (check.data.choir_id !== context.choirId || check.data.title !== draft.title ||
        (check.data.composer ?? '') !== draft.composer) throw new Error('Bekleyen şarkının bilgileri değişti.');
    } else {
      const current = await draftContext();
      if (current.key !== context.key || current.access.accessToken !== context.access.accessToken) {
        throw new Error('Oturum veya koro değişti. Yeniden deneyin.');
      }
      const inserted = await supabase.from('repertoire').insert({ id: draft.songId, choir_id: context.choirId,
        title: draft.title, composer: draft.composer || null, is_visible: true });
      if (inserted.error) {
        // An older draft may represent a committed row hidden by changed access.
        // Never discard that identity based on a later rejection or empty read.
        if (freshDraft && REJECTED_INSERT_CODES.has(inserted.error.code)) {
          removeOwnedDraft(context.key, draft);
          draft = null;
          throw new Error(inserted.error.code === '23505'
            ? 'Bu şarkı kaydı zaten mevcut. Şarkı adını kontrol edip tekrar deneyin.'
            : 'Şarkı kaydı reddedildi. Bilgileri ve koro erişiminizi kontrol edip tekrar deneyin.');
        }
        throw new Error('Şarkı kaydı doğrulanamadı. Aynı dosyayla tekrar deneyin.');
      }
    }
    const finalContext = await draftContext();
    if (finalContext.key !== context.key) throw new Error('Oturum veya koro değişti. Yeniden deneyin.');
    await uploadPrivateRepertoireFile({ songId: draft.songId, file, fileType, mimeType, retryKey: draft.retryKey });
    removeOwnedDraft(context.key, draft);
  } catch (error) {
    throw new PrivateSongCreationError(error instanceof Error ? error.message : 'Şarkı oluşturulamadı.', draft);
  } finally {
    inFlight.delete(context.key);
  }
}
