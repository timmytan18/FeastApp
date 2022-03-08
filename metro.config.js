// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const exclusionList = require('metro-config/src/defaults/exclusionList');

config.resolver = {
  ...config.resolver,
  blacklistRE: exclusionList([/amplify\/#current-cloud-backend\/.*/]),
};
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

module.exports = config;
