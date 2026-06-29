// @valentindft/ng-base-config/prettier
//
// Usage dans package.json d'un projet :
//   "prettier": "@valentindft/ng-base-config/prettier"

'use strict';

module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.html',
      options: { parser: 'angular' },
    },
  ],
};
