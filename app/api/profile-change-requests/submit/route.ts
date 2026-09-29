import { NextResponse } from 'next/server';
import { getProfileChangeKeys, sanitizeProfileChanges } from '@/lib/profile-change-requests';
import { createSupabaseUserClient, requireAuthenticatedUser } from '@/lib/server/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Verified caller JWT → one authority-locked DB transaction; never fall back to service writes. */
export async function POST(request: Request) {
  try {
    const { accessToken } = await requireAuthenticatedUser(request);
    let body: { expected_choir_id?: unknown; changes?: unknown; note?: unknown } | null;
    try { body = await request.json(); }
    catch { return new NextResponse('Geçersiz istek gövdesi.', { status: 400 }); }
    const expected = typeof body?.expected_choir_id === 'string' && UUID_PATTERN.test(body.expected_choir_id)
      ? body.expected_choir_id : null;
    if (!expected) return new NextResponse('Beklenen koro kimliği gerekli.', { status: 400 });
    const note = typeof body?.note === 'string' ? body.note.trim() || null : null;
    if (note && note.length > 1200) return new NextResponse('Not çok uzun.', { status: 400 });
    const changes = sanitizeProfileChanges(body?.changes);
    if (!getProfileChangeKeys(changes).length) {
      return new NextResponse('Gönderilecek geçerli profil alanı bulunamadı.', { status: 400 });
    }
    const client = createSupabaseUserClient(accessToken);
    const { data, error } = await client.rpc('submit_profile_change_request', {
      p_expected_choir_id: expected, p_changes: changes, p_note: note,
    });
    if (error) {
      if (error.code === '28000') return new NextResponse('Geçerli kullanıcı oturumu bulunamadı.', { status: 401 });
      if (error.code === '42501') return new NextResponse('Aktif koro üyeliği bulunamadı.', { status: 403 });
      if (['PT409', '40001', '40P01'].includes(error.code)) {
        return new NextResponse('Koro seçimi veya talep değişti. Sayfayı yenileyip tekrar deneyin.', { status: 409 });
      }
      if (['22023', '22P02'].includes(error.code)) {
        return new NextResponse('Profil seçimi geçersiz veya bu koroya ait değil.', { status: 400 });
      }
      if (['42883', 'PGRST202'].includes(error.code)) {
        return new NextResponse('Profil kayıt hizmeti henüz hazır değil.', { status: 503 });
      }
      return new NextResponse('Profil değişikliği kaydedilemedi.', { status: 500 });
    }
    if (!data || !['created', 'updated', 'unchanged'].includes(data.mode)
      || (data.mode !== 'unchanged' && (typeof data.id !== 'string' || !UUID_PATTERN.test(data.id)))) {
      return new NextResponse('Profil kayıt yanıtı doğrulanamadı.', { status: 502 });
    }
    return NextResponse.json(data);
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return new NextResponse(unauthorized ? 'Unauthorized' : 'Profil değişikliği kaydedilemedi.',
      { status: unauthorized ? 401 : 500 });
  }
}
