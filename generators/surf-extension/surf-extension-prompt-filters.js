'use strict';
const _ = require('lodash');

module.exports = {

  requiredRegexFilter: (input, regex) => {
    if (_.isNumber(input)) {
      input = '' + input;
    }
    if (!_.isString(input) || _.isEmpty(input)) return undefined;
    const re = new RegExp(regex);
    const valid = re.test(input);
    return (valid ? input : undefined);
  },

  versionNumberFilter: input => {
    if (_.isNumber(input)) {
      input = '' + input;
      if (input.indexOf('.') === -1) {
        input += '.0';
      }
    }
    return module.exports.requiredRegexFilter(input, '^\\d+\\.\\d+$');
  },

  autoDeployFilter: input => {
    return module.exports.requiredRegexFilter(input, '^true|false$');
  },

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
