const { defineConfig } = require('eslint/config');

const expoConfig = require('eslint-config-expo/flat');
// remove the unused variable rule from the expo config
expoConfig.rules['no-unused-vars'] = 'off';
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
]);