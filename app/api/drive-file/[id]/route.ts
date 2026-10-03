import { readLegacyFile } from '@/lib/server/legacy-file-adapter';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return readLegacyFile(request, (await context.params).id, 'GET');
}
export async function HEAD(request: Request, context: Context) {
  return readLegacyFile(request, (await context.params).id, 'HEAD');
}
