const { getDefaultConfig } = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-crypto"),
  stream: require.resolve("stream-browserify"),
};

// Убираем web расширения из резолвера
defaultConfig.resolver.sourceExts = defaultConfig.resolver.sourceExts.filter(
  ext => !ext.includes('web')
);

module.exports = defaultConfig;