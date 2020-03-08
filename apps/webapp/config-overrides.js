const path = require('path');
const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const { addWebpackResolve, override, removeModuleScopePlugin } = require('customize-cra');

/* config-overrides.js */
module.exports = override(
  addWebpackResolve({
    alias: {
      '@shared': path.resolve(__dirname, '../@shared/'),
      'react-dom': '@hot-loader/react-dom',
    },
  }),
  removeModuleScopePlugin(),
  (config, env) => {
    config = rewireReactHotLoader(config, env);
    return config;
  },
);
