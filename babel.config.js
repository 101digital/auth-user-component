module.exports = function (api) {
  const babelEnv = api.env();
  api.cache(true);
  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '^@/(.+)': './src/\\1',
        },
      },
    ],
  ];

  if (babelEnv === 'production') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins,
  };
};
