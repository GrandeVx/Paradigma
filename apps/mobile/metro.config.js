const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
// const path = require('path');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Assicurati che Metro sappia come gestire i file CSS
config.resolver.sourceExts.push('css');
// config.resolver.disableHierarchicalLookup = true;
// config.resolver.nodeModulesPaths = [
//   path.resolve(__dirname, 'node_modules'),
//   path.resolve(__dirname, '../node_modules'),
//   path.resolve(__dirname, '../../node_modules'),
// ];
// config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './global.css' });
