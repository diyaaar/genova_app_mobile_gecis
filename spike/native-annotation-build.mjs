import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = process.cwd();
assert(root.endsWith('/genovakorist'));
const mode = process.argv[2];
const suffix = process.argv[3] ?? '';
assert(['', '-v2', '-debug', '-final', '-verified'].includes(suffix));
assert(['prebuild', 'build'].includes(mode));
const env = { PATH: process.env.PATH, HOME: process.env.HOME, LANG: process.env.LANG, CI: '1', EXPO_NO_DOTENV: '1', EXPO_NO_TELEMETRY: '1',
  JAVA_HOME: '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home', ANDROID_HOME: '/opt/homebrew/share/android-commandlinetools',
  EXPO_OVERRIDE_METRO_CONFIG: root + '/spike/native-annotation-metro.cjs' };
if (mode === 'prebuild') assert(!fs.existsSync(root + '/apps/mobile/android'));
const command = mode === 'prebuild' ? process.execPath : './gradlew';
const args = mode === 'prebuild' ? [root + '/apps/mobile/node_modules/expo/bin/cli', 'prebuild', '--platform', 'android', '--no-install']
  : ['assembleRelease', '--offline', '--no-daemon', '--max-workers=2', '-PreactNativeArchitectures=arm64-v8a'];
const child = spawn(command, args, { cwd: root + '/apps/mobile' + (mode === 'build' ? '/android' : ''), env, stdio: ['ignore', 'pipe', 'pipe'] });
fs.mkdirSync(root + '/spike/090-runtime', { recursive: true });
const log = fs.createWriteStream(root + '/spike/090-runtime/annotation-' + mode + suffix + '.log', { flags: 'wx', mode: 0o600 });
for (const stream of [child.stdout, child.stderr]) stream.on('data', (bytes) => {
  log.write(bytes);
  for (const line of bytes.toString().split('\n')) if (/error|failed|BUILD|bundl|created|prebuild/i.test(line)) console.log(line.slice(0,300));
});
const [code] = await once(child, 'exit');
await new Promise((done) => log.end(done));
assert.equal(code, 0);
