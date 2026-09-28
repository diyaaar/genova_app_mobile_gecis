import { NextResponse } from 'next/server';
import { sendRepertoireAssignmentPush } from '@/lib/server/push-notifications';
import { createSupabaseUserClient, requireAuthenticatedUser } from '@/lib/server/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MEMBERS = 500;

interface RequestBody {
  song_id?: unknown;
  part_name?: unknown;
  member_ids?: unknown;
  expected_member_ids?: unknown;
}

function readIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_MEMBERS
    || value.some(id => typeof id !== 'string' || !UUID.test(id))
    || new Set(value).size !== value.length) return null;
  return value;
}

/** Web compatibility adapter. Authorization, tenant scope and atomic mutation live in the
 * authenticated invoker-rights DB RPC; the service key must never perform the replacement.
 * Push runs only after the RPC commits and is best-effort.
 */
export async function POST(request: Request) {
  try {
    const { accessToken } = await requireAuthenticatedUser(request);
    let body: RequestBody;
    try { body = await request.json() as RequestBody; }
    catch { return new NextResponse('Geçersiz istek.', { status: 400 }); }
    const songId = typeof body?.song_id === 'string' && UUID.test(body.song_id) ? body.song_id : null;
    const memberIds = readIds(body?.member_ids);
    const expectedIds = readIds(body?.expected_member_ids);
    const partName = body?.part_name === null || body?.part_name === undefined ? null
      : typeof body.part_name === 'string' && body.part_name.trim()
        && body.part_name.trim().length <= 128 ? body.part_name.trim() : undefined;
    if (!songId || !memberIds || !expectedIds || partName === undefined) {
      return new NextResponse('Geçersiz atama isteği.', { status: 400 });
    }

    const client = createSupabaseUserClient(accessToken);
    const { data, error } = await client.rpc('replace_repertoire_assignments', {
      p_song_id: songId, p_part_name: partName,
      p_member_ids: memberIds, p_expected_member_ids: expectedIds,
    });
    if (error) {
      const failures: Record<string, [number, string]> = {
        '42501': [403, 'Bu işlem için aktif Şef yetkisi gerekli.'],
        '22023': [400, 'Geçersiz veya pasif korist seçimi.'],
        'P0002': [404, 'Repertuvar bulunamadı.'],
        '40001': [409, 'Atamalar başka bir oturumda değişti. Yeniden açıp deneyin.'],
        '23505': [409, 'Korist bu şarkıda başka bir partisyona atanmış.'],
      };
      const [status, message] = failures[error.code] ?? [500, 'Atamalar kaydedilemedi.'];
      return new NextResponse(message, { status });
    }
    const result = Array.isArray(data) ? data[0] : null;
    if (!result || typeof result.song_title !== 'string'
      || !Array.isArray(result.added_member_ids)
      || result.added_member_ids.some((id: unknown) => typeof id !== 'string' || !UUID.test(id))) {
      return new NextResponse('Atama sonucu doğrulanamadı.', { status: 500 });
    }
    if (result.added_member_ids.length > 0) {
      try {
        await sendRepertoireAssignmentPush({
          songId, songTitle: result.song_title, partName,
          targetMemberIds: result.added_member_ids,
        });
      } catch (pushError) {
        console.error('Repertoire assignment push send failed:', pushError);
      }
    }
    return NextResponse.json({ ok: true, song_id: songId, part_name: partName });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === 'Unauthorized';
    return new NextResponse(unauthorized ? 'Unauthorized' : 'Atamalar kaydedilemedi.', { status: unauthorized ? 401 : 500 });
  }
}
