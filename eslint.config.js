const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**', '.superpowers/**', 'playwright-report/**', 'test-results/**', 'coverage/**'] },
  {
    files: ['tests/setup.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react', 'react-native', '@react-native-async-storage/*', 'yaml', '../application/*', '../infrastructure/*'], message: 'domain no puede importar de la plataforma ni de las otras capas' },
        ],
      }],
    },
  },
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react', 'react-native', '@react-native-async-storage/*', 'yaml', '../infrastructure/*'], message: 'application no puede importar de la plataforma ni de infrastructure' },
        ],
      }],
    },
  },
]);
