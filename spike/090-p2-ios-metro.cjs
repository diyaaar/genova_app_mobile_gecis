// Isolate build-variant transforms without purging any pre-existing global cache.
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = require(root + '/apps/mobile/metro.config.js');
const { FileStore } = require(require.resolve('metro-cache', { paths: [root + '/apps/mobile/node_modules/expo'] }));
const variant = process.env.GENOVA_P2_BUILD_VARIANT;
if (!['authority', 'normal'].includes(variant)) throw new Error('Owned P2 build variant required');
config.cacheVersion = '090-p2-' + variant;
config.cacheStores = [new FileStore({ root: root + '/spike/090-runtime/p2-metro-' + variant })];
config.fileMapCacheDirectory = root + '/spike/090-runtime/p2-filemap-' + variant;
module.exports = config;
