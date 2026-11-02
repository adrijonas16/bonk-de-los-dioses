// ESLint: los archivos de src/ son scripts clásicos que comparten ámbito global (ver README),
// por eso no-undef y no-unused-vars quedan desactivadas hasta pasar a módulos ES.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, THREE: 'readonly' } },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-cond-assign': ['error', 'except-parens'],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
    rules: { ...js.configs.recommended.rules },
  },
  {
    // código que se ejecuta dentro de la página (page.evaluate) usa los globales del juego
    files: ['tests/**/*.mjs'],
    rules: { 'no-undef': 'off' },
  },
];
