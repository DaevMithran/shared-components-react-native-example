/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig } = require('metro-config')

module.exports = (async ()=>{
const root = __dirname

const defaultConfig = await getDefaultConfig(root)
    return {
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
    extraNodeModules: {
        ...defaultConfig.resolver.extraNodeModules,
        "buffer": __dirname + '/node_modules/buffer'
    },
  },}
})
