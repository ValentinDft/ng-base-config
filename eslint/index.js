// @valentindft/ng-base-config/eslint
//
// Config ESLint commune à tous les projets Angular.
// Le prefix des sélecteurs (component/directive) est le seul paramètre
// qui varie d'un projet à l'autre, donc on l'expose en argument.
//
// Usage dans eslint.config.js d'un projet :
//   const buildConfig = require('@valentindft/ng-base-config/eslint');
//   module.exports = buildConfig({ prefix: 'ngf' });

'use strict';

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = function ngBaseConfig({ prefix = 'app' } = {}) {
  return tseslint.config(
    {
      files: ['**/*.ts'],
      extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        ...angular.configs.tsRecommended,
      ],
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigRootDir: process.cwd(),
        },
      },
      processor: angular.processInlineTemplates,
      rules: {
        '@angular-eslint/directive-selector': [
          'error',
          { type: 'attribute', prefix, style: 'camelCase' },
        ],
        '@angular-eslint/component-selector': [
          'error',
          { type: 'element', prefix, style: 'kebab-case' },
        ],
        '@angular-eslint/prefer-on-push-change-detection': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
        'eqeqeq': ['error', 'always'],
        'no-console': 'warn',
      },
    },
    {
      files: ['**/*.html'],
      extends: [
        ...angular.configs.templateRecommended,
        ...angular.configs.templateAccessibility,
      ],
      rules: {},
    },
    {
      ignores: ['dist/**', '.angular/**', 'coverage/**'],
    },
  );
};
