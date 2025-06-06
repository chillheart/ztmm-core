const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASS || !process.env.APPLE_TEAM_ID) {
    // eslint-disable-next-line no-console
    console.log('Skipping notarization: APPLE_ID, APPLE_ID_PASS, and APPLE_TEAM_ID environment variables must be set');
    return;
  }

  return await notarize({
    appBundleId: 'com.ztmm.assessment',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASS,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
