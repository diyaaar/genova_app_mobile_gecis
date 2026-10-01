// Prepare synthetic immutable version metadata BEFORE insertion; never disable DB guards.
import { familySpecs } from './090_http_families.ts';
if (Deno.args.length !== 0) throw Error('Unexpected fixture arguments');
const path = 'spike/090-runtime/families-overlap/fixture.sql';
let text = await Deno.readTextFile(path);
for (const [i,spec] of familySpecs.entries()) {
  const alias = ['assignment','review','comment','avatar'][i];
  const letter = ['a','b','c','d'][i];
  const pattern = new RegExp(`'090/${alias}',16,(\\s*'${spec.mime}',)repeat\\('${letter}',64\\)`, 'g');
  if ([...text.matchAll(pattern)].length !== 1) throw Error('Synthetic fixture shape changed');
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(spec.bytes))))
    .map(x=>x.toString(16).padStart(2,'0')).join('');
  text = text.replace(pattern, `'${spec.key}',${spec.bytes.length},$1'${digest}'`);
}
await Deno.writeTextFile(path,text);
