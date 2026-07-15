const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withNdkVersion(config, ndkVersion = '27.0.12077973') {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('ndkVersion =')) {
      config.modResults.contents = config.modResults.contents.replace(
        /ndkVersion\s*=\s*["'][^"']+["']/,
        `ndkVersion = "${ndkVersion}"`
      );
    } else {
      console.warn('⚠️ withNdkVersion: ndkVersion string not found in build.gradle, patch not applied');
    }
    return config;
  });
};