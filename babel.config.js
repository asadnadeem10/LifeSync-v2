module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      // Add this plugin to help Babel resolve modules correctly
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
      }]
    ],
  };
};