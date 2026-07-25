// @valentindft/ng-base-config/stylelint
//
// Usage dans stylelint.config.cjs d'un projet :
//   module.exports = require('@valentindft/ng-base-config/stylelint');

'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // BEM : block__element--modifier
    'selector-class-pattern': [
      '^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$',
      { message: 'Selector must follow BEM convention (block__element--modifier)' },
    ],
    // Trop bruyant dans les styles de composants Angular encapsulés
    'no-descending-specificity': null,
    // Autorise les imports SCSS natifs (@use, @forward)
    'scss/at-rule-no-unknown': true,
    'import-notation': 'string',
    'no-empty-source': null,
  },
};