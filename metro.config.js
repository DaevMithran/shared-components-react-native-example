/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // make sure this includes `cjs` (and other extensions you need)
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs'],
    resolveRequest: (context, moduleName, platform) => {
        if(moduleName == 'crypto') {
            return {
                filePath: __dirname + '/node_modules/@cosmjs/crypto/build/index.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'strtok3') {
            return {
                filePath: __dirname + '/node_modules/strtok3/lib/index.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'strtok3/core') {
            return {
                filePath: __dirname + '/node_modules/strtok3/lib/core.js',
                type: 'sourceFile',
              };
        }

        if(moduleName == 'token-types') {
            return {
                filePath: __dirname + '/node_modules/token-types/lib/index.js',
                type: 'sourceFile',
              };
        }

        return require('metro-resolver').resolve({
            ...context,
            resolveRequest:undefined
          },moduleName,platform);
      }
  },
}
