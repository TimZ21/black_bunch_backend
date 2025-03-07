// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// config.resolver.assetExts.push(
//     // Adds support for `.db` files for SQLite databases
//     'bin'
// );
config.resolver.assetExts = [...config.resolver.assetExts, 'h5', 'bin', 'json', 'jpeg']
// config.resolver.assetExts.push('bin');
// config.resolver.assetExts.push('json');

module.exports = config;
