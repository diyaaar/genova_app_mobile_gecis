import { createClient } from '@supabase/supabase-js';
import { createSupabaseServiceClient, createSupabaseUserClient } from './supabase-auth';
import { createTenantFetch } from '@/supabase/functions/_shared/tenant-fetch';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TenantContextMismatchError extends Error {
  constructor() {
    super('Koro seçimi değişti. Sayfayı yenileyip tekrar deneyin.');
    this.name = 'TenantContextMismatchError';
  }
}

/**
 * Builds a privileged client only after resolving the caller's active choir
 * through their verified JWT session. Callers must pass the user and token
 * returned together by requireAuthenticatedUser().
 */
export async function createTenantServiceClient(
  authUserId: string, accessToken: string, expectedChoirId?: string,
) {
  const userClient = createSupabaseUserClient(accessToken);
  const { data: activeChoirId, error: activeChoirError } = await userClient.rpc('current_choir_id');
  if (activeChoirError || typeof activeChoirId !== 'string' || !UUID_PATTERN.test(activeChoirId)) {
    throw new Error('Geçerli aktif koro seçimi bulunamadı.');
  }
  if (expectedChoirId !== undefined && activeChoirId !== expectedChoirId) {
    throw new TenantContextMismatchError();
  }

  const admin = createSupabaseServiceClient();
  const { data: member, error } = await admin.from('choir_members')
    .select('choir_id, is_active')
    .eq('auth_user_id', authUserId)
    .eq('choir_id', activeChoirId)
    .eq('is_active', true)
    .maybeSingle();
  if (error || member?.choir_id !== activeChoirId || member.is_active !== true) {
    throw new Error('Geçerli aktif koro üyeliği bulunamadı.');
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createTenantFetch(process.env.NEXT_PUBLIC_SUPABASE_URL!, activeChoirId) },
  });
}
