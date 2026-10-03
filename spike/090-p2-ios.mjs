// One scoped P2 iOS batch; actual source/factories reused, not a general test runner.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { ROOT, buildEnv, serve } from '../supabase/test-support/090_android_candidate.mjs';
import { materializeInteractive } from '../supabase/test-support/090_candidate_native_interactive.mjs';
const command=process.argv[2];
assert.equal(process.cwd(),ROOT);assert.equal(process.argv.length,3);
const env=buildEnv(true);
if(command.startsWith('build-authority'))delete env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_INTERACTIVE;
if(command==='build-normal')for(const key of Object.keys(env))if(key.includes('GENOVA_090'))delete env[key];
if(command==='check-root')for(const key of Object.keys(env))if(key.includes('GENOVA_090'))delete env[key];
if(command==='build-authority-v2'||command==='build-authority-v3'||command==='build-normal'){
 env.GENOVA_P2_BUILD_VARIANT=command==='build-normal'?'normal':'authority';
 // Expo57's export:embed accepts --config for RN compatibility but does not
 // forward it. This installed CLI's loadUserConfig explicitly reads this hook.
 env.EXPO_OVERRIDE_METRO_CONFIG=ROOT+'/spike/090-p2-ios-metro.cjs';
}
// Xcode/pod commands use the installed host tools; no Android/JDK configuration.
delete env.JAVA_HOME;delete env.ANDROID_HOME;delete env.ANDROID_SDK_ROOT;
env.CI='1';
async function run(cmd,args,cwd){
 const xcode=cmd==='/usr/bin/xcodebuild';
 const log=xcode?fs.createWriteStream(ROOT+'/spike/090-runtime/p2-xcode-'+command+'.log',{flags:'wx',mode:0o600}):null;
 const child=spawn(cmd,args,{cwd,env,stdio:['ignore','pipe','pipe']});
 for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{
  const redacted=chunk.toString().replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|apikey_[a-f0-9]+_[a-f0-9]+|sb_secret_[A-Za-z0-9_-]+/gu,'[redacted]');
  if(log){log.write(redacted);for(const line of redacted.split('\n'))if(/error:|\*\* BUILD/u.test(line))console.log(line.slice(0,400));}
  else process.stdout.write(redacted);
 });
 const[code]=await once(child,'exit');if(log)await new Promise(resolve=>log.end(resolve));
 console.log(JSON.stringify({command,code}));assert.equal(code,0,'Owned iOS command failed');
}
const candidate=ROOT+'/spike/090-runtime/android-interactive-candidate';
if(command==='materialize')console.log(JSON.stringify(materializeInteractive()));
else if(command==='build-web')await run(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','build'],candidate);
else if(command==='prebuild-ios'){assert(!fs.existsSync(ROOT+'/apps/mobile/ios'));await run(process.execPath,[ROOT+'/apps/mobile/node_modules/expo/bin/cli','prebuild','--platform','ios','--no-install'],ROOT+'/apps/mobile');}
else if(command==='pods')await run('/opt/homebrew/bin/pod',['install'],ROOT+'/apps/mobile/ios');
else if(command==='check-mobile'){await run(ROOT+'/apps/mobile/node_modules/.bin/tsc',['--noEmit'],ROOT+'/apps/mobile');await run(process.execPath,[ROOT+'/apps/mobile/node_modules/jest/bin/jest','--runInBand'],ROOT+'/apps/mobile');}
else if(command==='check-root')await run('pnpm',['check'],ROOT);
else if(['test-ui','test-ui-v2','test-ui-v3'].includes(command))await run('/usr/bin/xcodebuild',['test','-workspace','Genova.xcworkspace','-scheme','P2UITests','-configuration','Release','-destination','id=57F560F5-1EE1-4C28-A925-2D614E7CFFDE','ARCHS=arm64','ONLY_ACTIVE_ARCH=YES','CODE_SIGN_IDENTITY=-','CODE_SIGNING_ALLOWED=YES','-derivedDataPath',ROOT+'/spike/090-p2-ios-native-build','-resultBundlePath',ROOT+'/spike/090-runtime/p2-ui-'+(command==='test-ui'?'v1':command.slice(-2))+'.xcresult','-parallel-testing-enabled','NO','-jobs','2','-only-testing:P2UITests/P2UITests/testInteractive'],ROOT+'/apps/mobile/ios');
else if(['build-ios','build-authority','build-authority-v2','build-authority-v3','build-normal'].includes(command))await run('/usr/bin/xcodebuild',['-workspace','Genova.xcworkspace','-scheme','Genova','-configuration','Release','-sdk','iphonesimulator','-destination','generic/platform=iOS Simulator','ARCHS=arm64','ONLY_ACTIVE_ARCH=YES','CODE_SIGN_IDENTITY=-','CODE_SIGNING_ALLOWED=YES','-derivedDataPath',ROOT+'/spike/090-p2-ios-native-build','-jobs','2'],ROOT+'/apps/mobile/ios');
else {assert(['serve-interactive','serve-interactive-v2','serve-authority','serve-authority-v2'].includes(command));await serve(command.startsWith('serve-interactive'),{platform:'ios',attempt:command.endsWith('v2')?2:1});}
