import { cloneAnnotationItems, isAnnotationPayloadLosslesslyWritable, parseLayerKey, type AnnotationItem, type AnnotationLayerKey } from './annotation-types';

export interface SafeSaveLayerSnapshotInput {
  repertoireFileId: string;
  pageNumber: number;
  layerKey: AnnotationLayerKey;
  annotations: AnnotationItem[];
  expectedRevision: number | null;
  writableWithoutLoss: boolean;
}

export interface AnnotationSaveResult {
  rowId: string | null;
  revision: number | null;
  deleted: boolean;
  updatedAt: string | null;
}

export type AnnotationRpcError = { code?: string; message?: string } | null;
export type AnnotationSnapshotRpc = (
  name: 'save_repertoire_pdf_annotation_snapshot',
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: AnnotationRpcError }>;

export function annotationMutationErrorMessage(error: AnnotationRpcError): string {
  if (error?.code === '40001' || error?.message?.includes('ANNOTATION_CONFLICT')) {
    return 'Not katmanı başka bir oturumda değişti. Yerel değişiklikler korunuyor; sunucudaki notları yeniden yükleyin.';
  }
  if (error?.code === 'PGRST202') return 'PDF notları şu anda kaydedilemiyor. Yerel değişiklikler korunuyor.';
  if (error?.code === '42501') return 'Bu PDF notunu değiştirme yetkisi doğrulanamadı.';
  if (error?.code === '22023') return 'PDF notu içeriği doğrulanamadı. Yerel değişiklikler korunuyor.';
  return 'PDF notu kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin.';
}

export async function saveAnnotationSnapshot(
  rpc: AnnotationSnapshotRpc,
  input: SafeSaveLayerSnapshotInput,
  errorMessage: (error: AnnotationRpcError) => string = annotationMutationErrorMessage,
): Promise<AnnotationSaveResult> {
  const {
  repertoireFileId,
  pageNumber,
  layerKey,
  annotations,
  expectedRevision,
  writableWithoutLoss,
} = input;

  if (!writableWithoutLoss) {
    throw new Error('Bu not katmanı kayıpsız düzenlenemiyor. Sunucudaki içerik değiştirilmedi.');
  }
  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    throw new Error('PDF notu için geçerli bir sayfa numarası gerekli.');
  }
  if (expectedRevision !== null && (!Number.isSafeInteger(expectedRevision) || expectedRevision <= 0)) {
    throw new Error('PDF notu revizyon bilgisi geçersiz. Katman değiştirilmeden bırakıldı.');
  }
  if (!isAnnotationPayloadLosslesslyWritable(annotations, 1)) {
    throw new Error('PDF notu içeriği kayıpsız doğrulanamadı. Katman değiştirilmeden bırakıldı.');
  }

  const { layerType, targetVoiceGroup } = parseLayerKey(layerKey);
  const { data, error } = await rpc('save_repertoire_pdf_annotation_snapshot', {
    p_repertoire_file_id: repertoireFileId,
    p_page_number: pageNumber,
    p_layer_type: layerType,
    p_target_voice_group: targetVoiceGroup,
    p_schema_version: 1,
    p_annotations_json: cloneAnnotationItems(annotations),
    p_expected_revision: expectedRevision,
  });

  if (error) throw new Error(errorMessage(error));
  if (!Array.isArray(data) || data.length !== 1 || !data[0] || typeof data[0] !== 'object') {
    throw new Error('Güvenli PDF notu kaydetme yanıtı doğrulanamadı.');
  }

  const row = data[0] as Record<string, unknown>;
  if (typeof row.deleted !== 'boolean') {
    throw new Error('Güvenli PDF notu kaydetme yanıtı doğrulanamadı.');
  }

  if (row.deleted) {
    if (
      row.next_revision !== null ||
      row.updated_at !== null ||
      (row.annotation_id !== null && typeof row.annotation_id !== 'string')
    ) {
      throw new Error('Güvenli PDF notu silme yanıtı doğrulanamadı.');
    }
    return {
      rowId: row.annotation_id as string | null,
      revision: null,
      deleted: true,
      updatedAt: null,
    };
  }

  if (
    typeof row.annotation_id !== 'string' ||
    row.annotation_id.length === 0 ||
    !Number.isSafeInteger(row.next_revision) ||
    (row.next_revision as number) <= 0 ||
    typeof row.updated_at !== 'string' ||
    row.updated_at.length === 0
  ) {
    throw new Error('Güvenli PDF notu kaydetme yanıtı doğrulanamadı.');
  }

  return {
    rowId: row.annotation_id,
    revision: row.next_revision as number,
    deleted: false,
    updatedAt: row.updated_at,
  };
}

