// Keep the observed R2-only old-client failure; add a separate legacy dataset.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {DIR,readPrivate,sql,refuseFixtureCollisions} from './090-compatibility-sql-rehearsal.mjs';
assert.equal(ATTEMPT,'20261010-managed-web');assert.equal(process.argv.length,3);assert.equal(process.argv[2],'--add-legacy-case-approved');
const prefix=`managed-${ATTEMPT}`,proof=JSON.parse(readPrivate(prefix+'-browser-v5.json'));
assert.equal(proof.failedStage,'old-real-login');assert(proof.failure.includes('090 Sentetik Eser'));
assert(proof.scenarios.some(s=>s.name==='current-actual-browser-sign-out'&&s.status==='PASS'));
const original=readPrivate(prefix+'-fixture.json'),fixture=JSON.parse(original);assert(!fixture.ids.legacySong);
assert.equal(sql(`select drive_folder_id is null from public.repertoire where id='${fixture.ids.songA}';`),'t','Keep original R2-only reproduction');
const ids={legacySong:randomUUID(),legacyScore:randomUUID(),legacyAudio:randomUUID()};refuseFixtureCollisions(Object.values(ids).join(' '));
fs.writeFileSync(path.join(DIR,prefix+'-fixture-before-legacy.json'),original,{flag:'wx',mode:0o600});
const files=fixture.files.map((f,i)=>({...f,id:i===0?ids.legacyScore:ids.legacyAudio,alias:i===0?'090-managed-legacy-score':'090-managed-legacy-audio',key:null,legacy:true}));
const a=fixture.ids.choirA;
sql(`begin;set role postgres;
  insert into public.repertoire(id,choir_id,title,composer,is_visible,drive_folder_id) values
    ('${ids.legacySong}','${a}','090 Sentetik Eski Eser','Synthetic',true,'090-managed-legacy-folder');
  insert into public.repertoire_files(id,choir_id,song_id,file_name,file_type,partition_label,drive_file_id,drive_web_view_link,mime_type,file_size_bytes,uploaded_by) values
    ${files.map(f=>`('${f.id}','${a}','${ids.legacySong}','${f.mime==='application/pdf'?'090 Legacy.pdf':'090 Legacy.wav'}','${f.mime==='application/pdf'?'sheet':'audio'}','Tutti','${f.alias}',
      'https://drive.google.com/file/d/${f.alias}/view','${f.mime}',${f.bytes},'${fixture.ids.memberA}')`).join(',')};commit;`);
Object.assign(fixture.ids,ids);fixture.files.push(...files);fixture.legacyCaseAdded=true;
fixture.oldR2OnlyStatus='FAIL_REPRODUCED_NOT_WAIVED';fs.writeFileSync(path.join(DIR,prefix+'-fixture.json'),JSON.stringify(fixture,null,2)+'\n',{mode:0o600});
console.log('Separate legacy case added; original R2-only old-client failure unchanged and NOT WAIVED.');
