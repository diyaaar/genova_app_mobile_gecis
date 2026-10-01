// Test-only listener adapter. Executes the literal production entrypoint/handler unchanged.
if (Deno.env.get('GENOVA_TEST_LOOPBACK_ONLY') !== '1' ||
    Deno.env.get('SUPABASE_URL') !== 'http://127.0.0.1:54491') throw new Error('Isolated assignment listener required');
const serve = Deno.serve;
Deno.serve = ((handler: Deno.ServeHandler) => serve({ hostname: '127.0.0.1', port: 8001 }, handler)) as typeof Deno.serve;
await import('../functions/assignment-file/index.ts');
