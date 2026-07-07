// @valentindft/ng-base-config/lint-staged
//
// Usage dans package.json d'un projet :
//   "lint-staged": "@valentindft/ng-base-config/lint-staged"

'use strict';

module.exports = {
  '*.ts': ['eslint --fix', 'prettier --write'],
  '*.html': ['eslint --fix', 'prettier --write'],
  '*.{scss,css}': ['stylelint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
