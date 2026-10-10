// Exactly one observed first-connection startup race; never reset or mutate a DB.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {runtimeGuard,runtimeEnv,sql,DIR,LIMA,CONTAINER} from './090-compatibility-sql-rehearsal.mjs';
assert.equal(process.argv[2],'--archive-proven-startup-only');assert.equal(process.argv.length,3);
assert(['20261009-compatibility','20261010-managed-web'].includes(ATTEMPT));runtimeGuard();
const file=DIR+'/restore-failure-'+ATTEMPT+'.log',archive=DIR+'/restore-failure-'+ATTEMPT+'-startup-v1.log';
assert(!fs.existsSync(archive)&&!fs.existsSync(DIR+'/restore-summary-'+ATTEMPT+'.json'));
const stat=fs.lstatSync(file);assert(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&511)===384);
const error=fs.readFileSync(file,'utf8');assert(error.includes('No such file or directory')&&error.includes('connection to server'));
const ready=spawnSync(LIMA,['shell','g090p3','sudo','docker','exec',CONTAINER,'pg_isready','-U','supabase_admin','-d','postgres'],{env:runtimeEnv,stdio:'pipe',timeout:5000});assert.equal(ready.status,0);
assert.equal(sql("select exists(select 1 from pg_database where datname='genova_090_p3_restore');",'postgres'),'f');
assert.equal(sql("select current_setting('listen_addresses')<>'';",'postgres'),'t','Final server required, not transient bootstrap socket');
fs.renameSync(file,archive);console.log(JSON.stringify({startupReadinessNowPassed:true,databaseStillAbsent:true,privateStartupErrorRetained:true,noDatabaseReset:true}));
