const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = require(root + '/apps/mobile/metro.config.js');
const originalResolve = config.resolver.resolveRequest;
config.watchFolders.push(root + '/spike');
config.resolver.resolveRequest = (context, name, platform) => {
  if (context.originModulePath === root + '/apps/mobile/index.ts' && name === './App') {
    return { type: 'sourceFile', filePath: root + '/spike/native-annotation-acceptance.tsx' };
  }
  if (context.originModulePath === root + '/spike/native-annotation-acceptance.tsx' && !name.startsWith('.')) {
    return originalResolve({ ...context, originModulePath: root + '/apps/mobile/App.tsx' }, name, platform);
  }
  return originalResolve(context, name, platform);
};
const { FileStore } = require(require.resolve('metro-cache', { paths: [root + '/apps/mobile/node_modules/expo'] }));
config.cacheStores = [new FileStore({ root: root + '/spike/090-runtime/annotation-metro' })];
config.fileMapCacheDirectory = root + '/spike/090-runtime/annotation-filemap';
require('node:fs').mkdirSync(config.fileMapCacheDirectory, { recursive: true });
module.exports = config;
