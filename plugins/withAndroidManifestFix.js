const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidManifestFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const application = manifest.application[0];
    application.$['tools:replace'] = 'android:appComponentFactory';
    application.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

    return config;
  });
};