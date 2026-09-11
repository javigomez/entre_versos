const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts = config.resolver.assetExts.filter(ext => !['yaml', 'yml'].includes(ext));
config.resolver.sourceExts.push('yaml', 'yml');
config.transformer.babelTransformerPath = require.resolve('./yaml-transformer.cjs');
module.exports = config;
