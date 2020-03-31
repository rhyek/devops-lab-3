const path = require('path');
const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const { addWebpackResolve, override, removeModuleScopePlugin, babelInclude } = require('customize-cra');

/* config-overrides.js */
module.exports = override(
  removeModuleScopePlugin(),
  babelInclude([path.resolve('src'), path.resolve(__dirname, '../@shared')]),
  addWebpackResolve({
    alias: {
      '@shared': path.resolve(__dirname, '../@shared/'),
      'react-dom': '@hot-loader/react-dom',
    },
  }),
  (config, env) => {
    config = rewireReactHotLoader(config, env);
    return config;
  },
);
