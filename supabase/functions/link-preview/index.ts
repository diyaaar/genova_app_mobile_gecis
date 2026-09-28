import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import sanitizeHtml from 'npm:sanitize-html@2.17.7';
import { lookup } from 'node:dns/promises';
import { resolveSupabasePublicKey } from '../create-choir/create-choir-core.ts';
import { createLinkPreviewHandler } from './handler.ts';
import { authorizePreview } from './authorization.ts';
import { createPreviewParser } from './preview.ts';
import { createPinnedTransport } from './transport.ts';

Deno.serve(createLinkPreviewHandler({
  async authorize(token, signal) {
    const url = Deno.env.get('SUPABASE_URL');
    const key = resolveSupabasePublicKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'), Deno.env.get('SUPABASE_ANON_KEY'));
    if (!url || !key) throw new Error('Missing configuration');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => fetch(input, { ...init, signal }) } });
    return authorizePreview({ auth: client.auth, rpc: name => client.rpc(name),
      findActiveMember: (memberId, choirId, userId) => client.from('choir_members').select('id')
        .eq('id', memberId).eq('choir_id', choirId).eq('user_id', userId).eq('is_active', true).maybeSingle(),
    }, token);
  },
  resolve: hostname => lookup(hostname, { all: true, verbatim: true }),
  request: createPinnedTransport(), parse: createPreviewParser(sanitizeHtml),
}));
