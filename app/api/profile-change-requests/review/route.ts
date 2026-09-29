import { NextResponse } from 'next/server';
import { createSupabaseUserClient, requireAuthenticatedUser } from '@/lib/server/supabase-auth';
import { sendProfileDecisionPush } from '@/lib/server/push-notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Caller JWT -> one authority-locked decision transaction; push is best effort AFTER commit. */
export async function POST(request: Request) {
  try {
    const { accessToken } = await requireAuthenticatedUser(request);
    let body: { requestId?: unknown; action?: unknown; rejectReason?: unknown } | null;
    try { body = await request.json(); }
    catch { return new NextResponse('Geçersiz istek gövdesi.', { status: 400 }); }
    const id = typeof body?.requestId === 'string' ? body.requestId.trim().toLowerCase() : '';
    const action = body?.action;
    if (!UUID_PATTERN.test(id) || (action !== 'approve' && action !== 'reject')
      || (body?.rejectReason != null && typeof body.rejectReason !== 'string')) {
      return new NextResponse('Geçersiz istek gövdesi.', { status: 400 });
    }
    const reason = typeof body?.rejectReason === 'string' ? body.rejectReason.trim() || null : null;
    if (action === 'reject' && reason && reason.length > 1200) {
      return new NextResponse('Red sebebi çok uzun.', { status: 400 });
    }
    const { data, error } = await createSupabaseUserClient(accessToken).rpc('review_profile_change_request', {
      p_request_id: id, p_action: action, p_reject_reason: action === 'reject' ? reason : null,
    });
    if (error) {
      if (error.code === '28000') return new NextResponse('Geçerli kullanıcı oturumu bulunamadı.', { status: 401 });
      if (error.code === '42501') return new NextResponse('Aktif üyelik ve Şef yetkisi gerekli.', { status: 403 });
      if (error.code === 'PT404') return new NextResponse('Profil değişiklik talebi bulunamadı.', { status: 404 });
      if (['PT409', '40001', '40P01'].includes(error.code)) {
        return new NextResponse('Koro seçimi veya talep değişti; önce aynı alanı değiştiren eski talepleri sonuçlandırıp sayfayı yenileyin.', { status: 409 });
      }
      if (['22023', '22P02', '22007', '22008', '23503', '23514'].includes(error.code)) {
        return new NextResponse('Profil değişikliği geçersiz, başka koroya ait veya talep sahibi aktif değil.', { status: 400 });
      }
      if (['42883', 'PGRST202'].includes(error.code)) {
        return new NextResponse('Profil değerlendirme hizmeti henüz hazır değil.', { status: 503 });
      }
      return new NextResponse('Profil talebi sonuçlandırılamadı.', { status: 500 });
    }
    if (!data || data.id !== id || data.status !== (action === 'approve' ? 'approved' : 'rejected')
      || typeof data.memberId !== 'string' || !UUID_PATTERN.test(data.memberId)
      || typeof data.reviewedBy !== 'string' || !UUID_PATTERN.test(data.reviewedBy)
      || typeof data.reviewedAt !== 'string' || !Number.isFinite(Date.parse(data.reviewedAt))
      || (data.rejectReason !== null && typeof data.rejectReason !== 'string')
      || (data.reviewerName !== null && typeof data.reviewerName !== 'string')) {
      return new NextResponse('Profil değerlendirme yanıtı doğrulanamadı.', { status: 502 });
    }
    try {
      await sendProfileDecisionPush({ memberId: data.memberId, status: data.status,
        rejectReason: data.rejectReason, reviewerName: data.reviewerName });
    } catch {
      console.error('Profile review push send failed after committed decision.');
    }
    return NextResponse.json({ id: data.id, status: data.status, rejectReason: data.rejectReason,
      reviewedAt: data.reviewedAt, reviewedBy: data.reviewedBy });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return new NextResponse(unauthorized ? 'Unauthorized' : 'Profil talebi sonuçlandırılamadı.',
      { status: unauthorized ? 401 : 500 });
  }
}
